function buildGuaranteedValueTimeline({ rows = [] }) {
  return rows.map(row => ({
    year: row.policyYear,
    age: row.realAge,
    annualPremiumUDI: row.annualPremiumUDI,
    avePremiumUDI: row.avePremiumUDI,
    totalAnnualOutflowUDI: row.annualPremiumUDI + row.avePremiumUDI,
    cashValueUDI: row.cashValueUDI
  }));
}

function getMilestone(timeline, year) {
  return timeline.find(row => row.year === year) || null;
}

module.exports = {
  buildGuaranteedValueTimeline,
  getMilestone
};
