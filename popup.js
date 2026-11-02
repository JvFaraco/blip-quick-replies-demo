const $ = id => document.getElementById(id);
let rows = [], active = 0;
function say(text) { const s = $('status'); s.textContent = text; s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash'); }
function mark(i) {
  const cards = [...$('results').querySelectorAll('.result')];
  if (!cards.length) return;
  active = (i + cards.length) % cards.length;
  cards.forEach((card, n) => card.classList.toggle('active', n === active));
  cards[active].scrollIntoView({ block: 'nearest' });
}
function render() {
  $('results').replaceChildren();
  QR.search(rows, $('search').value).forEach((row, i) => {
    const card = document.createElement('div'); card.className = 'result';
    const title = document.createElement('strong'); title.textContent = row.title;
    const hint = document.createElement('small'); hint.textContent = `/${row.shortcut} · ${row.category}`;
    const copy = document.createElement('button'); copy.textContent = 'Copiar'; copy.className = 'secondary';
    copy.addEventListener('click', async () => {
      try {
        if (QR.variables(row.body).length) { say('Esta resposta tem campos variáveis. Use o atalho na conversa para preenchê-los.'); return; }
        await navigator.clipboard.writeText(row.body); say(`/${row.shortcut} copiado. Cole na conversa e revise antes de enviar.`);
        copy.textContent = 'Copiado ✓'; copy.classList.add('done'); clearTimeout(copy.timer);
        copy.timer = setTimeout(() => { copy.textContent = 'Copiar'; copy.classList.remove('done'); }, 1600);
      } catch { say('Não foi possível copiar. Use o atalho no campo da conversa.'); }
    });
    card.addEventListener('pointermove', () => { if (active !== i) mark(i); });
    const info = document.createElement('div'); info.append(title, hint); card.append(info, copy); $('results').append(card);
  });
  if (!$('results').children.length) $('results').textContent = 'Nenhuma resposta encontrada.';
  else mark(0);
}
$('search').addEventListener('input', render);
$('search').addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); mark(active + (e.key === 'ArrowDown' ? 1 : -1)); }
  else if (e.key === 'Enter') { e.preventDefault(); $('results').querySelectorAll('.result')[active]?.querySelector('button').click(); }
});
$('manage').onclick = () => chrome.runtime.openOptionsPage();
$('activate').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['catalogo.js', 'core.js', 'content.js'] });
    say('Ativado! Clique no campo da conversa e digite /. Nesta aba, reative após recarregar se o endereço não terminar em blip.ai.');
  } catch { say('Não foi possível ativar nesta página. Abra o Blip e tente novamente.'); }
};
QR.load().then(data => { rows = data; render(); }).catch(e => { $('status').textContent = e.message; });
