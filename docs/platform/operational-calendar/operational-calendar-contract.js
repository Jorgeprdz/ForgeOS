"use strict";

(function operationalCalendarContractModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeOperationalCalendarContractV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function operationalCalendarContractFactory() {
  const SCHEMA_VERSION = "forge.operational_calendar.v1";
  const OWNER = "OPERATIONAL_CALENDAR";
  const WEEKDAYS = Object.freeze(["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]);
  const PROFILE_STATUSES = Object.freeze(["ACTIVE","SUPERSEDED","CANCELLED"]);
  const OVERRIDE_TYPES = Object.freeze(["HOLIDAY","ORGANIZATION_CLOSED","WORKING_OVERRIDE","NON_WORKING_OVERRIDE"]);
  const TIME_OFF_STATUSES = Object.freeze(["CONFIRMED","CANCELLED","CORRECTED"]);
  const EVIDENCE_STATES = Object.freeze(["CONFIRMED","OBSERVED","PROVISIONAL","INCOMPLETE","UNKNOWN","CONFLICTING","STALE","NO_PERMISSION"]);
  const RESULT_STATES = Object.freeze(["READY","PARTIAL","UNKNOWN_TIMEZONE","UNKNOWN_SCHEDULE","CONFLICTING","STALE","NO_PERMISSION","SESSION_REQUIRED"]);

  const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const freeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  };
  const present = (value) => value !== null && value !== undefined && value !== "";
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const refPattern = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  function assert(condition, code) {
    if (!condition) {
      const error = new TypeError(code);
      error.code = code;
      throw error;
    }
  }

  function isIanaTimeZone(value) {
    if (typeof value !== "string" || value.trim() !== value || value.length === 0) return false;
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: value }).resolvedOptions().timeZone.length > 0;
    } catch {
      return false;
    }
  }

  function validateDate(value, code) {
    assert(typeof value === "string" && datePattern.test(value), code);
    const parsed = new Date(`${value}T12:00:00.000Z`);
    assert(!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, code);
    return value;
  }

  function validateEffectivePeriod(period, code = "OPCAL_EFFECTIVE_PERIOD_INVALID") {
    assert(period && typeof period === "object" && !Array.isArray(period), code);
    const from = validateDate(period.from, code);
    const to = period.to === null || period.to === undefined ? null : validateDate(period.to, code);
    assert(to === null || from <= to, code);
    return freeze({ from, to });
  }

  function validateSource(source) {
    assert(source && typeof source === "object" && !Array.isArray(source), "OPCAL_SOURCE_REQUIRED");
    assert(refPattern.test(String(source.owner || "")), "OPCAL_SOURCE_OWNER_INVALID");
    assert(refPattern.test(String(source.reference || "")), "OPCAL_SOURCE_REFERENCE_INVALID");
    assert(typeof source.recordedAt === "string" && !Number.isNaN(Date.parse(source.recordedAt)), "OPCAL_SOURCE_RECORDED_AT_INVALID");
    return freeze({
      owner: String(source.owner),
      reference: String(source.reference),
      recordedAt: new Date(source.recordedAt).toISOString(),
      evidenceState: EVIDENCE_STATES.includes(source.evidenceState) ? source.evidenceState : "UNKNOWN",
    });
  }

  function validateProfile(input = {}) {
    assert(input.schemaVersion === undefined || input.schemaVersion === SCHEMA_VERSION, "OPCAL_SCHEMA_VERSION_INVALID");
    assert(refPattern.test(String(input.profileId || "")), "OPCAL_PROFILE_ID_INVALID");
    assert(refPattern.test(String(input.tenantId || "")), "OPCAL_TENANT_ID_INVALID");
    assert(input.scopeType === "ORGANIZATION" || input.scopeType === "ADVISOR", "OPCAL_SCOPE_TYPE_INVALID");
    if (input.scopeType === "ADVISOR") assert(refPattern.test(String(input.advisorId || "")), "OPCAL_ADVISOR_ID_INVALID");
    assert(isIanaTimeZone(input.timezone), "OPCAL_TIMEZONE_INVALID");
    assert(Array.isArray(input.workingWeekdays), "OPCAL_WORKING_WEEKDAYS_REQUIRED");
    const weekdays = [...new Set(input.workingWeekdays)];
    assert(weekdays.length > 0 && weekdays.every((day) => WEEKDAYS.includes(day)), "OPCAL_WORKING_WEEKDAYS_INVALID");
    assert(PROFILE_STATUSES.includes(input.status || "ACTIVE"), "OPCAL_PROFILE_STATUS_INVALID");
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      owner: OWNER,
      profileId: String(input.profileId),
      tenantId: String(input.tenantId),
      scopeType: input.scopeType,
      advisorId: input.scopeType === "ADVISOR" ? String(input.advisorId) : null,
      timezone: input.timezone,
      workingWeekdays: weekdays,
      effectivePeriod: validateEffectivePeriod(input.effectivePeriod),
      status: input.status || "ACTIVE",
      source: validateSource(input.source),
      correctionOf: present(input.correctionOf) ? String(input.correctionOf) : null,
      supersedes: present(input.supersedes) ? String(input.supersedes) : null,
      supersededBy: present(input.supersededBy) ? String(input.supersededBy) : null,
    });
  }

  function validateOverride(input = {}) {
    assert(refPattern.test(String(input.overrideId || "")), "OPCAL_OVERRIDE_ID_INVALID");
    assert(refPattern.test(String(input.tenantId || "")), "OPCAL_TENANT_ID_INVALID");
    assert(OVERRIDE_TYPES.includes(input.overrideType), "OPCAL_OVERRIDE_TYPE_INVALID");
    const localDate = validateDate(input.localDate, "OPCAL_OVERRIDE_DATE_INVALID");
    if (present(input.advisorId)) assert(refPattern.test(String(input.advisorId)), "OPCAL_ADVISOR_ID_INVALID");
    assert(TIME_OFF_STATUSES.includes(input.status || "CONFIRMED"), "OPCAL_OVERRIDE_STATUS_INVALID");
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      owner: OWNER,
      overrideId: String(input.overrideId),
      tenantId: String(input.tenantId),
      advisorId: present(input.advisorId) ? String(input.advisorId) : null,
      localDate,
      overrideType: input.overrideType,
      status: input.status || "CONFIRMED",
      source: validateSource(input.source),
      correctionOf: present(input.correctionOf) ? String(input.correctionOf) : null,
      supersedes: present(input.supersedes) ? String(input.supersedes) : null,
      supersededBy: present(input.supersededBy) ? String(input.supersededBy) : null,
    });
  }

  function validateTimeOff(input = {}) {
    assert(refPattern.test(String(input.recordId || "")), "OPCAL_TIME_OFF_ID_INVALID");
    assert(refPattern.test(String(input.tenantId || "")), "OPCAL_TENANT_ID_INVALID");
    assert(refPattern.test(String(input.advisorId || "")), "OPCAL_ADVISOR_ID_INVALID");
    assert(isIanaTimeZone(input.timezone), "OPCAL_TIME_OFF_TIMEZONE_INVALID");
    assert(TIME_OFF_STATUSES.includes(input.status), "OPCAL_TIME_OFF_STATUS_INVALID");
    assert(["REPORTED","CONFIRMED","DISPUTED"].includes(input.confirmationState || "CONFIRMED"), "OPCAL_TIME_OFF_CONFIRMATION_INVALID");
    const period = validateEffectivePeriod(input.effectivePeriod, "OPCAL_TIME_OFF_PERIOD_INVALID");
    assert(refPattern.test(String(input.idempotencyKey || "")), "OPCAL_TIME_OFF_IDEMPOTENCY_INVALID");
    assert(input.actor && input.actor.type === "ADVISOR" && String(input.actor.id) === String(input.advisorId), "OPCAL_TIME_OFF_ACTOR_INVALID");
    return freeze({
      schemaVersion: SCHEMA_VERSION,
      owner: OWNER,
      recordId: String(input.recordId),
      tenantId: String(input.tenantId),
      advisorId: String(input.advisorId),
      timezone: input.timezone,
      status: input.status,
      category: present(input.category) ? String(input.category) : null,
      effectivePeriod: period,
      source: validateSource(input.source),
      confirmationState: input.confirmationState || "CONFIRMED",
      actor: { type: "ADVISOR", id: String(input.actor.id) },
      recordedAt: new Date(input.recordedAt || input.source.recordedAt).toISOString(),
      provenance: clone(input.provenance || {}),
      idempotencyKey: String(input.idempotencyKey),
      correctionOf: present(input.correctionOf) ? String(input.correctionOf) : null,
      supersedes: present(input.supersedes) ? String(input.supersedes) : null,
      supersededBy: present(input.supersededBy) ? String(input.supersededBy) : null,
      archived: input.archived === true,
    });
  }

  function activeCanonicalRecords(records) {
    const replaced = new Set();
    records.forEach((record) => {
      if (record.correctionOf) replaced.add(record.correctionOf);
      if (record.supersedes) replaced.add(record.supersedes);
    });
    return records.filter((record) => !record.archived && !record.supersededBy && !replaced.has(record.profileId || record.overrideId || record.recordId));
  }

  function resolveTimezone({ advisorProfiles = [], organizationProfiles = [], tenantId, advisorId, asOfDate }) {
    const pick = (profiles, scopeType) => activeCanonicalRecords(profiles.map(validateProfile))
      .filter((profile) =>
        profile.tenantId === tenantId &&
        profile.scopeType === scopeType &&
        (scopeType !== "ADVISOR" || profile.advisorId === advisorId) &&
        profile.status === "ACTIVE" &&
        profile.effectivePeriod.from <= asOfDate &&
        (profile.effectivePeriod.to === null || profile.effectivePeriod.to >= asOfDate)
      )
      .sort((a, b) => b.effectivePeriod.from.localeCompare(a.effectivePeriod.from));

    const advisors = pick(advisorProfiles, "ADVISOR");
    if (advisors.length > 1 && advisors[0].effectivePeriod.from === advisors[1].effectivePeriod.from && advisors[0].timezone !== advisors[1].timezone) {
      return freeze({ state: "CONFLICTING", timezone: null, profile: null, warnings: ["advisor_timezone_conflict"] });
    }
    if (advisors[0]) return freeze({ state: "READY", timezone: advisors[0].timezone, profile: advisors[0], warnings: [] });

    const organizations = pick(organizationProfiles, "ORGANIZATION");
    if (organizations.length > 1 && organizations[0].effectivePeriod.from === organizations[1].effectivePeriod.from && organizations[0].timezone !== organizations[1].timezone) {
      return freeze({ state: "CONFLICTING", timezone: null, profile: null, warnings: ["organization_timezone_conflict"] });
    }
    if (organizations[0]) return freeze({ state: "READY", timezone: organizations[0].timezone, profile: organizations[0], warnings: ["timezone_inherited_from_organization"] });

    return freeze({ state: "UNKNOWN_TIMEZONE", timezone: null, profile: null, warnings: ["timezone_unresolved"] });
  }

  return freeze({
    SCHEMA_VERSION, OWNER, WEEKDAYS, PROFILE_STATUSES, OVERRIDE_TYPES, TIME_OFF_STATUSES,
    EVIDENCE_STATES, RESULT_STATES, isIanaTimeZone, validateEffectivePeriod, validateProfile,
    validateOverride, validateTimeOff, activeCanonicalRecords, resolveTimezone,
  });
});
