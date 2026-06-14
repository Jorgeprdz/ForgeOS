function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function scoreAge(age, strengths, risks) {
  if (!hasValue(age) || Number.isNaN(Number(age))) {
    risks.push("Age is missing.");
    return 45;
  }

  const numericAge = Number(age);
  if (numericAge >= 25 && numericAge <= 55) {
    strengths.push("Age is within a commercially productive range.");
    return 85;
  }

  if (numericAge >= 21 && numericAge <= 64) {
    strengths.push("Age is workable with manager review.");
    return 65;
  }

  risks.push("Age may require additional manager review.");
  return 40;
}

function scoreMarriage(input, strengths, risks) {
  const marriage = input.marriage || input.maritalStatus;
  if (!hasValue(marriage)) {
    risks.push("Marriage or household context is missing.");
    return 55;
  }

  strengths.push("Household context is documented.");
  return 75;
}

function scoreYearsLivingInTown(yearsLivingInTown, strengths, risks) {
  if (!hasValue(yearsLivingInTown) || Number.isNaN(Number(yearsLivingInTown))) {
    risks.push("Years living in town is missing.");
    return 45;
  }

  const years = Number(yearsLivingInTown);
  if (years >= 5) {
    strengths.push("Strong local roots support trust and referral access.");
    return 90;
  }

  if (years >= 2) {
    strengths.push("Local roots are present.");
    return 70;
  }

  risks.push("Limited local roots may reduce warm-market access.");
  return 45;
}

function scoreCareer(career, strengths, risks) {
  if (!hasValue(career)) {
    risks.push("Career history is missing.");
    return 45;
  }

  const text = normalizeText(career);
  const commercialSignals = [
    "sales",
    "commercial",
    "business",
    "entrepreneur",
    "owner",
    "manager",
    "account",
    "advisor",
    "consultant",
    "real estate"
  ];

  if (commercialSignals.some(signal => text.includes(signal))) {
    strengths.push("Career history shows commercial exposure.");
    return 85;
  }

  strengths.push("Career history is documented.");
  return 65;
}

function scoreEmploymentStatus(employmentStatus, strengths, risks) {
  if (!hasValue(employmentStatus)) {
    risks.push("Employment status is missing.");
    return 45;
  }

  const text = normalizeText(employmentStatus);
  const stableSignals = ["employed", "self", "owner", "business", "active", "independent"];
  const riskSignals = ["unemployed", "inactive", "unstable", "unknown"];

  if (riskSignals.some(signal => text.includes(signal))) {
    risks.push("Employment status may signal instability.");
    return 40;
  }

  if (stableSignals.some(signal => text.includes(signal))) {
    strengths.push("Employment status shows current activity.");
    return 80;
  }

  strengths.push("Employment status is documented.");
  return 60;
}

function recommendationFromScore(score, risks) {
  if (score >= 75 && risks.length <= 1) return "ADVANCE";
  if (score >= 60) return "WATCH";
  if (score >= 45) return "COACH";
  return "REJECT";
}

function evaluateCandidateHardFactors(input = {}) {
  const factors = input.hardFactors || input;
  const strengths = [];
  const risks = [];

  const scores = [
    scoreAge(factors.age, strengths, risks),
    scoreMarriage(factors, strengths, risks),
    scoreYearsLivingInTown(factors.yearsLivingInTown, strengths, risks),
    scoreCareer(factors.career, strengths, risks),
    scoreEmploymentStatus(factors.employmentStatus, strengths, risks)
  ];

  const score = clampScore(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  return {
    score,
    strengths,
    risks,
    recommendation: recommendationFromScore(score, risks)
  };
}

module.exports = {
  evaluateCandidateHardFactors
};
