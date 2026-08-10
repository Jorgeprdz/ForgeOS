import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "forge-global-aura-recomposition-008.spec.mjs",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["line"]],
  outputDir: "../test-results/forge-global-aura-recomposition-008",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 pipeline-static-server.py",
    url: "http://127.0.0.1:4173/package.json",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
