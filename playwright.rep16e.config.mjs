import {
  defineConfig,
  devices,
} from "@playwright/test";

const runId = String(process.env.GITHUB_RUN_ID || '').trim();
const runAttempt = String(process.env.GITHUB_RUN_ATTEMPT || '').trim();
if (runId && runAttempt) process.env.GITHUB_RUN_ID = `${runId}-attempt-${runAttempt}`;

const port = 4173;
const baseURL =
  process.env.FORGE_REP16E_BASE_URL ||
  `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /(rep-16e-activity-browser|forge-commercial-pilot-017e-authenticated|forge-commercial-pilot-017e-r2|forge-commercial-pilot-017e-real-acceptance)\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  reporter: [
    ["line"],
    [
      "html",
      {
        outputFolder: "artifacts/rep16e-playwright-report",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile: "artifacts/rep16e-playwright-results.json",
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
    command: `python3 -m http.server ${port} --bind 127.0.0.1`,
    url: `${baseURL}/docs/static-preview/forge-alive-material3/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-dex",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Galaxy S9+"],
      },
    },
  ],
  outputDir: "artifacts/rep16e-playwright-test-results",
});