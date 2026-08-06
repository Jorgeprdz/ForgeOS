"use strict";

(function eligibleDateEvaluatorModule(root, factory) {
  const contract = typeof module !== "undefined" && module.exports
    ? require("./operational-calendar-contract")
    : root.ForgeOperationalCalendarContractV1;
  const api = factory(contract);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeEligibleDateEvaluatorV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function eligibleDateEvaluatorFactory(contract) {
  if (!contract) throw new Error("OPCAL_CONTRACT_REQUIRED");
  const freeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  };
  const weekdayMap = Object.freeze(["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]);
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  function localDates(from, to) {
    if (!datePattern.test(from) || !datePattern.test(to) || from > to) throw new TypeError("OPCAL_PERIOD_INVALID");
    const dates = [];
    const cursor = new Date(`${from}T12:00:00.000Z`);
    const end = new Date(`${to}T12:00:00.000Z`);
    while (cursor <= end) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dates;
  }

  function overlaps(date, period) {
    return period.from <= date && (period.to === null || period.to >= date);
  }

  function activeRecords(records) {
    return contract.activeCanonicalRecords(records);
  }

  function evaluateEligibleDates(input = {}) {
    const { tenantId, advisorId, period, advisorProfiles = [], organizationProfiles = [], overrides = [], timeOff = [], freshness = "CURRENT", permission = "GRANTED", session = "AUTHENTICATED" } = input;
    if (session !== "AUTHENTICATED") return freeze({ state: "SESSION_REQUIRED", tenantId: null, advisorId: null, timezone: null, period: null, dates: [], eligibleDayCount: 0, excludedDayCount: 0, unknownDayCount: 0, sourceRefs: [], warnings: ["session_required"] });
    if (permission !== "GRANTED") return freeze({ state: "NO_PERMISSION", tenantId, advisorId, timezone: null, period: null, dates: [], eligibleDayCount: 0, excludedDayCount: 0, unknownDayCount: 0, sourceRefs: [], warnings: ["no_permission"] });

    const datePeriod = contract.validateEffectivePeriod(period, "OPCAL_PERIOD_INVALID");
    if (datePeriod.to === null) throw new TypeError("OPCAL_PERIOD_END_REQUIRED");
    const timezoneResolution = contract.resolveTimezone({ advisorProfiles, organizationProfiles, tenantId, advisorId, asOfDate: datePeriod.to });
    if (timezoneResolution.state !== "READY") return freeze({ state: timezoneResolution.state, tenantId, advisorId, timezone: null, period: datePeriod, dates: [], eligibleDayCount: 0, excludedDayCount: 0, unknownDayCount: localDates(datePeriod.from, datePeriod.to).length, sourceRefs: [], warnings: timezoneResolution.warnings });

    const profile = timezoneResolution.profile;
    if (!profile || !Array.isArray(profile.workingWeekdays) || profile.workingWeekdays.length === 0) {
      return freeze({ state: "UNKNOWN_SCHEDULE", tenantId, advisorId, timezone: timezoneResolution.timezone, period: datePeriod, dates: [], eligibleDayCount: 0, excludedDayCount: 0, unknownDayCount: localDates(datePeriod.from, datePeriod.to).length, sourceRefs: [], warnings: ["schedule_unresolved"] });
    }

    const validOverrides = activeRecords(overrides.map(contract.validateOverride)).filter((record) =>
      record.tenantId === tenantId &&
      (record.advisorId === null || record.advisorId === advisorId) &&
      (record.status === "CONFIRMED" || record.status === "CORRECTED")
    );
    const validTimeOff = activeRecords(timeOff.map(contract.validateTimeOff)).filter((record) =>
      record.tenantId === tenantId &&
      record.advisorId === advisorId &&
      (record.status === "CONFIRMED" || record.status === "CORRECTED") &&
      record.confirmationState === "CONFIRMED"
    );
    const sourceRefs = new Set([profile.source.reference]);
    const dates = localDates(datePeriod.from, datePeriod.to).map((localDate) => {
      const weekday = weekdayMap[new Date(`${localDate}T12:00:00.000Z`).getUTCDay()];
      const dayOverrides = validOverrides.filter((record) => record.localDate === localDate);
      const conflict = dayOverrides.some((record) => ["WORKING_OVERRIDE"].includes(record.overrideType)) &&
        dayOverrides.some((record) => ["HOLIDAY","ORGANIZATION_CLOSED","NON_WORKING_OVERRIDE"].includes(record.overrideType));
      if (conflict) {
        dayOverrides.forEach((record) => sourceRefs.add(record.source.reference));
        return freeze({ localDate, eligible: null, reasonCode: "CONFLICTING_OVERRIDE", sourceRefs: dayOverrides.map((record) => record.source.reference), scheduleVersion: profile.profileId, timeOffReference: null, freshness, evidenceState: "CONFLICTING" });
      }
      const workingOverride = dayOverrides.find((record) => record.overrideType === "WORKING_OVERRIDE");
      const closedOverride = dayOverrides.find((record) => ["HOLIDAY","ORGANIZATION_CLOSED","NON_WORKING_OVERRIDE"].includes(record.overrideType));
      const timeOffRecord = validTimeOff.find((record) => overlaps(localDate, record.effectivePeriod));
      dayOverrides.forEach((record) => sourceRefs.add(record.source.reference));
      if (timeOffRecord) sourceRefs.add(timeOffRecord.source.reference);
      if (timeOffRecord) return freeze({ localDate, eligible: false, reasonCode: "ADVISOR_TIME_OFF", sourceRefs: [profile.source.reference, timeOffRecord.source.reference], scheduleVersion: profile.profileId, timeOffReference: timeOffRecord.recordId, freshness, evidenceState: timeOffRecord.source.evidenceState });
      if (workingOverride) return freeze({ localDate, eligible: true, reasonCode: "WORKING_OVERRIDE", sourceRefs: [profile.source.reference, workingOverride.source.reference], scheduleVersion: profile.profileId, timeOffReference: null, freshness, evidenceState: workingOverride.source.evidenceState });
      if (closedOverride) return freeze({ localDate, eligible: false, reasonCode: closedOverride.overrideType, sourceRefs: [profile.source.reference, closedOverride.source.reference], scheduleVersion: profile.profileId, timeOffReference: null, freshness, evidenceState: closedOverride.source.evidenceState });
      const scheduled = profile.workingWeekdays.includes(weekday);
      return freeze({ localDate, eligible: scheduled, reasonCode: scheduled ? "WORKING_WEEKDAY" : "NON_WORKING_WEEKDAY", sourceRefs: [profile.source.reference], scheduleVersion: profile.profileId, timeOffReference: null, freshness, evidenceState: profile.source.evidenceState });
    });

    const unknownDayCount = dates.filter((entry) => entry.eligible === null).length;
    const stale = freshness === "STALE";
    return freeze({
      state: unknownDayCount > 0 ? "CONFLICTING" : stale ? "STALE" : "READY",
      tenantId, advisorId, timezone: timezoneResolution.timezone,
      period: freeze({ ...datePeriod, timezone: timezoneResolution.timezone }),
      dates,
      eligibleDayCount: dates.filter((entry) => entry.eligible === true).length,
      excludedDayCount: dates.filter((entry) => entry.eligible === false).length,
      unknownDayCount,
      sourceRefs: [...sourceRefs],
      warnings: [...timezoneResolution.warnings, ...(stale ? ["calendar_sources_stale"] : [])],
    });
  }

  return freeze({ evaluateEligibleDates });
});
