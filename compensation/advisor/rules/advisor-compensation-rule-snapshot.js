"use strict";

const crypto = require("crypto");

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function stableNormalize(value) {
  if (Array.isArray(value)) return value.map(stableNormalize);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((accumulator, key) => {
    accumulator[key] = stableNormalize(value[key]);
    return accumulator;
  }, {});
}

function stableStringify(value) {
  return JSON.stringify(stableNormalize(value));
}

function calculateAdvisorCompensationRulePackDigest(rulePack) {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(rulePack)).digest("hex")}`;
}

function createAdvisorCompensationRuleSnapshot(rulePack, options = {}) {
  const pack = deepClone(rulePack);
  const metadata = pack.metadata || {};
  const digest = calculateAdvisorCompensationRulePackDigest(pack);
  const governanceStatus = metadata.governanceStatus || null;
  const sourceState = metadata.sourceState || null;
  const officialSourceTruth =
    governanceStatus === "official" &&
    sourceState === "OFFICIAL_CARRIER_SOURCE_TRUTH" &&
    /^sha256:[a-f0-9]{64}$/i.test(metadata.rulePackHash || "");

  return deepFreeze({
    snapshotVersion: "ADVISOR_COMPENSATION_RULE_SNAPSHOT_001",
    rulePackId: metadata.rulePackId || null,
    rulePackVersion: metadata.rulePackVersion || null,
    governanceStatus,
    sourceState,
    effectiveFrom: metadata.effectiveFrom || null,
    effectiveTo: metadata.effectiveTo || null,
    sourceEvidenceRefs: Array.isArray(metadata.sourceEvidenceRefs)
      ? [...metadata.sourceEvidenceRefs]
      : [],
    calculatedDigest: digest,
    declaredRulePackHash: metadata.rulePackHash || null,
    capturedAt: options.capturedAt || new Date().toISOString(),
    officialSourceTruth,
    candidateOnly: !officialSourceTruth,
    payoutTruth: false,
    mutationAuthorized: false,
    rulePack: pack
  });
}

module.exports = {
  stableStringify,
  calculateAdvisorCompensationRulePackDigest,
  createAdvisorCompensationRuleSnapshot
};
