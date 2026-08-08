import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const workflowDir = '.github/workflows';
const pagesPath = join(workflowDir, 'pages.yml');
const auraDispatchPath = join(workflowDir, 'aura-pages-dispatch.yml');
const publicAcceptancePath = join(workflowDir, 'pages-public-acceptance.yml');
const observerPath = join(workflowDir, 'pages-deploy-observer.yml');

function read(path) {
  return readFileSync(path, 'utf8');
}

function triggerBlock(source) {
  const start = source.indexOf('\non:\n');
  assert.notEqual(start, -1, 'workflow must declare top-level on block');
  const permissions = source.indexOf('\npermissions:', start);
  const concurrency = source.indexOf('\nconcurrency:', start);
  const jobs = source.indexOf('\njobs:', start);
  const candidates = [permissions, concurrency, jobs].filter(index => index > start);
  assert.ok(candidates.length > 0, 'workflow trigger block must have a bounded end');
  return source.slice(start, Math.min(...candidates));
}

function productionEligible({ event, ref, authorization, expectedSha, githubSha, remoteMainSha }) {
  return event === 'workflow_dispatch'
    && ref === 'refs/heads/main'
    && authorization === 'DEPLOY_FORGE_PAGES'
    && expectedSha === githubSha
    && expectedSha === remoteMainSha;
}

const pages = read(pagesPath);
const pagesTriggers = triggerBlock(pages);

const workflowFiles = readdirSync(workflowDir)
  .filter(name => /\.ya?ml$/.test(name))
  .map(name => ({ name, path: join(workflowDir, name), source: read(join(workflowDir, name)) }));

test('production Pages workflow is dispatch-only with required explicit inputs', () => {
  assert.match(pagesTriggers, /\n\s{2}workflow_dispatch:/);
  assert.doesNotMatch(pagesTriggers, /\n\s{2}push:/);
  assert.match(pagesTriggers, /expected_sha:[\s\S]*required:\s*true/);
  assert.match(pagesTriggers, /authorization:[\s\S]*required:\s*true/);
});

test('authorization runs before deployment permissions and production environment', () => {
  const authorizeIndex = pages.indexOf('\n  authorize:\n');
  const deployIndex = pages.indexOf('\n  deploy:\n');
  const pagesWriteIndex = pages.indexOf('pages: write');
  const environmentIndex = pages.indexOf('name: github-pages');
  const configurePagesIndex = pages.indexOf('actions/configure-pages@');
  const uploadIndex = pages.indexOf('actions/upload-pages-artifact@');
  const deployPagesIndex = pages.indexOf('actions/deploy-pages@');

  assert.ok(authorizeIndex > -1);
  assert.ok(deployIndex > authorizeIndex);
  assert.ok(pages.includes('needs: authorize'));
  assert.ok(pagesWriteIndex > deployIndex);
  assert.ok(environmentIndex > deployIndex);
  assert.ok(configurePagesIndex > deployIndex);
  assert.ok(uploadIndex > configurePagesIndex);
  assert.ok(deployPagesIndex > uploadIndex);

  const topPermissions = pages.slice(pages.indexOf('\npermissions:'), pages.indexOf('\nconcurrency:'));
  assert.doesNotMatch(topPermissions, /pages:\s*write/);
  assert.doesNotMatch(topPermissions, /id-token:\s*write/);
});

test('main ref, explicit authorization and exact SHA fail-closed guards are present', () => {
  assert.match(pages, /GITHUB_REF[^\n]*refs\/heads\/main|refs\/heads\/main[^\n]*GITHUB_REF/);
  assert.match(pages, /DEPLOY_FORGE_PAGES/);
  assert.match(pages, /GITHUB_SHA/);
  assert.match(pages, /EXPECTED_SHA/);
  assert.match(pages, /git ls-remote origin refs\/heads\/main/);
  assert.match(pages, /PAGES_MAIN_REF_GUARD=FAIL/);
  assert.match(pages, /PAGES_EXPLICIT_AUTHORIZATION=FAIL/);
  assert.match(pages, /PAGES_EXPECTED_SHA_MATCH=FAIL/);
  assert.match(pages, /PAGES_REMOTE_MAIN_SHA_MATCH=FAIL/);
});

test('only one production deploy-pages implementation exists and it has no automatic trigger', () => {
  const deployers = workflowFiles.filter(workflow => workflow.source.includes('actions/deploy-pages@'));
  assert.deepEqual(deployers.map(workflow => workflow.name), ['pages.yml']);

  for (const workflow of workflowFiles) {
    if (!/pages:\s*write/.test(workflow.source)) continue;
    assert.doesNotMatch(
      triggerBlock(workflow.source),
      /\n\s{2}push:/,
      `${workflow.name} exposes pages:write through an automatic push trigger`,
    );
  }
});

test('legacy Aura branch cannot auto-dispatch the production Pages workflow', () => {
  const aura = read(auraDispatchPath);
  assert.doesNotMatch(aura, /actions:\s*write/);
  assert.doesNotMatch(aura, /createWorkflowDispatch/);
  assert.doesNotMatch(aura, /workflow_id:\s*['"]pages\.yml['"]/);
  assert.match(aura, /AURA_PAGES_PRODUCTION_AUTO_DISPATCH=DISABLED/);
});

test('public acceptance and observer no longer assume every main push deploys', () => {
  const acceptance = read(publicAcceptancePath);
  const observer = read(observerPath);
  assert.doesNotMatch(triggerBlock(acceptance), /\n\s{2}push:/);
  assert.doesNotMatch(triggerBlock(observer), /\n\s{2}push:/);
  assert.match(triggerBlock(acceptance), /workflow_dispatch:/);
  assert.match(triggerBlock(observer), /workflow_dispatch:/);
  assert.match(acceptance, /EXPECTED_SHA:\s*\$\{\{ inputs\.expected_sha \}\}/);
  assert.match(observer, /--event workflow_dispatch/);
});

test('negative and positive production eligibility cases are deterministic', () => {
  const sha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const valid = {
    event: 'workflow_dispatch',
    ref: 'refs/heads/main',
    authorization: 'DEPLOY_FORGE_PAGES',
    expectedSha: sha,
    githubSha: sha,
    remoteMainSha: sha,
  };

  assert.equal(productionEligible({ ...valid, event: 'push' }), false, 'main push must not deploy');
  assert.equal(productionEligible({ ...valid, ref: 'refs/heads/feature/foo' }), false, 'feature dispatch denied');
  assert.equal(productionEligible({ ...valid, authorization: 'INVALID' }), false, 'wrong authorization denied');
  assert.equal(productionEligible({ ...valid, expectedSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }), false, 'SHA mismatch denied');
  assert.equal(productionEligible(valid), true, 'exact authorized main SHA is eligible');
});
