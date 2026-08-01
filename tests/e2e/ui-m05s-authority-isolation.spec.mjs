import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const stage = process.env.FORGE_M05S_STAGE || "core";
const artifactRoot = path.resolve("artifacts/ui-m05s", stage);
const fixturePath = path.resolve(
  process.env.FORGE_M05P_PDF_PATH
    || "artifacts/ui-m05p/fixture/Solucionline_20260711_16_05.PDF",
);
const stageReadiness = Object.freeze({
  core: ["data-forge-authority-environment", "ready"],
  printable: ["data-forge-authority-quote-printable", "ready"],
  "rate-bridge": ["data-forge-authority-quote-rate-bridge", "ready"],
  "rate-runtime": ["data-forge-authority-quote-rate-runtime", "ready"],
  "vida-handoff": ["data-forge-authority-vida-mujer-handoff", "ready"],
  composition: ["data-forge-authority-quote-bridge-composition", "ready"],
  visual: ["data-forge-authority-vida-mujer-visual", "ready"],
});

function targetUrl() {
  const raw = process.env.FORGE_M05S_TARGET_URL
    || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
  const url = new URL(raw);
  url.searchParams.set("nav", "cotizaciones");
  url.searchParams.set("m05s", stage);
  url.searchParams.set("run", `${Date.now()}`);
  return url.toString();
}

async function writeState(state) {
  await mkdir(artifactRoot, { recursive: true });
  await writeFile(
    path.join(artifactRoot, "state.json"),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

test(`M05S ${stage}: el modal permanece interactivo`, async ({ page }) => {
  test.setTimeout(50_000);
  await mkdir(artifactRoot, { recursive: true });

  const fixture = await readFile(fixturePath);
  expect(fixture.length).toBe(69_973);
  expect(fixture.subarray(0, 5).toString("ascii")).toBe("%PDF-");

  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(targetUrl(), {
    waitUntil: "domcontentloaded",
    timeout: 20_000,
  });

  await expect(page.locator("html")).toHaveAttribute(
    "data-forge-m05s-stage",
    stage,
  );

  const [readinessAttribute, readinessValue] = stageReadiness[stage];
  await expect(page.locator("html")).toHaveAttribute(
    readinessAttribute,
    readinessValue,
    { timeout: 15_000 },
  );

  const authorityStateBeforeUpload = await page.locator("html").evaluate(
    (root) => ({ ...root.dataset }),
  );

  const fileInput = page.locator("#fq-solution-online-pdf-105dr");
  await fileInput.waitFor({ state: "attached", timeout: 10_000 });
  await fileInput.setInputFiles(fixturePath);

  const dialog = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Confirmar cotización" }),
  });
  await dialog.waitFor({ state: "visible", timeout: 20_000 });

  const screenshotPath = path.join(artifactRoot, "modal.png");
  await page.screenshot({
    path: screenshotPath,
    fullPage: false,
    animations: "disabled",
    timeout: 8_000,
  }).catch(() => {});

  const state = {
    schema: "forge.ui.m05s.authority-isolation.v1",
    stage,
    targetUrl: page.url(),
    fixtureBytes: fixture.length,
    modalVisible: true,
    authorityStateBeforeUpload,
    consoleErrors,
    pageErrors,
    responsiveness: "unknown",
    probeLatencyMs: null,
    acceptAction: "not-run",
    dialogClosed: false,
  };

  const probeStarted = Date.now();
  try {
    await page.waitForFunction(() => {
      document.documentElement.dataset.forgeM05sResponsivenessProbe = String(
        performance.now(),
      );
      return true;
    }, null, {
      polling: 50,
      timeout: 4_000,
    });
    state.responsiveness = "responsive";
    state.probeLatencyMs = Date.now() - probeStarted;
  } catch (error) {
    state.responsiveness = "blocked";
    state.probeLatencyMs = Date.now() - probeStarted;
    state.probeError = error instanceof Error ? error.message : String(error);
    await writeState(state);
    expect(
      state.responsiveness,
      `M05S_STAGE_BLOCKED=${stage}`,
    ).toBe("responsive");
    return;
  }

  const accept = dialog.getByRole("button", {
    name: "Aceptar",
    exact: true,
  });
  try {
    await accept.click({ force: true, timeout: 4_000 });
    state.acceptAction = "clicked";
    await dialog.waitFor({ state: "hidden", timeout: 5_000 });
    state.dialogClosed = true;
  } catch (error) {
    state.acceptAction = "blocked";
    state.acceptError = error instanceof Error ? error.message : String(error);
  }

  state.consoleErrors = consoleErrors;
  state.pageErrors = pageErrors;
  await writeState(state);

  expect(state.responsiveness, `M05S_STAGE_BLOCKED=${stage}`)
    .toBe("responsive");
  expect(state.acceptAction, `M05S_ACCEPT_BLOCKED=${stage}`)
    .toBe("clicked");
  expect(state.dialogClosed, `M05S_DIALOG_STUCK=${stage}`).toBe(true);
});
