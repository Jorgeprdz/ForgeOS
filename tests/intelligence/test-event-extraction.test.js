// tests/intelligence/test-event-extraction.test.js
const assert = require('assert');
const EventExtractionEngine = require('../../src/intelligence/alpha-runtime/event-extraction-engine');
const ActionOwnershipEngine = require('../../src/intelligence/alpha-runtime/action-ownership-engine');

const extractor = new EventExtractionEngine();
const ownershipEngine = new ActionOwnershipEngine();

async function runTests() {
    console.log('Running test 1: "Me dijo que lo revisa y me llama el viernes."');
    const e1 = extractor.extract("Me dijo que lo revisa y me llama el viernes.");
    const o1 = ownershipEngine.determineOwnership(e1);
    assert.strictEqual(o1.owner, 'prospect');
    console.log('Test 1 passed');

    console.log('Running test 2: "Quedó de mandarme documentos mañana."');
    const e2 = extractor.extract("Quedó de mandarme documentos mañana.");
    const o2 = ownershipEngine.determineOwnership(e2);
    assert.strictEqual(o2.owner, 'prospect');
    assert.strictEqual(e2[0].type, 'commitment_established');
    console.log('Test 2 passed');

    console.log('Running test 3: "Yo le voy a enviar la propuesta el lunes."');
    const e3 = extractor.extract("Yo le voy a enviar la propuesta el lunes.");
    const o3 = ownershipEngine.determineOwnership(e3);
    assert.strictEqual(o3.owner, 'advisor');
    console.log('Test 3 passed');
}

runTests().then(() => console.log('All new tests passed')).catch(err => {
    console.error('Test failed', err);
    process.exit(1);
});
