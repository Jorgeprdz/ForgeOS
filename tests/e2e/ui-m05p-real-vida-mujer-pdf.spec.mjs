import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const artifactRoot = path.resolve("artifacts/ui-m05p");
const screenshotDirectory = path.join(artifactRoot, "screenshots");
const stateDirectory = path.join(artifactRoot, "states");
const downloadDirectory = path.join(artifactRoot, "downloads");
const fixturePath = path.join(
  artifactRoot,
  "fixture/Solucionline_20260711_16_05.PDF",
);
const blockedMessage =
  "Forge está bloqueado: falta la configuración pública requerida.";

function diagnosticUrl() {
  const raw = process.env.FORGE_M05P_TARGET_URL
    || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
  const url = new URL(raw);
  url.searchParams.set("nav", "cotizaciones");
  url.searchParams.set("m05p", `${Date.now()}`);
  return url.toString();
}

async function visible(locator) {
  return locator.isVisible().catch(() => false);
}

async function writeState(projectName, state) {
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(
    path.join(stateDirectory, `${projectName}.json`),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

async function screenshot(page, projectName, suffix) {
  await page.screenshot({
    path: path.join(screenshotDirectory, `${projectName}-${suffix}.png`),
    fullPage: false,
    animations: "disabled",
    timeout: 10_000,
  });
}

async function centerAndHitTest(locator) {
  return locator.evaluate(async (element) => {
    element.scrollIntoView({ block: "center", inline: "center" });
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      receivesPointer: Boolean(hit && (hit === element || element.contains(hit))),
      x,
      y,
      width: rect.width,
      height: rect.height,
    };
  });
}

test("procesa el PDF real y expone imprimir, PDF e historial", async (
  { page },
  testInfo,
) => {
  test.setTimeout(70_000);
  await mkdir(screenshotDirectory, { recursive: true });
  await mkdir(downloadDirectory, { recursive: true });

  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const fixture = await readFile(fixturePath);
  expect(fixture.length).toBe(69_973);
  expect(fixture.subarray(0, 5).toString("ascii")).toBe("%PDF-");

  await page.goto(diagnosticUrl(), {
    waitUntil: "domcontentloaded",
    timeout: 25_000,
  });

  const quotesModule = page.locator("[data-forge-quotes-module]");
  await expect(page.locator("[data-forge-nav-pill]")).toBeVisible({
    timeout: 15_000,
  });
  await expect(quotesModule).toBeAttached();

  const fileInput = page.locator("#fq-solution-online-pdf-105dr");
  await expect(fileInput).toBeAttached({ timeout: 15_000 });
  await expect(page.locator("html")).toHaveAttribute(
    "data-quote-intake-readiness",
    "ready",
    { timeout: 25_000 },
  );
  await expect(fileInput).toBeEnabled({ timeout: 25_000 });
  await screenshot(page, testInfo.project.name, "01-before-upload");
  await fileInput.setInputFiles(fixturePath);

  const intakeDialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Confirmar cotización" }),
  });
  await expect(intakeDialog).toBeVisible({ timeout: 20_000 });

  const probeStarted = Date.now();
  await page.waitForFunction(() => {
    document.documentElement.dataset.m05pResponsivenessProbe = String(
      performance.now(),
    );
    return true;
  }, null, { timeout: 3_000 });
  const responsivenessProbeMs = Date.now() - probeStarted;

  const intakeAccept = intakeDialog.getByRole("button", {
    name: "Aceptar",
    exact: true,
  });
  await expect(intakeAccept).toBeVisible();
  await intakeAccept.click({ force: true, timeout: 4_000 });
  await expect(intakeDialog).toBeHidden({ timeout: 10_000 });

  const projection = page.locator(
    '[data-material3-quote-projection-ready="true"]',
  );
  await expect(projection).toBeVisible({ timeout: 15_000 });

  const clientNameInput = page.locator(
    "[data-quote-human-review-client]",
  ).first();
  await expect(clientNameInput).toHaveValue(/Alejandra Moleres/i, {
    timeout: 8_000,
  });
  const clientName = await clientNameInput.inputValue();

  const confirm = page.locator('[data-quote-next-action="confirm_quote"]');
  await expect(confirm).toBeVisible({ timeout: 10_000 });
  await confirm.click({ force: true, timeout: 4_000 });
  await expect(quotesModule).toHaveAttribute(
    "data-quote-accepted",
    "true",
    { timeout: 15_000 },
  );

  const resultError = page.locator(".quote-result__state--error");
  const printableCard = page.locator("[data-m05e005-printable-card]");
  const preview = page.locator('[data-m05e005-action="preview"]');
  const download = page.locator('[data-m05e005-action="download"]');
  const history = page.locator('[data-m05e005-action="history"]');

  await expect(printableCard).toBeVisible({ timeout: 12_000 });
  await expect(preview).toBeVisible();
  await expect(download).toBeVisible();
  await expect(history).toBeVisible();
  await printableCard.scrollIntoViewIfNeeded();
  await screenshot(page, testInfo.project.name, "02-result-actions");

  const projectionText = await projection.textContent({ timeout: 5_000 })
    .catch(() => "");
  const printableText = await printableCard.textContent({ timeout: 5_000 })
    .catch(() => "");
  const bodyText = `${projectionText}\n${printableText}`;
  const errorText = await resultError.textContent({ timeout: 2_000 })
    .catch(() => "");

  expect(clientName).toMatch(/Alejandra Moleres/i);
  expect(bodyText).toMatch(/Vida Mujer/i);
  expect(bodyText).toMatch(/3[,\s]?0(?:61\.82|62)/);
  expect(bodyText).toMatch(/3[,\s]?890(?:\.21)?/);
  expect(bodyText).toMatch(/50[,\s]?000/);
  expect(bodyText).toMatch(/Cotización confirmada y lista para imprimir/i);
  await expect(resultError).toBeHidden();

  const blockedVisible = await visible(page.getByText(blockedMessage, {
    exact: false,
  }));
  const publicConfigNoticeVisible = await visible(
    page.locator('[data-forge-public-config-state="067g17a1"]'),
  );
  const authRuntimeErrorVisible = await visible(
    page.locator("[data-auth-runtime-error]"),
  );
  expect(blockedVisible).toBe(false);
  expect(publicConfigNoticeVisible).toBe(false);
  expect(authRuntimeErrorVisible).toBe(false);

  const actionsHitTest = {};
  for (const [name, locator] of [
    ["preview", preview],
    ["download", download],
    ["history", history],
  ]) {
    const hit = await centerAndHitTest(locator);
    expect(hit.width, `${name} width`).toBeGreaterThan(0);
    expect(hit.height, `${name} height`).toBeGreaterThan(0);
    expect(hit.receivesPointer, `${name} pointer hit`).toBe(true);
    actionsHitTest[name] = true;
  }

  const state = {
    schema: "forge.ui.m05p.real-vida-mujer-browser-state.v6",
    targetUrl: page.url(),
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    responsivenessProbeMs,
    extractedClientName: clientName,
    intakeAccepted: true,
    quoteProjectionReady: true,
    confirmationState: "accepted",
    quoteAccepted: await quotesModule.getAttribute("data-quote-accepted"),
    blockedVisible,
    publicConfigNoticeVisible,
    authRuntimeErrorVisible,
    quoteErrorVisible: await visible(resultError),
    quoteErrorText: errorText || "",
    printableCardVisible: true,
    actionVisibility: {
      preview: true,
      download: true,
      history: true,
    },
    actionsHitTest,
    consoleErrors,
    pageErrors,
    actions: {
      preview: "not-run",
      download: "not-run",
      history: "not-run",
    },
    status: "RUNNING",
  };
  await writeState(testInfo.project.name, state);

  await preview.click({ force: true, timeout: 4_000 });
  const modal = page.locator("[data-m05e005-printable-modal]");
  await expect(modal).toBeVisible({ timeout: 8_000 });
  await expect(modal.locator("#m05e005-modal-title")).toContainText(
    /Vista previa/i,
  );
  await expect(modal.locator("[data-m05e005-preview-frame]")).toBeVisible();
  state.actions.preview = "pass";
  await modal.locator("[data-m05e005-close]").last().click({
    force: true,
    timeout: 4_000,
  });
  await expect(modal).toBeHidden();

  const downloadEvent = page.waitForEvent("download", { timeout: 15_000 });
  await download.click({ force: true, timeout: 4_000 });
  const downloaded = await downloadEvent;
  expect(downloaded.suggestedFilename()).toMatch(/alejandra-moleres/i);
  const downloadedPath = path.join(
    downloadDirectory,
    `${testInfo.project.name}-${downloaded.suggestedFilename()}`,
  );
  await downloaded.saveAs(downloadedPath);
  const downloadedBytes = await readFile(downloadedPath);
  expect(downloadedBytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  expect(downloadedBytes.length).toBeGreaterThan(1_000);
  state.actions.download = "pass";
  state.downloadedPdf = {
    fileName: path.basename(downloadedPath),
    byteLength: downloadedBytes.length,
  };

  await history.click({ force: true, timeout: 4_000 });
  await expect(modal).toBeVisible({ timeout: 8_000 });
  await expect(modal.locator("#m05e005-modal-title")).toContainText(
    /Historial de versiones/i,
  );
  await expect(modal.locator("[data-m05e005-history-list]")).toBeVisible();
  state.actions.history = "pass";
  state.status = "PASS";
  state.consoleErrors = consoleErrors;
  state.pageErrors = pageErrors;
  await writeState(testInfo.project.name, state);

  expect(pageErrors).toEqual([]);
});
