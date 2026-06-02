const DEFAULT_SCENARIOS = {
  CONSERVATIVE: 0.03,
  ADVISOR_45: 0.045,
  AGGRESSIVE: 0.06
};

function getProjectionScenario({ mode = "ADVISOR_45", customRate = null }) {
  if (mode === "CUSTOM") {
    if (customRate === null || customRate === undefined) {
      throw new Error("Missing customRate for CUSTOM scenario");
    }

    return {
      mode,
      annualGrowthRate: customRate,
      source: "CUSTOM_USER_ASSUMPTION"
    };
  }

  const annualGrowthRate = DEFAULT_SCENARIOS[mode];

  if (annualGrowthRate === undefined) {
    throw new Error(`Unsupported projection scenario: ${mode}`);
  }

  return {
    mode,
    annualGrowthRate,
    source: mode === "ADVISOR_45"
      ? "ADVISOR_STANDARD_ASSUMPTION"
      : "FORGE_DEFAULT_SCENARIO"
  };
}

function buildScenarioSet() {
  return [
    getProjectionScenario({ mode: "CONSERVATIVE" }),
    getProjectionScenario({ mode: "ADVISOR_45" }),
    getProjectionScenario({ mode: "AGGRESSIVE" })
  ];
}

module.exports = {
  DEFAULT_SCENARIOS,
  getProjectionScenario,
  buildScenarioSet
};
