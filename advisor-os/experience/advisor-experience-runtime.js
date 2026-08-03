const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

const text = value => String(value ?? '').trim();
const array = value => Array.isArray(value) ? value : [];
const integer = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const EXPERIENCE_SURFACE_STATES = freeze([
  'LOADING',
  'READY',
  'EMPTY',
  'PARTIAL',
  'UNAVAILABLE',
  'INVALID',
  'SESSION_REQUIRED',
]);

export const ADVISOR_CAPTURE_MODES = freeze(['REAL_TIME', 'DIGEST', 'HYBRID']);
export const ADVISOR_NOTIFICATION_MODES = freeze(['REAL_TIME', 'DIGEST', 'HYBRID', 'MUTED']);

export const PUBLIC_ACCEPTANCE_KEYS = freeze([
  'MOBILE_360_OR_EQUIVALENT',
  'TABLET',
  'DESKTOP',
  'NEW_SESSION',
  'RELOAD',
  'LOGOUT_LOGIN',
  'LOGOUT_SCRUB',
  'LATE_RESULT_REJECTION',
  'SLOW_NETWORK',
  'PARTIAL_SOURCE',
  'UNAVAILABLE_SOURCE',
  'NO_HORIZONTAL_OVERFLOW',
  'FLOATING_NAV_SAFE_AREA',
  'RAW_ERROR_ONLY_REJECTED',
  'UNKNOWN_AS_ZERO_REJECTED',
]);

export class AdvisorExperienceError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'AdvisorExperienceError';
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => {
  throw new AdvisorExperienceError(code, message, details);
};

function normalizeEnum(value, allowed, code, label, { optional = false } = {}) {
  const normalized = text(value).toUpperCase();
  if (!normalized && optional) return null;
  if (!allowed.includes(normalized)) fail(code, `${label} no es compatible.`, { value });
  return normalized;
}

function normalizeTimeZone(value, { optional = false } = {}) {
  const normalized = text(value);
  if (!normalized && optional) return null;
  if (!normalized || normalized.length > 120) {
    fail('ADVISOR_TIMEZONE_INVALID', 'La zona horaria no es válida.');
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: normalized }).format(new Date());
  } catch {
    fail('ADVISOR_TIMEZONE_INVALID', 'La zona horaria no es válida.', { value });
  }
  return normalized;
}

function normalizeGoal(value, { optional = false } = {}) {
  const normalized = integer(value);
  if (normalized === null && optional) return null;
  if (normalized === null || normalized < 1 || normalized > 999) {
    fail('ADVISOR_GOAL_INVALID', 'La meta mensual debe ser un entero entre 1 y 999.');
  }
  return normalized;
}

export function normalizeAdvisorPreferences(input = {}, { allowPartial = true } = {}) {
  const displayName = text(input.displayName || input.profile?.displayName) || null;
  const timeZone = normalizeTimeZone(input.timeZone, { optional: allowPartial });
  const monthlyPolicyGoal = normalizeGoal(
    input.monthlyPolicyGoal ?? input.goal?.monthlyPolicyGoal,
    { optional: allowPartial },
  );
  const notificationMode = normalizeEnum(
    input.notificationMode,
    ADVISOR_NOTIFICATION_MODES,
    'ADVISOR_NOTIFICATION_MODE_INVALID',
    'El modo de notificaciones',
    { optional: allowPartial },
  );
  const captureMode = normalizeEnum(
    input.captureMode,
    ADVISOR_CAPTURE_MODES,
    'ADVISOR_CAPTURE_MODE_INVALID',
    'El modo de captura',
    { optional: allowPartial },
  );

  if (!allowPartial && !displayName) {
    fail('ADVISOR_DISPLAY_NAME_REQUIRED', 'El nombre visible es obligatorio.');
  }

  return freeze({
    profile: freeze({ displayName }),
    timeZone,
    goal: freeze({ monthlyPolicyGoal }),
    notificationMode,
    captureMode,
  });
}

export function evaluateAdvisorSetup(input = {}) {
  const preferences = normalizeAdvisorPreferences(input, { allowPartial: true });
  const missing = [];
  if (!preferences.profile.displayName) missing.push('PROFILE');
  if (!preferences.timeZone) missing.push('TIME_ZONE');
  if (preferences.goal.monthlyPolicyGoal === null) missing.push('GOAL');
  if (!preferences.notificationMode) missing.push('NOTIFICATION_MODE');
  if (!preferences.captureMode) missing.push('CAPTURE_MODE');

  return freeze({
    status: missing.length ? 'PARTIAL' : 'COMPLETE',
    missing: freeze(missing),
    preferences,
    nonBlocking: true,
    valueBeforeSetup: true,
    heavyOnboarding: false,
  });
}

