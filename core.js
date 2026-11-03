(() => {
  const VAR = /\{\{\s*([^{}\n]+?)\s*\}\}/g;
  const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function validate(rows) {
    if (!Array.isArray(rows) || rows.length > 500) throw Error('A biblioteca deve conter uma lista de até 500 respostas.');
    const seen = new Set();
    return rows.map(row => {
      if (!row || typeof row !== 'object') throw Error('Resposta inválida.');
      const clean = {};
      for (const key of ['shortcut', 'title', 'category', 'body']) {
        if (typeof row[key] !== 'string') throw Error(`Campo inválido: ${key}.`);
        clean[key] = row[key].trim();
      }
      clean.shortcut = clean.shortcut.replace(/^\//, '').toLowerCase();
      if (!/^[a-z0-9_-]{1,40}$/.test(clean.shortcut)) throw Error('Use de 1 a 40 letras sem acento, números, _ ou - no atalho.');
      if (seen.has(clean.shortcut)) throw Error(`Atalho duplicado: /${clean.shortcut}.`);
      seen.add(clean.shortcut);
      if (!clean.title || clean.title.length > 120 || !clean.category || clean.category.length > 80 || !clean.body || clean.body.length > 20000) throw Error('Preencha título (até 120 caracteres), categoria (até 80) e mensagem (até 20 mil).');
      return clean;
    });
  }
  function search(rows, query) {
    const q = normalize(query.replace(/^\//, '').trim());
    return rows.filter(r => normalize(`${r.shortcut} ${r.title} ${r.category} ${r.body}`).includes(q))
      .sort((a,b) => Number(b.shortcut === q) - Number(a.shortcut === q) || Number(b.shortcut.startsWith(q)) - Number(a.shortcut.startsWith(q)) || a.title.localeCompare(b.title, 'pt-BR'));
  }
  function token(text, caret) {
    const before = text.slice(0, caret);
    const m = before.match(/(?:^|\s)(\/([a-zA-Z0-9_-]{0,40}))$/);
    return m ? { start: caret - m[1].length, end: caret, query: m[2] } : null;
  }
  const variables = body => [...new Set([...body.matchAll(VAR)].map(m => m[1]))];
  const fill = (body, values) => body.replace(VAR, (all, name) => values[name] ?? all);
  // Merge keeps the user's own replies and only adds shortcuts that do not exist yet.
  function merge(current, incoming) {
    const have = new Set(current.map(r => r.shortcut)), skipped = [];
    const rows = [...current];
    for (const row of validate(incoming)) { if (have.has(row.shortcut)) skipped.push(row.shortcut); else { rows.push(row); have.add(row.shortcut); } }
    return { rows: validate(rows), skipped };
  }

  // Automatic values: greeting by local hour, date and time. Fixed variables saved by the user win over them.
  const pad = n => String(n).padStart(2, '0');
  function automatic(now = new Date()) {
    const h = now.getHours();
    return { saudacao: h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite', data: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`, hora: `${pad(h)}:${pad(now.getMinutes())}` };
  }
  function validateVariables(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw Error('Variáveis inválidas.');
    const entries = Object.entries(obj);
    if (entries.length > 50) throw Error('Use no máximo 50 variáveis fixas.');
    const clean = {};
    for (const [rawName, rawValue] of entries) {
      const name = String(rawName).trim();
      if (!name || name.length > 40 || /[{}\n]/.test(name)) throw Error('O nome da variável deve ter até 40 caracteres, sem chaves.');
      if (typeof rawValue !== 'string' || rawValue.trim().length > 500) throw Error(`O valor de {{${name}}} deve ter até 500 caracteres.`);
      clean[name] = rawValue.trim();
    }
    return clean;
  }
  const known = (fixed = {}, now) => { const values = { ...automatic(now) }; for (const [k, v] of Object.entries(fixed)) if (v) values[k] = v; return values; };
  const missing = (body, values) => variables(body).filter(name => !values[name]);

  // Sites where the menu is injected automatically. Remembered when the user activates the extension in a tab.
  function sitePattern(url) {
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol) || !u.hostname) return null;
      return `${u.protocol}//${u.host}/*`;
    } catch { return null; }
  }
  const validateSites = list => [...new Set((Array.isArray(list) ? list : []).filter(s => typeof s === 'string' && /^https?:\/\/[^/]+\/\*$/.test(s)))].slice(0, 100);

  // CSV: ; or , as separator, quoted fields with embedded quotes and line breaks, headers in Portuguese or English.
  const HEADERS = { shortcut: ['atalho', 'shortcut', 'comando'], title: ['titulo', 'title', 'nome'], category: ['categoria', 'category', 'grupo', 'assunto'], body: ['mensagem', 'body', 'texto', 'resposta', 'conteudo'] };
  function parseCSV(text) {
    let src = text.replace(/^﻿/, '');
    const pinned = src.match(/^sep=(.)\r?\n/i);
    if (pinned) src = src.slice(pinned[0].length);
    const firstLine = src.split(/\r?\n/, 1)[0];
    const sep = pinned ? pinned[1] : (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
    const rows = [[]]; let field = '', quoted = false;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (quoted) {
        if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
        else field += c;
      } else if (c === '"') quoted = true;
      else if (c === sep) { rows.at(-1).push(field); field = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; rows.at(-1).push(field); field = ''; rows.push([]); }
      else field += c;
    }
    rows.at(-1).push(field);
    const table = rows.filter(r => r.some(v => v.trim()));
    if (table.length < 2) throw Error('O CSV precisa de um cabeçalho e ao menos uma linha.');
    const header = table[0].map(h => normalize(h.trim()));
    const at = {};
    for (const [key, names] of Object.entries(HEADERS)) {
      at[key] = header.findIndex(h => names.includes(h));
      if (at[key] < 0) throw Error(`Falta a coluna "${names[0]}" no cabeçalho do CSV.`);
    }
    return validate(table.slice(1).map(r => ({ shortcut: r[at.shortcut] ?? '', title: unquote(r[at.title] ?? ''), category: unquote(r[at.category] ?? ''), body: unquote(r[at.body] ?? '') })));
  }
  // A value starting with = + - @ would run as a formula when the CSV is opened in a spreadsheet. The quote prefix neutralizes it
  // and parseCSV removes it again. A spreadsheet reading with the wrong separator can also start a cell after any , ; tab or line
  // break inside a value, so triggers in those positions get the same treatment (the sep= line alone is not enough: Excel ignores it after a BOM).
  // Lookahead, so consecutive delimiters are each checked; whitespace here excludes tab and line breaks because those are delimiters themselves.
  const TRIGGER = "(?='*[^\\S\\t\\r\\n]*[=+\\-@\\t\\r])";
  const AT_CELL = new RegExp(`(^|[,;\\t\\r\\n])${TRIGGER}`, 'g'), AT_CELL_QUOTED = new RegExp(`(^|[,;\\t\\r\\n])'${TRIGGER}`, 'g');
  const neutralize = v => v.replace(AT_CELL, "$1'");
  const unquote = v => v.replace(AT_CELL_QUOTED, '$1');
  const cell = raw => { const v = neutralize(raw); return /[",;\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const toCSV = rows => ['sep=;', 'atalho;titulo;categoria;mensagem', ...rows.map(r => [r.shortcut, r.title, r.category, r.body].map(cell).join(';'))].join('\n') + '\n';

  const store = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : null;
  globalThis.QR = { normalize, validate, search, token, variables, fill, merge, automatic, validateVariables, known, missing, sitePattern, validateSites, parseCSV, toCSV,
    DEFAULT_SITES: ['https://*.blip.ai/*'],
    async load() { const { library } = await store.get('library'); return library === undefined ? structuredClone(QR_DEFAULTS) : validate(library); },
    async save(rows) { const library = validate(rows); await store.set({ library }); return library; },
    async loadVariables() { const { variables } = await store.get('variables'); return variables ? validateVariables(variables) : {}; },
    async saveVariables(obj) { const variables = validateVariables(obj); await store.set({ variables }); return variables; },
    async loadSites() { const { sites } = await store.get('sites'); return sites === undefined ? [...QR.DEFAULT_SITES] : validateSites(sites); },
    async saveSites(list) { const sites = validateSites(list); await store.set({ sites }); return sites; },
    // Registers the content script on every remembered site the extension has permission for (extension pages and the service worker only).
    async syncSites() {
      const sites = await QR.loadSites(), matches = [];
      for (const site of sites) { try { if (await chrome.permissions.contains({ origins: [site] })) matches.push(site); } catch {} }
      await chrome.scripting.unregisterContentScripts({ ids: ['quick-replies'] }).catch(() => {});
      if (matches.length) await chrome.scripting.registerContentScripts([{ id: 'quick-replies', matches, js: ['catalogo.js', 'core.js', 'content.js'], allFrames: true, runAt: 'document_idle', persistAcrossSessions: true }]);
      return matches;
    }
  };
})();
