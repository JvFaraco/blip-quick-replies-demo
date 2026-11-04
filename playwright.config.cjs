// PW_CHANNEL=chrome (default) or msedge uses the installed browser; PW_CHANNEL=chromium uses Playwright's own build (CI).
const channel = process.env.PW_CHANNEL || 'chrome';
module.exports = { testDir: './tests', testMatch: '**/*.spec.cjs', workers: 1, use: { ...(channel === 'chromium' ? {} : { channel }), headless: true, viewport: { width: 1440, height: 1000 } } };
