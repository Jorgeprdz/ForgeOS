import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /forge-beta2-real-production-contract-recovery-010j\.spec\.mjs/,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4179',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'python3 -m http.server 4179 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4179',
    cwd: '..',
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
