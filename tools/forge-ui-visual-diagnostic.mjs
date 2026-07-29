import { chromium } from "@playwright/test";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  parseSegubecaPdfTextToAcceptedQuotePacket,
} from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";

const DEFAULT_URL =
  "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/";
const OUTPUT_ROOT = path.resolve(
  process.env.FORGE_DIAGNOSTIC_OUTPUT ||
    "artifacts/forge-ui-diagnostic",
);
const TARGET_URL = process.env.FORGE_DIAGNOSTIC_URL || DEFAULT_URL;
const CACHE_BUST =
  process.env.FORGE_DIAGNOSTIC_SHA || String(Date.now());
const FIXTURE_OVERRIDE =
  process.env.FORGE_DIAGNOSTIC_FIXTURE || "";
const SAMPLE_REFERRAL = Object.freeze({
  fullName: "Mariana Torres",
  phone: "5512345678",
  referrerName: "Ana López",
  referrerRelationship: "Amiga",
  initialContext:
    "Le interesa proteger a su hija y revisar opciones de ahorro.",
});

const VIEWPORTS = Object.freeze([
  Object.freeze({ name: "tablet-landscape", width: 1600, height: 960 }),
  Object.freeze({ name: "desktop", width: 1440, height: 1000 }),
]);

const SAMPLE_SEGUBECA_TEXT = `
UDI SeguBeca 18
Titular Menor Prueba No 25/06/2022 4 4 Masculino No
Contratante Contratante Prueba No 29/09/1992 33 31 Masculino No
SeguBeca 18 (SeguBeca 18) 14 años 30,000 2,284.33
Protección por Fallecimiento e Invalidez del Contratante (PIM 18 CT UI) 14 años Amparado 73.06
Prima Total Anual 2,524.19
ADAPTA (ADAPTA) 5 REN 100,000 418.73
Prima total con beneficios recomendados 3,080.09
0.00 % 4 2,524 2,524 0 0 0 2,284
84.89 % 17 2,524 35,339 0 30,000 30,000 30,000
La tasa de interes para entrega mensual es estimada a 1.0% anual vigente al momento de la cotización.
1 18 30,000 637 7,647 22,819 24,979
2 19 22,612 637 15,294 15,288 19,353
3 20 15,149 637 22,941 7,682 13,362
4 21 7,612 637 30,588 - 6,702
Todas las cantidades están expresadas en Unidades de Inversión (UDI).
`;

function routeUrl(route) {
  const url = new URL(TARGET_URL);
  url.searchParams.set("nav", route);
  url.searchParams.set("v", CACHE_BUST);
  return url.href;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function prepareFixture() {
  if (FIXTURE_OVERRIDE) {
    const resolved = path.resolve(FIXTURE_OVERRIDE);
    if (!(await exists(resolved))) {
      throw new Error(`QUOTE_FIXTURE_NOT_FOUND=${resolved}`);
    }
    return Object.freeze({
      path: resolved,
      source: "workflow-input",
    });
  }

  const packet = parseSegubecaPdfTextToAcceptedQuotePacket(
    SAMPLE_SEGUBECA_TEXT,
  );
  const fixturePath = path.join(
    OUTPUT_ROOT,
    "fixtures",
    "segubeca-diagnostic.accepted-quote.json",
  );
  await mkdir(path.dirname(fixturePath), { recursive: true });
  await writeFile(fixturePath, JSON.stringify(packet, null, 2));
  return Object.freeze({
    path: fixturePath,
    source: "generated-canonical-segubeca-packet",
  });
}

function telemetryFor(page) {
  const telemetry = {
    console: [],
    pageErrors: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    telemetry.console.push({
      type: message.type(),
      text: message.text(),
      location: message.location(),
    });
  });
  page.on("pageerror", (error) => {
    telemetry.pageErrors.push({
      name: error.name,
      message: error.message,
      stack: error.stack || null,
    });
  });
  page.on("requestfailed", (request) => {
    telemetry.failedRequests.push({
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText || "unknown",
    });
  });

  return telemetry;
}

async function settle(page, milliseconds = 1200) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(milliseconds);
}

