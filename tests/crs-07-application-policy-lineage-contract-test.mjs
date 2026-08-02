import assert from "node:assert/strict";
import test from "node:test";
import contract from "../platform/shared-commercial-model/crs-07-application-policy-lineage-contract.js";
import links from "../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js";

const application = (x = {}) => ({
  applicationReference: "application:1", lifecycleState: "APPROVED", personReference: "person:1",
  quoteReference: "quote:1", quoteVersionReference: "quote-version:1", prospectReference: "prospect:1",
  productReference: "product:1", currentVersion: 1, ...x,
});
const policy = (x = {}) => ({
  policyReference: "policy:1", policyVersionReference: "policy-version:1", versionNumber: 1,
  carrierReference: "carrier:1", policyNumber: "POL-1", productReference: "product:1",
  statusValue: "ISSUED", issueDate: "2026-08-01T00:00:00Z", effectiveFrom: "2026-08-01T00:00:00Z",
  applicationReference: "application:1", quoteReference: "quote:1", evidenceVersionReference: "evidence:1",
  confirmedAt: "2026-08-01T01:00:00Z", ...x,
});
const evidence = (x = {}) => ({
  evidenceVersionReference: "evidence:1", verificationState: "CONFIRMED", sourceType: "POLICY_ADMIN_RECORD",
  documentHash: "a".repeat(64), observedAt: "2026-08-01T00:30:00Z",
  provenance: { issuanceConfirmed: true, applicationReference: "application:1", sourceAuthority: "carrier-admin",
    reviewReference: "review:1", packetReference: null, sourceReference: "source:1", confirmationBoundary: "CRS-07" },
  ...x,
});
const role = (x = {}) => ({
  policyRoleReference: "role:1", policyReference: "policy:1", personReference: "person:1", roleType: "INSURED",
  confirmationState: "CONFIRMED", privacyClassification: "SENSITIVE", visibilityScope: "POLICY_TEAM",
  effectiveFrom: "2026-08-01T00:00:00Z", effectiveTo: null, ...x,
});
const link = (x = {}) => links.createDomainLinkEnvelope({
  personReference: "person:1", relationshipReference: "relationship:1", correlationId: "movement:1",
  domain: "CARTERA", recordType: "POLICY", recordReference: "policy:1", authority: "CARTERA_POLICY_AUTHORITY",
  sourceEventReference: "policy-version:1", effectiveAt: "2026-08-01T00:00:00Z",
  recordedAt: "2026-08-01T01:00:00Z", privacyClassification: "SENSITIVE", idempotencyKey: "crs07:1",
  correctionOf: null, ...x,
});
const valid = x => ({ advisorReference: "advisor:1", application: application(), policy: policy(),
  issuanceEvidence: evidence(), personRole: role(), domainLink: link(), correlationId: "movement:1", ...x });
const code = (fn, expected) => assert.throws(fn, error => error?.code === expected);

