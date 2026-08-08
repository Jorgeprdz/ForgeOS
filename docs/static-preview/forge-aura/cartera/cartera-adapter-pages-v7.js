import { createCarteraAdapter as createDateSafeAdapter } from './cartera-adapter-pages-v6.js?base=aura-cartera-pdf-already-admitted-reopen-011';
import {
  enrichSemanticFields,
  fieldValue,
  normalizeCivilDate,
  semanticReviewCandidate,
} from './cartera-semantic-v1.js?v=cartera-pdf-semantic-reconciliation-012';

const MAX_PDF_BYTES = 8 * 1024 * 1024;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

async function sha256(buffer) {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function sanitizeStoredFields(fields = {}) {
  const normalized = enrichSemanticFields(fields, {
    person: fieldValue(fields, 'holderName'),
    insured: fieldValue(fields, 'insuredName'),
    contractor: fieldValue(fields, 'contractorName'),
    policyNumber: fieldValue(fields, 'policyNumber'),
    product: fieldValue(fields, 'productName'),
    policyType: fieldValue(fields, 'policyType'),
    status: fieldValue(fields, 'status'),
    issueDate: normalizeCivilDate(fieldValue(fields, 'issueDate')),
    effectiveDate: normalizeCivilDate(fieldValue(fields, 'effectiveFrom')),
    expirationDate: normalizeCivilDate(fieldValue(fields, 'effectiveTo')),
    currency: fieldValue(fields, 'currency'),
    paymentFrequency: fieldValue(fields, 'paymentFrequency'),
    basicPremiumTotal: fieldValue(fields, 'basicPremiumTotal'),
    plannedPremium: fieldValue(fields, 'plannedPremium'),
    annualTotal: fieldValue(fields, 'annualTotal'),
    beneficiariesDetected: fieldValue(fields, 'beneficiariesDetected') === true,
    coverageCandidates: fieldValue(fields, 'coverageCandidates'),
  });
  return freeze(normalized);
}

function reviewFromStoredPacket(packet, digest) {
  const token = digest.slice(0, 40);
  const fields = sanitizeStoredFields(packet.extracted_fields || {});
  const identityCandidate = Array.isArray(packet.identity_candidates)
    ? packet.identity_candidates[0]
    : null;
  const edgeCandidate = freeze(semanticReviewCandidate(fields, {
    confidence: Number.isFinite(Number(packet.extraction_confidence))
      ? Number(packet.extraction_confidence)
      : null,
  }));
  const coverageCandidates = edgeCandidate.coverageCandidates || [];

  return freeze({
    admission: freeze({ status: 'ALREADY_ADMITTED', evidenceStatus: 'confirmation_required' }),
    claim: null,
    processing: freeze({ status: 'EXISTING_PENDING_REVIEW' }),
    packetReference: packet.packet_reference || `POLICY_PACKET:AURA:${token}`,
    candidateReference: `POLICY_CANDIDATE:AURA:${token}`,
    personCandidateReference: identityCandidate?.candidateReference || `IDENTITY_CANDIDATE:AURA:${digest.slice(0, 36)}`,
    sourceReference: `EVIDENCE_SOURCE:AURA:${token}`,
    documentDigest: digest,
    edgeCandidate,
    fields,
    coverageCandidates,
    pdfCoverageExtraction: coverageCandidates.length ? 'CANDIDATES_REVIEW_REQUIRED' : 'NO_CANDIDATES',
    requiresHumanReview: true,
    createsPolicyTruth: false,
    resumedExistingReview: true,
  });
}

async function findPendingReview(client, digest) {
  const token = digest.slice(0, 40);
  const result = await client
    .from('cartera020b_policy_evidence_packets')
    .select('packet_reference,extracted_fields,extraction_confidence,identity_candidates,policy_role_candidates,confirmation_state')
    .eq('packet_reference', `POLICY_PACKET:AURA:${token}`)
    .eq('confirmation_state', 'PENDING_CONFIRMATION')
    .maybeSingle();
  if (result?.error) {
    const error = new Error('CARTERA020B_EXISTING_REVIEW_READ_FAILED');
    error.code = 'CARTERA020B_EXISTING_REVIEW_READ_FAILED';
    error.cause = result.error;
    throw error;
  }
  return result?.data ? reviewFromStoredPacket(result.data, digest) : null;
}

async function digestPdf(file) {
  if (!file || file.size < 1 || file.size > MAX_PDF_BYTES || !String(file.name || '').toLowerCase().endsWith('.pdf')) {
    return null;
  }
  const buffer = await file.arrayBuffer();
  if (new TextDecoder('latin1').decode(buffer.slice(0, 5)) !== '%PDF-') return null;
  return sha256(buffer);
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createDateSafeAdapter({ client, windowRef });

  return Object.freeze({
    ...adapter,
    async processPdf(file, options = {}) {
      const digest = await digestPdf(file);
      if (digest) {
        const existingReview = await findPendingReview(client, digest);
        if (existingReview) return existingReview;
      }
      return adapter.processPdf(file, options);
    },
  });
}
