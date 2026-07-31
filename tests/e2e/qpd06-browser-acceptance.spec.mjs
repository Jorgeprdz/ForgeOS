import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const evidenceDir = path.resolve("artifacts/qpd06-browser");
const profiles = [
  { id: "mobile-390x844", width: 390, height: 844, hasTouch: true },
  { id: "tablet-800x1280", width: 800, height: 1280, hasTouch: true },
  { id: "desktop-1440x900", width: 1440, height: 900, hasTouch: false },
];

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test("QPD-06 productive printable flow works across responsive profiles", async ({
  browser,
  baseURL,
}) => {
  const report = {
    sourceCommit: process.env.GITHUB_SHA || "local-qpd06",
    browser: "Playwright Chromium",
    profiles: [],
    pass: true,
  };

  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      screen: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
      hasTouch: profile.hasTouch,
      locale: "es-MX",
      colorScheme: "light",
      acceptDownloads: true,
    });
    const page = await context.newPage();

    try {
      await page.goto(
        `${baseURL}/tests/e2e/fixtures/qpd06/index.html`,
        { waitUntil: "networkidle" },
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-qpd06-harness-ready",
        "true",
      );

      const actions = page.locator('[data-forge-qpd06-actions="true"]');
      await expect(actions).toBeVisible();
      await expect(page.getByRole("button", { name: "Ver versión imprimible" }))
        .toBeVisible();
      await expect(page.getByRole("button", { name: "Descargar PDF" }))
        .toBeVisible();
      await expect(page.getByRole("button", { name: "Historial" }))
        .toBeVisible();

      const initialLayout = await page.evaluate(() => {
        const root = document.documentElement;
        const actionsNode = document.querySelector(
          '[data-forge-qpd06-actions="true"]',
        );
        const style = getComputedStyle(actionsNode);
        return {
          viewportWidth: root.clientWidth,
          scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
          actionsMarginBottom: Number.parseFloat(style.marginBottom) || 0,
          state: globalThis.ForgeQuotePrintableEntrypointQPD06?.getState?.(),
        };
      });
      expect(initialLayout.scrollWidth - initialLayout.viewportWidth).toBeLessThanOrEqual(1);
      expect(initialLayout.state).toMatchObject({
        acceptedQuoteReady: true,
        automaticDownloadAllowed: false,
        automaticSendAllowed: false,
        quoteMutationAllowed: false,
        recalculationAllowed: false,
      });
      if (profile.width <= 720) {
        expect(initialLayout.actionsMarginBottom).toBeGreaterThanOrEqual(90);
      }

      await page.getByRole("button", { name: "Ver versión imprimible" }).click();
      const modal = page.locator('[data-forge-qpd06-modal="true"]');
      await expect(modal).toBeVisible();
      await expect(page.getByRole("heading", { name: "Vista previa imprimible" }))
        .toBeVisible();
      const frame = page.locator("[data-forge-qpd06-preview-frame]");
      await expect(frame).toBeVisible();
      const srcdoc = await frame.getAttribute("srcdoc");
      expect(srcdoc).toContain("Cotización");
      expect(srcdoc).toContain("Cliente QPD Browser");
      await expect(page.locator("[data-forge-qpd06-modal-status]"))
        .toContainText("página");

      await page.screenshot({
        path: path.join(evidenceDir, `${profile.id}-preview.png`),
        fullPage: false,
      });

      await page.keyboard.press("Escape");
      await expect(modal).toBeHidden();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Descargar PDF" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      await expect(page.locator('[data-forge-qpd06-status="true"]'))
        .toContainText("descargado");

      await page.getByRole("button", { name: "Historial" }).click();
      await expect(modal).toBeVisible();
      await expect(page.getByRole("heading", { name: "Historial imprimible" }))
        .toBeVisible();
      await expect(page.getByRole("button", { name: "Reabrir" }))
        .toHaveCount(1);
      await page.getByRole("button", { name: "Reabrir" }).click();
      await expect(page.getByRole("heading", { name: "Versión reabierta" }))
        .toBeVisible();
      await expect(page.locator("[data-forge-qpd06-modal-status]"))
        .toContainText("página");

      const finalState = await page.evaluate(() =>
        globalThis.ForgeQuotePrintableEntrypointQPD06?.getState?.(),
      );
      expect(finalState).toMatchObject({
        acceptedQuoteReady: true,
        durableIdentityReady: true,
        printableReady: true,
        printableVersionCount: 1,
      });

      await page.screenshot({
        path: path.join(evidenceDir, `${profile.id}-reopened.png`),
        fullPage: false,
      });

      report.profiles.push({
        ...profile,
        initialLayout,
        finalState,
        download: download.suggestedFilename(),
        pass: true,
      });
    } catch (error) {
      report.pass = false;
      report.profiles.push({
        ...profile,
        pass: false,
        error: error?.stack || String(error),
      });
      throw error;
    } finally {
      await context.close();
    }
  }

  fs.writeFileSync(
    path.join(evidenceDir, "acceptance-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
});
