(() => {
  // The user's choice wins. Without one, the pages follow the system theme, also when it changes.
  const key = 'quick-replies-theme', root = document.documentElement, system = matchMedia('(prefers-color-scheme: light)');
  const saved = () => { try { const t = localStorage.getItem(key); return t === 'light' || t === 'dark' ? t : null; } catch { return null; } };
  function apply(theme) {
    root.dataset.theme = theme;
    const button = document.getElementById('theme');
    if (button) {
      button.textContent = theme === 'dark' ? '☀ Tema claro' : '☾ Tema escuro';
      button.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
  }
  // Cross-fades the whole page. Element transitions pause meanwhile (portal.css), so nothing stops halfway between themes.
  function swap(theme) {
    root.classList.add('theme-switching');
    const done = () => root.classList.remove('theme-switching');
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => apply(theme)).finished.finally(done);
    } else { apply(theme); requestAnimationFrame(() => requestAnimationFrame(done)); }
  }
  apply(saved() || (system.matches ? 'light' : 'dark'));
  system.addEventListener('change', e => { if (!saved()) swap(e.matches ? 'light' : 'dark'); });
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.getElementById('theme')?.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, theme); } catch {}
      swap(theme);
    });
  });
})();
