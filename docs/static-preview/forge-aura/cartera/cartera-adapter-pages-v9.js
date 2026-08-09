import { createCarteraAdapter as createSemanticAdapter } from './cartera-adapter-pages-v8.js?v=cartera-pdf-ingress-legacy-refresh';
import {
  enrichSemanticFields,
  fieldValue,
  normalizeCoverageCandidates,
  normalizePolicyStatus,
  normalizeSemanticCandidate,
  semanticReviewCandidate,
} from './cartera-semantic-v1.js?v=cartera-pdf-ingress-legacy-refresh';

const PDF_FUNCTION = 'cartera-pdf-intake';
const REFRESH_RPC = 'forge_cartera020b_refresh_pending_packet_semantics';
const MAX_PDF_BYTES = 8 * 1024 * 1024;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function cleanRefPart(value, fallback = 'current') {
  const text = String(value || fallback).replace(/[^A-Za-z0-9._:@/-]/g, '_');
  return text.slice(0, 120) || fallback;
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + 0x8000, bytes.length)));
  }
  return btoa(binary);
}

function refreshReferences(digest) {
  const token = String(digest || '').slice(0, 40);
  return {
    attemptReference: `EXTRACTION_ATTEMPT:AURA:SEMANTIC_REFRESH:${token}`,
    candidateReference: `POLICY_CANDIDATE:AURA:SEMANTIC_REFRESH:${token}`,
    packetReference: `POLICY_PACKET:AURA:SEMANTIC_REFRESH:${token}`,
  };
}

async function readPdf(file) {
  if (!file || file.size < 1 || file.size > MAX_PDF_BYTES || !String(file.name || '').toLowerCase().endsWith('.pdf')) {
    const error = new Error('CARTERA_PDF_INVALID');
    error.code = 'CARTERA_PDF_INVALID';
    throw error;
  }
  const buffer = await file.arrayBuffer();
  if (new TextDecoder('latin1').decode(buffer.slice(0, 5)) !== '%PDF-') {
    const error = new Error('CARTERA_PDF_MAGIC_INVALID');
    error.code = 'CARTERA_PDF_MAGIC_INVALID';
    throw error;
  }
  return buffer;
}

function normalizeLegacyFields(fields = {}) {
  const next = { ...fields };
  const statusField = next.status && typeof next.status === 'object' ? next.status : null;
  const legacyStatus = statusField?.value;
  if (String(legacyStatus || '').trim().toUpperCase() === 'NORMAL' && normalizePolicyStatus(legacyStatus) === null) {
    if (!fieldValue(next, 'policyType')) {
      next.policyType = {
        ...statusField,
        value: 'NORMAL',
        normalizedValue: 'NORMAL',
        sourceFact: statusField.sourceFact ?? legacyStatus,
        sourceSection: statusField.sourceSection || 'POLIZA',
        interpretation: 'DOCUMENT_POLICY_TYPE_RECLASSIFIED',
        confirmationStatus: statusField.confirmationStatus || 'PENDING_CONFIRMATION',
        state: 'EXTRACTED',
        createsTruth: false,
      };
    }
    next.status = {
      ...statusField,
      value: null,
      normalizedValue: null,
      sourceFact: statusField.sourceFact ?? legacyStatus,
      sourceSection: statusField.sourceSection || 'POLIZA',
      interpretation: 'NOT_POLICY_STATUS_POLICY_TYPE_NORMAL',
      confirmationStatus: statusField.confirmationStatus || 'PENDING_CONFIRMATION',
      state: 'UNKNOWN',
      createsTruth: false,
    };
  }
  return next;
}

function needsSemanticRefresh(review) {
  if (!review?.resumedExistingReview) return false;
  const candidate = normalizeSemanticCandidate(review.edgeCandidate || {});
  const legacyStatus = String(fieldValue(review.fields || {}, 'status') || '').trim().toUpperCase();
  return legacyStatus === 'NORMAL'
    || !candidate.issueDate
    || !candidate.currency
    || !candidate.paymentFrequency
    || candidate.basicPremiumTotal === null
    || candidate.plannedPremium === null
    || candidate.annualTotal === null
    || candidate.coverageExtractionState === 'INCOMPLETE_REVIEW_REQUIRED'
    || candidate.coverageExtractionState === 'COVERAGE_PRESENCE_UNKNOWN';
}

