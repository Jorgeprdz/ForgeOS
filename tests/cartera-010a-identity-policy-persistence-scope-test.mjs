import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const scopePath =
  "docs/architecture/source-truth/FORGE_CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE_001.md";
const evidencePath =
  "docs/evidence/FORGE_CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE_EVIDENCE_001.md";

const scope = read(scopePath);
const evidence = read(evidencePath);

function requireMarkers(text, markers) {
  for (const marker of markers) {
    assert.match(text, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
}

test("010A closes the exact authorized scope without runtime or schema mutation", () => {
  requireMarkers(scope, [
    "PHASE=CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE",
    "STATUS=CLOSED_SCOPE_AND_AUTHORITY_LOCKED",
    "SOURCE_COMMIT=2a957ef07f2579b7fe780287d66ad20422ab5e1f",
    "RUNTIME_MUTATION=NO",
    "SCHEMA_MUTATION=NO",
    "SUPABASE_REMOTE_MUTATION=NO",
    "PRODUCT_UI_MUTATION=NO",
    "NEXT=CARTERA_010B_COMMERCIAL_PERSON_POLICY_ROLE_FOUNDATION",
    "CARTERA_010A_COMPLETE=YES",
    "CARTERA_010B_AUTHORIZED=YES",
  ]);
});

test("canonical identity and Policy ownership boundaries are explicit", () => {
  requireMarkers(scope, [
    "CANONICAL_DURABLE_IDENTITY=COMMERCIAL_PERSON",
    "PROSPECT_IDENTITY=STABLE_SALES_SOURCE_IDENTITY",
    "PROSPECT_DESTRUCTIVE_RENAME=FORBIDDEN",
    "AUTOMATIC_IDENTITY_MERGE=FORBIDDEN",
    "POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE",
    "POLICY_PARTICIPATION_AUTHORITY=POLICY_ROLE",
    "SINGLE_CLIENT_ID_AUTHORITY=FORBIDDEN",
  ]);
});

test("PolicyRole supports multi-party policies and keeps commercial authorities separate", () => {
  requireMarkers(scope, [
    "POLICY_OWNER",
    "INSURED",
    "ADDITIONAL_INSURED",
    "PAYOR",
    "BENEFICIARY",
    "ADVISOR_OF_RECORD",
    "ORIGINATING_ADVISOR",
    "SERVICING_ADVISOR",
    "PolicyRole must not collapse assignment, attribution, servicing or compensation",
  ]);
});

test("unknown Policy facts remain unknown and automatic Policy creation stays blocked", () => {
  requireMarkers(scope, [
    "UNKNOWN_TO_ZERO=FORBIDDEN",
    "UNKNOWN_TO_MXN=FORBIDDEN",
    "UNKNOWN_TO_ACTIVE=FORBIDDEN",
    "UNKNOWN_TO_STABLE=FORBIDDEN",
    "UNKNOWN_TO_MANUAL=FORBIDDEN",
    "QUOTE_ACCEPTANCE_CREATES_POLICY=NO",
    "APPLICATION_CREATES_POLICY_WITHOUT_EVIDENCE=NO",
    "AUTOMATIC_POLICY_CREATION=NO",
  ]);
});

test("010B is command-governed, tenant-bound and cannot create another ledger", () => {
  requireMarkers(scope, [
    "direct app-role writes to canonical tables are revoked",
    "no cross-advisor read, insert, update, confirmation, correction or archive",
    "security-definer commands pin a bounded `search_path`",
    "No new generic ledger is authorized",
    "Prospect Timeline must never become Policy Truth storage",
  ]);
});

test("010B allowed paths and excluded later phases are locked", () => {
  requireMarkers(scope, [
    "schemas/commercial-person-*.schema.json",
    "schemas/commercial-account-*.schema.json",
    "schemas/policy-v2-*.schema.json",
    "schemas/policy-role-*.schema.json",
    "platform/shared-commercial-model/**",
    "platform/policy-intelligence/**",
    "Carpeta or Policy UI redesign".replace("Carpeta", "Cartera"),
    "document upload/OCR worker implementation",
    "payment obligations or renewal calendar",
    "Future Radar",
  ]);
});

test("legacy Prospect identity remains a strict Sales source identity contract", () => {
  const schema = JSON.parse(read("schemas/advisor-prospect-identity-v1.schema.json"));
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.ownership.properties.domain.const, "ADVISOR_OS_SALES");
  assert.ok(schema.required.includes("sourceClaims"));
  assert.ok(schema.required.includes("prospectId"));
});

test("legacy Policy schema proves why clientId cannot become canonical Policy participation", () => {
  const schema = JSON.parse(read("schemas/policy.schema.json"));
  assert.equal(schema.additionalProperties, true);
  assert.ok(schema.required.includes("clientId"));
  assert.equal(schema.properties.clientId.type, "string");
  assert.equal(schema.properties.policyId.type, "string");
});

test("existing Policy read model remains safe static preview rather than canonical truth", () => {
  const adapter = read(
    "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js",
  );
  requireMarkers(adapter, [
    "adapterType: 'local_static_fixture'",
    "adapterMode: 'read_only'",
    "canonicalPolicyTruthClaimed: false",
    "policyWrite: false",
    "backendConnection: false",
  ]);
});

test("existing Prospect migration supplies reusable owner, archive and RLS patterns", () => {
  const migration = read(
    "supabase/migrations/20260717000100_067g17a1_prospect_opportunity_security_foundation.sql",
  );
  requireMarkers(migration, [
    "advisor_id = auth.uid()",
    "archive, never frontend DELETE",
    "advisor ownership transfer is not allowed",
    "archive history is immutable",
    "enable row level security",
    "revoke all on table",
  ]);
});

test("foundation chronology is reconciled in favor of the later PASS decision", () => {
  const finalReview = read(
    "docs/05-foundation/PAQ-08-FOUNDATION-LOCK-FINAL-REVIEW.md",
  );
  requireMarkers(finalReview, [
    "FOUNDATION LOCK STATUS",
    "PASS",
    "People.",
    "Accounts.",
    "Policy roles.",
    "Identity model.",
    "Closed.",
  ]);
  requireMarkers(evidence, [
    "FOUNDATION_LOCK_STATUS=PASS",
    "CRITICAL_BLOCKERS=NONE",
    "HISTORICAL_FOUNDATION_STATUS_RECONCILED=PASS",
    "CARTERA_010B_AUTHORIZED=YES",
  ]);
});
