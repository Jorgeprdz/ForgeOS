import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('supabase/functions/cartera-pdf-intake/index.ts', 'utf8');

assert.match(source, /NO_FIELDS_REVIEW_REQUIRED/, 'zero-field extraction must degrade to review, not abort');
assert.match(source, /PDF_EXTRACTION_NO_FIELDS/, 'zero-field extraction must carry an explicit warning');
assert.match(source, /emptyReviewCandidate\(\)/, 'zero-field extraction must produce a staging-only review candidate');
assert.match(source, /recoveryUsed = true/, 'zero-field extraction must attempt one recovery pass');
assert.match(source, /requiresHumanReview:\s*true/, 'all PDF extraction output must remain human-review gated');
assert.match(source, /automaticPolicyCreation:\s*false/, 'PDF extraction must never create Policy Truth automatically');
assert.match(source, /row\.person \|\| row\.insured \|\| row\.contractor \|\| row\.policyNumber \|\| row\.product/, 'candidate sanitization must retain partial policy evidence beyond the original three fields');

console.log('CARTERA_PDF_EMPTY_EXTRACTION_REVIEW_CONTRACT_OK');