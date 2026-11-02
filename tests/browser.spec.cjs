const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const file = name => pathToFileURL(path.resolve(__dirname, '..', name)).href;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = [];
    globalThis.chrome = { storage: { local: {
      async get() { const value = localStorage.getItem('test-library'); return value ? { library: JSON.parse(value) } : {}; },
      async set(data) { localStorage.setItem('test-library', JSON.stringify(data.library)); listeners.forEach(fn => fn({ library: { newValue: data.library } }, 'local')); }
    }, onChanged: { addListener(fn) { listeners.push(fn); } } } };
  });
});
async function menu(page, el, text) {
  await el.fill(text); await page.waitForTimeout(100);
}
test('textarea preserva entorno, insere sem enviar e Esc mantém o atalho', async ({ page }) => {
  await page.goto(file('teste.html')); const field = page.locator('#plain');
  await page.evaluate(() => {
    globalThis.sends = 0;
    document.querySelector('#plain').addEventListener('keydown', e => { if (e.key === 'Enter') globalThis.sends++; });
  });
  await menu(page, field, '/numeropedido'); await field.press('Enter');
  await expect(field).toHaveValue(/^Por gentileza, envie o número do pedido/);
  expect(await page.evaluate(() => globalThis.sends)).toBe(0);
  await menu(page, field, 'Olá /numeropedido'); await field.press('Tab');
  await expect(field).toHaveValue(/^Olá Por gentileza, envie o número do pedido/);
  await menu(page, field, '/ematendimento'); await field.press('Escape'); await expect(field).toHaveValue('/ematendimento');
  await field.press('Enter'); await expect(field).toHaveValue('/ematendimento\n');
  await menu(page, field, 'Antes /numeropedido depois'); await field.press('Home');
  for (let i = 0; i < 'Antes /numeropedido'.length; i++) await field.press('ArrowRight');
  await field.press('Tab'); await expect(field).toHaveValue(/^Antes Por gentileza,[\s\S]+ depois$/);
});
test('editor rico preserva texto, suporta mensagens longas e desfazer', async ({ page }) => {
  await page.goto(file('teste.html')); const rich = page.locator('#rich');
  await rich.fill('Olá /trocadevolucao'); await rich.press('Tab');
  await expect(rich).toContainText('Olá 🔄'); await expect(rich).toContainText('equipe de qualidade em cópia');
  await rich.press('Control+z'); await expect(rich).toHaveText('Olá /trocadevolucao');
});
test('campos variáveis são preenchidos antes da inserção', async ({ page }) => {
  await page.goto(file('teste.html'));
  await page.evaluate(async () => chrome.storage.local.set({ library: [{ shortcut:'ola', title:'Saudação',category:'Atendimento',body:'Olá {{nome}}! OS {{OS}}.' }] }));
  const field = page.locator('#plain'); await menu(page, field, '/ola'); await field.press('Tab');
  // The production widget has a closed shadow root; keyboard input exercises it without exposing internals.
  // Enter moves to the next empty field and inserts once every field is filled.
  await page.keyboard.type('Ana'); await page.keyboard.press('Enter'); await page.keyboard.type('940713'); await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Olá Ana! OS 940713.');
  await menu(page, field, '/ola'); await field.press('Tab');
  await page.keyboard.type('Bia'); await page.keyboard.press('Tab'); await page.keyboard.type('1'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Olá Bia! OS 1.');
});
test('Esc no formulário volta à lista e devolve o cursor ao campo', async ({ page }) => {
  await page.goto(file('teste.html'));
  await page.evaluate(async () => chrome.storage.local.set({ library: [{ shortcut:'ola', title:'Saudação',category:'Atendimento',body:'Olá {{nome}}!' }] }));
  const field = page.locator('#plain'); await menu(page, field, '/ola'); await field.press('Tab');
  await page.keyboard.type('Ana'); await page.keyboard.press('Escape');
  await expect(field).toBeFocused();
  await field.press('Escape'); await page.keyboard.type('x');
  await expect(field).toHaveValue('/olax');
});
test('menu acompanha a rolagem da página e lista vazia não bloqueia Enter', async ({ page }) => {
  await page.goto(file('teste.html')); const field = page.locator('#plain'); const widget = page.locator('quick-replies');
  await page.evaluate(() => { document.body.style.minHeight = '3000px'; });
  await menu(page, field, '/'); await expect(widget).toBeVisible();
  await page.evaluate(() => scrollBy(0, 40)); await page.waitForTimeout(150);
  await expect(widget).toBeVisible();
  await field.press('ArrowDown'); await field.press('Enter');
  await expect(field).not.toHaveValue('/');
  await menu(page, field, '/s'); await field.pressSequentially('zzz'); await field.press('Enter');
  await expect(field).toHaveValue('/szzz\n');
  await field.press('Escape'); await expect(widget).toBeHidden();
});
test('popup navega pelo teclado e confirma a cópia', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(file('popup.html')); const search = page.locator('#search');
  await search.fill('cupom'); await expect(page.locator('.result.active')).toHaveCount(1);
  await search.fill(''); await search.press('ArrowDown');
  await expect(page.locator('.result').nth(1)).toHaveClass(/active/);
  await search.fill('cupom'); await search.press('Enter');
  await expect(page.locator('.result.active button')).toHaveText('Copiado ✓');
  await expect(page.locator('#status')).toContainText('/cupom copiado');
});
test('biblioteca salva com Ctrl+S e / leva à busca', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await page.locator('body').press('/'); await expect(page.locator('#search')).toBeFocused();
  await page.locator('.card').filter({ has: page.locator('code', { hasText: /^\/numeropedido$/ }) }).click();
  await page.locator('#title').fill('Solicitar número do pedido (revisado)'); await page.keyboard.press('Control+s');
  await expect(page.locator('#status')).toContainText('Resposta salva');
  await expect(page.locator('.card.selected h3')).toHaveText('Solicitar número do pedido (revisado)');
});
test('biblioteca salva, rejeita duplicatas e não interpreta HTML de mensagem', async ({ page }) => {
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText('16');
  await page.getByRole('button', {name:'+ Nova resposta'}).click();
  await page.locator('#title').fill('Teste de saudação'); await page.locator('#shortcut').fill('ola'); await page.locator('#group').fill('Atendimento'); await page.locator('#body').fill('Olá {{nome}}! <img src=x onerror=alert(1)>');
  await page.getByRole('button', {name:'Salvar resposta'}).click(); await expect(page.locator('#count')).toHaveText('17');
  await page.reload(); await page.locator('#search').fill('/ola'); await page.locator('.card').first().click();
  await expect(page.locator('#body')).toHaveValue('Olá {{nome}}! <img src=x onerror=alert(1)>');
  await expect(page.locator('img')).toHaveCount(0);
  await page.locator('#shortcut').fill('numeropedido'); await page.getByRole('button', {name:'Salvar resposta'}).click();
  await expect(page.locator('#status')).toContainText('duplicado'); await expect(page.locator('#count')).toHaveText('17');
});
test('preenchimento não sobrescreve campo alterado enquanto o formulário estava aberto', async ({ page }) => {
  await page.goto(file('teste.html'));
  await page.evaluate(async () => chrome.storage.local.set({ library: [{ shortcut:'ola', title:'Saudação',category:'Atendimento',body:'Olá {{nome}}!' }] }));
  const field = page.locator('#plain'); await menu(page, field, '/ola'); await field.press('Tab');
  await page.keyboard.type('Ana');
  await field.evaluate(el => { el.value = 'Mensagem alterada por fora'; });
  await page.keyboard.press('Enter');
  await expect(field).toHaveValue('Mensagem alterada por fora');
});
test('biblioteca renderiza vazia sem restaurar padrões excluídos', async ({ page }) => {
  await page.goto(file('teste.html')); await page.evaluate(async () => chrome.storage.local.set({ library: [] }));
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText('0');
  await expect(page.locator('#list')).toContainText('Nenhuma resposta');
});
test('exportação e importação preservam mensagens e rejeitam arquivos inválidos', async ({ page }) => {
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText('16');
  const downloadPromise = page.waitForEvent('download'); await page.locator('#export').click(); const download = await downloadPromise;
  const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  expect(exported.version).toBe(1); expect(exported.library).toHaveLength(16);
  await page.locator('#file').setInputFiles({ name:'invalido.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify({version:1,library:[{shortcut:'x'}]})) });
  await expect(page.locator('#status')).toContainText('Não foi possível importar'); await expect(page.locator('#count')).toHaveText('16');
  const dialogPromise = page.waitForEvent('dialog').then(dialog => dialog.accept());
  await page.locator('#file').setInputFiles({ name:'biblioteca.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify({version:1,library:exported.library.slice(0,2)})) });
  await dialogPromise; await expect(page.locator('#count')).toHaveText('2');
  await page.reload(); await expect(page.locator('#count')).toHaveText('2');
});
test('tema do Portal persiste e layout cabe em telas pequenas', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.header')).toHaveCSS('height', '66px');
  await expect(page.locator('h2')).toHaveCSS('font-family', /Montserrat/);
  await expect(page.locator('#count')).toHaveText('16');
  await page.getByRole('button', {name:'Ativar tema claro'}).click();
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(240, 244, 249)');
  await page.locator('.card').filter({hasText:'/trocadevolucao'}).click();
  await page.screenshot({path:'test-results/biblioteca-azul-claro.png',fullPage:true});
  await page.getByRole('button', {name:'Ativar tema escuro'}).click();
  await page.screenshot({path:'test-results/biblioteca-azul-escuro.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/biblioteca-mobile.png',fullPage:true});
});
test('atalhos de início inserem a assinatura sem asteriscos', async ({ page }) => {
  await page.goto(file('teste.html'));
  const field = page.locator('#plain');
  for (const [shortcut, name] of [['ana','Ana'],['bruno','Bruno']]) {
    await menu(page,field,`/${shortcut}`); await field.press('Tab');
    await expect(field).toHaveValue(`Atendimento iniciado por ${name}`);
  }
});
test('eventos sintéticos da página não abrem o menu nem inserem respostas', async ({ page }) => {
  await page.goto(file('teste.html')); const widget = page.locator('quick-replies');
  await page.evaluate(() => {
    const el = document.querySelector('#plain'); el.focus(); el.value = '/numeropedido'; el.setSelectionRange(13, 13);
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  await page.waitForTimeout(150);
  await expect(widget).toBeHidden(); await expect(page.locator('#plain')).toHaveValue('/numeropedido');
});
