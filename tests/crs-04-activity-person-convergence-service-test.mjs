import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../platform/event-evidence/crs-04-activity-person-convergence-service.js");
const canonical = require("../platform/event-evidence/canonical-activity-event-contract.js");
const ledger = require("../platform/event-evidence/activity-ledger-contract.js");

function prospectEvent(overrides = {}) {
  return canonical.createCanonicalActivityEvent({
    event_type: "PROSPECT_CREATED",
    tenant_id: "advisor:001",
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: "prospect:001" },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "prospect-save:001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-08-01T20:00:00.000Z",
    recorded_at: "2026-08-01T20:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "legacy-fes-correlation:001",
    idempotency_key: "crs04-prospect-created:001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect:001",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "prospect-save:001",
      captured_via: "FORGE_UI",
      evidence_references: [],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
    ...overrides,
  });
}

function appointmentEvent(overrides = {}) {
  return canonical.createCanonicalActivityEvent({
    event_type: "APPOINTMENT_SCHEDULED",
    tenant_id: "advisor:001",
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "APPOINTMENT", id: "appointment:001" },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "appointment-save:001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-08-01T21:00:00.000Z",
    recorded_at: "2026-08-01T21:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "legacy-appointment-correlation:001",
    idempotency_key: "crs04-appointment:001",
    privacy_class: "PRIVATE",
    payload: {
      appointment_reference: "appointment:001",
      starts_at: "2026-08-02T16:00:00.000Z",
      ends_at: "2026-08-02T17:00:00.000Z",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "appointment-save:001",
      captured_via: "FORGE_UI",
      evidence_references: [],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
    ...overrides,
  });
}

function ledgerRecord(event = prospectEvent()) {
  return ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [],
    appended_at: new Date(Date.parse(event.recorded_at) + 1000).toISOString(),
  });
}

function receiptFor(record, status = "ACKNOWLEDGED") {
  return ledger.createReceipt({
    status,
    tenant_id: record.tenant_id,
    event_id: record.event_id,
    mutation_id: `mutation:${record.event_id}`,
    server_sequence: 1,
    server_recorded_at: new Date(Date.parse(record.appended_at) + 1000).toISOString(),
    cursor: "1",
  });
}

function queryBuilder(table, datasets) {
  const filters = [];
  let max = null;
  return {
    select() { return this; },
    eq(column, value) { filters.push(["eq", column, value]); return this; },
    is(column, value) { filters.push(["is", column, value]); return this; },
    order() { return this; },
    limit(value) { max = value; return this; },
    single() {
      const rows = run();
      const row = rows[0] || null;
      return Promise.resolve(row
        ? { data: row, error: null }
        : { data: null, error: { code: "PGRST116", message: "not found" } });
    },
    then(resolve, reject) {
      return Promise.resolve({ data: run(), error: null }).then(resolve, reject);
    },
  };

  function run() {
    let rows = [...(datasets[table] || [])];
    for (const [kind, column, value] of filters) {
      rows = rows.filter(row => kind === "eq"
        ? row[column] === value
        : (value === null ? row[column] == null : row[column] === value));
    }
    return max == null ? rows : rows.slice(0, max);
  }
}

function clientFor(datasets = {}, userId = "advisor:001") {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: userId } }, error: null };
      },
    },
    from(table) {
      return queryBuilder(table, datasets);
    },
  };
}

function linkedDatasets(sourceIdentityReference = "prospect:001", overrides = {}) {
  return {
    commercial_source_identity_links: [{
      id: "link-db:001",
      link_reference: "identity-link:001",
      person_id: "person-db:001",
      source_domain: "PIPELINE",
      source_identity_type: "PROSPECT",
      source_record_reference: sourceIdentityReference,
      match_status: "LINK_CONFIRMED",
      decision_id: "decision-db:001",
      effective_from: "2026-08-01T20:01:00.000Z",
      effective_to: null,
      created_at: "2026-08-01T20:01:00.000Z",
      correction_of: null,
    }],
    commercial_people: [{
      id: "person-db:001",
      advisor_id: "advisor:001",
      person_reference: "person:001",
      display_name: "Juan Pérez",
      lifecycle_state: "CONFIRMED",
      privacy_classification: "PRIVATE",
      archived_at: null,
    }],
    identity_resolution_decisions: [{
      id: "decision-db:001",
      decision_reference: "identity-decision:001",
      outcome: "LINK_CONFIRMED",
      resolved_person_id: "person-db:001",
      source_record_reference: sourceIdentityReference,
    }],
    ...overrides,
  };
}

