import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "aura-quotes-premium-decision-experience-002.spec.mjs",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["line"]],
  outputDir: "../test-results/aura-quotes-premium-decision-experience-002-playwright",
  use: {
    baseURL: "http://127.0.0.1:4182",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 4182 --bind 127.0.0.1",
    url: "http://127.0.0.1:4182/tests/fixtures/aura-quotes-premium-decision-experience-002.html",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});