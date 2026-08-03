import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [
  runtime,
  controller,
  registry,
  preview,
  entities,
  authority,
  experience,
  app,
] = await Promise.all([
  read('platform/commands/command-runtime.js'),
  read('platform/commands/command-controller.js'),
  read('platform/commands/command-registry.js'),
  read('platform/commands/write-preview-engine.js'),
  read('platform/commands/entity-context-runtime.js'),
  read('platform/commands/person-follow-up-authority.js'),
  read('platform/commands/advisor-experience-runtime.js'),
  read('app.js'),
]);

test('authenticated lifecycle mounts and scrubs the single Command OS runtime', () => {
  assert.match(app, /mountCommandRuntime\(\)/);
  assert.match(app, /unmountCommandRuntime\(\)/);
  assert.match(runtime, /command-os-runtime-root/);
  assert.match(runtime, /destroyCommandController\(\)/);
  assert.match(runtime, /clearWritePreviews|scrubCommandRuntime/);
});

test('navigation entity and write paths remain distinct and governed', () => {
  assert.match(registry, /intent: 'NAVIGATION'/);
  assert.match(registry, /intent: 'WRITE'/);
  assert.match(controller, /resolveEntities/);
  assert.match(controller, /confirmarComandoEscritura/);
  assert.match(preview, /WRITE_CONFIRMATION_TOKEN_INVALID/);
  assert.match(preview, /WRITE_PREVIEW_ALREADY_RESOLVED/);
  assert.match(entities, /AMBIGUOUS|candidates/);
});

test('productive follow-up delegates to NFAST-09 and never writes tables directly', () => {
  assert.match(authority, /createPipelineDueActionRuntime/);
  assert.match(authority, /person-follow-up-authority/);
  assert.match(authority, /SCHEDULE/);
  assert.doesNotMatch(authority, /\.from\([^)]*\)\.(insert|update|upsert|delete)/);
});

test('Benvenu Clippy and voice preserve value-before-work boundaries', () => {
  assert.match(experience, /No viniste a llenar otro CRM/);
  assert.match(experience, /successfulUses >= 2/);
  assert.match(experience, /SpeechRecognition|webkitSpeechRecognition/);
  assert.doesNotMatch(experience, /confirmarComandoEscritura|confirmWritePreview/);
});

test('Pack 09 acceptance rejects autonomous or ambiguous mutation', () => {
  const combined = [controller, preview, entities, authority, experience].join('\n');
  assert.doesNotMatch(combined, /AUTO_CONFIRM|AUTO_EXECUTE|AUTO_SELECT/);
  assert.match(preview, /requiresExplicitConfirmation: true/);
  assert.match(authority, /MULTIPLE_ACTIVE|AMBIGUOUS|multiple/i);
});
