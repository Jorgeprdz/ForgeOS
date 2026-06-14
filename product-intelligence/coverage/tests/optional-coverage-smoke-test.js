import { explainOptionalCoverage } from '../medical-events/optional-coverage-intelligence-engine.js';

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

const ceda = explainOptionalCoverage({ coverageCode: 'CEDA' });
const international = explainOptionalCoverage({ coverageName: 'Internacional' });
const unknown = explainOptionalCoverage({ coverageName: 'Beneficio Especial' });

test('CEDA explanation generated', () => {
  assert(ceda.coverageName === 'CEDA', 'CEDA mismatch.');
  assert(ceda.simpleExplanation.length > 20, 'CEDA explanation missing.');
});

test('International explanation generated', () => {
  assert(international.coverageName === 'Internacional', 'International mismatch.');
});

test('Unknown coverage returns safe fallback', () => {
  assert(unknown.coverageName === 'Beneficio Especial', 'Unknown fallback mismatch.');
});

test('No eligibility decision generated', () => {
  assert(!Object.hasOwn(ceda, 'eligible'), 'Must not include eligible.');
  assert(!Object.hasOwn(ceda, 'covered'), 'Must not include covered.');
});

console.log('\nFORGE GMM OPTIONAL COVERAGE SMOKE TEST v0.1\n');

for (const result of results) {
  console.log(`${result.status} ${result.name}`);
  if (result.error) {
    console.log(`   ${result.error}`);
  }
}

console.log('\nOptional Coverage:');
console.log(JSON.stringify({ ceda, international, unknown }, null, 2));

const failed = results.filter((result) => result.status === 'FAIL');
console.log('\nSummary:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);

if (failed.length > 0) {
  process.exit(1);
}
