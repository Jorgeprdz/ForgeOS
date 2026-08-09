import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'aura-cartera-020c-durable-confirmation-015.spec.mjs',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    baseURL: 'http://127.0.0.1:4176',
  },
  webServer: {
    command: 'python3 -m http.server 4176 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:4176/tests/fixtures/aura-cartera-020c-durable-confirmation-015.html',
    timeout: 15_000,
    reuseExistingServer: false,
  },
});