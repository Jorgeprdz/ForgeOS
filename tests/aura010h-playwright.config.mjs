import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'forge-beta2-canonical-aura-cutover-010h.spec.mjs',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['line']],
  outputDir: '../test-results/forge-beta2-canonical-aura-cutover-010h',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    // Playwright resolves webServer.command from this config directory (tests/).
    // The Pages artifact is downloaded at repository-root/_site.
    command: 'python3 -m http.server 4174 --directory ../_site',
    url: 'http://127.0.0.1:4174/index.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
