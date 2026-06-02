const {
  buildEducationCostComparison
} = require("./shared-education-cost-engine");

function buildSeguBecaEducationComparison({
  childAge,
  projectedCapitalMXN,
  annualEducationInflation = 0.07
}) {
  const yearsUntilCollege = 18 - childAge;

  const comparison = buildEducationCostComparison({
    yearsUntilCollege,
    projectedCapitalMXN,
    annualEducationInflation
  });

  return {
    childAge,
    yearsUntilCollege,
    projectedCapitalMXN,
    annualEducationInflation,
    comparison
  };
}

module.exports = {
  buildSeguBecaEducationComparison
};
