// Keeps the content script registered on every remembered site. Runs on install, on browser start and whenever the list changes.
importScripts('catalogo.js', 'core.js');
const sync = () => QR.syncSites().catch(() => {});
chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
chrome.permissions.onRemoved.addListener(sync);
chrome.permissions.onAdded.addListener(sync);
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.sites) sync(); });
