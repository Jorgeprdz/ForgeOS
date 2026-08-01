import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../platform/event-evidence/quote-lifecycle-supabase-service.js");

function fakeClient() {
  const calls = [];
  const history = [{ event_id: "quote-event:1" }];
  const query = {
    select() { return this; },
    eq() { return this; },
    order() { return this; },
    lt() { return this; },
    async limit() { return { data: history, error: null }; },
  };
  return {
    calls,
    auth: {
      async getUser() {
        return { data: { user: { id: "advisor-001" } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push({ name, args });
      if (name === serviceModule.CONFIRM_RPC) {
        return {
          data: {
            quoteReference: "quote:11111111-1111-4111-8111-111111111111",
            quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
          },
          error: null,
        };
      }
      return { data: { eventId: "quote-event:33333333-3333-4333-8333-333333333333" }, error: null };
    },
    from(name) {
      calls.push({ name: "from", args: name });
      return query;
    },
  };
}

test("confirmReviewedQuote uses the governed RPC and no direct insert", async () => {
  const client = fakeClient();
  const service = serviceModule.create(client);
  const output = await service.confirmReviewedQuote({
    prospectReference: "33333333-3333-4333-8333-333333333333",
    productReference: "product:orvi",
    reviewSnapshot: { reviewOnly: true, authority: { finalAuthority: "HUMAN" } },
    sourceRecordReference: "quote-source:abc",
    evidenceReferences: ["document:abc"],
    freshness: { status: "reviewed_current_session" },
    occurredAt: "2026-07-30T23:00:00.000Z",
    idempotencyKey: "cartera001b:confirm:abc",
  });
  assert.equal(output.quoteReference.startsWith("quote:"), true);
  assert.equal(client.calls[0].name, serviceModule.CONFIRM_RPC);
  assert.equal(service.diagnostics().directInsertAllowed, false);
});

test("appendLifecycleEvent carries correction lineage", async () => {
  const client = fakeClient();
  const service = serviceModule.create(client);
  await service.appendLifecycleEvent({
    quoteReference: "quote:11111111-1111-4111-8111-111111111111",
    quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
    eventType: "QUOTE_PRESENTED",
    occurredAt: "2026-07-30T23:10:00.000Z",
    sourceRecordReference: "user-confirmation:presented",
    evidenceReferences: ["user-confirmation:presented"],
    idempotencyKey: "cartera001b:presented",
    correctionOf: "quote-event:old",
  });
  const call = client.calls.find(entry => entry.name === serviceModule.APPEND_RPC);
  assert.equal(call.args.p_correction_of, "quote-event:old");
});

test("history reads only through the governed view", async () => {
  const client = fakeClient();
  const service = serviceModule.create(client);
  const rows = await service.listProspectQuoteHistory(
    "33333333-3333-4333-8333-333333333333",
  );
  assert.equal(rows.length, 1);
  assert.equal(client.calls.some(entry => entry.name === "from" && entry.args === serviceModule.HISTORY_VIEW), true);
});
