import { createProductiveActivityReportingBridge } from "./activity-ledger-reporting-bridge.js";
import {
  getCurrentAdvisorForecastReadModel,
  getIssuedAdvisorForecastSnapshot,
} from "./advisor-forecast-runtime-acceptance.js?v=af-runtime-acceptance-001";

export const ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION = "ACTIVITY-REPORTS-RUNTIME-001";
const TIME_ZONE = "America/Mexico_City";
const POINT_FACT_EVENT_TYPES = new Set([
  "REFERRAL_RECEIVED",
  "CALL_COMPLETED",
  "ADVISOR_REFERRAL_RECEIVED",
]);

function runtimeLayout() {
  const sourceTree = import.meta.url.includes("/docs/static-preview/");
  return Object.freeze({
    extension: sourceTree ? ".mjs" : ".js",
    smartWidgetBase: new URL(
      sourceTree
        ? "../../../advisor-os/forge-alive/smart-widgets/"
        : "../../advisor-os/forge-alive/smart-widgets/",
      import.meta.url,
    ),
  });
}

let goalModulePromise = null;
async function loadGoalModule() {
  if (goalModulePromise) return goalModulePromise;
  const layout = runtimeLayout();
  goalModulePromise = import(new URL(
    `advisor-monthly-policy-goal-repository${layout.extension}`,
    layout.smartWidgetBase,
  ));
  return goalModulePromise;
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function abortError(message = "Activity Reports request aborted") {
  return new DOMException(message, "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function unwrap(result, code) {
  if (result?.error) {
    const error = new Error(code, { cause: result.error });
    error.code = code;
    throw error;
  }
  return result?.data;
}

function normalizeSession(session) {
  const advisorId = session?.user?.id || session?.advisorId || null;
  return advisorId
    ? freeze({ status: "AUTHENTICATED", advisorId })
    : freeze({ status: "ANONYMOUS", advisorId: null });
}

function dateOnly(value, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const record = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${record.year}-${record.month}-${record.day}`;
}

function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((Date.parse(`${to}T12:00:00.000Z`) - Date.parse(`${from}T12:00:00.000Z`)) / 86400000) + 1;
}

function mondayOf(date) {
  const value = new Date(`${date}T12:00:00.000Z`);
  const weekday = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - weekday + 1);
  return value.toISOString().slice(0, 10);
}

function monthStart(date) {
  return `${date.slice(0, 7)}-01`;
}

function periodWindows(kind, asOf, timeZone = TIME_ZONE) {
  const today = dateOnly(asOf, timeZone);
  let from;
  switch (kind) {
    case "TODAY":
      from = today;
      break;
    case "WEEK_TO_DATE":
      from = mondayOf(today);
      break;
    case "MONTH_TO_DATE":
      from = monthStart(today);
      break;
    case "ROLLING_30_DAYS":
      from = shiftDate(today, -29);
      break;
    default:
      throw new TypeError(`Unsupported Activity Reports period: ${kind}`);
  }
  const length = daysBetween(from, today);
  const previousTo = shiftDate(from, -1);
  const previousFrom = shiftDate(previousTo, -(length - 1));
  return freeze({
    kind,
    current: { from, to: today },
    previous: { from: previousFrom, to: previousTo },
  });
}

function totalOf(result) {
  return Number.isFinite(result?.report?.totals?.activityCount)
    ? result.report.totals.activityCount
    : null;
}

function activityMix(result) {
  const output = {};
  for (const series of result?.chartReady?.series || []) {
    const type = String(series.seriesId || "").replace(/^activity-series:/, "");
    output[type] = series.points.reduce((sum, point) => sum + (Number(point.value) || 0), 0);
  }
  return freeze(output);
}

function comparison(currentResult, previousResult) {
  const current = totalOf(currentResult);
  const previous = totalOf(previousResult);
  const delta = current === null || previous === null ? null : current - previous;
  const deltaPercent = delta === null || previous === 0
    ? null
    : Math.round((delta / previous) * 1000) / 10;
  return freeze({
    current,
    previous,
    delta,
    deltaPercent,
    currentMix: activityMix(currentResult),
    previousMix: activityMix(previousResult),
    zeroComparisonBlocked: previous === 0,
  });
}

export function projectActivityPointFacts(snapshot, {
  from,
  to,
  timeZone = TIME_ZONE,
} = {}) {
  if (!snapshot || !Array.isArray(snapshot.events) || !from || !to) {
    return freeze({ state: "UNAVAILABLE", facts: [] });
  }

  const superseded = new Set(
    snapshot.events
      .filter((event) => event?.confirmation_state === "CONFIRMED" && event?.correction_of)
      .map((event) => event.correction_of),
  );

  const facts = snapshot.events.flatMap((event) => {
    if (!event || !POINT_FACT_EVENT_TYPES.has(event.event_type)) return [];
    if (event.confirmation_state !== "CONFIRMED") return [];
    if (!event.event_id || superseded.has(event.event_id)) return [];
    if (!event.occurred_at || Number.isNaN(Date.parse(event.occurred_at))) return [];
    const activityDate = dateOnly(event.occurred_at, timeZone);
    if (activityDate < from || activityDate > to) return [];
    return [{
      eventType: event.event_type,
      eventReference: event.event_id,
      occurredAt: new Date(event.occurred_at).toISOString(),
      sourceReference: event.source?.reference || null,
    }];
  });

  facts.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.eventReference.localeCompare(b.eventReference));
  return freeze({ state: "READY", facts });
}

async function authenticatedSession(bootstrap) {
  if (typeof bootstrap?.getSession !== "function") return normalizeSession(null);
  const result = await bootstrap.getSession();
  if (result?.error) throw result.error;
  return normalizeSession(result?.data?.session || result?.session || null);
}

async function authenticatedClient(bootstrap) {
  if (typeof bootstrap?.getClient !== "function") {
    const error = new Error("ACTIVITY_REPORTS_AUTH_BOOTSTRAP_UNAVAILABLE");
    error.code = "SESSION_REQUIRED";
    throw error;
  }
  return bootstrap.getClient();
}

function isoFromDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return `${value}T12:00:00.000Z`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function loadProductionAndGoal({ client, advisorId, asOf, timeZone, signal, goalRepositoryFactory }) {
  throwIfAborted(signal);
  const authResult = await client.auth.getUser();
  const user = unwrap(authResult, "ACTIVITY_REPORTS_AUTH_LOOKUP_FAILED")?.user;
  if (!user?.id || user.id !== advisorId) {
    const error = new Error("ACTIVITY_REPORTS_SESSION_CHANGED");
    error.code = "SESSION_REQUIRED";
    throw error;
  }

  const month = dateOnly(asOf, timeZone).slice(0, 7);
  const goalRepository = goalRepositoryFactory
    ? await goalRepositoryFactory({ client, advisorId })
    : (() => null)();
  let repository = goalRepository;
  if (!repository) {
    const { createAdvisorMonthlyPolicyGoalRepository } = await loadGoalModule();
    repository = createAdvisorMonthlyPolicyGoalRepository({
      client,
      getSessionAdvisorId: async () => {
        const current = unwrap(await client.auth.getUser(), "ACTIVITY_REPORTS_GOAL_AUTH_FAILED")?.user;
        return current?.id || null;
      },
    });
  }

  const goalSnapshot = await repository.readCurrent({
    advisorId,
    yearMonth: month,
    signal,
  });
  throwIfAborted(signal);

  let policyQuery = client.from("canonical_policies").select("id,policy_reference,issue_date,archived_at");
  if (typeof policyQuery.is === "function") policyQuery = policyQuery.is("archived_at", null);
  const policies = unwrap(await policyQuery, "ACTIVITY_REPORTS_POLICY_READ_FAILED") || [];
  const activePolicies = policies.filter((policy) => policy?.id && policy?.policy_reference && !policy.archived_at);
  if (!activePolicies.length) {
    return freeze({
      yearMonth: month,
      target: goalSnapshot?.targetPolicyCount ?? goalSnapshot?.target ?? null,
      sold: 0,
      policyFacts: [],
      sourceComplete: true,
      explicitZeroEvidence: true,
    });
  }

  const versions = unwrap(await client
    .from("policy_versions")
    .select("policy_id,policy_version_reference,version_number,confirmed_at")
    .in("policy_id", activePolicies.map((policy) => policy.id))
    .order("version_number", { ascending: true }), "ACTIVITY_REPORTS_POLICY_VERSION_READ_FAILED") || [];
  throwIfAborted(signal);

  const confirmed = new Map();
  for (const version of versions) {
    if (version?.policy_id && version.confirmed_at && !confirmed.has(version.policy_id)) confirmed.set(version.policy_id, version);
  }
  const policyFacts = activePolicies.flatMap((policy) => {
    const version = confirmed.get(policy.id);
    if (!version) return [];
    const soldAt = isoFromDate(policy.issue_date) || isoFromDate(version.confirmed_at);
    if (!soldAt || dateOnly(soldAt, timeZone).slice(0, 7) !== month) return [];
    return [{
      eventType: "POLICY_SOLD_CONFIRMED",
      policyId: policy.policy_reference,
      soldAt,
      evidenceRef: version.policy_version_reference || policy.policy_reference,
      authority: "CANONICAL_POLICY_CONFIRMED_VERSION",
    }];
  });
  return freeze({
    yearMonth: month,
    target: goalSnapshot?.targetPolicyCount ?? goalSnapshot?.target ?? null,
    sold: new Set(policyFacts.map((fact) => fact.policyId)).size,
    policyFacts,
    sourceComplete: policyFacts.length === confirmed.size,
    explicitZeroEvidence: true,
  });
}

async function safeSource(sourceId, loader) {
  try {
    const value = await loader();
    return freeze({ sourceId, state: "READY", value, error: null });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    return freeze({
      sourceId,
      state: error?.code === "SESSION_REQUIRED" ? "SESSION_REQUIRED" : "UNAVAILABLE",
      value: null,
      error: { code: error?.code || error?.name || "ERROR", message: error?.message || "Source unavailable" },
    });
  }
}

export function createActivityReportsProductivityRuntime({
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  activityRuntimeFactory = createProductiveActivityReportingBridge,
  goalRepositoryFactory = null,
  forecastReadModelReader = getCurrentAdvisorForecastReadModel,
  forecastSnapshotReader = getIssuedAdvisorForecastSnapshot,
  timeZone = TIME_ZONE,
  clock = () => new Date(),
} = {}) {
  let generation = 0;
  let advisorId = null;
  let activityRuntime = null;
  let client = null;

  async function closeActivityRuntime() {
    const selected = activityRuntime;
    activityRuntime = null;
    await selected?.close?.();
  }

  function guard(selectedGeneration, selectedAdvisorId, signal) {
    throwIfAborted(signal);
    if (selectedGeneration !== generation || selectedAdvisorId !== advisorId) {
      throw abortError("Activity Reports session generation changed");
    }
  }

  async function ensureActivityRuntime(selectedAdvisorId) {
    if (activityRuntime?.authority?.advisorId === selectedAdvisorId) return activityRuntime;
    await closeActivityRuntime();
    activityRuntime = await activityRuntimeFactory({ bootstrap, timeZone, clock });
    if (activityRuntime?.authority?.advisorId !== selectedAdvisorId) {
      await closeActivityRuntime();
      throw new Error("ACTIVITY_REPORTS_ACTIVITY_AUTHORITY_MISMATCH");
    }
    return activityRuntime;
  }

  async function load({ periodKind = "MONTH_TO_DATE", signal = null } = {}) {
    const session = await authenticatedSession(globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap);
    if (session.status !== "AUTHENTICATED") {
      await scrub("anonymous");
      return freeze({
        runtimeVersion: ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION,
        state: "SESSION_REQUIRED",
        advisorId: null,
        sources: [],
      });
    }
    if (advisorId && advisorId !== session.advisorId) await scrub("advisor-switch");
    advisorId = session.advisorId;
    const selectedGeneration = ++generation;
    const selectedAdvisorId = advisorId;
    const asOf = clock().toISOString();
    const windows = periodWindows(periodKind, asOf, timeZone);
    guard(selectedGeneration, selectedAdvisorId, signal);

    const activitySource = await safeSource("FES_REP_ACTIVITY", async () => {
      const runtime = await ensureActivityRuntime(selectedAdvisorId);
      const canonicalSnapshot = typeof runtime.readCanonicalEvents === "function"
        ? await runtime.readCanonicalEvents()
        : null;
      guard(selectedGeneration, selectedAdvisorId, signal);
      const pointFacts = projectActivityPointFacts(canonicalSnapshot, {
        ...windows.current,
        timeZone,
      });
      const current = await runtime.runChartReady({
        period: { kind: "CUSTOM_RANGE", parameters: windows.current },
        timeZone,
        asOf,
      });
      guard(selectedGeneration, selectedAdvisorId, signal);
      const previous = await runtime.runChartReady({
        period: { kind: "CUSTOM_RANGE", parameters: windows.previous },
        timeZone,
        asOf,
      });
      guard(selectedGeneration, selectedAdvisorId, signal);
      return freeze({ current, previous, comparison: comparison(current, previous), pointFacts });
    });

    const productionSource = await safeSource("MONTHLY_GOAL_AND_CONFIRMED_POLICIES", async () => {
      if (!client) client = await authenticatedClient(globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap);
      return loadProductionAndGoal({
        client,
        advisorId: selectedAdvisorId,
        asOf,
        timeZone,
        signal,
        goalRepositoryFactory,
      });
    });
    guard(selectedGeneration, selectedAdvisorId, signal);

    const forecastSource = await safeSource("ADVISOR_FORECAST_ISSUED_SNAPSHOT", async () => {
      const readModel = forecastReadModelReader?.() || null;
      const snapshot = forecastSnapshotReader?.() || null;
      if (readModel?.advisorId && readModel.advisorId !== selectedAdvisorId) throw new Error("ACTIVITY_REPORTS_CROSS_ADVISOR_FORECAST");
      if (snapshot?.advisorId && snapshot.advisorId !== selectedAdvisorId) throw new Error("ACTIVITY_REPORTS_CROSS_ADVISOR_SNAPSHOT");
      if (!readModel && !snapshot) {
        const error = new Error("Forecast todavía no tiene una lectura emitida en esta sesión");
        error.code = "FORECAST_NOT_ISSUED";
        throw error;
      }
      return freeze({ readModel, snapshot });
    });
    guard(selectedGeneration, selectedAdvisorId, signal);

    const sources = freeze([activitySource, productionSource, forecastSource]);
    const primaryReady = activitySource.state === "READY";
    const partial = sources.some((source) => source.state !== "READY");
    return freeze({
      runtimeVersion: ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION,
      state: !primaryReady ? "SOURCE_UNAVAILABLE" : partial ? "PARTIAL" : "READY",
      advisorId: selectedAdvisorId,
      generatedAt: asOf,
      timeZone,
      period: windows,
      activity: activitySource.value,
      production: productionSource.value,
      forecast: forecastSource.value,
      sources,
      boundary: {
        activityTruthAuthority: false,
        policyTruthAuthority: false,
        forecastTruthAuthority: false,
        reportingProjectionAuthority: true,
        canonicalPointFactProjection: true,
        automaticDecision: false,
        automaticTaskCreation: false,
        automaticCalendarCreation: false,
        automaticFesEvent: false,
        databaseMutation: false,
        crmMutation: false,
      },
    });
  }

  async function scrub(reason = "session-scrub") {
    generation += 1;
    advisorId = null;
    client = null;
    await closeActivityRuntime();
    return freeze({ reason, state: "SCRUBBED" });
  }

  return freeze({
    runtimeVersion: ACTIVITY_REPORTS_PRODUCTIVITY_RUNTIME_VERSION,
    load,
    scrub,
    diagnostics() {
      return freeze({
        advisorId,
        generation,
        activityRuntime: activityRuntime?.diagnostics?.() || null,
        boundary: {
          readOnly: true,
          automaticMutation: false,
          lateResultRejection: true,
          advisorSwitchScrub: true,
        },
      });
    },
  });
}
