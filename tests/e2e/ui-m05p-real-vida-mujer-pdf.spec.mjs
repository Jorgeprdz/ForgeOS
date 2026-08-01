import { expect, test } from "@playwright/test";
import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
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

async function viewportScreenshot(page, outputPath) {
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    animations: "disabled",
    timeout: 15_000,
  });
}

test("procesa el PDF real y expone imprimir, PDF e historial", async (
  { page },
  testInfo,
) => {
  test.setTimeout(90_000);
  await mkdir(screenshotDirectory, { recursive: true });
  await mkdir(downloadDirectory, { recursive: true });

  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const fixture = await readFile(fixturePath);
  expect(fixture.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  expect(fixture.length).toBe(69_973);

  await page.goto(diagnosticUrl(), {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });

  const quotesModule = page.locator("[data-forge-quotes-module]");
  await page.locator("[data-forge-nav-pill]").waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await quotesModule.waitFor({ state: "attached", timeout: 15_000 });

  const fileInput = page.locator("#fq-solution-online-pdf-105dr");
  await fileInput.waitFor({ state: "attached", timeout: 15_000 });

  const beforePath = path.join(
    screenshotDirectory,
    `${testInfo.project.name}-01-before-upload.png`,
  );
  await viewportScreenshot(page, beforePath);

  await fileInput.setInputFiles(fixturePath);

  const intakeDialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Confirmar cotización" }),
  });
  await intakeDialog.waitFor({ state: "visible", timeout: 20_000 });
  const intakeAccept = intakeDialog.getByRole("button", {
    name: "Aceptar",
    exact: true,
  });
  await expect(intakeAccept).toBeVisible();
  await intakeAccept.click();
  await intakeDialog.waitFor({ state: "hidden", timeout: 15_000 });

  const projection = page.locator(
    '[data-material3-quote-projection-ready="true"]',
  );
  await projection.waitFor({ state: "visible", timeout: 20_000 });

  const confirmQuote = page.locator(
    '[data-quote-next-action="confirm_quote"]',
  );
  await confirmQuote.waitFor({ state: "visible", timeout: 15_000 });
  await confirmQuote.scrollIntoViewIfNeeded();
  await confirmQuote.click();

  let confirmationState = "timeout";
  try {
    await page.waitForFunction(() => {
      const root = document.querySelector("[data-forge-quotes-module]");
      const button = document.querySelector(
        '[data-quote-next-action="confirm_quote"]',
      );
      return root?.getAttribute("data-quote-accepted") === "true"
        || button?.textContent?.includes("Reintentar confirmación");
    }, null, { timeout: 20_000 });
    confirmationState = await quotesModule.getAttribute("data-quote-accepted")
      === "true" ? "accepted" : "error";
  } catch {
    confirmationState = "timeout";
  }

  const resultError = page.locator(".quote-result__state--error");
  const printableCard = page.locator("[data-m05e005-printable-card]");
  const preview = page.locator('[data-m05e005-action="preview"]');
  const download = page.locator('[data-m05e005-action="download"]');
  const history = page.locator('[data-m05e005-action="history"]');

  await printableCard.waitFor({ state: "visible", timeout: 12_000 })
    .catch(() => {});
  if (await visible(printableCard)) {
    await printableCard.scrollIntoViewIfNeeded();
  } else {
    await confirmQuote.scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(250);

  const afterPath = path.join(
    screenshotDirectory,
    `${testInfo.project.name}-02-result-actions.png`,
  );
  await viewportScreenshot(page, afterPath);

  const bodyText = await page.locator("body").innerText();
  const errorText = await resultError.innerText().catch(() => "");
  const blockedVisible = await visible(page.getByText(blockedMessage, {
    exact: false,
  }));
  const publicConfigNoticeVisible = await visible(
    page.locator('[data-forge-public-config-state="067g17a1"]'),
  );
  const authRuntimeErrorVisible = await visible(
    page.locator("[data-auth-runtime-error]"),
  );
  const actionVisibility = {
    preview: await visible(preview),
    download: await visible(download),
    history: await visible(history),
  };

  const state = {
    schema: "forge.ui.m05p.real-vida-mujer-browser-state.v2",
    targetUrl: page.url(),
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    intakeAccepted: true,
    quoteProjectionReady: await visible(projection),
    confirmationState,
    quoteAccepted: await quotesModule.getAttribute("data-quote-accepted"),
    blockedVisible,
    publicConfigNoticeVisible,
    authRuntimeErrorVisible,
    quoteErrorVisible: await visible(resultError),
    quoteErrorText: errorText,
    printableCardVisible: await visible(printableCard),
    actionVisibility,
    bodyTextSample: bodyText.slice(0, 5_000),
    consoleErrors,
    pageErrors,
    actions: {
      preview: "not-run",
      download: "not-run",
      history: "not-run",
    },
  };
  await writeState(testInfo.project.name, state);

  expect(blockedVisible, "La configuración pública no debe bloquear Forge").toBe(false);
  expect(publicConfigNoticeVisible).toBe(false);
  expect(authRuntimeErrorVisible).toBe(false);
  expect(confirmationState, `Confirmación: ${confirmationState}. ${errorText}`)
    .toBe("accepted");
  await expect(projection).toBeVisible();
  await expect(resultError).toBeHidden();

  expect(bodyText).toMatch(/Vida Mujer/i);
  expect(bodyText).toMatch(/Alejandra Moleres/i);
  expect(bodyText).toMatch(/3[,\s]?0(?:61\.82|62)/);
  expect(bodyText).toMatch(/3[,\s]?890(?:\.21)?/);
  expect(bodyText).toMatch(/50[,\s]?000/);
  expect(bodyText).toMatch(/Cotización confirmada y lista para imprimir/i);

  await expect(printableCard).toBeVisible();
  await expect(preview).toBeVisible();
  await expect(download).toBeVisible();
  await expect(history).toBeVisible();
  await expect(preview.locator("svg")).toHaveCount(1);
  await expect(download.locator("svg")).toHaveCount(1);
  await expect(history.locator("svg")).toHaveCount(1);

  const actionsHitTest = await page.evaluate(() => {
    const output = {};
    for (const action of ["preview", "download", "history"]) {
      const button = document.querySelector(
        `[data-m05e005-action="${action}"]`,
      );
      if (!button) {
        output[action] = false;
        continue;
      }
      button.scrollIntoView({ block: "center", inline: "center" });
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      output[action] = Boolean(hit && (hit === button || button.contains(hit)));
    }
    return output;
  });
  expect(actionsHitTest).toEqual({
    preview: true,
    download: true,
    history: true,
  });

  await preview.click();
  const printableModal = page.locator("[data-m05e005-printable-modal]");
  await expect(printableModal).toBeVisible();
  await expect(printableModal.locator("#m05e005-modal-title")).toContainText(
    /Vista previa/i,
  );
  await expect(
    printableModal.locator("[data-m05e005-preview-frame]"),
  ).toBeVisible();
  state.actions.preview = "pass";
  await printableModal.locator("[data-m05e005-close]").last().click();
  await expect(printableModal).toBeHidden();

  const downloadEvent = page.waitForEvent("download", { timeout: 20_000 });
  await download.click();
  const downloaded = await downloadEvent;
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

  await history.click();
  await expect(printableModal).toBeVisible();
  await expect(printableModal.locator("#m05e005-modal-title")).toContainText(
    /Historial de versiones/i,
  );
  await expect(
    printableModal.locator("[data-m05e005-history-list]"),
  ).toBeVisible();
  state.actions.history = "pass";
  await printableModal.locator("[data-m05e005-close]").last().click();

  state.consoleErrors = consoleErrors;
  state.pageErrors = pageErrors;
  state.actionsHitTest = actionsHitTest;
  state.status = "PASS";
  await writeState(testInfo.project.name, state);

  expect(
    pageErrors,
    `Errores de página: ${pageErrors.join(" | ")}`,
  ).toEqual([]);
});
