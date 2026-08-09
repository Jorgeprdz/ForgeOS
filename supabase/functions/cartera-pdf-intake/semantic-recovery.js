const PRIMARY_FIELDS = Object.freeze([
  'person', 'insured', 'contractor', 'policyNumber', 'product', 'policyType', 'status',
  'issueDate', 'effectiveDate', 'expirationDate', 'currency', 'paymentFrequency',
  'basicPremiumTotal', 'plannedPremium', 'annualTotal',
]);

const RECOVERY_FIELDS = Object.freeze([
  'issueDate', 'effectiveDate', 'expirationDate', 'currency', 'paymentFrequency',
  'basicPremiumTotal', 'plannedPremium', 'annualTotal',
]);

function present(value) {
  return !(value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function coverageKey(row = {}, index = 0) {
  const normalized = [row.coverageCode, row.annexReference, row.coverageLabel]
    .map(value => String(value || '').trim().toUpperCase())
    .filter(Boolean)
    .join('|');
  return normalized || String(row.candidateReference || `INDEX:${index}`);
}

function mergeCoverages(primary = [], recovery = []) {
  const rows = [];
  const seen = new Set();
  for (const source of [safeArray(primary), safeArray(recovery)]) {
    source.forEach((row, index) => {
      if (!row || typeof row !== 'object') return;
      const key = coverageKey(row, index);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ ...row, createsTruth: false, requiresHumanReview: true });
    });
  }
  return rows;
}

export function semanticRecoveryReasons(candidate = {}) {
  const reasons = [];
  if (!present(candidate.policyNumber)) reasons.push('policyNumber');
  if (!present(candidate.product)) reasons.push('product');
  if (!present(candidate.policyType) && !present(candidate.status)) reasons.push('policyTypeOrStatus');
  for (const field of RECOVERY_FIELDS) {
    if (!present(candidate[field])) reasons.push(field);
  }
  if (safeArray(candidate.coverageCandidates).length === 0) reasons.push('coverageCandidates');
  return [...new Set(reasons)];
}

export function semanticReviewGaps(candidate = {}) {
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
  if (candidate.coverageSectionDetected === true && safeArray(candidate.coverageCandidates).length === 0) {
    gaps.push('coverageCandidates');
  }
  return gaps;
}

export function coverageExtractionState(candidate = {}) {
  if (safeArray(candidate.coverageCandidates).length > 0) return 'CANDIDATES_REVIEW_REQUIRED';
  if (candidate.coverageSectionDetected === true) return 'INCOMPLETE_REVIEW_REQUIRED';
  if (candidate.coverageSectionDetected === false) return 'NO_COVERAGE_SECTION_DETECTED';
  return 'COVERAGE_PRESENCE_UNKNOWN';
}

export function mergeSemanticCandidates(primary = {}, recovery = {}) {
  const merged = { ...primary };
  const provenance = { ...(primary.semanticProvenance || {}) };

  for (const field of PRIMARY_FIELDS) {
    if (present(primary[field])) {
      provenance[field] = provenance[field] || 'PRIMARY_MODEL_PASS';
      continue;
    }
    if (present(recovery[field])) {
      merged[field] = recovery[field];
      provenance[field] = 'FOCUSED_RECOVERY_PASS';
    }
  }

  merged.beneficiariesDetected = primary.beneficiariesDetected === true || recovery.beneficiariesDetected === true;
  merged.coverageSectionDetected = primary.coverageSectionDetected === true
    || recovery.coverageSectionDetected === true
      ? true
      : (primary.coverageSectionDetected === false && recovery.coverageSectionDetected === false ? false : null);
  merged.coverageCandidates = mergeCoverages(primary.coverageCandidates, recovery.coverageCandidates);
  if (merged.coverageCandidates.length) provenance.coverageCandidates = present(primary.coverageCandidates)
    ? 'PRIMARY_MODEL_PASS'
    : 'FOCUSED_RECOVERY_PASS';

  const primaryConfidence = Number(primary.confidence);
  const recoveryConfidence = Number(recovery.confidence);
  merged.confidence = Number.isFinite(primaryConfidence)
    ? primaryConfidence
    : (Number.isFinite(recoveryConfidence) ? recoveryConfidence : 0);
  merged.semanticProvenance = provenance;
  merged.coverageExtractionState = coverageExtractionState(merged);
  merged.reviewCompleteness = Object.freeze({
    state: semanticReviewGaps(merged).length ? 'REVIEW_REQUIRED' : 'COMPLETE_FOR_HUMAN_REVIEW',
    gaps: semanticReviewGaps(merged),
  });
  merged.requiresHumanReview = true;
  merged.createsTruth = false;
  return merged;
}

export function mergeSemanticCandidateLists(primaryRows = [], recoveryRows = []) {
  const primary = safeArray(primaryRows);
  const recovery = safeArray(recoveryRows);
  if (!primary.length) return recovery.map(row => mergeSemanticCandidates({}, row));

  const used = new Set();
  const merged = primary.map((row, index) => {
    let matchIndex = recovery.findIndex((candidate, candidateIndex) => {
      if (used.has(candidateIndex)) return false;
      return present(row.policyNumber) && present(candidate.policyNumber)
        && String(row.policyNumber).trim().toUpperCase() === String(candidate.policyNumber).trim().toUpperCase();
    });
    if (matchIndex < 0 && recovery[index] && !used.has(index)) matchIndex = index;
    if (matchIndex < 0) matchIndex = recovery.findIndex((_candidate, candidateIndex) => !used.has(candidateIndex));
    if (matchIndex >= 0) used.add(matchIndex);
    return mergeSemanticCandidates(row, matchIndex >= 0 ? recovery[matchIndex] : {});
  });

  recovery.forEach((row, index) => {
    if (!used.has(index)) merged.push(mergeSemanticCandidates({}, row));
  });
  return merged;
}

export function finalizeSemanticCandidates(rows = []) {
  return safeArray(rows).map(row => mergeSemanticCandidates(row, {}));
}
