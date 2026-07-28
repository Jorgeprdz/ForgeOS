import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4175";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "ui-m03-clean-home-rewrite.spec.mjs",
  timeout: 300_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ["line"],
    ["html", {
      outputFolder:
        "artifacts/ui-m03-clean/playwright-report",
      open: "never",
    }],
  ],
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "dark",
    locale: "es-MX",
    reducedMotion: "no-preference",
    screenshot: "off",
    trace: "retain-on-failure",
  },
  projects: [{ name: "authoritative-linux-chromium" }],
  outputDir: "artifacts/ui-m03-clean/test-results",
  webServer: {
    command:
      "node scripts/serve-ui-m03-clean-home.mjs",
    url:
      `${baseURL}/docs/static-preview/`
      + "forge-alive-material3/",
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
