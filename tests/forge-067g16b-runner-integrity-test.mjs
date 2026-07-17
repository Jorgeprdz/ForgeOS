import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const evidence = mkdtempSync(join(tmpdir(), 'forge-067g16b-runner-'));
const result = spawnSync('bash', ['tools/forge-067g16b-evidence-runner.sh', '--self-test'], {
  cwd:process.cwd(), env:{...process.env, FORGE_067G16B_EVIDENCE_DIR:evidence}, encoding:'utf8',
});
assert.equal(result.status, 0, result.stderr);
const ledger = readFileSync(join(evidence, 'ledger.jsonl'), 'utf8');
assert.match(ledger, /"self_exit_0".*"PASS"/);
assert.match(ledger, /"self_exit_1".*"FAIL"/);
assert.match(ledger, /"self_assertion_error".*"FAIL"/);
assert.match(ledger, /"self_missing_browser".*"BLOCKED"/);
console.log('067G16B EVIDENCE RUNNER INTEGRITY: PASS');
