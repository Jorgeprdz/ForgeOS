function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function readBoolean(source, key) {
  return source[key] === true;
}

function coachabilityLevelFromScore(score) {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "LOW";
  return "CRITICAL";
}

function recommendationFromScore(score) {
  if (score >= 78) return "ADVANCE";
  if (score >= 60) return "WATCH";
  if (score >= 40) return "COACH";
  return "REJECT";
}

function evaluateCandidateCoachability(input = {}) {
  const signals = input.coachabilitySignals || input.coachability || input;
  const strengths = [];
  const risks = [];

  const positiveSignals = [
    ["completesAssignments", "Completes assignments."],
    ["followsProcess", "Follows the process."],
    ["attendsInterviews", "Attends interviews consistently."],
    ["memorizesScripts", "Memorizes scripts and core language."],
    ["acceptsFeedback", "Accepts feedback."]
  ];

  const negativeSignals = [
    ["missesInterviews", "Misses interviews."],
    ["ignoresInstructions", "Ignores instructions."],
    ["wantsOwnSystem", "Wants to replace the system before learning it."],
    ["incompleteTasks", "Leaves assigned tasks incomplete."]
  ];

  let score = 50;

  positiveSignals.forEach(([key, label]) => {
    if (readBoolean(signals, key)) {
      strengths.push(label);
      score += 10;
    }
  });

  negativeSignals.forEach(([key, label]) => {
    if (readBoolean(signals, key)) {
      risks.push(label);
      score -= key === "wantsOwnSystem" || key === "ignoresInstructions" ? 18 : 14;
    }
  });

  const observedSignals = positiveSignals.concat(negativeSignals).filter(([key]) => signals[key] !== undefined);
  if (observedSignals.length === 0) {
    risks.push("Coachability signals are missing.");
    score = 45;
  }

  score = clampScore(score);

  return {
    score,
    coachabilityLevel: coachabilityLevelFromScore(score),
    strengths,
    risks,
    recommendation: recommendationFromScore(score)
  };
}

module.exports = {
  evaluateCandidateCoachability
};
