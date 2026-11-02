const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../catalogo.js'); require('../core.js');
test('atalho exige limite de palavra e respeita posição do cursor', () => {
  assert.equal(QR.token('https://site.com/semvoz', 23), null);
  assert.equal(QR.token('texto/semvoz', 12), null);
  assert.deepEqual(QR.token('Olá /os resto', 7), { start: 4, end: 7, query: 'os' });
  assert.deepEqual(QR.token('/', 1), { start: 0, end: 1, query: '' });
});
test('busca por assunto sem acento e prioridade do atalho', () => {
  assert.ok(QR.search(QR_DEFAULTS, 'pedido').length >= 2);
  assert.equal(QR.search(QR_DEFAULTS, '/numeropedido')[0].shortcut, 'numeropedido');
});
test('importação rejeita atalhos duplicados e estrutura inválida', () => {
  assert.equal(QR.validate(QR_DEFAULTS).length, 16);
  for (const [shortcut, name] of [['ana','Ana'], ['bruno','Bruno']]) {
    assert.equal(QR_DEFAULTS.find(row => row.shortcut === shortcut).body, `Atendimento iniciado por ${name}`);
  }
  // The Blip shows asterisks literally instead of formatting them.
  assert.ok(!QR_DEFAULTS.some(row => row.body.includes('*')));
  assert.ok(!QR_DEFAULTS.some(row => ['inicio','blip'].includes(row.shortcut)));
  assert.throws(() => QR.validate([QR_DEFAULTS[0], QR_DEFAULTS[0]]), /duplicado/);
  assert.throws(() => QR.validate([{ ...QR_DEFAULTS[0], body: 45 }]), /inválido/);
  assert.throws(() => QR.validate([{ ...QR_DEFAULTS[0], shortcut: '../os' }]), /atalho/);
  assert.deepEqual(QR.validate([]), []);
});
test('campos repetidos pedem um único valor, sem interpretar conteúdo', () => {
  assert.deepEqual(QR.variables('Olá {{nome}}, OS {{ OS }}: {{nome}}'), ['nome','OS']);
  assert.equal(QR.fill('Olá {{nome}} / {{nome}}', { nome: '$& <b>Ana</b>' }), 'Olá $& <b>Ana</b> / $& <b>Ana</b>');
});
