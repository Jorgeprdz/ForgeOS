import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'forge-beta2-post-release-productive-recovery-010i.spec.mjs',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['line']],
  outputDir: '../test-results/forge-beta2-post-release-productive-recovery-010i',
  use: {
    baseURL: 'http://127.0.0.1:4178',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4178 --directory ..',
    url: 'http://127.0.0.1:4178/tests/fixtures/forge-beta2-post-release-productive-recovery-010i.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
