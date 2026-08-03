import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ADVISOR_CAPTURE_MODES,
  ADVISOR_NOTIFICATION_MODES,
  AdvisorExperienceError,
  PUBLIC_ACCEPTANCE_KEYS,
  assertExplicitDemoBoundary,
  buildPublicAcceptanceMatrix,
  createAdvisorExperienceRuntime,
  createExperienceSurfaceContract,
  evaluateAdvisorSetup,
  normalizeExperienceSurfaceState,
  resolveFloatingNavSafeArea,
} from '../advisor-os/experience/advisor-experience-runtime.js';

const completePreferences = Object.freeze({
  profile: { displayName: 'Jorge Palacios' },
  timeZone: 'America/Mexico_City',
  goal: { monthlyPolicyGoal: 10 },
  notificationMode: 'HYBRID',
  captureMode: 'REAL_TIME',
});

test('setup is progressive, complete and never blocks first value', () => {
  const partial = evaluateAdvisorSetup({
    profile: { displayName: 'Jorge Palacios' },
    timeZone: 'America/Mexico_City',
  });
  assert.equal(partial.status, 'PARTIAL');
  assert.equal(partial.nonBlocking, true);
  assert.equal(partial.valueBeforeSetup, true);
  assert.equal(partial.heavyOnboarding, false);
  assert.deepEqual(partial.missing, ['GOAL', 'NOTIFICATION_MODE', 'CAPTURE_MODE']);

  const complete = evaluateAdvisorSetup(completePreferences);
  assert.equal(complete.status, 'COMPLETE');
  assert.deepEqual(complete.missing, []);
  assert.equal(ADVISOR_CAPTURE_MODES.includes('HYBRID'), true);
  assert.equal(ADVISOR_NOTIFICATION_MODES.includes('MUTED'), true);
});

test('invalid timezone, goal and capture modes fail closed', () => {
  assert.throws(
    () => evaluateAdvisorSetup({ ...completePreferences, timeZone: 'Mars/Olympus' }),
    error => error instanceof AdvisorExperienceError && error.code === 'ADVISOR_TIMEZONE_INVALID',
  );
  assert.throws(
    () => evaluateAdvisorSetup({ ...completePreferences, goal: { monthlyPolicyGoal: 0 } }),
    error => error.code === 'ADVISOR_GOAL_INVALID',
  );
  assert.throws(
    () => evaluateAdvisorSetup({ ...completePreferences, captureMode: 'MAGIC' }),
    error => error.code === 'ADVISOR_CAPTURE_MODE_INVALID',
  );
});

test('preference changes require preview, confirmation and authority receipt', async () => {
  let writes = 0;
  const runtime = createAdvisorExperienceRuntime({
    tokenFactory: () => 'PREVIEW-1',
    preferencesAuthority: {
      savePreferences: async input => {
        writes += 1;
        return { mutationId: `PREF-${writes}`, advisorId: input.advisorId };
      },
    },
  });
  runtime.beginSession('ADVISOR-1');
  const preview = runtime.preparePreferencesUpdate({ current: completePreferences, changes: { captureMode: 'DIGEST' } });

  assert.equal(preview.status, 'PREVIEW_REQUIRED');
  assert.equal(preview.directWrite, false);
  assert.equal(preview.preferences.captureMode, 'DIGEST');
  assert.equal(writes, 0);

  await assert.rejects(
    () => runtime.confirmPreferencesUpdate({ preview, confirmedByAdvisor: false }),
    error => error.code === 'ADVISOR_PREFERENCES_CONFIRMATION_REQUIRED',
  );
  assert.equal(writes, 0);

  const result = await runtime.confirmPreferencesUpdate({
    preview,
    confirmedByAdvisor: true,
    confirmationReference: 'CONFIRM-1',
  });
  assert.equal(result.status, 'PREFERENCES_SAVED');
  assert.equal(result.receipt.mutationId, 'PREF-1');
  assert.equal(writes, 1);

  await assert.rejects(
    () => runtime.confirmPreferencesUpdate({
      preview,
      confirmedByAdvisor: true,
      confirmationReference: 'CONFIRM-2',
    }),
    error => error.code === 'ADVISOR_PREFERENCES_PREVIEW_INVALID',
  );
});

