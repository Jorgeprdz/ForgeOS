import { collectEventEvidence } from '../medical-events/evidence-collection-engine.js';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const evidence =
  collectEventEvidence({
    event: 'Car accident with broken arm',
    policyFacts: {
      policyStatus: 'ACTIVE',
      eventDate: '2026-06-05'
    }
  });

test('Collected evidence returned', () => {
  assert(evidence.collectedEvidence.policyStatus === 'ACTIVE', 'Collected evidence mismatch.');
});

test('Missing evidence returned', () => {
  assert(evidence.missingEvidence.includes('accidentDescription'), 'Missing evidence mismatch.');
});

test('Next best question returned', () => {
  assert(evidence.nextBestQuestion.length > 10, 'Next question missing.');
});

console.log('\nFORGE GMM EVIDENCE COLLECTION SMOKE TEST v0.1\n');
for (const result of results) {
  console.log(`${result.status} ${result.name}`);
  if (result.error) console.log(`   ${result.error}`);
}
console.log('\nEvidence:');
console.log(JSON.stringify(evidence, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log('\nSummary:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
