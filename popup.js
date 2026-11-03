const $ = id => document.getElementById(id);
let rows = [], fixed = {}, active = 0;
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
        const values = QR.known(fixed);
        if (QR.missing(row.body, values).length) { say('Esta resposta tem campos para preencher. Use o atalho na conversa.'); return; }
        await navigator.clipboard.writeText(QR.fill(row.body, values)); say(`/${row.shortcut} copiado. Cole na conversa e revise antes de enviar.`);
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
// Activates the menu in the current tab and remembers the site, so next time it opens on its own.
$('activate').onclick = async () => {
  $('activate').disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const site = QR.sitePattern(tab?.url ?? '');
    let remembered = false;
    if (site) {
      try {
        remembered = await chrome.permissions.request({ origins: [site] });
        if (remembered) { const sites = await QR.loadSites(); if (!sites.includes(site)) await QR.saveSites([...sites, site]); }
      } catch { remembered = false; }
    }
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ['catalogo.js', 'core.js', 'content.js'] });
    if (remembered) say(`Ativado e salvo para ${new URL(tab.url).host}. Clique no campo da conversa e digite /. Da próxima vez já abre sozinho.`);
    else if (site) say('Ativado só nesta aba. Para lembrar o site, permita o acesso quando o Chrome perguntar.');
    else say('Ativado nesta aba. Clique no campo da conversa e digite /.');
  } catch { say('Não foi possível ativar nesta página. Abra a conversa e tente novamente.'); }
  finally { $('activate').disabled = false; }
};
Promise.all([QR.load(), QR.loadVariables()]).then(([data, vars]) => { rows = data; fixed = vars; render(); }).catch(e => { $('status').textContent = e.message; });
