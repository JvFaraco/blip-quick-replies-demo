// Records the demo GIF for the README: frames captured with Playwright on the test page, assembled by scripts/montar-gif.py (Pillow).
// Usage: node scripts/gravar-gif.cjs && python scripts/montar-gif.py
const { chromium } = require('@playwright/test');
const fs = require('node:fs'); const path = require('node:path'); const os = require('node:os'); const { pathToFileURL } = require('node:url');
// Frames go to the system temp dir: Playwright wipes test-results/ on every run.
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(os.tmpdir(), 'quick-replies-gif');
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL === 'chromium' ? undefined : (process.env.PW_CHANNEL || 'chrome'), headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 520 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    const listeners = [];
    globalThis.chrome = { storage: { local: {
      async get(key) { const all = { variables: { atendente: 'Ana', empresa: 'Loja Exemplo' } }; return key in all ? { [key]: all[key] } : {}; },
      async set() {}
    }, onChanged: { addListener(fn) { listeners.push(fn); } } } };
  });
  await page.goto(pathToFileURL(path.join(ROOT, 'teste.html')).href);
  await page.addStyleTag({ content: '.header,.test-page>.brand,.test-page>h1,.test-page>p,label[for=rich],#rich,.test-page>a{display:none!important}.test-page{margin:18px auto;padding:0 24px;max-width:900px}#plain{height:150px;font-size:15px}label[for=plain]{margin-top:0}' });
  // The field sits low enough for the menu to open above it, like in a chat window.
  await page.evaluate(() => { document.body.style.paddingTop = '300px'; });
  const frames = []; let running = true; const t0 = Date.now();
  const capture = (async () => { let i = 0; while (running) { const t = Date.now() - t0; const file = path.join(OUT, `f${String(i++).padStart(4, '0')}.png`); await page.screenshot({ path: file }); frames.push({ file, t }); } })();
  const pause = ms => page.waitForTimeout(ms);
  await page.locator('#plain').click(); await pause(600);
  await page.keyboard.type('Olá! ', { delay: 90 }); await pause(300);
  await page.keyboard.type('/saud', { delay: 160 }); await pause(1100);
  await page.keyboard.press('Tab'); await pause(1800);
  await page.keyboard.type(' /fin', { delay: 160 }); await pause(900);
  await page.keyboard.press('Enter'); await pause(1800);
  running = false; await capture;
  const end = Date.now() - t0;
  fs.writeFileSync(path.join(OUT, 'frames.json'), JSON.stringify({ frames, end }));
  await browser.close();
  console.log(`${frames.length} quadros em ${end} ms`);
})().catch(e => { console.error(e); process.exit(1); });
