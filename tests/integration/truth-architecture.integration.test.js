/**
 * Forge Truth Architecture Integration Test v1.0
 * 
 * Validates the contract-level integration across:
 * HDL -> Claimability -> Truth Resolution -> Ledger Truth
 */

const { buildSemanticFrame, SCOPES, INTENTS } = require('../../src/intelligence/hdl');
const { evaluateClaimability, Claim_Types } = require('../../src/intelligence/claimability');
const { resolveTruth, Truth_Status } = require('../../src/intelligence/truth-resolution');
const { LedgerTruthService } = require('../../src/intelligence/ledger');

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

console.log('\nFORGE TRUTH ARCHITECTURE INTEGRATION TEST v1.0\n');

const ledgerService = new LedgerTruthService();

// --- Case 1: Actionable Request ---
test('Case 1: Pidio 6 cotizaciones para julio -> Ledger Active', () => {
  const note = "Pidio 6 cotizaciones para julio";
  const frame = buildSemanticFrame(note);
  
  // Simulate HDL logic (since builder is currently a skeleton)
  frame.addInterpretation({
    scope: SCOPES.COMMITMENT,
    intent_normalized: INTENTS.ADVISOR_REQUEST,
    action: 'preparar/enviar 6 cotizaciones',
    temporal_reference: 'julio',
    semantic_score: 1.0,
    claim_score: 1.0,
    claimable: true
  });

  // 1. Claimability
  const claimability = evaluateClaimability(frame);
  assert(claimability.claimable === true, 'Should be claimable');
  assert(claimability.claim_type === Claim_Types.COMMITMENT_CLAIM, 'Should be COMMITMENT_CLAIM');

  // 2. Truth Resolution
  // Simulate a candidate claim object produced from the frame
  const candidateClaim = {
    id: 'claim_001',
    type: claimability.claim_type,
    action: frame.interpretations[0].action,
    due: frame.interpretations[0].temporal_reference,
    provenance: { frame_id: 'frame_001' }
  };
  
  const resolution = resolveTruth(candidateClaim, ledgerService.getActiveTruth());
  assert(resolution.accepted === true, 'Should be accepted');
  assert(resolution.status === Truth_Status.ACCEPTED, 'Status should be ACCEPTED');

  // 3. Ledger Truth
  const entry = ledgerService.addTruth(candidateClaim, { id: 'adj_001' });
  assert(entry.status === 'ACTIVE', 'Ledger entry should be ACTIVE');
  assert(ledgerService.getActiveTruth()[candidateClaim.type] !== undefined, 'Ledger should have active truth');
});

// --- Case 2: Greeting ---
test('Case 2: Holi -> Non-claimable', () => {
  const note = "Holi";
  const frame = buildSemanticFrame(note);
  
  frame.addInterpretation({
    scope: SCOPES.GREETING,
    intent_normalized: INTENTS.GREETING_ONLY,
    claimable: false
  });

  const claimability = evaluateClaimability(frame);
  assert(claimability.claimable === false, 'Greeting should not be claimable');
});

// --- Case 3: Discovery Signal ---
test('Case 3: Lo va a pensar -> Discovery Signal only', () => {
  const note = "Lo va a pensar";
  const frame = buildSemanticFrame(note);
  
  frame.addInterpretation({
    scope: SCOPES.INTENT,
    intent_normalized: INTENTS.DECISION_DELAY,
    claimable: false
  });

  frame.addDiscoverySignal('UNCERTAINTY_SIGNAL', 'DECISION_DELAY', 0.95);

  const claimability = evaluateClaimability(frame);
  assert(claimability.claimable === false, 'Decision delay should not be claimable');
  assert(frame.discovery_signals.length > 0, 'Should have discovery signals');
});

// --- Case 4: Broad Temporal ---
test('Case 4: Llamar el próximo año -> Medium Quality Claim', () => {
  const note = "Llamar el próximo año";
  const frame = buildSemanticFrame(note);
  
  frame.addInterpretation({
    scope: SCOPES.COMMITMENT,
    intent_normalized: INTENTS.ADVISOR_REQUEST,
    action: 'llamar',
    temporal_reference: 'próximo año',
    claimable: true,
    confidence: { claim_score: 0.65 }
  });

  const claimability = evaluateClaimability(frame);
  assert(claimability.claimable === true, 'Broad temporal commitment should be claimable');

  const candidateClaim = {
    id: 'claim_002',
    type: claimability.claim_type,
    action: 'llamar',
    due: 'próximo año',
    provenance: { frame_id: 'frame_002' }
  };

  const resolution = resolveTruth(candidateClaim, {}); // No conflict
  assert(resolution.accepted === true, 'Should be accepted');
});

// Output Results
for (const result of results) {
  console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.name}`);
  if (result.error) console.log(`   Error: ${result.error}`);
}

const failed = results.filter(r => r.status === 'FAIL');
console.log(`\nSummary: ${results.length} tests, ${results.length - failed.length} passed, ${failed.length} failed.`);

if (failed.length > 0) process.exit(1);
