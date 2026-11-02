(() => {
  const key = 'quick-replies-theme';
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.getElementById('theme');
    if (button) {
      button.textContent = theme === 'dark' ? '☀ Tema claro' : '☾ Tema escuro';
      button.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    }
  }
  let initial = 'dark';
  try { initial = localStorage.getItem(key) === 'light' ? 'light' : 'dark'; } catch {}
  apply(initial);
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.getElementById('theme')?.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, theme); } catch {}
      apply(theme);
    });
  });
})();
