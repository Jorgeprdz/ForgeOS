import { spawnSync } from 'node:child_process';

const commands = [
  ['node', ['tests/module-integrity-test.js']],
  ['node', ['tests/smoke-test.js']],
  ['node', ['tests/presentation-pipeline-test.js']],
  ['node', ['tests/critical-path-test.js']],
  ['node', ['tests/business-rules-test.js']],
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
