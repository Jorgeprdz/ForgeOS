import assert from "node:assert/strict";
import test from "node:test";
import serviceModule from "../advisor-os/cartera/crs-07-application-policy-lineage-service.js";

const user = { id: "advisor:1" };
const rows = {
  commercial_applications: [{ id: "app-id-1", advisor_id: user.id, application_reference: "application:1",
    person_id: "person-id-1", quote_reference: "quote:1", quote_version_reference: "quote-version:1",
    prospect_reference: "prospect:1", product_reference: "product:1", current_version: 1,
    lifecycle_state: "APPROVED", previous_lifecycle_state: "REQUIREMENTS_SATISFIED" }],
  commercial_people: [{ id: "person-id-1", advisor_id: user.id, person_reference: "person:1",
    lifecycle_state: "CONFIRMED", archived_at: null }],
  policy_versions: [{ id: "pv-id-1", advisor_id: user.id, policy_id: "policy-id-1",
    policy_version_reference: "policy-version:1", version_number: 1, evidence_version_id: "evidence-id-1",
    quote_reference: "quote:1", application_reference: "application:1", confirmed_at: "2026-08-01T01:00:00Z" }],
  canonical_policies: [{ id: "policy-id-1", advisor_id: user.id, policy_reference: "policy:1",
    carrier_reference: "carrier:1", policy_number: "POL-1", product_reference: "product:1",
    status_value: "ISSUED", issue_date: "2026-08-01", effective_from: "2026-08-01T00:00:00Z" }],
  policy_evidence_versions: [{ id: "evidence-id-1", advisor_id: user.id,
    evidence_version_reference: "evidence:1", document_hash: "a".repeat(64), source_type: "POLICY_ADMIN_RECORD",
    observed_at: "2026-08-01T00:30:00Z", verification_state: "CONFIRMED",
    provenance: { issuanceConfirmed: true, applicationReference: "application:1", sourceAuthority: "carrier-admin",
      reviewReference: "review:1", packetReference: null, sourceReference: "source:1", confirmationBoundary: "CRS-07" } }],
  policy_roles: [{ id: "role-id-1", advisor_id: user.id, policy_id: "policy-id-1", policy_version_id: "pv-id-1",
    policy_role_reference: "role:1", participant_person_id: "person-id-1", role_type: "INSURED",
    confirmation_state: "CONFIRMED", privacy_classification: "SENSITIVE", visibility_scope: "POLICY_TEAM",
    effective_from: "2026-08-01T00:00:00Z", effective_to: null }],
};

class Query {
  constructor(data) { this.data = data; this.filters = []; this.limitValue = null; this.desc = false; }
  select() { return this; }
  eq(key, value) { this.filters.push([key, value]); return this; }
  order(_key, { ascending = true } = {}) { this.desc = !ascending; return this; }
  limit(value) { this.limitValue = value; return this; }
  result() {
    let output = this.data.filter(row => this.filters.every(([key, value]) => row[key] === value));
    if (this.desc) output = [...output].reverse();
    if (this.limitValue != null) output = output.slice(0, this.limitValue);
    return output;
  }
  async single() {
    const output = this.result();
    return output.length ? { data: output[0], error: null } : { data: null, error: { code: "PGRST116" } };
  }
  async maybeSingle() { return { data: this.result()[0] || null, error: null }; }
  then(resolve, reject) { return Promise.resolve({ data: this.result(), error: null }).then(resolve, reject); }
}
function client(overrides = {}) {
  const data = structuredClone(rows);
  Object.assign(data, overrides.rows || {});
  return {
    auth: { getUser: async () => overrides.auth || { data: { user }, error: null } },
    from: table => new Query(data[table] || []),
    rpc: async (name, params) => overrides.rpc
      ? overrides.rpc(name, params)
      : { data: { status: "CONFIRMED", applicationPolicyLineageVerified: true,
          policyCreatedByApplication: false, params }, error: null },
  };
}
const command = {
  contractType: "FORGE_CONFIRMED_POLICY_COMMAND", contractVersion: "CARTERA-010B.1",
  advisorId: user.id, actorReference: user.id, idempotencyKey: "policy:1",
  confirmedAt: "2026-08-01T01:00:00Z", policy: {}, roles: [],
  evidence: { sourceType: "POLICY_ADMIN_RECORD", provenance: {} },
  lineage: { quoteReference: "quote:1" }, commandDigest: "0".repeat(64),
};

