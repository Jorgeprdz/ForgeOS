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

  const stableValue = (value) => {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
    }
    return value;
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

  const unwrapOne = (result, code) => {
    if (result?.error) {
      const error = new Error(code);
      error.code = code;
      error.cause = result.error;
      throw error;
    }
    if (!result?.data || typeof result.data !== "object") {
      const error = new Error(code);
      error.code = code;
      throw error;
    }
    return result.data;
  };

  const sourceOf = (row) => ({
    owner: row.source_owner,
    reference: row.source_reference,
    recordedAt: row.recorded_at,
    evidenceState: row.evidence_state,
  });

  const mapProfile = (row) => contract.validateProfile({
    profileId: row.id,
    tenantId: row.tenant_id,
    scopeType: row.scope_type,
    advisorId: row.advisor_id,
    timezone: row.timezone,
    workingWeekdays: row.working_weekdays,
    effectivePeriod: { from: row.effective_from, to: row.effective_to },
    status: row.status,
    source: sourceOf(row),
    correctionOf: row.correction_of,
    supersedes: row.supersedes,
  });

  const mapOverride = (row) => contract.validateOverride({
    overrideId: row.id,
    tenantId: row.tenant_id,
    advisorId: row.advisor_id,
    localDate: row.local_date,
    overrideType: row.override_type,
    status: row.status,
    source: sourceOf(row),
    correctionOf: row.correction_of,
  });

  const mapTimeOff = (row) => contract.validateTimeOff({
    recordId: row.id,
    tenantId: row.tenant_id,
    advisorId: row.advisor_id,
    timezone: row.timezone,
    status: row.status,
    category: row.category,
    effectivePeriod: { from: row.start_date, to: row.end_date },
    source: sourceOf(row),
    confirmationState: row.confirmation_state,
    actor: { type: "ADVISOR", id: row.recorded_by },
    recordedAt: row.recorded_at,
    provenance: row.provenance,
    idempotencyKey: row.idempotency_key,
    correctionOf: row.correction_of,
    supersedes: row.supersedes,
    archived: row.archived,
  });

  async function digestHex(value) {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      const error = new Error("OPCAL_SHA256_UNAVAILABLE");
      error.code = "OPCAL_SHA256_UNAVAILABLE";
      throw error;
    }
    const bytes = new TextEncoder().encode(JSON.stringify(stableValue(value)));
    const digest = await subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
  }

  async function insertOrRead({ client, table, row, mapper, duplicateCode, insertCode, readCode }) {
    const inserted = await client.from(table).insert(row).select("*").single();
    if (!inserted?.error) return mapper(unwrapOne(inserted, insertCode));
    if (String(inserted.error.code || "") !== "23505") return mapper(unwrapOne(inserted, insertCode));

    const existing = await client
      .from(table)
      .select("*")
      .eq("tenant_id", row.tenant_id)
      .eq("idempotency_key", row.idempotency_key)
      .single();
    if (existing?.error) {
      const error = new Error(duplicateCode);
      error.code = duplicateCode;
      error.cause = existing.error;
      throw error;
    }
    return mapper(unwrapOne(existing, readCode));
  }

  function createOperationalCalendarRepository({ client, getSessionAdvisorId, clock = () => new Date() }) {
    if (!client || typeof getSessionAdvisorId !== "function") {
      throw new TypeError("OPCAL_REPOSITORY_DEPENDENCY_INVALID");
    }

    async function identity() {
      const advisorId = await getSessionAdvisorId();
      if (!advisorId) {
        const error = new Error("OPCAL_SESSION_REQUIRED");
        error.code = "SESSION_REQUIRED";
        throw error;
      }
      return String(advisorId);
    }

    async function readAuthority({ from, to, signal } = {}) {
      contract.validateEffectivePeriod({ from, to }, "OPCAL_READ_PERIOD_INVALID");
      const advisorId = await identity();
      const withAbortSignal = (query) => signal && typeof query?.abortSignal === "function"
        ? query.abortSignal(signal)
        : query;
      const profileQuery = client
        .from("operational_calendar_profiles")
        .select("*")
        .eq("tenant_id", advisorId)
        .or(`advisor_id.is.null,advisor_id.eq.${advisorId}`)
        .lte("effective_from", to)
        .or(`effective_to.is.null,effective_to.gte.${from}`);
      const overrideQuery = client
        .from("operational_day_overrides")
        .select("*")
        .eq("tenant_id", advisorId)
        .gte("local_date", from)
        .lte("local_date", to);
      const timeOffQuery = client
        .from("advisor_time_off_periods")
        .select("*")
        .eq("tenant_id", advisorId)
        .eq("advisor_id", advisorId)
        .lte("start_date", to)
        .gte("end_date", from);
      const [profileResult, overrideResult, timeOffResult] = await Promise.all([
        withAbortSignal(profileQuery),
        withAbortSignal(overrideQuery),
        withAbortSignal(timeOffQuery),
      ]);
      return freeze({
        advisorId,
        tenantId: advisorId,
        profiles: unwrap(profileResult, "OPCAL_PROFILE_READ_FAILED").map(mapProfile),
        overrides: unwrap(overrideResult, "OPCAL_OVERRIDE_READ_FAILED").map(mapOverride),
        timeOff: unwrap(timeOffResult, "OPCAL_TIME_OFF_READ_FAILED").map(mapTimeOff),
      });
    }

    async function appendAdvisorProfile({
      timezone,
      workingWeekdays,
      effectiveFrom,
      effectiveTo = null,
      supersedes = null,
      correctionOf = null,
      idempotencyKey = null,
    } = {}) {
      const advisorId = await identity();
      const effectivePeriod = contract.validateEffectivePeriod(
        { from: effectiveFrom, to: effectiveTo },
        "OPCAL_PROFILE_PERIOD_INVALID",
      );
      if (!contract.isIanaTimeZone(timezone)) {
        const error = new Error("OPCAL_TIMEZONE_INVALID");
        error.code = "OPCAL_TIMEZONE_INVALID";
        throw error;
      }
      const weekdays = [...new Set(Array.isArray(workingWeekdays) ? workingWeekdays : [])];
      if (!weekdays.length || !weekdays.every((day) => contract.WEEKDAYS.includes(day))) {
        const error = new Error("OPCAL_WORKING_WEEKDAYS_INVALID");
        error.code = "OPCAL_WORKING_WEEKDAYS_INVALID";
        throw error;
      }

      const recordedAt = clock().toISOString();
      const command = {
        type: "APPEND_ADVISOR_OPERATIONAL_CALENDAR_PROFILE",
        advisorId,
        timezone,
        workingWeekdays: weekdays,
        effectivePeriod,
        supersedes,
        correctionOf,
      };
      const commandDigest = await digestHex(command);
      const key = idempotencyKey || `opcal-profile:${effectivePeriod.from}:${commandDigest.slice(0, 24)}`;
      const reference = `opcal-profile:${effectivePeriod.from}:${commandDigest.slice(0, 24)}`;
      const source = {
        owner: contract.OWNER,
        reference: key,
        recordedAt,
        evidenceState: "CONFIRMED",
      };

      contract.validateProfile({
        profileId: reference,
        tenantId: advisorId,
        scopeType: "ADVISOR",
        advisorId,
        timezone,
        workingWeekdays: weekdays,
        effectivePeriod,
        status: "ACTIVE",
        source,
        correctionOf,
        supersedes,
      });

      const row = {
        profile_reference: reference,
        tenant_id: advisorId,
        scope_type: "ADVISOR",
        advisor_id: advisorId,
        timezone,
        working_weekdays: weekdays,
        effective_from: effectivePeriod.from,
        effective_to: effectivePeriod.to,
        status: "ACTIVE",
        source_owner: contract.OWNER,
        source_reference: key,
        evidence_state: "CONFIRMED",
        correction_of: correctionOf,
        supersedes,
        recorded_by: advisorId,
        recorded_at: recordedAt,
        provenance: {
          captured_via: "FORGE_AURA_ACTIVITY",
          confirmation_state: "ADVISOR_CONFIRMED",
        },
        idempotency_key: key,
        command_digest: commandDigest,
      };

      return insertOrRead({
        client,
        table: "operational_calendar_profiles",
        row,
        mapper: mapProfile,
        duplicateCode: "OPCAL_PROFILE_IDEMPOTENCY_CONFLICT",
        insertCode: "OPCAL_PROFILE_INSERT_FAILED",
        readCode: "OPCAL_PROFILE_IDEMPOTENCY_READ_FAILED",
      });
    }

    async function appendTimeOff({
      startDate,
      endDate,
      timezone,
      category = "VACATION",
      status = "CONFIRMED",
      correctionOf = null,
      supersedes = null,
      idempotencyKey = null,
    } = {}) {
      const advisorId = await identity();
      const effectivePeriod = contract.validateEffectivePeriod(
        { from: startDate, to: endDate },
        "OPCAL_TIME_OFF_PERIOD_INVALID",
      );
      if (!contract.isIanaTimeZone(timezone)) {
        const error = new Error("OPCAL_TIME_OFF_TIMEZONE_INVALID");
        error.code = "OPCAL_TIME_OFF_TIMEZONE_INVALID";
        throw error;
      }
      if (!["VACATION", "PERSONAL", "OTHER_PRIVATE"].includes(category)) {
        const error = new Error("OPCAL_TIME_OFF_CATEGORY_INVALID");
        error.code = "OPCAL_TIME_OFF_CATEGORY_INVALID";
        throw error;
      }
      if (!contract.TIME_OFF_STATUSES.includes(status)) {
        const error = new Error("OPCAL_TIME_OFF_STATUS_INVALID");
        error.code = "OPCAL_TIME_OFF_STATUS_INVALID";
        throw error;
      }

      const recordedAt = clock().toISOString();
      const command = {
        type: "APPEND_ADVISOR_TIME_OFF",
        advisorId,
        timezone,
        category,
        status,
        effectivePeriod,
        correctionOf,
        supersedes,
      };
      const commandDigest = await digestHex(command);
      const key = idempotencyKey || `opcal-time-off:${effectivePeriod.from}:${effectivePeriod.to}:${commandDigest.slice(0, 18)}`;
      const reference = `opcal-time-off:${effectivePeriod.from}:${commandDigest.slice(0, 24)}`;
      const source = {
        owner: contract.OWNER,
        reference: key,
        recordedAt,
        evidenceState: "CONFIRMED",
      };

      contract.validateTimeOff({
        recordId: reference,
        tenantId: advisorId,
        advisorId,
        timezone,
        status,
        category,
        effectivePeriod,
        source,
        confirmationState: "CONFIRMED",
        actor: { type: "ADVISOR", id: advisorId },
        recordedAt,
        provenance: {
          captured_via: "FORGE_AURA_ACTIVITY",
          confirmation_state: "ADVISOR_CONFIRMED",
        },
        idempotencyKey: key,
        correctionOf,
        supersedes,
        archived: false,
      });

      const row = {
        time_off_reference: reference,
        tenant_id: advisorId,
        advisor_id: advisorId,
        start_date: effectivePeriod.from,
        end_date: effectivePeriod.to,
        timezone,
        status,
        category,
        confirmation_state: "CONFIRMED",
        source_owner: contract.OWNER,
        source_reference: key,
        evidence_state: "CONFIRMED",
        correction_of: correctionOf,
        supersedes,
        archived: false,
        recorded_by: advisorId,
        recorded_at: recordedAt,
        provenance: {
          captured_via: "FORGE_AURA_ACTIVITY",
          confirmation_state: "ADVISOR_CONFIRMED",
        },
        idempotency_key: key,
        command_digest: commandDigest,
      };

      return insertOrRead({
        client,
        table: "advisor_time_off_periods",
        row,
        mapper: mapTimeOff,
        duplicateCode: "OPCAL_TIME_OFF_IDEMPOTENCY_CONFLICT",
        insertCode: "OPCAL_TIME_OFF_INSERT_FAILED",
        readCode: "OPCAL_TIME_OFF_IDEMPOTENCY_READ_FAILED",
      });
    }

    return freeze({
      owner: contract.OWNER,
      readAuthority,
      appendAdvisorProfile,
      appendTimeOff,
    });
  }

  return freeze({
    createOperationalCalendarRepository,
    mapProfile,
    mapOverride,
    mapTimeOff,
  });
});
