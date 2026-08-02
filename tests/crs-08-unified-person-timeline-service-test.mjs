import test from "node:test";
import assert from "node:assert/strict";
import contract from "../platform/shared-commercial-model/crs-08-unified-person-timeline-contract.js";
import serviceModule from "../advisor-os/timeline/crs-08-unified-person-timeline-service.js";
import linksContract from "../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js";

class Query {
  constructor(rows) { this.rows = Array.isArray(rows) ? rows : []; this.filters = []; this.singleMode = false; }
  select() { return this; }
  eq(column, value) { this.filters.push(row => row[column] === value); return this; }
  is(column, value) { this.filters.push(row => row[column] === value); return this; }
  in(column, values) { const set = new Set(values); this.filters.push(row => set.has(row[column])); return this; }
  order() { return this; }
  limit() { return this; }
  single() { this.singleMode = true; return this.execute(); }
  maybeSingle() { this.singleMode = true; return this.execute(); }
  execute() {
    const data = this.rows.filter(row => this.filters.every(filter => filter(row)));
    return Promise.resolve({ data: this.singleMode ? (data[0] || null) : data, error: null });
  }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
}

const person = {
  id: "person-id-1", advisor_id: "advisor-1", person_reference: "person-1",
  display_name: "Persona Uno", lifecycle_state: "CONFIRMED", privacy_classification: "PRIVATE", archived_at: null,
};
const relationshipReference = linksContract.deriveRelationshipReference({ advisorReference: "advisor-1", personReference: "person-1" });
const links = [{ advisor_id: "advisor-1", person_id: "person-id-1", source_identity_type: "PROSPECT", source_record_reference: "prospect-1", effective_to: null }];
function client({ userId = "advisor-1", personRows = [person], linkRows = links, rpc = null } = {}) {
  return {
    auth: { getUser: async () => userId ? ({ data: { user: { id: userId } }, error: null }) : ({ data: {}, error: { code: "AUTH" } }) },
    from(table) {
      if (table === "commercial_people") return new Query(personRows);
      if (table === "commercial_source_identity_links") return new Query(linkRows);
      return new Query([]);
    },
    rpc: rpc || (async () => ({ data: { changes: [], cursor: null, has_more: false }, error: null })),
  };
}
const source = (domain, overrides = {}) => contract.createSourceEntry({
  domain,
  recordType: `${domain}_EVENT`,
  recordReference: `${domain.toLowerCase()}-1`,
  sourceEventReference: `${domain.toLowerCase()}-event-1`,
  authority: `${domain}_AUTHORITY`,
  personReference: "person-1",
  relationshipReference,
  correlationId: null,
  title: `${domain} entry`,
  summary: null,
  occurredAt: "2026-08-01T10:00:00Z",
  recordedAt: "2026-08-01T10:00:00Z",
  privacyClassification: domain === "APPLICATION" ? "RESTRICTED" : "PRIVATE",
  confirmationState: "CONFIRMED",
  correctionOf: null,
  facts: { kind: domain },
  ...overrides,
});
const emptyHistory = async () => ({ status: "EMPTY", reason: null, entries: [] });
const loaders = Object.fromEntries(contract.SOURCE_DOMAINS.map((domain, index) => [domain, async () => [source(domain, {
  sourceEventReference: `${domain.toLowerCase()}-${index}`,
  occurredAt: `2026-08-01T${String(10 + index).padStart(2, "0")}:00:00Z`,
  recordedAt: `2026-08-01T${String(10 + index).padStart(2, "0")}:00:00Z`,
})]]));

test("locks service metadata and read-only diagnostics", () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: loaders, historyLoader: emptyHistory });
  const diagnostics = service.diagnostics();
  assert.equal(serviceModule.SERVICE_VERSION, "CRS-08-UNIFIED-PERSON-TIMELINE-SERVICE-001.1");
  assert.equal(diagnostics.readOnlyProjection, true);
  assert.equal(diagnostics.secondLedger, false);
  assert.equal(diagnostics.timelinePersistence, false);
});

test("composes all five authoritative domains", async () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: loaders, historyLoader: emptyHistory, clock: () => "2026-08-01T20:00:00Z" });
  const timeline = await service.getUnifiedPersonTimeline("person-1");
  assert.equal(timeline.entryCount, 5);
  assert.deepEqual(timeline.entries.map(entry => entry.domain), ["CARTERA", "APPLICATION", "QUOTE", "ACTIVITY", "PIPELINE"]);
  assert.equal(timeline.relationshipReference, relationshipReference);
});

test("records per-domain source coverage", async () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: { ...loaders, QUOTE: async () => [] }, historyLoader: async () => ({ status: "AVAILABLE", reason: null, entries: [source("PIPELINE", { authority: "PIPELINE_STAGE_EVENT_AUTHORITY", sourceEventReference: "foundation-pipeline" })] }) });
  const timeline = await service.getUnifiedPersonTimeline("person-1");
  assert.equal(timeline.sourceCoverage.QUOTE.status, "EMPTY");
  assert.equal(timeline.sourceCoverage.ACTIVITY.status, "AVAILABLE");
  assert.equal(timeline.historyFoundation.status, "AVAILABLE");
  assert.equal(timeline.historyFoundation.entryCount, 1);
  assert.equal(timeline.sourceCoverage.PIPELINE.count, 2);
});

