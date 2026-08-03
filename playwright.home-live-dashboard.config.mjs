import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4186";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /home-live-dashboard\.spec\.mjs/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [["line"]],
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "dark",
    locale: "es-MX",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "home-live-dashboard-chromium" }],
  webServer: {
    command: "npx vite --host 0.0.0.0 --port 4186 --strictPort",
    url: `${baseURL}/tests/e2e/fixtures/home-live-dashboard/index.html`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  outputDir: "artifacts/home-live-dashboard/test-results",
});
