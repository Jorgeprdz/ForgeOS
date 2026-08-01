import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../platform/event-evidence/crs-05-quote-person-convergence-service.js");
const quoteContract = require("../platform/event-evidence/quote-lifecycle-event-contract.js");

const QUOTE_ID = "11111111-1111-4111-8111-111111111111";
const VERSION_ID = "22222222-2222-4222-8222-222222222222";
const PROSPECT_ID = "33333333-3333-4333-8333-333333333333";
const PERSON_ID = "44444444-4444-4444-8444-444444444444";
const DECISION_ID = "55555555-5555-4555-8555-555555555555";
const QUOTE_REFERENCE = `quote:${QUOTE_ID}`;
const VERSION_REFERENCE = `quote-version:${VERSION_ID}`;
const EVENT_REFERENCE = "quote-event:66666666-6666-4666-8666-666666666666";

const quoteRow = Object.freeze({
  id: QUOTE_ID,
  quote_reference: QUOTE_REFERENCE,
  advisor_id: "advisor:001",
  prospect_id: PROSPECT_ID,
  product_reference: "product:segubeca",
  current_version: 2,
  lifecycle_state: "PROSPECT_ACCEPTED",
  created_at: "2026-08-01T20:00:00.000Z",
  updated_at: "2026-08-01T20:10:00.000Z",
});

const versionRow = Object.freeze({
  id: VERSION_ID,
  quote_id: QUOTE_ID,
  advisor_id: "advisor:001",
  quote_version_reference: VERSION_REFERENCE,
  version_number: 2,
  snapshot_digest: "a".repeat(64),
  source_record_reference: "quote-source:segubeca-001",
  source_evidence_references: ["document:segubeca-001"],
  freshness_metadata: { status: "reviewed_current_session" },
  confirmation_state: "CONFIRMED",
  created_at: "2026-08-01T20:05:00.000Z",
});

const eventRow = Object.freeze({
  event_id: EVENT_REFERENCE,
  advisor_id: "advisor:001",
  quote_id: QUOTE_ID,
  quote_version_id: VERSION_ID,
  prospect_id: PROSPECT_ID,
  event_type: "QUOTE_PROSPECT_ACCEPTED",
  lifecycle_state: "PROSPECT_ACCEPTED",
  previous_lifecycle_state: "PRESENTED",
  occurred_at: "2026-08-01T20:09:00.000Z",
  recorded_at: "2026-08-01T20:10:00.000Z",
  source_record_reference: "quote-source:segubeca-001",
  idempotency_key: "quote-accepted-001",
  payload: {
    quoteReference: QUOTE_REFERENCE,
    quoteVersionReference: VERSION_REFERENCE,
    prospectReference: PROSPECT_ID,
    productReference: "product:segubeca",
    lifecycleState: "PROSPECT_ACCEPTED",
  },
  evidence_references: ["confirmation:accepted-001"],
  freshness_metadata: { status: "reviewed_current_session" },
  snapshot_digest: "a".repeat(64),
  confirmation_state: "CONFIRMED",
  correction_of: null,
  event_digest: "b".repeat(64),
});