function runtimeFor(entries, receipts = {}) {
  return {
    async listEntries() { return entries; },
    async getReceipt(eventId) { return receipts[eventId] || null; },
  };
}

test("converges a canonical Prospect event with the active Cartera identity", async () => {
  const record = ledgerRecord();
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshot = await service.convergeLedgerRecord(record);
  assert.equal(snapshot.identity.state, "LINKED");
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.domainLink.domain, "ACTIVITY");
  assert.equal(snapshot.domainLink.recordType, "ACTIVITY_EVENT");
  assert.equal(snapshot.timelineAuthority, "FES_CANONICAL_ACTIVITY_TIMELINE");
});

test("unlinked Prospect event returns an explicit missing-link", async () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }));
  const snapshot = await service.convergeLedgerRecord(ledgerRecord());
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.identity.reason, "PERSON_UNRESOLVED");
  assert.equal(snapshot.domainLink.missingReason, "PERSON_UNRESOLVED");
});

test("Appointment resolves through an explicit Prospect source identity", async () => {
  const record = ledgerRecord(appointmentEvent());
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshot = await service.convergeLedgerRecord(record, {
    sourceIdentityReference: "prospect:001",
  });
  assert.equal(snapshot.identity.state, "LINKED");
  assert.equal(snapshot.domainLink.recordType, "APPOINTMENT");
  assert.equal(snapshot.domainLink.recordReference, "appointment:001");
});

test("Appointment without source identity stays explicitly unresolved", async () => {
  const record = ledgerRecord(appointmentEvent());
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }));
  const snapshot = await service.convergeLedgerRecord(record);
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.identity.sourceIdentityReference, null);
  assert.equal(snapshot.identity.reason, "SOURCE_IDENTITY_UNAVAILABLE");
});

test("multiple active source identity links fail closed", async () => {
  const data = linkedDatasets();
  const first = data.commercial_source_identity_links[0];
  data.commercial_source_identity_links = [
    first,
    { ...first, id: "link-db:002", link_reference: "identity-link:002" },
  ];
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.convergeLedgerRecord(ledgerRecord()),
    error => error.code === "CRS04_MULTIPLE_ACTIVE_IDENTITY_LINKS",
  );
});

test("cross-advisor person ownership mismatch fails closed", async () => {
  const data = linkedDatasets();
  data.commercial_people[0] = {
    ...data.commercial_people[0],
    advisor_id: "advisor:other",
  };
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.convergeLedgerRecord(ledgerRecord()),
    error => error.code === "CRS04_PERSON_OWNER_MISMATCH",
  );
});

test("identity decision lineage must match both person and source identity", async () => {
  const data = linkedDatasets();
  data.identity_resolution_decisions[0] = {
    ...data.identity_resolution_decisions[0],
    source_record_reference: "prospect:other",
  };
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.convergeLedgerRecord(ledgerRecord()),
    error => error.code === "CRS04_IDENTITY_LINEAGE_MISMATCH",
  );
});

test("remote receipt is read from the existing FES ledger runtime", async () => {
  const record = ledgerRecord();
  const receipt = receiptFor(record);
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    ledgerRuntime: runtimeFor([record], { [record.event_id]: receipt }),
  });
  const snapshot = await service.getConvergedActivityEvent(record.event_id);
  assert.equal(snapshot.ledgerState, "REMOTE_ACKNOWLEDGED");
  assert.equal(snapshot.remoteReceipt.event_id, record.event_id);
});

