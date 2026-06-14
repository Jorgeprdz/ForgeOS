import { analyzeMaternitySituation } from '../medical-events/maternity-intelligence-engine.js';

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); }
}
function assert(condition, message) { if (!condition) throw new Error(message); }

const pregnancy = analyzeMaternitySituation({
  eventType: 'pregnancy',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', policyStartDate: '2022-01-01', insuredAge: 33 }
});

const childbirth = analyzeMaternitySituation({
  eventType: 'childbirth',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', policyStartDate: '2022-01-01', insuredAge: 33, pregnancyWeeks: 39, deliveryDate: '2026-09-01' }
});

test('Pregnancy missing evidence detected', () => {
  assert(pregnancy.status === 'INSUFFICIENT_EVIDENCE', 'Pregnancy status mismatch.');
  assert(pregnancy.missingEvidence.includes('pregnancyWeeks'), 'Missing pregnancyWeeks mismatch.');
});

test('Childbirth routes to human review', () => {
  assert(childbirth.status === 'HUMAN_REVIEW_REQUIRED', 'Childbirth review mismatch.');
});

test('No coverage conclusion generated', () => {
  assert(!Object.hasOwn(childbirth, 'covered'), 'Must not include covered.');
});

console.log('\nFORGE GMM MATERNITY SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ pregnancy, childbirth }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
