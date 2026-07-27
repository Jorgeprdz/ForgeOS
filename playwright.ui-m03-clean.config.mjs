import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4175";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "ui-m03-clean-home-rewrite.spec.mjs",
  timeout: 45_000,
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
    reducedMotion: "reduce",
    screenshot: "off",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-390x844",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet-1280x800",
      use: {
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: true,
      },
    },
    {
      name: "desktop-1440x960",
      use: {
        viewport: { width: 1440, height: 960 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
  ],
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
