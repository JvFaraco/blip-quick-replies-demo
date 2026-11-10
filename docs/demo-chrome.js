// Stand-in for the chrome.* APIs the content script uses, so the real content.js runs on a plain web page.
// Storage lives in memory: nothing is saved or sent anywhere. Loaded before core.js, which captures chrome.storage.local.
(() => {
  const data = {}, listeners = [];
  const notify = changes => listeners.forEach(fn => fn(changes, 'local'));
  globalThis.chrome = {
    storage: {
      local: {
        async get(key) { return key in data ? { [key]: structuredClone(data[key]) } : {}; },
        async set(values) { Object.assign(data, structuredClone(values)); notify(Object.fromEntries(Object.keys(values).map(k => [k, { newValue: values[k] }]))); },
        async remove(key) { delete data[key]; notify({ [key]: {} }); }
      },
      onChanged: { addListener(fn) { listeners.push(fn); } }
    }
  };
})();
