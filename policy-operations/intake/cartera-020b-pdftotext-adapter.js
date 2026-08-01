import { createHash } from 'node:crypto';
import { extraerTextoOCR } from '../evidence/policy-ocr-engine.js';
import {
  INTAKE_EXTRACTION_STATUSES,
  createExtractionEnvelope,
} from './cartera-020b-intake-contracts.js';

const STATUS_MAP = Object.freeze({
  ocr_complete: INTAKE_EXTRACTION_STATUSES.COMPLETE,
  ocr_empty: INTAKE_EXTRACTION_STATUSES.EMPTY,
  ocr_failed: INTAKE_EXTRACTION_STATUSES.FAILED,
});

export function createLocalPdftotextAdapter({
  extractor = extraerTextoOCR,
  providerVersion = 'policy-ocr-engine-v0.2.0',
  clock = () => new Date(),
} = {}) {
  if (typeof extractor !== 'function') throw new TypeError('extractor_required');
  if (typeof clock !== 'function') throw new TypeError('clock_required');

  return Object.freeze({
    provider: 'LOCAL_PDFTOTEXT',
    providerVersion,
    method: 'PDF_TEXT',
    async extract({ filePath, sourceDigest } = {}) {
      const startedAt = clock().toISOString();
      const result = await extractor({ filePath });
      const completedAt = clock().toISOString();
      const status = STATUS_MAP[result?.status] ?? INTAKE_EXTRACTION_STATUSES.REVIEW_REQUIRED;
      const text = status === INTAKE_EXTRACTION_STATUSES.COMPLETE
        ? String(result?.extractedText ?? '')
        : null;
      const errors = result?.error ? [String(result.error)] : [];
      const envelope = createExtractionEnvelope({
        provider: 'LOCAL_PDFTOTEXT',
        providerVersion,
        method: 'PDF_TEXT',
        status,
        sourceDigest,
        pageCount: null,
        text,
        warnings: result?.status && !STATUS_MAP[result.status] ? [`unmapped_status:${result.status}`] : [],
        errors,
        startedAt,
        completedAt,
      });
      return Object.freeze({
        envelope,
        textDigest: text === null ? null : createHash('sha256').update(text).digest('hex'),
        outputMustBeStoredSeparately: text !== null,
        createsTruth: false,
      });
    },
  });
}
