import { createHash } from 'node:crypto';
import {
  EVIDENCE_SOURCE_STATUSES,
  EVIDENCE_SOURCE_TYPES,
  createEvidenceSource,
} from '../../../policy-operations/evidence-inbox/evidence-source.js';
import {
  EVIDENCE_VISIBILITY_SCOPES,
  createEvidenceInboxItem,
} from '../../../policy-operations/evidence-inbox/evidence-inbox-item.js';
import { EVIDENCE_PROCESSING_STATUSES } from '../../../policy-operations/evidence-inbox/evidence-processing-status.js';
import { validateAdmissionMetadata } from '../../../policy-operations/intake/cartera-020b-intake-contracts.js';

const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
]);

function toBuffer(bytes) {
  if (Buffer.isBuffer(bytes)) return bytes;
  if (bytes instanceof Uint8Array) return Buffer.from(bytes);
  throw new TypeError('bytes_must_be_buffer_or_uint8array');
}

export function computeDocumentDigest(bytes) {
  return createHash('sha256').update(toBuffer(bytes)).digest('hex');
}

export function createEvidenceAdmissionCandidate({
  ownerAdvisorId,
  organizationId = null,
  originalFilename,
  mimeType,
  bytes,
  storageReference,
  receivedAt = new Date().toISOString(),
  receivedBy = ownerAdvisorId,
  purpose = 'POLICY_INTAKE',
  idempotencyKey,
} = {}) {
  const buffer = toBuffer(bytes);
  if (!ACCEPTED_MIME_TYPES.has(mimeType)) throw new TypeError('unsupported_mime_type');
  const documentDigest = computeDocumentDigest(buffer);
  const metadata = validateAdmissionMetadata({
    ownerAdvisorId,
    organizationId,
    originalFilename,
    mimeType,
    byteSize: buffer.byteLength,
    documentDigest,
    storageReference,
    purpose,
    idempotencyKey,
  });
  const sourceReference = `evidence-source/${documentDigest}`;
  const inboxReference = `evidence-inbox/${documentDigest}/${purpose.toLowerCase()}`;

  const source = createEvidenceSource({
    sourceType: EVIDENCE_SOURCE_TYPES.UPLOAD,
    receivedAt,
    receivedBy,
    ownerAdvisorId,
    organizationId,
    originalFilename,
    mimeType,
    externalReference: sourceReference,
    sourceStatus: EVIDENCE_SOURCE_STATUSES.RECEIVED,
    metadata: {
      byteSize: buffer.byteLength,
      documentDigest,
      storageReference,
      purpose,
      idempotencyKey,
      rawBytesPersisted: false,
    },
  });
  if (source.error) throw new TypeError(`invalid_evidence_source:${source.errors?.join(',') ?? 'unknown'}`);

  const inboxItem = createEvidenceInboxItem({
    id: inboxReference,
    source,
    ownerAdvisorId,
    organizationId,
    visibilityScope: EVIDENCE_VISIBILITY_SCOPES.ADVISOR_PRIVATE,
    status: EVIDENCE_PROCESSING_STATUSES.RECEIVED,
    documentTypeCandidate: 'unknown',
    createdAt: receivedAt,
    updatedAt: receivedAt,
    metadata: {
      documentDigest,
      sourceReference,
      purpose,
      idempotencyKey,
      createsPolicyTruth: false,
    },
  });
  if (inboxItem.error) throw new TypeError(`invalid_evidence_inbox_item:${inboxItem.errors?.join(',') ?? 'unknown'}`);

  return Object.freeze({
    sourceReference,
    inboxReference,
    documentDigest,
    source: Object.freeze(source),
    inboxItem: Object.freeze(inboxItem),
    admissionMetadata: metadata,
    createsTruth: false,
    createsPolicy: false,
  });
}

export function buildEvidenceAdmissionCommand(candidate) {
  if (!candidate || candidate.createsTruth !== false || candidate.createsPolicy !== false) {
    throw new TypeError('invalid_admission_candidate');
  }
  const { admissionMetadata, sourceReference, inboxReference } = candidate;
  return Object.freeze({
    advisorId: admissionMetadata.ownerAdvisorId,
    organizationReference: admissionMetadata.organizationId,
    sourceReference,
    inboxReference,
    sourceType: 'UPLOAD',
    originalFilename: admissionMetadata.originalFilename,
    mimeType: admissionMetadata.mimeType,
    byteSize: admissionMetadata.byteSize,
    documentDigest: admissionMetadata.documentDigest,
    storageReference: admissionMetadata.storageReference,
    purpose: admissionMetadata.purpose,
    receivedAt: candidate.source.receivedAt,
    idempotencyKey: admissionMetadata.idempotencyKey,
  });
}
