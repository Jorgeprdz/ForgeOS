import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serviceModule = require("../advisor-os/applications/application-signature-authority-service.js");

const advisorId = "11111111-1111-4111-8111-111111111111";
const applicationReference = "application:22222222-2222-4222-8222-222222222222";
const versionReference = "application-version:33333333-3333-4333-8333-333333333333";
const quoteReference = "quote:44444444-4444-4444-8444-444444444444";
const quoteVersionReference = "quote-version:55555555-5555-4555-8555-555555555555";
const eventReference = "application-event:66666666-6666-4666-8666-666666666666";
const when = "2026-08-01T21:00:00.000Z";
const later = "2026-08-01T21:01:00.000Z";

function commandClient({ user = advisorId, rpcError = null } = {}) {
  const calls = [];
  return {
    calls,
    auth: {
      async getUser() {
        return user ? { data: { user: { id: user } }, error: null } : { data: { user: null }, error: { code: "AUTH" } };
      },
    },
    from() {},
    async rpc(name, params) {
      calls.push({ name, params });
      return rpcError
        ? { data: null, error: rpcError }
        : { data: { status: "CONFIRMED", rpc: name, ...params }, error: null };
    },
  };
}

function commandBase(overrides = {}) {
  return {
    confirmedByAdvisor: true,
    confirmationReference: "confirmation:advisor:001",
    personReference: "person:001",
    quoteReference,
    quoteVersionReference,
    prospectReference: "prospect:001",
    productReference: "product:segubeca",
    documentReference: "document:application:001",
    snapshotDigest: "a".repeat(64),
    sourceEvidenceReferences: ["quote-event:001"],
    signers: [{
      signerReference: "signer:applicant:001",
      role: "APPLICANT",
      required: true,
      personReference: "person:001",
      signatureState: "PENDING",
    }],
    occurredAt: when,
    idempotencyKey: "crs06:create:001",
    ...overrides,
  };
}

function queryClient({ applicationAdvisor = advisorId } = {}) {
  const tables = {
    commercial_applications: [{
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      application_reference: applicationReference,
      advisor_id: applicationAdvisor,
      person_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      quote_reference: quoteReference,
      quote_version_reference: quoteVersionReference,
      prospect_reference: "prospect:001",
      product_reference: "product:segubeca",
      current_version: 1,
      lifecycle_state: "SIGNED",
      previous_lifecycle_state: "PARTIALLY_SIGNED",
      created_at: when,
      updated_at: later,
    }],
    commercial_people: [{
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      advisor_id: applicationAdvisor,
      person_reference: "person:001",
      lifecycle_state: "CONFIRMED",
      archived_at: null,
    }],
    application_versions: [{
      application_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      version_reference: versionReference,
      version_number: 1,
      document_reference: "document:application:001",
      snapshot_digest: "a".repeat(64),
      source_evidence_references: ["quote-event:001"],
      created_at: when,
      correction_of: null,
    }],
    application_signers: [{
      application_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      signer_reference: "signer:applicant:001",
      signer_role: "APPLICANT",
      required: true,
      person_reference: "person:001",
      signature_state: "SIGNED",
      created_at: when,
    }],
    application_signature_evidence: [{
      application_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      signature_reference: "signature:001",
      version_reference: versionReference,
      signer_reference: "signer:applicant:001",
      evidence_type: "SIGNED_DOCUMENT_DIGEST",
      document_digest: "b".repeat(64),
      provider_reference: null,
      signed_at: when,
      captured_at: later,
      evidence_references: ["document:signature:001"],
      confirmation_state: "VERIFIED",
      privacy_classification: "RESTRICTED",
      correction_of: null,
    }],
    application_requirements: [],
    application_events: [{
      application_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      event_reference: eventReference,
      event_type: "APPLICATION_SIGNED",
      version_reference: versionReference,
      lifecycle_state: "SIGNED",
      previous_lifecycle_state: "PARTIALLY_SIGNED",
      occurred_at: when,
      recorded_at: later,
      source_reference: "signature:001",
      evidence_references: ["document:signature:001"],
      idempotency_key: "crs06:application:001:signed",
      correction_of: null,
    }],
  };

  class Builder {
    constructor(table) {
      this.table = table;
      this.filters = [];
      this.max = null;
    }
    select() { return this; }
    eq(key, value) { this.filters.push([key, value]); return this; }
    is(key, value) { this.filters.push([key, value]); return this; }
    order() { return this; }
    limit(value) { this.max = value; return this; }
    rows() {
      let rows = [...(tables[this.table] || [])];
      for (const [key, value] of this.filters) rows = rows.filter(row => (row[key] ?? null) === value);
      if (this.max != null) rows = rows.slice(0, this.max);
      return rows;
    }
    async single() {
      const row = this.rows()[0] || null;
      return row ? { data: row, error: null } : { data: null, error: { code: "NOT_FOUND", message: "not found" } };
    }
    then(resolve, reject) {
      return Promise.resolve({ data: this.rows(), error: null }).then(resolve, reject);
    }
  }

  return {
    auth: { async getUser() { return { data: { user: { id: advisorId } }, error: null }; } },
    rpc: async () => ({ data: null, error: null }),
    from(table) { return new Builder(table); },
  };
}

