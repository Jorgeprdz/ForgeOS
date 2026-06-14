import { analyzeSurgeryScenario } from '../medical-events/surgery-intelligence-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const surgery = analyzeSurgeryScenario({
  event: 'Scheduled surgery',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', diagnosis: 'Knee injury', surgeryType: 'Knee surgery', surgeryDate: '2026-07-01', hospital: 'Hospital Norte' }
});

const specialty = analyzeSurgeryScenario({
  event: 'Scheduled spine surgery',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', diagnosis: 'Spine condition', surgeryType: 'Spine surgery', surgeryDate: '2026-07-01', hospital: 'Hospital Norte', highSpecialtyTreatment: true }
});

test('Scheduled surgery context ready', () => { assert(surgery.status === 'SURGERY_CONTEXT_READY', 'Surgery status mismatch.'); });
test('High specialty routes to human review', () => { assert(specialty.status === 'HUMAN_REVIEW_REQUIRED', 'Specialty status mismatch.'); });
test('No surgery claim decision generated', () => { assert(!Object.hasOwn(surgery, 'claimDecision'), 'Must not include claimDecision.'); });

console.log('\nFORGE GMM SURGERY SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify({ surgery, specialty }, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
