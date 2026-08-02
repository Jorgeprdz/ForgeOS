import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../advisor-os/person-workspace/crs-09-person-workspace-service.js");

class Query {
  constructor(rows) { this.rows = [...rows]; }
  select() { return this; }
  eq(key, value) { this.rows = this.rows.filter(row => row[key] === value); return this; }
  is(key, value) { this.rows = this.rows.filter(row => row[key] === value); return this; }
  in(key, values) { this.rows = this.rows.filter(row => values.includes(row[key])); return this; }
  order(key, { ascending = true } = {}) {
    this.rows.sort((a, b) => String(a[key] || "").localeCompare(String(b[key] || "")) * (ascending ? 1 : -1));
    return this;
  }
  limit(value) { this.rows = this.rows.slice(0, value); return this; }
  async single() {
    return this.rows.length === 1
      ? { data: this.rows[0], error: null }
      : { data: null, error: { code: "PGRST116", message: `Expected one row, got ${this.rows.length}` } };
  }
  then(resolve, reject) {
    return Promise.resolve({ data: this.rows, error: null }).then(resolve, reject);
  }
}

function clientFixture() {
  const tables = {
    commercial_people: [{
      id: "person-id-1",
      advisor_id: "advisor-1",
      person_reference: "person-1",
      display_name: "Alejandra Moleres",
      lifecycle_state: "CONFIRMED",
      privacy_classification: "PRIVATE",
      archived_at: null,
    }],
    commercial_source_identity_links: [{
      id: "link-1",
      advisor_id: "advisor-1",
      person_id: "person-id-1",
      source_identity_type: "PROSPECT",
      source_record_reference: "prospect-1",
      effective_from: "2026-07-01T00:00:00.000Z",
      effective_to: null,
      correction_of: null,
    }],
    prospects: [{
      id: "prospect-1",
      advisor_id: "advisor-1",
      full_name: "Alejandra Moleres",
      status: "proposal",
      source: "Referido",
      version: 3,
      created_at: "2026-07-01T00:00:00.000Z",
      updated_at: "2026-08-01T09:00:00.000Z",
      archived_at: null,
      next_action_type: "FOLLOW_UP",
      next_action_at: "2026-08-04T16:00:00.000Z",
    }],
    quote_lifecycle_quotes: [{
      id: "quote-id-1",
      quote_reference: "quote-1",
      advisor_id: "advisor-1",
      prospect_id: "prospect-1",
      product_reference: "VIDA_MUJER",
      current_version: 2,
      lifecycle_state: "CONFIRMED",
      created_at: "2026-07-10T00:00:00.000Z",
      updated_at: "2026-07-20T00:00:00.000Z",
    }],
    commercial_applications: [{
      id: "application-id-1",
      application_reference: "application-1",
      advisor_id: "advisor-1",
      person_id: "person-id-1",
      quote_reference: "quote-1",
      product_reference: "VIDA_MUJER",
      lifecycle_state: "APPLICATION_SIGNED",
      current_version: 1,
      created_at: "2026-07-21T00:00:00.000Z",
      updated_at: "2026-07-22T00:00:00.000Z",
    }],
  };
  return {
    auth: { getUser: async () => ({ data: { user: { id: "advisor-1" } }, error: null }) },
    from(name) { return new Query(tables[name] || []); },
  };
}

function timelineFixture() {
  return {
    personReference: "person-1",
    entries: [
      {
        entryReference: "timeline-1",
        domain: "ACTIVITY",
        recordType: "DUE_ACTION_CREATED",
        recordReference: "activity-1",
        sourceEventReference: "activity-event-1",
        authority: "FES_ACTIVITY_EVENT_LEDGER",
        title: "Seguimiento creado",
        summary: "Compromiso registrado.",
        occurredAt: "2026-08-01T10:00:00.000Z",
        privacyClassification: "PRIVATE",
        confirmationState: "CONFIRMED",
        correctionState: "ORIGINAL",
        attentionRequired: false,
        correlationId: null,
      },
      {
        entryReference: "timeline-2",
        domain: "QUOTE",
        recordType: "QUOTE_EVENT",
        recordReference: "quote-1",
        sourceEventReference: "quote-event-1",
        authority: "QUOTE_LIFECYCLE_EVENT_AUTHORITY",
        title: "Cotización confirmada",
        summary: null,
        occurredAt: "2026-07-20T00:00:00.000Z",
        privacyClassification: "PRIVATE",
        confirmationState: "CONFIRMED",
        correctionState: "ORIGINAL",
        attentionRequired: false,
        correlationId: "movement-1",
      },
    ],
  };
}

