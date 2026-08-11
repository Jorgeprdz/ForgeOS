const CONTRACT_ID = 'FORGE_HUMAN_CONTEXT_PRESENTATION_013';

const STATE_LABELS = Object.freeze({
  CONFIRMED: 'Confirmado',
  SUPPORTED: 'Respaldado por la información disponible',
  VERIFIED: 'Verificado',
  OBSERVED: 'Observado',
  READY: 'Disponible',
  CURRENT: 'Actual',
  CLEAR: 'Sin conflicto conocido',
  REVIEW_REQUIRED: 'Por revisar',
  CONFIRMATION_REQUIRED: 'Necesita confirmación',
  INFORMATION_REQUIRED: 'Falta información',
  INSUFFICIENT_EVIDENCE: 'Evidencia insuficiente',
  PARTIAL: 'Información parcial',
  DEGRADED: 'Información parcial',
  UNAVAILABLE: 'No disponible',
  UNKNOWN: 'Aún no sabemos',
  EMPTY: 'Sin elementos adicionales',
});

function text(value) {
  return String(value ?? '').trim();
}

export function humanStateLabel(value, fallback = 'Estado no informado') {
  const key = text(value).toUpperCase();
  return STATE_LABELS[key] || fallback;
}

export function humanConfidenceLabel(value) {
  if (value && typeof value === 'object') value = value.value ?? value.level ?? null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 0.9) return 'Alta';
    if (value >= 0.7) return 'Media';
    return 'Baja';
  }
  const key = text(value).toUpperCase();
  if (['HIGH', 'ALTA'].includes(key)) return 'Alta';
  if (['MEDIUM', 'MEDIA'].includes(key)) return 'Media';
  if (['LOW', 'BAJA'].includes(key)) return 'Baja';
  return value === null || value === undefined || text(value) === '' ? 'No informada' : text(value);
}

export function humanEvidenceLabel(count) {
  const number = Number(count);
  if (!Number.isFinite(number) || number < 0) return 'Evidencia no cuantificada';
  return `${number} ${number === 1 ? 'evidencia' : 'evidencias'}`;
}

export function humanContextCopy({
  summary = null,
  whyNow = null,
  uncertainty = null,
  smallestUsefulAction = null,
} = {}) {
  return Object.freeze({
    summary: text(summary || whyNow) || null,
    uncertainty: text(uncertainty) || null,
    smallestUsefulAction: text(smallestUsefulAction) || null,
  });
}

export function presentationDiagnostics() {
  return Object.freeze({
    contractId: CONTRACT_ID,
    role: 'PRESENTATION_ONLY',
    createsTruth: false,
    createsScore: false,
    calculatesPriority: false,
    createsRecommendation: false,
    callsAi: false,
    callsNash: false,
    persists: false,
    mutatesIdentity: false,
    mutatesPolicy: false,
  });
}

export { CONTRACT_ID, STATE_LABELS };
