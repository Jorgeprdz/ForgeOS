import test from 'node:test';
import assert from 'node:assert/strict';

import { createContextualNotificationRuntime, normalizeNotificationSignal } from '../advisor-os/notifications/contextual-notification-runtime.js';
import { readFile } from 'node:fs/promises';

const bridge = await readFile(new URL('../platform/commands/contextual-clippy-runtime.js', import.meta.url), 'utf8');
const commandRuntime = await readFile(new URL('../platform/commands/command-runtime.js', import.meta.url), 'utf8');

test('signals are normalized without business payload persistence', () => {
  const result = normalizeNotificationSignal({ type: 'overdue', subjectReference: 'prospect-1', title: 'Seguimiento vencido', body: 'Revísalo hoy', draft: 'vencidos' });
  assert.equal(result.ok, true);
  assert.equal(result.signal.type, 'OVERDUE');
  assert.equal(result.signal.containsBusinessData, false);
  assert.equal(Object.hasOwn(result.signal, 'personName'), false);
});

test('runtime prioritizes, deduplicates and observes cooldown', () => {
  let now = 100000;
  const runtime = createContextualNotificationRuntime({ clock: () => now, cooldownMs: 1000 });
  const signals = [
    { type: 'DUE_TODAY', subjectReference: 'p1', title: 'Hoy' },
    { type: 'OVERDUE', subjectReference: 'p2', title: 'Vencido' },
  ];
  assert.equal(runtime.evaluate(signals).notification.type, 'OVERDUE');
  assert.equal(runtime.evaluate(signals).notification.type, 'DUE_TODAY');
  assert.equal(runtime.evaluate(signals).status, 'NONE');
  now += 1001;
  assert.equal(runtime.evaluate(signals).notification.type, 'OVERDUE');
});

test('mute and scrub prevent stale cross-session guidance', () => {
  const runtime = createContextualNotificationRuntime({ clock: () => 1 });
  runtime.setMuted(true);
  assert.equal(runtime.evaluate([{ type: 'OVERDUE', subjectReference: 'p1' }]).status, 'MUTED');
  runtime.scrub();
  assert.equal(runtime.evaluate([{ type: 'OVERDUE', subjectReference: 'p1' }]).status, 'READY');
});

test('Clippy only opens reviewable drafts and never confirms or writes', () => {
  assert.match(bridge, /fillDraft\(notification\.draft\)/);
  assert.doesNotMatch(bridge, /confirmWritePreview|confirmarComandoEscritura|\.from\(/);
  assert.match(commandRuntime, /mountContextualClippy\(\)/);
  assert.match(commandRuntime, /unmountContextualClippy\(\)/);
});

test('diagnostics preserve advisory-only boundaries', () => {
  const diagnostics = createContextualNotificationRuntime().diagnostics();
  assert.equal(diagnostics.autonomousAction, false);
  assert.equal(diagnostics.directWrite, false);
  assert.equal(diagnostics.storedBusinessData, false);
});
