function classifyInferenceConfidence(confidence) {
  if (confidence === null || confidence === undefined) {
    return {
      level: "NOT_APPLICABLE",
      status: "ACTIVE"
    };
  }

  if (confidence >= 0.85) {
    return {
      level: "HIGH_CONFIDENCE",
      status: "ACTIVE"
    };
  }

  if (confidence >= 0.70) {
    return {
      level: "MEDIUM_CONFIDENCE",
      status: "ACTIVE_MEDIUM_CONFIDENCE"
    };
  }

  return {
    level: "LOW_CONFIDENCE",
    status: "ACTIVE_LOW_CONFIDENCE"
  };
}

module.exports = {
  classifyInferenceConfidence
};
