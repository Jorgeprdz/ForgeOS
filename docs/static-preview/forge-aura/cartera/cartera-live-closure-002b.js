import { createCarteraAdapter as createPreviousAdapter } from './cartera-adapter-pages-v13.js?v=cartera-live-closure-002b';
import { createCarteraReviewConfirmation002 } from './cartera-review-confirmation-002.js?v=post017e-hotfix002';

export const CARTERA_PRIMARY_ATTENTION_OWNER_002B = 'CARTERA_050_FUTURE_RADAR';
const RADAR_RPC = 'forge_cartera050_list_future_radar';
const HORIZONS = Object.freeze([
  'TODAY', 'NEXT_7_DAYS', 'NEXT_30_DAYS', 'NEXT_90_DAYS', 'CONFIRMATION_REQUIRED', 'OVERDUE',
]);

function text(value) { return String(value ?? '').trim(); }
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}
function uniqueBy(values, keyOf) {
  const output = new Map();
  for (const value of values || []) {
    const key = keyOf(value);
    if (key && !output.has(key)) output.set(key, value);
  }
  return [...output.values()];
}

export function hasQualifyingCarteraRelationship002b(item = {}) {
  if (String(item.type || '').toUpperCase() !== 'PERSON') return true;
  return number(item.relationshipPolicyCount) > 0 || number(item.relationshipAccountCount) > 0;
}

export function filterCarteraDirectoryMembership002b(directory = []) {
  return Object.freeze((directory || []).filter(hasQualifyingCarteraRelationship002b));
}

function uniquePolicyMatch(model) {
  const matches = uniqueBy(
    (model?.duplicatePolicyCandidates || []).flatMap(candidate => candidate?.existingPolicyMatches || []),
    match => text(match?.policyReference),
  );
  return matches.length === 1 ? matches[0] : null;
}

function uniquePersonMatch(model) {
  const matches = uniqueBy(
    (model?.identityCandidates || []).flatMap(candidate => candidate?.existingPersonMatches || []),
    match => text(match?.personReference),
  );
  return matches.length === 1 ? matches[0] : null;
}

function personFromPolicyPresentation(policyReference, presentation = {}) {
  if (!policyReference) return null;
  const matches = [];
  for (const [personReference, relation] of Object.entries(presentation || {})) {
    if ((relation?.policies || []).some(policy => text(policy?.reference) === policyReference)) {
      matches.push({ personReference, displayLabel: null });
    }
  }
  return matches.length === 1 ? matches[0] : null;
}

export function pendingReviewSignal002b({ review, model, relationshipPresentation = {}, asOfDate } = {}) {
  const packetReference = text(review?.packetReference || review?.reviewReference);
  if (!packetReference.startsWith('POLICY_PACKET:AURA:')) return null;
  const policyMatch = uniquePolicyMatch(model);
  const policyReference = text(policyMatch?.policyReference) || null;
  const directPerson = uniquePersonMatch(model);
  const relatedPerson = directPerson || personFromPolicyPresentation(policyReference, relationshipPresentation);
  const personReference = text(relatedPerson?.personReference) || null;
  const personDisplayName = text(relatedPerson?.displayLabel) || text(directPerson?.displayLabel)
    || (personReference ? personReference : 'Relación por confirmar');
  const confidence = Number(review?.confidence);
  const warnings = Array.isArray(review?.warnings) ? review.warnings : [];
  const evidenceSummary = [
    'Paquete documental pendiente de confirmación humana',
    Number.isFinite(confidence) ? `Confianza de extracción ${Math.round(confidence * 100)}%` : 'Confianza de extracción no disponible',
    warnings.length ? `${warnings.length} ${warnings.length === 1 ? 'advertencia' : 'advertencias'} de extracción` : 'Sin advertencias adicionales registradas',
  ];

  return freeze({
    signalReference: `CARTERA050:DOCUMENT_PACKET:${packetReference}`,
    personReference,
    personDisplayName,
    policyReference,
    signalType: 'INCOMPLETE_POLICY_DATA',
    eventDate: text(asOfDate) || new Date().toISOString().slice(0, 10),
    horizon: 'TODAY',
    truthClass: 'DETECTED_EVIDENCE',
    sourceAuthority: 'DOCUMENT_INTAKE',
    sourceRecordReference: packetReference,
    whyThisPerson: personReference
      ? `${personDisplayName} está vinculado mediante relaciones Cartera ya confirmadas; el documento sigue pendiente de revisión.`
      : 'La identidad o relación canónica de este documento todavía requiere confirmación humana.',
    whyNow: 'Existe un paquete documental pendiente de confirmación. La extracción no equivale a Policy Truth.',
    evidenceSummary,
    uncertainty: 'El documento es evidencia. Ningún dato queda confirmado por confianza de extracción, coincidencia de nombre o presentación.',
    smallestUsefulAction: 'Revisar el documento y confirmar, corregir o cancelar explícitamente.',
    advisorConfirmationRequired: true,
  });
}

