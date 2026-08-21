import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /pr150-postmerge-public-demo\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 150_000,
  expect: {
    timeout: 30_000,
  },
  reporter: [["line"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium-public",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  outputDir: "artifacts/pr150-postmerge-public-demo-test-results",
});
