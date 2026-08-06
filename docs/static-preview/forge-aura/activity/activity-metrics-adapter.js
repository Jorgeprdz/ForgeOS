const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

const unique = (values) => [...new Set((values || []).filter(Boolean))];

function localDate(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const selected = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );
  return `${selected.year}-${selected.month}-${selected.day}`;
}

function metricEnvelope({
  value = null,
  state = "UNKNOWN",
  sourceOwner,
  sourceRefs = [],
  period,
  timezone,
  completeness = "UNKNOWN",
  freshness = "CURRENT",
  explicitZeroEvidence = false,
} = {}) {
  return freeze({
    value,
    metricState: state,
    evidenceState: state,
    confirmationState: state === "CONFIRMED" ? "CONFIRMED" : null,
    sourceOwner,
    sourceRefs: unique(sourceRefs),
    period,
    timezone,
    completeness,
    freshness,
    conflicts: [],
    exclusions: [],
    correctionState: null,
    explicitZeroEvidence,
  });
}

const SERIES_TO_METRIC = Object.freeze({
  REFERRAL_RECEIVED: "referrals",
  CALL_COMPLETED: "calls",
  INITIAL_APPOINTMENT_SCHEDULED: "appointmentsScheduled",
  INITIAL_APPOINTMENT_COMPLETED: "appointmentsHeld",
  CLOSING_APPOINTMENT_COMPLETED: "closingAppointmentsHeld",
  ADVISOR_REFERRAL_RECEIVED: "advisorReferrals",
});

const POINT_KEY_BY_METRIC = Object.freeze({
  referrals: "referidos",
  calls: "llamadas",
  appointmentsScheduled: "citas_agendadas",
  appointmentsHeld: "citas_iniciales",
  closingAppointmentsHeld: "citas_cierre",
  applicationsSubmitted: "solicitudes_firmadas",
  policiesPaid: "polizas_pagadas",
  advisorReferrals: "referido_asesor",
});