function queryBuilder(table, datasets) {
  const filters = [];
  const orders = [];
  let max = null;
  return {
    select() { return this; },
    eq(column, value) { filters.push(["eq", column, value]); return this; },
    is(column, value) { filters.push(["is", column, value]); return this; },
    order(column, options = {}) { orders.push([column, options.ascending !== false]); return this; },
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
    if (orders.length) {
      rows.sort((left, right) => {
        for (const [column, ascending] of orders) {
          const a = left[column];
          const b = right[column];
          if (a === b) continue;
          const direction = a < b ? -1 : 1;
          return ascending ? direction : -direction;
        }
        return 0;
      });
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

function linkedDatasets(overrides = {}) {
  return {
    quote_lifecycle_quotes: [quoteRow],
    quote_lifecycle_versions: [versionRow],
    quote_lifecycle_events: [eventRow],
    commercial_source_identity_links: [{
      id: "link-db:001",
      link_reference: "identity-link:001",
      person_id: PERSON_ID,
      source_identity_type: "PROSPECT",
      source_record_reference: PROSPECT_ID,
      match_status: "LINK_CONFIRMED",
      decision_id: DECISION_ID,
      effective_from: "2026-08-01T20:01:00.000Z",
      effective_to: null,
    }],
    commercial_people: [{
      id: PERSON_ID,
      advisor_id: "advisor:001",
      person_reference: "person:001",
      lifecycle_state: "CONFIRMED",
      privacy_classification: "PRIVATE",
      archived_at: null,
    }],
    identity_resolution_decisions: [{
      id: DECISION_ID,
      decision_reference: "identity-decision:001",
      outcome: "LINK_CONFIRMED",
      resolved_person_id: PERSON_ID,
      source_record_reference: PROSPECT_ID,
    }],
    ...overrides,
  };
}

function canonicalAcceptedEvent(overrides = {}) {
  return quoteContract.createQuoteLifecycleEvent({
    event_type: "QUOTE_PROSPECT_ACCEPTED",
    tenant_id: "advisor:001",
    actor: { type: "ADVISOR", id: "advisor:001" },
    subject: { type: "QUOTE", id: QUOTE_REFERENCE },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: "quote-persist:canonical-001",
      channel: "QUOTE",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: "2026-08-01T20:09:00.000Z",
    recorded_at: "2026-08-01T20:10:00.000Z",
    correlation_id: PROSPECT_ID,
    causation_id: null,
    idempotency_key: "canonical-accepted-001",
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload: {
      quote_reference: QUOTE_REFERENCE,
      quote_version_reference: VERSION_REFERENCE,
      prospect_reference: PROSPECT_ID,
      product_reference: "product:segubeca",
      lifecycle_state: "PROSPECT_ACCEPTED",
      previous_lifecycle_state: "PRESENTED",
      application_reference: null,
      decision_reason_code: null,
    },
    provenance: {
      source_system: "quote-lifecycle-persistence",
      source_record_id: "quote-persist:canonical-001",
      captured_via: "FORGE_UI",
      evidence_references: ["confirmation:accepted-001"],
      freshness_status: "reviewed_current_session",
      snapshot_digest: "a".repeat(64),
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: quoteContract.DEFAULT_SAFETY_FLAGS,
    ...overrides,
  });
}

test("reads durable Quote, Version, lifecycle and Cartera identity as one snapshot", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshot = await service.getConvergedQuote(QUOTE_REFERENCE, {
    printableArtifactReference: "quote-pdf:segubeca-001",
    calculationAuthorityReference: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
  });
  assert.equal(snapshot.identity.state, "LINKED");
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.quote.quoteReference, QUOTE_REFERENCE);
  assert.equal(snapshot.version.quoteVersionReference, VERSION_REFERENCE);
  assert.equal(snapshot.lifecycle.eventReference, EVENT_REFERENCE);
  assert.equal(snapshot.domainLink.authority, "QUOTE_PERSISTENCE_AUTHORITY");
  assert.equal(snapshot.version.printableArtifactReference, "quote-pdf:segubeca-001");
});

test("unlinked Prospect returns an explicit missing Quote-person link", async () => {
  const data = linkedDatasets({ commercial_source_identity_links: [] });
  const service = serviceModule.create(clientFor(data));
  const snapshot = await service.getConvergedQuote(QUOTE_REFERENCE);
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.domainLink.missingReason, "PERSON_UNRESOLVED");
  assert.equal(snapshot.domainLink.correlationId, null);
});

test("multiple active Prospect identity links fail closed", async () => {
  const data = linkedDatasets();
  const first = data.commercial_source_identity_links[0];
  data.commercial_source_identity_links = [
    first,
    { ...first, id: "link-db:002", link_reference: "identity-link:002" },
  ];
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.getConvergedQuote(QUOTE_REFERENCE),
    error => error.code === "CRS05_MULTIPLE_ACTIVE_IDENTITY_LINKS",
  );
});

test("cross-advisor CommercialPerson fails closed", async () => {
  const data = linkedDatasets();
  data.commercial_people[0] = { ...data.commercial_people[0], advisor_id: "advisor:other" };
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.getConvergedQuote(QUOTE_REFERENCE),
    error => error.code === "CRS05_PERSON_OWNER_MISMATCH",
  );
});

test("identity decision lineage must match Prospect and person", async () => {
  const data = linkedDatasets();
  data.identity_resolution_decisions[0] = {
    ...data.identity_resolution_decisions[0],
    source_record_reference: "prospect:other",
  };
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.getConvergedQuote(QUOTE_REFERENCE),
    error => error.code === "CRS05_IDENTITY_LINEAGE_MISMATCH",
  );
});

