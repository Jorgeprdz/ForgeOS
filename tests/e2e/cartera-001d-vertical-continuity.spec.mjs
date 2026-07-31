import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const root = process.cwd();
const script = path => resolve(root, path);
const prospectReference = "11111111-1111-4111-8111-111111111111";
const evidenceReference = "document:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

async function loadRuntime(page) {
  await page.addScriptTag({ path: script("platform/event-evidence/quote-lifecycle-supabase-service.js") });
  await page.addScriptTag({ path: script("platform/event-evidence/prospect-quote-detail-projection.js") });
  await page.addScriptTag({ path: script("platform/event-evidence/cartera-vertical-continuity-contract.js") });
  await page.addScriptTag({ path: script("advisor-os/sales-pipeline/prospect-quote-detail-projection-ui.js") });
  await page.addScriptTag({
    path: script("docs/static-preview/quote-preview-live/forge-quote-lifecycle-browser-bridge-cartera001b.js"),
    type: "module",
  });
  await page.waitForFunction(() => Boolean(window.ForgeQuoteLifecycleBrowserBridgeCartera001B));
}

test("reviewed Quote reaches durable history, Timeline and Productive Prospect Detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:system-ui;margin:0;padding:16px;background:#f7f2fa;color:#1d1b20}
    button{font:inherit}dialog{width:min(94vw,620px);border:0;border-radius:24px;padding:0}
    dialog article{padding:18px}.forge-prospect-secondary{margin-top:12px}
  </style></head><body><button data-open-prospect="${prospectReference}">Abrir prospecto</button></body></html>`);
  await loadRuntime(page);

  const result = await page.evaluate(async ({ prospectReference, evidenceReference }) => {
    const state = {
      history: [],
      timeline: [],
      rpcCalls: [],
      sequence: 0,
      quoteReference: "quote:22222222-2222-4222-8222-222222222222",
      quoteVersionReference: "quote-version:33333333-3333-4333-8333-333333333333",
    };
    const nextRecordedAt = occurredAt => new Date(Date.parse(occurredAt) + (++state.sequence * 1000)).toISOString();
    const pushHistory = ({ eventId, eventType, lifecycleState, occurredAt, evidenceReferences, freshnessMetadata }) => {
      state.history.push({
        quote_reference: state.quoteReference,
        quote_version_reference: state.quoteVersionReference,
        prospect_id: prospectReference,
        product_reference: "product:orvi",
        lifecycle_state: lifecycleState,
        event_id: eventId,
        event_type: eventType,
        occurred_at: occurredAt,
        recorded_at: nextRecordedAt(occurredAt),
        evidence_references: evidenceReferences,
        freshness_metadata: freshnessMetadata,
        confirmation_state: "CONFIRMED",
        contract_version: "CARTERA-001B.1",
      });
    };
    const createQuery = () => {
      const filters = {};
      let before = null;
      return {
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        order() { return this; },
        lt(key, value) { if (key === "occurred_at") before = value; return this; },
        async limit(limit) {
          const rows = state.history
            .filter(row => Object.entries(filters).every(([key, value]) => row[key] === value))
            .filter(row => !before || row.occurred_at < before)
            .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at)
              || right.recorded_at.localeCompare(left.recorded_at))
            .slice(0, limit);
          return { data: rows, error: null };
        },
      };
    };
    const client = {
      auth: {
        async getUser() {
          return { data: { user: { id: "advisor-001d" } }, error: null };
        },
      },
      from() { return createQuery(); },
      async rpc(name, params) {
        state.rpcCalls.push({ name, params });
        if (name === "forge_cartera001b_confirm_reviewed_quote") {
          const createdId = "quote-event:44444444-4444-4444-8444-444444444444";
          const reviewedId = "quote-event:55555555-5555-4555-8555-555555555555";
          pushHistory({
            eventId: createdId,
            eventType: "QUOTE_CREATED",
            lifecycleState: "DRAFT",
            occurredAt: params.p_occurred_at,
            evidenceReferences: params.p_source_evidence_references,
            freshnessMetadata: params.p_freshness_metadata,
          });
          pushHistory({
            eventId: reviewedId,
            eventType: "QUOTE_REVIEW_CONFIRMED",
            lifecycleState: "REVIEWED",
            occurredAt: new Date(Date.parse(params.p_occurred_at) + 1).toISOString(),
            evidenceReferences: params.p_source_evidence_references,
            freshnessMetadata: params.p_freshness_metadata,
          });
          return {
            data: {
              quoteReference: state.quoteReference,
              quoteVersionReference: state.quoteVersionReference,
              prospectReference,
              productReference: "product:orvi",
              lifecycleState: "REVIEWED",
              eventIds: [createdId, reviewedId],
              idempotentReplay: false,
              snapshotDigest: "a".repeat(64),
            },
            error: null,
          };
        }
        if (name === "forge_cartera001b_append_quote_lifecycle_event") {
          const presented = params.p_event_type === "QUOTE_PRESENTED";
          const eventId = presented
            ? "quote-event:66666666-6666-4666-8666-666666666666"
            : "quote-event:77777777-7777-4777-8777-777777777777";
          const lifecycleState = presented ? "PRESENTED" : "PROSPECT_ACCEPTED";
          pushHistory({
            eventId,
            eventType: params.p_event_type,
            lifecycleState,
            occurredAt: params.p_occurred_at,
            evidenceReferences: params.p_evidence_references,
            freshnessMetadata: { status: "reviewed_current_session", source: "cartera001d_browser" },
          });
          const timelineId = presented
            ? "88888888-8888-4888-8888-888888888888"
            : "99999999-9999-4999-8999-999999999999";
          state.timeline.push({
            id: timelineId,
            prospect_id: prospectReference,
            event_source: "QUOTE_AUTHORITY",
            event_type: presented ? "PROPOSAL_PRESENTED" : "DECISION_RECORDED",
            occurred_at: params.p_occurred_at,
            source_record_reference: eventId,
            payload: presented
              ? { productReference: "product:orvi", quoteReference: state.quoteReference }
              : { decisionCode: "QUOTE_ACCEPTED", reasonCode: params.p_decision_reason_code },
          });
          return {
            data: {
              eventId,
              quoteReference: state.quoteReference,
              quoteVersionReference: state.quoteVersionReference,
              prospectReference,
              lifecycleState,
              prospectTimelineEventId: timelineId,
              idempotentReplay: false,
            },
            error: null,
          };
        }
        return { data: null, error: { code: "UNEXPECTED_RPC", message: name } };
      },
    };

    const ui = window.ForgeProspectQuoteDetailProjectionUICartera001C;
    const bridge = window.ForgeQuoteLifecycleBrowserBridgeCartera001B;
    ui.bind({ client, document });
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-open-prospect]")) return;
      document.querySelector("[data-prospect-detail-dialog]")?.remove();
      document.body.insertAdjacentHTML("beforeend", `<dialog data-prospect-detail-dialog open><article><header><h2>Prospecto</h2></header><div class="forge-prospect-detail-actions"></div><details class="forge-prospect-secondary"><summary>Más información</summary></details><footer><button>Cerrar</button></footer></article></dialog>`);
    });

    bridge.setProspectContext({ prospectReference });
    bridge.configureClientProvider(() => client);
    const reviewSnapshot = {
      packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
      reviewOnly: true,
      acceptedQuote: { product: "ORVI", source: { pdfSha256: "a".repeat(64) } },
      calculation: { product: "ORVI" },
      authority: { finalAuthority: "HUMAN" },
      safety: { rawPdfAllowed: false },
    };
    const confirmationReceipt = await bridge.captureReviewedQuoteLifecycle({ reviewSnapshot });
    const presentedReceipt = await bridge.appendQuoteLifecycleEvent({
      quoteReference: confirmationReceipt.quoteReference,
      quoteVersionReference: confirmationReceipt.quoteVersionReference,
      eventType: "QUOTE_PRESENTED",
      occurredAt: "2026-07-30T20:01:00.000Z",
      sourceRecordReference: "quote-source:cartera001d-presentation",
      evidenceReferences: [evidenceReference],
      idempotencyKey: "cartera001d-presented",
    });
    const acceptedReceipt = await bridge.appendQuoteLifecycleEvent({
      quoteReference: confirmationReceipt.quoteReference,
      quoteVersionReference: confirmationReceipt.quoteVersionReference,
      eventType: "QUOTE_PROSPECT_ACCEPTED",
      occurredAt: "2026-07-30T20:02:00.000Z",
      sourceRecordReference: "quote-source:cartera001d-decision",
      evidenceReferences: [evidenceReference],
      decisionReasonCode: "CLIENT_CONFIRMED",
      idempotencyKey: "cartera001d-accepted",
    });
    window.__cartera001d = { state, confirmationReceipt, presentedReceipt, acceptedReceipt };
    return {
      confirmationReceipt,
      presentedReceipt,
      acceptedReceipt,
      rpcNames: state.rpcCalls.map(call => call.name),
    };
  }, { prospectReference, evidenceReference });

  expect(result.confirmationReceipt.status).toBe("PERSISTED");
  expect(result.presentedReceipt.lifecycleState).toBe("PRESENTED");
  expect(result.acceptedReceipt.lifecycleState).toBe("PROSPECT_ACCEPTED");
  expect(result.rpcNames).toEqual([
    "forge_cartera001b_confirm_reviewed_quote",
    "forge_cartera001b_append_quote_lifecycle_event",
    "forge_cartera001b_append_quote_lifecycle_event",
  ]);

  await page.locator(`[data-open-prospect="${prospectReference}"]`).click();
  const section = page.locator("[data-cartera001c-quote-detail]");
  await expect(section).toHaveAttribute("data-state", "READY");
  await expect(section.getByText("Aceptada", { exact: true })).toBeVisible();
  await expect(section.getByText("Prospecto aceptó la cotización", { exact: true })).toBeVisible();
  await expect(section.locator('[data-source-authority="QUOTE_AUTHORITY"]')).toHaveCount(4);
  await expect(section).not.toContainText(evidenceReference);
  await expect(section).not.toContainText("Prima");

  const continuityResult = await page.evaluate(() => {
    const { state, confirmationReceipt, presentedReceipt, acceptedReceipt } = window.__cartera001d;
    const projection = window.ForgeProspectQuoteDetailProjectionCartera001C
      .createProspectQuoteDetailProjection({
        prospectReference: confirmationReceipt.prospectReference,
        rows: state.history,
      });
    const renderedText = document.querySelector("[data-cartera001c-quote-detail]")?.innerText || "";
    return window.ForgeCarteraVerticalContinuityContract001D.validateCarteraVerticalContinuity({
      prospectReference: confirmationReceipt.prospectReference,
      confirmationReceipt,
      lifecycleReceipts: [presentedReceipt, acceptedReceipt],
      quoteHistoryRows: state.history,
      timelineRows: state.timeline,
      projection,
      renderedText,
    });
  });
  expect(continuityResult.valid).toBe(true);
  expect(continuityResult.errors).toEqual([]);
  expect(continuityResult.summary.finalLifecycleState).toBe("PROSPECT_ACCEPTED");

  mkdirSync("artifacts/cartera001d-browser", { recursive: true });
  await page.screenshot({ path: "artifacts/cartera001d-browser/vertical-prospect-detail.png", fullPage: true });
});

test("reviewed Quote without Prospect identity remains non-durable and orphan-free", async ({ page }) => {
  await page.goto("/");
  await page.setContent("<!doctype html><html><body><p data-material3-quotes-status></p></body></html>");
  await loadRuntime(page);
  const result = await page.evaluate(async () => {
    let rpcCalls = 0;
    const client = {
      auth: { async getUser() { return { data: { user: { id: "advisor-001d" } }, error: null }; } },
      rpc: async () => { rpcCalls += 1; return { data: null, error: null }; },
      from: () => ({ select() { return this; }, eq() { return this; }, order() { return this; }, async limit() { return { data: [], error: null }; } }),
    };
    const bridge = window.ForgeQuoteLifecycleBrowserBridgeCartera001B;
    bridge.setProspectContext(null);
    bridge.configureClientProvider(() => client);
    const capture = await bridge.captureReviewedQuoteLifecycle({
      reviewSnapshot: {
        reviewOnly: true,
        acceptedQuote: { product: "ORVI" },
        calculation: { product: "ORVI" },
      },
    });
    return { capture, rpcCalls };
  });
  expect(result.capture.status).toBe("BLOCKED_IDENTITY_REQUIRED");
  expect(result.capture.durable).toBe(false);
  expect(result.rpcCalls).toBe(0);
});