export function normalizeExperienceSurfaceState(input = {}) {
  const status = text(input.status || input.state).toUpperCase();
  const items = array(input.items);
  const sourceStates = array(input.sourceStates || input.sources);

  if (status === 'SESSION_REQUIRED') {
    return freeze({ state: 'SESSION_REQUIRED', reason: 'AUTH_REQUIRED', items: freeze([]), rawError: null });
  }
  if (status === 'LOADING' || input.loading === true) {
    return freeze({ state: 'LOADING', reason: null, items: freeze([]), rawError: null });
  }
  if (status === 'INVALID') {
    return freeze({ state: 'INVALID', reason: text(input.reason) || 'INVALID_INPUT', items: freeze([]), rawError: null });
  }
  if (status === 'UNAVAILABLE' || status === 'SOURCE_UNAVAILABLE') {
    return freeze({ state: 'UNAVAILABLE', reason: text(input.reason || input.error?.code) || 'SOURCE_UNAVAILABLE', items: freeze([]), rawError: null });
  }

  const degraded = sourceStates.some(source => {
    const state = text(source?.state || source?.status).toUpperCase();
    return state && !['READY', 'AVAILABLE', 'EMPTY'].includes(state);
  });
  if (status === 'PARTIAL' || degraded) {
    return freeze({ state: 'PARTIAL', reason: text(input.reason) || 'PARTIAL_SOURCE', items: freeze(items), rawError: null });
  }
  if (status === 'EMPTY' || (items.length === 0 && input.explicitEmpty === true)) {
    return freeze({ state: 'EMPTY', reason: text(input.reason) || 'NO_RECORDS', items: freeze([]), rawError: null });
  }
  if (status === 'READY' || status === 'AVAILABLE' || items.length > 0) {
    return freeze({ state: 'READY', reason: null, items: freeze(items), rawError: null });
  }

  return freeze({ state: 'UNAVAILABLE', reason: 'STATE_UNRESOLVED', items: freeze([]), rawError: null });
}

export function createExperienceSurfaceContract({
  surfaceId,
  primaryActions = [],
  controls = [],
  state,
} = {}) {
  const id = text(surfaceId) || fail('SURFACE_ID_REQUIRED', 'La superficie requiere identificador.');
  const primary = array(primaryActions).filter(action => action?.enabled !== false && action?.decorative !== true);
  if (primary.length !== 1) {
    fail('SURFACE_PRIMARY_ACTION_INVALID', 'Cada superficie debe tener exactamente una acción principal utilizable.', {
      surfaceId: id,
      primaryActionCount: primary.length,
    });
  }
  const deadControls = array(controls).filter(control => {
    if (control?.decorative === true) return false;
    return control?.enabled === true && typeof control?.execute !== 'function' && !text(control?.href);
  });
  if (deadControls.length) {
    fail('DECORATIVE_DEAD_CONTROL_REJECTED', 'La superficie contiene controles visibles sin comportamiento.', {
      surfaceId: id,
      controlIds: deadControls.map(control => control.id || null),
    });
  }
  return freeze({
    surfaceId: id,
    state: normalizeExperienceSurfaceState(state || {}),
    primaryAction: primary[0],
    controls: freeze(array(controls)),
    dominantPrimaryAction: true,
    decorativeDeadControls: 0,
  });
}

export function resolveFloatingNavSafeArea({ viewport = 'MOBILE' } = {}) {
  const normalized = text(viewport).toUpperCase();
  if (normalized === 'MOBILE') {
    return freeze({
      viewport: normalized,
      css: 'calc(var(--forge-mobile-nav-height) + var(--forge-mobile-nav-clearance) + var(--forge-mobile-floating-gap) + env(safe-area-inset-bottom))',
      scrollAboveFloatingNav: true,
      navRemainsFloating: true,
    });
  }
  return freeze({
    viewport: ['TABLET', 'DESKTOP'].includes(normalized) ? normalized : 'DESKTOP',
    css: 'max(24px, env(safe-area-inset-bottom))',
    scrollAboveFloatingNav: true,
    navRemainsFloating: true,
  });
}

export function assertExplicitDemoBoundary(input = {}) {
  const isDemo = input.isDemo === true;
  if (!isDemo) {
    if (input.dataClass === 'SYNTHETIC' || input.demoDataPresent === true) {
      fail('UNLABELED_DEMO_LEAKAGE_REJECTED', 'Los datos demo no pueden aparecer como productivos.');
    }
    return freeze({ isDemo: false, productive: true, accepted: true });
  }

  const explicitLabel = input.explicitLabel === true || /DATOS FICTICIOS|MODO DEMOSTRACI[ÓO]N/i.test(text(input.label));
  const synthetic = text(input.dataClass).toUpperCase() === 'SYNTHETIC';
  const externalEffectsBlocked = input.externalEffectsBlocked === true;
  if (!explicitLabel || !synthetic || !externalEffectsBlocked) {
    fail('DEMO_BOUNDARY_INCOMPLETE', 'La experiencia demo debe estar identificada y bloquear efectos externos.', {
      explicitLabel,
      synthetic,
      externalEffectsBlocked,
    });
  }
  return freeze({
    isDemo: true,
    productive: false,
    accepted: true,
    dataClass: 'SYNTHETIC',
    externalEffectsBlocked: true,
  });
}

