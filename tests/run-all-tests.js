import { spawnSync } from 'node:child_process';

const commands = [
  ['node', ['tests/module-integrity-test.js']],
  ['node', ['tests/smoke-test.js']],
  ['node', ['tests/presentation-pipeline-test.js']],
  ['node', ['tests/critical-path-test.js']],
  ['node', ['tests/business-rules-test.js']],
  ['node', ['tests/banxico-token-security-test.js']],
  ['node', ['tests/banxico-edge-provider-test.js']],
  ['node', ['tests/supabase-rls-foundation-test.js']],
  ['node', ['tests/truth/truth-validators-phase-a-test.js']],
  ['node', ['tests/economic-event-status-test.js']],
  ['node', ['tests/policy-evidence-packet-test.js']],
  ['node', ['tests/payment-evidence-packet-test.js']],
  ['node', ['tests/commission-statement-evidence-packet-test.js']],
  ['node', ['tests/payment-event-engine-test.js']],
  ['node', ['tests/initial-renewal-classifier-test.js']],
  ['node', ['tests/policy-advisor-confirmation-gate-test.js']],
  ['node', ['tests/real-pdf-ocr-test.js']],
];

let failed = false;

console.log('\nFORGE TEST SUITE v0.5\n');

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  console.log('\n❌ FORGE TEST SUITE FAILED\n');
  process.exit(1);
}

console.log('\n✅ FORGE TEST SUITE PASSED\n');