test("Quote, Version and event durable lineage mismatch fails closed", async () => {
  const data = linkedDatasets();
  data.quote_lifecycle_events[0] = { ...eventRow, quote_version_id: "version:other" };
  const service = serviceModule.create(clientFor(data));
  await assert.rejects(
    service.getConvergedQuote(QUOTE_REFERENCE),
    error => error.code === "CRS05_DURABLE_LINEAGE_MISMATCH",
  );
});

test("lists all durable Quotes for a Prospect without changing their authority", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshots = await service.listConvergedQuotesForProspect(PROSPECT_ID);
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].quote.prospectReference, PROSPECT_ID);
  assert.equal(snapshots[0].quoteAuthority, "QUOTE_PERSISTENCE_AUTHORITY");
});

test("lists Quote Version lineage as minimized references only", async () => {
  const prior = {
    ...versionRow,
    id: "version-db:001",
    quote_version_reference: "quote-version:prior",
    version_number: 1,
    snapshot_digest: "c".repeat(64),
    created_at: "2026-08-01T20:01:00.000Z",
  };
  const data = linkedDatasets({ quote_lifecycle_versions: [versionRow, prior] });
  const service = serviceModule.create(clientFor(data));
  const versions = await service.listQuoteVersions(QUOTE_REFERENCE);
  assert.deepEqual(versions.map(item => item.versionNumber), [2, 1]);
  assert.equal("review_snapshot" in versions[0], false);
  assert.equal("annualPremium" in versions[0], false);
});

test("commercial movement is derived only for a confirmed person", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()));
  const snapshot = await service.createCommercialMovementView(
    QUOTE_REFERENCE,
    "education:2026",
  );
  assert.match(snapshot.domainLink.correlationId, /^movement:/);
  assert.equal(snapshot.identity.personReference, "person:001");
});

test("commercial movement is blocked while identity is unresolved", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets({
    commercial_source_identity_links: [],
  })));
  await assert.rejects(
    service.createCommercialMovementView(QUOTE_REFERENCE, "education:2026"),
    error => error.code === "CRS05_MOVEMENT_REQUIRES_CONFIRMED_PERSON",
  );
});

test("canonical Quote lifecycle event converges without persistence or identity invention", () => {
  const service = serviceModule.create(clientFor({}));
  const snapshot = service.convergeCanonicalLifecycleEvent(canonicalAcceptedEvent(), {
    versionNumber: 2,
    persistenceReceiptReference: "quote-persist:canonical-001",
    printableArtifactReference: "quote-pdf:canonical-001",
    calculationAuthorityReference: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
  });
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.lifecycle.eventType, "QUOTE_PROSPECT_ACCEPTED");
  assert.equal(snapshot.boundaries.automaticIdentityResolution, false);
  assert.equal(snapshot.boundaries.automaticQuoteMutation, false);
});

test("canonical Quote event accepts an explicit governed person context", () => {
  const service = serviceModule.create(clientFor({}));
  const snapshot = service.convergeCanonicalLifecycleEvent(canonicalAcceptedEvent(), {
    versionNumber: 2,
    identity: {
      state: "LINKED",
      personReference: "person:001",
      sourceIdentityLinkReference: "identity-link:001",
      identityDecisionReference: "identity-decision:001",
      matchStatus: "LINK_CONFIRMED",
      reason: null,
      sourceIdentityReference: PROSPECT_ID,
    },
  });
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.domainLink.personReference, "person:001");
});

test("service diagnostics preserve calculation, PDF, Application and Policy boundaries", () => {
  const service = serviceModule.create(clientFor({}));
  const diagnostics = service.diagnostics();
  assert.equal(diagnostics.quoteAuthority, "QUOTE_PERSISTENCE_AUTHORITY");
  assert.equal(diagnostics.personAuthority, "CARTERA_010B_COMMERCIAL_PERSON");
  assert.equal(diagnostics.productSpecificIdentityAdapter, false);
  assert.equal(diagnostics.numericQuoteTruthCopied, false);
  assert.equal(diagnostics.pdfBytesCopied, false);
  assert.equal(diagnostics.quoteMutation, false);
  assert.equal(diagnostics.applicationMutation, false);
  assert.equal(diagnostics.policyMutation, false);
  assert.equal(diagnostics.automaticBusinessAction, false);
});