function reviewFromRefreshPacket(baseReview, packet) {
  const fields = normalizeLegacyFields(packet?.extracted_fields || packet?.extractedFields || {});
  const edgeCandidate = semanticReviewCandidate(fields, {
    confidence: Number.isFinite(Number(packet?.extraction_confidence ?? packet?.extractionConfidence))
      ? Number(packet?.extraction_confidence ?? packet?.extractionConfidence)
      : null,
  });
  const coverageCandidates = normalizeCoverageCandidates(edgeCandidate.coverageCandidates);
  const identities = packet?.identity_candidates || packet?.identityCandidates || [];
  return freeze({
    ...baseReview,
    packetReference: packet?.packet_reference || packet?.packetReference || baseReview.packetReference,
    personCandidateReference: identities?.[0]?.candidateReference || baseReview.personCandidateReference,
    fields,
    edgeCandidate: { ...edgeCandidate, coverageCandidates, premium: null },
    coverageCandidates,
    coverageSectionDetected: edgeCandidate.coverageSectionDetected,
    pdfCoverageExtraction: edgeCandidate.coverageExtractionState,
    reviewCompleteness: edgeCandidate.reviewCompleteness,
    resumedExistingReview: true,
    semanticRefreshApplied: true,
    requiresHumanReview: true,
    createsPolicyTruth: false,
  });
}

async function findRefreshPacket(client, digest) {
  const { packetReference } = refreshReferences(digest);
  const result = await client
    .from('cartera020b_policy_evidence_packets')
    .select('packet_reference,extracted_fields,extraction_confidence,identity_candidates,policy_role_candidates,existing_policy_candidates,confirmation_state')
    .eq('packet_reference', packetReference)
    .eq('confirmation_state', 'PENDING_CONFIRMATION')
    .maybeSingle();
  if (result?.error) {
    const error = new Error('CARTERA020B_SEMANTIC_REFRESH_READ_FAILED');
    error.code = 'CARTERA020B_SEMANTIC_REFRESH_READ_FAILED';
    error.cause = result.error;
    throw error;
  }
  return result?.data || null;
}

async function invokeCurrentExtraction(client, file, buffer) {
  const result = await client.functions.invoke(PDF_FUNCTION, {
    body: {
      fileName: String(file.name || 'documento.pdf'),
      mimeType: 'application/pdf',
      base64: toBase64(buffer),
    },
  });
  if (result?.error) {
    const error = new Error('CARTERA_PDF_SEMANTIC_REFRESH_EXTRACTION_FAILED');
    error.code = 'CARTERA_PDF_SEMANTIC_REFRESH_EXTRACTION_FAILED';
    error.cause = result.error;
    throw error;
  }
  const raw = Array.isArray(result?.data?.candidates) ? result.data.candidates[0] : null;
  if (!raw) {
    const error = new Error('CARTERA_PDF_SEMANTIC_REFRESH_NO_CANDIDATE');
    error.code = 'CARTERA_PDF_SEMANTIC_REFRESH_NO_CANDIDATE';
    throw error;
  }
  return {
    candidate: normalizeSemanticCandidate({ ...raw, modelVersion: result.data?.modelVersion }),
    modelVersion: cleanRefPart(result.data?.modelVersion || result.data?.functionVersion || 'current'),
  };
}

function refreshWarnings(candidate) {
  const warnings = ['LEGACY_PENDING_PACKET_SEMANTIC_REFRESH'];
  if (!candidate.coverageCandidates.length && candidate.coverageSectionDetected === true) warnings.push('COVERAGE_EXTRACTION_INCOMPLETE_REVIEW_REQUIRED');
  return warnings;
}

