import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const diagnostic = await readFile(
  new URL('../scripts/ci/cartera-020b-migration-history-diagnostic.mjs', import.meta.url),
  'utf8',
);
const harness = await readFile(
  new URL('../scripts/ci/cartera-020b-github-actions-remote-acceptance.mjs', import.meta.url),
  'utf8',
);

test('migration history diagnostic is read-only and pinned to 00220', () => {
  assert.match(diagnostic, /MODE=READ_ONLY/);
  assert.match(diagnostic, /20260731000220/);
  assert.match(diagnostic, /supabase_migrations\.schema_migrations/);
  assert.doesNotMatch(diagnostic, /\binsert\s+into\b/i);
  assert.doesNotMatch(diagnostic, /\bupdate\s+[^\n]+\bset\b/i);
  assert.doesNotMatch(diagnostic, /\bdelete\s+from\b/i);
  assert.doesNotMatch(diagnostic, /\balter\s+table\b/i);
  assert.doesNotMatch(diagnostic, /\bcreate\s+(table|function|trigger)\b/i);
});

test('diagnostic preserves both local and remote SQL as evidence', () => {
  assert.match(diagnostic, /remote-00220\.sql/);
  assert.match(diagnostic, /local-00220\.sql/);
  assert.match(diagnostic, /report\.json/);
  assert.match(diagnostic, /localRaw/);
  assert.match(diagnostic, /localBody/);
  assert.match(diagnostic, /remoteJoined/);
  assert.match(diagnostic, /exactMatches/);
});

test('remote harness hashes canonical SQL rather than trailing file whitespace', () => {
  assert.match(harness, /function normalizeMigrationSql\(value\)/);
  assert.match(harness, /replace\(\/\\r\\n\/g, '\\n'\)\.trim\(\)/);
  assert.match(harness, /const canonicalLocal = normalizeMigrationSql\(raw\)/);
  assert.match(harness, /const localHash = sha256\(canonicalLocal\)/);
  assert.match(harness, /normalizeMigrationSql\(value\.join\('\n\\n'\)\)/);
  assert.match(harness, /array\[\$\{sqlLiteral\(normalizeMigrationSql\(raw\)\)\}\]::text\[\]/);
});
