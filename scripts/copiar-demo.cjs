// Copies the extension files the GitHub Pages demo runs (docs/extensao/). Pages publishes docs/ only, so it cannot load them from the root.
// Usage: npm run demo. tests/pacote.test.cjs fails if a copy falls behind the original.
const fs = require('node:fs'); const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'docs', 'extensao');
const FILES = ['catalogo.js', 'core.js', 'content.js', 'icons/icone.svg', 'vendor/inter-latin-wght.woff2', 'vendor/montserrat-latin-wght.woff2', 'vendor/LICENSE-inter.txt', 'vendor/LICENSE-montserrat.txt'];
if (require.main === module) {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const name of FILES) { fs.mkdirSync(path.dirname(path.join(OUT, name)), { recursive: true }); fs.copyFileSync(path.join(ROOT, name), path.join(OUT, name)); }
  console.log(`${FILES.length} arquivos em docs/extensao/`);
}
module.exports = { FILES, OUT, ROOT };
