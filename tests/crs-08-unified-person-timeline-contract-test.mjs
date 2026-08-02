import test from "node:test";
import assert from "node:assert/strict";
import contract from "../platform/shared-commercial-model/crs-08-unified-person-timeline-contract.js";

const base = {
  advisorReference: "advisor-1",
  personReference: "person-1",
  relationshipReference: "rel-1",
};
const source = (overrides = {}) => ({
  domain: "PIPELINE",
  recordType: "PROSPECT_SNAPSHOT",
  recordReference: "prospect-1",
  sourceEventReference: "pipeline:prospect-1:v1",
  authority: "PIPELINE_PROSPECT_AUTHORITY",
  personReference: base.personReference,
  relationshipReference: base.relationshipReference,
  correlationId: null,
  title: "Prospecto registrado",
  summary: null,
  occurredAt: "2026-08-01T10:00:00.000Z",
  recordedAt: "2026-08-01T10:00:00.000Z",
  privacyClassification: "PRIVATE",
  confirmationState: "CONFIRMED",
  correctionOf: null,
  facts: { stage: "referred_new" },
  ...overrides,
});
const timeline = entries => contract.createUnifiedPersonTimeline({
  ...base,
  builtAt: "2026-08-01T12:00:00.000Z",
  sourceEntries: entries,
});

test("metadata locks a read-only non-ledger contract", () => {
  assert.equal(contract.CONTRACT_TYPE, "FORGE_UNIFIED_PERSON_TIMELINE");
  assert.equal(contract.SCHEMA_VERSION, "forge.unified_person_timeline.v1");
});

test("creates a canonical Timeline", () => {
  const value = timeline([source()]);
  assert.equal(value.entryCount, 1);
  assert.equal(value.readOnly, true);
  assert.equal(value.secondLedger, false);
  assert.equal(value.truthMutation, false);
});

test("orders occurredAt descending", () => {
  const value = timeline([
    source(),
    source({ domain: "QUOTE", authority: "QUOTE_LIFECYCLE_EVENT_AUTHORITY", recordType: "QUOTE_EVENT", recordReference: "q1", sourceEventReference: "qevt-1", occurredAt: "2026-08-01T11:00:00Z", recordedAt: "2026-08-01T11:00:00Z" }),
  ]);
  assert.equal(value.entries[0].domain, "QUOTE");
});

test("uses recordedAt and sourceEventReference as deterministic ties", () => {
  const value = timeline([
    source({ sourceEventReference: "z", recordedAt: "2026-08-01T10:01:00Z" }),
    source({ sourceEventReference: "a", authority: "OTHER_AUTH", recordReference: "p2" }),
  ]);
  assert.equal(value.entries[0].sourceEventReference, "z");
});

test("deduplicates identical source entries", () => {
  assert.equal(timeline([source(), source()]).entryCount, 1);
});

test("rejects changed duplicate source input", () => {
  assert.throws(() => timeline([source(), source({ title: "Otro" })]), { code: "CRS08_DUPLICATE_SOURCE_CONFLICT" });
});

test("rejects cross-person entries", () => {
  assert.throws(() => timeline([source({ personReference: "person-2" })]), { code: "CRS08_PERSON_LINEAGE_MISMATCH" });
});

test("rejects cross-relationship entries", () => {
  assert.throws(() => timeline([source({ relationshipReference: "rel-2" })]), { code: "CRS08_PERSON_LINEAGE_MISMATCH" });
});

test("rejects recordedAt before occurredAt", () => {
  assert.throws(() => timeline([source({ recordedAt: "2026-08-01T09:00:00Z" })]), { code: "CRS08_RECORDED_BEFORE_OCCURRED" });
});

test("rejects raw sensitive facts", () => {
  assert.throws(() => timeline([source({ facts: { phone: "+525500000000" } })]), { code: "CRS08_SENSITIVE_FACT_FORBIDDEN" });
});

test("marks unconfirmed entries for attention", () => {
  const value = timeline([source({ confirmationState: "REPORTED" })]);
  assert.equal(value.attentionCount, 1);
  assert.equal(value.entries[0].attentionRequired, true);
});

