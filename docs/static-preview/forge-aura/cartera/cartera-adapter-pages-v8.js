import { createCarteraAdapter as createReopenSafeAdapter } from './cartera-adapter-pages-v7.js?base=cartera-pdf-semantic-completion-014';
import { confirmNewPolicyCoverage } from './cartera-coverage-adapter.js?v=cartera-pdf-semantic-completion-014';
import {
  civilDateToTransportInstant,
  enrichSemanticFields,
  normalizeCoverageCandidates,
  normalizeSemanticCandidate,
  semanticReviewCandidate,
} from './cartera-semantic-v1.js?v=cartera-pdf-semantic-completion-014';

const PDF_FUNCTION = 'cartera-pdf-intake';
const RESULT_RPC = 'forge_cartera020b_record_processing_result';
const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function withoutCoverageGap(values, hasCoverage) {
  if (!Array.isArray(values)) return values;
  if (!hasCoverage) return values;
  return values.filter(value => !/POLICY_COVERAGE_EXTRACTION_NOT_SUPPORTED|policyCoverages|no produce coberturas/i.test(String(value)));
}

function enrichProcessingArgs(args, rawCandidate) {
  const command = args?.p_command;
  const result = command?.result;
  if (!command || !result || !rawCandidate) return args;

  const candidate = normalizeSemanticCandidate(rawCandidate);
  const existing = result?.candidate?.extractedFields || result?.packet?.extractedFields || {};
  const fields = enrichSemanticFields(existing, candidate);
  const hasCoverage = candidate.coverageCandidates.length > 0;
  const enrichedResult = {
    ...result,
    warnings: withoutCoverageGap(result.warnings, hasCoverage),
  };

  if (result.candidate) {
    enrichedResult.candidate = {
      ...result.candidate,
      extractedFields: fields,
      missingFields: withoutCoverageGap(result.candidate.missingFields, hasCoverage),
    };
  }
  if (result.packet) {
    enrichedResult.packet = {
      ...result.packet,
      extractedFields: fields,
      warnings: withoutCoverageGap(result.packet.warnings, hasCoverage),
    };
  }

  return { ...args, p_command: { ...command, result: enrichedResult } };
}

function semanticClient(client, hooks) {
  const functions = new Proxy(client.functions, {
    get(target, property) {
      if (property !== 'invoke') return bindValue(target, property);
      return async (name, options = {}) => {
        const result = await target.invoke(name, options);
        if (name === PDF_FUNCTION && !result?.error && Array.isArray(result?.data?.candidates)) {
          const first = result.data.candidates[0];
          hooks.latestCandidate = first
            ? normalizeSemanticCandidate({ ...first, modelVersion: result.data.modelVersion })
            : null;
          if (hooks.latestCandidate) {
            result.data = {
              ...result.data,
              candidates: [hooks.latestCandidate, ...result.data.candidates.slice(1)],
            };
          }
        }
        return result;
      };
    },
  });

  return new Proxy(client, {
    get(target, property) {
      if (property === 'functions') return functions;
      if (property !== 'rpc') return bindValue(target, property);
      return async (name, args = {}, options) => target.rpc(
        name,
        name === RESULT_RPC ? enrichProcessingArgs(args, hooks.latestCandidate) : args,
        options,
      );
    },
  });
}

function reviewFromSemanticFields(review, latestCandidate) {
  const fields = enrichSemanticFields(review?.fields || {}, latestCandidate || {});
  const edgeCandidate = semanticReviewCandidate(fields, review?.edgeCandidate || {});
  const coverageCandidates = normalizeCoverageCandidates(edgeCandidate.coverageCandidates);
  return freeze({
    ...review,
    fields,
    edgeCandidate: { ...edgeCandidate, coverageCandidates, premium: null },
    coverageCandidates,
    coverageSectionDetected: edgeCandidate.coverageSectionDetected,
    pdfCoverageExtraction: edgeCandidate.coverageExtractionState,
    reviewCompleteness: edgeCandidate.reviewCompleteness,
    requiresHumanReview: true,
    createsPolicyTruth: false,
  });
}

function safeRef(value) {
  const text = String(value || '').trim();
  return REF.test(text) ? text : null;
}

function periodParts(value) {
  if (!value || typeof value !== 'object') return { value: null, unit: null };
  const amount = Number(value.value);
  return {
    value: Number.isFinite(amount) && amount > 0 ? amount : null,
    unit: safeRef(value.unit),
  };
}

function coverageWriterInput(review, coverage, index) {
  const coveragePeriod = periodParts(coverage.coveragePeriod);
  const paymentPeriod = periodParts(coverage.paymentPeriod);
  const reference = `policy-coverage:aura:${review.documentDigest.slice(0, 28)}:${String(index + 1).padStart(2, '0')}`;
  return {
    policyCoverageReference: reference,
    coverageLabel: coverage.coverageLabel,
    coverageCode: coverage.coverageCode,
    coverageKind: 'OTHER',
    sumInsured: coverage.sumInsured,
    currency: coverage.currency,
    premiumAmount: coverage.premiumAmount,
    premiumCurrency: coverage.currency,
    annexReference: safeRef(coverage.annexReference),
    effectiveFrom: civilDateToTransportInstant(coverage.effectiveFrom),
    effectiveTo: null,
    coveragePeriodValue: coveragePeriod.value,
    coveragePeriodUnit: coveragePeriod.unit,
    paymentPeriodValue: paymentPeriod.value,
    paymentPeriodUnit: paymentPeriod.unit,
  };
}

async function persistConfirmedCoverageCandidates(client, review, policyReference, references) {
  const approved = new Set(Array.isArray(references) ? references : []);
  const candidates = normalizeCoverageCandidates(review.coverageCandidates || review.edgeCandidate?.coverageCandidates);
  const results = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const coverage = candidates[index];
    if (!approved.has(coverage.candidateReference)) continue;
    results.push(await confirmNewPolicyCoverage({
      client,
      policyReference,
      input: coverageWriterInput(review, coverage, index),
    }));
  }
  return results;
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const hooks = { latestCandidate: null };
  const adapter = await createReopenSafeAdapter({
    client: semanticClient(client, hooks),
    windowRef,
  });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      pdfMultiCoverageExtraction: true,
      pdfSemanticReview012: true,
      pdfSemanticCompletion014: true,
    }),
    async processPdf(file, options = {}) {
      const review = await adapter.processPdf(file, options);
      return reviewFromSemanticFields(review, hooks.latestCandidate);
    },
    async confirmPdfReview(review, input = {}) {
      const semanticReview = reviewFromSemanticFields(review, null);
      const confirmed = await adapter.confirmPdfReview(semanticReview, {
        ...input,
        premiumAmount: undefined,
      });
      const policyReference = confirmed?.policyResult?.policyReference;
      if (!policyReference) return confirmed;

      const coverageResults = await persistConfirmedCoverageCandidates(
        client,
        semanticReview,
        policyReference,
        input.confirmedCoverageReferences,
      );

      return freeze({
        ...confirmed,
        coverageResults,
        semanticReviewConfirmed: true,
      });
    },
  });
}