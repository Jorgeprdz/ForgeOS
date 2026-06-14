import { classifyEventMultiLabel } from '../medical-events/multi-label-event-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const padel = classifyEventMultiLabel({ event: 'I fell playing padel and fractured my arm. Surgery may be required.' });
const texas = classifyEventMultiLabel({ event: 'My wife is in Texas and labor started.' });
const ivf = classifyEventMultiLabel({ event: 'My wife became pregnant through IVF.' });

test('Padel fracture has accident sports and surgery labels', () => {
  assert(padel.primaryEvent === 'ACCIDENT', 'Primary mismatch.');
  assert(padel.secondaryEvents.includes('SPORTS_INJURY'), 'Sports missing.');
  assert(padel.secondaryEvents.includes('POSSIBLE_SURGERY'), 'Surgery missing.');
});
test('Labor in Texas has childbirth and foreign labels', () => {
  assert(texas.primaryEvent === 'CHILDBIRTH', 'Childbirth mismatch.');
  assert(texas.secondaryEvents.includes('FOREIGN_EVENT'), 'Foreign missing.');
});
test('IVF pregnancy has assisted reproduction label', () => {
  assert(ivf.primaryEvent === 'PREGNANCY', 'Pregnancy mismatch.');
  assert(ivf.secondaryEvents.includes('ASSISTED_REPRODUCTION'), 'IVF missing.');
});

console.log('\nFORGE GMM MULTI LABEL EVENT SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ padel, texas, ivf }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