test('preference confirmation fails closed without productive authority', async () => {
  const runtime = createAdvisorExperienceRuntime({ tokenFactory: () => 'PREVIEW-2' });
  runtime.beginSession('ADVISOR-1');
  const preview = runtime.preparePreferencesUpdate({ current: completePreferences });
  await assert.rejects(
    () => runtime.confirmPreferencesUpdate({
      preview,
      confirmedByAdvisor: true,
      confirmationReference: 'CONFIRM-1',
    }),
    error => error.code === 'ADVISOR_PREFERENCES_AUTHORITY_REQUIRED',
  );
});

test('surface states remain useful and never expose raw errors', () => {
  assert.equal(normalizeExperienceSurfaceState({ loading: true }).state, 'LOADING');
  assert.equal(normalizeExperienceSurfaceState({ status: 'READY', items: [{ id: 1 }] }).state, 'READY');
  assert.equal(normalizeExperienceSurfaceState({ status: 'EMPTY', explicitEmpty: true }).state, 'EMPTY');
  assert.equal(normalizeExperienceSurfaceState({ status: 'PARTIAL', items: [{ id: 1 }] }).state, 'PARTIAL');
  const unavailable = normalizeExperienceSurfaceState({ status: 'UNAVAILABLE', error: new Error('secret stack') });
  assert.equal(unavailable.state, 'UNAVAILABLE');
  assert.equal(unavailable.rawError, null);
});

test('one dominant primary action is required and dead controls are rejected', () => {
  const contract = createExperienceSurfaceContract({
    surfaceId: 'PIPELINE',
    state: { status: 'READY', items: [{ id: 'P-1' }] },
    primaryActions: [{ id: 'NEXT_ACTION', enabled: true }],
    controls: [
      { id: 'NEXT_ACTION', enabled: true, execute() {} },
      { id: 'HELP_BADGE', enabled: true, decorative: true },
    ],
  });
  assert.equal(contract.dominantPrimaryAction, true);
  assert.equal(contract.primaryAction.id, 'NEXT_ACTION');

  assert.throws(
    () => createExperienceSurfaceContract({
      surfaceId: 'BAD',
      state: { status: 'READY', items: [{ id: 1 }] },
      primaryActions: [{ id: 'ONE' }, { id: 'TWO' }],
    }),
    error => error.code === 'SURFACE_PRIMARY_ACTION_INVALID',
  );

  assert.throws(
    () => createExperienceSurfaceContract({
      surfaceId: 'DEAD',
      state: { status: 'READY', items: [{ id: 1 }] },
      primaryActions: [{ id: 'ONE' }],
      controls: [{ id: 'VISIBLE_BUT_DEAD', enabled: true }],
    }),
    error => error.code === 'DECORATIVE_DEAD_CONTROL_REJECTED',
  );
});

test('floating nav remains floating while content reserves safe bottom space', () => {
  const mobile = resolveFloatingNavSafeArea({ viewport: 'MOBILE' });
  assert.equal(mobile.navRemainsFloating, true);
  assert.equal(mobile.scrollAboveFloatingNav, true);
  assert.match(mobile.css, /forge-mobile-nav-height/);
  assert.match(mobile.css, /safe-area-inset-bottom/);

  const tablet = resolveFloatingNavSafeArea({ viewport: 'TABLET' });
  assert.equal(tablet.navRemainsFloating, true);
  assert.match(tablet.css, /safe-area-inset-bottom/);
});