test("creates immutable verified lineage", () => {
  const value = contract.createApplicationPolicyLineage(valid());
  assert.equal(value.lineageState, "VERIFIED");
  assert.equal(value.lineageDigest.length, 64);
  assert.ok(Object.isFrozen(value));
});
test("persisted lineage is digest-bound", () => {
  const value = contract.createApplicationPolicyLineage(valid());
  assert.equal(contract.assertApplicationPolicyLineage(value).lineageDigest, value.lineageDigest);
  code(() => contract.assertApplicationPolicyLineage({ ...value, lineageDigest: "0".repeat(64) }), "CRS07_LINEAGE_DIGEST_MISMATCH");
});
test("Application must be approved", () => code(() => contract.createApplicationPolicyLineage(valid({ application: application({ lifecycleState: "SUBMITTED" }) })), "CRS07_APPROVED_APPLICATION_REQUIRED"));
test("Application reference must match", () => code(() => contract.createApplicationPolicyLineage(valid({ policy: policy({ applicationReference: "application:2" }) })), "CRS07_APPLICATION_LINEAGE_MISMATCH"));
test("Quote lineage cannot diverge", () => code(() => contract.createApplicationPolicyLineage(valid({ policy: policy({ quoteReference: "quote:2" }) })), "CRS07_QUOTE_LINEAGE_MISMATCH"));
test("product lineage cannot diverge", () => code(() => contract.createApplicationPolicyLineage(valid({ policy: policy({ productReference: "product:2" }) })), "CRS07_PRODUCT_LINEAGE_MISMATCH"));
test("issuance evidence must be confirmed and strong", () => {
  code(() => contract.normalizeEvidence(evidence({ verificationState: "REVIEWED" })), "CRS07_ISSUANCE_EVIDENCE_NOT_CONFIRMED");
  code(() => contract.normalizeEvidence(evidence({ sourceType: "OCR_EXTRACT" })), "CRS07_ISSUANCE_SOURCE_WEAK");
});
test("issuance provenance must explicitly confirm", () => code(() => contract.normalizeEvidence(evidence({ provenance: { ...evidence().provenance, issuanceConfirmed: false } })), "CRS07_ISSUANCE_CONFIRMATION_REQUIRED"));
test("PolicyRole must be confirmed and permitted", () => {
  code(() => contract.normalizePersonRole(role({ confirmationState: "PROPOSED" })), "CRS07_PERSON_ROLE_NOT_CONFIRMED");
  code(() => contract.normalizePersonRole(role({ roleType: "BENEFICIARY" })), "CRS07_ROLE_TYPE_NOT_PERMITTED");
});
test("PolicyRole must point to Application person", () => code(() => contract.createApplicationPolicyLineage(valid({ personRole: role({ personReference: "person:2" }) })), "CRS07_PERSON_ROLE_LINEAGE_MISMATCH"));
test("domain link must be Cartera Policy authority", () => code(() => contract.createApplicationPolicyLineage(valid({ domainLink: link({ domain: "QUOTE", recordType: "QUOTE", authority: "QUOTE_PERSISTENCE_AUTHORITY" }) })), "CRS07_POLICY_DOMAIN_LINK_INVALID"));
test("initial Policy version must prove issuance", () => code(() => contract.createApplicationPolicyLineage(valid({ policy: policy({ statusValue: "PENDING" }) })), "CRS07_INITIAL_POLICY_NOT_ISSUED"));
test("evidence cannot postdate confirmation", () => code(() => contract.createApplicationPolicyLineage(valid({ issuanceEvidence: evidence({ observedAt: "2026-08-01T02:00:00Z" }) })), "CRS07_EVIDENCE_AFTER_CONFIRMATION"));
test("missing lineage remains explicit", () => {
  const value = contract.createMissingApplicationPolicyLineage({ advisorReference: "advisor:1",
    application: application({ lifecycleState: "SUBMITTED" }), missingReason: "APPLICATION_NOT_APPROVED",
    observedAt: "2026-08-01T02:00:00Z", details: { state: "SUBMITTED" } });
  assert.equal(value.lineageState, "UNRESOLVED");
  assert.equal(value.boundaries.automaticPolicyCreation, false);
});
test("prepares governed Policy command", () => {
  const command = { contractType: "FORGE_CONFIRMED_POLICY_COMMAND", contractVersion: "CARTERA-010B.1",
    advisorId: "advisor:1", actorReference: "advisor:1", policy: {}, roles: [],
    evidence: { sourceType: "POLICY_ADMIN_RECORD", provenance: {} }, lineage: { quoteReference: "quote:1" },
    commandDigest: "0".repeat(64) };
  const prepared = contract.prepareIssuedPolicyCommand({ command, applicationReference: "application:1", sourceAuthority: "carrier-admin" });
  assert.equal(prepared.lineage.applicationReference, "application:1");
  assert.equal(prepared.evidence.verificationState, "CONFIRMED");
  assert.equal(prepared.evidence.provenance.issuanceConfirmed, true);
  assert.equal(prepared.commandDigest.length, 64);
});
test("diagnostics preserve authorities", () => {
  const value = contract.diagnostics();
  assert.equal(value.policyAuthority, "CARTERA_POLICY_AUTHORITY");
  assert.equal(value.applicationCreatesPolicy, false);
  assert.equal(value.automaticBusinessAction, false);
});