async function refreshLegacyPacket(client, review, file) {
  const digest = review.documentDigest;
  const refs = refreshReferences(digest);
  const existing = await findRefreshPacket(client, digest);
  if (existing) return reviewFromRefreshPacket(review, existing);

  const buffer = await readPdf(file);
  const extracted = await invokeCurrentExtraction(client, file, buffer);
  const legacyFields = normalizeLegacyFields(review.fields || {});
  const fields = enrichSemanticFields(legacyFields, extracted.candidate);
  const semanticCandidate = semanticReviewCandidate(fields, extracted.candidate);
  const warnings = refreshWarnings(semanticCandidate);
  const userResult = await client.auth.getUser();
  const user = userResult?.data?.user;
  if (userResult?.error || !user?.id) {
    const error = new Error('CARTERA_AUTH_REQUIRED');
    error.code = 'CARTERA_AUTH_REQUIRED';
    throw error;
  }

  const rpc = await client.rpc(REFRESH_RPC, {
    p_command: {
      contractType: 'FORGE_PENDING_PACKET_SEMANTIC_REFRESH_COMMAND',
      contractVersion: 'CARTERA-020B.1',
      advisorId: user.id,
      actorReference: user.id,
      basePacketReference: review.packetReference,
      refreshPacketReference: refs.packetReference,
      refreshCandidateReference: refs.candidateReference,
      refreshAttemptReference: refs.attemptReference,
      documentDigest: digest,
      parserId: 'cartera-pdf-intake',
      parserVersion: extracted.modelVersion,
      refreshedAt: new Date().toISOString(),
      extractionConfidence: Number.isFinite(Number(semanticCandidate.confidence)) ? Number(semanticCandidate.confidence) : null,
      extractedFields: fields,
      warnings,
      missingFields: semanticCandidate.reviewCompleteness?.gaps || [],
    },
  });
  if (rpc?.error || !rpc?.data?.packetReference) {
    const error = new Error('CARTERA020B_SEMANTIC_REFRESH_WRITE_FAILED');
    error.code = 'CARTERA020B_SEMANTIC_REFRESH_WRITE_FAILED';
    error.cause = rpc?.error;
    throw error;
  }

  return reviewFromRefreshPacket(review, {
    packetReference: rpc.data.packetReference,
    extractedFields: rpc.data.extractedFields || fields,
    extractionConfidence: rpc.data.extractionConfidence ?? semanticCandidate.confidence,
    identityCandidates: [],
  });
}

function pendingReviewKey(review) {
  return String(review?.packetReference || '').split(':').filter(Boolean).at(-1) || String(review?.packetReference || '');
}

function dedupePendingReviews(reviews = []) {
  const byDocument = new Map();
  for (const review of reviews) {
    const key = pendingReviewKey(review);
    const current = byDocument.get(key);
    const refreshed = String(review?.packetReference || '').includes(':SEMANTIC_REFRESH:');
    const currentRefreshed = String(current?.packetReference || '').includes(':SEMANTIC_REFRESH:');
    if (!current || (refreshed && !currentRefreshed)) byDocument.set(key, review);
  }
  return [...byDocument.values()];
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createSemanticAdapter({ client, windowRef });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      pdfLegacyPendingSemanticRefresh: true,
      pdfIngressParity: true,
      pendingReviewRefreshDeduplication: true,
    }),
    async listPendingEvidenceReviews() {
      const reviews = await adapter.listPendingEvidenceReviews();
      return freeze(dedupePendingReviews(reviews));
    },
    async processPdf(file, options = {}) {
      const review = await adapter.processPdf(file, options);
      if (!review?.resumedExistingReview) return review;

      const existingRefresh = await findRefreshPacket(client, review.documentDigest);
      if (existingRefresh) return reviewFromRefreshPacket(review, existingRefresh);
      if (!needsSemanticRefresh(review)) return review;
      return refreshLegacyPacket(client, review, file);
    },
  });
}
