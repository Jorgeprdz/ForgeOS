#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const harness = require('./repo-doc-migration-harness.js');

const ROOT = process.cwd();
const TEST_OUTPUT_DIR = 'docs/architecture/repository/reports/test-output';

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

function runNode(args, allowFailure = false) {
  try {
    return {
      status: 0,
      stdout: execFileSync(process.execPath, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    };
  } catch (error) {
    if (!allowFailure) throw error;
    return {
      status: error.status || 1,
      stdout: error.stdout ? String(error.stdout) : '',
      stderr: error.stderr ? String(error.stderr) : '',
    };
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
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

function testOutputDirWritesReportsOutsideRoot() {
  runNode([
    'scripts/repo-doc-migration-harness.js',
    'links',
    '--output-dir',
    TEST_OUTPUT_DIR,
  ]);
  assert(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'broken-link-report.md')), 'Missing output-dir markdown report');
  assert(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'broken-link-report.json')), 'Missing output-dir JSON report');
  assert(!fs.existsSync(path.join(ROOT, 'BUILD_003_SHOULD_NOT_EXIST.md')), 'Unexpected root fixture output');
}

function testJsonReportsParse() {
  runNode([
    'scripts/repo-doc-migration-harness.js',
    'duplicates',
    '--output-dir',
    TEST_OUTPUT_DIR,
  ]);
  const report = readJson(path.join(TEST_OUTPUT_DIR, 'duplicate-destination-report.json'));
  assert(report.generatedAt, 'JSON report missing generatedAt');
  assert(Array.isArray(report.records), 'JSON report records is not an array');
}

function testCheckCommandExitBehavior() {
  runNode([
    'scripts/repo-doc-migration-harness.js',
    'inventory',
    '--output-dir',
    TEST_OUTPUT_DIR,
  ]);
  const result = runNode([
    'scripts/repo-doc-migration-harness.js',
    'check',
    '--output-dir',
    TEST_OUTPUT_DIR,
  ], true);
  const reportPath = path.join(TEST_OUTPUT_DIR, 'repo-migration-check-report.json');
  assert(fs.existsSync(reportPath), 'Check JSON report was not generated');
  const report = readJson(reportPath);
  assert(result.status === report.exitCode, `Check exit ${result.status} did not match report exit ${report.exitCode}`);
}

function testStrictLinksChangesBrokenLinkBehavior() {
  const normal = harness.check({ outputDir: TEST_OUTPUT_DIR });
  const strict = harness.check({ outputDir: TEST_OUTPUT_DIR, strictLinks: true });
  const normalLinkGate = normal.hardGates.find((gate) => gate.gate === 'broken_markdown_links');
  const strictLinkGate = strict.hardGates.find((gate) => gate.gate === 'broken_markdown_links');
  assert(normalLinkGate.status === 'WARN' || normalLinkGate.status === 'PASS', 'Normal link gate was not WARN/PASS');
  if (normalLinkGate.count > 0) {
    assert(strictLinkGate.status === 'FAIL', 'Strict link gate did not fail with broken links');
  }
}

function testRewritePlanDoesNotModifyFiles() {
  const protectedBefore = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
  const runtimeBefore = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const result = harness.rewritePlan({ outputDir: TEST_OUTPUT_DIR });
  assert(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'reference-rewrite-plan.md')), 'Rewrite markdown report missing');
  assert(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'reference-rewrite-plan.json')), 'Rewrite JSON report missing');
  assert(Array.isArray(result.records), 'Rewrite plan did not return records');
  assert(fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8') === protectedBefore, 'Rewrite-plan modified AGENTS.md');
  assert(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8') === runtimeBefore, 'Rewrite-plan modified app.js');
}

function run() {
  const tests = [
    testProtectedAssetsNeverMove,
    testRuntimeFilesNeverMove,
    testUntrackedDocsBlocked,
    testDestinationCollisionsDoNotMove,
    testDryRunClassifiersDoNotModifyFiles,
    testOutputDirWritesReportsOutsideRoot,
    testJsonReportsParse,
    testCheckCommandExitBehavior,
    testStrictLinksChangesBrokenLinkBehavior,
    testRewritePlanDoesNotModifyFiles,
  ];

  for (const test of tests) {
    test();
    console.log(`PASS ${test.name}`);
  }
}

run();
