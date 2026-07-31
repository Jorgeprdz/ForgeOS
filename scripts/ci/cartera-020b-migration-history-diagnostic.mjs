import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260731000220';
const PATH = 'supabase/migrations/20260731000220_cartera020b_evidence_tables.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020b-migration-history-diagnostic';
const REPORT_PATH = `${ARTIFACT_DIR}/report.json`;
const REMOTE_SQL_PATH = `${ARTIFACT_DIR}/remote-00220.sql`;
const LOCAL_SQL_PATH = `${ARTIFACT_DIR}/local-00220.sql`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeLf(value) {
  return String(value).replace(/\r\n/g, '\n');
}

function trimOneFinalNewline(value) {
  return `${normalizeLf(value).trim()}\n`;
}

function stripOuterTransaction(value) {
  const lines = normalizeLf(value).split('\n');
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith('--'));
  assert.match(meaningful[0]?.line ?? '', /^begin\s*;$/i, 'LOCAL_MISSING_OUTER_BEGIN');
  assert.match(meaningful.at(-1)?.line ?? '', /^commit\s*;$/i, 'LOCAL_MISSING_OUTER_COMMIT');
  return `${lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim()}\n`;
}

async function query(sql) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: 'NON_JSON_RESPONSE' };
  }
  if (!response.ok || body?.error) {
    throw new Error(`READ_ONLY_HISTORY_QUERY_HTTP_${response.status}:${String(body?.message ?? body?.error).slice(0, 1200)}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const rows = await query(
  `select version, name, statements,
          cardinality(statements) as statement_count
     from supabase_migrations.schema_migrations
    where version = '${VERSION}'
    limit 1`,
);
assert.equal(rows.length, 1, 'REMOTE_MIGRATION_00220_NOT_FOUND');

const remoteRow = rows[0];
const statementArray = Array.isArray(remoteRow.statements)
  ? remoteRow.statements
  : [String(remoteRow.statements ?? '')];
const remoteJoined = `${statementArray.join('\n\n').trim()}\n`;
const localRaw = readFileSync(PATH, 'utf8');
const localLf = normalizeLf(localRaw);
const localTrimmed = trimOneFinalNewline(localRaw);
const localBody = stripOuterTransaction(localRaw);

const candidates = {
  localRaw: { length: localRaw.length, sha256: sha256(localRaw) },
  localLf: { length: localLf.length, sha256: sha256(localLf) },
  localTrimmed: { length: localTrimmed.length, sha256: sha256(localTrimmed) },
  localBody: { length: localBody.length, sha256: sha256(localBody) },
  remoteJoined: { length: remoteJoined.length, sha256: sha256(remoteJoined) },
};

const exactMatches = Object.entries(candidates)
  .filter(([name, meta]) => name !== 'remoteJoined' && meta.sha256 === candidates.remoteJoined.sha256)
  .map(([name]) => name);

const report = {
  phase: 'CARTERA_020B_MIGRATION_HISTORY_DIAGNOSTIC',
  mode: 'READ_ONLY',
  projectRef: PROJECT_REF,
  version: VERSION,
  remoteName: remoteRow.name ?? null,
  statementCount: Number(remoteRow.statement_count ?? statementArray.length),
  candidates,
  exactMatches,
  remoteFirstLine: remoteJoined.split('\n').find((line) => line.trim()) ?? null,
  remoteLastLine: [...remoteJoined.split('\n')].reverse().find((line) => line.trim()) ?? null,
  localFirstLine: localRaw.split(/\r?\n/).find((line) => line.trim()) ?? null,
  localLastLine: [...localRaw.split(/\r?\n/)].reverse().find((line) => line.trim()) ?? null,
};

mkdirSync(ARTIFACT_DIR, { recursive: true });
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(REMOTE_SQL_PATH, remoteJoined, 'utf8');
writeFileSync(LOCAL_SQL_PATH, localRaw, 'utf8');

console.log(`CARTERA_020B_MIGRATION_HISTORY_DIAGNOSTIC=PASS`);
console.log(`MODE=READ_ONLY`);
console.log(`VERSION=${VERSION}`);
console.log(`REMOTE_SHA256=${candidates.remoteJoined.sha256}`);
console.log(`LOCAL_RAW_SHA256=${candidates.localRaw.sha256}`);
console.log(`LOCAL_BODY_SHA256=${candidates.localBody.sha256}`);
console.log(`EXACT_MATCHES=${exactMatches.join(',') || 'NONE'}`);
console.log(`REPORT=${REPORT_PATH}`);
