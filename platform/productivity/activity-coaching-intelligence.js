"use strict";

(function activityCoachingIntelligenceModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeActivityCoachingIntelligenceV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function activityCoachingIntelligenceFactory() {
  const freeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  };
  const refs = (values) => [...new Set((values || []).filter(Boolean))];

  function tip({ tipType, observedValue, targetValue, period, reasonCode, whyNowCode, evidenceRefs, uncertainty, combinationCandidates, policySnapshotId }) {
    return freeze({
      tipType,
      observedValue,
      targetValue,
      period: period || null,
      reasonWhy: freeze({ code: reasonCode }),
      whyNow: freeze({ code: whyNowCode }),
      evidenceRefs: refs(evidenceRefs),
      uncertainty: uncertainty || freeze({ state: "NONE", limitations: [] }),
      combinationCandidates: combinationCandidates || [],
      policySnapshotId,
    });
  }

  function priorityOf(policy, tipType) {
    return policy.priorityRules.find((rule) => rule.tipType === tipType)?.priority;
  }

  function generateActivityTips(input = {}) {
    const resolution = input.policyResolution;
    if (!resolution || resolution.state !== "READY" || !resolution.policySnapshot) {
      return freeze({ coachingPolicyState: "UNAVAILABLE_OR_CONFLICTING", tipsState: "NOT_GENERATED", policySnapshotId: null, tips: [] });
    }
    const policy = resolution.policySnapshot;
    const candidates = [];
    const points = input.points;
    if (points?.state === "READY" && Number.isFinite(points.remaining) && points.remaining > 0) {
      candidates.push(tip({
        tipType: "DAILY_GOAL_GAP",
        observedValue: points.total,
        targetValue: points.objective,
        period: points.period,
        reasonCode: "POINTS_REMAINING_OBSERVED",
        whyNowCode: "CURRENT_ELIGIBLE_PERIOD_OPEN",
        evidenceRefs: points.sourceRefs,
        uncertainty: { state: "BOUNDED", limitations: points.warnings || [] },
        combinationCandidates: input.pointCombinations || [],
        policySnapshotId: resolution.policySnapshotId,
      }));
    }

    const streakRule = policy.thresholds.positiveStreak;
    const daily = Array.isArray(input.dailyPoints) ? input.dailyPoints : [];
    const eligible = daily.filter((entry) => entry.eligible === true);
    const recent = eligible.slice(-streakRule.consecutiveEligibleDays);
    const streakEvidenceReady = recent.length === streakRule.consecutiveEligibleDays && recent.every((entry) => entry.state === "CONFIRMED" && Number.isFinite(entry.points));
    if (streakEvidenceReady && recent.every((entry) => entry.points > streakRule.strictlyGreaterThanPoints)) {
      candidates.push(tip({
        tipType: "POSITIVE_STREAK",
        observedValue: recent.map((entry) => ({ localDate: entry.localDate, points: entry.points })),
        targetValue: { consecutiveEligibleDays: streakRule.consecutiveEligibleDays, strictlyGreaterThanPoints: streakRule.strictlyGreaterThanPoints },
        period: input.calendar?.period || null,
        reasonCode: "ELIGIBLE_DAY_SEQUENCE_CONFIRMED",
        whyNowCode: "STREAK_THRESHOLD_REACHED",
        evidenceRefs: recent.flatMap((entry) => entry.sourceRefs || []),
        uncertainty: { state: "BOUNDED", limitations: [] },
        combinationCandidates: [],
        policySnapshotId: resolution.policySnapshotId,
      }));
    }

    const droughtRule = policy.thresholds.appointmentDrought;
    const scheduling = input.scheduling;
    if (scheduling?.state === "CONFIRMED" && scheduling.completedEligibleWeeks >= droughtRule.completedEligibleWeeks && scheduling.newScheduledAppointments === 0) {
      candidates.push(tip({
        tipType: "APPOINTMENT_DROUGHT",
        observedValue: scheduling.newScheduledAppointments,
        targetValue: { completedEligibleWeeks: droughtRule.completedEligibleWeeks },
        period: scheduling.period,
        reasonCode: "NO_CONFIRMED_NEW_SCHEDULED_APPOINTMENTS",
        whyNowCode: "ELIGIBLE_WEEK_COMPLETED",
        evidenceRefs: scheduling.sourceRefs,
        uncertainty: { state: "BOUNDED", limitations: scheduling.warnings || [] },
        combinationCandidates: [],
        policySnapshotId: resolution.policySnapshotId,
      }));
    }

    for (const conversion of input.conversions || []) {
      if (!["CONFIRMED", "NO_BASE", "INCOMPLETE", "CONFLICTING", "STALE"].includes(conversion.metricState)) continue;
      candidates.push(tip({
        tipType: "CONVERSION_OBSERVATION",
        observedValue: conversion.percentage,
        targetValue: null,
        period: input.calendar?.period || null,
        reasonCode: `CONVERSION_${conversion.metricState}`,
        whyNowCode: "PRODUCTIVITY_CONVERSION_REFRESHED",
        evidenceRefs: conversion.sourceRefs,
        uncertainty: { state: conversion.metricState, limitations: conversion.warnings || [] },
        combinationCandidates: [],
        policySnapshotId: resolution.policySnapshotId,
      }));
    }

    const ordered = candidates
      .map((entry) => ({ entry, priority: priorityOf(policy, entry.tipType) }))
      .filter(({ priority }) => Number.isFinite(priority))
      .sort((left, right) => right.priority - left.priority)
      .slice(0, policy.thresholds.maxVisibleTips)
      .map(({ entry }) => entry);

    return freeze({ coachingPolicyState: "READY", tipsState: ordered.length ? "GENERATED" : "NO_ELIGIBLE_TIPS", policySnapshotId: resolution.policySnapshotId, tips: ordered });
  }

  return freeze({ generateActivityTips });
});
