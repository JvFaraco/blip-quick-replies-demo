// The GitHub Pages demo (docs/index.html) runs the real content script over an in-memory chrome.storage stand-in.
const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const page_ = pathToFileURL(path.resolve(__dirname, '..', 'docs', 'index.html')).href;

test('demo: / insere a resposta com as variáveis, Enter envia e o pacote troca a biblioteca', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 3, 9, 0));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(page_); const field = page.locator('#message');
  await field.click(); await field.pressSequentially('/saud'); await field.press('Tab');
  await expect(field).toHaveValue('Bom dia! Meu nome é Ana e vou cuidar do seu atendimento. Como posso ajudar?');
  await field.press('Enter');
  await expect(page.locator('.msg.me p')).toHaveText('Bom dia! Meu nome é Ana e vou cuidar do seu atendimento. Como posso ajudar?');
  await expect(field).toHaveValue('');
  await page.locator('#var-empresa').fill('Mercado Azul');
  await field.click(); await field.pressSequentially('/ola'); await field.press('Enter');
  await expect(field).toHaveValue('Olá! Você está falando com o atendimento da Mercado Azul. Em que posso ajudar?');
  await field.fill('');
  await page.getByLabel('Loja online').check();
  await expect(page.locator('#shortcuts')).toContainText('/statuspedido');
  await field.click(); await field.pressSequentially('/rastreio'); await field.press('Tab');
  await expect(field).toHaveValue(/Como acompanhar a entrega/);
  expect(errors).toEqual([]);
});
