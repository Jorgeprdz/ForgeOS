function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function adaptPartnerSpreadsheetMonthlyFact(row = {}) {
  return {
    month: row.month ?? null,
    initialCommissions: {
      vidaIndividual: numberOrNull(row.amount),
      gmmiIndividual: 0,
      otherRamos: 0,
    },
    paidPolicies: {
      vidaIndividual: numberOrNull(row.policies),
      gmmiIndividual: 0,
    },
  };
}

export function adaptPartnerSpreadsheetMonthlyFacts(rows = []) {
  return Array.isArray(rows)
    ? rows.map((row) => adaptPartnerSpreadsheetMonthlyFact(row))
    : [];
}
