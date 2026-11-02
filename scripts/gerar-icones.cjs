// Render the toolbar icon (icons/icone.svg) into the PNG sizes the manifest needs.
const {chromium} = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const root = path.resolve(__dirname, '..');
  const svg = fs.readFileSync(path.join(root,'icons','icone.svg'),'utf8');
  const browser = await chromium.launch({channel:process.env.PW_CHANNEL || 'chrome', headless:true});
  try {
    const page = await browser.newPage();
    for (const size of [16,32,48,128]) {
      const data = await page.evaluate(async ({svg, size}) => {
        const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        await img.decode();
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(img,0,0,size,size);
        return canvas.toDataURL('image/png').split(',')[1];
      }, {svg, size});
      fs.writeFileSync(path.join(root,'icons',`icon-${size}.png`),Buffer.from(data,'base64'));
    }
  } finally { await browser.close(); }
})();
