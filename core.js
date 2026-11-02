(() => {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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
  const variables = body => [...new Set([...body.matchAll(/\{\{\s*([^{}\n]+?)\s*\}\}/g)].map(m => m[1]))];
  const fill = (body, values) => body.replace(/\{\{\s*([^{}\n]+?)\s*\}\}/g, (all, name) => values[name] ?? all);
  globalThis.QR = { normalize, validate, search, token, variables, fill,
    async load() { const { library } = await chrome.storage.local.get('library'); return library === undefined ? structuredClone(QR_DEFAULTS) : validate(library); },
    async save(rows) { const library = validate(rows); await chrome.storage.local.set({ library }); return library; }
  };
})();
