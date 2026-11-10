// The zip is built from the explicit list in empacotar.py. These checks catch a file the extension loads but the list forgets,
// a version mismatch between manifest and package.json, and a stale biblioteca-padrao.json.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const FILES = (() => {
  const block = read('empacotar.py').match(/^FILES = \(([\s\S]*?)^\)/m);
  assert.ok(block, 'FILES não encontrado em empacotar.py');
  return [...block[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
})();

// Every file the extension can load: manifest entries, HTML scripts/styles/icons, CSS url(), importScripts and injected script lists.
function referenced() {
  const refs = new Set([manifest.background.service_worker, manifest.action.default_popup, manifest.options_page,
    ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon)]);
  const pending = [...refs];
  while (pending.length) {
    const name = pending.pop(), text = read(name), found = [];
    if (name.endsWith('.html')) for (const m of text.matchAll(/(?:src|href)="([^"#?:]+)"/g)) found.push(m[1]);
    if (name.endsWith('.css')) for (const m of text.matchAll(/url\(["']?([^"')]+)["']?\)/g)) found.push(m[1]);
    if (name.endsWith('.js')) {
      for (const m of text.matchAll(/importScripts\(([^)]*)\)|js: \[([^\]]*)\]|files: \[([^\]]*)\]|getURL\('([^'?]+)/g))
        for (const f of (m[1] || m[2] || m[3] || `'${m[4]}'`).matchAll(/'([^']+)'/g)) found.push(f[1]);
    }
    for (const f of found) if (!refs.has(f)) { refs.add(f); if (/\.(html|css|js)$/.test(f)) pending.push(f); }
  }
  return [...refs].sort();
}

test('pacote leva todos os arquivos que a extensão carrega', () => {
  const refs = referenced();
  assert.ok(refs.includes('content.js') && refs.includes('vendor/inter-latin-wght.woff2') && refs.includes('teste.html'), 'varredura incompleta');
  for (const name of refs) assert.ok(FILES.includes(name), `${name} é usado pela extensão mas não está em FILES (empacotar.py)`);
  for (const name of FILES) assert.ok(fs.existsSync(path.join(ROOT, name)), `${name} está em FILES mas não existe`);
  assert.equal(new Set(FILES).size, FILES.length, 'arquivo repetido em FILES');
});

test('versões e textos do manifest servem para a loja', () => {
  assert.equal(manifest.version, JSON.parse(read('package.json')).version, 'manifest.json e package.json com versões diferentes');
  assert.match(manifest.version, /^\d+(\.\d+){0,3}$/);
  assert.ok(manifest.description.length <= 132, `descrição do manifest com ${manifest.description.length} caracteres (máximo 132)`);
  assert.ok(manifest.name.length <= 75);
  for (const size of ['16', '32', '48', '128']) assert.ok(manifest.icons[size], `falta o ícone ${size}`);
});

test('biblioteca-padrao.json acompanha o catálogo', () => {
  require('../catalogo.js');
  assert.equal(read('biblioteca-padrao.json'), JSON.stringify({ version: 1, library: QR_DEFAULTS }, null, 2) + '\n', 'rode python empacotar.py para regenerar');
});
