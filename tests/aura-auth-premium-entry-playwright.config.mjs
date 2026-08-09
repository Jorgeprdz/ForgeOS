import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "aura-auth-premium-entry.spec.mjs",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["line"]],
  use: {
    baseURL: "http://127.0.0.1:4178",
    browserName: "chromium",
    headless: true,
  },
  outputDir: `${process.cwd()}/test-results/aura-auth-premium-entry-playwright`,
  webServer: {
    command: "python3 -m http.server 4178 --bind 127.0.0.1",
    cwd: process.cwd(),
    port: 4178,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