test("list convergence preserves the ledger order and per-event identity context", async () => {
  const first = ledgerRecord();
  const second = ledgerRecord(appointmentEvent());
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    ledgerRuntime: runtimeFor([first, second]),
  });
  const snapshots = await service.listConvergedActivityEvents({
    sourceIdentityByEvent: {
      [second.event_id]: "prospect:001",
    },
  });
  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].ledgerRecord.event_id, first.event_id);
  assert.equal(snapshots[1].domainLink.recordType, "APPOINTMENT");
  assert.equal(snapshots[1].identity.state, "LINKED");
});

test("explicit commercial movement is CRS 02-derived for a confirmed person", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshot = await service.createCommercialMovementView(
    ledgerRecord(),
    "retirement:2026",
  );
  assert.match(snapshot.domainLink.correlationId, /^movement:[a-f0-9]{32}$/);
  assert.equal(snapshot.sourceCorrelation.eventCorrelationId, "legacy-fes-correlation:001");
  assert.equal(snapshot.sourceCorrelation.legacyCorrelationReinterpretedAsCommercialMovement, false);
});

test("commercial movement is blocked while identity is unresolved", async () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }));
  await assert.rejects(
    service.createCommercialMovementView(ledgerRecord(), "medical:2026"),
    error => error.code === "CRS04_MOVEMENT_REQUIRES_CONFIRMED_PERSON",
  );
});

test("event tenant must match the authenticated advisor", async () => {
  const event = prospectEvent({ tenant_id: "advisor:other" });
  const service = serviceModule.create(clientFor(linkedDatasets()));
  await assert.rejects(
    service.convergeLedgerRecord(ledgerRecord(event)),
    error => error.code === "CRS04_ACTIVITY_TENANT_MISMATCH",
  );
});

test("correction convergence preserves original event and domain-link lineage", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const originalRecord = ledgerRecord();
  const original = await service.convergeLedgerRecord(originalRecord);
  const correctionEvent = canonical.createCanonicalActivityCorrection(
    originalRecord.canonical_event,
    {
      actor: { type: "ADVISOR", id: "advisor:001" },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "correction:001",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      occurred_at: "2026-08-01T20:10:00.000Z",
      recorded_at: "2026-08-01T20:10:01.000Z",
      idempotency_key: "crs04-correction:001",
      privacy_class: "PRIVATE",
      payload: {
        prospect_reference: "prospect:001",
        source_category: "REFERRAL",
      },
      provenance: {
        source_system: "forge-alive",
        source_record_id: "correction:001",
        captured_via: "FORGE_UI",
        evidence_references: [],
      },
      confirmation_state: "CONFIRMED",
      correction_reason_code: "SOURCE_CATEGORY_CONFIRMED",
    },
  );
  const correction = await service.convergeCorrection(
    ledgerRecord(correctionEvent),
    original,
  );
  assert.equal(correction.correctionLineage.eventCorrectionOf, originalRecord.event_id);
  assert.equal(correction.correctionLineage.domainLinkCorrectionOf, original.domainLink.linkReference);
  assert.equal(correction.correctionLineage.appendOnly, true);
});

test("service diagnostics preserve FES, identity and no-effect boundaries", () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }));
  const diagnostics = service.diagnostics();
  assert.equal(diagnostics.eventAuthority, "FES01_CANONICAL_ACTIVITY_EVENT");
  assert.equal(diagnostics.ledgerAuthority, "FES_ACTIVITY_EVENT_LEDGER");
  assert.equal(diagnostics.timelineAuthority, "FES_CANONICAL_ACTIVITY_TIMELINE");
  assert.equal(diagnostics.personAuthority, "CARTERA_010B_COMMERCIAL_PERSON");
  assert.equal(diagnostics.legacyCorrelationReinterpretedAsCommercialMovement, false);
  assert.equal(diagnostics.ledgerMutation, false);
  assert.equal(diagnostics.identityMutation, false);
  assert.equal(diagnostics.timelineMutation, false);
  assert.equal(diagnostics.automaticBusinessAction, false);
});
