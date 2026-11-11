// Renders the Chrome Web Store images into loja/: store icon, 1280x800 screenshots and promo tiles.
// Screenshots come from the GitHub Pages demo (docs/index.html) and the extension's own pages with a chrome.* stand-in.
// Usage: npm run loja   (PW_CHANNEL=chromium uses Playwright's build, as in CI; PW_EXECUTABLE points at another Chromium binary)
const { chromium } = require('@playwright/test');
const fs = require('node:fs'); const path = require('node:path'); const { pathToFileURL } = require('node:url');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'loja'), SHOTS = path.join(OUT, 'capturas');
const url = name => pathToFileURL(path.join(ROOT, name)).href;
const channel = process.env.PW_CHANNEL || 'chrome';

// Same stand-in as tests/browser.spec.cjs: storage over localStorage, permissions granted.
function stub() {
  const listeners = [], read = () => JSON.parse(localStorage.getItem('test-store') || '{}');
  globalThis.chrome = {
    storage: { local: {
      async get(key) { const all = read(); return key in all ? { [key]: all[key] } : {}; },
      async set(data) { localStorage.setItem('test-store', JSON.stringify({ ...read(), ...data })); listeners.forEach(fn => fn(Object.fromEntries(Object.keys(data).map(k => [k, { newValue: data[k] }])), 'local')); },
      async remove(key) { const all = read(); delete all[key]; localStorage.setItem('test-store', JSON.stringify(all)); listeners.forEach(fn => fn({ [key]: {} }, 'local')); }
    }, onChanged: { addListener(fn) { listeners.push(fn); } } },
    permissions: { async contains() { return true; }, async request() { return true; }, async remove() { return true; } },
    tabs: { async query() { return [{ id: 1, url: 'https://atendimento.exemplo.com/' }]; } },
    scripting: { async executeScript() {} }, runtime: { openOptionsPage() {} }
  };
  localStorage.setItem('test-store', JSON.stringify({ variables: { empresa: 'Loja Exemplo', atendente: 'Ana' }, sites: ['https://*.blip.ai/*', 'https://atendimento.exemplo.com/*'] }));
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ ...(channel === 'chromium' ? {} : { channel }), ...(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}), headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' });
    await context.clock.setFixedTime(new Date(2026, 10, 3, 9, 40));
    const page = await context.newPage();
    const shot = name => page.screenshot({ path: path.join(SHOTS, name) });

    // Demo: hide the hero so the conversation fills the frame, the way the extension looks inside a real chat.
    const demo = async () => {
      await page.goto(url('docs/index.html'));
      await page.addStyleTag({ content: '.top,.hero,.demo-head,.how,.en,.foot{display:none!important}.demo{padding:40px 0 0}.chat{min-height:720px}.messages{max-height:none}' });
    };
    await demo();
    const field = page.locator('#message');
    await field.click(); await field.pressSequentially('Olá! '); await field.pressSequentially('/');
    await page.waitForTimeout(400); await shot('1-menu.png');

    await field.fill(''); await field.pressSequentially('/protoc'); await field.press('Tab');
    await page.keyboard.type('2026-118734'); await page.waitForTimeout(300); await shot('2-campos.png');

    await demo();
    await page.getByLabel('Loja online').check();
    await field.click(); await field.pressSequentially('/rastreio'); await field.press('Tab'); await field.press('Enter');
    await field.click(); await field.pressSequentially('/troc'); await page.waitForTimeout(400); await shot('3-pacotes-na-conversa.png');

    await page.addInitScript(stub);
    await page.goto(url('biblioteca.html'));
    await page.locator('.card').filter({ has: page.locator('code', { hasText: /^\/saudacao$/ }) }).click();
    await page.waitForTimeout(200); await shot('4-biblioteca.png');

    await page.getByRole('tab', { name: 'Equipe' }).click();
    await page.locator('#team-url').fill('https://docs.google.com/spreadsheets/d/1aBcD…/edit');
    await page.waitForTimeout(200); await shot('5-equipe.png');

    // Store icon: 96x96 artwork centered on a transparent 128x128 canvas.
    const svg = fs.readFileSync(path.join(ROOT, 'icons', 'icone.svg'), 'utf8');
    const icon = await page.evaluate(async svg => {
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
      canvas.getContext('2d').drawImage(img, 16, 16, 96, 96);
      return canvas.toDataURL('image/png').split(',')[1];
    }, svg);
    fs.writeFileSync(path.join(OUT, 'icone-loja-128.png'), Buffer.from(icon, 'base64'));

    // Promo images: plain HTML with the brand fonts, rendered at the exact store sizes.
    // setContent pages cannot read file:// URLs, so the fonts go inline.
    const font = name => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'vendor', name)).toString('base64')}`;
    const fonts = `@font-face{font-family:Inter;src:url('${font('inter-latin-wght.woff2')}');font-weight:100 900}@font-face{font-family:Montserrat;src:url('${font('montserrat-latin-wght.woff2')}');font-weight:100 900}`;
    const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const menu = 'data:image/png;base64,' + fs.readFileSync(path.join(SHOTS, '1-menu.png')).toString('base64');
    const promo = async (name, width, height, body, css) => {
      const p = await context.newPage(); await p.setViewportSize({ width, height });
      await p.setContent(`<!doctype html><meta charset="utf-8"><style>${fonts}*{box-sizing:border-box;margin:0}html,body{width:${width}px;height:${height}px;overflow:hidden}
body{font-family:Inter,sans-serif;color:#fff;background:radial-gradient(120% 140% at 0% 0%,#0b6fd0 0%,#004f98 45%,#0b1d3a 100%);display:flex;align-items:center}
h1{font:800 1em/1.05 Montserrat,sans-serif;letter-spacing:-.03em}kbd{display:inline-block;padding:0 .28em;border-radius:.18em;background:#ffffff26;border:2px solid #ffffff40;font:inherit;color:#f5b400}
.name{display:flex;align-items:center;gap:.5em;font:800 1em Montserrat,sans-serif}.name img{width:1.6em;height:1.6em}p{color:#d7e6f7}${css}</style><body>${body}</body>`);
      await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: path.join(OUT, name) }); await p.close();
    };
    await promo('promo-pequeno-440x280.png', 440, 280,
      `<div class="box"><div class="name"><img src="${svgData}" alt="">Quick Replies</div><h1>Digite <kbd>/</kbd> e responda mais rápido.</h1><p>Respostas prontas para qualquer chat web.</p></div>`,
      '.box{padding:0 34px}.name{font-size:18px;margin-bottom:16px}h1{font-size:34px}p{margin-top:12px;font-size:15px}');
    await promo('promo-marquee-1400x560.png', 1400, 560,
      `<div class="box"><div class="name"><img src="${svgData}" alt="">Quick Replies</div><h1>Digite <kbd>/</kbd> e responda mais rápido.</h1><p>Respostas prontas no campo de mensagem de qualquer chat web. Você revisa e envia.</p></div><div class="shot"><img src="${menu}" alt=""></div>`,
      '.box{flex:0 0 560px;padding-left:80px}.name{font-size:24px;margin-bottom:24px}h1{font-size:50px}p{margin-top:20px;font-size:20px;line-height:1.5}.shot{flex:1;height:100%;position:relative}.shot img{position:absolute;left:40px;top:50px;width:1000px;border-radius:16px;box-shadow:0 30px 80px #0008}');
  } finally { await browser.close(); }
  console.log(`imagens em ${path.relative(ROOT, OUT)}/`);
})().catch(e => { console.error(e); process.exit(1); });
