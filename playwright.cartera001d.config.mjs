import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "cartera-001d-vertical-continuity.spec.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 40_000,
  expect: { timeout: 10_000 },
  outputDir: "artifacts/cartera001d-playwright-results",
  reporter: [
    ["line"],
    ["html", { outputFolder: "artifacts/cartera001d-playwright-report", open: "never" }],
  ],
  use: {
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
