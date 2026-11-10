// Demo page: chooses a fictitious starter pack, keeps the fixed variables in sync and simulates a chat where Enter sends.
// The reply menu itself is the extension's own content.js, reading the in-memory storage from demo-chrome.js.
(() => {
  const $ = id => document.getElementById(id);
  const store = chrome.storage.local;
  const opening = {
    geral: 'Oi! Preciso de ajuda com o meu cadastro.',
    ecommerce: 'Boa tarde, meu pedido ainda não chegou 😕',
    suporte: 'Não consigo entrar no sistema, aparece "senha inválida".',
    agendamento: 'Queria remarcar a consulta de amanhã, pode ser?',
    financeiro: 'Recebi um boleto com valor diferente do combinado.'
  };
  const time = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  function bubble(text, who) {
    const li = document.createElement('li'); li.className = `msg ${who}`;
    const p = document.createElement('p'); p.textContent = text;
    const t = document.createElement('time'); t.textContent = time();
    li.append(p, t); $('messages').append(li); li.scrollIntoView({ block: 'nearest' });
  }

  function choosePack(id) {
    const pack = QR_PACOTES[id];
    store.set({ library: pack.library });
    $('pack-desc').textContent = pack.description;
    // Show replies with a variable first: they demonstrate the fill-in form.
    const rows = [...pack.library].sort((a, b) => QR.variables(b.body).length - QR.variables(a.body).length).slice(0, 5);
    $('shortcuts').replaceChildren(...rows.map(r => {
      const li = document.createElement('li'), code = document.createElement('code'), span = document.createElement('span');
      code.textContent = `/${r.shortcut}`; span.textContent = r.title; li.append(code, span); return li;
    }));
    $('messages').replaceChildren(); bubble(opening[id] || 'Olá!', 'them');
  }
  $('packs').append(...Object.entries(QR_PACOTES).map(([id, pack], i) => {
    const label = document.createElement('label'), input = document.createElement('input');
    input.type = 'radio'; input.name = 'pack'; input.value = id; input.checked = i === 0;
    input.addEventListener('change', () => choosePack(id));
    label.append(input, document.createTextNode(pack.title)); return label;
  }));

  const saveVariables = () => {
    const empresa = $('var-empresa').value.trim();
    store.set({ variables: { empresa, atendente: $('var-atendente').value.trim() } });
    $('chat-sub').textContent = `Atendimento · ${empresa || 'Loja Exemplo'}`;
  };
  $('var-empresa').addEventListener('input', saveVariables);
  $('var-atendente').addEventListener('input', saveVariables);

  // The composer grows with the inserted reply, like most chat inputs.
  const fit = () => { const field = $('message'); field.style.height = 'auto'; field.style.height = `${Math.min(field.scrollHeight + 2, 220)}px`; };
  $('message').addEventListener('input', fit);
  const send = () => { const field = $('message'), text = field.value.trim(); if (!text) return; bubble(text, 'me'); field.value = ''; fit(); field.focus(); };
  // While the reply menu is open the extension handles Enter and stops it; otherwise Enter sends, like in most chats.
  $('composer').addEventListener('submit', e => { e.preventDefault(); send(); });
  $('message').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });

  saveVariables(); choosePack(Object.keys(QR_PACOTES)[0]);
})();
