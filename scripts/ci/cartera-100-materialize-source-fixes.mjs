import { readFileSync, writeFileSync } from 'node:fs';

function replaceExactly(path, before, after, code) {
  const source = readFileSync(path, 'utf8');
  if (source.includes(after)) return false;
  if (!source.includes(before)) throw new Error(code);
  writeFileSync(path, source.replace(before, after));
  return true;
}

const changed = [];

if (replaceExactly(
  'platform/productivity/cartera-100a-productivity-proof-contract.js',
  'export function createCartera100ProductivityProof(raw = {}) {\n  assertSafe(raw);',
  "export function createCartera100ProductivityProof(raw = {}) {\n  const { boundaries: suppliedBoundaries, ...safeRaw } = raw || {};\n  assertSafe(safeRaw);",
  'CARTERA100_PROOF_SAFE_PARSE_ANCHOR_MISSING'
)) changed.push('platform/productivity/cartera-100a-productivity-proof-contract.js');

if (replaceExactly(
  'platform/productivity/cartera-100a-productivity-proof-contract.js',
  '      ...raw.boundaries,',
  '      ...suppliedBoundaries,',
  'CARTERA100_PROOF_BOUNDARY_MERGE_ANCHOR_MISSING'
)) changed.push('platform/productivity/cartera-100a-productivity-proof-contract.js');

if (replaceExactly(
  'advisor-os/cartera/cartera-100c-productivity-proof-service.js',
  '      assertSafe(result.data);\n      return createCartera100ProductivityProof(result.data);',
  "      const { boundaries: responseBoundaries, ...safeResponse } = result.data;\n      assertSafe(safeResponse);\n      return createCartera100ProductivityProof({ ...safeResponse, boundaries: responseBoundaries });",
  'CARTERA100_SERVICE_SAFE_RESPONSE_ANCHOR_MISSING'
)) changed.push('advisor-os/cartera/cartera-100c-productivity-proof-service.js');

if (replaceExactly(
  'platform/productivity/cartera-100b-outcome-learning-boundary.js',
  '        clientIntentInferred: false,\n      },',
  '        clientIntentInferred: false,\n        causalOutcomeClaimed: false,\n      },',
  'CARTERA100_SECOND_POLICY_CAUSAL_BOUNDARY_ANCHOR_MISSING'
)) changed.push('platform/productivity/cartera-100b-outcome-learning-boundary.js');

if (replaceExactly(
  'scripts/ci/cartera-100abcd-remote-acceptance.sql',
  'grant select on cartera100_ids to authenticated;\ngrant select, insert, update on cartera100_results to authenticated;',
  'grant select on cartera100_ids to authenticated;\ngrant select, insert, update on cartera100_results to authenticated;\ngrant execute on function public.forge_cartera030b_digest(jsonb) to authenticated;',
  'CARTERA100_ACCEPTANCE_DIGEST_GRANT_ANCHOR_MISSING'
)) changed.push('scripts/ci/cartera-100abcd-remote-acceptance.sql');

console.log(`CARTERA_100_SOURCE_FIX_MATERIALIZATION=${changed.length ? 'UPDATED' : 'ALREADY_CURRENT'}`);
console.log(`CARTERA_100_SOURCE_FIX_FILES=${[...new Set(changed)].join(',') || 'NONE'}`);
