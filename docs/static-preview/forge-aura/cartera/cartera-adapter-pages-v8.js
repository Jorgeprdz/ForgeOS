import { createCarteraAdapter as createReopenSafeAdapter } from './cartera-adapter-pages-v7.js?base=cartera-pdf-semantic-reconciliation-012';

const PDF_FUNCTION = 'cartera-pdf-intake';
const RESULT_RPC = 'forge_cartera020b_record_processing_result';
const MONTHS = Object.freeze({ ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06', JUL: '07', AGO: '08', SEP: '09', OCT: '10', NOV: '11', DIC: '12' });

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

function numberValue(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value).trim().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function civilDate(value) {
  if (!value) return null;
  const text = String(value).trim().toUpperCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[\/-]([A-ZÁÉÍÓÚ]{3,})[\/-](\d{4})$/);
  if (match) {
    const monthKey = match[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    const month = MONTHS[monthKey];
    if (month) return `${match[3]}-${month}-${String(match[1]).padStart(2, '0')}`;
  }
  const numeric = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (numeric) return `${numeric[3]}-${String(numeric[2]).padStart(2, '0')}-${String(numeric[1]).padStart(2, '0')}`;
  return null;
}

function currencyValue(value) {
  const text = String(value || '').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(text) ? text : null;
}

function paymentFrequencyValue(value) {
  const text = String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (/MENSUAL|MONTHLY/.test(text)) return 'MONTHLY';
  if (/TRIMESTRAL|QUARTERLY/.test(text)) return 'QUARTERLY';
  if (/SEMESTRAL|SEMIANNUAL|SEMI-ANNUAL/.test(text)) return 'SEMIANNUAL';
  if (/ANUAL|ANNUAL|YEARLY/.test(text)) return 'ANNUAL';
  return text || null;
}

function coverageCandidates(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((row, index) => ({
    candidateReference: String(row?.candidateReference || `PDF_COVERAGE_CANDIDATE:${index + 1}`),
    coverageLabel: String(row?.coverageLabel || row?.label || '').trim() || null,
    coverageCode: String(row?.coverageCode || row?.code || '').trim() || null,
    annexReference: String(row?.annexReference || row?.annex || '').trim() || null,
    sumInsured: numberValue(row?.sumInsured),
    currency: currencyValue(row?.currency),
    effectiveFrom: civilDate(row?.effectiveFrom),
    coveragePeriod: row?.coveragePeriod ?? null,
    paymentPeriod: row?.paymentPeriod ?? null,
    premiumAmount: numberValue(row?.premiumAmount),
    confidence: Number.isFinite(Number(row?.confidence)) ? Math.max(0, Math.min(1, Number(row.confidence))) : null,
    source: String(row?.source || 'PDF_DOCUMENT'),
    sourceLocation: row?.sourceLocation ?? null,
    createsTruth: false,
    requiresHumanReview: true,
  })).filter(row => row.coverageLabel || row.coverageCode || row.annexReference || row.sumInsured !== null || row.premiumAmount !== null);
}

function semanticCandidate(candidate = {}) {
  return {
    ...candidate,
    policyType: String(candidate.policyType || '').trim() || null,
    status: String(candidate.status || '').trim() || null,
    currency: currencyValue(candidate.currency),
    paymentFrequency: paymentFrequencyValue(candidate.paymentFrequency),
    issueDate: civilDate(candidate.issueDate),
    effectiveDate: civilDate(candidate.effectiveDate),
    expirationDate: civilDate(candidate.expirationDate),
    basicPremiumTotal: numberValue(candidate.basicPremiumTotal),
    plannedPremium: numberValue(candidate.plannedPremium),
    annualTotal: numberValue(candidate.annualTotal),
    coverageCandidates: coverageCandidates(candidate.coverageCandidates),
  };
}

function field(value, candidate, previous = null) {
  const present = !(value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0));
  return {
    ...(previous && typeof previous === 'object' ? previous : {}),
    value: present ? value : null,
    confidence: previous?.confidence ?? (Number.isFinite(Number(candidate?.confidence)) ? Number(candidate.confidence) : null),
    state: present ? 'EXTRACTED' : 'UNKNOWN',
    sourceLocation: previous?.sourceLocation ?? null,
    extractionMethod: previous?.extractionMethod || 'EDGE_FUNCTION_REVIEW',
    parserId: previous?.parserId || 'cartera-pdf-intake',
    parserVersion: previous?.parserVersion || String(candidate?.modelVersion || 'current'),
    createsTruth: false,
  };
}

function semanticFields(existing = {}, rawCandidate = {}) {
  const candidate = semanticCandidate(rawCandidate);
  return {
    ...existing,
    policyType: field(candidate.policyType, candidate, existing.policyType),
    currency: field(candidate.currency, candidate, existing.currency),
    paymentFrequency: field(candidate.paymentFrequency, candidate, existing.paymentFrequency),
    issueDate: field(candidate.issueDate, candidate, existing.issueDate),
    basicPremiumTotal: field(candidate.basicPremiumTotal, candidate, existing.basicPremiumTotal),
    plannedPremium: field(candidate.plannedPremium, candidate, existing.plannedPremium),
    annualTotal: field(candidate.annualTotal, candidate, existing.annualTotal),
    coverageCandidates: field(candidate.coverageCandidates, candidate, existing.coverageCandidates),
  };
}

function fieldValue(fields, name) {
  return fields?.[name]?.value ?? null;
}

function candidateFromReview(review, rawCandidate = null) {
  const fields = semanticFields(review?.fields || {}, rawCandidate || {});
  const edge = review?.edgeCandidate || {};
  const coverages = coverageCandidates(fieldValue(fields, 'coverageCandidates'));
  return {
    fields,
    edgeCandidate: {
      ...edge,
      policyType: fieldValue(fields, 'policyType'),
      status: fieldValue(fields, 'status') ?? edge.status ?? null,
      currency: fieldValue(fields, 'currency'),
      paymentFrequency: fieldValue(fields, 'paymentFrequency'),
      issueDate: fieldValue(fields, 'issueDate'),
      effectiveDate: fieldValue(fields, 'effectiveFrom') ?? edge.effectiveDate ?? null,
      expirationDate: fieldValue(fields, 'effectiveTo') ?? edge.expirationDate ?? null,
      basicPremiumTotal: numberValue(fieldValue(fields, 'basicPremiumTotal')),
      plannedPremium: numberValue(fieldValue(fields, 'plannedPremium')),
      annualTotal: numberValue(fieldValue(fields, 'annualTotal')),
      premium: null,
      coverageCandidates: coverages,
    },
    coverages,
  };
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
  const candidate = semanticCandidate(rawCandidate);
  const fields = semanticFields(result?.candidate?.extractedFields || result?.packet?.extractedFields || {}, candidate);
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
          const candidate = result.data.candidates[0] ? semanticCandidate({ ...result.data.candidates[0], modelVersion: result.data.modelVersion }) : null;
          hooks.latestCandidate = candidate;
          if (candidate) {
            result.data = { ...result.data, candidates: [candidate, ...result.data.candidates.slice(1)] };
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

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const hooks = { latestCandidate: null };
  const adapter = await createReopenSafeAdapter({ client: semanticClient(client, hooks), windowRef });

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({ ...(adapter.capabilities || {}), pdfMultiCoverageExtraction: true, pdfSemanticReview012: true }),
    async processPdf(file, options = {}) {
      const review = await adapter.processPdf(file, options);
      const semantic = candidateFromReview(review, hooks.latestCandidate);
      return freeze({
        ...review,
        fields: semantic.fields,
        edgeCandidate: semantic.edgeCandidate,
        coverageCandidates: semantic.coverages,
        pdfCoverageExtraction: semantic.coverages.length ? 'CANDIDATES_REVIEW_REQUIRED' : 'NO_CANDIDATES',
        requiresHumanReview: true,
        createsPolicyTruth: false,
      });
    },
  });
}