test("createApplicationDraft requires explicit human confirmation", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  await assert.rejects(
    service.createApplicationDraft(commandBase({ confirmedByAdvisor: false })),
    error => error.code === "CRS06_HUMAN_CONFIRMATION_REQUIRED",
  );
  assert.equal(client.calls.length, 0);
});

test("createApplicationDraft invokes only the governed CRS 06 RPC", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  const result = await service.createApplicationDraft(commandBase());
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].name, serviceModule.RPC.createApplication);
  assert.equal(client.calls[0].params.p_person_reference, "person:001");
  assert.equal(result.status, "CONFIRMED");
});

test("Application creation requires at least one signer", async () => {
  const service = serviceModule.createCommandService({ client: commandClient() });
  await assert.rejects(
    service.createApplicationDraft(commandBase({ signers: [] })),
    error => error.code === "CRS06_SIGNERS_REQUIRED",
  );
});

test("recordSignatureEvidence validates evidence before RPC", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  await service.recordSignatureEvidence({
    confirmedByAdvisor: true,
    confirmationReference: "confirmation:advisor:001",
    applicationReference,
    versionReference,
    signerReference: "signer:applicant:001",
    signatureReference: "signature:001",
    evidenceType: "SIGNED_DOCUMENT_DIGEST",
    documentDigest: "b".repeat(64),
    signedAt: when,
    capturedAt: later,
    evidenceReferences: ["document:signature:001"],
    idempotencyKey: "crs06:signature:001",
  });
  assert.equal(client.calls[0].name, serviceModule.RPC.recordSignature);
  assert.equal(client.calls[0].params.p_provider_reference, null);
});

test("recordSignatureEvidence rejects raw invalid digest without command", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  await assert.rejects(
    service.recordSignatureEvidence({
      confirmedByAdvisor: true,
      confirmationReference: "confirmation:advisor:001",
      applicationReference,
      versionReference,
      signerReference: "signer:applicant:001",
      signatureReference: "signature:001",
      evidenceType: "SIGNED_DOCUMENT_DIGEST",
      documentDigest: "bad",
      signedAt: when,
      capturedAt: later,
      evidenceReferences: ["document:signature:001"],
      idempotencyKey: "crs06:signature:001",
    }),
    error => error.code === "CRS06_SIGNATURE_DOCUMENT_DIGEST_INVALID",
  );
  assert.equal(client.calls.length, 0);
});

test("submitApplication is explicit and never returns Policy creation authority", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  await service.submitApplication({
    confirmedByAdvisor: true,
    confirmationReference: "confirmation:advisor:001",
    applicationReference,
    submissionReference: "submission:001",
    sourceEvidenceReferences: ["provider-receipt:submission:001"],
    occurredAt: when,
    idempotencyKey: "crs06:submit:001",
  });
  assert.equal(client.calls[0].name, serviceModule.RPC.submitApplication);
});

