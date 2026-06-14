import { runCoverageIntelligence } from '../coverage-intelligence-orchestrator.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const pregnancy = runCoverageIntelligence({
  event: 'Pregnancy',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', policyStartDate: '2022-01-01', insuredAge: 33, pregnancyWeeks: 20 }
});

const brokenArm = runCoverageIntelligence({
  event: 'Broken arm after accident',
  policyFacts: {
    product: 'Alfa Medical',
    policyStatus: 'ACTIVE',
    eventDate: '2026-06-05',
    accidentDescription: 'Broken arm after fall',
    firstExpenseDate: '2026-06-05',
    territoriality: 'NACIONAL'
  }
});

const missing = runCoverageIntelligence({
  event: 'Foreign emergency',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE' }
});

test('Pregnancy routes to human review', () => { assert(pregnancy.evaluationStatus === 'HUMAN_REVIEW_REQUIRED', 'Pregnancy status mismatch.'); });
test('Broken arm has allowed status', () => { assert(['LIKELY_COVERED', 'INSUFFICIENT_EVIDENCE', 'HUMAN_REVIEW_REQUIRED'].includes(brokenArm.evaluationStatus), 'Broken arm status mismatch.'); });
test('Missing evidence routes appropriately', () => { assert(missing.evaluationStatus !== 'LIKELY_COVERED', 'Missing evidence should not route likely covered.'); });
test('No final insurer decision generated', () => {
  assert(!Object.hasOwn(brokenArm, 'approved'), 'Must not include approved.');
  assert(!Object.hasOwn(brokenArm, 'denied'), 'Must not include denied.');
  assert(!Object.hasOwn(brokenArm, 'claimDecision'), 'Must not include claimDecision.');
});

console.log('\nFORGE GMM COVERAGE ORCHESTRATOR SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ pregnancy, brokenArm, missing }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
