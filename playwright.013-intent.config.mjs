import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = process.env.FORGE_E2E_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /forge-beta2-013-(intent-workspace|pipeline-context)\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [
    ['line'],
    ['json', { outputFile: 'artifacts/forge-beta2-013-intent-playwright.json' }],
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
    url: `${baseURL}/tests/e2e/fixtures/forge-beta2-013-intent/index.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
  outputDir: 'artifacts/forge-beta2-013-intent-results',
});