function summaryFromItems(items = []) {
  const byHorizon = Object.fromEntries(HORIZONS.map(horizon => [horizon, 0]));
  for (const item of items) {
    const horizon = text(item?.horizon);
    if (Object.hasOwn(byHorizon, horizon)) byHorizon[horizon] += 1;
  }
  return freeze({ byHorizon });
}

export function composeCarteraRadarWithPendingReviews002b(radar = {}, pendingSignals = []) {
  const exact = uniqueBy((pendingSignals || []).filter(Boolean), item => text(item?.sourceRecordReference));
  const exactPolicyReferences = new Set(exact.map(item => text(item?.policyReference)).filter(Boolean));
  const baseItems = (Array.isArray(radar?.items) ? radar.items : []).filter(item => {
    const policyReference = text(item?.policyReference);
    const packetReference = text(item?.sourceRecordReference);
    return !(
      String(item?.signalType || '').toUpperCase() === 'INCOMPLETE_POLICY_DATA'
      && String(item?.sourceAuthority || '').toUpperCase() === 'DOCUMENT_INTAKE'
      && exactPolicyReferences.has(policyReference)
      && !packetReference.startsWith('POLICY_PACKET:')
    );
  });
  const items = uniqueBy([...exact, ...baseItems], item => text(item?.signalReference));
  const visibleSignalReferences = new Set(items.map(item => text(item?.signalReference)).filter(Boolean));
  const originalFocus = (Array.isArray(radar?.focusItems) ? radar.focusItems : [])
    .filter(item => visibleSignalReferences.has(text(item?.signalReference)));
  const focusItems = uniqueBy([...exact, ...originalFocus, ...items], item => text(item?.signalReference)).slice(0, 12);
  const originalSummary = radar?.summary && typeof radar.summary === 'object' ? radar.summary : {};
  return freeze({
    ...radar,
    items,
    focusItems,
    summary: { ...originalSummary, ...summaryFromItems(items) },
    sourceAvailability: {
      ...(radar?.sourceAvailability || {}),
      documentIntake: exact.length ? 'AVAILABLE' : radar?.sourceAvailability?.documentIntake,
    },
  });
}

export async function createCarteraClosureAdapter002b({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createPreviousAdapter({ client, windowRef });
  const reviewApi = createCarteraReviewConfirmation002({ client });
  let latestHome = null;
  let latestDirectory = null;

  async function ensureHome() {
    if (!latestHome) latestHome = await adapter.loadHome();
    return latestHome;
  }
  async function ensureDirectory() {
    if (!latestDirectory) latestDirectory = filterCarteraDirectoryMembership002b(await adapter.loadDirectory());
    return latestDirectory;
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      carteraMembershipBoundary002b: true,
      primaryAttentionOwner002b: CARTERA_PRIMARY_ATTENTION_OWNER_002B,
      documentPacketRadarComposition002b: true,
      autoIdentityMerge: false,
      autonomousCommercialExecution: false,
    }),
    async loadHome() {
      latestHome = await adapter.loadHome();
      return latestHome;
    },
    async loadDirectory() {
      latestDirectory = filterCarteraDirectoryMembership002b(await adapter.loadDirectory());
      return latestDirectory;
    },
    async loadPendingReviewSignals002b({ asOfDate } = {}) {
      const [home] = await Promise.all([ensureHome(), ensureDirectory()]);
      const presentation = adapter.getRelationshipPresentation?.() || {};
      const reviews = Array.isArray(home?.reviews) ? home.reviews : [];
      const signals = await Promise.all(reviews.map(async review => {
        const packetReference = text(review?.packetReference || review?.reviewReference);
        if (!packetReference.startsWith('POLICY_PACKET:AURA:')) return null;
        try {
          const model = await reviewApi.loadReview(packetReference);
          return pendingReviewSignal002b({ review, model, relationshipPresentation: presentation, asOfDate });
        } catch {
          return pendingReviewSignal002b({ review, model: null, relationshipPresentation: presentation, asOfDate });
        }
      }));
      return freeze(uniqueBy(signals.filter(Boolean), signal => text(signal?.sourceRecordReference)));
    },
  });
}