test("confirmation requires explicit human authorization", async () => {
  const service = serviceModule.createService({ client: client() });
  await assert.rejects(() => service.confirmIssuedPolicyFromApplication({}), error => error.code === "CRS07_HUMAN_CONFIRMATION_REQUIRED");
});
test("confirmation invokes only governed CRS07 wrapper", async () => {
  let called;
  const service = serviceModule.createService({ client: client({ rpc: async (name, params) => {
    called = { name, params };
    return { data: { applicationPolicyLineageVerified: true, policyCreatedByApplication: false }, error: null };
  } }) });
  const receipt = await service.confirmIssuedPolicyFromApplication({ confirmedByAdvisor: true,
    confirmationReference: "confirm:1", command, applicationReference: "application:1", sourceAuthority: "carrier-admin" });
  assert.equal(called.name, "forge_crs07_confirm_issued_policy_from_application");
  assert.equal(called.params.p_command.evidence.verificationState, "CONFIRMED");
  assert.equal(receipt.policyCreatedByApplication, false);
});
test("invalid RPC receipt fails closed", async () => {
  const service = serviceModule.createService({ client: client({ rpc: async () => ({
    data: { applicationPolicyLineageVerified: false, policyCreatedByApplication: true }, error: null,
  }) }) });
  await assert.rejects(() => service.confirmIssuedPolicyFromApplication({ confirmedByAdvisor: true,
    confirmationReference: "c", command, applicationReference: "application:1", sourceAuthority: "carrier-admin" }),
  error => error.code === "CRS07_POLICY_RECEIPT_INVALID");
});
test("composes verified productive lineage", async () => {
  const value = await serviceModule.createService({ client: client() })
    .getApplicationPolicyLineage({ applicationReference: "application:1", correlationId: "movement:1" });
  assert.equal(value.lineageState, "VERIFIED");
  assert.equal(value.application.personReference, "person:1");
  assert.equal(value.policy.policyReference, "policy:1");
  assert.equal(value.domainLink.authority, "CARTERA_POLICY_AUTHORITY");
});
test("non-approved Application returns missing lineage", async () => {
  const application = { ...rows.commercial_applications[0], lifecycle_state: "SUBMITTED" };
  const value = await serviceModule.createService({ client: client({ rows: { commercial_applications: [application] } }) })
    .getApplicationPolicyLineage({ applicationReference: "application:1" });
  assert.equal(value.missingReason, "APPLICATION_NOT_APPROVED");
});
test("approved Application without Policy returns not-issued lineage", async () => {
  const value = await serviceModule.createService({ client: client({ rows: { policy_versions: [] } }) })
    .getApplicationPolicyLineage({ applicationReference: "application:1" });
  assert.equal(value.missingReason, "POLICY_NOT_ISSUED");
});
test("missing permitted role returns missing lineage", async () => {
  const beneficiary = { ...rows.policy_roles[0], role_type: "BENEFICIARY" };
  const value = await serviceModule.createService({ client: client({ rows: { policy_roles: [beneficiary] } }) })
    .getApplicationPolicyLineage({ applicationReference: "application:1" });
  assert.equal(value.missingReason, "PERSON_ROLE_UNAVAILABLE");
});
test("one person may carry multiple independent Policies", async () => {
  const secondVersion = { ...rows.policy_versions[0], id: "pv-id-2", policy_id: "policy-id-2",
    policy_version_reference: "policy-version:2", application_reference: "application:2", evidence_version_id: "evidence-id-2" };
  const secondPolicy = { ...rows.canonical_policies[0], id: "policy-id-2", policy_reference: "policy:2", policy_number: "POL-2" };
  const secondApplication = { ...rows.commercial_applications[0], id: "app-id-2", application_reference: "application:2" };
  const secondEvidence = { ...rows.policy_evidence_versions[0], id: "evidence-id-2", evidence_version_reference: "evidence:2",
    provenance: { ...rows.policy_evidence_versions[0].provenance, applicationReference: "application:2" } };
  const secondRole = { ...rows.policy_roles[0], id: "role-id-2", policy_id: "policy-id-2",
    policy_version_id: "pv-id-2", policy_role_reference: "role:2" };
  const service = serviceModule.createService({ client: client({ rows: {
    policy_versions: [rows.policy_versions[0], secondVersion], canonical_policies: [rows.canonical_policies[0], secondPolicy],
    commercial_applications: [rows.commercial_applications[0], secondApplication],
    policy_evidence_versions: [rows.policy_evidence_versions[0], secondEvidence], policy_roles: [rows.policy_roles[0], secondRole],
  } }) });
  const values = await service.listPoliciesForPerson({ personReference: "person:1" });
  assert.equal(values.length, 2);
  assert.deepEqual(values.map(value => value.policy.policyReference).sort(), ["policy:1", "policy:2"]);
});
test("commercial movement view is read-only", async () => {
  const service = serviceModule.createService({ client: client() });
  const lineage = await service.getApplicationPolicyLineage({ applicationReference: "application:1" });
  const value = service.createCommercialMovementView({ lineage, movementReference: "renewal:1" });
  assert.match(value.correlationId, /^movement:/);
  assert.equal(value.policyMutation, false);
  assert.equal(value.applicationMutation, false);
});
test("missing authentication fails closed", async () => {
  const service = serviceModule.createService({ client: client({ auth: { data: { user: null }, error: { message: "no" } } }) });
  await assert.rejects(() => service.getApplicationPolicyLineage({ applicationReference: "application:1" }),
    error => error.code === "CRS07_AUTH_REQUIRED");
});
test("diagnostics preserve authority and no automation", () => {
  const value = serviceModule.createService({ client: client() }).diagnostics();
  assert.equal(value.policyAuthority, "CARTERA_POLICY_AUTHORITY");
  assert.equal(value.directTableMutation, false);
  assert.equal(value.automaticPolicyCreation, false);
});
