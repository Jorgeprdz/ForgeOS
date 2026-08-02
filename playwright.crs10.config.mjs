import { defineConfig } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /crs-10-relationship-intelligence-visual\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["line"],
    ["json", { outputFile: "artifacts/crs10-playwright-results.json" }],
  ],
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  webServer: {
    command: "npm run serve:e2e",
    url: `${baseURL}/tests/e2e/fixtures/crs10-relationship-intelligence/index.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  outputDir: "artifacts/crs10-playwright-test-results",
});
