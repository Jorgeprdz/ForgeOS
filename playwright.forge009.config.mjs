import { defineConfig } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /forge-full-commercial-loop-acceptance-009\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["line"],
    ["json", { outputFile: "artifacts/forge009/playwright-results.json" }],
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
    url: `${baseURL}/tests/e2e/fixtures/forge-full-commercial-loop-009/index.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  outputDir: "artifacts/forge009/test-results",
});
