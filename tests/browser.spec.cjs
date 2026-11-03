const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const file = name => pathToFileURL(path.resolve(__dirname, '..', name)).href;
const DEFAULTS = 14;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Minimal chrome.* stand-in: storage over localStorage, permissions always granted, one fake tab.
    const listeners = [], read = () => JSON.parse(localStorage.getItem('test-store') || '{}');
    globalThis.chrome = {
      storage: { local: {
        async get(key) { const all = read(); return key in all ? { [key]: all[key] } : {}; },
        async set(data) { const all = { ...read(), ...data }; localStorage.setItem('test-store', JSON.stringify(all)); const changes = Object.fromEntries(Object.keys(data).map(k => [k, { newValue: data[k] }])); listeners.forEach(fn => fn(changes, 'local')); }
      }, onChanged: { addListener(fn) { listeners.push(fn); } } },
      permissions: { async contains() { return true; }, async request() { globalThis.requested = (globalThis.requested || 0) + 1; return true; }, async remove() { return true; } },
      tabs: { async query() { return [{ id: 1, url: 'https://app.exemplo.com/atendimento/42' }]; } },
      scripting: { async executeScript() { globalThis.injected = (globalThis.injected || 0) + 1; } },
      runtime: { openOptionsPage() {} }
    };
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
  await menu(page, field, '/finalizar'); await field.press('Enter');
  await expect(field).toHaveValue('Posso ajudar em algo mais? 🙂');
  expect(await page.evaluate(() => globalThis.sends)).toBe(0);
  await menu(page, field, 'Olá /finalizar'); await field.press('Tab');
  await expect(field).toHaveValue('Olá Posso ajudar em algo mais? 🙂');
  await menu(page, field, '/ematendimento'); await field.press('Escape'); await expect(field).toHaveValue('/ematendimento');
  await field.press('Enter'); await expect(field).toHaveValue('/ematendimento\n');
  await menu(page, field, 'Antes /finalizar depois'); await field.press('Home');
  for (let i = 0; i < 'Antes /finalizar'.length; i++) await field.press('ArrowRight');
  await field.press('Tab'); await expect(field).toHaveValue('Antes Posso ajudar em algo mais? 🙂 depois');
});
test('editor rico preserva texto, suporta mensagens longas e desfazer', async ({ page }) => {
  await page.goto(file('teste.html')); const rich = page.locator('#rich');
  await rich.fill('Olá /foradohorario'); await rich.press('Tab');
  await expect(rich).toContainText('Olá Olá! Nosso atendimento'); await expect(rich).toContainText('próximo horário útil');
  await rich.press('Control+z'); await expect(rich).toHaveText('Olá /foradohorario');
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
test('saudação automática e variáveis fixas entram sem perguntar; só o que falta abre formulário', async ({ page }) => {
  await page.goto(file('teste.html')); const field = page.locator('#plain');
  const greeting = await page.evaluate(() => QR.automatic().saudacao);
  // Nothing fixed yet: {{saudacao}} is automatic, {{atendente}} is asked.
  await menu(page, field, '/saudacao'); await field.press('Tab');
  await page.keyboard.type('Ana'); await page.keyboard.press('Enter');
  await expect(field).toHaveValue(`${greeting}! Meu nome é Ana e vou cuidar do seu atendimento. Como posso ajudar?`);
  // With the fixed variable saved, the reply is inserted directly.
  await page.evaluate(async () => chrome.storage.local.set({ variables: { atendente: 'Bruno', empresa: 'Loja Exemplo' } }));
  await page.waitForTimeout(100);
  await menu(page, field, '/saudacao'); await field.press('Enter');
  await expect(field).toHaveValue(`${greeting}! Meu nome é Bruno e vou cuidar do seu atendimento. Como posso ajudar?`);
  await menu(page, field, '/ola'); await field.press('Enter');
  await expect(field).toHaveValue('Olá! Você está falando com o atendimento da Loja Exemplo. Em que posso ajudar?');
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
test('popup navega pelo teclado, copia com variáveis fixas e lembra o site ao ativar', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(file('popup.html')); const search = page.locator('#search');
  await search.fill('aguarde'); await expect(page.locator('.result.active')).toHaveCount(1);
  await search.fill(''); await search.press('ArrowDown');
  await expect(page.locator('.result').nth(1)).toHaveClass(/active/);
  await search.fill('aguarde'); await search.press('Enter');
  await expect(page.locator('.result.active button')).toHaveText('Copiado ✓');
  await expect(page.locator('#status')).toContainText('/aguarde copiado');
  await search.fill('saudacao'); await search.press('Enter');
  await expect(page.locator('#status')).toContainText('campos para preencher');
  await page.evaluate(async () => chrome.storage.local.set({ variables: { atendente: 'Ana' } }));
  await page.reload(); await page.locator('#search').fill('saudacao'); await page.locator('#search').press('Enter');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^(Bom dia|Boa tarde|Boa noite)! Meu nome é Ana/);
  await page.getByRole('button', { name: 'Ativar nesta aba' }).click();
  await expect(page.locator('#status')).toContainText('salvo para app.exemplo.com');
  expect(await page.evaluate(() => [globalThis.requested, globalThis.injected])).toEqual([1, 1]);
  expect(await page.evaluate(async () => (await chrome.storage.local.get('sites')).sites)).toEqual(['https://*.blip.ai/*', 'https://app.exemplo.com/*']);
});
test('biblioteca salva com Ctrl+S e / leva à busca', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await page.locator('body').press('/'); await expect(page.locator('#search')).toBeFocused();
  await page.locator('.card').filter({ has: page.locator('code', { hasText: /^\/aguarde$/ }) }).click();
  await page.locator('#title').fill('Pedir um momento (revisado)'); await page.keyboard.press('Control+s');
  await expect(page.locator('#status')).toContainText('Resposta salva');
  await expect(page.locator('.card.selected h3')).toHaveText('Pedir um momento (revisado)');
});
test('biblioteca salva, rejeita duplicatas e não interpreta HTML de mensagem', async ({ page }) => {
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText(String(DEFAULTS));
  await page.getByRole('button', {name:'+ Nova resposta'}).click();
  await page.locator('#title').fill('Teste de saudação'); await page.locator('#shortcut').fill('oi'); await page.locator('#group').fill('Atendimento'); await page.locator('#body').fill('Olá {{nome}}! <img src=x onerror=alert(1)>');
  await page.getByRole('button', {name:'Salvar resposta'}).click(); await expect(page.locator('#count')).toHaveText(String(DEFAULTS + 1));
  await page.reload(); await page.locator('#search').fill('/oi'); await page.locator('.card').first().click();
  await expect(page.locator('#body')).toHaveValue('Olá {{nome}}! <img src=x onerror=alert(1)>');
  await expect(page.locator('img')).toHaveCount(0);
  await page.locator('#shortcut').fill('aguarde'); await page.getByRole('button', {name:'Salvar resposta'}).click();
  await expect(page.locator('#status')).toContainText('duplicado'); await expect(page.locator('#count')).toHaveText(String(DEFAULTS + 1));
});
test('pacotes: adicionar junta sem duplicar e substituir troca tudo', async ({ page }) => {
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText(String(DEFAULTS));
  await page.getByRole('tab', { name: 'Pacotes' }).click();
  const geral = page.locator('.pack[data-pack=geral]'), loja = page.locator('.pack[data-pack=ecommerce]');
  await expect(geral).toContainText('todas já no seu acervo'); await expect(geral.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  await loja.getByRole('button', { name: 'Adicionar' }).click();
  await expect(page.locator('#status')).toContainText('10 respostas adicionadas'); await expect(page.locator('#count')).toHaveText(String(DEFAULTS + 10));
  await expect(loja.getByRole('button', { name: 'Adicionar' })).toBeDisabled();
  page.once('dialog', d => d.accept());
  await page.locator('.pack[data-pack=suporte]').getByRole('button', { name: 'Substituir tudo' }).click();
  await expect(page.locator('#count')).toHaveText('9');
  await page.reload(); await expect(page.locator('#count')).toHaveText('9');
});
test('variáveis fixas são salvas, validadas e mostram as automáticas', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await page.getByRole('tab', { name: 'Variáveis' }).click();
  await expect(page.locator('.chip')).toHaveCount(3); await expect(page.locator('.chip').first()).toContainText(/Bom dia|Boa tarde|Boa noite/);
  const rows = page.locator('.var-row'); await expect(rows).toHaveCount(2);
  await rows.nth(0).locator('.var-value').fill('Loja Exemplo'); await rows.nth(1).locator('.var-value').fill('Ana');
  await page.getByRole('button', { name: '+ Variável' }).click();
  await rows.nth(2).locator('.var-name').fill('horario'); await rows.nth(2).locator('.var-value').fill('de segunda a sexta, das 8h às 18h');
  await page.getByRole('button', { name: 'Salvar variáveis' }).click();
  await expect(page.locator('#status')).toContainText('3 variáveis fixas salvas');
  expect(await page.evaluate(async () => (await chrome.storage.local.get('variables')).variables)).toEqual({ empresa: 'Loja Exemplo', atendente: 'Ana', horario: 'de segunda a sexta, das 8h às 18h' });
  await rows.nth(2).locator('.var-name').fill('{x}'); await page.getByRole('button', { name: 'Salvar variáveis' }).click();
  await expect(page.locator('#status')).toContainText('sem chaves');
  await page.reload(); await page.getByRole('tab', { name: 'Variáveis' }).click();
  await expect(page.locator('.var-row')).toHaveCount(3); await expect(page.locator('.var-row').nth(1).locator('.var-value')).toHaveValue('Ana');
});
test('sites lembrados aparecem e podem ser removidos', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await page.evaluate(async () => chrome.storage.local.set({ sites: ['https://*.blip.ai/*', 'https://app.exemplo.com/*'] }));
  await page.getByRole('tab', { name: 'Sites' }).click();
  const items = page.locator('.sites li'); await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('blip.ai'); await expect(items.nth(0)).toContainText('com subdomínios'); await expect(items.nth(1)).toContainText('app.exemplo.com');
  await items.nth(1).getByRole('button', { name: 'Remover' }).click();
  await expect(items).toHaveCount(1); await expect(page.locator('#status')).toContainText('app.exemplo.com removido');
  expect(await page.evaluate(async () => (await chrome.storage.local.get('sites')).sites)).toEqual(['https://*.blip.ai/*']);
  await items.nth(0).getByRole('button', { name: 'Remover' }).click();
  await expect(page.locator('.sites')).toContainText('Nenhum site salvo');
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
async function downloaded(page, button) {
  const downloadPromise = page.waitForEvent('download'); await page.locator(button).click(); const download = await downloadPromise;
  const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}
test('exportação e importação em JSON e CSV preservam mensagens e rejeitam arquivos inválidos', async ({ page }) => {
  await page.goto(file('biblioteca.html')); await expect(page.locator('#count')).toHaveText(String(DEFAULTS));
  const exported = JSON.parse(await downloaded(page, '#export'));
  expect(exported.version).toBe(1); expect(exported.library).toHaveLength(DEFAULTS);
  const csv = await downloaded(page, '#export-csv');
  expect(csv.startsWith('﻿sep=;\natalho;titulo;categoria;mensagem\n')).toBe(true);
  await page.locator('#file').setInputFiles({ name:'invalido.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify({version:1,library:[{shortcut:'x'}]})) });
  await expect(page.locator('#status')).toContainText('Não foi possível importar'); await expect(page.locator('#count')).toHaveText(String(DEFAULTS));
  // Cancel on the first dialog means "replace", then the replacement is confirmed.
  const answers = [false, true]; page.on('dialog', d => (answers.shift() ? d.accept() : d.dismiss()));
  await page.locator('#file').setInputFiles({ name:'biblioteca.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify({version:1,library:exported.library.slice(0,2)})) });
  await expect(page.locator('#count')).toHaveText('2');
  await page.reload(); await expect(page.locator('#count')).toHaveText('2');
  // CSV from a spreadsheet: merge keeps the two replies and adds the new ones, skipping a repeated shortcut.
  answers.push(true);
  const sheet = 'Atalho;Título;Categoria;Mensagem\nsaudacao;Repetida;Atendimento;não deve entrar\npix;Pix;Cobrança;"Chave Pix: {{chavepix}}\nEnvie o comprovante."\n';
  await page.locator('#file').setInputFiles({ name:'planilha.csv', mimeType:'text/csv', buffer:Buffer.from(sheet) });
  await expect(page.locator('#status')).toContainText('1 respostas adicionadas, 1 já existiam'); await expect(page.locator('#count')).toHaveText('3');
  await page.locator('#search').fill('/pix'); await page.locator('.card').first().click();
  await expect(page.locator('#body')).toHaveValue('Chave Pix: {{chavepix}}\nEnvie o comprovante.');
});
test('tema do Portal persiste e layout cabe em telas pequenas', async ({ page }) => {
  await page.goto(file('biblioteca.html'));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.header')).toHaveCSS('height', '66px');
  await expect(page.locator('h2')).toHaveCSS('font-family', /Montserrat/);
  await expect(page.locator('#count')).toHaveText(String(DEFAULTS));
  await page.getByRole('button', {name:'Ativar tema claro'}).click();
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(240, 244, 249)');
  await page.locator('.card').filter({hasText:'/saudacao'}).click();
  await page.screenshot({path:'test-results/biblioteca-claro.png',fullPage:true});
  await page.getByRole('button', {name:'Ativar tema escuro'}).click();
  await page.screenshot({path:'test-results/biblioteca-escuro.png',fullPage:true});
  await page.getByRole('tab', { name: 'Pacotes' }).click(); await page.screenshot({path:'test-results/pacotes-escuro.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for (const tab of ['Respostas', 'Pacotes', 'Variáveis', 'Sites']) {
    await page.getByRole('tab', { name: tab }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), tab).toBe(true);
  }
  await page.getByRole('tab', { name: 'Respostas' }).click();
  await page.screenshot({path:'test-results/biblioteca-mobile.png',fullPage:true});
});
test('eventos sintéticos da página não abrem o menu nem inserem respostas', async ({ page }) => {
  await page.goto(file('teste.html')); const widget = page.locator('quick-replies');
  await page.evaluate(() => {
    const el = document.querySelector('#plain'); el.focus(); el.value = '/finalizar'; el.setSelectionRange(10, 10);
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  await page.waitForTimeout(150);
  await expect(widget).toBeHidden(); await expect(page.locator('#plain')).toHaveValue('/finalizar');
});
