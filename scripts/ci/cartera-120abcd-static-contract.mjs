import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function requireText(source, text, code) {
  if (!source.includes(text)) throw new Error(code);
}

function forbidText(source, text, code) {
  if (source.includes(text)) throw new Error(code);
}

const reconciliation = read('platform/program-governance/cartera-120a-current-main-reconciliation.js');
const manifest = read('platform/program-governance/cartera-120b-selective-promotion-manifest.js');
const authorization = read('advisor-os/cartera/cartera-120c-controlled-promotion-authorization.js');
const architecture = read('docs/architecture/source-truth/FORGE_CARTERA_120ABCD_CONTROLLED_PROMOTION_AUTHORIZATION_001.md');
const tests = read('tests/cartera-120abcd-controlled-promotion-authorization-test.mjs');
const combined = [reconciliation, manifest, authorization, architecture, tests].join('\n');

for (const marker of [
  "contract: 'CARTERA_120A_CURRENT_MAIN_RECONCILIATION_V1'",
  "'DIVERGED_SELECTIVE_PROMOTION_REQUIRED'",
  "strategy: historiesDiverged",
  'fullHistoryMergeAllowed',
  'stackedBranchMergeAllowed: false',
  'currentMainOverwriteAllowed: false',
  'executionAuthorized: false',
]) {
  requireText(reconciliation, marker, `CARTERA120_120A_MARKER_MISSING:${marker}`);
}

for (const marker of [
  "contract: 'CARTERA_120B_SELECTIVE_PROMOTION_MANIFEST_V1'",
  "new Set(['ADD', 'REPLACE', 'RETAIN', 'RECONCILE'])",
  "targetPath === 'app.js' || targetPath === 'cartera.js'",
  'CARTERA120_PRODUCT_ENTRY_REQUIRES_RECONCILE',
  'historicalCommitCountImported: 0',
  'sourceCommitHistoryImported: false',
  'automaticDatabaseMigration: false',
  'executionAuthorized: false',
]) {
  requireText(manifest, marker, `CARTERA120_120B_MARKER_MISSING:${marker}`);
}

for (const marker of [
  "new Set(['HOLD', 'AUTHORIZE_SELECTIVE_PROMOTION'])",
  "AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION",
  'CARTERA120_CURRENT_MAIN_HEAD_MOVED',
  'CARTERA120_ACCEPTED_PROGRAM_HEAD_MOVED',
  'CARTERA120_BOARD_APPROVAL_REQUIRED',
  'CARTERA120_MERGE_AUTHORIZATION_REQUIRED',
  'passInstructionIsMergeAuthorization: false',
  'authorizationIsExecution: false',
  'mergeExecuted: false',
  'mainMutated: false',
  'databaseMutated: false',
]) {
  requireText(authorization, marker, `CARTERA120_120C_MARKER_MISSING:${marker}`);
}

for (const marker of [
  'CURRENT_MAIN_HEAD=9d014116f6b3f0a626d8848d680a5c607f924d99',
  'ACCEPTED_CARTERA_PROGRAM_HEAD=b83a37abe3eb8b3a48c2fe89940b562e1367bfcc',
  'CURRENT_MAIN_AHEAD_BY=388',
  'ACCEPTED_PROGRAM_AHEAD_BY=594',
  'FULL_HISTORY_MERGE=FORBIDDEN',
  'PROMOTION_AUTHORIZATION=NOT_GRANTED',
  'PROMOTION_DECISION=HOLD',
  'NEXT=CARTERA_130_HEAD_BOUND_SELECTIVE_PROMOTION',
]) {
  requireText(architecture, marker, `CARTERA120_ARCHITECTURE_MARKER_MISSING:${marker}`);
}

requireText(tests, '120D one-pass closure ends in HOLD', 'CARTERA120_120D_TEST_MISSING');
requireText(tests, 'pass instruction as merge authorization', 'CARTERA120_GENERIC_GO_BOUNDARY_TEST_MISSING');

for (const forbidden of [
  'git push origin main',
  'merge_pull_request',
  'supabase.from(',
  'supabase.rpc(',
  'window.location',
  'fetch(',
  'localStorage.',
]) {
  forbidText(combined, forbidden, `CARTERA120_FORBIDDEN_EFFECT:${forbidden}`);
}

console.log('CARTERA_120_STATIC_CONTRACT=PASS');
console.log('CARTERA_120A_CURRENT_MAIN_RECONCILIATION=PASS');
console.log('CARTERA_120B_SELECTIVE_MANIFEST_CONTRACT=PASS');
console.log('CARTERA_120C_AUTHORIZATION_BOUNDARY=PASS');
console.log('CARTERA_120D_ACCEPTANCE_BOUNDARY=PASS');
console.log('PROMOTION_DECISION=HOLD');
console.log('PRODUCT_UI_MUTATION=NO');
console.log('DATABASE_MUTATION=NO');
console.log('MAIN_MUTATION=NO');
console.log('DEPLOYMENT=NO');