async function capture(page, directory, label, options = {}) {
  const fullPage = options.fullPage !== false;
  const pngPath = path.join(directory, `${label}.png`);
  const htmlPath = path.join(directory, `${label}.html`);
  const statePath = path.join(directory, `${label}.state.json`);

  await page.screenshot({
    path: pngPath,
    fullPage,
    animations: "disabled",
  });
  await writeFile(htmlPath, await page.content());

  const state = await page.evaluate(() => {
    const visible = (element) => {
      if (!(element instanceof Element)) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity || "1") > 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const visibleCount = (selector) =>
      [...document.querySelectorAll(selector)].filter(visible).length;

    return {
      url: location.href,
      title: document.title,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      activeRoute:
        document.querySelector("[data-forge-route-active]")?.getAttribute(
          "data-forge-route-active",
        ) ||
        new URL(location.href).searchParams.get("nav"),
      alfredVisible: visibleCount(
        '.alfred-sheet[aria-hidden="false"], [data-forge-alfred-sheet][aria-hidden="false"]',
      ) > 0,
      referralSheetVisible:
        visibleCount("[data-referral-sheet]") > 0,
      prospectModalVisible:
        visibleCount("[data-referral-sheet], [data-prospect-form-modal]") > 0,
      legacyCenteredProspectModalVisible:
        visibleCount("[data-prospect-form-modal]") > 0,
      legacyCenteredReferralModalVisible:
        visibleCount("[data-prospect-form-modal]") > 0,
      savedReferralCardVisible:
        visibleCount("[data-saved-referral-card]") > 0,
      savedReferralCardContainsName:
        [...document.querySelectorAll("[data-saved-referral-card]")]
          .some((card) => visible(card) && card.textContent.includes("Mariana Torres")),
      globalAlfredLauncherVisible:
        visibleCount("[data-forge-command-orb][data-open-alfred]") > 0,
      quoteLegacyRuntimeVisible:
        visibleCount(
          '[data-forge-module="dedicated-new-quote-static-route"]',
        ) > 0,
      quoteLegacyShellVisible:
        visibleCount(".fq-shell-105dr") > 0,
      quoteResultsVisible:
        visibleCount("[data-forge-intake-results]") > 0,
      quotePopupVisible:
        visibleCount(
          'dialog[open], [role="dialog"]:not([aria-hidden="true"])',
        ) > 0,
      pipelineCreateReferralVisible:
        visibleCount("[data-pipeline-create-referral]") > 0,
      pipelineCreateProspectVisible:
        visibleCount("[data-pipeline-create-prospect]") > 0,
      bodyDataset: { ...document.body.dataset },
      documentDataset: { ...document.documentElement.dataset },
    };
  });

  await writeFile(statePath, JSON.stringify(state, null, 2));
  return state;
}

