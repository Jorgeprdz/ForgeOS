import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /advisor-os-1\.0-release-public\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['line']],
  use: {
    ...devices['Pixel 7'],
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,
  },
  outputDir: 'artifacts/advisor-os-1.0-release',
});