test('demo access is accepted only when explicit, synthetic and side-effect safe', () => {
  const explicit = assertExplicitDemoBoundary({
    isDemo: true,
    label: 'Modo demostración · Datos ficticios · Solo lectura',
    dataClass: 'SYNTHETIC',
    externalEffectsBlocked: true,
  });
  assert.equal(explicit.accepted, true);
  assert.equal(explicit.productive, false);

  assert.throws(
    () => assertExplicitDemoBoundary({ isDemo: false, demoDataPresent: true }),
    error => error.code === 'UNLABELED_DEMO_LEAKAGE_REJECTED',
  );
  assert.throws(
    () => assertExplicitDemoBoundary({
      isDemo: true,
      label: 'Datos productivos',
      dataClass: 'SYNTHETIC',
      externalEffectsBlocked: false,
    }),
    error => error.code === 'DEMO_BOUNDARY_INCOMPLETE',
  );
});

test('logout and advisor switch reject late results and scrub previews', async () => {
  let resolveLoader;
  const runtime = createAdvisorExperienceRuntime({
    preferencesAuthority: { savePreferences: async () => ({ mutationId: 'PREF-1' }) },
  });
  runtime.beginSession('ADVISOR-1');
  const pendingLoad = runtime.runSurfaceLoad({
    surfaceId: 'HOME',
    loader: () => new Promise(resolve => { resolveLoader = resolve; }),
  });
  const preview = runtime.preparePreferencesUpdate({ current: completePreferences });
  runtime.scrub('logout');
  resolveLoader({ status: 'READY', items: [{ id: 1 }] });

  await assert.rejects(
    () => pendingLoad,
    error => error.code === 'ADVISOR_EXPERIENCE_LATE_RESULT_REJECTED',
  );
  await assert.rejects(
    () => runtime.confirmPreferencesUpdate({
      preview,
      confirmedByAdvisor: true,
      confirmationReference: 'CONFIRM-1',
    }),
    error => error.code === 'ADVISOR_PREFERENCES_PREVIEW_INVALID',
  );
});

test('public acceptance matrix requires every locked environment and degradation case', () => {
  const allPass = Object.fromEntries(PUBLIC_ACCEPTANCE_KEYS.map(key => [key, true]));
  const matrix = buildPublicAcceptanceMatrix(allPass);
  assert.equal(matrix.status, 'PASS');
  assert.equal(Object.keys(matrix.matrix).length, PUBLIC_ACCEPTANCE_KEYS.length);

  const failed = buildPublicAcceptanceMatrix({ ...allPass, SLOW_NETWORK: false });
  assert.equal(failed.status, 'FAIL');
  assert.deepEqual(failed.failed, ['SLOW_NETWORK']);
});

test('real Material 3 shell preserves auth, safe area and explicit demo boundaries', async () => {
  const [css, app, demo] = await Promise.all([
    readFile(new URL('../docs/static-preview/forge-alive-material3/app.css', import.meta.url), 'utf8'),
    readFile(new URL('../docs/static-preview/forge-alive-material3/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../docs/static-preview/forge-alive-material3/login-integrated-demo.js', import.meta.url), 'utf8'),
  ]);

  assert.match(css, /--forge-mobile-nav-height/);
  assert.match(css, /--forge-mobile-nav-clearance/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);

  assert.match(app, /authenticated-route-guard\.js/);
  assert.match(app, /rep-17-session-transition-guard\.js/);
  assert.match(app, /login-integrated-demo\.js/);

  assert.match(demo, /Datos ficticios/);
  assert.match(demo, /data-forge-demo-banner/);
  assert.match(demo, /blockExternalSideEffect/);
  assert.match(demo, /calendar\.google\.com/);
});

test('diagnostics preserve the Sprint 11 constitutional boundaries', () => {
  const diagnostics = createAdvisorExperienceRuntime().diagnostics();
  assert.deepEqual(diagnostics, {
    secondProfileStore: false,
    directDatabaseWrite: false,
    directRpc: false,
    preferencesRequirePreview: true,
    preferencesRequireConfirmation: true,
    heavyOnboarding: false,
    setupBlocksFirstValue: false,
    automaticDefaultsInvented: false,
    unknownAsZero: false,
    floatingNavPreserved: true,
    demoMustBeExplicit: true,
  });
});
