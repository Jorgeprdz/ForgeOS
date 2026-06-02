const DEFAULT_UNIVERSITIES = [
  { name: "Tec de Monterrey", currentCostMXN: 1800000 },
  { name: "Universidad Anáhuac", currentCostMXN: 1500000 },
  { name: "Universidad Iberoamericana", currentCostMXN: 1450000 },
  { name: "Universidad Panamericana", currentCostMXN: 1400000 },
  { name: "ITAM", currentCostMXN: 1300000 },
  { name: "UDLAP", currentCostMXN: 1250000 },
  { name: "Universidad La Salle", currentCostMXN: 1100000 },
  { name: "UVM", currentCostMXN: 950000 },
  { name: "Tecmilenio", currentCostMXN: 850000 },
  { name: "Universidad de Monterrey", currentCostMXN: 1450000 }
];

function projectEducationCost({
  currentCostMXN,
  years,
  annualEducationInflation = 0.07
}) {
  return currentCostMXN * Math.pow(1 + annualEducationInflation, years);
}

function buildEducationCostComparison({
  universities = DEFAULT_UNIVERSITIES,
  yearsUntilCollege,
  projectedCapitalMXN,
  annualEducationInflation = 0.07
}) {
  return universities.map(u => {
    const futureCostMXN = projectEducationCost({
      currentCostMXN: u.currentCostMXN,
      years: yearsUntilCollege,
      annualEducationInflation
    });

    const coveragePercent =
      futureCostMXN > 0
        ? (projectedCapitalMXN / futureCostMXN) * 100
        : 0;

    return {
      university: u.name,
      currentCostMXN: u.currentCostMXN,
      futureCostMXN,
      projectedCapitalMXN,
      coveragePercent,
      status:
        coveragePercent >= 100
          ? "COVERS_FULLY"
          : coveragePercent >= 70
          ? "COVERS_MOST"
          : "PARTIAL_COVERAGE"
    };
  });
}

module.exports = {
  DEFAULT_UNIVERSITIES,
  projectEducationCost,
  buildEducationCostComparison
};
