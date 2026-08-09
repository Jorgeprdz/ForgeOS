import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'aura-cartera-pdf-ingress-parity.spec.mjs',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['line']],
  outputDir: '../test-results/aura-cartera-pdf-ingress-parity',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'cd .. && python3 -m http.server 4175 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4175/tests/fixtures/aura-cartera-pdf-ingress-parity.html',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
