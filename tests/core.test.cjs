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
  assert.ok(QR.search(QR_DEFAULTS, 'atendimento').length >= 2);
  assert.equal(QR.search(QR_DEFAULTS, '/finalizar')[0].shortcut, 'finalizar');
});
test('biblioteca padrão é o pacote geral, com saudação automática e sem asteriscos', () => {
  assert.deepEqual(QR_DEFAULTS, QR_PACOTES.geral.library);
  assert.equal(QR.validate(QR_DEFAULTS).length, QR_DEFAULTS.length);
  assert.equal(QR_DEFAULTS.find(r => r.shortcut === 'finalizar').body, 'Posso ajudar em algo mais? 🙂');
  assert.ok(QR_DEFAULTS.find(r => r.shortcut === 'saudacao').body.includes('{{saudacao}}'));
  assert.ok(!QR_DEFAULTS.some(row => row.body.includes('*')));
  for (const [id, pack] of Object.entries(QR_PACOTES)) {
    assert.ok(pack.title && pack.description, `pacote ${id} sem título ou descrição`);
    assert.ok(QR.validate(pack.library).length >= 6, `pacote ${id} tem poucas respostas`);
    assert.ok(!pack.library.some(row => row.body.includes('*')), `pacote ${id} usa asteriscos`);
  }
});
test('importação rejeita atalhos duplicados e estrutura inválida', () => {
  assert.throws(() => QR.validate([QR_DEFAULTS[0], QR_DEFAULTS[0]]), /duplicado/);
  assert.throws(() => QR.validate([{ ...QR_DEFAULTS[0], body: 45 }]), /inválido/);
  assert.throws(() => QR.validate([{ ...QR_DEFAULTS[0], shortcut: '../os' }]), /atalho/);
  assert.deepEqual(QR.validate([]), []);
});
test('campos repetidos pedem um único valor, sem interpretar conteúdo', () => {
  assert.deepEqual(QR.variables('Olá {{nome}}, OS {{ OS }}: {{nome}}'), ['nome','OS']);
  assert.equal(QR.fill('Olá {{nome}} / {{nome}}', { nome: '$& <b>Ana</b>' }), 'Olá $& <b>Ana</b> / $& <b>Ana</b>');
});
test('variáveis automáticas seguem o relógio', () => {
  assert.equal(QR.automatic(new Date(2026, 10, 3, 8, 5)).saudacao, 'Bom dia');
  assert.equal(QR.automatic(new Date(2026, 10, 3, 12, 0)).saudacao, 'Boa tarde');
  assert.equal(QR.automatic(new Date(2026, 10, 3, 18, 0)).saudacao, 'Boa noite');
  assert.equal(QR.automatic(new Date(2026, 10, 3, 2, 0)).saudacao, 'Boa noite');
  assert.equal(QR.automatic(new Date(2026, 10, 3, 9, 7)).data, '03/11/2026');
  assert.equal(QR.automatic(new Date(2026, 10, 3, 9, 7)).hora, '09:07');
});
test('variáveis fixas são validadas e o preenchimento deixa só o que falta', () => {
  assert.deepEqual(QR.validateVariables({ ' empresa ': ' Loja X ', atendente: 'Ana' }), { empresa: 'Loja X', atendente: 'Ana' });
  assert.throws(() => QR.validateVariables({ '': 'x' }), /nome/);
  assert.throws(() => QR.validateVariables({ 'a{b': 'x' }), /nome/);
  assert.throws(() => QR.validateVariables({ a: 'x'.repeat(501) }), /500/);
  assert.throws(() => QR.validateVariables([1]), /inválid/);
  const values = QR.known({ empresa: 'Loja X' }, new Date(2026, 10, 3, 15, 0));
  assert.equal(values.empresa, 'Loja X'); assert.equal(values.saudacao, 'Boa tarde');
  assert.deepEqual(QR.missing('{{saudacao}}! {{empresa}} aqui, {{nome}}?', values), ['nome']);
  assert.equal(QR.known({ saudacao: 'Oi' }).saudacao, 'Oi');
});
test('padrão de site vem da URL da aba', () => {
  assert.equal(QR.sitePattern('https://app.blip.ai/conversas/123?x=1'), 'https://app.blip.ai/*');
  assert.equal(QR.sitePattern('http://localhost:3000/chat'), 'http://localhost:3000/*');
  assert.equal(QR.sitePattern('chrome://extensions'), null);
  assert.equal(QR.sitePattern('file:///C:/teste.html'), null);
  assert.equal(QR.sitePattern('lixo'), null);
  assert.deepEqual(QR.validateSites(['https://a.com/*', 'https://a.com/*', 'x']), ['https://a.com/*']);
});
test('CSV aceita ; ou , e cabeçalhos em português, e exporta de volta', () => {
  const csv = 'Atalho;Título;Categoria;Mensagem\nola;"Saudação";Atendimento;"Olá, {{nome}}!\nTudo bem?"\n"/tchau";Despedida;Atendimento;Até logo\n';
  const rows = QR.parseCSV(csv);
  assert.deepEqual(rows, [
    { shortcut: 'ola', title: 'Saudação', category: 'Atendimento', body: 'Olá, {{nome}}!\nTudo bem?' },
    { shortcut: 'tchau', title: 'Despedida', category: 'Atendimento', body: 'Até logo' },
  ]);
  assert.deepEqual(QR.parseCSV('shortcut,title,category,body\r\na,"b ""c""",d,e\r\n'), [{ shortcut: 'a', title: 'b "c"', category: 'd', body: 'e' }]);
  assert.throws(() => QR.parseCSV('nome,texto\nx,y'), /coluna/);
  assert.deepEqual(QR.parseCSV(QR.toCSV(rows)), rows);
});
test('mesclar pacotes mantém as respostas atuais e pula atalhos repetidos', () => {
  const mine = [{ shortcut: 'ola', title: 'Minha', category: 'A', body: 'x' }];
  const merged = QR.merge(mine, [{ shortcut: 'ola', title: 'Pacote', category: 'A', body: 'y' }, { shortcut: 'novo', title: 'Novo', category: 'A', body: 'z' }]);
  assert.deepEqual(merged.rows.map(r => r.shortcut), ['ola', 'novo']);
  assert.equal(merged.rows[0].title, 'Minha'); assert.deepEqual(merged.skipped, ['ola']);
});
