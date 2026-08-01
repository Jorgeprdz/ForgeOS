import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const artifactRoot = path.resolve("artifacts/ui-m05u");
const fixturePath = path.resolve(
  process.env.FORGE_M05P_PDF_PATH
    || "artifacts/ui-m05p/fixture/Solucionline_20260711_16_05.PDF",
);

function targetUrl() {
  const raw = process.env.FORGE_M05U_TARGET_URL
    || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
  const url = new URL(raw);
  url.searchParams.set("nav", "cotizaciones");
  url.searchParams.set("m05u", `${Date.now()}`);
  return url.toString();
}

test("PDF real completa confirmación e impresión sin bloquear el hilo", async ({ page }) => {
  test.setTimeout(55_000);
  await mkdir(artifactRoot, { recursive: true });
  const fixture = await readFile(fixturePath);
  expect(fixture.length).toBe(69_973);
  expect(fixture.subarray(0, 5).toString("ascii")).toBe("%PDF-");

  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(targetUrl(), {
    waitUntil: "domcontentloaded",
    timeout: 20_000,
  });
  await page.locator("#fq-solution-online-pdf-105dr").setInputFiles(fixturePath);

  const intakeDialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Confirmar cotización" }),
  });
  await expect(intakeDialog).toBeVisible({ timeout: 15_000 });

  const probeStart = Date.now();
  await page.waitForFunction(() => {
    document.documentElement.dataset.m05uProbe = String(performance.now());
    return true;
  }, null, { timeout: 3_000 });
  const intakeProbeMs = Date.now() - probeStart;

  await intakeDialog.getByRole("button", {
    name: "Aceptar",
    exact: true,
  }).click({ force: true, timeout: 4_000 });
  await expect(intakeDialog).toBeHidden({ timeout: 8_000 });

  const projection = page.locator(
    '[data-material3-quote-projection-ready="true"]',
  );
  await expect(projection).toBeVisible({ timeout: 12_000 });

  const confirm = page.locator('[data-quote-next-action="confirm_quote"]');
  await expect(confirm).toBeVisible({ timeout: 8_000 });
  await confirm.click({ force: true, timeout: 4_000 });
  await expect(page.locator("[data-forge-quotes-module]")).toHaveAttribute(
    "data-quote-accepted",
    "true",
    { timeout: 12_000 },
  );

  const card = page.locator("[data-m05e005-printable-card]");
  const preview = page.locator('[data-m05e005-action="preview"]');
  const download = page.locator('[data-m05e005-action="download"]');
  const history = page.locator('[data-m05e005-action="history"]');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(preview).toBeVisible();
  await expect(download).toBeVisible();
  await expect(history).toBeVisible();

  await preview.click({ force: true, timeout: 4_000 });
  const modal = page.locator("[data-m05e005-printable-modal]");
  await expect(modal).toBeVisible({ timeout: 8_000 });
  await expect(modal.locator("#m05e005-modal-title")).toContainText(/Vista previa/i);
  await modal.locator("[data-m05e005-close]").last().click({
    force: true,
    timeout: 4_000,
  });
  await expect(modal).toBeHidden();

  const downloadEvent = page.waitForEvent("download", { timeout: 12_000 });
  await download.click({ force: true, timeout: 4_000 });
  const downloaded = await downloadEvent;
  const downloadedPath = path.join(artifactRoot, downloaded.suggestedFilename());
  await downloaded.saveAs(downloadedPath);
  const downloadedBytes = await readFile(downloadedPath);
  expect(downloadedBytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  expect(downloadedBytes.length).toBeGreaterThan(1_000);

  await history.click({ force: true, timeout: 4_000 });
  await expect(modal).toBeVisible({ timeout: 8_000 });
  await expect(modal.locator("#m05e005-modal-title")).toContainText(
    /Historial de versiones/i,
  );

  await page.screenshot({
    path: path.join(artifactRoot, "closure.png"),
    fullPage: false,
    animations: "disabled",
  });

  await writeFile(
    path.join(artifactRoot, "state.json"),
    `${JSON.stringify({
      schema: "forge.ui.m05u.real-pdf-smoke.v1",
      status: "PASS",
      fixtureBytes: fixture.length,
      intakeProbeMs,
      accepted: true,
      printableCard: true,
      actions: {
        preview: "PASS",
        download: "PASS",
        history: "PASS",
      },
      downloadedPdfBytes: downloadedBytes.length,
      pageErrors,
    }, null, 2)}\n`,
  );

  expect(pageErrors).toEqual([]);
});