async function gotoRoute(page, route) {
  const response = await page.goto(routeUrl(route), {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  if (!response?.ok()) {
    throw new Error(
      `ROUTE_LOAD_FAILED=${route}:${response?.status() ?? "NO_RESPONSE"}`,
    );
  }
  await settle(page);
}

async function captureViewport(browser, viewport, fixture) {
  const directory = path.join(OUTPUT_ROOT, viewport.name);
  await mkdir(directory, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    locale: "es-MX",
    reducedMotion: "reduce",
  });
  await context.addInitScript((sample) => {
    if (new URL(location.href).searchParams.get("nav") !== "pipeline") return;

    const records = [];
    const filtered = (filters) => records.filter(
      (record) => filters.every(
        ({ column, value }) => record[column] === value,
      ),
    );
    const query = () => {
      const state = { filters: [], inserted: null };
      const builder = {
        select() {
          return builder;
        },
        eq(column, value) {
          state.filters.push({ column, value });
          return builder;
        },
        is(column, value) {
          state.filters.push({ column, value });
          return builder;
        },
        insert(row) {
          state.inserted = {
            id: "diagnostic-mariana-torres",
            ...row,
            archived_at: null,
          };
          records.push(state.inserted);
          return builder;
        },
        async single() {
          return { data: state.inserted || filtered(state.filters)[0], error: null };
        },
        async order() {
          return { data: filtered(state.filters), error: null };
        },
        then(resolve) {
          return Promise.resolve({
            data: filtered(state.filters),
            error: null,
          }).then(resolve);
        },
      };
      return builder;
    };

    globalThis.__ENV__ = { diagnostic: true };
    globalThis.ForgeAlivePublicConfig067G17A1 = {
      current: () => ({
        state: "READY",
        publicConfig: {
          SUPABASE_URL: "https://diagnostic.invalid",
          SUPABASE_KEY: "diagnostic-only",
        },
      }),
      allowsProductiveProspectCrud: () => true,
    };
    globalThis.supabase = {
      createClient: () => ({
        auth: {
          getUser: async () => ({
            data: { user: { id: "diagnostic-advisor" } },
            error: null,
          }),
        },
        from: () => query(),
      }),
    };
    globalThis.__FORGE_DIAGNOSTIC_SAMPLE_REFERRAL__ = sample;
  }, SAMPLE_REFERRAL);
  const page = await context.newPage();
  const telemetry = telemetryFor(page);
  const result = {
    viewport,
    routes: {},
    errors: [],
  };

  try {
    await gotoRoute(page, "inicio");
    result.routes.home = await capture(
      page,
      directory,
      "01-home-full",
    );
    const alfredLauncher = page.locator(
      "[data-forge-command-orb][data-open-alfred]",
    ).first();
    if (await alfredLauncher.count()) {
      await alfredLauncher.click({ timeout: 10_000 });
      await page.waitForTimeout(250);
      result.routes.alfredIndependent = await capture(
        page,
        directory,
        "01b-alfred-independent",
      );
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(250);
    }

    await gotoRoute(page, "pipeline");
    await page
      .locator("[data-forge-pipeline-module]")
      .waitFor({ state: "attached", timeout: 15_000 });
    result.routes.pipelineBefore = await capture(
      page,
      directory,
      "02-pipeline-before-cta",
    );

    const referralCta = page.locator(
      "[data-pipeline-create-referral], [data-pipeline-create-prospect]",
    ).first();
    if (await referralCta.count()) {
      await referralCta.click({ timeout: 10_000 });
      await page.waitForTimeout(4_000);
      result.routes.pipelineAfter = await capture(
        page,
        directory,
        "03-pipeline-after-cta",
      );
      await page.locator('[name="fullName"]').fill(SAMPLE_REFERRAL.fullName);
      await page.locator('[name="phone"]').fill(SAMPLE_REFERRAL.phone);
      await page.locator('[name="referrerName"]').fill(
        SAMPLE_REFERRAL.referrerName,
      );
      await page.locator('[name="referrerRelationship"]').fill(
        SAMPLE_REFERRAL.referrerRelationship,
      );
      await page.locator('[name="initialContext"]').fill(
        SAMPLE_REFERRAL.initialContext,
      );
      await page.locator("[data-save-referral]").click();
      await page.locator("[data-referral-sheet]").waitFor({
        state: "detached",
        timeout: 15_000,
      });
      await page.locator("[data-saved-referral-card]").filter({
        hasText: SAMPLE_REFERRAL.fullName,
      }).waitFor({ state: "visible", timeout: 15_000 });
      result.routes.pipelineSavedReferral = await capture(
        page,
        directory,
        "03b-pipeline-saved-referral-card",
      );
    } else {
      result.errors.push("PIPELINE_CTA_NOT_FOUND");
    }

    await gotoRoute(page, "cotizaciones");
    await page
      .locator("[data-forge-quotes-module]")
      .waitFor({ state: "attached", timeout: 15_000 });
    await page
      .locator("#fq-solution-online-pdf-105dr")
      .waitFor({ state: "attached", timeout: 20_000 });
    result.routes.quotesEmpty = await capture(
      page,
      directory,
      "04-quotes-empty",
    );

    await page
      .locator("#fq-solution-online-pdf-105dr")
      .setInputFiles(fixture.path);

    await Promise.race([
      page.waitForSelector(
        '[data-forge-intake-results]:not([hidden]), [data-forge-state="preview-calculated"], [data-forge-state="pending"]',
        { timeout: 40_000 },
      ),
      page.waitForTimeout(8_000),
    ]).catch(() => {});
    await page.waitForTimeout(1_200);

    result.routes.quotesAfterUpload = await capture(
      page,
      directory,
      "05-quotes-after-upload",
    );

    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);
    result.routes.quotesLoadedUnderlay = await capture(
      page,
      directory,
      "06-quotes-loaded-underlay",
    );
  } catch (error) {
    result.errors.push(error instanceof Error ? error.stack || error.message : String(error));
    await capture(page, directory, "99-failure", { fullPage: true }).catch(
      () => {},
    );
  } finally {
    await writeFile(
      path.join(directory, "telemetry.json"),
      JSON.stringify(telemetry, null, 2),
    );
    await writeFile(
      path.join(directory, "result.json"),
      JSON.stringify(result, null, 2),
    );
    await context.close();
  }

  return result;
}

