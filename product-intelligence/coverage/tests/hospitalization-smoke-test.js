import { analyzeHospitalizationScenario } from '../medical-events/hospitalization-intelligence-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const hospitalization = analyzeHospitalizationScenario({
  event: 'Emergency hospitalization',
  policyFacts: { product: 'Alfa Medical', policyStatus: 'ACTIVE', diagnosis: 'Appendicitis', hospital: 'Hospital Norte', admissionDate: '2026-06-05' }
});

test('Hospitalization context ready', () => { assert(hospitalization.status === 'HOSPITALIZATION_CONTEXT_READY', 'Status mismatch.'); });
test('Emergency type detected', () => { assert(hospitalization.hospitalizationType === 'EMERGENCY', 'Type mismatch.'); });
test('No coverage decision generated', () => { assert(!Object.hasOwn(hospitalization, 'coverageDecision'), 'Must not include coverageDecision.'); });

console.log('\nFORGE GMM HOSPITALIZATION SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify(hospitalization, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
