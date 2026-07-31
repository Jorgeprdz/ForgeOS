import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = process.env.FORGE_E2E_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /cartera-010c-remote-browser\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['line'],
    ['html', {
      outputFolder: 'artifacts/cartera-010c-playwright-report',
      open: 'never',
    }],
    ['json', {
      outputFile: 'artifacts/cartera-010c-playwright-results.json',
    }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run serve:e2e',
    url: `${baseURL}/tests/e2e/fixtures/cartera-010c/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Galaxy S9+'] },
    },
  ],
  outputDir: 'artifacts/cartera-010c-playwright-test-results',
});
