// Keeps the content script registered on every remembered site and the team sheet in sync.
importScripts('catalogo.js', 'core.js');
// One sync at a time: granting a permission and saving the site fire two syncs, and an older run
// finishing last would re-register the list without the new site.
let syncing = Promise.resolve();
const sync = () => (syncing = syncing.then(() => QR.syncSites()).catch(() => {}));
const team = () => QR.syncTeam().catch(() => {});
chrome.runtime.onInstalled.addListener(({ reason }) => {
  sync(); team();
  chrome.alarms.create('team', { periodInMinutes: 30 });
  if (reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('biblioteca.html?bemvindo') });
});
chrome.runtime.onStartup.addListener(() => { sync(); team(); chrome.alarms.create('team', { periodInMinutes: 30 }); });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'team') team(); });
chrome.permissions.onRemoved.addListener(sync);
chrome.permissions.onAdded.addListener(sync);
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.sites) sync(); });
