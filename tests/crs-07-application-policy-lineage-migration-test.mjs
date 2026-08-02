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
const triggerHardening = await readFile(new URL(
  "../supabase/migrations/20260801000613_crs07_internal_trigger_privilege_hardening.sql",
  import.meta.url,
), "utf8");

const allSql = `${sql}\n${hardening}\n${qualification}\n${triggerHardening}`;

test("migration sequence is transactional and creates no second Policy store", () => {
  for (const migration of [sql, hardening, qualification, triggerHardening]) {
    assert.match(migration, /begin;[\s\S]*commit;\s*$/i);
  }
  assert.doesNotMatch(allSql, /create\s+table/i);
});
test("adds Application lineage index to existing PolicyVersion", () => assert.match(sql, /policy_versions_application_lineage_idx[\s\S]*application_reference/i));
test("direct lineage requires NULL-safe governed command context", () => {
  assert.match(sql, /CRS07_APPLICATION_LINEAGE_REQUIRES_GOVERNED_COMMAND/);
  assert.match(triggerHardening, /forge\.crs07_application_policy_lineage_command/);
  assert.match(triggerHardening, /is\s+distinct\s+from\s+'on'/i);
});
test("wrapper rejects ambiguous PLpgSQL references", () => {
  assert.match(qualification, /#variable_conflict\s+error/i);
  assert.match(qualification, /v_application_reference/);
  assert.match(qualification, /a\.application_reference = v_application_reference/);
  assert.doesNotMatch(qualification, /a\.application_reference = application_reference/);
});
test("requires an approved Application in the same owner scope", () => {
  assert.match(triggerHardening, /commercial_applications/);
  assert.match(triggerHardening, /lifecycle_state <> 'APPROVED'/);
  assert.match(triggerHardening, /a\.advisor_id = new\.advisor_id/);
});
test("requires exact Quote and product lineage", () => {
  assert.match(triggerHardening, /CRS07_QUOTE_LINEAGE_MISMATCH/);
  assert.match(triggerHardening, /CRS07_PRODUCT_LINEAGE_MISMATCH/);
});
test("requires confirmed strong issuance evidence", () => {
  assert.match(triggerHardening, /verification_state <> 'CONFIRMED'/);
  assert.match(triggerHardening, /POLICY_ADMIN_RECORD/);
  assert.match(triggerHardening, /CARRIER_ISSUANCE_RECEIPT/);
  assert.match(triggerHardening, /issuanceConfirmed/);
  assert.match(triggerHardening, /sourceAuthority/);
});
test("first PolicyVersion must be ISSUED or ACTIVE", () => assert.match(triggerHardening, /version_number = 1[\s\S]*status_value not in \('ISSUED', 'ACTIVE'\)/));
test("requires confirmed permitted PolicyRole for Application person", () => {
  assert.match(triggerHardening, /participant_person_id = application_row\.person_id/);
  assert.match(triggerHardening, /POLICY_OWNER.*INSURED.*ADDITIONAL_INSURED.*PAYOR/s);
  assert.match(triggerHardening, /confirmation_state = 'CONFIRMED'/);
});
test("one Application cannot create multiple Policies", () => assert.match(triggerHardening, /CRS07_APPLICATION_MULTIPLE_POLICY_CONFLICT/));
test("lineage is immutable across later versions", () => {
  assert.match(triggerHardening, /CRS07_PREVIOUS_POLICY_VERSION_REQUIRED/);
  assert.match(triggerHardening, /CRS07_POLICY_LINEAGE_IMMUTABLE/);
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
test("internal trigger helpers are owner-only and wrapper is authenticated-only", () => {
  assert.match(triggerHardening, /forge_crs07_application_policy_lineage_insert_guard\(\)[\s\S]*security definer/i);
  assert.match(triggerHardening, /forge_crs07_application_policy_lineage_commit_guard\(\)[\s\S]*security definer/i);
  assert.match(triggerHardening, /forge_crs07_application_policy_lineage_insert_guard\(\)[\s\S]*from public, anon, authenticated/);
  assert.match(triggerHardening, /forge_crs07_application_policy_lineage_commit_guard\(\)[\s\S]*from public, anon, authenticated/);
  assert.match(qualification, /forge_crs07_confirm_issued_policy_from_application\(jsonb\)[\s\S]*to authenticated/);
  assert.doesNotMatch(triggerHardening, /grant\s+select\s+on\s+public\.policy_roles\s+to\s+authenticated/i);
});
test("does not mutate Application, Quote, Pipeline, payment or service", () => {
  assert.doesNotMatch(allSql, /update\s+public\.commercial_applications/i);
  assert.doesNotMatch(allSql, /update\s+public\.quote_lifecycle/i);
  assert.doesNotMatch(allSql, /insert\s+into\s+public\.(?:pipeline|policy_payment|service)/i);
});