test("degrades one failing source without hiding the status", async () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: { ...loaders, ACTIVITY: async () => { const error = new Error("boom"); error.code = "ACTIVITY_DOWN"; throw error; } }, historyLoader: emptyHistory });
  const timeline = await service.getUnifiedPersonTimeline("person-1");
  assert.equal(timeline.entryCount, 4);
  assert.equal(timeline.sourceCoverage.ACTIVITY.status, "DEGRADED");
  assert.equal(timeline.sourceCoverage.ACTIVITY.reason, "ACTIVITY_DOWN");
});

test("strictSources propagates source failure", async () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: { ...loaders, ACTIVITY: async () => { throw Object.assign(new Error("boom"), { code: "ACTIVITY_DOWN" }); } }, historyLoader: emptyHistory });
  await assert.rejects(() => service.getUnifiedPersonTimeline("person-1", { strictSources: true }), { code: "ACTIVITY_DOWN" });
});

test("missing source reader is explicitly unavailable", async () => {
  const custom = { ...loaders };
  custom.CARTERA = null;
  const service = serviceModule.createService({ client: client(), sourceLoaders: custom, historyLoader: emptyHistory });
  const timeline = await service.getUnifiedPersonTimeline("person-1");
  assert.equal(timeline.sourceCoverage.CARTERA.status, "UNAVAILABLE");
});

test("filters the composed Timeline without re-reading sources", async () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: loaders, historyLoader: emptyHistory });
  const filtered = await service.getFilteredPersonTimeline("person-1", { filter: { domains: ["PIPELINE", "QUOTE"], maxPrivacyClassification: "PRIVATE" } });
  assert.equal(filtered.entryCount, 2);
  assert.equal(filtered.readOnly, true);
});

test("rejects unauthenticated sessions", async () => {
  const service = serviceModule.createService({ client: client({ userId: null }), sourceLoaders: loaders, historyLoader: emptyHistory });
  await assert.rejects(() => service.getUnifiedPersonTimeline("person-1"), { code: "CRS08_AUTH_REQUIRED" });
});

test("rejects inactive CommercialPerson", async () => {
  const service = serviceModule.createService({ client: client({ personRows: [{ ...person, lifecycle_state: "DISPUTED" }] }), sourceLoaders: loaders, historyLoader: emptyHistory });
  await assert.rejects(() => service.getUnifiedPersonTimeline("person-1"), { code: "CRS08_PERSON_NOT_ACTIVE" });
});

test("rejects source entries from another person", async () => {
  const bad = { ...loaders, PIPELINE: async () => [source("PIPELINE", { personReference: "person-2" })] };
  const service = serviceModule.createService({ client: client(), sourceLoaders: bad, historyLoader: emptyHistory });
  await assert.rejects(() => service.getUnifiedPersonTimeline("person-1"), { code: "CRS08_PERSON_LINEAGE_MISMATCH" });
});

test("default Activity loader uses FES pull and filters linked Prospect", async () => {
  const rpcClient = client({ rpc: async (name, params) => {
    assert.equal(name, "forge_fes02_pull_activity_events");
    assert.equal(params.p_limit, 500);
    return { data: { changes: [
      { ledger_record: { event_id: "evt-1", event_type: "APPOINTMENT_HELD", subject_type: "PROSPECT", subject_id: "prospect-1", occurred_at: "2026-08-01T10:00:00Z", recorded_at: "2026-08-01T10:00:00Z", privacy_class: "PRIVATE", confirmation_state: "CONFIRMED", canonical_event: { event_id: "evt-1", event_type: "APPOINTMENT_HELD", subject: { type: "PROSPECT", id: "prospect-1" }, payload: {} } } },
      { ledger_record: { event_id: "evt-2", event_type: "APPOINTMENT_HELD", subject_type: "PROSPECT", subject_id: "other", occurred_at: "2026-08-01T10:00:00Z", recorded_at: "2026-08-01T10:00:00Z", privacy_class: "PRIVATE", confirmation_state: "CONFIRMED", canonical_event: { event_id: "evt-2", event_type: "APPOINTMENT_HELD", subject: { type: "PROSPECT", id: "other" }, payload: {} } } },
    ], cursor: null, has_more: false }, error: null };
  } });
  const entries = await serviceModule._private.loadActivitySource({
    client: rpcClient, user: { id: "advisor-1" }, person,
    prospectReferences: ["prospect-1"], relationshipReference, correlationId: null,
  });
  assert.equal(entries.length, 1);
  assert.equal(entries[0].sourceEventReference, "evt-1");
});

test("source composition never exposes mutation methods", () => {
  const service = serviceModule.createService({ client: client(), sourceLoaders: loaders, historyLoader: emptyHistory });
  assert.equal("append" in service, false);
  assert.equal("createEvent" in service, false);
  assert.equal("update" in service, false);
});
