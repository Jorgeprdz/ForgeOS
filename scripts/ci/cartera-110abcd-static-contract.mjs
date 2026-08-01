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

const closure100 = read('docs/evidence/FORGE_CARTERA_100ABCD_REMOTE_ACCEPTANCE_CLOSURE_001.md');
const architecture = read('docs/architecture/source-truth/FORGE_CARTERA_110ABCD_PROGRAM_COMPLETION_AND_PROMOTION_001.md');
const manifest = read('platform/program-governance/cartera-110a-program-completion-manifest.js');
const readiness = read('platform/program-governance/cartera-110b-promotion-readiness-policy.js');
const decision = read('advisor-os/cartera/cartera-110c-program-promotion-decision-service.js');
const tests = read('tests/cartera-110abcd-program-completion-test.mjs');

requireText(closure100, 'CARTERA_100_COMPLETE=YES', 'CARTERA110_100_COMPLETION_EVIDENCE_MISSING');
requireText(closure100, 'CARTERA_RELATIONSHIP_INTELLIGENCE_ROADMAP_COMPLETE=YES', 'CARTERA110_ROADMAP_COMPLETION_EVIDENCE_MISSING');
requireText(closure100, 'NEXT=CARTERA_PROGRAM_COMPLETION_AND_PROMOTION_DECISION', 'CARTERA110_NEXT_AUTHORITY_MISMATCH');
requireText(closure100, 'MERGE_AUTHORIZATION=NOT_GRANTED', 'CARTERA110_PRIOR_MERGE_BOUNDARY_MISSING');

for (const stageId of ['001', '010', '020', '030', '040', '050', '060', '070', '080', '090', '100']) {
  requireText(manifest, `'${stageId}'`, `CARTERA110_REQUIRED_STAGE_MISSING:${stageId}`);
}

requireText(manifest, "state: 'MISSING'", 'CARTERA110_MISSING_STATE_NOT_EXPLICIT');
requireText(manifest, "state: 'CONFLICTING'", 'CARTERA110_CONFLICTING_STATE_NOT_EXPLICIT');
requireText(manifest, 'branchNameIsEvidence: false', 'CARTERA110_BRANCH_EVIDENCE_BOUNDARY_MISSING');
requireText(manifest, 'pullRequestTitleIsEvidence: false', 'CARTERA110_PR_TITLE_EVIDENCE_BOUNDARY_MISSING');
requireText(manifest, 'automaticMerge: false', 'CARTERA110_AUTOMATIC_MERGE_BOUNDARY_MISSING');
requireText(manifest, 'mainMutation: false', 'CARTERA110_MAIN_MUTATION_BOUNDARY_MISSING');

for (const text of [
  'BOARD_APPROVAL_NOT_GRANTED',
  'MERGE_AUTHORIZATION_NOT_GRANTED',
  'BASE_CHAIN_NOT_MERGED',
  'CURRENT_MAIN_HEAD_NOT_VERIFIED',
  'UNRESOLVED_REVIEW_THREADS',
  'PENDING_REVIEWS',
]) {
  requireText(readiness, text, `CARTERA110_READINESS_BLOCKER_MISSING:${text}`);
}

requireText(readiness, "'READY_FOR_CONTROLLED_PROMOTION'", 'CARTERA110_READY_STATE_MISSING');
requireText(readiness, "'REVIEW_REQUIRED'", 'CARTERA110_REVIEW_REQUIRED_STATE_MISSING');
requireText(readiness, "'NOT_READY'", 'CARTERA110_NOT_READY_STATE_MISSING');
requireText(readiness, 'readinessIsAuthorization: false', 'CARTERA110_READINESS_AUTHORITY_BOUNDARY_MISSING');
requireText(readiness, 'automaticDatabaseMutation: false', 'CARTERA110_DATABASE_MUTATION_BOUNDARY_MISSING');

requireText(decision, "new Set(['HOLD', 'AUTHORIZE_CONTROLLED_PROMOTION'])", 'CARTERA110_DECISION_SET_MISSING');
requireText(decision, 'CARTERA110_PROMOTION_NOT_READY_OR_AUTHORIZED', 'CARTERA110_PREMATURE_AUTHORIZATION_GUARD_MISSING');
requireText(decision, 'authorizationDoesNotExecuteMerge: true', 'CARTERA110_NO_EXECUTION_BOUNDARY_MISSING');
requireText(decision, 'mergeExecuted: false', 'CARTERA110_MERGE_EFFECT_BOUNDARY_MISSING');
requireText(decision, 'mainMutated: false', 'CARTERA110_MAIN_EFFECT_BOUNDARY_MISSING');
requireText(decision, 'databaseMutated: false', 'CARTERA110_DATABASE_EFFECT_BOUNDARY_MISSING');

for (const text of [
  'PROMOTION_DECISION=HOLD',
  'BOARD_APPROVAL=NOT_GRANTED',
  'MERGE_AUTHORIZATION=NOT_GRANTED',
  'AUTOMATIC_MERGE=FORBIDDEN',
  'MAIN_MUTATION=NOT_AUTHORIZED',
  'DATABASE_MUTATION=NOT_AUTHORIZED',
  'PRODUCT_UI_MUTATION=NO',
]) {
  requireText(architecture, text, `CARTERA110_ARCHITECTURE_BOUNDARY_MISSING:${text}`);
}

requireText(tests, "110D one-pass outcome remains HOLD under current authority", 'CARTERA110_ONE_PASS_ACCEPTANCE_TEST_MISSING');

const combined = [manifest, readiness, decision, architecture, tests].join('\n');
forbidText(combined, 'git push origin main', 'CARTERA110_MAIN_PUSH_FORBIDDEN');
forbidText(combined, 'merge_pull_request', 'CARTERA110_AUTOMATIC_PR_MERGE_FORBIDDEN');
forbidText(combined, 'supabase.from(', 'CARTERA110_DATABASE_CLIENT_MUTATION_FORBIDDEN');
forbidText(combined, 'window.location', 'CARTERA110_PRODUCT_NAVIGATION_MUTATION_FORBIDDEN');

console.log('CARTERA_110_STATIC_CONTRACT=PASS');
console.log('CARTERA_110A_PROGRAM_COMPLETION_MANIFEST=PASS');
console.log('CARTERA_110B_PROMOTION_READINESS_POLICY=PASS');
console.log('CARTERA_110C_GOVERNED_DECISION=PASS');
console.log('CARTERA_110D_ACCEPTANCE_BOUNDARY=PASS');
console.log('PRODUCT_UI_MUTATION=NO');
console.log('DATABASE_MUTATION=NOT_AUTHORIZED');
console.log('MAIN_MUTATION=NOT_AUTHORIZED');
console.log('AUTOMATIC_MERGE=FORBIDDEN');
