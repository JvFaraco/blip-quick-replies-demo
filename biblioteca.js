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
  try { await persist(rows.filter(r => r.shortcut !== current)); current = null; $('form').hidden = true; $('empty').hidden = false; render(); status('Resposta excluída.'); }
  catch (err) { status(err.message, true); }
};
$('export').onclick = () => {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), library: rows }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'quick-replies.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('Biblioteca exportada. Envie o JSON para a equipe importar no Chrome.');
};
$('import').onclick = () => { if (proceed()) $('file').click(); };
$('file').onchange = async () => {
  try {
    const file = $('file').files[0]; if (!file) return;
    if (file.size > 3000000) throw Error('O arquivo excede o limite de 3 MB.');
    const data = JSON.parse(await file.text());
    if (data.version !== 1) throw Error('Versão de biblioteca não reconhecida.');
    const next = QR.validate(data.library);
    if (!confirm(`Importar ${next.length} respostas? A biblioteca atual de ${rows.length} respostas será substituída. Exporte antes se quiser guardar uma cópia.`)) return;
    await persist(next); current = null; $('form').hidden = true; $('empty').hidden = false; render(); status('Biblioteca importada com sucesso.');
  } catch (err) { status('Não foi possível importar: ' + err.message, true); }
  finally { $('file').value = ''; }
};
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { if (!$('form').hidden) { e.preventDefault(); $('form').requestSubmit(); } }
  else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input, textarea, select, [contenteditable]')) { e.preventDefault(); $('search').focus(); $('search').select(); }
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
QR.load().then(data => { rows = data; revision = JSON.stringify(data); render(); }).catch(err => status(err.message, true));