export function createActivityMetricsAdapter({ client, user } = {}) {
  if (!client || !user?.id) throw new Error("AURA_ACTIVITY_METRICS_DEPENDENCIES_REQUIRED");
  const advisorId = String(user.id);

  async function loadApplications(calendar) {
    try {
      const from = `${calendar.period.from}T00:00:00.000Z`;
      const to = `${calendar.period.to}T23:59:59.999Z`;
      const { data, error } = await client
        .from("application_events")
        .select("event_reference,occurred_at")
        .eq("advisor_id", advisorId)
        .eq("event_type", "APPLICATION_SUBMITTED")
        .gte("occurred_at", from)
        .lte("occurred_at", to);
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const byDate = Object.fromEntries(calendar.dates.map((entry) => [entry.localDate, 0]));
      for (const row of rows) {
        const date = localDate(row.occurred_at, calendar.timezone);
        if (Object.prototype.hasOwnProperty.call(byDate, date)) byDate[date] += 1;
      }
      return freeze({
        state: "CONFIRMED",
        value: rows.length,
        byDate,
        sourceRefs: rows.map((row) => row.event_reference),
        explicitZeroEvidence: true,
      });
    } catch (error) {
      return freeze({
        state: "UNKNOWN",
        value: null,
        byDate: {},
        sourceRefs: [],
        explicitZeroEvidence: false,
        reason: error?.code || error?.message || "APPLICATION_SOURCE_UNAVAILABLE",
      });
    }
  }

  function loadFes(reporting, calendar) {
    if (!reporting || !["READY", "EMPTY"].includes(reporting.state)) {
      return freeze({ state: "UNKNOWN", totals: {}, byDate: {}, sourceRefs: [] });
    }
    const totals = {};
    const byDate = Object.fromEntries(calendar.dates.map((entry) => [entry.localDate, {}]));
    const sourceRefs = [];
    for (const series of reporting.chartReady?.series || []) {
      const activityType = String(series.seriesId || "").replace(/^activity-series:/, "");
      const metricKey = SERIES_TO_METRIC[activityType];
      if (!metricKey) continue;
      for (const point of series.points || []) {
        const value = Number(point.value) || 0;
        totals[metricKey] = (totals[metricKey] || 0) + value;
        if (byDate[point.x]) byDate[point.x][metricKey] = (byDate[point.x][metricKey] || 0) + value;
        sourceRefs.push(...(point.rowKeys || []));
      }
    }
    return freeze({
      state: "CONFIRMED",
      totals,
      byDate,
      sourceRefs: unique(sourceRefs),
      explicitZeroEvidence: true,
    });
  }

  async function load({ calendar, reporting } = {}) {
    if (!calendar || !["READY", "STALE"].includes(calendar.state)) {
      return freeze({ state: "INCOMPLETE", reason: "CALENDAR_NOT_READY" });
    }
    const period = {
      from: calendar.period.from,
      to: calendar.period.to,
      timezone: calendar.timezone,
    };
    const [applications, fes] = await Promise.all([
      loadApplications(calendar),
      Promise.resolve(loadFes(reporting, calendar)),
    ]);

    const fesMetric = (metricKey) => metricEnvelope({
      value: fes.state === "CONFIRMED" ? (fes.totals[metricKey] || 0) : null,
      state: fes.state,
      sourceOwner: "EVENT_EVIDENCE_FES",
      sourceRefs: fes.sourceRefs,
      period,
      timezone: calendar.timezone,
      completeness: fes.state === "CONFIRMED" ? "COMPLETE" : "UNKNOWN",
      explicitZeroEvidence: fes.explicitZeroEvidence,
    });

    const metrics = freeze({
      referrals: fesMetric("referrals"),
      calls: fesMetric("calls"),
      appointmentsScheduled: fesMetric("appointmentsScheduled"),
      appointmentsHeld: fesMetric("appointmentsHeld"),
      closingAppointmentsHeld: fesMetric("closingAppointmentsHeld"),
      applicationsSubmitted: metricEnvelope({
        value: applications.value,
        state: applications.state,
        sourceOwner: "POLICY_SALES_OPERATIONS",
        sourceRefs: applications.sourceRefs,
        period,
        timezone: calendar.timezone,
        completeness: applications.state === "CONFIRMED" ? "COMPLETE" : "UNKNOWN",
        explicitZeroEvidence: applications.explicitZeroEvidence,
      }),
      policiesPaid: metricEnvelope({
        value: null,
        state: "UNKNOWN",
        sourceOwner: "POLICY_INTELLIGENCE_POLICY_OPERATIONS",
        sourceRefs: [],
        period,
        timezone: calendar.timezone,
        completeness: "UNKNOWN",
        explicitZeroEvidence: false,
      }),
      advisorReferrals: fesMetric("advisorReferrals"),
    });

    const dailyPointInputs = calendar.dates.map((date) => {
      const daily = fes.byDate[date.localDate] || {};
      const applicationValue = applications.byDate[date.localDate];
      const counts = {};
      for (const [metricKey, pointKey] of Object.entries(POINT_KEY_BY_METRIC)) {
        if (metricKey === "policiesPaid") {
          counts[pointKey] = {
            value: null,
            completeness: "UNKNOWN",
            evidenceState: "UNKNOWN",
            metricOwner: "PRODUCTIVITY",
            sourceRefs: [],
          };
          continue;
        }
        if (metricKey === "applicationsSubmitted") {
          const ready = applications.state === "CONFIRMED";
          counts[pointKey] = {
            value: ready ? (applicationValue || 0) : null,
            completeness: ready ? "COMPLETE" : "UNKNOWN",
            evidenceState: ready ? "CONFIRMED" : "UNKNOWN",
            metricOwner: "PRODUCTIVITY",
            sourceRefs: applications.sourceRefs,
          };
          continue;
        }
        const ready = fes.state === "CONFIRMED";
        counts[pointKey] = {
          value: ready ? (daily[metricKey] || 0) : null,
          completeness: ready ? "COMPLETE" : "UNKNOWN",
          evidenceState: ready ? "CONFIRMED" : "UNKNOWN",
          metricOwner: "PRODUCTIVITY",
          sourceRefs: fes.sourceRefs,
        };
      }
      return freeze({ localDate: date.localDate, counts });
    });

    return freeze({
      state: metrics.policiesPaid.metricState === "UNKNOWN" ? "PARTIAL" : "READY",
      metrics,
      dailyPointInputs,
      warnings: [
        ...(applications.state === "UNKNOWN" ? ["applications_source_unavailable"] : []),
        "paid_policy_confirmation_authority_unavailable",
      ],
      boundaries: {
        policyPaidInferredFromIssuedPolicy: false,
        applicationTruthReowned: false,
        fesTruthReowned: false,
      },
    });
  }

  return freeze({ load });
}
