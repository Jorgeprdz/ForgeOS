#!/usr/bin/env node

const fs = require('fs');
const { execFileSync } = require('child_process');
const harness = require('./repo-doc-migration-harness.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function gitStatus() {
  return execFileSync('git', ['status', '--short'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function fakeSets({ tracked = [], untracked = [] } = {}) {
  return {
    tracked: new Set(tracked),
    untracked: new Set(untracked),
  };
}

function testProtectedAssetsNeverMove() {
  for (const asset of harness.PROTECTED_ROOT_ASSETS) {
    const record = harness.classifyPlanRecord(asset, fakeSets({ tracked: [asset] }));
    assert(record.action !== 'MOVE', `${asset} was classified MOVE`);
    assert(record.action === 'SKIP_PROTECTED', `${asset} was not classified SKIP_PROTECTED`);
  }
}

function testRuntimeFilesNeverMove() {
  const runtimeFiles = [
    'runtime-fixture.js',
    'runtime-fixture.ts',
    'runtime-fixture.json',
    'runtime-fixture.html',
  ];

  for (const file of runtimeFiles) {
    const record = harness.classifyPlanRecord(file, fakeSets({ tracked: [file] }));
    assert(record.action !== 'MOVE', `${file} was classified MOVE`);
    assert(record.action === 'REVIEW_REQUIRED', `${file} was not classified REVIEW_REQUIRED`);
  }
}

function testUntrackedDocsBlocked() {
  const file = 'UNTRACKED_DOC_FIXTURE.md';
  const record = harness.classifyPlanRecord(file, fakeSets({ untracked: [file] }));
  assert(record.action === 'BLOCKED_UNTRACKED', `${file} was not BLOCKED_UNTRACKED`);
}

function testDestinationCollisionsDoNotMove() {
  const inventory = harness.makeInventory();
  const collision = inventory.destinationCandidates.find((record) => (
    record.destination &&
    fs.existsSync(record.source) &&
    fs.existsSync(record.destination)
  ));

  if (collision) {
    assert(
      collision.action === 'SKIP_DEST_EXISTS' || collision.action === 'REVIEW_REQUIRED',
      `${collision.source} collision was classified ${collision.action}`,
    );
    return;
  }

  const review = harness.classifyPlanRecord('docs/already-nested.md', fakeSets({ tracked: ['docs/already-nested.md'] }));
  assert(review.action === 'REVIEW_REQUIRED', 'Nested doc fallback was not REVIEW_REQUIRED');
}

function testDryRunClassifiersDoNotModifyFiles() {
  const before = gitStatus();
  harness.classifyPlanRecord('AGENTS.md', fakeSets({ tracked: ['AGENTS.md'] }));
  harness.classifyMarkdownLink('docs/example.md', '../missing.md');
  harness.validateInventoryObject({
    generatedAt: new Date().toISOString(),
    files: [],
    protectedAssets: Array.from(harness.PROTECTED_ROOT_ASSETS),
    rootDocs: [],
    trackedFiles: [],
    untrackedFiles: [],
    candidates: [],
  });
  const after = gitStatus();
  assert(before === after, 'Dry-run classifiers changed git status');
}

function run() {
  const tests = [
    testProtectedAssetsNeverMove,
    testRuntimeFilesNeverMove,
    testUntrackedDocsBlocked,
    testDestinationCollisionsDoNotMove,
    testDryRunClassifiersDoNotModifyFiles,
  ];

  for (const test of tests) {
    test();
    console.log(`PASS ${test.name}`);
  }
}

run();
