import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /forge-commercial-compass-015r-public\.spec\.mjs/,
  timeout: 45_000,
  retries: 0,
  workers: 1,
  reporter: [['line'], ['json', { outputFile: 'artifacts/forge-commercial-compass-015r-public.json' }]],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure', serviceWorkers: 'block' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'dex', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
  ],
  outputDir: 'artifacts/forge-commercial-compass-015r-public-results',
});
