const $ = id => document.getElementById(id);
let rows = [], current = null, dirty = false, revision = null;
function status(text, error = false) { const s = $('status'); s.textContent = text; s.className = error ? 'error' : ''; void s.offsetWidth; s.classList.add('flash'); }
function enter(el) { el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter'); }
function proceed() { return !dirty || confirm('Há alterações não salvas. Deseja descartá-las?'); }
function render() {
  $('count').textContent = rows.length;
  const categories = [...new Set(rows.map(r => r.category))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const selected = $('category').value;
  $('category').replaceChildren(new Option('Todas as categorias', ''), ...categories.map(c => new Option(c, c)));
  $('category').value = categories.includes(selected) ? selected : '';
  $('groups').replaceChildren(...categories.map(c => new Option(c, c)));
  $('list').replaceChildren();
  for (const row of QR.search(rows, $('search').value).filter(r => !$('category').value || r.category === $('category').value)) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'card' + (row.shortcut === current ? ' selected' : '');
    const top = document.createElement('div'); top.className = 'card-top';
    const shortcut = document.createElement('code'); shortcut.textContent = '/' + row.shortcut;
    const category = document.createElement('span'); category.className = 'tag'; category.textContent = row.category; top.append(shortcut, category);
    const title = document.createElement('h3'); title.textContent = row.title;
    const preview = document.createElement('p'); preview.textContent = row.body.slice(0, 100);
    button.append(top, title, preview); button.onclick = () => { if (proceed()) edit(row); }; $('list').append(button);
  }
  if (!$('list').children.length) { const p = document.createElement('p'); p.className = 'no-results'; p.textContent = 'Nenhuma resposta encontrada. Tente outro termo ou crie um atalho.'; $('list').append(p); }
  renderPacks();
}
function edit(row = null) {
  current = row?.shortcut ?? null; dirty = false;
  if ($('form').hidden || current !== $('form').dataset.shortcut) enter($('form'));
  $('form').dataset.shortcut = current ?? '';
  $('empty').hidden = true; $('form').hidden = false;
  for (const [id, key] of [['title','title'], ['shortcut','shortcut'], ['group','category'], ['body','body']]) $(id).value = row?.[key] ?? '';
  $('preview').textContent = row?.body ?? ''; $('delete').hidden = !row; $('duplicate').hidden = !row;
  render(); $('title').focus();
}
async function persist(next) {
  // Do not overwrite edits made in another library tab.
  const stored = await QR.load();
  if (JSON.stringify(stored) !== revision) throw Error('A biblioteca mudou em outra aba. Recarregue esta página antes de salvar.');
  rows = await QR.save(next); revision = JSON.stringify(rows); dirty = false;
}
function reset() { current = null; $('form').hidden = true; $('empty').hidden = false; render(); }
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Tabs
function showTab(name) {
  document.querySelectorAll('.tab').forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.tab === name)));
  document.querySelectorAll('.pane').forEach(pane => { pane.hidden = pane.id !== `tab-${name}`; });
  $('new').hidden = name !== 'respostas';
  if (name === 'variaveis') renderAuto();
  if (name === 'sites') renderSites();
}
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.tab)));

// Starter packs
function renderPacks() {
  const have = new Set(rows.map(r => r.shortcut));
  $('packs').replaceChildren(...Object.entries(QR_PACOTES).map(([id, pack]) => {
    const card = document.createElement('article'); card.className = 'pack'; card.dataset.pack = id;
    const h3 = document.createElement('h3'); h3.textContent = pack.title;
    const p = document.createElement('p'); p.textContent = pack.description;
    const fresh = pack.library.filter(r => !have.has(r.shortcut)).length;
    const meta = document.createElement('small'); meta.textContent = `${pack.library.length} respostas · ${fresh ? `${fresh} novas para você` : 'todas já no seu acervo'}`;
    const list = document.createElement('div'); list.className = 'pack-list';
    pack.library.forEach(r => { const code = document.createElement('code'); code.textContent = '/' + r.shortcut; code.title = r.title; list.append(code); });
    const actions = document.createElement('div'); actions.className = 'form-actions';
    const add = document.createElement('button'); add.type = 'button'; add.className = 'primary'; add.textContent = 'Adicionar'; add.disabled = !fresh;
    add.onclick = async () => {
      try {
        const merged = QR.merge(rows, pack.library);
        await persist(merged.rows); reset();
        status(`${pack.title}: ${fresh} respostas adicionadas${merged.skipped.length ? `, ${merged.skipped.length} já existiam (${merged.skipped.map(s => '/' + s).join(', ')})` : ''}.`);
      } catch (err) { status(err.message, true); }
    };
    const replace = document.createElement('button'); replace.type = 'button'; replace.className = 'secondary'; replace.textContent = 'Substituir tudo';
    replace.onclick = async () => {
      if (!confirm(`Substituir suas ${rows.length} respostas pelo pacote "${pack.title}" (${pack.library.length})? Exporte antes se quiser guardar uma cópia.`)) return;
      try { await persist(pack.library); reset(); status(`Biblioteca substituída pelo pacote ${pack.title}.`); } catch (err) { status(err.message, true); }
    };
    actions.append(add, replace); card.append(h3, p, meta, list, actions);
    return card;
  }));
}

