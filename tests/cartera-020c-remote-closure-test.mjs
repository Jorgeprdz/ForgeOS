import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const closure = readFileSync(
  new URL('../docs/evidence/FORGE_CARTERA_020C_REMOTE_ACCEPTANCE_CLOSURE_001.md', import.meta.url),
  'utf8',
);
const remoteWorkflow = readFileSync(
  new URL('../.github/workflows/cartera-020c-remote-acceptance.yml', import.meta.url),
  'utf8',
);
const gate = readFileSync(
  new URL('../.github/workflows/cartera-020c-remote-gate.yml', import.meta.url),
  'utf8',
);

test('020C closure pins successful remote evidence and complete status', () => {
  assert.match(closure, /WORKFLOW_RUN=30675286681/);
  assert.match(closure, /WORKFLOW_JOB=91301111909/);
  assert.match(closure, /ARTIFACT_ID=8810199540/);
  assert.match(closure, /ARTIFACT_SHA256=b396f1b95338a4f280c63eb4cd10ff799481b57aceb3194d2947e979c4d8e1f4/);
  assert.match(closure, /REPOSITORY_TESTS=91/);
  assert.match(closure, /CARTERA_020C_COMPLETE=YES/);
});

test('020C closure records immutable additive migration history through 00241', () => {
  for (let version = 230; version <= 241; version += 1) {
    assert.match(closure, new RegExp(`20260731000${version}`));
  }
  assert.match(closure, /All deployed history remains immutable/);
});

test('canonical remote workflow remains manual-only and executes all hardening verifiers', () => {
  assert.match(remoteWorkflow, /^  workflow_dispatch:/m);
  assert.doesNotMatch(remoteWorkflow, /^  (push|pull_request):/m);
  assert.match(remoteWorkflow, /cartera-020c-conflict-ambiguity-hardening-deploy\.mjs/);
  assert.match(remoteWorkflow, /cartera-020c-conflict-constraint-name-hardening-deploy\.mjs/);
  assert.match(remoteWorkflow, /cartera-020c-conflict-persistence-hardening-deploy\.mjs/);
  assert.match(remoteWorkflow, /ACCOUNT_MUTATION=NOT_AUTHORIZED/);
});

test('static gate emits closure rather than pending markers', () => {
  assert.match(gate, /CARTERA_020C_REMOTE_ACCEPTANCE=PASS/);
  assert.match(gate, /CARTERA_020C_COMPLETE=YES/);
  assert.doesNotMatch(gate, /CARTERA_020C_REMOTE_ACCEPTANCE=PENDING/);
  assert.doesNotMatch(gate, /CARTERA_020C_COMPLETE=NO/);
});
