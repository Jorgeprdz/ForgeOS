import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = process.env.FORGE_E2E_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /forge-beta2-013-ru11-home-presentation\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [['line']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    serviceWorkers: 'allow',
  },
  webServer: {
    command: 'npm run serve:e2e',
    url: `${baseURL}/tests/e2e/fixtures/forge-beta2-013-ru11-home/index.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
  outputDir: 'artifacts/forge-beta2-013-ru11-results',
});
