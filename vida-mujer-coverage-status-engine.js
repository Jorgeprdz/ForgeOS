function buildCoverageStatus({
  contractedCoverages = [],
  recommendedCoverages = []
}) {
  const result = {};

  contractedCoverages.forEach((coverage) => {
    result[coverage] = {
      status: "CONTRACTED"
    };
  });

  recommendedCoverages.forEach((coverage) => {
    if (!result[coverage]) {
      result[coverage] = {
        status: "RECOMMENDED"
      };
    }
  });

  return result;
}

module.exports = {
  buildCoverageStatus
};
