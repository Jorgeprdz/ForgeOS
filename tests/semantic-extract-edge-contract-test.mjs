import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildSemanticExtractFrame,
  getNormalizedAction,
  getNormalizedDue,
} from '../src/intelligence/hdl/semantic-frame-builder.js';

const source = readFileSync('supabase/functions/semantic-extract/index.ts', 'utf8');

assert.match(source, /serve\(async \(req\) =>/);
assert.match(source, /req\.method === "OPTIONS"/);
assert.match(source, /req\.method !== "POST"/);
assert.match(source, /method_not_allowed[\s\S]*405/);
assert.match(source, /typeof body\.note === "string"/);
assert.match(source, /emptyResponse\("missing_note"\)/);
assert.match(source, /"Content-Type": "application\/json"/);
assert.match(source, /Access-Control-Allow-Methods": "POST, OPTIONS"/);
assert.match(source, /semantic_extraction_unavailable/);
assert.match(source, /Deno\.env\.get\("GEMINI_API_KEY"\)/);
assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|service[_-]?role|from\(["']/i);
assert.doesNotMatch(source, /console\.(?:log|error)|Deno\.Command|\beval\s*\(/);

const fixtures = [
  'Pidio 9 cotizaciones para julio',
  'Pidio 6 cotizaciones para el martes',
  'Llamar el próximo año',
  'Seguimiento dentro de 2 meses',
  'Llamar en 2 o 3 semanas',
  'Pidio 2 o 3 cotizaciones',
  'Holi',
  'Lo va a pensar',
  'Llamar en agosto o septiembre',
  'Llamar a fin de mes o el que sigue',
  'Llamar entre agosto y septiembre',
];

assert.equal(fixtures.length, 11);
for (const note of fixtures) {
  const frame = buildSemanticExtractFrame(note);
  assert.equal(frame.frame_type, 'hdl_semantic_frame');
  assert.equal(frame.interpretations.length, 1);
  assert.equal(frame.interpretations[0].action, getNormalizedAction(note));
  assert.equal(frame.interpretations[0].temporal_reference, getNormalizedDue(note));
}

assert.equal(buildSemanticExtractFrame('Holi').interpretations[0].claimable, false);
assert.equal(buildSemanticExtractFrame('Lo va a pensar').interpretations[0].claimable, false);
assert.equal(getNormalizedDue('Llamar en 2 o 3 semanas'), '2 o 3 semanas');

console.log('SEMANTIC_EXTRACT_EDGE_CONTRACT_TEST=PASS CASES=11');