test("recordRequirement validates resolution lineage", async () => {
  const client = commandClient();
  const service = serviceModule.createCommandService({ client });
  await service.recordRequirement({
    confirmedByAdvisor: true,
    confirmationReference: "confirmation:advisor:001",
    applicationReference,
    requirementReference: "requirement:001",
    requirementCode: "ID_DOCUMENT",
    state: "SATISFIED",
    evidenceReferences: ["document:id:001"],
    openedAt: when,
    resolvedAt: later,
    reviewReference: "review:001",
    idempotencyKey: "crs06:requirement:001",
  });
  assert.equal(client.calls[0].name, serviceModule.RPC.recordRequirement);
});

test("recordDecision accepts only APPROVED or DECLINED", async () => {
  const service = serviceModule.createCommandService({ client: commandClient() });
  await assert.rejects(
    service.recordDecision({
      confirmedByAdvisor: true,
      confirmationReference: "confirmation:advisor:001",
      applicationReference,
      decision: "ISSUED",
      decisionReference: "decision:001",
      sourceEvidenceReferences: ["provider:decision:001"],
      occurredAt: when,
      idempotencyKey: "crs06:decision:001",
    }),
    error => error.code === "CRS06_DECISION_INVALID",
  );
});

test("command diagnostics preserve all no-automation boundaries", () => {
  const diagnostics = serviceModule.createCommandService({ client: commandClient() }).diagnostics();
  assert.equal(diagnostics.explicitHumanConfirmationRequired, true);
  assert.equal(diagnostics.automaticApplicationCreation, false);
  assert.equal(diagnostics.automaticSignatureRequest, false);
  assert.equal(diagnostics.automaticSubmission, false);
  assert.equal(diagnostics.automaticPolicyCreation, false);
  assert.equal(diagnostics.providerMutation, false);
});

test("getApplication composes the productive authority snapshot", async () => {
  const service = serviceModule.createReadService({ client: queryClient() });
  const snapshot = await service.getApplication(applicationReference);
  assert.equal(snapshot.applicationVersion.applicationReference, applicationReference);
  assert.equal(snapshot.applicationVersion.personReference, "person:001");
  assert.equal(snapshot.applicationVersion.lifecycleState, "SIGNED");
  assert.equal(snapshot.domainLink.domain, "APPLICATION");
  assert.equal(snapshot.policyBoundary.issuanceEvidenceRequiredForPolicy, true);
});

test("getApplication rejects cross-advisor application rows", async () => {
  const service = serviceModule.createReadService({ client: queryClient({ applicationAdvisor: "other-advisor" }) });
  await assert.rejects(
    service.getApplication(applicationReference),
    error => error.code === "CRS06_APPLICATION_NOT_OWNED",
  );
});

test("listApplicationsForPerson reuses the canonical person and returns snapshots", async () => {
  const service = serviceModule.createReadService({ client: queryClient() });
  const snapshots = await service.listApplicationsForPerson("person:001");
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].applicationVersion.applicationReference, applicationReference);
});

test("Pipeline projection remains read-only", async () => {
  const service = serviceModule.createReadService({ client: queryClient() });
  const snapshot = await service.getApplication(applicationReference);
  const projection = service.projectPipelineMilestone(snapshot);
  assert.equal(projection.milestone, "APPLICATION_SIGNED");
  assert.equal(projection.automaticStageAdvance, false);
  assert.equal(projection.automaticPolicyCreation, false);
});

test("RPC failures are surfaced without fallback mutation", async () => {
  const service = serviceModule.createCommandService({
    client: commandClient({ rpcError: { code: "CRS06_CONFLICT", message: "conflict" } }),
  });
  await assert.rejects(
    service.createApplicationDraft(commandBase()),
    error => error.code === "CRS06_CONFLICT",
  );
});