test("marks disputed entries for attention", () => {
  const value = timeline([source({ confirmationState: "DISPUTED" })]);
  assert.equal(value.entries[0].attentionRequired, true);
});

test("resolves append-only correction lineage", () => {
  const original = source({ domain: "ACTIVITY", authority: "FES_ACTIVITY_EVENT_LEDGER", recordType: "ACTIVITY_EVENT", sourceEventReference: "evt-1", recordReference: "evt-1" });
  const correction = source({ domain: "ACTIVITY", authority: "FES_ACTIVITY_EVENT_LEDGER", recordType: "ACTIVITY_EVENT", sourceEventReference: "evt-2", recordReference: "evt-2", correctionOf: "evt-1", occurredAt: "2026-08-01T11:00:00Z", recordedAt: "2026-08-01T11:00:00Z" });
  const value = timeline([original, correction]);
  const old = value.entries.find(entry => entry.sourceEventReference === "evt-1");
  const next = value.entries.find(entry => entry.sourceEventReference === "evt-2");
  assert.equal(old.isCorrected, true);
  assert.equal(next.correctionOf, old.entryReference);
  assert.equal(next.correctionState, "VALID");
});

test("surfaces missing correction targets without inventing truth", () => {
  const value = timeline([source({ domain: "ACTIVITY", authority: "FES_ACTIVITY_EVENT_LEDGER", sourceEventReference: "evt-2", correctionOf: "evt-missing" })]);
  assert.equal(value.entries[0].correctionState, "TARGET_MISSING");
  assert.equal(value.entries[0].attentionRequired, true);
});

test("counts privacy and domains", () => {
  const value = timeline([
    source(),
    source({ domain: "APPLICATION", authority: "APPLICATION_AUTHORITY", recordType: "APPLICATION_EVENT", recordReference: "app-1", sourceEventReference: "app-evt", privacyClassification: "RESTRICTED" }),
  ]);
  assert.equal(value.privacyCounts.PRIVATE, 1);
  assert.equal(value.privacyCounts.RESTRICTED, 1);
  assert.equal(value.domainCounts.APPLICATION, 1);
});

test("validates canonical Timeline digest", () => {
  const value = timeline([source()]);
  assert.deepEqual(contract.assertUnifiedPersonTimeline(value), value);
  assert.equal(contract.validateUnifiedPersonTimeline(value).valid, true);
});

test("rejects source coverage mismatch", () => {
  assert.throws(() => contract.createUnifiedPersonTimeline({
    ...base,
    builtAt: "2026-08-01T12:00:00Z",
    sourceEntries: [source()],
    sourceCoverage: {
      PIPELINE: { status: "AVAILABLE", count: 0 },
      ACTIVITY: { status: "EMPTY", count: 0 },
      QUOTE: { status: "EMPTY", count: 0 },
      APPLICATION: { status: "EMPTY", count: 0 },
      CARTERA: { status: "EMPTY", count: 0 },
    },
  }), { code: "CRS08_SOURCE_COVERAGE_MISMATCH" });
});

test("filters domains, privacy, corrected and attention entries", () => {
  const original = source({ domain: "ACTIVITY", authority: "FES_ACTIVITY_EVENT_LEDGER", sourceEventReference: "evt-1", recordReference: "evt-1" });
  const correction = source({ domain: "ACTIVITY", authority: "FES_ACTIVITY_EVENT_LEDGER", sourceEventReference: "evt-2", recordReference: "evt-2", correctionOf: "evt-1", occurredAt: "2026-08-01T11:00:00Z", recordedAt: "2026-08-01T11:00:00Z", privacyClassification: "SENSITIVE" });
  const value = timeline([original, correction]);
  const filtered = contract.filterTimeline(value, { domains: ["ACTIVITY"], maxPrivacyClassification: "PRIVATE", includeCorrected: false });
  assert.equal(filtered.entryCount, 0);
  assert.equal(filtered.readOnly, true);
});
