import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const {
  assertConfirmedStage,
  createProductiveIntelligenceAdapter,
  reconcileReloadedProspectState,
  reconcileUpdatedProspectState,
} = await import(
  "../docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js?pipeline-stage-authority-test=2"
);

const baseProspect = Object.freeze({
  id: "prospect-1",
  fullName: "Jorge",
  phone: "+525511111111",
  source: "Referido",
  initialContext: "Prueba de persistencia",
  status: "appointment_scheduled",
  updatedAt: "2026-07-30T18:00:00.000Z",
});

const timelineService = Object.freeze({
  async listProspectTimeline() { return []; },
  async appendProspectTimelineEvent() { return null; },
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

test("stage mutation result becomes the immediate card and record authority", () => {
  const originalCard = Object.freeze({
    id: "prospect-1",
    fullName: "Jorge",
    status: "appointment_scheduled",
    stageLabel: "Cita agendada",
    timeline: Object.freeze([]),
    prospect: baseProspect,
  });
  const updatedProspect = Object.freeze({
    ...baseProspect,
    status: "proposal",
    updatedAt: "2026-07-30T18:01:00.000Z",
  });

  const result = reconcileUpdatedProspectState({
    records: [baseProspect],
    cards: [originalCard],
    updatedProspect,
    requestedStatus: "proposal",
  });

  assert.equal(result.records[0], updatedProspect);
  assert.equal(result.cards[0].status, "proposal");
  assert.equal(result.cards[0].stageLabel, "Propuesta");
  assert.equal(result.cards[0].prospect, updatedProspect);
  assert.equal(result.cards[0].timeline, originalCard.timeline);
  assert.notEqual(result.cards[0], originalCard);
});

test("stage mutation fails closed when update or read-after-write does not confirm it", () => {
  assert.throws(
    () => assertConfirmedStage({
      prospect: { id: "prospect-1", status: "appointment_scheduled" },
      requestedStatus: "proposal",
      phase: "read-after-write",
    }),
    error => error?.code === "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH"
      && error?.details?.phase === "read-after-write",
  );
});

test("a stale reload cannot overwrite a recently confirmed stage", () => {
  const confirmed = Object.freeze({
    ...baseProspect,
    status: "proposal",
    updatedAt: "2026-07-30T18:01:00.000Z",
  });
  const result = reconcileReloadedProspectState({
    loadedRecords: [baseProspect],
    confirmations: new Map([["prospect-1", {
      status: "proposal",
      prospect: confirmed,
      confirmedAt: Date.now(),
      mutationId: 1,
    }]]),
  });

  assert.equal(result.records[0].status, "proposal");
  assert.equal(result.confirmations.size, 1);
});

test("adapter verifies Supabase with read-after-write and survives stale concurrent reloads", async () => {
  let persisted = { ...baseProspect };
  let listOverride = null;
  const calls = [];
  const service = {
    async listProspects() {
      calls.push("list");
      if (listOverride) return listOverride();
      return [{ ...persisted }];
    },
    async updateProspect(id, changes) {
      calls.push(`update:${id}:${changes.status}`);
      persisted = {
        ...persisted,
        ...changes,
        updatedAt: "2026-07-30T18:01:00.000Z",
      };
      return { ...persisted };
    },
    async getProspect(id) {
      calls.push(`get:${id}`);
      return { ...persisted };
    },
    async createProspect() { throw new Error("NOT_USED"); },
  };

  const adapter = await createProductiveIntelligenceAdapter({
    service,
    timelineService,
  });
  await adapter.reload();
  assert.equal(adapter.cards[0].status, "appointment_scheduled");

  const stale = deferred();
  listOverride = () => stale.promise;
  const staleReload = adapter.reload();
  await Promise.resolve();

  await adapter.updateStage("prospect-1", "proposal");
  assert.equal(adapter.cards[0].status, "proposal");
  assert.match(calls.join("|"), /update:prospect-1:proposal\|get:prospect-1/);

  stale.resolve([{ ...baseProspect }]);
  await staleReload;
  assert.equal(
    adapter.cards[0].status,
    "proposal",
    "STALE_RELOAD_OVERWROTE_CONFIRMED_STAGE",
  );

  listOverride = async () => [{ ...baseProspect }];
  await adapter.reload();
  assert.equal(
    adapter.cards[0].status,
    "proposal",
    "STALE_LIST_RESPONSE_OVERWROTE_CONFIRMATION",
  );
  assert.equal(adapter.confirmedStages.size, 1);

  listOverride = async () => [{ ...persisted }];
  await adapter.reload();
  assert.equal(adapter.cards[0].status, "proposal");
  assert.equal(adapter.confirmedStages.size, 0);

  const freshAdapter = await createProductiveIntelligenceAdapter({
    service,
    timelineService,
  });
  await freshAdapter.reload();
  assert.equal(
    freshAdapter.cards[0].status,
    "proposal",
    "HARD_RELOAD_DID_NOT_READ_PERSISTED_STAGE",
  );
});

test("adapter rejects a false-positive update and keeps the previous card state", async () => {
  const service = {
    async listProspects() { return [{ ...baseProspect }]; },
    async updateProspect() {
      return {
        ...baseProspect,
        status: "proposal",
        updatedAt: "2026-07-30T18:01:00.000Z",
      };
    },
    async getProspect() { return [{ ...baseProspect }][0]; },
    async createProspect() { throw new Error("NOT_USED"); },
  };
  const adapter = await createProductiveIntelligenceAdapter({
    service,
    timelineService,
  });
  await adapter.reload();

  await assert.rejects(
    () => adapter.updateStage("prospect-1", "proposal"),
    error => error?.code === "PRODUCTIVE_STAGE_PERSISTENCE_MISMATCH"
      && error?.details?.phase === "read-after-write",
  );
  assert.equal(adapter.cards[0].status, "appointment_scheduled");
  assert.equal(adapter.confirmedStages.size, 0);
});

test("only Pipeline module owns stage changes; support layers no longer intercept them", async () => {
  const [interaction, stability] = await Promise.all([
    readFile(
      new URL("../docs/static-preview/forge-alive-material3/pipeline-interaction-authority.js", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../docs/static-preview/forge-alive-material3/pipeline-ui-stability.js", import.meta.url),
      "utf8",
    ),
  ]);

  assert.doesNotMatch(interaction, /installStageAuthority|pendingStages\.set/);
  assert.doesNotMatch(stability, /applyStagePresentation\(card,\s*desired/);
  assert.match(stability, /stageAuthority:\s*"PIPELINE_MODULE"/);
  assert.match(stability, /data-pipeline-stage-authority|pipelineStageAuthority/);
});
