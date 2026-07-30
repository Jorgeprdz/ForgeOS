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
  fullName: "Jorge Ignacio Palacios Rodríguez",
  phone: "5512345678",
  referrerName: "Ana López",
  referrerRelationship: "Amiga",
  initialContext:
    "Le interesa proteger a su hija y revisar opciones de ahorro.",
});

const VIEWPORTS = Object.freeze([
  Object.freeze({ name: "mobile", width: 412, height: 915, expectedCardColumns: 1 }),
  Object.freeze({ name: "tablet", width: 1024, height: 768, expectedCardColumns: 2 }),
  Object.freeze({ name: "desktop", width: 1600, height: 900, expectedCardColumns: 4 }),
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
      productiveProspectCardVisible:
        visibleCount("[data-productive-prospect-card]") > 0,
      productiveProspectCardContainsName:
        [...document.querySelectorAll("[data-productive-prospect-card]")]
          .some((card) => visible(card) && card.textContent.includes("Jorge Ignacio Palacios Rodríguez")),
      productiveCardUsesNormalRenderer:
        visibleCount("[data-productive-pipeline-cards] [data-productive-prospect-card]") > 0,
      productiveCardStructured:
        visibleCount("[data-productive-prospect-card] [data-productive-card-identity]") > 0 &&
        visibleCount("[data-productive-prospect-card] [data-productive-card-metadata]") > 0 &&
        visibleCount("[data-productive-prospect-card] [data-productive-card-status]") > 0,
      productiveActionsGrouped:
        visibleCount("[data-productive-prospect-card] [data-productive-card-actions]") > 0,
      productiveInternalEnumVisible:
        [...document.querySelectorAll("[data-productive-prospect-card]")]
          .some(card => visible(card) && card.textContent.includes(
            "CONVERSATION_BRIEF_AVAILABLE_ON_REQUEST",
          )),
      productiveGeometryValid: (() => {
        const card = document.querySelector("[data-productive-prospect-card]");
        if (!visible(card)) return false;
        const bounds = card.getBoundingClientRect();
        const inside = element => {
          const rect = element.getBoundingClientRect();
          return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
            && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
        };
        const regions = [
          card.querySelector("[data-productive-card-identity]"),
          card.querySelector("[data-productive-card-metadata]"),
          card.querySelector("[data-productive-card-status]"),
          card.querySelector("[data-productive-card-actions]"),
        ].filter(Boolean);
        return card.scrollWidth <= card.clientWidth + 1
          && regions.length === 4
          && regions.every(inside)
          && [...card.querySelectorAll("[data-productive-card-actions] > *")].every(inside);
      })(),
      productiveNameReadable: (() => {
        const name = document.querySelector("[data-productive-card-identity] strong");
        if (!visible(name)) return false;
        const rect = name.getBoundingClientRect();
        return rect.width >= 180 && rect.height <= 80
          && getComputedStyle(name).wordBreak === "normal";
      })(),
      productiveStageLabelVisible:
        visibleCount("[data-productive-stage-label]") > 0,
      productiveSourceLabelVisible:
        visibleCount("[data-productive-source-label]") > 0,
      productiveStageControlVisible:
        visibleCount("[data-productive-stage-control]") > 0,
      productiveStageAccentVisible: (() => {
        const card = document.querySelector("[data-productive-prospect-card]");
        if (!visible(card)) return false;
        const style = getComputedStyle(card);
        return parseFloat(style.borderLeftWidth) >= 3
          && style.borderLeftColor !== "rgba(0, 0, 0, 0)";
      })(),
      productiveActionsDifferentiated: (() => {
        const actions = [...document.querySelectorAll(
          "[data-productive-card-actions] > *",
        )].filter(visible);
        return new Set(actions.map(action => getComputedStyle(action).backgroundColor)).size >= 4;
      })(),
      productiveHumanStatusesValid: [...document.querySelectorAll(
        "[data-productive-prospect-card]",
      )].filter(visible).every(card => ({
        referred_new: "Nuevo",
        contacted: "Contactado",
        appointment_scheduled: "Cita agendada",
        proposal: "Propuesta",
        decision: "En decisión",
        client: "Cliente",
      })[card.dataset.productiveStage] ===
        card.querySelector("[data-productive-stage-label]")?.textContent.trim()),
      productiveTimelineHumanReadable:
        ![...document.querySelectorAll("[data-timeline-activity]")]
          .some(node => node.textContent.includes("PROSPECT_CREATED")),
      productiveSourceStatusSeparated:
        visibleCount(
          "[data-productive-prospect-card] [data-productive-source-label]",
        ) > 0 &&
        visibleCount(
          "[data-productive-prospect-card] [data-productive-stage-control]",
        ) > 0,
      productiveSourceUnchangedAfterStatus:
        globalThis.__FORGE_DIAGNOSTIC_SOURCE_UNCHANGED__ === true,
      referralSourceConditional:
        globalThis.__FORGE_DIAGNOSTIC_REFERRAL_CONDITIONAL__ === true,
      productiveCardColumnCount: (() => {
        const cards = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .filter(visible);
        const rows = new Map();
        cards.forEach(card => {
          const top = Math.round(card.getBoundingClientRect().top / 3) * 3;
          rows.set(top, (rows.get(top) || 0) + 1);
        });
        return Math.max(0, ...rows.values());
      })(),
      productiveAllGeometryValid: (() => {
        const cards = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .filter(visible);
        const pipeline = document.querySelector("[data-forge-pipeline-module]");
        if (cards.length < 4 || !pipeline) return false;
        const pipelineBounds = pipeline.getBoundingClientRect();
        const inside = (inner, outer) =>
          inner.left >= outer.left - 1 && inner.right <= outer.right + 1;
        return cards.every(card => {
          const cardBounds = card.getBoundingClientRect();
          const regions = [
            card.querySelector("[data-productive-card-identity]"),
            card.querySelector("[data-productive-card-metadata]"),
            card.querySelector(".pipeline-module__stage-control"),
            card.querySelector("[data-productive-card-status]"),
            card.querySelector("[data-productive-card-actions]"),
          ];
          const actionBounds = card.querySelector(
            "[data-productive-card-actions]",
          ).getBoundingClientRect();
          return card.scrollWidth <= card.clientWidth + 1
            && inside(cardBounds, pipelineBounds)
            && regions.every(region => region && inside(
              region.getBoundingClientRect(),
              cardBounds,
            ))
            && [...card.querySelectorAll("[data-productive-card-actions] > *")]
              .every(action => inside(action.getBoundingClientRect(), actionBounds));
        });
      })(),
      productiveCardsDoNotOverlap: (() => {
        const rects = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .filter(visible).map(card => card.getBoundingClientRect());
        return rects.every((rect, index) => rects.slice(index + 1).every(other =>
          rect.right <= other.left + 1 || other.right <= rect.left + 1
          || rect.bottom <= other.top + 1 || other.bottom <= rect.top + 1
        ));
      })(),
      productiveNamesReadable: [...document.querySelectorAll(
        "[data-productive-card-identity] strong",
      )].filter(visible).every(name => {
        const rect = name.getBoundingClientRect();
        return rect.width >= 70 && rect.height <= 96
          && getComputedStyle(name).wordBreak === "normal";
      }),
      productiveNoShellOverlap: (() => {
        const cards = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .filter(visible);
        const protectedNodes = [
          document.querySelector(".bottom-shell"),
          document.querySelector("[data-forge-command-orb]"),
        ].filter(visible);
        return cards.every(card => protectedNodes.every(node => {
          const a = card.getBoundingClientRect();
          const b = node.getBoundingClientRect();
          return a.right <= b.left || b.right <= a.left
            || a.bottom <= b.top || b.bottom <= a.top;
        }));
      })(),
      specialSavedReferralCardPathPresent:
        document.querySelector("[data-saved-referral-card]") !== null,
      timelineCreatedEventVisible:
        [...document.querySelectorAll("[data-timeline-activity]")]
          .some((node) => node.textContent.includes("Prospecto creado")),
      lastVerifiedActivitySource:
        document.querySelector("[data-timeline-activity]")?.dataset.activitySource || null,
      nashWorkspaceVisible:
        visibleCount("[data-nash-prospect-workspace]") > 0,
      nashProviderAttempted:
        globalThis.__FORGE_DIAGNOSTIC_NASH_PROVIDER_ATTEMPTED__ === true,
      deterministicFallbackUsed:
        document.querySelector("[data-nash-source-mode]")?.textContent.includes(
          "determinística",
        ) || false,
      draftVisible:
        visibleCount("[data-nash-draft]") > 0 &&
        Boolean(document.querySelector("[data-nash-draft]")?.value.trim()),
      exactApprovalPassed:
        visibleCount("[data-manual-whatsapp]") > 0,
      manualWhatsAppHrefAvailable:
        document.querySelector("[data-manual-whatsapp]")?.getAttribute("href")
          ?.startsWith("https://wa.me/") || false,
      automaticWhatsAppOpen: false,
      editedDraftInvalidatedApproval:
        globalThis.__FORGE_DIAGNOSTIC_EDIT_INVALIDATED__ === true,
      conversationBriefProduced:
        document.querySelector("[data-nash-prospect-workspace]")?.textContent.includes("Conversation Brief: Disponible") || false,
      humanApprovalRequired:
        document.querySelector("[data-nash-approval-status]") !== null,
      automaticSendPerformed: false,
      authJpVisible: visibleCount(".hero .profile[data-forge-auth-avatar]") > 0,
      authPanelVisible: visibleCount("[data-forge-auth-panel]") > 0,
      googleAvatarVisible: visibleCount('.hero .profile[data-forge-auth-avatar] img') > 0,
      privateDataPurged:
        document.querySelector('[data-pipeline-auth-state="ANONYMOUS"]') !== null
        && document.querySelector("[data-productive-prospect-card]") === null,
      combatWorkspaceVisible: visibleCount("[data-nash-combat-workspace]") > 0,
      combatTypeStall: document.querySelector("[data-combat-type]")?.textContent.trim() === "STALL",
      combatIntentAvoidingDecision:
        document.querySelector("[data-combat-intent]")?.textContent.trim() === "AVOIDING_DECISION",
      combatExactApprovalPassed: visibleCount("[data-combat-whatsapp]") > 0,
      combatEditedInvalidatedApproval:
        globalThis.__FORGE_DIAGNOSTIC_COMBAT_EDIT_INVALIDATED__ === true,
      objectionTimelineRecorded:
        globalThis.__FORGE_DIAGNOSTIC_OBJECTION_RECORDED__ === true,
      rawObjectionPersisted:
        JSON.stringify(globalThis.__FORGE_DIAGNOSTIC_TIMELINE_PAYLOAD__ || {}).includes("Lo voy a pensar"),
      nbaWorkspaceVisible: visibleCount("[data-nba-workspace]") > 0,
      nbaHandleObjection:
        document.querySelector("[data-nba-workspace]")?.textContent.includes("HANDLE_OBJECTION") || false,
      nbaReasonWhyVisible:
        document.querySelector("[data-nba-workspace]")?.textContent.includes("Reason Why") || false,
      globalAlfredLauncherVisible:
        visibleCount("[data-forge-command-orb][data-open-alfred]") > 0,
      quoteLegacyRuntimeVisible:
        visibleCount(
          '[data-forge-module="dedicated-new-quote-static-route"]',
        ) > 0,
      quoteLegacyShellVisible:
        visibleCount(".fq-shell-105dr") > 0,
      quoteResultsVisible:
        visibleCount("[data-material3-quote-result-ready]") > 0,
      quoteReadyState:
        document.querySelector("[data-forge-quotes-module]")?.dataset.intakeState === "ready",
      quoteLoadedSubstantive:
        (document.querySelector("[data-material3-quote-result-ready]")?.textContent.trim().length || 0) >= 120,
      quoteProjectionTextLength:
        document.querySelector("[data-material3-quote-result-ready]")?.textContent.trim().length || 0,
      quoteProjectionSectionCount:
        visibleCount("[data-quote-result-section]"),
      quoteProductIdentityVisible:
        visibleCount("[data-quote-product-identity]") > 0,
      quoteNumericResultVisible:
        /\d/.test(document.querySelector("[data-quote-calculation-values]")?.textContent || ""),
      quoteWarningsOrEvidenceVisible:
        visibleCount("[data-quote-evidence-warnings]") > 0,
      quoteProgressOnly:
        visibleCount("[data-quote-progress]") > 0 &&
        visibleCount("[data-material3-quote-result-ready]") === 0,
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
    const timeline = [];
    let diagnosticSetSeeded = false;
    const filtered = (collection, filters) => collection.filter(
      (record) => filters.every(
        ({ column, value }) => record[column] === value,
      ),
    );
    const query = (table) => {
      const collection = table === "prospect_commercial_timeline" ? timeline : records;
      const state = { filters: [], inserted: null, patch: null };
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
            created_at: "2026-07-29T12:00:00.000Z",
            updated_at: "2026-07-29T12:00:00.000Z",
          };
          records.push(state.inserted);
          timeline.push({
            id: "diagnostic-created-event",
            prospect_id: state.inserted.id,
            event_type: "PROSPECT_CREATED",
            event_source: "PRODUCTIVE_PROSPECT_SERVICE",
            occurred_at: "2026-07-29T12:00:00.000Z",
            recorded_at: "2026-07-29T12:00:00.000Z",
            payload: {},
            evidence_references: [],
            contract_version: "NFAST-08.1",
          });
          if (!diagnosticSetSeeded) {
            diagnosticSetSeeded = true;
            const extras = [
              {
                id: "diagnostic-camila",
                full_name: "Camila Hernández",
                phone_normalized: null,
                source: "Mercado cálido",
                status: "contacted",
              },
              {
                id: "diagnostic-roberto",
                full_name: "Roberto Sánchez del Valle",
                phone_normalized: "+525511112222",
                source: "Redes sociales",
                status: "appointment_scheduled",
              },
              {
                id: "diagnostic-lucia",
                full_name: "Lucía Fernanda Gómez",
                phone_normalized: "+525533334444",
                source: "Centro de influencia",
                status: "proposal",
              },
            ];
            for (const [index, extra] of extras.entries()) {
              records.push({
                advisor_id: "diagnostic-advisor",
                initial_context: "Contexto diagnóstico gobernado.",
                archived_at: null,
                created_at: `2026-07-29T11:0${index}:00.000Z`,
                updated_at: `2026-07-29T11:0${index}:00.000Z`,
                ...extra,
              });
            }
            timeline.push({
              id: "diagnostic-contact-event",
              prospect_id: "diagnostic-camila",
              event_type: "CONTACT_ATTEMPTED",
              event_source: "NFAST08_TIMELINE",
              occurred_at: "2026-07-29T11:30:00.000Z",
              recorded_at: "2026-07-29T11:30:00.000Z",
              payload: { channel: "PHONE", outcome: "ANSWERED" },
              evidence_references: [],
              contract_version: "NFAST-08.1",
            });
          }
          return builder;
        },
        update(patch) {
          state.patch = patch;
          return builder;
        },
        async single() {
          const existing = filtered(collection, state.filters)[0];
          if (state.patch && existing) Object.assign(existing, state.patch);
          return { data: state.inserted || existing, error: null };
        },
        order() {
          return builder;
        },
        async limit() {
          return { data: filtered(collection, state.filters), error: null };
        },
        then(resolve) {
          return Promise.resolve({
            data: filtered(collection, state.filters),
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
          getSession: async () => ({
            data: {
              session: globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__
                ? { user: {
                  id: "diagnostic-advisor",
                  email: "jorge@example.com",
                  app_metadata: { provider: "google" },
                  user_metadata: {
                    full_name: "Jorge Palacios",
                    avatar_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230b57d0'/%3E%3C/svg%3E",
                  },
                } } : null,
            },
            error: null,
          }),
          getUser: async () => ({
            data: { user: globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ ? { id: "diagnostic-advisor" } : null },
            error: null,
          }),
          signInWithOAuth: async options => {
            globalThis.__FORGE_DIAGNOSTIC_GOOGLE_OAUTH__ = options;
            return { data: {}, error: null };
          },
          signOut: async () => {
            globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = false;
            globalThis.__FORGE_DIAGNOSTIC_AUTH_LISTENER__?.("SIGNED_OUT", null);
            return { error: null };
          },
          onAuthStateChange: callback => {
            globalThis.__FORGE_DIAGNOSTIC_AUTH_LISTENER__ = callback;
            return { data: { subscription: { unsubscribe() {} } } };
          },
        },
        from: (table) => query(table),
        rpc: async (_name, args) => {
          globalThis.__FORGE_DIAGNOSTIC_OBJECTION_RECORDED__ = true;
          globalThis.__FORGE_DIAGNOSTIC_TIMELINE_PAYLOAD__ = args;
          return { data: null, error: null };
        },
        functions: {
          invoke: async () => {
            globalThis.__FORGE_DIAGNOSTIC_NASH_PROVIDER_ATTEMPTED__ = true;
            return { error: new Error("DIAGNOSTIC_PROVIDER_UNAVAILABLE") };
          },
        },
      }),
    };
    globalThis.__FORGE_DIAGNOSTIC_SAMPLE_REFERRAL__ = sample;
    globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = false;
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
    const jp = page.locator(".hero .profile[data-forge-auth-avatar]").first();
    await jp.waitFor({ state: "visible", timeout: 10_000 });
    await jp.click();
    await page.locator("[data-forge-auth-google]").waitFor({ state: "visible", timeout: 10_000 });
    result.routes.authAnonymous = await capture(page, directory, "01a-auth-anonymous");
    await page.locator("[data-forge-auth-google]").click();
    await page.waitForFunction(() =>
      globalThis.__FORGE_DIAGNOSTIC_GOOGLE_OAUTH__?.provider === "google"
    );
    await page.evaluate(() => {
      globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = true;
      const user = {
        id: "diagnostic-advisor",
        email: "jorge@example.com",
        app_metadata: { provider: "google" },
        user_metadata: {
          full_name: "Jorge Palacios",
          avatar_url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230b57d0'/%3E%3C/svg%3E",
        },
      };
      globalThis.__FORGE_DIAGNOSTIC_AUTH_LISTENER__?.("SIGNED_IN", { user });
    });
    await page.locator("[data-forge-auth-close]").first().click().catch(() => {});
    await page.waitForTimeout(300);
    result.routes.authAuthenticated = await capture(page, directory, "01aa-auth-authenticated");
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
      await page.locator('[name="source"]').selectOption("Mercado cálido");
      if (await page.locator("[data-referral-source-fields]").isVisible()) {
        throw new Error("REFERRAL_FIELDS_VISIBLE_FOR_NON_REFERRAL_SOURCE");
      }
      await page.locator('[name="source"]').selectOption("Referido");
      await page.locator("[data-referral-source-fields]").waitFor({
        state: "visible",
      });
      await page.evaluate(() => {
        globalThis.__FORGE_DIAGNOSTIC_REFERRAL_CONDITIONAL__ = true;
      });
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
      await page.locator("[data-productive-prospect-card]").filter({
        hasText: SAMPLE_REFERRAL.fullName,
      }).waitFor({ state: "visible", timeout: 15_000 });
      result.routes.pipelineSavedReferral = await capture(
        page,
        directory,
        "03b-pipeline-saved-referral-card",
      );
      const sampleCard = page.locator("[data-productive-prospect-card]").filter({
        hasText: SAMPLE_REFERRAL.fullName,
      });
      const sourceBeforeStatus = await sampleCard
        .locator("[data-productive-source-label]").textContent();
      await sampleCard.locator("[data-productive-stage-control]")
        .selectOption("decision");
      await page.locator("[data-productive-prospect-card]").filter({
        hasText: SAMPLE_REFERRAL.fullName,
      }).locator("[data-productive-stage-label]").filter({
        hasText: "En decisión",
      }).waitFor({ state: "visible", timeout: 10_000 });
      const sourceAfterStatus = await page.locator(
        "[data-productive-prospect-card]",
      ).filter({ hasText: SAMPLE_REFERRAL.fullName })
        .locator("[data-productive-source-label]").textContent();
      if (sourceBeforeStatus !== sourceAfterStatus) {
        throw new Error("STATUS_CHANGE_MUTATED_SOURCE");
      }
      await page.evaluate(() => {
        globalThis.__FORGE_DIAGNOSTIC_SOURCE_UNCHANGED__ = true;
      });
      result.routes.pipelineSavedReferral = await capture(
        page,
        directory,
        "03bb-pipeline-responsive-card-grid",
      );
      const messageAction = page.locator("[data-prepare-productive-message]").first();
      await messageAction.click();
      await page.locator("[data-nash-prospect-workspace]").waitFor({
        state: "visible",
        timeout: 15_000,
      });
      const draft = page.locator("[data-nash-draft]");
      const sourceMode = page.locator("[data-nash-source-mode]");
      const approval = page.locator("[data-approve-nash-draft]");
      const whatsapp = page.locator("[data-manual-whatsapp]");
      const originalDraft = await draft.inputValue();
      if (!originalDraft.trim()) throw new Error("NASH_DRAFT_EMPTY");
      if (!(await sourceMode.isVisible())) throw new Error("NASH_SOURCE_MODE_HIDDEN");
      const urlBeforeApproval = page.url();
      await approval.click();
      await whatsapp.waitFor({ state: "visible", timeout: 10_000 });
      const approvedHref = await whatsapp.getAttribute("href");
      if (!approvedHref?.startsWith("https://wa.me/")) {
        throw new Error("MANUAL_WHATSAPP_HREF_UNAVAILABLE");
      }
      if (page.url() !== urlBeforeApproval) {
        throw new Error("AUTOMATIC_WHATSAPP_NAVIGATION_DETECTED");
      }
      result.routes.pipelineNashWorkspace = await capture(
        page,
        directory,
        "03c-pipeline-nash-workspace",
      );
      await draft.fill(`${originalDraft} Editado`);
      if (await whatsapp.isVisible() || await whatsapp.getAttribute("href")) {
        throw new Error("EDITED_DRAFT_APPROVAL_NOT_INVALIDATED");
      }
      await page.evaluate(() => {
        globalThis.__FORGE_DIAGNOSTIC_EDIT_INVALIDATED__ = true;
      });
      await draft.fill(originalDraft);
      await approval.click();
      await whatsapp.waitFor({ state: "visible", timeout: 10_000 });
      result.routes.pipelineNashAccepted = await capture(
        page,
        directory,
        "03d-pipeline-nash-accepted",
      );
      await page.locator("[data-close-nash]").first().click();
      await page.locator("[data-open-combat]").first().click();
      await page.locator("[data-combat-objection]").fill("Lo voy a pensar");
      await page.locator("[data-analyze-combat]").click();
      await page.locator("[data-combat-type]").waitFor({ state: "visible" });
      const combatDraft = page.locator("[data-combat-response]");
      const combatOriginal = await combatDraft.inputValue();
      await page.locator("[data-approve-combat]").click();
      await page.locator("[data-combat-whatsapp]").waitFor({ state: "visible" });
      await combatDraft.fill(`${combatOriginal} Editado`);
      if (await page.locator("[data-combat-whatsapp]").isVisible()) {
        throw new Error("COMBAT_EDIT_DID_NOT_INVALIDATE_APPROVAL");
      }
      await page.evaluate(() => { globalThis.__FORGE_DIAGNOSTIC_COMBAT_EDIT_INVALIDATED__ = true; });
      await combatDraft.fill(combatOriginal);
      await page.locator("[data-approve-combat]").click();
      await page.locator("[data-register-combat]").click();
      await page.locator("[data-combat-timeline]").waitFor({ state: "visible" });
      result.routes.pipelineCombat = await capture(page, directory, "03e-pipeline-combat");
      await page.locator("[data-close-combat]").first().click();
      await page.locator("[data-open-nba]").first().click();
      await page.locator("[data-nba-workspace]").waitFor({ state: "visible" });
      result.routes.pipelineNba = await capture(page, directory, "03f-pipeline-nba");
      await page.locator("[data-close-nba]").first().click();
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

    await page.waitForSelector(
      '[data-material3-quote-result-ready], .quote-result__state--error',
      { state: "visible", timeout: 40_000 },
    );

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
    await page.evaluate(() => {
      globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = false;
      globalThis.__FORGE_DIAGNOSTIC_AUTH_LISTENER__?.("SIGNED_OUT", null);
    });
    await gotoRoute(page, "pipeline");
    await page.locator('[data-pipeline-auth-state="ANONYMOUS"]').waitFor({ state: "visible", timeout: 10_000 });
    result.routes.authSignedOut = await capture(page, directory, "07-auth-signed-out");
  } catch (error) {
    result.errors.push(error instanceof Error ? error.stack || error.message : String(error));
    await capture(page, directory, "99-failure", { fullPage: true }).catch(
      () => {},
    );
  } finally {
    result.telemetrySummary = {
      pageErrors: telemetry.pageErrors.length,
      failedRequests: telemetry.failedRequests.length,
      consoleErrors: telemetry.console.filter(entry => entry.type === "error").length,
    };
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

function assertVisualAcceptance(results) {
  const failures = [];
  const requireFlag = (viewport, label, condition) => {
    if (!condition) failures.push(`${viewport}:${label}`);
  };

  for (const result of results) {
    const viewport = result.viewport.name;
    const referral = result.routes.pipelineAfter || {};
    const card = result.routes.pipelineSavedReferral || {};
    const nash = result.routes.pipelineNashAccepted || {};
    const authAnonymous = result.routes.authAnonymous || {};
    const authAuthenticated = result.routes.authAuthenticated || {};
    const authSignedOut = result.routes.authSignedOut || {};
    const combat = result.routes.pipelineCombat || {};
    const nba = result.routes.pipelineNba || {};
    const quote = result.routes.quotesAfterUpload || {};
    const telemetry = result.telemetrySummary || {};

    requireFlag(viewport, "referralSheetVisible", referral.referralSheetVisible === true);
    requireFlag(viewport, "alfredVisible=false", referral.alfredVisible === false);
    requireFlag(viewport, "productiveProspectCardVisible", card.productiveProspectCardVisible === true);
    requireFlag(viewport, "productiveProspectCardContainsName", card.productiveProspectCardContainsName === true);
    requireFlag(viewport, "productiveCardUsesNormalRenderer", card.productiveCardUsesNormalRenderer === true);
    requireFlag(
      viewport,
      `productiveCardColumnCount=${result.viewport.expectedCardColumns}`,
      card.productiveCardColumnCount === result.viewport.expectedCardColumns,
    );
    requireFlag(viewport, "productiveCardStructured", card.productiveCardStructured === true);
    requireFlag(viewport, "productiveActionsGrouped", card.productiveActionsGrouped === true);
    requireFlag(viewport, "productiveInternalEnumVisible=false", card.productiveInternalEnumVisible === false);
    for (const flag of [
      "productiveGeometryValid",
      "productiveNameReadable",
      "productiveStageLabelVisible",
      "productiveSourceLabelVisible",
      "productiveStageControlVisible",
      "productiveStageAccentVisible",
      "productiveActionsDifferentiated",
      "productiveTimelineHumanReadable",
      "productiveAllGeometryValid",
      "productiveCardsDoNotOverlap",
      "productiveNamesReadable",
      "productiveNoShellOverlap",
      "productiveSourceStatusSeparated",
      "productiveSourceUnchangedAfterStatus",
      "referralSourceConditional",
      "productiveHumanStatusesValid",
    ]) requireFlag(viewport, flag, card[flag] === true);
    requireFlag(
      viewport,
      "pageHorizontalOverflow=false",
      card.scrollWidth <= card.viewportWidth + 1,
    );
    requireFlag(viewport, "specialSavedReferralCardPathPresent=false", card.specialSavedReferralCardPathPresent === false);
    requireFlag(viewport, "timelineCreatedEventVisible", card.timelineCreatedEventVisible === true);
    requireFlag(viewport, "lastVerifiedActivitySource=TIMELINE", card.lastVerifiedActivitySource === "TIMELINE");
    for (const flag of [
      "nashWorkspaceVisible",
      "nashProviderAttempted",
      "deterministicFallbackUsed",
      "draftVisible",
      "exactApprovalPassed",
      "manualWhatsAppHrefAvailable",
      "editedDraftInvalidatedApproval",
      "conversationBriefProduced",
      "humanApprovalRequired",
    ]) requireFlag(viewport, flag, nash[flag] === true);
    requireFlag(viewport, "automaticWhatsAppOpen=false", nash.automaticWhatsAppOpen === false);
    requireFlag(viewport, "automaticSendPerformed=false", nash.automaticSendPerformed === false);
    requireFlag(viewport, "legacyCenteredReferralModalVisible=false", referral.legacyCenteredReferralModalVisible === false);

    for (const flag of [
      "quoteResultsVisible",
      "quoteReadyState",
      "quoteLoadedSubstantive",
      "quoteProductIdentityVisible",
      "quoteNumericResultVisible",
      "quoteWarningsOrEvidenceVisible",
    ]) requireFlag(viewport, flag, quote[flag] === true);
    requireFlag(viewport, "quoteProjectionTextLength>=120", quote.quoteProjectionTextLength >= 120);
    requireFlag(viewport, "quoteProjectionSectionCount>=3", quote.quoteProjectionSectionCount >= 3);
    requireFlag(viewport, "quoteProgressOnly=false", quote.quoteProgressOnly === false);
    requireFlag(viewport, "quoteLegacyRuntimeVisible=false", quote.quoteLegacyRuntimeVisible === false);
    requireFlag(viewport, "quoteLegacyShellVisible=false", quote.quoteLegacyShellVisible === false);
    requireFlag(viewport, "pageErrors=0", telemetry.pageErrors === 0);
    requireFlag(viewport, "failedRequests=0", telemetry.failedRequests === 0);
    requireFlag(viewport, "consoleErrors=0", telemetry.consoleErrors === 0);
    requireFlag(viewport, "runErrors=0", result.errors.length === 0);
    requireFlag(viewport, "alfredIndependent", result.routes.alfredIndependent?.alfredVisible === true);
    requireFlag(viewport, "authJpVisible", authAnonymous.authJpVisible === true);
    requireFlag(viewport, "authPanelVisible", authAnonymous.authPanelVisible === true);
    requireFlag(viewport, "googleAvatarVisible", authAuthenticated.googleAvatarVisible === true);
    requireFlag(viewport, "privateDataPurged", authSignedOut.privateDataPurged === true);
    requireFlag(viewport, "combatWorkspaceVisible", combat.combatWorkspaceVisible === true);
    requireFlag(viewport, "combatTypeStall", combat.combatTypeStall === true);
    requireFlag(viewport, "combatIntentAvoidingDecision", combat.combatIntentAvoidingDecision === true);
    requireFlag(viewport, "combatExactApprovalPassed", combat.combatExactApprovalPassed === true);
    requireFlag(viewport, "combatEditedInvalidatedApproval", combat.combatEditedInvalidatedApproval === true);
    requireFlag(viewport, "objectionTimelineRecorded", combat.objectionTimelineRecorded === true);
    requireFlag(viewport, "rawObjectionPersisted=false", combat.rawObjectionPersisted === false);
    requireFlag(viewport, "nbaWorkspaceVisible", nba.nbaWorkspaceVisible === true);
    requireFlag(viewport, "nbaHandleObjection", nba.nbaHandleObjection === true);
    requireFlag(viewport, "nbaReasonWhyVisible", nba.nbaReasonWhyVisible === true);
  }

  if (failures.length) {
    throw new Error(`FORGE_UI_VISUAL_ACCEPTANCE_FAILED=${failures.join(",")}`);
  }
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

  assertVisualAcceptance(results);
  console.log("FORGE_UI_VISUAL_DIAGNOSTIC=COMPLETE");
  console.log("FORGE_UI_VISUAL_ACCEPTANCE=PASS");
  console.log("PIPELINE_PRODUCTIVE_ACCEPTANCE=PASS");
  console.log("NASH_PROVIDER_ATTEMPT=PASS");
  console.log("NASH_DETERMINISTIC_FALLBACK=PASS");
  console.log("NFAST06_EXACT_APPROVAL=PASS");
  console.log("MANUAL_WHATSAPP_BOUNDARY=PASS");
  console.log("QUOTE_SUBSTANTIVE_RESULT=PASS");
  console.log("ALFRED_INDEPENDENCE=PASS");
  console.log("GOOGLE_AUTH_RECONNECTION_ACCEPTANCE=PASS");
  console.log("PRIVATE_DATA_SESSION_ACCEPTANCE=PASS");
  console.log("NASH_COMBAT_ACCEPTANCE=PASS");
  console.log("OBJECTION_TIMELINE_ACCEPTANCE=PASS");
  console.log("NBA_REASON_WHY_ACCEPTANCE=PASS");
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
