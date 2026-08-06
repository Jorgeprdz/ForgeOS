const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function shiftDate(localDate, days) {
  const value = new Date(`${localDate}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function localDateAt(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const selected = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );
  return `${selected.year}-${selected.month}-${selected.day}`;
}

function weekPeriod(localDate, locale = "es-MX") {
  const weekInfo = new Intl.Locale(locale).weekInfo;
  if (!weekInfo?.firstDay) throw new Error("AURA_ACTIVITY_LOCALE_WEEK_INFO_UNAVAILABLE");
  const date = new Date(`${localDate}T12:00:00.000Z`);
  const isoWeekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  const delta = (isoWeekday - weekInfo.firstDay + 7) % 7;
  const from = shiftDate(localDate, -delta);
  return freeze({ from, to: shiftDate(from, 6), locale, firstDay: weekInfo.firstDay });
}

export function createActivityCalendarController({
  client,
  user,
  clock = () => new Date(),
  locale = "es-MX",
} = {}) {
  if (!client || !user?.id) throw new Error("AURA_ACTIVITY_CALENDAR_DEPENDENCIES_REQUIRED");
  const contract = globalThis.ForgeOperationalCalendarContractV1;
  const repositoryApi = globalThis.ForgeOperationalCalendarRepositoryV1;
  const evaluator = globalThis.ForgeEligibleDateEvaluatorV1;
  if (!contract || !repositoryApi || !evaluator) {
    throw new Error("AURA_ACTIVITY_CALENDAR_AUTHORITIES_UNAVAILABLE");
  }

  const advisorId = String(user.id);
  const repository = repositoryApi.createOperationalCalendarRepository({
    client,
    getSessionAdvisorId: async () => advisorId,
    clock,
  });

  function browserTimeZoneCandidate() {
    const candidate = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return contract.isIanaTimeZone(candidate) ? candidate : null;
  }

  async function loadCurrentWeek({ signal } = {}) {
    const now = clock();
    const utcDate = now.toISOString().slice(0, 10);
    const discoveryPeriod = { from: shiftDate(utcDate, -8), to: shiftDate(utcDate, 8) };
    let discovery;
    try {
      discovery = await repository.readAuthority({ ...discoveryPeriod, signal });
    } catch (error) {
      const code = String(error?.code || error?.cause?.code || error?.message || "");
      if (/42P01|relation .* does not exist|OPCAL_.*READ_FAILED/i.test(code)) {
        return freeze({
          state: "AUTHORITY_UNAVAILABLE",
          reason: "CALENDAR_TABLES_UNAVAILABLE",
          calendar: null,
          period: null,
          browserTimeZoneCandidate: browserTimeZoneCandidate(),
        });
      }
      throw error;
    }

    const advisorProfiles = discovery.profiles.filter((profile) => profile.advisorId === advisorId);
    const organizationProfiles = discovery.profiles.filter((profile) => profile.advisorId === null);
    const timezoneResolution = contract.resolveTimezone({
      advisorProfiles,
      organizationProfiles,
      tenantId: advisorId,
      advisorId,
      asOfDate: utcDate,
    });

    if (timezoneResolution.state !== "READY") {
      return freeze({
        state: timezoneResolution.state,
        reason: timezoneResolution.warnings?.[0] || "CALENDAR_PROFILE_REQUIRED",
        calendar: null,
        period: null,
        profiles: discovery.profiles,
        browserTimeZoneCandidate: browserTimeZoneCandidate(),
      });
    }

    const currentLocalDate = localDateAt(now, timezoneResolution.timezone);
    const period = weekPeriod(currentLocalDate, locale);
    const records = await repository.readAuthority({ from: period.from, to: period.to, signal });
    const calendar = evaluator.evaluateEligibleDates({
      tenantId: advisorId,
      advisorId,
      period: { from: period.from, to: period.to },
      advisorProfiles: records.profiles.filter((profile) => profile.advisorId === advisorId),
      organizationProfiles: records.profiles.filter((profile) => profile.advisorId === null),
      overrides: records.overrides,
      timeOff: records.timeOff,
    });

    return freeze({
      state: calendar.state,
      reason: calendar.warnings?.[0] || null,
      calendar,
      period,
      profiles: records.profiles,
      browserTimeZoneCandidate: browserTimeZoneCandidate(),
    });
  }

  async function configureAdvisorCalendar({
    timezone,
    workingWeekdays,
    effectiveFrom,
    supersedes = null,
  } = {}) {
    if (!contract.isIanaTimeZone(timezone)) throw new Error("OPCAL_TIMEZONE_INVALID");
    if (!Array.isArray(workingWeekdays) || !workingWeekdays.length) {
      throw new Error("OPCAL_WORKING_WEEKDAYS_INVALID");
    }
    const profile = await repository.appendAdvisorProfile({
      timezone,
      workingWeekdays,
      effectiveFrom,
      supersedes,
    });
    return freeze({ state: "CONFIRMED", profile });
  }

  async function recordVacation({ startDate, endDate, timezone } = {}) {
    const record = await repository.appendTimeOff({
      startDate,
      endDate,
      timezone,
      category: "VACATION",
      status: "CONFIRMED",
    });
    return freeze({ state: "CONFIRMED", record });
  }

  return freeze({
    owner: contract.OWNER,
    weekdays: contract.WEEKDAYS,
    browserTimeZoneCandidate,
    loadCurrentWeek,
    configureAdvisorCalendar,
    recordVacation,
    diagnostics: () => freeze({
      advisorId,
      authority: contract.OWNER,
      writesThroughCanonicalRepository: true,
      browserTimezoneAutoSaved: false,
      defaultWorkingWeekdays: false,
    }),
  });
}
