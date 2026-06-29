import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const schema = JSON.parse(readFileSync('schemas/advisor.schema.json', 'utf8'));
const statusEnum = schema.properties.status.enum;

const removedEnumValue = ['SENIOR', 'ADVISOR'].join('_');
const requiredStatuses = [
  'CANDIDATE',
  'PRECONTRACT',
  'ACTIVE',
  'MANAGER',
  'DIRECTOR',
  'INACTIVE',
];

assert.equal(statusEnum.includes(removedEnumValue), false);
requiredStatuses.forEach((status) => {
  assert.equal(statusEnum.includes(status), true, `${status} must remain a valid advisor status`);
});

const allowedFiles = new Set([
  'FORGE_MASTER_BUILD_TREE.md',
  'docs/evidence/CAREER_CHAIN_TERMINOLOGY_CLEANUP_CLOSURE_CERTIFICATE.md',
]);

const currentTestFile = 'tests/career-chain-terminology-guard-test.js';
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

if (!files.includes(currentTestFile)) files.push(currentTestFile);

const forbiddenPatterns = [
  new RegExp(`${'sen' + 'ior'}[\\s_-]+${'advis'}(?:or|er)`, 'i'),
  new RegExp(`${'asesor'}[\\s_-]+${'sen' + 'ior'}`, 'i'),
  new RegExp(`${'sen' + 'ior'}[\\s_-]+${'asesor'}`, 'i'),
  new RegExp(['SENIOR', 'ADVISOR'].join('_')),
];

const violations = [];

files.forEach((file) => {
  if (allowedFiles.has(file)) return;
  const content = readFileSync(file, 'utf8');
  forbiddenPatterns.forEach((pattern) => {
    if (pattern.test(content)) violations.push(file);
  });
});

assert.deepEqual([...new Set(violations)].sort(), []);

console.log('PASS career-chain-terminology-guard-test');
