import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("supabase/functions/nash-draft-provider/index.ts", "utf8");

assert.match(source, /serve\(async \(req\) =>/);
assert.match(source, /req\.method === "OPTIONS"/);
assert.match(source, /req\.method !== "POST"/);
assert.match(source, /method_not_allowed[\s\S]*405/);

assert.match(source, /RESULT_STATES[\s\S]*SUCCESS[\s\S]*NO_DRAFT[\s\S]*ERROR/);
assert.match(source, /resultState/);
assert.match(source, /draftCandidate: null/);
assert.match(source, /metadata: metadata/);
assert.match(source, /error/);
assert.match(source, /providerId/);
assert.match(source, /modelId/);
assert.match(source, /generationMode/);
assert.match(source, /generatedAt/);
assert.match(source, /durationMs/);

assert.match(source, /prospectMessageContext/);
assert.match(source, /PROSPECT_MESSAGE_CONTEXT_INVALID/);
assert.match(source, /UNKNOWN_PROVIDER_ERROR/);
assert.match(source, /PROVIDER_NOT_ENABLED/);
assert.match(source, /local_deterministic_flow_required/);
assert.match(source, /external_provider_not_enabled/);

assert.match(source, /DETERMINISTIC: "deterministic"/);
assert.match(source, /GEMINI: "gemini"/);
assert.match(source, /OPENAI: "openai"/);
assert.match(source, /externalProviderEnabled: false/);
assert.match(source, /deterministicFallbackRequired: true/);

assert.doesNotMatch(source, /Deno\.env|get\(".*KEY|GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY/);
assert.doesNotMatch(source, /GoogleGenerativeAI|new OpenAI|fetch\(/);
assert.doesNotMatch(source, /prompt|SYSTEM_PROMPT|Deno\.env|get\(["'][A-Z_]*KEY|secret/i);
assert.doesNotMatch(source, /semantic-extract-v0\.8|semantic_extractor|buildSemanticExtractFrame/);

console.log("067G17N14 NASH DRAFT PROVIDER EDGE FUNCTION SHELL: PASS");
