import { evaluateCoverageFoundation } from '../medical-events/coverage-evaluation-foundation-engine.js';

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
  if (!condition) {
    throw new Error(message);
  }
}

const insufficient =
  evaluateCoverageFoundation({
    eventType: 'accident',
    policyFacts: {
      product: 'Alfa Medical',
      policyStatus: 'ACTIVE'
    }
  });

const routed =
  evaluateCoverageFoundation({
    eventType: 'accident',
    policyFacts: {
      product: 'Alfa Medical',
      policyStatus: 'ACTIVE',
      eventDate: '2026-06-05',
      accidentDescription: 'Broken leg after fall',
      territoriality: 'NACIONAL'
    }
  });

const review =
  evaluateCoverageFoundation({
    eventType: 'maternity',
    policyFacts: {
      product: 'Alfa Medical',
      policyStatus: 'ACTIVE',
      pregnancyWeeks: 20,
      policyStartDate: '2026-01-30',
      insuredAge: 33
    }
  });

test('Insufficient evidence detected', () => {
  assert(insufficient.evaluationStatus === 'INSUFFICIENT_EVIDENCE', 'Insufficient evidence mismatch.');
  assert(insufficient.missingEvidence.length > 0, 'Missing evidence not listed.');
});

test('Likely covered routing allowed with minimum evidence', () => {
  assert(routed.evaluationStatus === 'LIKELY_COVERED', 'Likely covered routing mismatch.');
});

test('Human review routing for maternity', () => {
  assert(review.evaluationStatus === 'HUMAN_REVIEW_REQUIRED', 'Human review routing mismatch.');
});

test('No claim decision generated', () => {
  assert(!Object.hasOwn(routed, 'claimDecision'), 'Must not include claimDecision.');
  assert(!Object.hasOwn(routed, 'approved'), 'Must not include approved.');
});

console.log('\nFORGE GMM COVERAGE FOUNDATION SMOKE TEST v0.1\n');

for (const result of results) {
  console.log(`${result.status} ${result.name}`);
  if (result.error) {
    console.log(`   ${result.error}`);
  }
}

console.log('\nCoverage Foundation:');
console.log(JSON.stringify({ insufficient, routed, review }, null, 2));

const failed = results.filter((result) => result.status === 'FAIL');
console.log('\nSummary:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);

if (failed.length > 0) {
  process.exit(1);
}
