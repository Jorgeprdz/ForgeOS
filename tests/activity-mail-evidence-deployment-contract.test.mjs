import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/activity-mail-evidence-deployment.yml', 'utf8');
const deployer = readFileSync('scripts/deploy-activity-mail-evidence.mjs', 'utf8');
const edge = readFileSync('supabase/functions/mail-evidence-connect/index.ts', 'utf8');

test('deployment is guarded and does not mutate remote state from pull_request', () => {
  assert.match(workflow, /github\.event_name != 'pull_request'/);
  assert.match(workflow, /github\.actor == 'Jorgeprdz'/);
  assert.match(workflow, /SUPABASE_PROJECT_REF: rmlxigxysujsuwzgoimv/);
  assert.match(workflow, /supabase functions deploy mail-evidence-connect/);
  assert.match(workflow, /--no-verify-jwt/);
});

test('encryption secret is initialized once and preserved on later deploys', () => {
  assert.match(workflow, /supabase secrets list[\s\S]*FORGE_MAIL_TOKEN_ENCRYPTION_SECRET/);
  assert.match(workflow, /MAIL_ENCRYPTION_SECRET=PRESERVED/);
  assert.match(workflow, /openssl rand -hex 48/);
});

test('external provider credentials stay optional until app registration exists', () => {
  assert.match(workflow, /GOOGLE_OAUTH=PENDING_EXTERNAL_APP_REGISTRATION/);
  assert.match(workflow, /MICROSOFT_OAUTH=PENDING_EXTERNAL_APP_REGISTRATION/);
  assert.doesNotMatch(workflow, /client_secret\s*:\s*['"][^$]/i);
});

test('migration deployer is exact, non-destructive and records migration history', () => {
  assert.match(deployer, /20260807000100/);
  assert.match(deployer, /20260807000110/);
  assert.match(deployer, /PARTIAL_ACTIVITY_MAIL_EVIDENCE_AUTHORITY_REQUIRES_RECONCILIATION/);
  assert.match(deployer, /supabase_migrations\.schema_migrations/);
  assert.match(deployer, /DESTRUCTIVE_SQL_REJECTED/);
});

test('inventory tolerates provider tables that do not exist yet', () => {
  assert.match(deployer, /has_table_privilege\('authenticated',\s*to_regclass\('public\.activity_mail_provider_connections'\)/);
  assert.match(deployer, /has_table_privilege\('authenticated',\s*to_regclass\('public\.activity_mail_oauth_states'\)/);
  assert.doesNotMatch(deployer, /has_table_privilege\('authenticated','public\.activity_mail_provider_connections'/);
  assert.doesNotMatch(deployer, /has_table_privilege\('authenticated','public\.activity_mail_oauth_states'/);
});

test('public OAuth callback uses a clean path and remains state guarded', () => {
  assert.match(workflow, /mail-evidence-connect\/oauth\/callback/);
  assert.doesNotMatch(workflow, /mail-evidence-connect\?oauth=callback/);
  assert.match(edge, /OAUTH_CALLBACK_PATH_SUFFIX/);
  assert.match(edge, /url\.pathname\.endsWith\(OAUTH_CALLBACK_PATH_SUFFIX\)/);
  assert.match(edge, /parsed\.search/);
  assert.match(edge, /parsed\.hash/);
  assert.match(edge, /stateDigest/);
  assert.match(edge, /pkceChallenge/);
  assert.match(edge, /MAIL_AUTH_REQUIRED/);
});
