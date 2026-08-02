import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL =
  process.env.FORGE_E2E_BASE_URL ||
  `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /(segubeca-progressive-layout|m05e006-responsiveness)\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ["line"],
    [
      "html",
      {
        outputFolder: "artifacts/segubeca-layout-print-report",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile: "artifacts/segubeca-layout-print-results.json",
      },
    ],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  webServer: {
    command: "npm run serve:e2e",
    url: `${baseURL}/tests/e2e/fixtures/segubeca-progressive-layout/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  outputDir: "artifacts/segubeca-layout-print-test-results",
});
