import { analyzeAccidentScenario } from '../medical-events/accident-intelligence-engine.js';

const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (error) { results.push({ name, status: 'FAIL', error: error.message }); } }
function assert(condition, message) { if (!condition) throw new Error(message); }

const accident = analyzeAccidentScenario({
  event: 'Car accident',
  policyFacts: {
    product: 'Alfa Medical',
    policyStatus: 'ACTIVE',
    eventDate: '2026-06-05',
    accidentDescription: 'Car accident with broken arm',
    firstExpenseDate: '2026-06-05',
    territoriality: 'NACIONAL',
    optionalCoverages: [{ code: 'CEDA', status: 'ACTIVE' }]
  }
});

test('Accident context ready', () => { assert(accident.status === 'ACCIDENT_CONTEXT_READY', 'Status mismatch.'); });
test('CEDA relevance detected', () => { assert(accident.cedaRelevant === true, 'CEDA relevance mismatch.'); });
test('No claim conclusion generated', () => { assert(!Object.hasOwn(accident, 'claimDecision'), 'Must not include claimDecision.'); });

console.log('\nFORGE GMM ACCIDENT SMOKE TEST v0.1\n');
for (const result of results) { console.log(`${result.status} ${result.name}`); if (result.error) console.log(`   ${result.error}`); }
console.log(JSON.stringify(accident, null, 2));
const failed = results.filter((result) => result.status === 'FAIL');
console.log(`\nSummary:\nTotal: ${results.length}\nPass: ${results.length - failed.length}\nFail: ${failed.length}`);
if (failed.length > 0) process.exit(1);
