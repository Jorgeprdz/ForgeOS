import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "cartera-001c-prospect-detail-projection.spec.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  outputDir: "artifacts/cartera001c-playwright-results",
  reporter: [
    ["line"],
    ["html", { outputFolder: "artifacts/cartera001c-playwright-report", open: "never" }],
  ],
  use: {
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
