import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const eventTarget = new EventTarget();
globalThis.addEventListener = eventTarget.addEventListener.bind(eventTarget);
globalThis.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
globalThis.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.detail = options.detail;
  }
};
globalThis.document = { querySelector: () => null };
globalThis.location = { href: "https://forge.local/?nav=cotizaciones" };

const source = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-quote-lifecycle-browser-bridge-cartera001b.js",
    import.meta.url,
  ),
  "utf8",
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const browserBridge = await import(moduleUrl);

const snapshot = Object.freeze({
  packetType: "ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT",
  reviewOnly: true,
  acceptedQuote: {
    product: "ORVI",
    source: { pdfSha256: "a".repeat(64) },
  },
  calculation: { product: "ORVI" },
  productIntelligence: null,
  authority: { finalAuthority: "HUMAN" },
  safety: { rawPdfAllowed: false },
});

test("missing prospect identity blocks durable persistence without breaking review", async () => {
  browserBridge.setProspectContext(null);
  browserBridge.configureClientProvider(null);
  const output = await browserBridge.captureReviewedQuoteLifecycle({ reviewSnapshot: snapshot });
  assert.equal(output.status, "BLOCKED_IDENTITY_REQUIRED");
  assert.equal(output.durable, false);
});

test("known prospect persists reviewed quote through the RPC", async () => {
  const calls = [];
  browserBridge.setProspectContext({
    prospectReference: "33333333-3333-4333-8333-333333333333",
  });
  browserBridge.configureClientProvider(async () => ({
    auth: {
      async getUser() {
        return { data: { user: { id: "advisor-001" } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push({ name, args });
      return {
        data: {
          quoteReference: "quote:11111111-1111-4111-8111-111111111111",
          quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
          prospectReference: args.p_prospect_id,
          productReference: args.p_product_reference,
          lifecycleState: "REVIEWED",
          eventIds: ["quote-event:1", "quote-event:2"],
          persistenceReceipt: "quote-persist:11111111-1111-4111-8111-111111111111",
          snapshotDigest: "b".repeat(64),
          idempotentReplay: false,
        },
        error: null,
      };
    },
  }));

  const output = await browserBridge.captureReviewedQuoteLifecycle({ reviewSnapshot: snapshot });
  assert.equal(output.status, "PERSISTED");
  assert.equal(output.durable, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "forge_cartera001b_confirm_reviewed_quote");
  assert.equal(calls[0].args.p_review_snapshot.reviewOnly, true);
  assert.equal(calls[0].args.p_product_reference, "product:orvi");
});
