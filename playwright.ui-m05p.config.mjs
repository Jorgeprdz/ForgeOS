import { defineConfig } from "@playwright/test";

const profiles = [
  {
    name: "mobile-390x844",
    viewport: { width: 390, height: 844 },
    layout: "mobile",
  },
  {
    name: "tablet-portrait-800x1280",
    viewport: { width: 800, height: 1280 },
    layout: "tablet-portrait",
  },
  {
    name: "tablet-landscape-1280x800",
    viewport: { width: 1280, height: 800 },
    layout: "tablet-landscape",
  },
  {
    name: "desktop-1440x900",
    viewport: { width: 1440, height: 900 },
    layout: "desktop",
  },
  {
    name: "desktop-wide-1920x1080",
    viewport: { width: 1920, height: 1080 },
    layout: "desktop-wide",
  },
];

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["ui-m05p-real-vida-mujer-pdf.spec.mjs"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  forbidOnly: Boolean(process.env.CI),
  outputDir: "artifacts/ui-m05p/test-results",
  reporter: [
    ["line"],
    [
      "json",
      { outputFile: "artifacts/ui-m05p/playwright-report.json" },
    ],
    [
      "html",
      {
        outputFolder: "artifacts/ui-m05p/html-report",
        open: "never",
      },
    ],
  ],
  use: {
    browserName: "chromium",
    colorScheme: "dark",
    locale: "es-MX",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: true,
  },
  projects: profiles.map((profile) => ({
    name: profile.name,
    metadata: { layout: profile.layout },
    use: {
      viewport: profile.viewport,
      screen: profile.viewport,
      deviceScaleFactor: 1,
    },
  })),
  webServer: {
    command: "node scripts/serve-ui-m05p-acceptance.mjs",
    url:
      "http://127.0.0.1:4173/docs/static-preview/"
      + "forge-alive-material3/index.html?nav=cotizaciones",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
