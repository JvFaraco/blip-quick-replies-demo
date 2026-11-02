// The menu reads this attribute on the test page to show what each site would list.
document.getElementById('simulate').addEventListener('change', e => {
  document.documentElement.dataset.site = e.target.value;
  document.getElementById('plain').focus();
});
