import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL(
  "../supabase/migrations/20260801000610_crs07_application_policy_lineage_reconciliation.sql",
  import.meta.url,
), "utf8");
const hardening = await readFile(new URL(
  "../supabase/migrations/20260801000611_crs07_application_policy_lineage_guard_hardening.sql",
  import.meta.url,
), "utf8");
const qualification = await readFile(new URL(
  "../supabase/migrations/20260801000612_crs07_application_policy_wrapper_qualification.sql",
  import.meta.url,
), "utf8");

const allSql = `${sql}\n${hardening}\n${qualification}`;

test("migration sequence is transactional and creates no second Policy store", () => {
  for (const migration of [sql, hardening, qualification]) {
    assert.match(migration, /begin;[\s\S]*commit;\s*$/i);
  }
  assert.doesNotMatch(allSql, /create\s+table/i);
});
test("adds Application lineage index to existing PolicyVersion", () => assert.match(sql, /policy_versions_application_lineage_idx[\s\S]*application_reference/i));
test("direct lineage requires NULL-safe governed command context", () => {
  assert.match(sql, /CRS07_APPLICATION_LINEAGE_REQUIRES_GOVERNED_COMMAND/);
  assert.match(hardening, /forge\.crs07_application_policy_lineage_command/);
  assert.match(hardening, /is\s+distinct\s+from\s+'on'/i);
});
test("wrapper rejects ambiguous PLpgSQL references", () => {
  assert.match(qualification, /#variable_conflict\s+error/i);
  assert.match(qualification, /v_application_reference/);
  assert.match(qualification, /a\.application_reference = v_application_reference/);
  assert.doesNotMatch(qualification, /a\.application_reference = application_reference/);
});
test("requires an approved Application in the same owner scope", () => {
  assert.match(hardening, /commercial_applications/);
  assert.match(hardening, /lifecycle_state <> 'APPROVED'/);
  assert.match(hardening, /a\.advisor_id = new\.advisor_id/);
});
test("requires exact Quote and product lineage", () => {
  assert.match(hardening, /CRS07_QUOTE_LINEAGE_MISMATCH/);
  assert.match(hardening, /CRS07_PRODUCT_LINEAGE_MISMATCH/);
});
test("requires confirmed strong issuance evidence", () => {
  assert.match(hardening, /verification_state <> 'CONFIRMED'/);
  assert.match(hardening, /POLICY_ADMIN_RECORD/);
  assert.match(hardening, /CARRIER_ISSUANCE_RECEIPT/);
  assert.match(hardening, /issuanceConfirmed/);
  assert.match(hardening, /sourceAuthority/);
});
test("first PolicyVersion must be ISSUED or ACTIVE", () => assert.match(sql, /version_number = 1[\s\S]*status_value not in \('ISSUED', 'ACTIVE'\)/));
test("requires confirmed permitted PolicyRole for Application person", () => {
  assert.match(sql, /participant_person_id = application_row\.person_id/);
  assert.match(sql, /POLICY_OWNER.*INSURED.*ADDITIONAL_INSURED.*PAYOR/s);
  assert.match(sql, /confirmation_state = 'CONFIRMED'/);
});
test("one Application cannot create multiple Policies", () => assert.match(hardening, /CRS07_APPLICATION_MULTIPLE_POLICY_CONFLICT/));
test("lineage is immutable across later versions", () => {
  assert.match(hardening, /CRS07_PREVIOUS_POLICY_VERSION_REQUIRED/);
  assert.match(hardening, /CRS07_POLICY_LINEAGE_IMMUTABLE/);
});
test("qualified wrapper delegates to existing Cartera authority", () => {
  assert.match(qualification, /forge_crs07_confirm_issued_policy_from_application/);
  assert.match(qualification, /forge_cartera010b_confirm_policy_with_parties\(p_command\)/);
});
test("wrapper returns no-automation boundaries", () => {
  assert.match(qualification, /'policyCreatedByApplication', false/);
  assert.match(qualification, /'quoteUsedAsPolicyAuthority', false/);
  assert.match(qualification, /'automaticPolicyCreation', false/);
});
test("trigger helpers are owner-only and wrapper is authenticated-only", () => {
  assert.match(hardening, /forge_crs07_application_policy_lineage_insert_guard\(\)[\s\S]*from public, anon, authenticated/);
  assert.match(qualification, /forge_crs07_confirm_issued_policy_from_application\(jsonb\)[\s\S]*to authenticated/);
});
test("does not mutate Application, Quote, Pipeline, payment or service", () => {
  assert.doesNotMatch(allSql, /update\s+public\.commercial_applications/i);
  assert.doesNotMatch(allSql, /update\s+public\.quote_lifecycle/i);
  assert.doesNotMatch(allSql, /insert\s+into\s+public\.(?:pipeline|policy_payment|service)/i);
});
