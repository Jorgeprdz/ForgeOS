import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4174";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "forge-demo-mode.spec.mjs",
  timeout: 120_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["line"]],
  use: { baseURL, browserName: "chromium", serviceWorkers: "block", trace: "retain-on-failure" },
  projects: [{ name: "forge-demo-mode-chromium" }],
  outputDir: "artifacts/forge-demo-mode/test-results",
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 4174 --strictPort",
    url: `${baseURL}/docs/static-preview/forge-alive-material3/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