// Variables
function varRow(name = '', value = '') {
  const row = document.createElement('div'); row.className = 'var-row';
  const prefix = document.createElement('div'); prefix.className = 'prefix';
  const open = document.createElement('span'); open.textContent = '{{';
  const key = document.createElement('input'); key.className = 'var-name'; key.maxLength = 40; key.placeholder = 'empresa'; key.value = name; key.setAttribute('aria-label', 'Nome da variável');
  const close = document.createElement('span'); close.textContent = '}}';
  prefix.append(open, key, close);
  const val = document.createElement('input'); val.className = 'var-value'; val.maxLength = 500; val.placeholder = 'Valor'; val.value = value; val.setAttribute('aria-label', 'Valor da variável');
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'danger'; remove.textContent = 'Remover'; remove.onclick = () => row.remove();
  row.append(prefix, val, remove);
  return row;
}
function renderAuto() {
  const auto = QR.automatic();
  $('autovars').replaceChildren(...Object.entries(auto).map(([name, value]) => { const chip = document.createElement('span'); chip.className = 'chip'; const code = document.createElement('code'); code.textContent = `{{${name}}}`; chip.append(code, ` ${value}`); return chip; }));
}
async function renderVars() {
  const fixed = await QR.loadVariables();
  const entries = Object.entries(fixed);
  if (!entries.length) entries.push(['empresa', ''], ['atendente', '']);
  $('varrows').replaceChildren(...entries.map(([k, v]) => varRow(k, v)));
}
$('addvar').onclick = () => { const row = varRow(); $('varrows').append(row); row.querySelector('.var-name').focus(); };
$('vars').onsubmit = async e => {
  e.preventDefault();
  try {
    const obj = {};
    for (const row of $('varrows').querySelectorAll('.var-row')) {
      const name = row.querySelector('.var-name').value.trim(), value = row.querySelector('.var-value').value;
      if (!name && !value.trim()) continue;
      if (name in obj) throw Error(`Variável repetida: {{${name}}}.`);
      obj[name] = value;
    }
    await QR.saveVariables(obj); await renderVars();
    status(`${Object.keys(obj).length} variáveis fixas salvas. Já valem nas abas abertas.`);
  } catch (err) { status(err.message, true); }
};

