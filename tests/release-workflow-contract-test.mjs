import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluatePublicEnv } from '../scripts/validate-pages-public-config.mjs';
import { EXPECTED_FUNCTION_VERSION, validateSemanticSmoke } from '../scripts/validate-semantic-extract-smoke.mjs';

const validEnv = "window.__ENV__ = Object.freeze({SUPABASE_URL:'https://rmlxigxysujsuwzgoimv.supabase.co',SUPABASE_KEY:'public-test-key',DEMO_MODE:'false',ENABLE_TEST_ADVISOR_LOGIN:'false'});";
const evaluated = evaluatePublicEnv(validEnv, 'valid-env.js');
assert.equal(evaluated.sandbox.window, evaluated.sandbox);
assert.equal(evaluated.sandbox.globalThis, evaluated.sandbox);
assert.equal(evaluated.sandbox.self, evaluated.sandbox);
assert.equal(evaluated.publicEnv.DEMO_MODE, 'false');
assert.equal(evaluated.publicEnv.ENABLE_TEST_ADVISOR_LOGIN, 'false');
assert.throws(() => evaluatePublicEnv('const nothing = true;'), /PUBLIC_ENV_OBJECT_REQUIRED/);
assert.throws(
  () => evaluatePublicEnv('window.__ENV__ = {'),
  (error) => error?.name === 'SyntaxError' && /Unexpected end/.test(error.message),
  'Invalid JavaScript must fail inside the VM context'
);
assert.throws(() => evaluatePublicEnv("window.__ENV__={SUPABASE_URL:'x',DEMO_MODE:'false'}"), /PUBLIC_ENV_KEYS_MISMATCH/);
assert.throws(() => evaluatePublicEnv("window.__ENV__={SUPABASE_URL:'x',SUPABASE_KEY:'y',DEMO_MODE:'false',SERVICE_ROLE:'z'}"), /PUBLIC_ENV_KEYS_MISMATCH/);

const validSemantic = JSON.stringify({
  function_version: EXPECTED_FUNCTION_VERSION,
  summary: { candidate_count: 1 },
  candidates: [{ type: 'commitment_established', owner: 'advisor' }]
});
assert.equal(validateSemanticSmoke(validSemantic).function_version, EXPECTED_FUNCTION_VERSION);
for (const version of ['semantic-extract-v0.6', 'semantic-extract-v0.7', 'semantic-extract-v0.8', 'semantic-extract-v0.9']) {
  assert.throws(() => validateSemanticSmoke(validSemantic.replace(EXPECTED_FUNCTION_VERSION, version)), /SEMANTIC_FUNCTION_VERSION_MISMATCH/);
}
assert.throws(() => validateSemanticSmoke(validSemantic.replace(`"function_version":"${EXPECTED_FUNCTION_VERSION}",`, '')), /SEMANTIC_FUNCTION_VERSION_MISMATCH/);
assert.throws(() => validateSemanticSmoke(''), /SEMANTIC_RESPONSE_EMPTY/);

const pagesWorkflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
const semanticWorkflow = fs.readFileSync('.github/workflows/deploy-supabase.yml', 'utf8');
assert.match(pagesWorkflow, /node scripts\/validate-pages-public-config\.mjs _site\/env\.js/);
assert.match(semanticWorkflow, /node scripts\/validate-semantic-extract-smoke\.mjs response\.json/);
assert.doesNotMatch(semanticWorkflow, /semantic-extract-v0\.6/);

console.log('RELEASE_WORKFLOW_CONTRACT_TEST=PASS');
