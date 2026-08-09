import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'aura-cartera-person-workspace-016.spec.mjs',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['line']],
  outputDir: '../test-results/aura-cartera-person-016-traces',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'cd .. && python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/tests/fixtures/aura-cartera-person-workspace-016.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