// Sites
async function renderSites() {
  const sites = await QR.loadSites();
  const items = await Promise.all(sites.map(async site => {
    let allowed = null;
    try { allowed = await chrome.permissions.contains({ origins: [site] }); } catch {}
    const li = document.createElement('li');
    const host = document.createElement('strong'); host.textContent = site.replace(/^https?:\/\//, '').replace(/\/\*$/, '').replace(/^\*\./, '');
    const meta = document.createElement('small'); meta.textContent = [site.startsWith('https://*.') ? 'com subdomínios' : site.startsWith('http:') ? 'sem https' : '', allowed === false ? 'sem permissão: ative de novo na aba' : ''].filter(Boolean).join(' · ');
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'danger'; remove.textContent = 'Remover';
    remove.onclick = async () => {
      try {
        await QR.saveSites(sites.filter(s => s !== site));
        try { await chrome.permissions.remove({ origins: [site] }); } catch {}
        await renderSites(); status(`${host.textContent} removido. Recarregue as abas desse site.`);
      } catch (err) { status(err.message, true); }
    };
    const info = document.createElement('div'); info.append(host, meta); li.append(info, remove);
    return li;
  }));
  if (!items.length) { const li = document.createElement('li'); li.className = 'no-results'; li.textContent = 'Nenhum site salvo. Ative a extensão em uma aba para começar.'; items.push(li); }
  $('sites').replaceChildren(...items);
}

$('search').oninput = render; $('category').onchange = render;
$('new').onclick = () => { if (proceed()) edit(); };
$('form').oninput = () => { dirty = true; $('preview').textContent = $('body').value; };
$('form').onsubmit = async e => {
  e.preventDefault();
  try {
    const row = { shortcut: $('shortcut').value, title: $('title').value, category: $('group').value, body: $('body').value };
    const next = rows.filter(r => r.shortcut !== current); next.push(row);
    const clean = QR.validate(next);
    await persist(clean); edit(rows.find(r => r.shortcut === row.shortcut)); status('Resposta salva. O atalho já está disponível nas abas ativas.');
  } catch (err) { status(err.message, true); }
};
$('duplicate').onclick = () => {
  if (!proceed()) return;
  const row = rows.find(r => r.shortcut === current);
  let suffix = 2; while (rows.some(r => r.shortcut === `${row.shortcut.slice(0,35)}_${suffix}`)) suffix++;
  edit({ ...row, shortcut: `${row.shortcut.slice(0,35)}_${suffix}`, title: row.title.slice(0,110) + ' (cópia)' });
  current = null; dirty = true; $('delete').hidden = true; $('duplicate').hidden = true;
};
$('delete').onclick = async () => {
  if (!confirm(`Excluir /${current}?`)) return;
  try { await persist(rows.filter(r => r.shortcut !== current)); reset(); status('Resposta excluída.'); }
  catch (err) { status(err.message, true); }
};
$('export').onclick = () => {
  download('quick-replies.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), library: rows }, null, 2), 'application/json');
  status('Biblioteca exportada. Envie o JSON para a equipe importar no Chrome.');
};
$('export-csv').onclick = () => {
  download('quick-replies.csv', '﻿' + QR.toCSV(rows), 'text/csv;charset=utf-8');
  status('CSV exportado. Abra no Excel ou no Google Planilhas, edite e importe de volta.');
};
$('import').onclick = () => { if (proceed()) $('file').click(); };
$('file').onchange = async () => {
  try {
    const file = $('file').files[0]; if (!file) return;
    if (file.size > 3000000) throw Error('O arquivo excede o limite de 3 MB.');
    const text = await file.text();
    let next;
    if (/\.csv$/i.test(file.name) || file.type === 'text/csv') next = QR.parseCSV(text);
    else { const data = JSON.parse(text); if (data.version !== 1) throw Error('Versão de biblioteca não reconhecida.'); next = QR.validate(data.library); }
    const merge = rows.length && confirm(`Importar ${next.length} respostas.\n\nOK: juntar às suas ${rows.length} respostas atuais (atalhos repetidos são ignorados).\nCancelar: substituir tudo pelo arquivo.`);
    if (!merge && rows.length && !confirm(`Substituir a biblioteca atual de ${rows.length} respostas pelas ${next.length} do arquivo? Exporte antes se quiser guardar uma cópia.`)) return;
    const result = merge ? QR.merge(rows, next) : { rows: next, skipped: [] };
    await persist(result.rows); reset();
    status(merge ? `${next.length - result.skipped.length} respostas adicionadas${result.skipped.length ? `, ${result.skipped.length} já existiam` : ''}.` : 'Biblioteca importada com sucesso.');
  } catch (err) { status('Não foi possível importar: ' + err.message, true); }
  finally { $('file').value = ''; }
};
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { if (!$('form').hidden) { e.preventDefault(); $('form').requestSubmit(); } }
  else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input, textarea, select, [contenteditable]')) { e.preventDefault(); showTab('respostas'); $('search').focus(); $('search').select(); }
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
QR.load().then(data => { rows = data; revision = JSON.stringify(data); render(); return renderVars(); }).catch(err => status(err.message, true));
