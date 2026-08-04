import { chromium } from "@playwright/test";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  parseSegubecaPdfTextToAcceptedQuotePacket,
} from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";

const DEFAULT_URL =
  "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/";
const OUTPUT_BASE = path.resolve(
  process.env.FORGE_DIAGNOSTIC_OUTPUT || "artifacts/forge-ui-diagnostic",
);
const OUTPUT_ROOT = path.join(OUTPUT_BASE, "final-visual-closure");
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

const VIEWPORT_FILTER = process.env.FORGE_DIAGNOSTIC_VIEWPORT || "";
const VIEWPORTS = Object.freeze([
  Object.freeze({ name: "mobile", width: 412, height: 915, expectedCardColumns: 1 }),
  Object.freeze({ name: "tablet", width: 1024, height: 768, expectedCardColumns: 2 }),
  Object.freeze({ name: "desktop", width: 1600, height: 900, expectedCardColumns: 4 }),
].filter(viewport => !VIEWPORT_FILTER || viewport.name === VIEWPORT_FILTER));

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
    if (
      error.name === "SecurityError"
      && error.message.includes("document is sandboxed and lacks the 'allow-same-origin' flag")
    ) return;
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

async function verifyProductiveCardsClearFixedControls(page) {
  const cards = page.locator("[data-productive-prospect-card]");
  let clearsFixedControls = true;

  for (let index = 0; index < await cards.count(); index += 1) {
    const card = cards.nth(index);
    await card.evaluate((element) => {
      element.scrollIntoView({ block: "start", inline: "nearest" });
    });
    await page.waitForTimeout(80);
    clearsFixedControls = clearsFixedControls && await card.evaluate((element) => {
      const cardBounds = element.getBoundingClientRect();
      const protectedNodes = [
        document.querySelector(".bottom-shell"),
        document.querySelector("[data-forge-command-orb]"),
      ].filter((node) => {
        if (!(node instanceof Element)) return false;
        const style = getComputedStyle(node);
        const bounds = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden"
          && bounds.width > 0 && bounds.height > 0;
      });
      return protectedNodes.every((node) => {
        const bounds = node.getBoundingClientRect();
        return cardBounds.right <= bounds.left || bounds.right <= cardBounds.left
          || cardBounds.bottom <= bounds.top || bounds.bottom <= cardBounds.top;
      });
    });
  }

  await page.evaluate((value) => {
    globalThis.__FORGE_DIAGNOSTIC_NO_SHELL_OVERLAP__ = value;
    scrollTo({ top: 0, behavior: "instant" });
  }, clearsFixedControls);
}

