function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function getConcept(rulePack, conceptKey) {
  return rulePack?.concepts?.[conceptKey] || null;
}

export function resolveBandRate({ bands = [], value = null, classKey = null } = {}) {
  if (!hasNumber(value)) {
    return {
      rate: null,
      band: null,
      blockedReasons: ['blocked_by_missing_band_value'],
      missingInputs: ['value'],
    };
  }

  const numericValue = Number(value);
  const band = bands.find((row) => (
    numericValue >= Number(row.minAverageMonthlyInitialCommissions) &&
    (row.maxAverageMonthlyInitialCommissions === null || numericValue <= Number(row.maxAverageMonthlyInitialCommissions))
  )) || null;

  if (!band) return { rate: null, band: null, blockedReasons: ['blocked_by_missing_productivity_band'], missingInputs: [] };
  if (!classKey) return { rate: null, band, blockedReasons: ['blocked_by_missing_partner_class'], missingInputs: ['partnerClass'] };

  const rate = band.rates?.[classKey];
  if (!hasNumber(rate)) return { rate: null, band, blockedReasons: ['blocked_by_missing_productivity_rate_for_class'], missingInputs: ['partnerClass'] };

  return { rate: Number(rate), band, blockedReasons: [], missingInputs: [] };
}

export function resolveThresholdScale({
  scale = [],
  value = null,
  valueKey,
  resultKey,
  floorMode = true,
} = {}) {
  if (!hasNumber(value)) return { value: null, row: null, blockedReasons: ['blocked_by_missing_scale_value'], missingInputs: ['value'] };
  const numericValue = Number(value);
  const rows = floorMode
    ? scale.filter((row) => hasNumber(row[valueKey]) && numericValue >= Number(row[valueKey])).sort((a, b) => Number(b[valueKey]) - Number(a[valueKey]))
    : scale.filter((row) => hasNumber(row[valueKey]) && numericValue === Number(row[valueKey]));
  const row = rows[0] || null;
  if (!row || !hasNumber(row[resultKey])) return { value: null, row: null, blockedReasons: ['blocked_by_missing_scale_rate'], missingInputs: [] };
  return { value: Number(row[resultKey]), row, blockedReasons: [], missingInputs: [] };
}

export function resolveExactOrPlusScale({
  scale = [],
  value = null,
  field,
  resultKey,
  extraMatch = () => true,
} = {}) {
  if (!hasNumber(value)) return { value: null, row: null, blockedReasons: ['blocked_by_missing_scale_value'], missingInputs: ['value'] };
  const numericValue = Number(value);
  const row = scale.find((item) => {
    const itemValue = item[field];
    const countMatches = itemValue === numericValue ||
      (typeof itemValue === 'string' && itemValue.endsWith('+') && numericValue >= Number(itemValue.replace('+', '')));
    return countMatches && extraMatch(item);
  }) || null;
  if (!row || !hasNumber(row[resultKey])) return { value: null, row: null, blockedReasons: ['blocked_by_missing_scale_match'], missingInputs: [] };
  return { value: Number(row[resultKey]), row, blockedReasons: [], missingInputs: [] };
}

export function deriveSemesterIndexFromCareerMonth({ careerMonth, monthsPerSemester = 6 } = {}) {
  if (!hasNumber(careerMonth) || !hasNumber(monthsPerSemester) || Number(monthsPerSemester) <= 0) return null;
  return Math.ceil(Number(careerMonth) / Number(monthsPerSemester));
}

export function resolveSemesterAmount({ supportAmountsBySemester = [], semesterIndex = null } = {}) {
  if (!hasNumber(semesterIndex)) return { amount: null, row: null, blockedReasons: ['invalid_semester_index'], missingInputs: ['semesterIndex'] };
  const row = supportAmountsBySemester.find((item) => Number(item.semester) === Number(semesterIndex)) || null;
  if (!row || !hasNumber(row.amount)) return { amount: null, row: null, blockedReasons: ['invalid_semester_index'], missingInputs: [] };
  return { amount: Number(row.amount), row, blockedReasons: [], missingInputs: [] };
}

export function requireFields({ input = {}, requiredFields = [] } = {}) {
  return requiredFields.filter((field) => input[field] === null || input[field] === undefined || input[field] === '');
}

export function buildBlockedResult({ conceptKey = 'unknown', blockedReasons = [], missingInputs = [], warnings = [] } = {}) {
  return {
    conceptKey,
    status: 'blocked',
    candidateAmount: null,
    rate: null,
    payoutTruth: false,
    blockedReasons: [...blockedReasons],
    missingInputs: [...missingInputs],
    warnings: [...warnings],
  };
}
