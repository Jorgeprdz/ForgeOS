import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js");

const baseProspect = Object.freeze({
  id: "prospect:001",
  fullName: "Juan Pérez",
  status: "contacted",
  source: "Referido",
  createdAt: "2026-08-01T20:00:00.000Z",
  updatedAt: "2026-08-01T20:05:00.000Z",
  version: 1,
  archivedAt: null,
});

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

function clientFor(datasets = {}) {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: "advisor:001" } }, error: null };
      },
    },
    from(table) {
      return queryBuilder(table, datasets);
    },
  };
}

function prospectService(overrides = {}) {
  return {
    async getProspect() { return baseProspect; },
    async listProspects() { return [baseProspect]; },
    async createProspect(input) {
      return { ...baseProspect, id: "prospect:new", fullName: input.fullName, status: "referred_new" };
    },
    async updateProspect(id, changes) { return { ...baseProspect, id, ...changes }; },
    async archiveProspect(id) {
      return { ...baseProspect, id, archivedAt: "2026-08-01T21:00:00.000Z", updatedAt: "2026-08-01T21:00:00.000Z" };
    },
    ...overrides,
  };
}

function linkedDatasets(overrides = {}) {
  return {
    commercial_source_identity_links: [{
      id: "link-db:001",
      link_reference: "identity-link:001",
      person_id: "person-db:001",
      source_domain: "PIPELINE",
      source_identity_type: "PROSPECT",
      source_record_reference: "prospect:001",
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
      source_record_reference: "prospect:001",
    }],
    ...overrides,
  };
}

test("reads the active Cartera identity link and converges a productive Prospect", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    prospectService: prospectService(),
  });
  const snapshot = await service.getConvergedProspect("prospect:001");
  assert.equal(snapshot.identity.state, "LINKED");
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.domainLink.domain, "PIPELINE");
  assert.equal(snapshot.domainLink.recordReference, "prospect:001");
  assert.equal(snapshot.stageAuthority, "PIPELINE_STAGE_RPC");
});

test("unlinked Prospect returns an explicit missing-link", async () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }), { prospectService: prospectService() });
  const snapshot = await service.getConvergedProspect("prospect:001");
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.domainLink.missingReason, "PERSON_UNRESOLVED");
  assert.equal(snapshot.domainLink.personReference, undefined);
});

test("creating a Prospect does not execute automatic identity resolution", async () => {
  let created = 0;
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }), {
    prospectService: prospectService({
      async createProspect(input) {
        created += 1;
        return {
          ...baseProspect,
          id: "prospect:new",
          fullName: input.fullName,
          status: "referred_new",
        };
      },
    }),
  });
  const snapshot = await service.createConvergedProspect({
    fullName: "Ana",
    phone: "5512345678",
    source: "Referido",
    initialContext: "Presentación",
  });
  assert.equal(created, 1);
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.automaticIdentityResolution, false);
});

test("multiple active source identity links fail closed", async () => {
  const first = linkedDatasets().commercial_source_identity_links[0];
  const service = serviceModule.create(clientFor(linkedDatasets({
    commercial_source_identity_links: [
      first,
      { ...first, id: "link-db:002", link_reference: "identity-link:002" },
    ],
  })), { prospectService: prospectService() });
  await assert.rejects(
    service.getConvergedProspect("prospect:001"),
    error => error.code === "CRS03_MULTIPLE_ACTIVE_IDENTITY_LINKS",
  );
});

test("cross-advisor person ownership mismatch fails closed", async () => {
  const data = linkedDatasets();
  data.commercial_people[0] = { ...data.commercial_people[0], advisor_id: "advisor:other" };
  const service = serviceModule.create(clientFor(data), { prospectService: prospectService() });
  await assert.rejects(
    service.getConvergedProspect("prospect:001"),
    error => error.code === "CRS03_PERSON_OWNER_MISMATCH",
  );
});

test("identity decision lineage must match both person and Prospect", async () => {
  const data = linkedDatasets();
  data.identity_resolution_decisions[0] = {
    ...data.identity_resolution_decisions[0],
    source_record_reference: "prospect:other",
  };
  const service = serviceModule.create(clientFor(data), { prospectService: prospectService() });
  await assert.rejects(
    service.getConvergedProspect("prospect:001"),
    error => error.code === "CRS03_IDENTITY_LINEAGE_MISMATCH",
  );
});

test("list convergence preserves Pipeline ordering and person state", async () => {
  const second = {
    ...baseProspect,
    id: "prospect:002",
    fullName: "Ana Ruiz",
  };
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    prospectService: prospectService({
      async listProspects() { return [baseProspect, second]; },
    }),
  });
  const snapshots = await service.listConvergedProspects();
  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0].identity.state, "LINKED");
  assert.equal(snapshots[1].identity.state, "UNRESOLVED");
});

test("an explicit movement is derived only for a confirmed person", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    prospectService: prospectService(),
  });
  const snapshot = await service.createCommercialMovementView(
    "prospect:001",
    "retirement:2026",
  );
  assert.match(snapshot.domainLink.correlationId, /^movement:/);
  assert.equal(snapshot.identity.personReference, "person:001");
});

test("movement creation is blocked while person identity is unresolved", async () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }), { prospectService: prospectService() });
  await assert.rejects(
    service.createCommercialMovementView("prospect:001", "medical:2026"),
    error => error.code === "CRS03_MOVEMENT_REQUIRES_CONFIRMED_PERSON",
  );
});

test("confirmed Pipeline stage receipt becomes a source-attributed Pipeline event link", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    prospectService: prospectService(),
  });
  const snapshot = await service.getConvergedProspect("prospect:001");
  const stageLink = await service.createConfirmedStageProjection({
    ...baseProspect,
    status: "proposal",
    updatedAt: "2026-08-01T20:10:00.000Z",
    version: 2,
  }, snapshot);
  assert.equal(stageLink.domain, "PIPELINE");
  assert.equal(stageLink.recordType, "PIPELINE_EVENT");
  assert.equal(stageLink.authority, "PIPELINE_STAGE_EVENT_AUTHORITY");
  assert.equal(stageLink.personReference, "person:001");
  assert.equal(stageLink.correlationId, null);
});

test("stage projection rejects a receipt for another Prospect", async () => {
  const service = serviceModule.create(clientFor(linkedDatasets()), {
    prospectService: prospectService(),
  });
  const snapshot = await service.getConvergedProspect("prospect:001");
  await assert.rejects(
    service.createConfirmedStageProjection({
      ...baseProspect,
      id: "prospect:other",
      status: "proposal",
    }, snapshot),
    error => error.code === "CRS03_STAGE_PROSPECT_MISMATCH",
  );
});

test("service diagnostics preserve all mutation boundaries", () => {
  const service = serviceModule.create(clientFor({
    commercial_source_identity_links: [],
  }), { prospectService: prospectService() });
  const diagnostics = service.diagnostics();
  assert.equal(diagnostics.personAuthority, "CARTERA_010B_COMMERCIAL_PERSON");
  assert.equal(diagnostics.stageAuthority, "PIPELINE_STAGE_RPC");
  assert.equal(diagnostics.opportunityAuthority, "NOT_PRODUCTIVE");
  assert.equal(diagnostics.automaticIdentityResolution, false);
  assert.equal(diagnostics.automaticOpportunityCreation, false);
  assert.equal(diagnostics.identityMutation, false);
  assert.equal(diagnostics.domainLinkPersistence, false);
});
