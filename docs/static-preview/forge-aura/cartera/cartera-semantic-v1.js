const MONTHS = Object.freeze({
  ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06',
  JUL: '07', AGO: '08', SEP: '09', OCT: '10', NOV: '11', DIC: '12',
});
const MONTH_LABELS = Object.freeze(['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']);
const STATUS_VALUES = new Set(['PENDING','ISSUED','ACTIVE','SUSPENDED','LAPSED','CANCELLED','MATURED','CLAIMED','UNKNOWN']);
const COVERAGE_STATES = new Set([
  'CANDIDATES_REVIEW_REQUIRED',
  'INCOMPLETE_REVIEW_REQUIRED',
  'NO_COVERAGE_SECTION_DETECTED',
  'COVERAGE_PRESENCE_UNKNOWN',
]);

function strip(value) {
  return String(value ?? '').trim();
}

function asciiUpper(value) {
  return strip(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function present(value) {
  return !(value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0));
}

function validCivilDate(year, month, day) {
  const y = Number(year), m = Number(month), d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d) || m < 1 || m > 12 || d < 1) return false;
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d <= days[m - 1];
}

export function normalizeCivilDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = asciiUpper(value);
  let year, month, day;
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) [, year, month, day] = match;
  if (!match) {
    match = text.match(/^(\d{1,2})[\/-]([A-Z]{3,})[\/-](\d{4})$/);
    if (match) {
      day = match[1];
      month = MONTHS[match[2].slice(0, 3)];
      year = match[3];
    }
  }
  if (!match) {
    match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (match) {
      day = match[1];
      month = match[2];
      year = match[3];
    }
  }
  if (!year || !month || !day || !validCivilDate(year, month, day)) return null;
  return `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export function formatCivilDateEs(value) {
  const normalized = normalizeCivilDate(value);
  if (!normalized) return 'No identificada';
  const [year, month, day] = normalized.split('-');
  return `${day} ${MONTH_LABELS[Number(month) - 1]} ${year}`;
}

export function civilDateToTransportInstant(value) {
  const normalized = normalizeCivilDate(value);
  return normalized ? `${normalized}T12:00:00.000Z` : null;
}

export function normalizeMoneyValue(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  const parsed = Number(strip(value).replace(/,/g, '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeCurrency(value) {
  const text = asciiUpper(value);
  return /^[A-Z]{3}$/.test(text) ? text : null;
}

export function normalizePaymentFrequency(value) {
  const text = asciiUpper(value);
  if (!text) return null;
  if (/MENSUAL|MONTHLY/.test(text)) return 'MONTHLY';
  if (/TRIMESTRAL|QUARTERLY/.test(text)) return 'QUARTERLY';
  if (/SEMESTRAL|SEMIANNUAL|SEMI-ANNUAL/.test(text)) return 'SEMIANNUAL';
  if (/ANUAL|ANNUAL|YEARLY/.test(text)) return 'ANNUAL';
  if (/UNICO|UNICA|SINGLE/.test(text)) return 'SINGLE';
  return null;
}

export function paymentFrequencyLabel(value) {
  return ({
    MONTHLY: 'Mensual',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    ANNUAL: 'Anual',
    SINGLE: 'Pago único',
    OTHER: 'Otra',
  })[normalizePaymentFrequency(value) || value] || 'Por confirmar';
}

export function normalizePolicyType(value) {
  const text = asciiUpper(value);
  return text || null;
}

export function normalizePolicyStatus(value) {
  const text = asciiUpper(value);
  if (!text || text === 'NORMAL') return null;
  if (STATUS_VALUES.has(text)) return text === 'UNKNOWN' ? null : text;
  if (/ACTIVA|ACTIVE/.test(text)) return 'ACTIVE';
  if (/EMITIDA|ISSUED/.test(text)) return 'ISSUED';
  if (/PENDIENTE|PENDING/.test(text)) return 'PENDING';
  if (/SUSPENDIDA|SUSPENDED/.test(text)) return 'SUSPENDED';
  if (/VENCIDA|LAPSED|CAIDA/.test(text)) return 'LAPSED';
  if (/CANCELADA|CANCELLED/.test(text)) return 'CANCELLED';
  return null;
}

export function policyStatusLabel(value) {
  const normalized = normalizePolicyStatus(value);
  return ({
    ACTIVE: 'Activa', ISSUED: 'Emitida', PENDING: 'Pendiente', SUSPENDED: 'Suspendida',
    LAPSED: 'Vencida', CANCELLED: 'Cancelada', MATURED: 'Madurada', CLAIMED: 'Con siniestro',
  })[normalized] || 'No identificado';
}

function period(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const amount = normalizeMoneyValue(value.value);
    const unit = asciiUpper(value.unit);
    return amount === null && !unit ? null : { value: amount, unit: unit || null };
  }
  return strip(value) || null;
}

function coverageSectionFlag(value) {
  return value === true ? true : (value === false ? false : null);
}

export function normalizeCoverageCandidates(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((row, index) => {
    const confidence = Number(row?.confidence);
    return {
      candidateReference: strip(row?.candidateReference) || `PDF_COVERAGE_CANDIDATE:${index + 1}`,
      coverageLabel: strip(row?.coverageLabel ?? row?.label) || null,
      coverageCode: strip(row?.coverageCode ?? row?.code) || null,
      annexReference: strip(row?.annexReference ?? row?.annex) || null,
      sumInsured: normalizeMoneyValue(row?.sumInsured),
      currency: normalizeCurrency(row?.currency),
      effectiveFrom: normalizeCivilDate(row?.effectiveFrom),
      coveragePeriod: period(row?.coveragePeriod),
      paymentPeriod: period(row?.paymentPeriod),
      premiumAmount: normalizeMoneyValue(row?.premiumAmount),
      source: strip(row?.source) || 'PDF_DOCUMENT',
      evidenceReference: strip(row?.evidenceReference ?? row?.sourceLocation) || null,
      sourceSection: strip(row?.sourceSection) || 'COBERTURAS',
      sourceLocation: row?.sourceLocation ?? null,
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null,
      createsTruth: false,
      requiresHumanReview: true,
    };
  }).filter(row => row.coverageLabel || row.coverageCode || row.annexReference || row.sumInsured !== null || row.premiumAmount !== null);
}

export function coverageExtractionState(value = {}) {
  const candidate = Array.isArray(value) ? { coverageCandidates: value } : (value || {});
  const explicit = asciiUpper(candidate.coverageExtractionState);
  if (COVERAGE_STATES.has(explicit)) return explicit;
  const rows = normalizeCoverageCandidates(candidate.coverageCandidates);
  if (rows.length) return 'CANDIDATES_REVIEW_REQUIRED';
  const section = coverageSectionFlag(candidate.coverageSectionDetected);
  if (section === true) return 'INCOMPLETE_REVIEW_REQUIRED';
  if (section === false) return 'NO_COVERAGE_SECTION_DETECTED';
  return 'COVERAGE_PRESENCE_UNKNOWN';
}

function semanticProvenance(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, state]) => [key, strip(state) || null]));
}

export function normalizeSemanticCandidate(raw = {}) {
  const rawStatus = strip(raw.status);
  let policyType = normalizePolicyType(raw.policyType);
  let status = normalizePolicyStatus(rawStatus);
  if (!policyType && asciiUpper(rawStatus) === 'NORMAL') {
    policyType = 'NORMAL';
    status = null;
  }
  const coverageCandidates = normalizeCoverageCandidates(raw.coverageCandidates);
  const normalized = {
    ...raw,
    person: strip(raw.person) || null,
    insured: strip(raw.insured) || null,
    contractor: strip(raw.contractor) || null,
    policyNumber: strip(raw.policyNumber) || null,
    product: strip(raw.product) || null,
    policyType,
    status,
    issueDate: normalizeCivilDate(raw.issueDate),
    effectiveDate: normalizeCivilDate(raw.effectiveDate),
    expirationDate: normalizeCivilDate(raw.expirationDate),
    currency: normalizeCurrency(raw.currency),
    paymentFrequency: normalizePaymentFrequency(raw.paymentFrequency),
    basicPremiumTotal: normalizeMoneyValue(raw.basicPremiumTotal),
    plannedPremium: normalizeMoneyValue(raw.plannedPremium),
    annualTotal: normalizeMoneyValue(raw.annualTotal),
    beneficiariesDetected: raw.beneficiariesDetected === true,
    coverageSectionDetected: coverageSectionFlag(raw.coverageSectionDetected),
    coverageCandidates,
    semanticProvenance: semanticProvenance(raw.semanticProvenance),
  };
  normalized.coverageExtractionState = coverageExtractionState(normalized);
  normalized.reviewCompleteness = semanticReviewCompleteness(normalized);
  return normalized;
}

export function semanticReviewCompleteness(raw = {}) {
  const candidate = {
    ...raw,
    coverageCandidates: normalizeCoverageCandidates(raw.coverageCandidates),
  };
  const gaps = [];
  if (!present(candidate.policyNumber)) gaps.push('policyNumber');
  if (!present(candidate.product)) gaps.push('product');
  if (!present(candidate.policyType) && !present(candidate.status)) gaps.push('policyTypeOrStatus');
  if (!present(candidate.issueDate)) gaps.push('issueDate');
  if (!present(candidate.effectiveDate)) gaps.push('effectiveDate');
  if (!present(candidate.expirationDate)) gaps.push('expirationDate');
  if (!present(candidate.currency)) gaps.push('currency');
  if (!present(candidate.paymentFrequency)) gaps.push('paymentFrequency');
  if (!present(candidate.basicPremiumTotal)) gaps.push('basicPremiumTotal');
  if (!present(candidate.plannedPremium)) gaps.push('plannedPremium');
  if (!present(candidate.annualTotal)) gaps.push('annualTotal');
  if (coverageSectionFlag(candidate.coverageSectionDetected) === true && candidate.coverageCandidates.length === 0) {
    gaps.push('coverageCandidates');
  }
  return Object.freeze({
    state: gaps.length ? 'REVIEW_REQUIRED' : 'COMPLETE_FOR_HUMAN_REVIEW',
    gaps: Object.freeze(gaps),
    criticalGapCount: gaps.length,
  });
}

const SOURCE_SECTIONS = Object.freeze({
  holderName: 'IDENTIDAD', insuredName: 'IDENTIDAD', contractorName: 'IDENTIDAD',
  policyNumber: 'POLIZA', productName: 'POLIZA', policyType: 'POLIZA', status: 'POLIZA',
  issueDate: 'VIGENCIA', effectiveFrom: 'VIGENCIA', effectiveTo: 'VIGENCIA',
  currency: 'PRIMA_Y_COBRO', paymentFrequency: 'PRIMA_Y_COBRO',
  basicPremiumTotal: 'PRIMA_Y_COBRO', plannedPremium: 'PRIMA_Y_COBRO', annualTotal: 'PRIMA_Y_COBRO',
  beneficiariesDetected: 'BENEFICIARIOS', coverageSectionDetected: 'COBERTURAS', coverageCandidates: 'COBERTURAS',
});

export function semanticField(name, value, candidate = {}, previous = null) {
  const resolved = present(value) ? value : (previous?.value ?? null);
  const confidence = previous?.confidence ?? (Number.isFinite(Number(candidate?.confidence)) ? Number(candidate.confidence) : null);
  const extractionPass = previous?.extractionPass || candidate?.semanticProvenance?.[name] || null;
  return {
    ...(previous && typeof previous === 'object' ? previous : {}),
    value: resolved,
    sourceFact: previous?.sourceFact ?? (present(value) ? value : resolved),
    sourceSection: previous?.sourceSection || SOURCE_SECTIONS[name] || 'DOCUMENTO',
    interpretation: previous?.interpretation || 'DOCUMENT_FACT_CANDIDATE',
    normalizedValue: resolved,
    confidence,
    confirmationStatus: previous?.confirmationStatus || 'PENDING_CONFIRMATION',
    state: present(resolved) ? 'EXTRACTED' : 'UNKNOWN',
    sourceLocation: previous?.sourceLocation ?? null,
    extractionMethod: previous?.extractionMethod || 'EDGE_FUNCTION_REVIEW',
    extractionPass,
    parserId: previous?.parserId || 'cartera-pdf-intake',
    parserVersion: previous?.parserVersion || String(candidate?.modelVersion || 'current'),
    createsTruth: false,
  };
}

export function enrichSemanticFields(existing = {}, raw = {}) {
  const candidate = normalizeSemanticCandidate(raw);
  const pick = (name, value) => semanticField(name, value, candidate, existing[name]);
  return {
    ...existing,
    holderName: pick('holderName', candidate.person),
    insuredName: pick('insuredName', candidate.insured),
    contractorName: pick('contractorName', candidate.contractor),
    policyNumber: pick('policyNumber', candidate.policyNumber),
    productName: pick('productName', candidate.product),
    policyType: pick('policyType', candidate.policyType),
    status: pick('status', candidate.status),
    issueDate: pick('issueDate', candidate.issueDate),
    effectiveFrom: pick('effectiveFrom', candidate.effectiveDate),
    effectiveTo: pick('effectiveTo', candidate.expirationDate),
    currency: pick('currency', candidate.currency),
    paymentFrequency: pick('paymentFrequency', candidate.paymentFrequency),
    basicPremiumTotal: pick('basicPremiumTotal', candidate.basicPremiumTotal),
    plannedPremium: pick('plannedPremium', candidate.plannedPremium),
    annualTotal: pick('annualTotal', candidate.annualTotal),
    beneficiariesDetected: pick('beneficiariesDetected', candidate.beneficiariesDetected === true ? true : null),
    coverageSectionDetected: pick('coverageSectionDetected', candidate.coverageSectionDetected),
    coverageCandidates: pick('coverageCandidates', candidate.coverageCandidates),
  };
}

export function fieldValue(fields, name) {
  return fields?.[name]?.value ?? null;
}

export function semanticReviewCandidate(fields = {}, fallback = {}) {
  const coverageCandidates = normalizeCoverageCandidates(fieldValue(fields, 'coverageCandidates'));
  const candidate = {
    ...fallback,
    person: fieldValue(fields, 'holderName') ?? fallback.person ?? null,
    insured: fieldValue(fields, 'insuredName') ?? fallback.insured ?? null,
    contractor: fieldValue(fields, 'contractorName') ?? fallback.contractor ?? null,
    policyNumber: fieldValue(fields, 'policyNumber') ?? fallback.policyNumber ?? null,
    product: fieldValue(fields, 'productName') ?? fallback.product ?? null,
    policyType: fieldValue(fields, 'policyType'),
    status: fieldValue(fields, 'status'),
    issueDate: normalizeCivilDate(fieldValue(fields, 'issueDate')),
    effectiveDate: normalizeCivilDate(fieldValue(fields, 'effectiveFrom') ?? fallback.effectiveDate),
    expirationDate: normalizeCivilDate(fieldValue(fields, 'effectiveTo') ?? fallback.expirationDate),
    currency: normalizeCurrency(fieldValue(fields, 'currency')),
    paymentFrequency: normalizePaymentFrequency(fieldValue(fields, 'paymentFrequency')),
    basicPremiumTotal: normalizeMoneyValue(fieldValue(fields, 'basicPremiumTotal')),
    plannedPremium: normalizeMoneyValue(fieldValue(fields, 'plannedPremium')),
    annualTotal: normalizeMoneyValue(fieldValue(fields, 'annualTotal')),
    beneficiariesDetected: fieldValue(fields, 'beneficiariesDetected') === true,
    coverageSectionDetected: coverageSectionFlag(fieldValue(fields, 'coverageSectionDetected') ?? fallback.coverageSectionDetected),
    coverageCandidates,
    premium: null,
  };
  candidate.coverageExtractionState = coverageExtractionState(candidate);
  candidate.reviewCompleteness = semanticReviewCompleteness(candidate);
  return candidate;
}
