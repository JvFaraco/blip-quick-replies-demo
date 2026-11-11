(() => {
  if (globalThis.__quickReplies) return;
  globalThis.__quickReplies = true;
  const LIMIT = 30, VAR = /\{\{\s*([^{}\n]+?)\s*\}\}/g, EASE = 'cubic-bezier(.16,1,.3,1)';
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let library = [], fixed = {}, matches = [], index = 0, context = null, composing = false, filling = false;
  // open: logical state (the panel may still be fading out); side: anchored above or below the editor while open.
  let open = false, view = null, query = null, side = null, listEl = null, cursorEl = null;
  let closing = null, heightAnim = null, noticeTimer = 0, frame = 0, pointer = '', pointerMoved = false;
  const host = document.createElement('quick-replies');
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `:host{all:initial;position:fixed;z-index:2147483647;font:13px/1.45 Inter,'Segoe UI',system-ui,sans-serif;color:#e8edf5;color-scheme:dark;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}
.panel{display:flex;flex-direction:column;width:min(400px,calc(100vw - 24px));background:#161d2af5;border:1px solid #ffffff1f;border-radius:14px;box-shadow:0 18px 50px #00000059,0 2px 8px #00000033;overflow:hidden;backdrop-filter:blur(12px)}.panel[hidden]{display:none}.panel.leaving{pointer-events:none}
header{flex:none;display:flex;align-items:center;gap:8px;padding:9px 12px 9px 14px;background:linear-gradient(105deg,#004f98,#0669bd 55%,#00549f);border-bottom:2px solid #F5B400;color:#fff;font-weight:700}
.mark{font:800 11px/1 Montserrat,Inter,'Segoe UI',sans-serif;letter-spacing:-.2px;padding:4px 6px;border-radius:6px;background:#ffffff26}.title{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}header small{font-size:11px;font-weight:500;color:#ffffffb8;white-space:nowrap}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:transparent;margin:0}button:focus-visible{outline:2px solid #5aa9ff;outline-offset:2px}
.back{flex:none;width:24px;height:24px;border-radius:7px;background:#ffffff1f;font-size:17px;line-height:1;display:grid;place-items:center;transition:background .15s}.back:hover{background:#ffffff38}
.list{position:relative;flex:1 1 auto;min-height:0;max-height:320px;overflow:auto;padding:6px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#ffffff2e transparent}
.cursor{position:absolute;left:6px;right:6px;top:0;border-radius:10px;background:#005bac40;box-shadow:inset 3px 0 #2f8cf0;pointer-events:none;transition:transform .2s ${EASE},height .2s ${EASE}}
.item{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:1px 8px;align-items:center;width:100%;text-align:left;padding:8px 10px;border-radius:10px;color:#e8edf5}
code{font:600 11.5px/1.5 ui-monospace,Consolas,monospace;color:#7cbcff;background:#005bac2e;border-radius:6px;padding:0 6px}strong{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat,.enter{grid-column:3;grid-row:1;justify-self:end;font-size:11px;color:#8a99ad;white-space:nowrap;transition:opacity .15s,transform .2s ${EASE}}.enter{opacity:0;transform:translateX(4px);color:#cfe6ff}
.item[aria-selected=true] .cat{opacity:0}.item[aria-selected=true] .enter{opacity:1;transform:none}
.item p{grid-column:1/-1;margin:0;color:#8a99ad;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}.item[aria-selected=true] p{color:#b8c4d4}
mark{background:none;color:#F5B400;font-weight:700}
.more,.empty{padding:8px 10px;font-size:11.5px;color:#8a99ad}.empty{padding:14px 10px;font-size:12.5px}
footer{flex:none;display:flex;flex-wrap:wrap;gap:4px 14px;padding:7px 14px;background:#111620;border-top:1px solid #ffffff0f;font-size:11px;color:#8a99ad}
kbd{display:inline-block;min-width:18px;margin-right:5px;padding:2px 5px;border:1px solid #ffffff21;border-bottom-width:2px;border-radius:5px;background:#ffffff12;color:#d5dde8;font-weight:600;font-size:11px;line-height:1.2;font-family:inherit;text-align:center}
form{display:flex;flex-direction:column;gap:10px;min-height:0;padding:14px;overflow:auto}
label{display:flex;flex-direction:column;gap:5px;font-size:11.5px;font-weight:600;color:#aab6c6}
input{width:100%;border:1px solid #ffffff24;border-radius:8px;padding:8px 10px;font:inherit;font-size:13px;background:#0f141d;color:#e8edf5;transition:border-color .15s,box-shadow .15s}input:focus{outline:none;border-color:#2f8cf0;box-shadow:0 0 0 3px #2f8cf033}
.preview{position:relative;max-height:170px;overflow:auto;padding:10px 12px;border:1px solid #ffffff14;border-radius:10px;background:#0f141d;color:#c9d3e0;font-size:12.5px;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin}
.var{border-radius:4px;padding:0 3px;background:#ffffff14;color:#8a99ad;transition:background .15s,color .15s}.var.filled{background:#005bac38;color:#9fd0ff}.var.active{background:#F5B40033;color:#ffd34d}
.actions{display:flex;gap:8px;align-items:center}
.primary{display:inline-flex;align-items:center;background:#005bac;color:#fff;border-radius:8px;padding:8px 12px 8px 14px;font-weight:600;transition:background .15s,transform .1s}.primary:hover{background:#0669bd}.primary:active,.ghost:active{transform:scale(.97)}.primary kbd{margin:0 0 0 8px;background:#ffffff26;border-color:#ffffff33;color:#fff}
.ghost{border-radius:8px;padding:8px 12px;color:#aab6c6;transition:background .15s,transform .1s}.ghost:hover{background:#ffffff0f}
.notice{display:flex;gap:10px;align-items:flex-start;padding:14px;color:#f3c2c2;font-size:12.5px}.notice:before{content:'!';flex:none;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#ef858533;color:#ef8585;font-weight:800;font-size:12px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
.sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}`;
  root.append(style);
  const panel = document.createElement('div'); panel.className = 'panel'; panel.hidden = true; root.append(panel);
  // A fixed status region: screen readers only announce changes to a region that already exists.
  // The count waits for a pause in typing; insertions and errors are announced at once.
  const live = document.createElement('div'); live.className = 'sr'; live.setAttribute('role', 'status'); root.append(live);
  let liveTimer = 0;
  function say(text, delay = 0) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { live.textContent = live.textContent === text ? `${text}\u00a0` : text; }, delay);
  }
  document.documentElement.append(host);
  const node = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
  const animate = (el, frames, options) => motion && el.animate ? el.animate(frames, { easing: EASE, ...options }) : null;
  const valueOf = el => 'value' in el ? el.value : el.textContent;
  // Keep focus in the conversation field while the list is used with the mouse.
  panel.addEventListener('mousedown', e => { if (!filling) e.preventDefault(); });
  function close() {
    clearTimeout(noticeTimer);
    context = null; filling = false; matches = []; query = null; view = null;
    if (!open) return;
    open = false;
    const dy = side === 'below' ? -4 : 4; side = null;
    panel.classList.add('leaving');
    const anim = animate(panel, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${dy}px) scale(.98)` }], { duration: 130, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    if (!anim) { panel.hidden = true; panel.classList.remove('leaving'); return; }
    closing = anim;
    anim.onfinish = () => { if (closing !== anim) return; closing = null; panel.hidden = true; panel.classList.remove('leaving'); anim.cancel(); };
  }
  function editor(target) {
    if (!(target instanceof Element)) return null;
    const el = target.closest('textarea, input, [contenteditable]');
    if (!el || el.disabled || el.readOnly || el.closest('[contenteditable="false"]')) return null;
    if (el instanceof HTMLInputElement && !['text','search'].includes(el.type)) return null;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable ? el : null;
  }
  function snapshot(el) {
    if ('value' in el) {
      if (el.selectionStart !== el.selectionEnd) return null;
      return { el, text: el.value, caret: el.selectionStart };
    }
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.isCollapsed || !el.contains(sel.anchorNode)) return null;
    const range = sel.getRangeAt(0).cloneRange();
    const before = document.createRange(); before.selectNodeContents(el); before.setEnd(range.startContainer, range.startOffset);
    return { el, text: el.textContent, caret: before.toString().length, range };
  }
  function focusAt(ctx) {
    ctx.el.focus({ preventScroll: true });
    if ('value' in ctx.el) { ctx.el.setSelectionRange(ctx.caret, ctx.caret); return; }
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(ctx.range);
  }
  function place() {
    if (!context) return;
    const r = context.el.getBoundingClientRect();
    const width = Math.min(400, innerWidth - 24);
    host.style.left = `${Math.max(12, Math.min(r.left, innerWidth - width - 12))}px`;
    const above = r.top - 20, below = innerHeight - r.bottom - 20;
    // The side is chosen once per opening so the panel does not jump while the list is filtered.
    if (!side) side = above >= Math.min(panel.scrollHeight, 360) || above > below ? 'above' : 'below';
    const space = Math.max(160, side === 'above' ? above : below);
    panel.style.maxHeight = `${space}px`;
    panel.style.transformOrigin = side === 'above' ? 'bottom left' : 'top left';
    const limit = innerHeight - 12 - Math.min(panel.scrollHeight, space);
    // Anchoring by the bottom edge makes height changes grow away from the editor.
    if (side === 'above') { host.style.top = ''; host.style.bottom = `${Math.max(12, Math.min(innerHeight - r.top + 8, limit))}px`; }
    else { host.style.bottom = ''; host.style.top = `${Math.max(12, Math.min(r.bottom + 8, limit))}px`; }
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!open || !context) return;
      const r = context.el.getBoundingClientRect();
      // Never discard values typed in the variables form because the page scrolled.
      if (!filling && (!context.el.isConnected || r.bottom < 0 || r.top > innerHeight)) close(); else place();
    });
  }
  function show(children, mode) {
    clearTimeout(noticeTimer);
    const first = !open;
    if (closing) { closing.cancel(); closing = null; }
    open = true;
    const from = first ? 0 : panel.getBoundingClientRect().height;
    panel.classList.remove('leaving'); panel.replaceChildren(...children); panel.hidden = false;
    heightAnim?.cancel(); place();
    const to = panel.getBoundingClientRect().height;
    if (from && Math.abs(to - from) > 1) heightAnim = animate(panel, [{ height: `${from}px` }, { height: `${to}px` }], { duration: 220 });
    if (first) animate(panel, [{ opacity: 0, transform: `translateY(${side === 'above' ? 8 : -8}px) scale(.97)` }, { opacity: 1, transform: 'none' }], { duration: 230 });
    else if (mode === 'forward' || mode === 'back') animate(children[1], [{ opacity: 0, transform: `translateX(${mode === 'forward' ? 16 : -16}px)` }, { opacity: 1, transform: 'none' }], { duration: 240 });
    return first;
  }
  function highlight(tag, text, q) {
    const el = node(tag), needle = QR.normalize(q);
    let flat = ''; const map = [];
    if (needle) for (let i = 0; i < text.length; i++) { const n = QR.normalize(text[i]); flat += n; for (let k = 0; k < n.length; k++) map.push(i); }
    const at = needle ? flat.indexOf(needle) : -1;
    if (at < 0) { el.textContent = text; return el; }
    const start = map[at], end = map[at + needle.length - 1] + 1;
    el.append(text.slice(0, start), node('mark', text.slice(start, end)), text.slice(end));
    return el;
  }
  function hints(pairs) {
    const footer = node('footer');
    for (const [keys, label] of pairs) { const span = node('span'); keys.forEach(k => span.append(node('kbd', k))); span.append(label); footer.append(span); }
    return footer;
  }
  function select(i, scroll, instant) {
    if (!listEl) return;
    const items = listEl.querySelectorAll('.item');
    index = i;
    items.forEach((item, n) => item.setAttribute('aria-selected', String(n === i)));
    const item = items[i];
    cursorEl.hidden = !item;
    if (!item) return;
    if (instant) cursorEl.style.transition = 'none';
    cursorEl.style.transform = `translateY(${item.offsetTop}px)`; cursorEl.style.height = `${item.offsetHeight}px`;
    if (instant) { void cursorEl.offsetHeight; cursorEl.style.transition = ''; }
    if (!scroll) return;
    // Scroll the list itself; scrollIntoView would also scroll the conversation behind the panel.
    const behavior = instant || !motion ? 'auto' : 'smooth';
    const top = item.offsetTop - 6, bottom = item.offsetTop + item.offsetHeight + 6 - listEl.clientHeight;
    if (top < listEl.scrollTop) listEl.scrollTo({ top, behavior });
    else if (bottom > listEl.scrollTop) listEl.scrollTo({ top: bottom, behavior });
  }
  function renderList(mode = 'filter') {
    view = 'list';
    const count = Math.min(matches.length, LIMIT);
    const header = node('header');
    const countText = `${matches.length} ${matches.length === 1 ? 'resposta' : 'respostas'}`;
    header.append(node('span', 'QR', 'mark'), node('span', 'Respostas', 'title'), node('small', countText));
    say(matches.length ? countText : 'Nenhuma resposta', 600);
    listEl = node('div', '', 'list'); listEl.setAttribute('role', 'listbox'); listEl.setAttribute('aria-label', 'Respostas rápidas');
    cursorEl = node('div', '', 'cursor'); listEl.append(cursorEl);
    matches.slice(0, LIMIT).forEach((row, i) => {
      const button = node('button', '', 'item'); button.type = 'button'; button.tabIndex = -1; button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(i === index));
      button.append(highlight('code', `/${row.shortcut}`, query), highlight('strong', row.title, query), node('span', row.category, 'cat'), node('span', '↵ inserir', 'enter'), node('p', row.body.slice(0, 160).replace(/\s+/g, ' ')));
      // Hover follows the mouse only when it really moves, not when the list scrolls under it.
      button.addEventListener('pointermove', () => { if (pointerMoved && index !== i) select(i, false); });
      button.addEventListener('click', () => choose(row));
      listEl.append(button);
    });
    if (matches.length > LIMIT) listEl.append(node('div', `+${matches.length - LIMIT} respostas. Continue digitando para filtrar.`, 'more'));
    if (!matches.length) listEl.append(node('div', `Nenhuma resposta para “/${query}”. Continue digitando ou pressione Esc.`, 'empty'));
    const footer = hints([[['↑', '↓'], 'navegar'], [['↵'], 'ou Tab inserir'], [['Esc'], 'fechar']]);
    const first = show([header, listEl, footer], mode);
    select(Math.min(index, Math.max(count - 1, 0)), mode === 'back', true);
    if (!first) return;
    animate(cursorEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 40, fill: 'backwards' });
    [...listEl.querySelectorAll('.item')].slice(0, 8).forEach((el, n) => animate(el, [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: 40 + n * 22, fill: 'backwards' }));
  }
  function refresh(event) {
    // Page scripts can dispatch synthetic events; only real user input may open the menu or insert replies.
    if (composing || filling || !event.isTrusted) return;
    const el = editor(event.target);
    if (!el) { close(); return; }
    const snap = snapshot(el);
    const token = snap && QR.token(snap.text, snap.caret);
    if (!token) { close(); return; }
    const same = open && view === 'list' && context?.el === el && token.query === query;
    context = { ...snap, token };
    if (same) { place(); return; }
    const next = QR.search(library, token.query);
    // Show "no results" only while already open, so a stray slash never pops an empty panel.
    if (!next.length && !open) { close(); return; }
    query = token.query; matches = next; index = 0;
    renderList(open && view === 'list' ? 'filter' : 'open');
  }
  function fail(message) {
    view = 'notice'; filling = false;
    const header = node('header'); header.append(node('span', 'QR', 'mark'), node('span', 'Respostas', 'title'));
    show([header, node('div', message, 'notice')], 'forward'); say(message);
    noticeTimer = setTimeout(close, 5000);
  }
  function insert(text) {
    const ctx = context;
    if (!ctx || !ctx.el.isConnected || valueOf(ctx.el) !== ctx.text) {
      fail('O campo mudou. Feche com Esc e escolha a resposta novamente.'); return;
    }
    const el = ctx.el;
    el.focus();
    if ('value' in el) {
      const setter = Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
      const value = ctx.text.slice(0, ctx.token.start) + text + ctx.text.slice(ctx.token.end);
      setter.call(el, value);
      el.setSelectionRange(ctx.token.start + text.length, ctx.token.start + text.length);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText', data: text }));
      close(); say('Resposta inserida. Revise antes de enviar.');
      return;
    }
    // Select only the slash token, preserving formatting and all surrounding text.
    const range = ctx.range.cloneRange();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n, offset = 0, startNode = null, startOffset = 0;
    while ((n = walker.nextNode())) {
      if (offset + n.length >= ctx.token.start) { startNode = n; startOffset = ctx.token.start - offset; break; }
      offset += n.length;
    }
    if (!startNode) { fail('Não foi possível selecionar o atalho neste editor. Use Copiar na extensão.'); return; }
    range.setStart(startNode, startOffset);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    filling = true;
    // Native editing retains undo support and emits input for rich text frameworks.
    const ok = document.execCommand('insertText', false, text);
    filling = false;
    if (!ok) { fail('Este editor não aceitou a inserção. Use Copiar na extensão e cole na conversa.'); return; }
    close(); say('Resposta inserida. Revise antes de enviar.');
  }
  function back() {
    const ctx = context;
    filling = false;
    if (!ctx || !ctx.el.isConnected || valueOf(ctx.el) !== ctx.text) { close(); ctx?.el.focus(); return; }
    focusAt(ctx);
    renderList('back');
  }
  function choose(row) {
    // Fixed variables and the automatic ones (greeting, date, time) are filled silently; the form asks only for what is left.
    const values = QR.known(fixed), names = QR.missing(row.body, values);
    if (!names.length) { insert(QR.fill(row.body, values)); return; }
    filling = true; view = 'form';
    const header = node('header'), backButton = node('button', '‹', 'back');
    backButton.type = 'button'; backButton.setAttribute('aria-label', 'Voltar para a lista'); backButton.addEventListener('click', back);
    header.append(backButton, node('span', row.title, 'title'), node('small', `/${row.shortcut}`));
    const form = node('form'), fields = new Map();
    names.forEach(name => {
      const label = node('label'), input = node('input');
      input.required = true; input.autocomplete = 'off'; input.spellcheck = false;
      label.append(node('span', name), input); form.append(label); fields.set(name, input);
    });
    const preview = node('div', '', 'preview'), chips = [];
    // Chrome makes scroll containers focusable; keep Tab going from the last field to the button.
    preview.setAttribute('aria-label', 'Prévia da mensagem'); preview.tabIndex = -1;
    let last = 0;
    for (const m of row.body.matchAll(VAR)) {
      const chip = node('span', '', 'var'); chip.dataset.name = m[1];
      preview.append(row.body.slice(last, m.index), chip); chips.push(chip); last = m.index + m[0].length;
    }
    preview.append(row.body.slice(last));
    const sync = () => chips.forEach(chip => { const name = chip.dataset.name, value = fields.has(name) ? fields.get(name).value : values[name]; chip.textContent = value || `{{${name}}}`; chip.classList.toggle('filled', !!value); });
    const typed = () => Object.fromEntries([...fields].map(([name, input]) => [name, input.value]));
    form.addEventListener('input', sync);
    form.addEventListener('focusin', e => {
      const name = [...fields].find(([, input]) => input === e.target)?.[0];
      chips.forEach(chip => chip.classList.toggle('active', chip.dataset.name === name));
      const chip = chips.find(c => c.dataset.name === name);
      if (chip && (chip.offsetTop < preview.scrollTop || chip.offsetTop + chip.offsetHeight > preview.scrollTop + preview.clientHeight)) preview.scrollTo({ top: chip.offsetTop - 24, behavior: motion ? 'smooth' : 'auto' });
    });
    form.addEventListener('focusout', () => chips.forEach(chip => chip.classList.remove('active')));
    // Enter walks through the empty fields and inserts once everything is filled.
    form.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !(e.target instanceof HTMLInputElement)) return;
      e.preventDefault();
      const inputs = [...fields.values()], at = inputs.indexOf(e.target);
      const next = e.target.value && [...inputs.slice(at + 1), ...inputs.slice(0, at)].find(input => !input.value);
      if (next) next.focus(); else form.requestSubmit();
    });
    const submit = node('button', 'Inserir resposta', 'primary'); submit.type = 'submit'; submit.append(node('kbd', '↵'));
    const cancel = node('button', 'Voltar', 'ghost'); cancel.type = 'button'; cancel.addEventListener('click', back);
    const actions = node('div', '', 'actions'); actions.append(submit, cancel);
    form.append(preview, actions);
    form.addEventListener('submit', e => { e.preventDefault(); insert(QR.fill(row.body, { ...values, ...typed() })); });
    sync();
    show([header, form, hints([[['↵'], 'próximo campo'], [['Esc'], 'voltar']])], 'forward');
    fields.values().next().value.focus({ preventScroll: true });
  }
  document.addEventListener('input', refresh, true);
  document.addEventListener('click', e => { if (!e.composedPath().includes(host)) refresh(e); }, true);
  document.addEventListener('focusout', () => { setTimeout(() => { if (!filling && document.activeElement !== host && !editor(document.activeElement)) close(); }, 0); }, true);
  document.addEventListener('compositionstart', () => { composing = true; close(); }, true);
  document.addEventListener('compositionend', e => { composing = false; refresh(e); }, true);
  document.addEventListener('keydown', e => {
    if (!open || !e.isTrusted) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (view === 'form') { back(); return; }
      const ctx = context, inside = e.composedPath().includes(host);
      close(); if (inside && ctx) focusAt(ctx);
      return;
    }
    if (view !== 'list' || !matches.length || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.target !== context?.el && !context?.el.contains(e.target)) return;
    const step = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 }[e.key];
    if (!step && e.key !== 'Enter' && e.key !== 'Tab') return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!step) { choose(matches[index]); return; }
    const count = Math.min(matches.length, LIMIT);
    select(Math.abs(step) === 1 ? (index + step + count) % count : Math.max(0, Math.min(count - 1, index + step)), true, e.repeat);
  }, true);
  document.addEventListener('keyup', e => { if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) refresh(e); }, true);
  window.addEventListener('pointermove', e => { const at = `${e.clientX},${e.clientY}`; pointerMoved = at !== pointer; pointer = at; }, true);
  // New messages scroll the conversation; follow the editor instead of closing the menu.
  window.addEventListener('scroll', () => { if (open) schedule(); }, true);
  window.addEventListener('resize', () => { if (open) schedule(); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.library) QR.load().then(rows => { library = rows; close(); }).catch(() => { library = []; close(); });
    if (changes.variables) QR.loadVariables().then(v => { fixed = v; }).catch(() => { fixed = {}; });
  });
  QR.load().then(rows => { library = rows; }).catch(() => { library = []; });
  QR.loadVariables().then(v => { fixed = v; }).catch(() => { fixed = {}; });
})();
