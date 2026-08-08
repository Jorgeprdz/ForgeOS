import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'aura-cartera-pdf-spanish-date-regression.spec.mjs',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['line']],
  outputDir: '../test-results/aura-cartera-pdf-regression',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'cd .. && python3 -m http.server 4174 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4174/tests/fixtures/aura-cartera-pdf-spanish-date-regression.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
