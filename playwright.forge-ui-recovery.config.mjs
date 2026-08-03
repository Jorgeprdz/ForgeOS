import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4184';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /forge-ui-recovery\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 300_000,
  expect: { timeout: 8_000 },
  reporter: [['line']],
  use: {
    baseURL,
    browserName: 'chromium',
    colorScheme: 'dark',
    locale: 'es-MX',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'forge-ui-recovery-chromium' }],
  webServer: {
    command: 'npx http-server . -p 4184 -c-1',
    url: `${baseURL}/tests/e2e/fixtures/forge-ui-recovery/index.html`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  outputDir: 'artifacts/forge-ui-recovery/test-results',
});
