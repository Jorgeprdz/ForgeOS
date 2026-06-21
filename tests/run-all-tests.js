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
  ['node', ['tests/evidence-source-test.js']],
  ['node', ['tests/evidence-processing-status-test.js']],
  ['node', ['tests/evidence-inbox-item-test.js']],
  ['node', ['tests/evidence-extraction-candidate-test.js']],
  ['node', ['tests/evidence-confirmation-task-test.js']],
  ['node', ['tests/evidence-inbox-scope-gate-test.js']],
  ['node', ['tests/evidence-inbox-router-contract-test.js']],
  ['node', ['tests/career-month-resolver-test.js']],
  ['node', ['tests/advisor-compensation-stage-test.js']],
  ['node', ['tests/cuaderno-point-period-test.js']],
  ['node', ['tests/bonus-rule-pack-contract-test.js']],
  ['node', ['tests/bonus-eligibility-result-test.js']],
  ['node', ['tests/bonus-calculation-result-test.js']],
  ['node', ['tests/bonus-carrier-calculated-state-test.js']],
  ['node', ['tests/bonus-payout-truth-state-test.js']],
  ['node', ['tests/advisor-economic-output-test.js']],
  ['node', ['tests/advisor-economic-output-period-test.js']],
  ['node', ['tests/qualified-advisor-economic-status-test.js']],
  ['node', ['tests/team-economic-output-test.js']],
  ['node', ['tests/partner-compensation-input-gate-test.js']],
  ['node', ['tests/partner-rule-pack-readiness-test.js']],
  ['node', ['tests/partner-productivity-base-contract-test.js']],
  ['node', ['tests/partner-productivity-multiplier-contract-test.js']],
  ['node', ['tests/partner-production-bonus-contract-test.js']],
  ['node', ['tests/partner-activity-bonus-contract-test.js']],
  ['node', ['tests/partner-fixed-support-contract-test.js']],
  ['node', ['tests/partner-partial-bonus-contracts-test.js']],
  ['node', ['tests/partner-safe-calculation-result-test.js']],
  ['node', ['tests/partner-productivity-base-calculator-test.js']],
  ['node', ['tests/partner-productivity-multiplier-calculator-test.js']],
  ['node', ['tests/partner-production-bonus-calculator-test.js']],
  ['node', ['tests/partner-activity-bonus-calculator-test.js']],
  ['node', ['tests/partner-fixed-support-calculator-test.js']],
  ['node', ['tests/partner-partial-bonus-calculation-gate-test.js']],
  ['node', ['tests/partner-official-evidence-test.js']],
  ['node', ['tests/partner-compensation-statement-match-test.js']],
  ['node', ['tests/partner-payout-truth-result-test.js']],
  ['node', ['tests/partner-calculation-to-payout-mapper-test.js']],
  ['node', ['tests/partner-payout-truth-gate-test.js']],
  ['node', ['tests/advisor-lifecycle-status-test.js']],
  ['node', ['tests/advisor-lifecycle-evidence-test.js']],
  ['node', ['tests/advisor-career-clock-test.js']],
  ['node', ['tests/precontract-economic-status-test.js']],
  ['node', ['tests/precontract-revenue-classifier-test.js']],
  ['node', ['tests/advisor-stage-gate-test.js']],
  ['node', ['tests/lifecycle-to-revenue-mapper-test.js']],
  ['node', ['tests/lifecycle-to-compensation-gate-test.js']],
  ['node', ['tests/carrier-revenue-adapter-contract-test.js']],
  ['node', ['tests/not-modeled-carrier-adapter-test.js']],
  ['node', ['tests/carrier-rule-router-test.js']],
  ['node', ['tests/smnyl-revenue-adapter-test.js']],
  ['node', ['tests/revenue-value-test.js']],
  ['node', ['tests/revenue-scope-gate-test.js']],
  ['node', ['tests/revenue-snapshot-test.js']],
  ['node', ['tests/revenue-view-model-engine-test.js']],
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
