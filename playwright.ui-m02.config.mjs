import { defineConfig } from "@playwright/test";

const profiles = [
  {
    name: "mobile-390x844",
    viewport: {
      width: 390,
      height: 844,
    },
    layout: "mobile",
  },
  {
    name: "tablet-portrait-800x1280",
    viewport: {
      width: 800,
      height: 1280,
    },
    layout: "tablet-portrait",
  },
  {
    name: "tablet-landscape-1100x800",
    viewport: {
      width: 1100,
      height: 800,
    },
    layout: "tablet-landscape",
  },
  {
    name: "desktop-1440x900",
    viewport: {
      width: 1440,
      height: 900,
    },
    layout: "desktop",
  },
  {
    name: "desktop-wide-1920x1080",
    viewport: {
      width: 1920,
      height: 1080,
    },
    layout: "desktop",
  },
];

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "ui-m02-responsive-app-shell.spec.mjs",
  ],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  outputDir: "artifacts/ui-m02/test-results",
  reporter: [
    ["line"],
    [
      "json",
      {
        outputFile:
          "artifacts/ui-m02/playwright-report.json",
      },
    ],
    [
      "html",
      {
        outputFolder:
          "artifacts/ui-m02/html-report",
        open: "never",
      },
    ],
  ],
  use: {
    baseURL:
      "http://127.0.0.1:4173/"
      + "static-preview/forge-alive/"
      + "index.html",
    browserName: "chromium",
    colorScheme: "dark",
    locale: "es-MX",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: profiles.map((profile) => ({
    name: profile.name,
    metadata: {
      layout: profile.layout,
    },
    use: {
      viewport: profile.viewport,
      screen: profile.viewport,
      deviceScaleFactor: 1,
    },
  })),
  webServer: {
    command:
      "node scripts/build-ui-m02-acceptance-site.mjs "
      + "&& npx vite _ui_m02_site "
      + "--host 127.0.0.1 "
      + "--port 4173 --strictPort",
    url:
      "http://127.0.0.1:4173/"
      + "static-preview/forge-alive/"
      + "index.html",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
