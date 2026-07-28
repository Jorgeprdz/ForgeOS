import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.FORGE_E2E_BASE_URL ||
  "http://127.0.0.1:4175";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /fes-08c-governed-preview\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  reporter: [
    ["line"],
    ["html", {
      outputFolder: "artifacts/fes08c-preview-html-report",
      open: "never",
    }],
    ["json", {
      outputFile: "artifacts/fes08c-preview-results.json",
    }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  }],
  outputDir: "artifacts/fes08c-preview-test-results",
});
