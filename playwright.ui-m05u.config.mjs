import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["ui-m05u-real-pdf-smoke.spec.mjs"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 55_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  outputDir: "artifacts/ui-m05u/test-results",
  reporter: [
    ["line"],
    ["json", { outputFile: "artifacts/ui-m05u/report.json" }],
  ],
  use: {
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    screen: { width: 1440, height: 900 },
    colorScheme: "dark",
    locale: "es-MX",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: true,
  },
  webServer: {
    command: "node scripts/serve-ui-m05p-acceptance.mjs",
    url:
      "http://127.0.0.1:4173/docs/static-preview/"
      + "forge-alive-material3/index.html?nav=cotizaciones",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