export function createCarteraRadarClient002b({ client, adapter } = {}) {
  if (!client || !adapter?.loadPendingReviewSignals002b) throw new Error('CARTERA_002B_RADAR_COMPOSITION_CONTEXT_REQUIRED');
  const augmentedRpc = async (name, args = {}) => {
    const result = await client.rpc(name, args);
    if (name !== RADAR_RPC || result?.error) return result;
    const asOfDate = text(args?.p_payload?.asOfDate);
    const pendingSignals = await adapter.loadPendingReviewSignals002b({ asOfDate });
    return { ...result, data: composeCarteraRadarWithPendingReviews002b(result?.data || {}, pendingSignals) };
  };
  return new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'rpc') return augmentedRpc;
      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

const STYLE_ID = 'forge-cartera-live-closure-002b-style';
export function installCarteraClosureStyles002b(root) {
  const doc = root?.ownerDocument || document;
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;width:100%;min-width:0}
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-header,
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>[data-aura-cartera-radar-017e],
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-home-grid,
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-feedback{width:100%!important;max-width:none!important;margin-inline:0!important;box-sizing:border-box;min-width:0}
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>[data-aura-cartera-radar-017e]{margin-block:0!important}
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-home-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:18px!important}
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"] .cartera-panel,
    .aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"] .radar002-shell{border-radius:var(--forge-radius-card,18px);box-sizing:border-box;min-width:0}
    @media(min-width:721px){.aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-fab{position:static!important;inset:auto!important;justify-self:end;margin:0!important;max-width:100%;z-index:auto!important}}
    @media(max-width:720px){.aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]{gap:14px}.aura-cartera[data-cartera-primary-attention-owner="${CARTERA_PRIMARY_ATTENTION_OWNER_002B}"]>.cartera-home-grid{gap:14px!important}}
  `;
  doc.head.append(style);
}

export function reconcileCarteraAttentionSurface002b(root) {
  if (!root) return;
  root.dataset.carteraPrimaryAttentionOwner = CARTERA_PRIMARY_ATTENTION_OWNER_002B;
  const legacy = root.querySelector('#cartera-attention-title')?.closest('.cartera-panel');
  legacy?.remove();

  root.querySelectorAll('.cartera-metric').forEach(metric => {
    const label = metric.querySelector('span');
    const context = metric.querySelector('p');
    if (text(label?.textContent) !== 'Requieren revisión') return;
    label.textContent = 'Pólizas con datos incompletos';
    const current = text(context?.textContent);
    if (current === '0 pendientes') context.textContent = '0 pólizas con datos incompletos';
    else if (context) context.textContent = current
      .replace(/póliza requiere revisión/i, 'póliza con datos canónicos incompletos')
      .replace(/pólizas requieren revisión/i, 'pólizas con datos canónicos incompletos');
  });

  const confirmationChip = root.querySelector('[data-radar-horizon="CONFIRMATION_REQUIRED"]');
  if (confirmationChip) {
    confirmationChip.textContent = text(confirmationChip.textContent).replace(/^Confirmar\s*·/i, 'Pago por confirmar ·');
    confirmationChip.setAttribute('aria-label', 'Pagos o evidencia de pago que requieren confirmación');
  }
}

export function createCarteraPresentationClosure002b({ root, windowRef = window } = {}) {
  let observer = null;
  let scheduled = false;
  const reconcile = () => {
    scheduled = false;
    reconcileCarteraAttentionSurface002b(root);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(reconcile);
  };
  return Object.freeze({
    start() {
      installCarteraClosureStyles002b(root);
      reconcile();
      const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
      if (Observer && !observer) {
        observer = new Observer(schedule);
        observer.observe(root, { childList: true, subtree: true, characterData: true });
      }
    },
    reconcile,
    stop() {
      observer?.disconnect();
      observer = null;
      scheduled = false;
    },
  });
}
