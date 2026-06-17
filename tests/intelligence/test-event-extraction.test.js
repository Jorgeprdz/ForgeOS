// tests/intelligence/test-event-extraction.test.js
const assert = require('assert');
const EventExtractionEngine = require('../../src/intelligence/alpha-runtime/event-extraction-engine');
const ActionOwnershipEngine = require('../../src/intelligence/alpha-runtime/action-ownership-engine');
const ProcessAdvancementEngine = require('../../src/intelligence/alpha-runtime/process-advancement-engine');

const extractor = new EventExtractionEngine();
const ownershipEngine = new ActionOwnershipEngine();
const advancementEngine = new ProcessAdvancementEngine();

async function runTests() {
    console.log('Running test 1: "Me dijo que lo revisa y me llama el viernes."');
    const e1 = extractor.extract("Me dijo que lo revisa y me llama el viernes.");
    const o1 = ownershipEngine.determineOwnership(e1);
    const a1 = advancementEngine.determineAdvancement(e1);
    assert.strictEqual(o1.owner, 'prospect');
    assert.strictEqual(a1.advancementState, 'advanced');
    console.log('Test 1 passed');

    console.log('Running test 2: "Quedó de mandarme documentos mañana."');
    const e2 = extractor.extract("Quedó de mandarme documentos mañana.");
    const o2 = ownershipEngine.determineOwnership(e2);
    const a2 = advancementEngine.determineAdvancement(e2);
    assert.strictEqual(o2.owner, 'prospect');
    assert.strictEqual(a2.advancementState, 'advanced');
    assert.strictEqual(e2[0].type, 'commitment_established');
    console.log('Test 2 passed');

    console.log('Running test 3: "Yo le voy a enviar la propuesta el lunes."');
    const e3 = extractor.extract("Yo le voy a enviar la propuesta el lunes.");
    const o3 = ownershipEngine.determineOwnership(e3);
    const a3 = advancementEngine.determineAdvancement(e3);
    assert.strictEqual(o3.owner, 'advisor');
    assert.strictEqual(a3.advancementState, 'advanced');
    console.log('Test 3 passed');

    // Quality Tests
    console.log('Running Quality Test 1: "Me llama el viernes." (STRONG)');
    const q1 = extractor.extract("Me llama el viernes.");
    const c1 = q1.find(e => e.type === 'commitment_established');
    assert.strictEqual(c1.data.quality, 'strong');
    console.log('Quality Test 1 passed');

    console.log('Running Quality Test 2: "Lo revisa y me avisa." (MEDIUM)');
    const q2 = extractor.extract("Lo revisa y me avisa.");
    const c2 = q2.find(e => e.type === 'commitment_established');
    assert.strictEqual(c2.data.quality, 'medium');
    console.log('Quality Test 2 passed');

    console.log('Running Quality Test 3: "Luego hablamos." (WEAK)');
    const q3 = extractor.extract("Luego hablamos.");
    const c3 = q3.find(e => e.type === 'commitment_established');
    assert.strictEqual(c3.data.quality, 'weak');
    console.log('Quality Test 3 passed');
}

runTests().then(() => console.log('All new tests passed')).catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
