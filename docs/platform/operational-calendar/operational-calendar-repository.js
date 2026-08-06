"use strict";

(function operationalCalendarRepositoryModule(root, factory) {
  const contract = typeof module !== "undefined" && module.exports
    ? require("./operational-calendar-contract")
    : root.ForgeOperationalCalendarContractV1;
  const api = factory(contract);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeOperationalCalendarRepositoryV1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function operationalCalendarRepositoryFactory(contract) {
  if (!contract) throw new Error("OPCAL_CONTRACT_REQUIRED");
  const freeze = (value) => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  };
  const unwrap = (result, code) => {
    if (result?.error) {
      const error = new Error(code);
      error.code = code;
      error.cause = result.error;
      throw error;
    }
    return result?.data || [];
  };
  const sourceOf = (row) => ({ owner: row.source_owner, reference: row.source_reference, recordedAt: row.recorded_at, evidenceState: row.evidence_state });
  const mapProfile = (row) => contract.validateProfile({ profileId: row.id, tenantId: row.tenant_id, scopeType: row.scope_type, advisorId: row.advisor_id, timezone: row.timezone, workingWeekdays: row.working_weekdays, effectivePeriod: { from: row.effective_from, to: row.effective_to }, status: row.status, source: sourceOf(row), correctionOf: row.correction_of, supersedes: row.supersedes });
  const mapOverride = (row) => contract.validateOverride({ overrideId: row.id, tenantId: row.tenant_id, advisorId: row.advisor_id, localDate: row.local_date, overrideType: row.override_type, status: row.status, source: sourceOf(row), correctionOf: row.correction_of });
  const mapTimeOff = (row) => contract.validateTimeOff({ recordId: row.id, tenantId: row.tenant_id, advisorId: row.advisor_id, timezone: row.timezone, status: row.status, category: row.category, effectivePeriod: { from: row.start_date, to: row.end_date }, source: sourceOf(row), confirmationState: row.confirmation_state, actor: { type: "ADVISOR", id: row.recorded_by }, recordedAt: row.recorded_at, provenance: row.provenance, idempotencyKey: row.idempotency_key, correctionOf: row.correction_of, supersedes: row.supersedes, archived: row.archived });

  function createOperationalCalendarRepository({ client, getSessionAdvisorId }) {
    if (!client || typeof getSessionAdvisorId !== "function") throw new TypeError("OPCAL_REPOSITORY_DEPENDENCY_INVALID");
    async function identity() {
      const advisorId = await getSessionAdvisorId();
      if (!advisorId) { const error = new Error("OPCAL_SESSION_REQUIRED"); error.code = "SESSION_REQUIRED"; throw error; }
      return String(advisorId);
    }
    async function readAuthority({ from, to, signal } = {}) {
      contract.validateEffectivePeriod({ from, to }, "OPCAL_READ_PERIOD_INVALID");
      const advisorId = await identity();
      const withAbortSignal = (query) => signal && typeof query?.abortSignal === "function" ? query.abortSignal(signal) : query;
      const profileQuery = client.from("operational_calendar_profiles").select("*").eq("tenant_id", advisorId).or(`advisor_id.is.null,advisor_id.eq.${advisorId}`).lte("effective_from", to).or(`effective_to.is.null,effective_to.gte.${from}`);
      const overrideQuery = client.from("operational_day_overrides").select("*").eq("tenant_id", advisorId).gte("local_date", from).lte("local_date", to);
      const timeOffQuery = client.from("advisor_time_off_periods").select("*").eq("tenant_id", advisorId).eq("advisor_id", advisorId).lte("start_date", to).gte("end_date", from);
      const [profileResult, overrideResult, timeOffResult] = await Promise.all([withAbortSignal(profileQuery), withAbortSignal(overrideQuery), withAbortSignal(timeOffQuery)]);
      return freeze({ advisorId, tenantId: advisorId, profiles: unwrap(profileResult, "OPCAL_PROFILE_READ_FAILED").map(mapProfile), overrides: unwrap(overrideResult, "OPCAL_OVERRIDE_READ_FAILED").map(mapOverride), timeOff: unwrap(timeOffResult, "OPCAL_TIME_OFF_READ_FAILED").map(mapTimeOff) });
    }
    return freeze({ owner: contract.OWNER, readAuthority });
  }
  return freeze({ createOperationalCalendarRepository, mapProfile, mapOverride, mapTimeOff });
});
