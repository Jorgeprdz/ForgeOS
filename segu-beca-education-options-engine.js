const {
  buildEducationPathsComparison
} = require("./shared-education-paths-engine");

function buildSeguBecaEducationOptions({
  childAge,
  projectedCapitalMXN,
  educationInflation = 0.07
}) {
  const yearsUntilCollege = 18 - childAge;

  const paths = buildEducationPathsComparison({
    projectedCapitalMXN,
    yearsUntilCollege,
    educationInflation
  });

  return {
    childAge,
    yearsUntilCollege,
    projectedCapitalMXN,
    educationInflation,
    freedomScore: paths.freedomScore,
    publicOptions: paths.publicComparison,
    privateMidOptions: paths.privateMidComparison,
    privatePremiumOptions: paths.privatePremiumComparison,
    message:
      "SeguBeca no solo compra una universidad. Compra opciones para que tu hijo pueda elegir."
  };
}

module.exports = {
  buildSeguBecaEducationOptions
};
