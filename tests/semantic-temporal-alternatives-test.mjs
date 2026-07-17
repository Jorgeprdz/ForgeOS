import assert from 'node:assert/strict';
import {
  buildSemanticExtractFrame,
  extractTemporalReference,
  getNormalizedAction,
  getNormalizedDue,
} from '../src/intelligence/hdl/semantic-frame-builder.js';

const cases = [
  ['agosto o septiembre', 'agosto o septiembre'],
  ['fin de mes o el que sigue', 'fin de mes o el que sigue'],
  ['entre agosto y septiembre', 'entre agosto y septiembre'],
  ['agosto', 'agosto'],
  ['septiembre', 'septiembre'],
  ['fin de mes', 'fin de mes'],
  ['el mes que sigue', 'el mes que sigue'],
  ['de agosto a septiembre', 'de agosto a septiembre'],
  ['agosto y septiembre', 'agosto y septiembre'],
  ['agosto o septiembre de 2027', 'agosto o septiembre de 2027'],
];

for (const [input, expected] of cases) {
  assert.equal(extractTemporalReference(input), expected, input);
  assert.equal(getNormalizedDue(input), expected, input);
}

assert.equal(extractTemporalReference('mes o'), null);
assert.equal(extractTemporalReference(''), null);
assert.equal(getNormalizedDue(''), null);

const alternative = buildSemanticExtractFrame('Pidio cotizacion para agosto o septiembre');
assert.equal(alternative.interpretations[0].temporal_reference, 'agosto o septiembre');

const relativeAlternative = buildSemanticExtractFrame('Llamar fin de mes o el que sigue');
assert.equal(relativeAlternative.interpretations[0].temporal_reference, 'fin de mes o el que sigue');

const range = buildSemanticExtractFrame('Reunion entre agosto y septiembre');
assert.equal(range.interpretations[0].temporal_reference, 'entre agosto y septiembre');
assert.equal(getNormalizedAction('Reunion entre agosto y septiembre'), 'reunión');

console.log(`T4_FOCUSED_TESTS=PASS CASES=${cases.length + 5}`);