function policyFixture() {
  return [{
    application: { applicationReference: "application-1", quoteReference: "quote-1" },
    policy: {
      policyReference: "policy-1",
      productReference: "VIDA_MUJER",
      carrierReference: "SMNYL",
      statusValue: "IN_FORCE",
      effectiveFrom: "2026-08-01T00:00:00.000Z",
      quoteReference: "quote-1",
    },
    personRole: { roleType: "INSURED", confirmationState: "CONFIRMED" },
    correlationId: "movement-1",
  }];
}

function createService(overrides = {}) {
  return serviceModule.createService({
    client: overrides.client || clientFixture(),
    timelineService: overrides.timelineService || {
      getUnifiedPersonTimeline: async () => timelineFixture(),
    },
    policyService: overrides.policyService || {
      listPoliciesForPerson: async () => policyFixture(),
    },
    deriveRelationshipReference: () => "relationship-1",
    clock: () => "2026-08-01T12:00:00.000Z",
    sourceLoaders: overrides.sourceLoaders || {},
  });
}

test("composes the productive person workspace from accepted domain authorities", async () => {
  const workspace = await createService().getPersonWorkspace({ personReference: "person-1" });
  assert.equal(workspace.person.displayName, "Alejandra Moleres");
  assert.equal(workspace.relationshipReference, "relationship-1");
  assert.equal(workspace.sections.OPPORTUNITIES.items[0].reference, "prospect-1");
  assert.equal(workspace.sections.COMMITMENTS.items[0].sourceDomain, "ACTIVITY");
  assert.equal(workspace.sections.QUOTES.items[0].reference, "quote-1");
  assert.equal(workspace.sections.APPLICATIONS.items[0].reference, "application-1");
  assert.equal(workspace.sections.POLICIES.items[0].reference, "policy-1");
  assert.equal(workspace.sections.TIMELINE.count, 2);
  assert.equal(workspace.readOnlyComposition, true);
  assert.equal(workspace.truthMutation, false);
});

test("resolves a canonical person from an active Prospect identity link", async () => {
  const workspace = await createService().getPersonWorkspace({
    sourceIdentity: { type: "PROSPECT", reference: "prospect-1" },
  });
  assert.equal(workspace.person.personReference, "person-1");
  assert.equal(workspace.sections.IDENTITY.items[0].reference, "person-1");
});

test("degrades one noncritical source visibly without hiding the rest", async () => {
  const workspace = await createService({
    sourceLoaders: {
      QUOTES: async () => { throw Object.assign(new Error("quote read failed"), { code: "QUOTE_READ_FAILED" }); },
    },
  }).getPersonWorkspace({ personReference: "person-1" });
  assert.equal(workspace.sections.QUOTES.status, "DEGRADED");
  assert.equal(workspace.sections.QUOTES.reason, "QUOTE_READ_FAILED");
  assert.equal(workspace.sections.POLICIES.status, "AVAILABLE");
  assert.equal(workspace.sections.TIMELINE.status, "AVAILABLE");
});

test("strict source mode fails closed", async () => {
  const service = createService({
    sourceLoaders: {
      APPLICATIONS: async () => { throw Object.assign(new Error("application read failed"), { code: "APPLICATION_READ_FAILED" }); },
    },
  });
  await assert.rejects(
    service.getPersonWorkspace({ personReference: "person-1" }, { strictSources: true }),
    error => error.code === "APPLICATION_READ_FAILED",
  );
});

test("rejects cross-person Timeline and unresolved source identities", async () => {
  const wrongTimeline = createService({
    timelineService: {
      getUnifiedPersonTimeline: async () => ({ ...timelineFixture(), personReference: "person-2" }),
    },
  });
  await assert.rejects(
    wrongTimeline.getPersonWorkspace({ personReference: "person-1" }),
    error => error.code === "CRS09_TIMELINE_PERSON_MISMATCH",
  );

  await assert.rejects(
    createService().getPersonWorkspace({ sourceIdentity: { type: "PROSPECT", reference: "missing" } }),
    error => error.code === "CRS09_PERSON_UNRESOLVED",
  );
});

test("diagnostics lock mutation and duplicate truth boundaries", () => {
  const diagnostics = createService().diagnostics();
  assert.equal(diagnostics.canonicalRoot, "COMMERCIAL_PERSON");
  assert.equal(diagnostics.timelineAuthority, "CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL");
  assert.equal(diagnostics.secondTruthStore, false);
  assert.equal(diagnostics.workspacePersistence, false);
  assert.equal(diagnostics.localMutationControls, false);
  assert.equal(diagnostics.automaticBusinessAction, false);
});
