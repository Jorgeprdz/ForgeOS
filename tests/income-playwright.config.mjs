import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "income-aura-ux-reconciliation.spec.mjs",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results/aura-income-productive",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 4174 --bind 127.0.0.1 --directory ..",
    url: "http://127.0.0.1:4174/tests/fixtures/aura-income-visual.html",
    reuseExistingServer: false,
    timeout: 15_000,
  },
});