import {
  CARTERA_PRIMARY_ATTENTION_OWNER_002B,
  createCarteraClosureAdapter002b,
} from './cartera-live-closure-002b.js?v=post017e-hotfix002c-base';

export const CARTERA_PRIMARY_ATTENTION_OWNER_002C = CARTERA_PRIMARY_ATTENTION_OWNER_002B;
export const CARTERA_SAFE_PERSON_FALLBACK_002C = 'Persona por confirmar';
const RADAR_RPC = 'forge_cartera050_list_future_radar';
const HORIZONS = Object.freeze([
  'TODAY', 'NEXT_7_DAYS', 'NEXT_30_DAYS', 'NEXT_90_DAYS', 'CONFIRMATION_REQUIRED', 'OVERDUE',
]);
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

function text(value) {
  return String(value ?? '').trim();
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

export function isInternalCarteraReference002c(value) {
  const candidate = text(value);
  if (!candidate) return false;
  return /^(?:person:|policy:|account:|POLICY_PACKET:|CARTERA\d*:|review\/|CONFIRMATION_REVIEW:)/i.test(candidate)
    || UUID.test(candidate);
}

export function safePersonLabel002c(value) {
  const candidate = text(value);
  return candidate && !isInternalCarteraReference002c(candidate)
    ? candidate
    : CARTERA_SAFE_PERSON_FALLBACK_002C;
}

function directoryPersonLabels002c(directory = []) {
  const labels = new Map();
  for (const item of directory || []) {
    const kind = text(item?.type || item?.kind).toUpperCase();
    if (kind !== 'PERSON' && kind !== 'COMMERCIAL_PERSON') continue;
    const reference = text(item?.reference);
    const label = text(item?.label || item?.displayLabel);
    if (!reference || !label || isInternalCarteraReference002c(label)) continue;
    labels.set(reference, label);
  }
  return labels;
}

function packetLineage002c(item = {}) {
  const reference = text(item?.sourceRecordReference);
  return reference.startsWith('POLICY_PACKET:') ? reference : null;
}

function visibleIdentityScore002c(item = {}) {
  let score = 0;
  if (text(item?.personReference)) score += 4;
  if (text(item?.policyReference)) score += 2;
  const label = text(item?.personDisplayName);
  if (label && label !== CARTERA_SAFE_PERSON_FALLBACK_002C && !isInternalCarteraReference002c(label)) score += 8;
  return score;
}

export function dedupeExactPacketLineage002c(items = []) {
  const output = new Map();
  for (const item of items || []) {
    if (!item) continue;
    const packetReference = packetLineage002c(item);
    const signalReference = text(item?.signalReference);
    const key = packetReference ? `PACKET:${packetReference}` : `SIGNAL:${signalReference}`;
    if (!key || key === 'SIGNAL:') continue;
    const current = output.get(key);
    if (!current || visibleIdentityScore002c(item) > visibleIdentityScore002c(current)) {
      output.set(key, item);
    }
  }
  return [...output.values()];
}

function summaryFromItems002c(items = []) {
  const byHorizon = Object.fromEntries(HORIZONS.map(horizon => [horizon, 0]));
  for (const item of items || []) {
    const horizon = text(item?.horizon);
    if (Object.hasOwn(byHorizon, horizon)) byHorizon[horizon] += 1;
  }
  return freeze({ byHorizon });
}

function safePendingSignal002c(signal, personLabels) {
  if (!signal) return null;
  const personReference = text(signal.personReference) || null;
  const directoryLabel = personReference ? personLabels.get(personReference) : null;
  const upstreamLabel = text(signal.personDisplayName);
  const personDisplayName = directoryLabel || safePersonLabel002c(upstreamLabel);
  const resolved = Boolean(personReference && personDisplayName !== CARTERA_SAFE_PERSON_FALLBACK_002C);
  return freeze({
    ...signal,
    personDisplayName,
    whyThisPerson: resolved
      ? `${personDisplayName} está vinculado mediante relaciones Cartera ya confirmadas; el documento sigue pendiente de revisión.`
      : 'La identidad o relación canónica de este documento todavía requiere confirmación humana.',
    whyNow: 'Existe un documento pendiente de revisión. La extracción documental no equivale a Policy Truth.',
    smallestUsefulAction: 'Revisar el documento y confirmar, corregir o cancelar explícitamente.',
  });
}

export function composeCarteraRadarWithPendingReviews002c(radar = {}, pendingSignals = []) {
  const exactPending = dedupeExactPacketLineage002c((pendingSignals || []).filter(Boolean));
  const baseItems = Array.isArray(radar?.items) ? radar.items : [];
  const items = dedupeExactPacketLineage002c([...exactPending, ...baseItems]);
  const finalKeys = new Set(items.map(item => packetLineage002c(item)
    ? `PACKET:${packetLineage002c(item)}`
    : `SIGNAL:${text(item?.signalReference)}`));
  const originalFocus = (Array.isArray(radar?.focusItems) ? radar.focusItems : [])
    .filter(item => finalKeys.has(packetLineage002c(item)
      ? `PACKET:${packetLineage002c(item)}`
      : `SIGNAL:${text(item?.signalReference)}`));
  const focusItems = dedupeExactPacketLineage002c([...exactPending, ...originalFocus, ...items]).slice(0, 12);
  const originalSummary = radar?.summary && typeof radar.summary === 'object' ? radar.summary : {};
  return freeze({
    ...radar,
    items,
    focusItems,
    summary: { ...originalSummary, ...summaryFromItems002c(items) },
    sourceAvailability: {
      ...(radar?.sourceAvailability || {}),
      documentIntake: exactPending.length ? 'AVAILABLE' : radar?.sourceAvailability?.documentIntake,
    },
  });
}

export async function createCarteraClosureAdapter002c({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createCarteraClosureAdapter002b({ client, windowRef });
  let directoryPromise = null;

  async function directory() {
    if (!directoryPromise) directoryPromise = Promise.resolve(adapter.loadDirectory());
    return directoryPromise;
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      safeHumanPresentation002c: true,
      exactPacketLineage002c: true,
      rawInternalReferenceUserVisible: false,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    async loadDirectory() {
      return directory();
    },
    async loadPendingReviewSignals002b(args = {}) {
      const [items, currentDirectory] = await Promise.all([
        adapter.loadPendingReviewSignals002b(args),
        directory(),
      ]);
      const labels = directoryPersonLabels002c(currentDirectory);
      return freeze(dedupeExactPacketLineage002c(
        (items || []).map(item => safePendingSignal002c(item, labels)).filter(Boolean),
      ));
    },
  });
}

export function createCarteraRadarClient002c({ client, adapter } = {}) {
  if (!client || !adapter?.loadPendingReviewSignals002b) {
    throw new Error('CARTERA_002C_RADAR_COMPOSITION_CONTEXT_REQUIRED');
  }
  const augmentedRpc = async (name, args = {}) => {
    const result = await client.rpc(name, args);
    if (name !== RADAR_RPC || result?.error) return result;
    const asOfDate = text(args?.p_payload?.asOfDate);
    const pendingSignals = await adapter.loadPendingReviewSignals002b({ asOfDate });
    return {
      ...result,
      data: composeCarteraRadarWithPendingReviews002c(result?.data || {}, pendingSignals),
    };
  };
  return new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'rpc') return augmentedRpc;
      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
