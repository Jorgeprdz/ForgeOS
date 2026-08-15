import { defineConfig, devices } from '@playwright/test';

const runId = String(process.env.GITHUB_RUN_ID || '').trim();
const runAttempt = String(process.env.GITHUB_RUN_ATTEMPT || '').trim();
if (runId && runAttempt) process.env.GITHUB_RUN_ID = `${runId}-attempt-${runAttempt}`;

const port = 4173;
const baseURL = process.env.FORGE_CARTERA_002C_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /(forge-commercial-pilot-017e-real-acceptance|cartera-real-user-dex-closure-002c-geometry)\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 150_000,
  expect: { timeout: 12_000 },
  reporter: [
    ['line'],
    ['html', { outputFolder: 'artifacts/cartera-002c-playwright-report', open: 'never' }],
    ['json', { outputFile: 'artifacts/cartera-002c-playwright-results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1`,
    url: `${baseURL}/docs/static-preview/forge-alive-material3/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium-desktop-002c',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'chromium-dex-002c',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'chromium-mobile-002c',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  outputDir: 'artifacts/cartera-002c-playwright-test-results',
});
