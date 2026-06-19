const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const migrationDir = path.join(root, 'supabase', 'migrations');
const migrationName = '20260619000100_supabase_rls_beta_foundation.sql';
const migrationPath = path.join(migrationDir, migrationName);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assertContains(content, pattern, message) {
  if (pattern instanceof RegExp) {
    assert(pattern.test(content), message);
    return;
  }

  assert(content.includes(pattern), message);
}

function run() {
  assert(fs.existsSync(migrationDir), 'Missing supabase/migrations directory');
  assert(fs.existsSync(migrationPath), `Missing migration file: ${migrationName}`);

  const migration = read(`supabase/migrations/${migrationName}`);
  const repository = read('src/services/forge-alpha-repository.js');
  const service = read('src/services/forge-alpha-service.js');
  const comisiones = read('comisiones.js');
  const offlineSync = read('platform/sync/offline-sync.js');
  const scanned = [
    migration,
    repository,
    service,
    comisiones,
    offlineSync
  ].join('\n');

  const tables = [
    'crm_data',
    'prospects',
    'alpha_events',
    'forge_outputs',
    'validation_results'
  ];

  for (const table of tables) {
    assertContains(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security;`),
      `Missing RLS enablement for ${table}`
    );
  }

  assertContains(migration, 'auth.uid()', 'Migration must use auth.uid() in policies');
  assertContains(migration, 'user_id uuid not null references auth.users(id)', 'crm_data must include user_id ownership');

  for (const table of ['prospects', 'alpha_events', 'forge_outputs', 'validation_results']) {
    assertContains(
      migration,
      new RegExp(`create table if not exists public\\.${table}[\\s\\S]*advisor_id uuid not null references auth\\.users\\(id\\)`),
      `${table} must include advisor_id ownership`
    );
  }

  assertContains(repository, 'requireAdvisorId(advisorId)', 'Repository must fail when advisorId is missing');
  assertContains(repository, 'advisor_id: advisorId', 'Repository must write advisor_id');
  assertContains(repository, ".eq('advisor_id', advisorId)", 'Prospect lookup must be scoped by advisor_id');
  assertContains(service, 'advisorId is required for Supabase Alpha persistence', 'Service must fail without advisorId');
  assertContains(service, 'repository.saveEvent(prospectId, note, runtimeResult.extracted_events, advisorId)', 'Service must pass advisorId to event persistence');
  assertContains(service, 'repository.saveOutput(alphaEvent.id, runtimeResult, advisorId)', 'Service must pass advisorId to output persistence');

  assertContains(comisiones, 'user_id: userId', 'comisiones crm_data writes must include user_id');
  assertContains(comisiones, "onConflict: 'user_id,coleccion'", 'comisiones must upsert crm_data by user_id and coleccion');

  assertContains(offlineSync, 'ALLOWED_REMOTE_TABLES', 'Offline sync must define remote table allowlist');
  assertContains(offlineSync, 'assertAllowedTable', 'Offline sync must validate item.table');
  assertContains(offlineSync, 'Remote table not allowed for beta', 'Offline sync must fail explicitly for non-whitelisted tables');

  for (const table of tables) {
    assertContains(offlineSync, `'${table}'`, `Offline sync allowlist must include ${table}`);
  }

  const prohibitedManagerPatterns = [
    ['team', 'memberships'].join('_'),
    ['team', 'invitations'].join('_'),
    ['manager', 'policy'].join(' '),
    ['Manager', 'RLS'].join(' ')
  ];

  for (const pattern of prohibitedManagerPatterns) {
    assert(
      !migration.includes(pattern),
      `Migration must not implement manager access: ${pattern}`
    );
  }

  const secretPatterns = [
    new RegExp(['SUPABASE', 'ACCESS', 'TOKEN'].join('_')),
    new RegExp(['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_')),
    new RegExp(['service', 'role'].join('_'), 'i'),
    new RegExp(['BANXICO', 'TOKEN'].join('_')),
    /eyJ[a-zA-Z0-9_-]+\./
  ];

  for (const pattern of secretPatterns) {
    assert(
      !pattern.test(scanned),
      `Potential secret found in RLS foundation files: ${pattern}`
    );
  }

  console.log('SUPABASE RLS FOUNDATION TEST PASSED');
}

run();
