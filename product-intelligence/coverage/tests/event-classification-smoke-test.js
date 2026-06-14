import { classifyMedicalEvent } from '../medical-events/event-classification-engine.js';

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

const pregnancy = classifyMedicalEvent({ event: 'My wife is pregnant' });
const carAccident = classifyMedicalEvent({ event: 'Car accident with broken arm' });
const cancer = classifyMedicalEvent({ event: 'Cancer diagnosis and oncology treatment' });
const foreign = classifyMedicalEvent({ event: 'Emergency abroad in Spain' });
const dental = classifyMedicalEvent({ event: 'Dental treatment after tooth injury' });

test('Pregnancy classified', () => {
  assert(pregnancy.eventFamily === 'PREGNANCY', 'Pregnancy mismatch.');
});

test('Accident classified', () => {
  assert(carAccident.eventFamily === 'ACCIDENT', 'Accident mismatch.');
});

test('Cancer classified', () => {
  assert(cancer.eventFamily === 'CANCER', 'Cancer mismatch.');
});

test('Foreign treatment classified', () => {
  assert(foreign.eventFamily === 'FOREIGN_TREATMENT', 'Foreign mismatch.');
});

test('Dental classified', () => {
  assert(dental.eventFamily === 'DENTAL', 'Dental mismatch.');
});

console.log('\nFORGE GMM EVENT CLASSIFICATION SMOKE TEST v0.1\n');
for (const result of results) {
  console.log(`${result.status} ${result.name}`);
  if (result.error) console.log(`   ${result.error}`);
}
console.log('\nExamples:');
console.log(JSON.stringify({ pregnancy, carAccident, cancer, foreign, dental }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log('\nSummary:');
console.log(`Total: ${results.length}`);
console.log(`Pass: ${results.length - failed.length}`);
console.log(`Fail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
