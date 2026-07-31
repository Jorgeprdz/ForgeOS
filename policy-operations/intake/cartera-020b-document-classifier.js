import {
  INTAKE_CLASSIFICATION_STATES,
  INTAKE_DOCUMENT_TYPES,
  createClassificationCandidate,
} from './cartera-020b-intake-contracts.js';

const SIGNALS = Object.freeze({
  [INTAKE_DOCUMENT_TYPES.POLICY]: Object.freeze([
    ['POLIZA', 0.45], ['PÓLIZA', 0.45], ['CONTRATANTE', 0.2], ['ASEGURADO', 0.15], ['SUMA ASEGURADA', 0.2],
  ]),
  [INTAKE_DOCUMENT_TYPES.RECEIPT]: Object.freeze([
    ['RECIBO', 0.55], ['PAGO', 0.15], ['FECHA LIMITE', 0.15], ['IMPORTE', 0.15],
  ]),
  [INTAKE_DOCUMENT_TYPES.ENDORSEMENT]: Object.freeze([
    ['ENDOSO', 0.6], ['MODIFICACION', 0.15], ['MODIFICACIÓN', 0.15], ['VIGENCIA DEL ENDOSO', 0.2],
  ]),
});

function scoreType(text, documentType) {
  const matches = [];
  let score = 0;
  for (const [signal, weight] of SIGNALS[documentType]) {
    if (text.includes(signal)) { matches.push(signal); score += weight; }
  }
  return { documentType, score: Math.min(score, 1), matchedEvidence: matches };
}

export function classifyPolicyDocument({ text = '' } = {}) {
  const normalized = String(text).normalize('NFKC').toUpperCase();
  const ranked = Object.keys(SIGNALS)
    .map((type) => scoreType(normalized, type))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.documentType.localeCompare(b.documentType));

  if (ranked.length === 0) {
    return createClassificationCandidate({
      documentType: INTAKE_DOCUMENT_TYPES.UNKNOWN,
      confidence: null,
      state: INTAKE_CLASSIFICATION_STATES.UNKNOWN,
      warnings: ['no_supported_document_signals'],
      requiresReview: true,
    });
  }

  const best = ranked[0];
  const competitors = ranked.slice(1).filter((entry) => best.score - entry.score < 0.2);
  const ambiguous = competitors.length > 0;
  return createClassificationCandidate({
    documentType: best.documentType,
    confidence: best.score,
    matchedEvidence: best.matchedEvidence,
    competingCandidates: competitors,
    state: ambiguous ? INTAKE_CLASSIFICATION_STATES.AMBIGUOUS : INTAKE_CLASSIFICATION_STATES.MATCHED,
    warnings: ambiguous ? ['multiple_document_types_have_material_evidence'] : [],
    requiresReview: ambiguous || best.score < 0.85,
  });
}
