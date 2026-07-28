import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const screenshotDir = path.resolve("artifacts/ui-m03-clean/screenshots");
const reportDir = path.resolve("artifacts/ui-m03-clean/reports");

const profiles = [
  ["mobile-390x844", 390, 844, true],
  ["tablet-portrait-800x1280", 800, 1280, true],
  ["tablet-landscape-1100x800", 1100, 800, true],
  ["desktop-1440x900", 1440, 900, false],
  ["desktop-wide-1920x1080", 1920, 1080, false],
].map(([id, width, height, hasTouch]) => ({
  id,
  viewport: { width, height },
  hasTouch,
}));

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
});

test("capture the authoritative 15-profile UI-M03 evidence", async ({
  browser,
  baseURL,
}) => {
  const report = {
    sourceCommit: process.env.GITHUB_SHA || "local-diagnostic",
    browser: "Playwright Chromium",
    profiles: [],
    pass: true,
  };

  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      screen: profile.viewport,
      deviceScaleFactor: 1,
      hasTouch: profile.hasTouch,
      colorScheme: "dark",
      locale: "es-MX",
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();

    try {
      await page.goto(
        `${baseURL}/docs/static-preview/forge-alive-material3/`,
        { waitUntil: "networkidle" },
      );
      await expect(page.locator(".app")).toBeVisible();
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      await page.waitForTimeout(450);
      await page.addStyleTag({
        content: `
          .halo, .bow-tie {
            animation-delay: -2.25s !important;
            animation-play-state: paused !important;
          }
        `,
      });
      await page.waitForTimeout(80);

      const layout = await page.evaluate(() => {
        const count = (selector) =>
          document.querySelectorAll(selector).length;
        const viewportWidth = document.documentElement.clientWidth;
        const scrollWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );
        return {
          overflow: Math.max(0, scrollWidth - viewportWidth),
          trees: count("main.app"),
          headers: count("header.hero"),
          navs: count(".nav-pill"),
          globalAlfred: count('[data-alfred-scope="global"]'),
          contextualAlfred: count('[data-alfred-scope="contextual"]'),
          sheets: count(".alfred-sheet"),
          legacy: count(
            ".phone-shell,.forge-m3-app-shell,"
              + ".forge-desktop-workspace-056y",
          ),
        };
      });

      expect(layout).toEqual({
        overflow: 0,
        trees: 1,
        headers: 1,
        navs: 1,
        globalAlfred: 1,
        contextualAlfred: 1,
        sheets: 1,
        legacy: 0,
      });

      await page.screenshot({
        path: path.join(
          screenshotDir,
          `${profile.id}-viewport.png`,
        ),
        fullPage: false,
      });
      await page.screenshot({
        path: path.join(
          screenshotDir,
          `${profile.id}-full.png`,
        ),
        fullPage: true,
      });

      await page.locator('[data-alfred-scope="global"]').click({
        force: true,
      });
      await expect(page.locator(".alfred-sheet")).toHaveClass(/open/);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(
          screenshotDir,
          `${profile.id}-alfred-open.png`,
        ),
        fullPage: false,
      });

      report.profiles.push({ ...profile, layout, pass: true });
    } finally {
      await context.close();
    }
  }

  fs.writeFileSync(
    path.join(reportDir, "capture-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
});
