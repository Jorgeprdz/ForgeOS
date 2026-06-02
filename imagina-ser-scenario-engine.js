function normalizeScenarios(scenarios = {}) {
  return Object.entries(scenarios).map(([name, data]) => ({
    scenario: name,
    singlePaymentUDI: data.singlePaymentUDI,
    monthlyIncomeUDI: data.monthlyIncomeUDI
  }));
}

function chooseDefaultScenario(scenarios = {}) {
  return scenarios.BASE || null;
}

module.exports = {
  normalizeScenarios,
  chooseDefaultScenario
};
