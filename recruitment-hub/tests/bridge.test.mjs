import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { buildBundle } from '../bridge/build.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const names = ['buildCandidateManagerSnapshot','calculateManagerRecruitmentMetrics','captureManagerRecruitmentEvent','evaluateInterviewFlow','evaluateRecruitmentPipeline','normalizeInterviewStage','normalizeRecruitmentPipelineState'];

test('safe ESM bundle is self-contained, deterministic and excludes provenance export', async () => {
  const first = buildBundle(); const second = buildBundle();
  assert.equal(first.code, second.code);
  assert.deepEqual(first.manifest, second.manifest);
  assert.equal(first.manifest.bundleSha256, createHash('sha256').update(first.code).digest('hex'));
  const m = await import('data:text/javascript;base64,' + Buffer.from(first.code).toString('base64'));
  assert.deepEqual(Object.keys(m).sort(), names);
  assert.equal(m.evaluateCandidateEvidenceProvenance, undefined);
  assert.equal(m.normalizeInterviewStage('initial_interview'), 'INITIAL_INTERVIEW');
  assert.equal(m.normalizeRecruitmentPipelineState('unknown'), 'UNKNOWN');
  const req = createRequire(import.meta.url);
  const engines = [
    ['manager-os/recruitment/interview-flow/interview-flow-engine.js','evaluateInterviewFlow'],
    ['manager-os/recruitment/pipeline/recruitment-pipeline-engine.js','evaluateRecruitmentPipeline'],
    ['manager-os/recruitment/events/manager-recruitment-event-capture-contract.js','captureManagerRecruitmentEvent'],
    ['manager-os/recruitment/snapshots/candidate-manager-snapshot-engine.js','buildCandidateManagerSnapshot'],
    ['manager-os/metrics/manager-recruitment-metrics-engine.js','calculateManagerRecruitmentMetrics']
  ];
  for (const [path, fn] of engines) assert.deepEqual(m[fn]({}), req(join(root,path))[fn]({}));
  const entry = await import('../bridge/forge-recruitment.entry.mjs');
  assert.deepEqual(Object.keys(entry).sort(), names);
  assert.deepEqual(entry.evaluateRecruitmentPipeline({}), m.evaluateRecruitmentPipeline({}));
});
test('generation is independent of cwd and rejects even one mutated original source byte', () => {
  const expected = buildBundle().code; const cwd = process.cwd();
  try { process.chdir(tmpdir()); assert.equal(buildBundle().code, expected); } finally { process.chdir(cwd); }
  const temp = mkdtempSync(join(tmpdir(), 'rh-build-'));
  try {
    const manifestPath = 'recruitment-hub/bridge/source-manifest.json';
    mkdirSync(dirname(join(temp,manifestPath)), { recursive: true }); copyFileSync(join(root,manifestPath),join(temp,manifestPath));
    const manifest = JSON.parse(readFileSync(join(root,manifestPath)));
    for (const s of manifest.sources) { mkdirSync(dirname(join(temp,s.path)),{ recursive: true }); copyFileSync(join(root,s.path),join(temp,s.path)); }
    assert.equal(buildBundle({ root: temp }).code, expected);
    writeFileSync(join(temp,manifest.sources[0].path), '// changed source\n');
    assert.throws(() => buildBundle({ root: temp }), /SOURCE_INTEGRITY/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