export function buildPublicAcceptanceMatrix(results = {}) {
  const matrix = {};
  for (const key of PUBLIC_ACCEPTANCE_KEYS) {
    matrix[key] = results[key] === true ? 'PASS' : 'FAIL';
  }
  const failed = Object.entries(matrix).filter(([, value]) => value !== 'PASS').map(([key]) => key);
  return freeze({
    status: failed.length ? 'FAIL' : 'PASS',
    matrix: freeze(matrix),
    failed: freeze(failed),
  });
}

export function createAdvisorExperienceRuntime({
  preferencesAuthority = null,
  tokenFactory = null,
} = {}) {
  let generation = 0;
  let advisorId = null;
  let counter = 0;
  const pending = new Map();

  const nextToken = () => {
    counter += 1;
    if (typeof tokenFactory === 'function') return text(tokenFactory()) || `experience-preview-${counter}`;
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `experience-preview-${counter}`;
  };

  function beginSession(nextAdvisorId) {
    const normalized = text(nextAdvisorId) || fail('ADVISOR_SESSION_REQUIRED', 'La sesión del asesor es obligatoria.');
    generation += 1;
    advisorId = normalized;
    pending.clear();
    return freeze({ advisorId, generation, state: 'ACTIVE' });
  }

  function guard(expectedAdvisorId, expectedGeneration) {
    if (!advisorId || expectedAdvisorId !== advisorId || expectedGeneration !== generation) {
      fail('ADVISOR_EXPERIENCE_LATE_RESULT_REJECTED', 'El resultado pertenece a otra sesión o generación.');
    }
  }

  function preparePreferencesUpdate({ current = {}, changes = {} } = {}) {
    if (!advisorId) fail('ADVISOR_SESSION_REQUIRED', 'La sesión del asesor es obligatoria.');
    const mergedInput = {
      ...current,
      ...changes,
      profile: { ...(current.profile || {}), ...(changes.profile || {}) },
      goal: { ...(current.goal || {}), ...(changes.goal || {}) },
    };
    const normalized = normalizeAdvisorPreferences(mergedInput, { allowPartial: false });
    const token = nextToken();
    const preview = freeze({
      status: 'PREVIEW_REQUIRED',
      confirmationToken: token,
      advisorId,
      generation,
      preferences: normalized,
      directWrite: false,
      reviewRequired: true,
    });
    pending.set(token, preview);
    return preview;
  }

  async function confirmPreferencesUpdate({
    preview,
    confirmedByAdvisor = false,
    confirmationReference = null,
  } = {}) {
    if (!confirmedByAdvisor) {
      fail('ADVISOR_PREFERENCES_CONFIRMATION_REQUIRED', 'Se requiere confirmación explícita.');
    }
    const token = text(preview?.confirmationToken);
    const stored = pending.get(token);
    if (!stored || stored !== preview) fail('ADVISOR_PREFERENCES_PREVIEW_INVALID', 'El preview ya no es válido.');
    guard(preview.advisorId, preview.generation);
    if (!text(confirmationReference)) {
      fail('ADVISOR_PREFERENCES_CONFIRMATION_REFERENCE_REQUIRED', 'La confirmación requiere referencia.');
    }
    if (!preferencesAuthority?.savePreferences) {
      fail('ADVISOR_PREFERENCES_AUTHORITY_REQUIRED', 'La autoridad productiva de preferencias no está conectada.');
    }
    pending.delete(token);
    const receipt = await preferencesAuthority.savePreferences({
      advisorId,
      preferences: preview.preferences,
      confirmationReference: text(confirmationReference),
    });
    guard(preview.advisorId, preview.generation);
    if (!text(receipt?.mutationId)) {
      fail('ADVISOR_PREFERENCES_RECEIPT_REQUIRED', 'La autoridad no devolvió un recibo verificable.');
    }
    return freeze({
      status: 'PREFERENCES_SAVED',
      advisorId,
      preferences: preview.preferences,
      receipt: freeze({ ...receipt }),
    });
  }

  async function runSurfaceLoad({ surfaceId, loader, signal = null } = {}) {
    if (!advisorId) fail('ADVISOR_SESSION_REQUIRED', 'La sesión del asesor es obligatoria.');
    if (typeof loader !== 'function') fail('SURFACE_LOADER_REQUIRED', 'La superficie requiere un loader.');
    const selectedAdvisorId = advisorId;
    const selectedGeneration = generation;
    const result = await loader({ advisorId: selectedAdvisorId, signal });
    if (signal?.aborted) fail('ADVISOR_EXPERIENCE_LATE_RESULT_REJECTED', 'La carga fue cancelada.');
    guard(selectedAdvisorId, selectedGeneration);
    return freeze({
      surfaceId: text(surfaceId) || 'UNKNOWN_SURFACE',
      advisorId: selectedAdvisorId,
      generation: selectedGeneration,
      state: normalizeExperienceSurfaceState(result || {}),
    });
  }

  function scrub(reason = 'logout') {
    generation += 1;
    advisorId = null;
    pending.clear();
    return freeze({ state: 'SCRUBBED', reason, generation });
  }

  function diagnostics() {
    return freeze({
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
  }

  return freeze({
    beginSession,
    preparePreferencesUpdate,
    confirmPreferencesUpdate,
    runSurfaceLoad,
    scrub,
    diagnostics,
  });
}
