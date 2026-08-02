import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL(
  "../supabase/migrations/20260801000610_crs07_application_policy_lineage_reconciliation.sql",
  import.meta.url,
), "utf8");

test("migration is transactional and creates no second Policy store", () => {
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;\s*$/i);
  assert.doesNotMatch(sql, /create\s+table/i);
});
test("adds Application lineage index to existing PolicyVersion", () => assert.match(sql, /policy_versions_application_lineage_idx[\s\S]*application_reference/i));
test("direct lineage requires governed command context", () => {
  assert.match(sql, /CRS07_APPLICATION_LINEAGE_REQUIRES_GOVERNED_COMMAND/);
  assert.match(sql, /forge\.crs07_application_policy_lineage_command/);
});
test("requires an approved Application in the same owner scope", () => {
  assert.match(sql, /commercial_applications/);
  assert.match(sql, /lifecycle_state <> 'APPROVED'/);
  assert.match(sql, /a\.advisor_id = new\.advisor_id/);
});
test("requires exact Quote and product lineage", () => {
  assert.match(sql, /CRS07_QUOTE_LINEAGE_MISMATCH/);
  assert.match(sql, /CRS07_PRODUCT_LINEAGE_MISMATCH/);
});
test("requires confirmed strong issuance evidence", () => {
  assert.match(sql, /verification_state <> 'CONFIRMED'/);
  assert.match(sql, /POLICY_ADMIN_RECORD/);
  assert.match(sql, /CARRIER_ISSUANCE_RECEIPT/);
  assert.match(sql, /issuanceConfirmed/);
  assert.match(sql, /sourceAuthority/);
});
test("first PolicyVersion must be ISSUED or ACTIVE", () => assert.match(sql, /version_number = 1[\s\S]*status_value not in \('ISSUED', 'ACTIVE'\)/));
test("requires confirmed permitted PolicyRole for Application person", () => {
  assert.match(sql, /participant_person_id = application_row\.person_id/);
  assert.match(sql, /POLICY_OWNER.*INSURED.*ADDITIONAL_INSURED.*PAYOR/s);
  assert.match(sql, /confirmation_state = 'CONFIRMED'/);
});
test("one Application cannot create multiple Policies", () => assert.match(sql, /CRS07_APPLICATION_MULTIPLE_POLICY_CONFLICT/));
test("lineage is immutable across later versions", () => {
  assert.match(sql, /CRS07_PREVIOUS_POLICY_VERSION_REQUIRED/);
  assert.match(sql, /CRS07_POLICY_LINEAGE_IMMUTABLE/);
});
test("wrapper delegates to existing Cartera authority", () => {
  assert.match(sql, /forge_crs07_confirm_issued_policy_from_application/);
  assert.match(sql, /forge_cartera010b_confirm_policy_with_parties\(p_command\)/);
});
test("wrapper returns no-automation boundaries", () => {
  assert.match(sql, /'policyCreatedByApplication', false/);
  assert.match(sql, /'quoteUsedAsPolicyAuthority', false/);
  assert.match(sql, /'automaticPolicyCreation', false/);
});
test("trigger helpers are owner-only and wrapper is authenticated-only", () => {
  assert.match(sql, /forge_crs07_application_policy_lineage_insert_guard\(\)[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /forge_crs07_confirm_issued_policy_from_application\(jsonb\)[\s\S]*to authenticated/);
});
test("does not mutate Application, Quote, Pipeline, payment or service", () => {
  assert.doesNotMatch(sql, /update\s+public\.commercial_applications/i);
  assert.doesNotMatch(sql, /update\s+public\.quote_lifecycle/i);
  assert.doesNotMatch(sql, /insert\s+into\s+public\.(?:pipeline|policy_payment|service)/i);
});
