function buildDecisionAppendix({
  executiveSummary,
  timeline,
  scenarios,
  recovery,
  objections
}) {
  return {
    executiveSummary,
    timeline,
    scenarios,
    recovery,
    objections,
    generatedBy:
      "FORGE_DECISION_APPENDIX_ENGINE"
  };
}

module.exports = {
  buildDecisionAppendix
};
