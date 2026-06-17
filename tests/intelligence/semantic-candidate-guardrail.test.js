// tests/intelligence/semantic-candidate-guardrail.test.js
const assert = require('assert');
const { validateCandidate } = require('../../src/intelligence/semantic-guardrails/semantic-candidate-guardrail');

const validCandidate = {
  type: "commitment_established",
  owner: "advisor",
  action: "send proposal",
  due: "monday",
  quality: "strong",
  confidence: 0.82,
  evidence_span: "el lunes le paso una propuesta",
  source: "semantic_extractor",
  model_version: "alpha-v0.2-experimental",
  generated_at: "2026-06-17T00:00:00.000Z",
  review_status: "proposed",
  unknowns: []
};

async function runTests() {
    console.log('Running test 1: Accept valid candidate');
    assert.strictEqual(validateCandidate(validCandidate).valid, true);

    console.log('Running test 2: Reject missing evidence_span');
    const c2 = { ...validCandidate }; delete c2.evidence_span;
    assert.strictEqual(validateCandidate(c2).valid, false);

    console.log('Running test 3: Reject empty evidence_span');
    const c3 = { ...validCandidate, evidence_span: ' ' };
    assert.strictEqual(validateCandidate(c3).valid, false);

    console.log('Running test 4: Reject missing confidence');
    const c4 = { ...validCandidate }; delete c4.confidence;
    assert.strictEqual(validateCandidate(c4).valid, false);

    console.log('Running test 5: Reject confidence > 1');
    const c5 = { ...validCandidate, confidence: 1.1 };
    assert.strictEqual(validateCandidate(c5).valid, false);

    console.log('Running test 6: Reject forbidden emotional inference');
    const c6 = { ...validCandidate, emotion: 'fearful' };
    assert.strictEqual(validateCandidate(c6).valid, false);

    console.log('Running test 7: Reject purchase probability inference');
    const c7 = { ...validCandidate, purchase_probability: 0.9 };
    assert.strictEqual(validateCandidate(c7).valid, false);

    console.log('Running test 8: Reject hidden intent inference');
    const c8 = { ...validCandidate, hidden_intent: 'wants_out' };
    assert.strictEqual(validateCandidate(c8).valid, false);

    console.log('Running test 9: Preserve unknowns');
    const c9 = { ...validCandidate, unknowns: ['missing_date'] };
    const result9 = validateCandidate(c9);
    assert.strictEqual(result9.valid, true);
    assert.deepStrictEqual(result9.sanitizedCandidate.unknowns, ['missing_date']);

    console.log('Running test 10: Return clear rejection reasons');
    const c10 = { ...validCandidate }; delete c10.source;
    const result10 = validateCandidate(c10);
    assert.strictEqual(result10.valid, false);
    assert.ok(result10.reasons.includes('Missing source'));
}

runTests().then(() => console.log('All guardrail tests passed')).catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
