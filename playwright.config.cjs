module.exports = { testDir: './tests', testMatch: '**/*.spec.cjs', workers: 1, use: { channel: process.env.PW_CHANNEL || 'chrome', headless: true, viewport: { width: 1440, height: 1000 } } };
