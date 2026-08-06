"use strict";

(function activityCoachingPolicyModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeActivityCoachingPolicyV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function activityCoachingPolicyFactory() {
  const POLICY_ID = "FORGE_ACTIVITY_COACHING_POLICY_V1";
  const READY = "READY";
  const UNAVAILABLE = "UNAVAILABLE_OR_CONFLICTING";
  const REQUIRED_FIELDS = Object.freeze([
    "policyId", "version", "owner", "effectiveFrom", "effectiveTo", "status",
    "source", "thresholds", "evidenceRequirements", "priorityRules",
    "allowedUses", "prohibitedUses",
  ]);

  const freeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  };

  function invalid(reason, details = null) {
    return freeze({
      state: UNAVAILABLE,
      policySnapshot: null,
      policySnapshotId: null,
      reasons: [reason],
      details,
    });
  }

  function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }

  function validateSnapshot(snapshot, { asOf = new Date().toISOString() } = {}) {
    if (!isRecord(snapshot)) return invalid("POLICY_SNAPSHOT_MISSING");
    const missing = REQUIRED_FIELDS.filter((field) => !Object.prototype.hasOwnProperty.call(snapshot, field));
    if (missing.length) return invalid("POLICY_SNAPSHOT_FIELDS_MISSING", { missing });
    if (snapshot.policyId !== POLICY_ID) return invalid("POLICY_ID_INVALID");
    if (snapshot.status !== "ACTIVE") return invalid("POLICY_STATUS_NOT_ACTIVE");
    if (!isRecord(snapshot.source) || !isRecord(snapshot.thresholds) || !isRecord(snapshot.evidenceRequirements)) {
      return invalid("POLICY_STRUCTURES_INVALID");
    }
    if (!Array.isArray(snapshot.priorityRules) || !Array.isArray(snapshot.allowedUses) || !Array.isArray(snapshot.prohibitedUses)) {
      return invalid("POLICY_COLLECTIONS_INVALID");
    }
    if (!snapshot.priorityRules.every((rule) => isRecord(rule) && typeof rule.tipType === "string" && Number.isFinite(rule.priority))) {
      return invalid("POLICY_PRIORITY_RULES_INVALID");
    }
    const effectiveFrom = Date.parse(snapshot.effectiveFrom);
    const effectiveTo = snapshot.effectiveTo === null ? null : Date.parse(snapshot.effectiveTo);
    const instant = Date.parse(asOf);
    if (![effectiveFrom, instant].every(Number.isFinite) || (effectiveTo !== null && !Number.isFinite(effectiveTo))) {
      return invalid("POLICY_EFFECTIVE_PERIOD_INVALID");
    }
    if (instant < effectiveFrom || (effectiveTo !== null && instant > effectiveTo)) {
      return invalid("POLICY_SNAPSHOT_EXPIRED_OR_NOT_EFFECTIVE");
    }
    const thresholds = snapshot.thresholds;
    const positive = thresholds.positiveStreak;
    const drought = thresholds.appointmentDrought;
    if (!isRecord(thresholds.dailyGoalGap) || thresholds.dailyGoalGap.enabled !== true || !thresholds.dailyGoalGap.goalSource) {
      return invalid("POLICY_DAILY_GOAL_THRESHOLD_INVALID");
    }
    if (!isRecord(positive) || !Number.isInteger(positive.consecutiveEligibleDays) || positive.consecutiveEligibleDays < 1 || !Number.isFinite(positive.strictlyGreaterThanPoints)) {
      return invalid("POLICY_STREAK_THRESHOLD_INVALID");
    }
    if (!isRecord(drought) || !Number.isInteger(drought.completedEligibleWeeks) || drought.completedEligibleWeeks < 1) {
      return invalid("POLICY_DROUGHT_THRESHOLD_INVALID");
    }
    if (!Number.isInteger(thresholds.maxVisibleTips) || thresholds.maxVisibleTips < 1) {
      return invalid("POLICY_VISIBLE_TIP_LIMIT_INVALID");
    }
    const policySnapshotId = `${snapshot.policyId}@${snapshot.version}`;
    return freeze({ state: READY, policySnapshot: structuredClone(snapshot), policySnapshotId, reasons: [] });
  }

  function resolvePolicySnapshot(snapshots, options = {}) {
    const list = Array.isArray(snapshots) ? snapshots : snapshots ? [snapshots] : [];
    const valid = list.map((snapshot) => validateSnapshot(snapshot, options)).filter((result) => result.state === READY);
    if (valid.length !== 1) return invalid(valid.length === 0 ? "NO_VALID_POLICY_SNAPSHOT" : "CONFLICTING_POLICY_SNAPSHOTS");
    return valid[0];
  }

  return freeze({ POLICY_ID, READY, UNAVAILABLE, REQUIRED_FIELDS, validateSnapshot, resolvePolicySnapshot });
});
