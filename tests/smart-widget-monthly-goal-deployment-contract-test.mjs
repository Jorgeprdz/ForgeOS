import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(
  ".github/workflows/smart-widget-monthly-goal-deployment.yml",
  "utf8",
);
const script = fs.readFileSync(
  "scripts/deploy-smart-widget-monthly-goal-migration.mjs",
  "utf8",
);
const migration = fs.readFileSync(
  "supabase/migrations/20260801000400_smart_widget_monthly_policy_goals.sql",
  "utf8",
);

assert.match(workflow, /name: Smart Widget Monthly Goal Deployment/);
assert.match(workflow, /github\.actor == 'Jorgeprdz'/);
assert.match(workflow, /github\.ref_name == 'main'/);
assert.match(workflow, /SUPABASE_PROJECT_REF: rmlxigxysujsuwzgoimv/);
assert.match(workflow, /deploy-smart-widget-monthly-goal-migration\.mjs/);
assert.match(workflow, /smart-widget-monthly-goal-deployment-contract-test\.mjs/);
assert.match(workflow, /statuses:\s*write/);
assert.match(workflow, /smart-widgets\/monthly-goal-authority/);
assert.match(workflow, /steps\.deploy_authority\.outcome/);
assert.doesNotMatch(workflow, /supabase\s+db\s+push/i);
assert.doesNotMatch(workflow, /supabase\/migrations\/\*\*/);

assert.match(script, /MIGRATION_VERSION = "20260801000400"/);
assert.match(script, /MIGRATION_NAME = "smart_widget_monthly_policy_goals"/);
assert.match(script, /REMOTE_ACCOUNT_MUTATION_FORBIDDEN/);
assert.match(script, /authenticated_rollback_acceptance/);
assert.match(script, /cross_advisor_isolation/);
assert.match(script, /residual_rows_zero/);
assert.match(script, /migration_history/);
assert.match(script, /ROLLBACK_REQUIRED/);
assert.doesNotMatch(script, /auth\.users[\s\S]{0,80}(insert|update|delete)/i);

assert.match(migration, /begin;[\s\S]*commit;/i);
assert.match(migration, /enable row level security/i);
assert.match(migration, /security definer/i);
assert.match(migration, /grant execute on function public\.forge_set_monthly_policy_goal/i);
assert.doesNotMatch(migration, /\b(?:drop\s+table|truncate)\b/i);
assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete)[^;]*authenticated/i);

console.log("Smart Widget Monthly Goal Deployment Contract PASS 27/27");
