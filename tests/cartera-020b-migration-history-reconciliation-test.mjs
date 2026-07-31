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
  assert.ok(harness.includes('function normalizeMigrationSql(value)'));
  assert.ok(harness.includes("replace(/\\r\\n/g, '\\n').trim()"));
  assert.ok(harness.includes('const canonicalLocal = normalizeMigrationSql(raw)'));
  assert.ok(harness.includes('const localHash = sha256(canonicalLocal)'));
  assert.ok(harness.includes("normalizeMigrationSql(value.join('\\n\\n'))"));
  assert.ok(harness.includes('sqlLiteral(normalizeMigrationSql(raw))'));
});
