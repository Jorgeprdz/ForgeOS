import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = process.env.FORGE_E2E_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /advisor-os-sprint-11\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 35_000,
  expect: { timeout: 8_000 },
  reporter: [['line']],
  use: {
    baseURL,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 834, height: 1112 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
        userAgent: 'ForgeOS Sprint 11 Tablet Acceptance',
      },
    },
    {
      name: 'desktop',
      use: {
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
  ],
  webServer: {
    command: 'npm run serve:e2e',
    url: `${baseURL}/tests/e2e/fixtures/advisor-os-sprint-11/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  outputDir: 'artifacts/advisor-os-sprint-11',
});