function markdownSummary(results, fixture, browserVersion) {
  const rows = results.map((result) => {
    const after = result.routes.pipelineAfter || {};
    const quote = result.routes.quotesLoadedUnderlay ||
      result.routes.quotesAfterUpload || {};
    const pipelineOutcome = after.referralSheetVisible &&
      !after.alfredVisible &&
      !after.legacyCenteredProspectModalVisible
      ? "Referral sheet Material 3"
      : after.alfredVisible
        ? "Alfred"
        : "Sin superficie visible";
    return `| ${result.viewport.name} | ${pipelineOutcome} | ${quote.quoteResultsVisible ? "Sí" : "No"} | ${quote.quoteLegacyShellVisible ? "Sí" : "No"} | ${result.errors.length} |`;
  });

  return `# Forge UI visual diagnostic

- Target: ${TARGET_URL}
- Cache bust: ${CACHE_BUST}
- Chromium: ${browserVersion}
- Fixture: ${fixture.source}
- Generated: ${new Date().toISOString()}

| Viewport | Resultado CTA Pipeline | Resultados de cotización | Shell legacy visible | Errores |
|---|---|---:|---:|---:|
${rows.join("\n")}

## Contenido del artifact

- Screenshots PNG de Inicio, Pipeline y Cotizaciones.
- HTML completo de cada estado.
- Estado computado en JSON.
- Consola, errores de página y solicitudes fallidas.
- Fixture canónico usado para el estado cargado.
`;
}

async function main() {
  await rm(OUTPUT_ROOT, { recursive: true, force: true });
  await mkdir(OUTPUT_ROOT, { recursive: true });
  const fixture = await prepareFixture();

  const browser = await chromium.launch({
    headless: true,
    args: ["--font-render-hinting=none"],
  });
  const browserVersion = browser.version();
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      results.push(await captureViewport(browser, viewport, fixture));
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    contract: "FORGE_UI_VISUAL_DIAGNOSTIC_V1",
    targetUrl: TARGET_URL,
    cacheBust: CACHE_BUST,
    browserVersion,
    fixture,
    results,
    generatedAt: new Date().toISOString(),
  };

  await writeFile(
    path.join(OUTPUT_ROOT, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  await writeFile(
    path.join(OUTPUT_ROOT, "summary.md"),
    markdownSummary(results, fixture, browserVersion),
  );

  const sourceFixture = await readFile(fixture.path);
  await writeFile(
    path.join(OUTPUT_ROOT, "fixture-used.json"),
    sourceFixture,
  );

  console.log("FORGE_UI_VISUAL_DIAGNOSTIC=COMPLETE");
  console.log(`OUTPUT=${OUTPUT_ROOT}`);
  console.log(`TARGET=${TARGET_URL}`);
  console.log(`CACHE_BUST=${CACHE_BUST}`);
}

main().catch(async (error) => {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  await writeFile(
    path.join(OUTPUT_ROOT, "fatal-error.txt"),
    error instanceof Error ? error.stack || error.message : String(error),
  );
  console.error(error);
  process.exitCode = 1;
});
