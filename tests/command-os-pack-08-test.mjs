import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const experience = await readFile(new URL('../platform/commands/advisor-experience-runtime.js', import.meta.url), 'utf8');
const runtime = await readFile(new URL('../platform/commands/command-runtime.js', import.meta.url), 'utf8');
const controller = await readFile(new URL('../platform/commands/command-controller.js', import.meta.url), 'utf8');
const ui = await readFile(new URL('../platform/commands/command-palette-ui.js', import.meta.url), 'utf8');

test('Benvenu introduces one useful draft without collecting business data', () => {
  assert.match(experience, /No viniste a llenar otro CRM/);
  assert.match(experience, /fillDraft\('pipeline'\)/);
  assert.doesNotMatch(experience, /productivityScore|salesGoal|incomeForecast/);
});

test('Clippy withdraws after demonstrated mastery or explicit dismissal', () => {
  assert.match(experience, /successfulUses >= 2/);
  assert.match(experience, /clippyDismissed/);
  assert.match(controller, /command-os:successful-use/);
});

test('voice only populates a reviewable draft', () => {
  assert.match(experience, /SpeechRecognition|webkitSpeechRecognition/);
  assert.match(experience, /input\.value/);
  assert.match(experience, /Borrador de voz/);
  assert.doesNotMatch(experience, /confirmarComandoEscritura|confirmWritePreview/);
  assert.match(ui, /tú confirmas cualquier escritura/);
});

test('advisor experience follows authenticated Command OS lifecycle', () => {
  assert.match(runtime, /mountAdvisorExperience\(root\)/);
  assert.match(runtime, /unmountAdvisorExperience\(\)/);
  assert.match(runtime, /mountPersonFollowUpAuthority\(\)/);
});