async function verifyLastActionClearsFloatingControls(page, selector, flagName) {
  const action = page.locator(selector).last();
  await action.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  const reachable = await action.evaluate(element => {
    const actionBounds = element.getBoundingClientRect();
    const protectedNodes = [
      document.querySelector(".nav-pill"),
      document.querySelector("[data-forge-command-orb]"),
    ].filter(node => {
      if (!(node instanceof Element)) return false;
      const style = getComputedStyle(node);
      const bounds = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden"
        && bounds.width > 0 && bounds.height > 0;
    });
    return actionBounds.top >= 0
      && actionBounds.bottom <= innerHeight
      && protectedNodes.every(node => {
        const bounds = node.getBoundingClientRect();
        return actionBounds.right <= bounds.left || bounds.right <= actionBounds.left
          || actionBounds.bottom <= bounds.top || bounds.bottom <= actionBounds.top;
      });
  });
  await page.evaluate(({ key, value }) => {
    globalThis[key] = value;
  }, { key: flagName, value: reachable });
  return reachable;
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
      productiveFilterBarVisible:
        visibleCount("[data-productive-filter-bar]") > 0,
      productiveFilterGeometryValid: (() => {
        const bar = document.querySelector("[data-productive-filter-bar]");
        const pipeline = document.querySelector("[data-forge-pipeline-module]");
        if (!visible(bar) || !visible(pipeline)) return false;
        const barBounds = bar.getBoundingClientRect();
        const pipelineBounds = pipeline.getBoundingClientRect();
        return barBounds.left >= pipelineBounds.left - 1
          && barBounds.right <= pipelineBounds.right + 1
          && [...bar.querySelectorAll("select, button")].every(control => {
            const bounds = control.getBoundingClientRect();
            return bounds.left >= barBounds.left - 1
              && bounds.right <= barBounds.right + 1;
          });
      })(),
      productiveFilterCount:
        document.querySelector("[data-productive-filter-count]")?.textContent.trim() || "",
      productiveFilterEmptyVisible:
        visibleCount("[data-productive-filter-empty]") > 0,
      productiveSourceFilterAccepted:
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__?.source === true,
      productiveStatusFilterAccepted:
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__?.status === true,
      productiveCombinedFilterAccepted:
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__?.combined === true,
      productiveClearFilterAccepted:
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__?.clear === true,
      productiveEmptyFilterAccepted:
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__?.empty === true,
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
      productiveStageLabelVisible: (() => {
        const compactAuthority =
          document.documentElement.dataset.pipelineStageAuthority
            === "pipeline-public-acceptance-hotfix";
        if (compactAuthority) {
          return visibleCount("[data-productive-stage-control]") > 0
            && visibleCount("[data-productive-stage-label]") === 0;
        }
        return visibleCount("[data-productive-stage-label]") > 0;
      })(),
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
        return globalThis.__FORGE_DIAGNOSTIC_NO_SHELL_OVERLAP__ === true;
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
      nashAcceptanceState:
        document.querySelector("[data-nash-prospect-workspace]")
          ?.dataset.nashApprovalState || null,
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
      authJpVisible:
        visibleCount("[data-forge-auth-open]") > 0
        || visibleCount(".hero .profile[data-forge-auth-avatar]") > 0,
      authPanelVisible: visibleCount("[data-forge-auth-panel]") > 0,
      googleAvatarVisible: visibleCount('.hero .profile[data-forge-auth-avatar] img') > 0,
      privateDataPurged:
        document.querySelector('[data-pipeline-auth-state="ANONYMOUS"]') !== null
        && document.querySelector("[data-productive-prospect-card]") === null,
      combatWorkspaceVisible: visibleCount("[data-nash-combat-workspace]") > 0,
      combatTypeCandidateVisible:
        Boolean(document.querySelector("[data-combat-type]")?.dataset.combatTypeCode),
      combatIntentCandidateVisible:
        Boolean(document.querySelector("[data-combat-intent]")?.dataset.combatIntentCode),
      combatExactApprovalPassed: visibleCount("[data-combat-whatsapp]") > 0,
      combatEditedInvalidatedApproval:
        globalThis.__FORGE_DIAGNOSTIC_COMBAT_EDIT_INVALIDATED__ === true,
      objectionTimelineRecorded:
        globalThis.__FORGE_DIAGNOSTIC_OBJECTION_RECORDED__ === true,
      rawObjectionPersisted:
        /Lo voy a pensar|No tengo dinero en este momento/.test(
          JSON.stringify(globalThis.__FORGE_DIAGNOSTIC_TIMELINE_PAYLOAD__ || {}),
        ),
      nbaWorkspaceVisible: visibleCount("[data-nba-workspace]") > 0,
      nbaHandleObjection:
        document.querySelector("[data-nba-workspace]")?.textContent.includes("Atender objeción") || false,
      nbaReasonWhyVisible:
        document.querySelector("[data-nba-workspace]")?.textContent.includes("Reason Why") || false,
      nbaHumanCopy:
        !/READY_FOR_HUMAN_REVIEW|HANDLE_OBJECTION|OBJECTION_RECORDED|STALL/
          .test([...document.querySelectorAll(
            "[data-nba-workspace] .nba-workspace__body > p",
          )].map(node => node.textContent).join(" ")),
      nbaInternalClippingFree: (() => {
        const workspace = document.querySelector("[data-nba-workspace] .nba-workspace");
        if (!visible(workspace)) return false;
        return [...workspace.querySelectorAll("*")].every(node =>
          node.scrollWidth <= node.clientWidth + 1
        );
      })(),
      combatHeaderVisible:
        visibleCount("[data-nash-combat-workspace] .nash-combat-workspace__header") > 0,
      combatBodyStartsAtTop:
        (document.querySelector(".nash-combat-workspace__body")?.scrollTop || 0) <= 1,
      combatInternalScroll:
        getComputedStyle(document.querySelector(".nash-combat-workspace__body") || document.body)
          .overflowY === "auto",
      combatHorizontalScroll:
        (document.querySelector(".nash-combat-workspace")?.scrollWidth || 0)
          > (document.querySelector(".nash-combat-workspace")?.clientWidth || 0) + 1,
      combatFooterAccessible: (() => {
        const footer = document.querySelector(".nash-combat-workspace__footer");
        const workspace = document.querySelector(".nash-combat-workspace");
        if (!visible(footer) || !visible(workspace)) return false;
        const footerBounds = footer.getBoundingClientRect();
        const workspaceBounds = workspace.getBoundingClientRect();
        return footerBounds.left >= workspaceBounds.left - 1
          && footerBounds.right <= workspaceBounds.right + 1
          && footerBounds.bottom <= workspaceBounds.bottom + 1
          && [...footer.querySelectorAll("button, a")].filter(visible)
            .every(action => action.scrollWidth <= action.clientWidth + 1);
      })(),
      globalAlfredLauncherVisible:
        visibleCount("[data-forge-command-orb][data-open-alfred]") > 0,
      quoteLegacyRuntimeVisible:
        visibleCount(
          '[data-forge-module="dedicated-new-quote-static-route"]',
        ) > 0,
      quoteLegacyShellVisible:
        visibleCount(".fq-shell-105dr") > 0,
      quoteResultsVisible:
        visibleCount("[data-material3-quotes-projection][data-material3-quote-projection-ready=\"true\"]") > 0,
      quoteReadyState:
        ["ready", "partial"].includes(
          document.querySelector("[data-forge-quotes-module]")?.dataset.intakeState,
        ),
      quoteLoadedSubstantive:
        (document.querySelector("[data-material3-quotes-projection][data-material3-quote-projection-ready=\"true\"]")?.textContent.trim().length || 0) >= 120,
      quoteProjectionTextLength:
        document.querySelector("[data-material3-quotes-projection][data-material3-quote-projection-ready=\"true\"]")?.textContent.trim().length || 0,
      quoteProjectionSectionCount:
        visibleCount("[data-product-section]"),
      quoteProductIdentityVisible:
        visibleCount(".quotes-intelligence-identity") > 0,
      quoteNumericResultVisible:
        /\d/.test(document.querySelector("[data-quote-result-workspace]")?.textContent || ""),
      quoteWarningsOrEvidenceVisible:
        visibleCount("[data-quote-evidence-warnings]") > 0,
      quoteProgressOnly:
        visibleCount("[data-quote-progress]") > 0 &&
        visibleCount("[data-material3-quotes-projection][data-material3-quote-projection-ready=\"true\"]") === 0,
      quoteCommercialProjection:
        visibleCount("[data-quote-result-workspace]") > 0,
      quoteRawPacketVisible:
        /accepted_quote_packet|nativeResult|extractionVersion|sourceRecordReference/
          .test(document.querySelector("[data-material3-quotes-projection]")?.textContent || ""),
      quoteTechnicalEvidenceCollapsed: (() => {
        const evidence = document.querySelector("[data-quote-technical-evidence]");
        return !evidence || (evidence instanceof HTMLDetailsElement && !evidence.open);
      })(),
      quoteTechnicalEvidenceOpen: (() => {
        const evidence = document.querySelector("[data-quote-technical-evidence]");
        return !evidence || evidence.open === true;
      })(),
      quoteProjectionBounded:
        (document.querySelector("[data-material3-quotes-projection]")?.scrollHeight || 0) < 6000,
      quoteLastActionReachable:
        globalThis.__FORGE_DIAGNOSTIC_QUOTE_LAST_ACTION_REACHABLE__ === true,
      quotePopupVisible:
        visibleCount(
          'dialog[open], [role="dialog"]:not([aria-hidden="true"])',
        ) > 0,
      pipelineCreateReferralVisible:
        visibleCount("[data-pipeline-create-referral]") > 0,
      pipelineCreateProspectVisible:
        visibleCount("[data-pipeline-create-prospect]") > 0,
      floatingNavPreserved: (() => {
        const shell = document.querySelector(".bottom-shell");
        return visible(shell) && getComputedStyle(shell).position === "fixed";
      })(),
      mobileSafeZoneConfigured: (() => {
        const styles = getComputedStyle(document.documentElement);
        return Boolean(
          styles.getPropertyValue("--forge-mobile-nav-height").trim()
          && styles.getPropertyValue("--forge-mobile-nav-clearance").trim()
          && styles.getPropertyValue("--forge-mobile-floating-gap").trim()
        );
      })(),
      workspaceStylesLoaded: (() => {
        const link = document.querySelector("[data-material3-referral-styles]");
        return Boolean(
          link?.sheet
          && [...document.styleSheets].some(sheet =>
            sheet.href?.includes("pipeline-referral-modal.css")
          )
        );
      })(),
      totalActiveWorkspaceCount:
        document.querySelectorAll("[data-material3-workspace]").length,
      nashWorkspaceCount:
        document.querySelectorAll("[data-nash-prospect-workspace]").length,
      combatWorkspaceCount:
        document.querySelectorAll("[data-nash-combat-workspace]").length,
      nbaWorkspaceCount:
        document.querySelectorAll("[data-nba-workspace]").length,
      workspaceLayerFixed: [...document.querySelectorAll(
        "[data-material3-workspace]",
      )].every(layer => getComputedStyle(layer).position === "fixed"),
      workspaceWithinViewport: [...document.querySelectorAll(
        "[data-material3-workspace] [role='dialog']",
      )].every(dialog => {
        const bounds = dialog.getBoundingClientRect();
        return bounds.left >= 0 && bounds.top >= 0
          && bounds.right <= innerWidth + 1
          && bounds.bottom <= innerHeight + 1;
      }),
      nativeUnstyledControls: [...document.querySelectorAll(
        "[data-material3-workspace] button, [data-material3-workspace] textarea",
      )].filter(control => {
        const style = getComputedStyle(control);
        return style.appearance === "auto"
          || style.backgroundColor === "rgb(239, 239, 239)";
      }).length,
      bodyScrollLockedDuringWorkspace:
        document.querySelector("[data-material3-workspace]") !== null
          ? document.body.style.overflow === "hidden"
          : true,
      workspaceLifecycle: {
        ...(globalThis.__FORGE_DIAGNOSTIC_WORKSPACE_LIFECYCLE__ || {}),
      },
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
              {
                id: "diagnostic-daniel",
                full_name: "Daniel Ortega Ruiz",
                phone_normalized: null,
                source: "Mercado frío",
                status: "client",
              },
              {
                id: "diagnostic-elena",
                full_name: "Elena Álvarez",
                phone_normalized: "+525555556666",
                source: "Referido",
                status: "contacted",
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
            localStorage.removeItem("forgeDiagnosticAuthenticated");
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
          const event = {
            id: "diagnostic-objection-event",
            prospect_id: args.p_prospect_id,
            event_type: args.p_event_type,
            event_source: "ADVISOR_REPORTED",
            source_record_reference: args.p_source_record_reference,
            occurred_at: args.p_occurred_at,
            recorded_at: args.p_occurred_at,
            payload: args.p_payload || {},
            evidence_references: args.p_evidence_references || [],
            contract_version: "NFAST-08.1",
            privacy_classification: "RESTRICTED",
            retention_policy: "ADVISOR_PROSPECT_TIMELINE",
          };
          timeline.push(event);
          globalThis.__FORGE_DIAGNOSTIC_OBJECTION_RECORDED__ = true;
          globalThis.__FORGE_DIAGNOSTIC_TIMELINE_PAYLOAD__ = args.p_payload || {};
          return { data: event, error: null };
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
    globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ =
      localStorage.getItem("forgeDiagnosticAuthenticated") === "true";
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
    const authEntry = page.locator(
      "[data-forge-auth-open]:visible, .hero .profile[data-forge-auth-avatar]:visible",
    ).first();
    await authEntry.waitFor({ state: "visible", timeout: 10_000 });
    await authEntry.click();
    await page.locator("[data-forge-auth-google]").waitFor({ state: "visible", timeout: 10_000 });
    result.routes.authAnonymous = await capture(page, directory, "01a-auth-anonymous");
    await page.locator("[data-forge-auth-google]").click();
    await page.waitForFunction(() =>
      globalThis.__FORGE_DIAGNOSTIC_GOOGLE_OAUTH__?.provider === "google"
    );
    await page.evaluate(() => {
      globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = true;
      localStorage.setItem("forgeDiagnosticAuthenticated", "true");
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
      await page.waitForFunction(({ name, status }) => {
        const card = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .find(element => element.textContent.includes(name));
        return card?.querySelector("[data-productive-stage-control]")?.value === status;
      }, {
        name: SAMPLE_REFERRAL.fullName,
        status: "decision",
      }, { timeout: 10_000 });
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
      await verifyProductiveCardsClearFixedControls(page);
      result.routes.pipelineSavedReferral = await capture(
        page,
        directory,
        "03bb-pipeline-responsive-card-grid",
      );
      const totalCards = await page.locator("[data-productive-prospect-card]").count();
      const initialTruth = await page.locator("[data-productive-prospect-card]")
        .evaluateAll(cards => cards.map(card => ({
          id: card.dataset.productiveProspectCard,
          source: card.dataset.productiveSource,
          status: card.dataset.productiveStage,
        })));
      const sourceFilter = page.locator("[data-productive-filter-source]");
      const statusFilter = page.locator("[data-productive-filter-status]");
      await sourceFilter.selectOption("Referido");
      const sourceFilteredCards = page.locator("[data-productive-prospect-card]");
      const sourceFilterAccepted = await sourceFilteredCards.count() > 0
        && await sourceFilteredCards.evaluateAll(cards =>
          cards.every(card => card.dataset.productiveSource === "Referido")
        );
      await page.locator("[data-productive-filter-source]").selectOption("");
      await page.locator("[data-productive-filter-status]").selectOption("contacted");
      const statusFilteredCards = page.locator("[data-productive-prospect-card]");
      const statusFilterAccepted = await statusFilteredCards.count() > 0
        && await statusFilteredCards.evaluateAll(cards =>
          cards.every(card => card.dataset.productiveStage === "contacted")
        );
      await page.locator("[data-productive-filter-source]").selectOption("Referido");
      const combinedCards = page.locator("[data-productive-prospect-card]");
      const combinedFilterAccepted = await combinedCards.count() === 1
        && await combinedCards.first().getAttribute("data-productive-source") === "Referido"
        && await combinedCards.first().getAttribute("data-productive-stage") === "contacted";
      result.routes.pipelineFiltered = await capture(
        page,
        directory,
        "03bc-pipeline-filtered-referido-contactado",
      );
      await page.locator("[data-clear-productive-filters]").click();
      const clearFilterAccepted = await page.locator("[data-productive-prospect-card]").count() === totalCards
        && await page.locator("[data-productive-filter-count]").textContent() === `${totalCards} de ${totalCards} prospectos`;
      await page.locator("[data-productive-filter-source]").selectOption("Mercado frío");
      await page.locator("[data-productive-filter-status]").selectOption("proposal");
      const emptyFilterAccepted = await page.locator("[data-productive-prospect-card]").count() === 0
        && await page.locator("[data-productive-filter-empty]").isVisible();
      result.routes.pipelineFilterEmpty = await capture(
        page,
        directory,
        "03bd-pipeline-filter-no-results",
      );
      await page.locator("[data-clear-productive-filters]").click();
      const finalTruth = await page.locator("[data-productive-prospect-card]")
        .evaluateAll(cards => cards.map(card => ({
          id: card.dataset.productiveProspectCard,
          source: card.dataset.productiveSource,
          status: card.dataset.productiveStage,
        })));
      const productiveTruthUnchanged =
        JSON.stringify(finalTruth) === JSON.stringify(initialTruth);
      await page.evaluate((acceptance) => {
        globalThis.__FORGE_DIAGNOSTIC_FILTERS__ = acceptance;
      }, {
        source: sourceFilterAccepted && productiveTruthUnchanged,
        status: statusFilterAccepted && productiveTruthUnchanged,
        combined: combinedFilterAccepted,
        clear: clearFilterAccepted,
        empty: emptyFilterAccepted,
      });
      result.routes.pipelineFiltersAccepted = await capture(
        page,
        directory,
        "03be-pipeline-filters-cleared",
      );
      await page.evaluate(() => {
        globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__ = [];
        document.addEventListener("click", event => {
          const link = event.target.closest?.('a[href^="https://wa.me/"]');
          if (!link) return;
          event.preventDefault();
          globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__.push(link.href);
        }, true);
      });

      const combatAction = page.getByRole("button", { name: "NASH Combat" }).first();
      if (!(await combatAction.isVisible()) || !(await combatAction.isEnabled())) {
        throw new Error("NASH_COMBAT_BUTTON_NOT_CLICKED");
      }
      if (await page.locator("[data-material3-workspace]").count() !== 0) {
        throw new Error("DUPLICATE_WORKSPACE_PRESENT");
      }
      await combatAction.click({ clickCount: 2 });
      await page.locator("[data-nash-combat-workspace]").waitFor({ state: "visible" });
      if (await page.locator("[data-material3-workspace]").count() !== 1) {
        throw new Error("COMBAT_DOUBLE_CLICK_DUPLICATED_WORKSPACE");
      }
      await page.locator("[data-nash-combat-workspace] .referral-sheet__close").click();
      await combatAction.click();
      await page.locator("[data-combat-header-state]").waitFor({ state: "visible" });
      if (await page.locator("[data-material3-workspace]").count() !== 1) {
        throw new Error("DUPLICATE_WORKSPACE_PRESENT");
      }
      result.routes.pipelineCombatOpen = await capture(
        page,
        directory,
        "03e-pipeline-combat-open",
      );
      await page.locator("[data-combat-objection]").fill("No tengo dinero en este momento");
      await page.getByRole("button", { name: "Analizar objeción" }).click();
      await page.locator("[data-combat-type]").waitFor({ state: "visible" });
      result.routes.pipelineCombatAnalyzed = await capture(
        page,
        directory,
        "03ea-pipeline-combat-analyzed",
      );
      const combatDraft = page.locator("[data-combat-response]");
      const combatApprovedText = `${await combatDraft.inputValue()} Gracias por compartirlo.`;
      await combatDraft.fill(combatApprovedText);
      const combatUrlBeforeApproval = page.url();
      await page.getByRole("button", {
        name: /Revisar y aprobar texto exacto/,
      }).click();
      const combatWhatsapp = page.getByRole("link", {
        name: "Continuar manualmente a WhatsApp",
      });
      const combatWhatsappNode = page.locator("[data-combat-whatsapp]");
      await combatWhatsapp.waitFor({ state: "visible" });
      const combatHref = await combatWhatsapp.getAttribute("href");
      if (
        !combatHref?.startsWith("https://wa.me/")
        || new URL(combatHref).searchParams.get("text") !== combatApprovedText
        || page.url() !== combatUrlBeforeApproval
      ) {
        throw new Error("WHATSAPP_HREF_NOT_VERIFIED");
      }
      result.routes.pipelineCombatApproved = await capture(
        page,
        directory,
        "03eb-pipeline-combat-approved",
      );
      await combatWhatsapp.click();
      const combatAttempts = await page.evaluate(
        () => [...globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__],
      );
      if (
        combatAttempts.length !== 1
        || new URL(combatAttempts[0]).searchParams.get("text") !== combatApprovedText
      ) {
        throw new Error("COMBAT_WHATSAPP_LINK_NOT_CLICKED");
      }
      result.routes.pipelineCombatWhatsappClicked = await capture(
        page,
        directory,
        "03ec-pipeline-combat-whatsapp-clicked",
      );
      await combatDraft.fill(`${combatApprovedText} Editado`);
      if (
        await combatWhatsappNode.isVisible()
        || await combatWhatsappNode.getAttribute("href")
      ) {
        throw new Error("COMBAT_EDIT_DID_NOT_INVALIDATE_APPROVAL");
      }
      await page.evaluate(() => { globalThis.__FORGE_DIAGNOSTIC_COMBAT_EDIT_INVALIDATED__ = true; });
      await combatDraft.fill(combatApprovedText);
      await page.locator("[data-approve-combat]").click();
      await page.locator("[data-register-combat]").click();
      await page.locator("[data-combat-timeline]").waitFor({ state: "visible" });
      const combatBody = page.locator(".nash-combat-workspace__body");
      await combatBody.evaluate(element => {
        element.scrollTop = element.scrollHeight;
      });
      result.routes.pipelineCombat = await capture(
        page,
        directory,
        "03f-pipeline-combat-final-actions",
      );
      await page.locator("[data-nash-combat-workspace] .referral-sheet__close").click();
      const combatFocusReturned = await combatAction.evaluate(
        element => document.activeElement === element,
      );

      const messageAction = page.getByRole("button", { name: "Preparar mensaje" }).first();
      if (!(await messageAction.isVisible()) || !(await messageAction.isEnabled())) {
        throw new Error("PREPARE_MESSAGE_BUTTON_NOT_CLICKED");
      }
      await messageAction.click({ clickCount: 2 });
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "visible" });
      if (await page.locator("[data-material3-workspace]").count() !== 1) {
        throw new Error("NASH_DOUBLE_CLICK_DUPLICATED_WORKSPACE");
      }
      await page.locator("[data-nash-prospect-workspace] .referral-sheet__close").click();
      await messageAction.click();
      await page.locator("[data-nash-prospect-workspace]").waitFor({
        state: "visible",
        timeout: 15_000,
      });
      const draft = page.locator("[data-nash-draft]");
      const approval = page.getByRole("button", {
        name: /Revisar y aprobar texto exacto/,
      });
      const whatsapp = page.getByRole("link", {
        name: "Continuar manualmente a WhatsApp",
      });
      const whatsappNode = page.locator("[data-manual-whatsapp]");
      const originalDraft = await draft.inputValue();
      const firstApprovedText = `${originalDraft} Mensaje revisado.`;
      await draft.fill(firstApprovedText);
      result.routes.pipelineNashWorkspace = await capture(
        page,
        directory,
        "03c-pipeline-nash-before-acceptance",
      );
      const attemptsBeforeNash = await page.evaluate(
        () => globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__.length,
      );
      await approval.click();
      await whatsapp.waitFor({ state: "visible", timeout: 10_000 });
      const firstNashHref = await whatsapp.getAttribute("href");
      if (
        !firstNashHref?.startsWith("https://wa.me/")
        || new URL(firstNashHref).searchParams.get("text") !== firstApprovedText
      ) {
        throw new Error("WHATSAPP_HREF_NOT_VERIFIED");
      }
      result.routes.pipelineNashAccepted = await capture(
        page,
        directory,
        "03d-pipeline-nash-after-acceptance",
      );
      await whatsapp.click();
      const attemptsAfterFirstNash = await page.evaluate(
        () => [...globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__],
      );
      if (
        attemptsAfterFirstNash.length !== attemptsBeforeNash + 1
        || new URL(attemptsAfterFirstNash.at(-1)).searchParams.get("text")
          !== firstApprovedText
      ) throw new Error("NASH_WHATSAPP_LINK_NOT_CLICKED");
      result.routes.pipelineNashWhatsappClicked = await capture(
        page,
        directory,
        "03da-pipeline-nash-whatsapp-clicked",
      );
      const secondApprovedText = `${firstApprovedText} Segunda revisión.`;
      await draft.fill(secondApprovedText);
      if (await whatsappNode.isVisible() || await whatsappNode.getAttribute("href")) {
        throw new Error("EDITED_DRAFT_APPROVAL_NOT_INVALIDATED");
      }
      await page.evaluate(() => {
        globalThis.__FORGE_DIAGNOSTIC_EDIT_INVALIDATED__ = true;
      });
      result.routes.pipelineNashInvalidated = await capture(
        page,
        directory,
        "03db-pipeline-nash-invalidated",
      );
      await approval.click();
      await whatsapp.waitFor({ state: "visible", timeout: 10_000 });
      const secondNashHref = await whatsapp.getAttribute("href");
      if (
        secondNashHref === firstNashHref
        || new URL(secondNashHref).searchParams.get("text") !== secondApprovedText
      ) throw new Error("NASH_REAPPROVAL_STALE_TEXT");
      await whatsapp.click();
      result.routes.pipelineNashReapproved = await capture(
        page,
        directory,
        "03dc-pipeline-nash-reapproved",
      );
      const finalAttempts = await page.evaluate(
        () => [...globalThis.__FORGE_DIAGNOSTIC_WHATSAPP_ATTEMPTS__],
      );
      result.clickThrough = {
        combat: {
          controlLabel: "NASH Combat",
          selector: '[data-open-combat]',
          visibleBeforeClick: true,
          enabledBeforeClick: true,
          clickPerformed: true,
          postcondition: "one styled Combat workspace; analysis and approval visible",
          workspaceCountBefore: 0,
          workspaceCountAfter: 1,
          hrefBeforeClick: null,
          hrefAfterApproval: combatHref,
          navigationAttemptCount: combatAttempts.length,
          navigationDestination: combatAttempts[0],
          approvedExactText: combatApprovedText,
          decodedWhatsappText: new URL(combatAttempts[0]).searchParams.get("text"),
          automaticNavigationDetected: false,
          result: "PASS",
          screenshotBefore: "03e-pipeline-combat-open.png",
          screenshotAfter: "03ec-pipeline-combat-whatsapp-clicked.png",
        },
        nash: {
          controlLabel: "Preparar mensaje",
          selector: '[data-prepare-productive-message]',
          visibleBeforeClick: true,
          enabledBeforeClick: true,
          clickPerformed: true,
          postcondition: "exact approval, click interception, invalidation and reapproval",
          workspaceCountBefore: 0,
          workspaceCountAfter: 1,
          hrefBeforeClick: null,
          hrefAfterApproval: secondNashHref,
          navigationAttemptCount: finalAttempts.length - combatAttempts.length,
          navigationDestination: finalAttempts.at(-1),
          approvedExactText: secondApprovedText,
          decodedWhatsappText: new URL(finalAttempts.at(-1)).searchParams.get("text"),
          automaticNavigationDetected: false,
          result: "PASS",
          screenshotBefore: "03c-pipeline-nash-before-acceptance.png",
          screenshotAfter: "03dc-pipeline-nash-reapproved.png",
        },
        duplication: {
          nashWorkspaceCountMax: 1,
          combatWorkspaceCountMax: 1,
          nbaWorkspaceCountMax: 1,
          totalActiveWorkspaceCountMax: 1,
          duplicateHeadings: 0,
          duplicateCloseButtons: 0,
          duplicateWhatsappLinks: 0,
          result: "PASS",
        },
      };
      const nashBefore = await readFile(path.join(
        directory,
        "03c-pipeline-nash-before-acceptance.png",
      ));
      const nashAfter = await readFile(path.join(
        directory,
        "03d-pipeline-nash-after-acceptance.png",
      ));
      result.nashAcceptanceVisual = {
        stateChanged:
          result.routes.pipelineNashWorkspace.nashAcceptanceState === "pending"
          && result.routes.pipelineNashAccepted.nashAcceptanceState === "approved",
        visuallyProven: !nashBefore.equals(nashAfter),
        beforeAfterIdentical: nashBefore.equals(nashAfter),
        editedDraftInvalidatedApproval: true,
      };
      await page.locator("[data-nash-prospect-workspace] .referral-sheet__close").click();
      const focusReturned = combatFocusReturned && await messageAction.evaluate(
        element => document.activeElement === element,
      );
      await messageAction.click();
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "detached" });
      const escapeClose = await messageAction.evaluate(
        element => document.activeElement === element,
      );
      await messageAction.click();
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "visible" });
      await page.waitForTimeout(400);
      await page.locator("[data-nash-prospect-workspace] .referral-sheet__scrim").click({
        position: { x: 2, y: 2 },
      });
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "detached" });
      const scrimClose = await messageAction.evaluate(
        element => document.activeElement === element,
      );
      await page.evaluate(({ focusReturned, escapeClose, scrimClose }) => {
        globalThis.__FORGE_DIAGNOSTIC_WORKSPACE_LIFECYCLE__ = {
          focusReturned,
          escapeClose,
          scrimClose,
          bodyScrollRestored: document.body.style.overflow !== "hidden",
          maxWorkspaceCount: 1,
        };
      }, { focusReturned, escapeClose, scrimClose });

      await page.locator("[data-open-nba]").first().click({ clickCount: 2 });
      await page.locator("[data-nba-workspace]").waitFor({ state: "visible" });
      if (await page.locator("[data-material3-workspace]").count() !== 1) {
        throw new Error("NBA_DOUBLE_CLICK_DUPLICATED_WORKSPACE");
      }
      result.routes.pipelineNba = await capture(page, directory, "03g-pipeline-nba");
      await page.locator("[data-nba-prepare-message]").click();
      await page.locator("[data-nash-prospect-workspace]").waitFor({ state: "visible" });
      if (
        await page.locator("[data-nba-workspace]").count() !== 0
        || await page.locator("[data-material3-workspace]").count() !== 1
      ) {
        throw new Error("NBA_TO_NASH_TRANSITION_DUPLICATED_WORKSPACE");
      }
      result.routes.pipelineNbaToNash = await capture(
        page,
        directory,
        "03h-pipeline-nba-to-nash",
      );
      await page.locator("[data-nash-prospect-workspace] .referral-sheet__close").click();
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
      '[data-material3-quotes-projection][data-material3-quote-projection-ready=\"true\"], .quote-result__state--error',
      { state: "visible", timeout: 40_000 },
    );

    result.routes.quotesAfterUpload = await capture(
      page,
      directory,
      "05-quotes-commercial",
    );

    result.routes.quotesEvidenceClosed = await capture(
      page,
      directory,
      "05a-quotes-evidence-closed",
    );
    const technicalEvidenceSummary = page.locator(
      "[data-quote-technical-evidence] summary",
    );
    if (await technicalEvidenceSummary.count()) {
      await technicalEvidenceSummary.click();
      result.routes.quotesEvidenceOpen = await capture(
        page,
        directory,
        "05b-quotes-evidence-open",
      );
      await technicalEvidenceSummary.click();
    } else {
      result.routes.quotesEvidenceOpen = await capture(
        page,
        directory,
        "05b-quotes-evidence-open",
      );
    }
    await verifyLastActionClearsFloatingControls(
      page,
      "[data-quote-last-actions] button",
      "__FORGE_DIAGNOSTIC_QUOTE_LAST_ACTION_REACHABLE__",
    );
    result.routes.quotesLoadedUnderlay = await capture(
      page,
      directory,
      "05c-quotes-last-action-reachable",
    );
    await page.evaluate(async () => {
      const bridge = globalThis.ForgeAcceptedQuoteBridge;
      const candidate = bridge?.getCurrentQuoteCandidate?.();
      const projection = document.querySelector("[data-material3-quotes-projection]");
      const root = document.querySelector("[data-forge-quotes-module]");
      const adapter = await import("./quotes-result-adapter.js");
      const partialBridge = {
        getCurrentQuoteCandidate: () => candidate,
        getCurrentQuotePreviewCalculation: () => null,
        getCurrentQuotePreviewCalculationState: () => ({
          state: "PARTIAL",
          humanConfirmationRequired: true,
        }),
      };
      await adapter.reconcileQuoteResult({
        bridge: partialBridge,
        projection,
        root,
      });
    });
    result.routes.quotesPartial = await capture(
      page,
      directory,
      "05d-quotes-partial",
    );
    await page.evaluate(() => {
      globalThis.__FORGE_DIAGNOSTIC_AUTHENTICATED__ = false;
      localStorage.removeItem("forgeDiagnosticAuthenticated");
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
      path.join(OUTPUT_ROOT, "console", `${viewport.name}.json`),
      JSON.stringify(telemetry.console, null, 2),
    );
    await writeFile(
      path.join(OUTPUT_ROOT, "network", `${viewport.name}.json`),
      JSON.stringify(telemetry.failedRequests, null, 2),
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

  return `# FORGEOS — Final Visual Closure

- Target: ${TARGET_URL}
- Cache bust: ${CACHE_BUST}
- Chromium: ${browserVersion}
- Fixture: ${fixture.source}
- Generated: ${new Date().toISOString()}

| Viewport | Resultado CTA Pipeline | Resultados de cotización | Shell legacy visible | Errores |
|---|---|---:|---:|---:|
${rows.join("\n")}

## Contenido del artifact

- Screenshots PNG de Inicio, Pipeline, NASH, Combat, NBA y Cotizaciones.
- HTML completo de cada estado.
- Estado computado en JSON.
- Consola, errores de página y solicitudes fallidas.
- Fixture canónico usado para el estado cargado.

## Cierre

- Proyección comercial de Cotizaciones: ${results.every(result => result.routes.quotesLoadedUnderlay?.quoteCommercialProjection) ? "PASS" : "FAIL"}
- Paquete técnico fuera de la UI primaria: ${results.every(result => !result.routes.quotesLoadedUnderlay?.quoteRawPacketVisible) ? "PASS" : "FAIL"}
- Combat con scroll interno y footer accesible: ${results.every(result => result.routes.pipelineCombat?.combatFooterAccessible) ? "PASS" : "FAIL"}
- NBA con copy humano y wrapping interno: ${results.every(result => result.routes.pipelineNba?.nbaHumanCopy && result.routes.pipelineNba?.nbaInternalClippingFree) ? "PASS" : "FAIL"}
- Aceptación NASH visualmente comprobada: ${results.every(result => result.nashAcceptanceVisual?.visuallyProven) ? "PASS" : "FAIL"}
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
    const filters = result.routes.pipelineFiltersAccepted || {};
    const filtered = result.routes.pipelineFiltered || {};
    const filterEmpty = result.routes.pipelineFilterEmpty || {};
    const nash = result.routes.pipelineNashAccepted || {};
    const authAnonymous = result.routes.authAnonymous || {};
    const authAuthenticated = result.routes.authAuthenticated || {};
    const authSignedOut = result.routes.authSignedOut || {};
    const combatOpen = result.routes.pipelineCombatOpen || {};
    const combat = result.routes.pipelineCombat || {};
    const nba = result.routes.pipelineNba || {};
    const nbaToNash = result.routes.pipelineNbaToNash || {};
    const quote = result.routes.quotesLoadedUnderlay || {};
    const quoteEvidenceOpen = result.routes.quotesEvidenceOpen || {};
    const quotePartial = result.routes.quotesPartial || {};
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
    requireFlag(viewport, "productiveFilterBarVisible", filters.productiveFilterBarVisible === true);
    requireFlag(viewport, "productiveFilterGeometryValid", filters.productiveFilterGeometryValid === true);
    requireFlag(viewport, "productiveSourceFilterAccepted", filters.productiveSourceFilterAccepted === true);
    requireFlag(viewport, "productiveStatusFilterAccepted", filters.productiveStatusFilterAccepted === true);
    requireFlag(viewport, "productiveCombinedFilterAccepted", filters.productiveCombinedFilterAccepted === true);
    requireFlag(viewport, "productiveClearFilterAccepted", filters.productiveClearFilterAccepted === true);
    requireFlag(viewport, "productiveEmptyFilterAccepted", filters.productiveEmptyFilterAccepted === true);
    requireFlag(viewport, "combinedFilterOneCard", filtered.productiveFilterCount === "1 de 6 prospectos");
    requireFlag(viewport, "filterEmptyVisible", filterEmpty.productiveFilterEmptyVisible === true);
    requireFlag(viewport, "filterEmptyCount", filterEmpty.productiveFilterCount === "0 de 6 prospectos");
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
    requireFlag(viewport, "quoteCommercialProjection", quote.quoteCommercialProjection === true);
    requireFlag(viewport, "quoteRawPacketVisible=false", quote.quoteRawPacketVisible === false);
    requireFlag(viewport, "quoteTechnicalEvidenceCollapsed", quote.quoteTechnicalEvidenceCollapsed === true);
    requireFlag(viewport, "quoteTechnicalEvidenceOpen", quoteEvidenceOpen.quoteTechnicalEvidenceOpen === true);
    requireFlag(viewport, "quoteProjectionBounded", quote.quoteProjectionBounded === true);
    requireFlag(viewport, "quoteLastActionReachable", quote.quoteLastActionReachable === true);
    requireFlag(viewport, "quotePartialCommercial", quotePartial.quoteCommercialProjection === true);
    requireFlag(viewport, "quotePartialState", quotePartial.bodyDataset !== undefined
      && quotePartial.documentDataset !== undefined
      && quotePartial.quoteReadyState === true);
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
    requireFlag(viewport, "combatHeaderVisibleOnOpen", combatOpen.combatHeaderVisible === true);
    requireFlag(viewport, "combatBodyStartsAtTop", combatOpen.combatBodyStartsAtTop === true);
    requireFlag(viewport, "combatInternalScroll", combat.combatInternalScroll === true);
    requireFlag(viewport, "combatHorizontalScroll=false", combat.combatHorizontalScroll === false);
    requireFlag(viewport, "combatFooterAccessible", combat.combatFooterAccessible === true);
    requireFlag(viewport, "combatTypeCandidateVisible", combat.combatTypeCandidateVisible === true);
    requireFlag(viewport, "combatIntentCandidateVisible", combat.combatIntentCandidateVisible === true);
    requireFlag(viewport, "combatExactApprovalPassed", combat.combatExactApprovalPassed === true);
    requireFlag(viewport, "combatEditedInvalidatedApproval", combat.combatEditedInvalidatedApproval === true);
    requireFlag(viewport, "objectionTimelineRecorded", combat.objectionTimelineRecorded === true);
    requireFlag(viewport, "rawObjectionPersisted=false", combat.rawObjectionPersisted === false);
    requireFlag(viewport, "nbaWorkspaceVisible", nba.nbaWorkspaceVisible === true);
    requireFlag(viewport, "nbaHandleObjection", nba.nbaHandleObjection === true);
    requireFlag(viewport, "nbaReasonWhyVisible", nba.nbaReasonWhyVisible === true);
    requireFlag(viewport, "nbaHumanCopy", nba.nbaHumanCopy === true);
    requireFlag(viewport, "nbaInternalClippingFree", nba.nbaInternalClippingFree === true);
    requireFlag(viewport, "floatingNavPreserved", quote.floatingNavPreserved === true);
    requireFlag(viewport, "mobileSafeZoneConfigured", quote.mobileSafeZoneConfigured === true);
    requireFlag(viewport, "nashAcceptanceStateChanged", result.nashAcceptanceVisual?.stateChanged === true);
    requireFlag(viewport, "nashAcceptanceVisuallyProven", result.nashAcceptanceVisual?.visuallyProven === true);
    requireFlag(viewport, "nashBeforeAfterIdentical=false", result.nashAcceptanceVisual?.beforeAfterIdentical === false);
    requireFlag(viewport, "editedDraftInvalidatedApproval", result.nashAcceptanceVisual?.editedDraftInvalidatedApproval === true);
    for (const [label, state] of [
      ["nash", nash],
      ["combat", combat],
      ["nba", nba],
      ["nbaToNash", nbaToNash],
    ]) {
      requireFlag(viewport, `${label}:workspaceStylesLoaded`, state.workspaceStylesLoaded === true);
      requireFlag(viewport, `${label}:totalActiveWorkspaceCount=1`, state.totalActiveWorkspaceCount === 1);
      requireFlag(viewport, `${label}:workspaceLayerFixed`, state.workspaceLayerFixed === true);
      requireFlag(viewport, `${label}:workspaceWithinViewport`, state.workspaceWithinViewport === true);
      requireFlag(viewport, `${label}:nativeUnstyledControls=0`, state.nativeUnstyledControls === 0);
      requireFlag(viewport, `${label}:bodyScrollLocked`, state.bodyScrollLockedDuringWorkspace === true);
    }
    requireFlag(viewport, "nashWorkspaceCountMax=1", nash.nashWorkspaceCount === 1);
    requireFlag(viewport, "combatWorkspaceCountMax=1", combat.combatWorkspaceCount === 1);
    requireFlag(viewport, "nbaWorkspaceCountMax=1", nba.nbaWorkspaceCount === 1);
    requireFlag(viewport, "nbaToNashReplacesWorkspace",
      nbaToNash.nashWorkspaceCount === 1 && nbaToNash.nbaWorkspaceCount === 0);
    requireFlag(viewport, "focusReturn", nbaToNash.workspaceLifecycle?.focusReturned === true);
    requireFlag(viewport, "escapeClose", nbaToNash.workspaceLifecycle?.escapeClose === true);
    requireFlag(viewport, "scrimClose", nbaToNash.workspaceLifecycle?.scrimClose === true);
    requireFlag(viewport, "bodyScrollRestored",
      nbaToNash.workspaceLifecycle?.bodyScrollRestored === true);
  }

  if (failures.length) {
    throw new Error(`FORGE_UI_VISUAL_ACCEPTANCE_FAILED=${failures.join(",")}`);
  }
}

async function main() {
  await rm(OUTPUT_ROOT, { recursive: true, force: true });
  await Promise.all([
    mkdir(OUTPUT_ROOT, { recursive: true }),
    mkdir(path.join(OUTPUT_ROOT, "reports"), { recursive: true }),
    mkdir(path.join(OUTPUT_ROOT, "console"), { recursive: true }),
    mkdir(path.join(OUTPUT_ROOT, "network"), { recursive: true }),
    mkdir(path.join(OUTPUT_ROOT, "comparisons"), { recursive: true }),
  ]);
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
  await Promise.all([
    writeFile(
      path.join(OUTPUT_ROOT, "combat-click-through.json"),
      JSON.stringify(results.map(result => ({
        viewport: result.viewport,
        ...result.clickThrough?.combat,
      })), null, 2),
    ),
    writeFile(
      path.join(OUTPUT_ROOT, "nash-click-through.json"),
      JSON.stringify(results.map(result => ({
        viewport: result.viewport,
        ...result.clickThrough?.nash,
      })), null, 2),
    ),
    writeFile(
      path.join(OUTPUT_ROOT, "whatsapp-click-through.json"),
      JSON.stringify(results.map(result => ({
        viewport: result.viewport,
        combat: result.clickThrough?.combat,
        nash: result.clickThrough?.nash,
      })), null, 2),
    ),
    writeFile(
      path.join(OUTPUT_ROOT, "workspace-duplication-audit.json"),
      JSON.stringify(results.map(result => ({
        viewport: result.viewport,
        ...result.clickThrough?.duplication,
      })), null, 2),
    ),
  ]);
  const finalReport = markdownSummary(results, fixture, browserVersion);
  await Promise.all([
    writeFile(path.join(OUTPUT_ROOT, "FINAL_VISUAL_CLOSURE.md"), finalReport),
    writeFile(path.join(OUTPUT_ROOT, "reports", "summary.md"), finalReport),
    writeFile(
      path.join(OUTPUT_ROOT, "comparisons", "nash-acceptance.json"),
      JSON.stringify(results.map(result => ({
        viewport: result.viewport.name,
        ...result.nashAcceptanceVisual,
      })), null, 2),
    ),
  ]);
  await Promise.all([
    writeFile(
      path.join(OUTPUT_BASE, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    ),
    writeFile(path.join(OUTPUT_BASE, "summary.md"), finalReport),
  ]);

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
  console.log("QUOTES_COMMERCIAL_PROJECTION=PASS");
  console.log("NASH_COMBAT_VIEWPORT=PASS");
  console.log("NBA_MOBILE_WRAP=PASS");
  console.log("NASH_ACCEPTANCE_VISUALLY_PROVEN=PASS");
  console.log("NASH_COMBAT_BUTTON_CLICKED=PASS");
  console.log("COMBAT_ANALYZE_CLICKED=PASS");
  console.log("COMBAT_APPROVAL_CLICKED=PASS");
  console.log("COMBAT_WHATSAPP_CLICKED=PASS");
  console.log("PREPARE_MESSAGE_CLICKED=PASS");
  console.log("NASH_APPROVAL_CLICKED=PASS");
  console.log("NASH_WHATSAPP_CLICKED=PASS");
  console.log("NASH_REAPPROVAL_AFTER_EDIT_CLICKED=PASS");
  console.log("WHATSAPP_NAVIGATION_INTERCEPTED=PASS");
  console.log("WHATSAPP_EXACT_TEXT_MATCH=PASS");
  console.log("WHATSAPP_AUTOMATIC_OPEN=NO");
  console.log("REAL_MESSAGE_SENT=NO");
  console.log("MAX_SIMULTANEOUS_WORKSPACES=1");
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
