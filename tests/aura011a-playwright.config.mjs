import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /forge-aura-conversation-cartera-011a\.spec\.mjs/,
  timeout: 40_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: 0,
  maxFailures: 1,
  use: {
    baseURL: 'http://127.0.0.1:4181',
    browserName: 'chromium',
    headless: true,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4181 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4181',
    cwd: '..',
    reuseExistingServer: false,
    timeout: 20_000,
  },
  outputDir: 'artifacts/011a/playwright-results',
});
