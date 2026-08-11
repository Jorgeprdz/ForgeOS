import { createPipelineAdapter } from "../pipeline/pipeline-adapter-pages-v1.js";
import {
  buildAgendaInputFromPipeline,
  normalizeRadarForOrchestrator,
} from "./home-core.js";

const ROOT = Symbol.for("forge.aura.home.pages.adapter.001");
let authorityPromise = null;

async function loadAuthorities() {
  if (authorityPromise) return authorityPromise;
  authorityPromise = Promise.all([
    import("../../forge-alive/home-authorities/repo/advisor-os/next-action/agenda-read-model.js"),
    import("../../forge-alive/home-authorities/repo/advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs"),
    import("../../forge-alive/home-authorities/repo/platform/attention/forge-home-attention-source-adapters.js"),
    import("../../forge-alive/home-authorities/repo/platform/attention/forge-home-attention-composition.js"),
  ]).then(([agenda, widgets, attentionSource, attention]) => Object.freeze({
    buildAgendaReadModel: agenda.buildAgendaReadModel,
    buildProductiveSmartWidgetStack: widgets.buildProductiveSmartWidgetStack,
    projectProductiveSmartWidgetStack: attentionSource.projectProductiveSmartWidgetStack,
    composeHomeAttention: attention.composeHomeAttention,
  })).catch(error => {
    authorityPromise = null;
    throw error;
  });
  return authorityPromise;
}

function abortError() {
  return new DOMException("Home read aborted", "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function errorSummary(error, code) {
  return Object.freeze({
    code: String(error?.code || code || "HOME_SOURCE_FAILED"),
    message: String(error?.message || code || "Home source failed"),
  });
}

function dateOnly(value, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const map = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function currentUser(client) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data?.user || null;
}

async function readRadar(client, timeZone, now, signal) {
  throwIfAborted(signal);
  const result = await client.rpc("forge_cartera050_list_future_radar", {
    p_payload: {
      asOfDate: dateOnly(now, timeZone),
      timezone: timeZone,
    },
  });
  throwIfAborted(signal);
  if (result?.error) throw result.error;
  const radar = result?.data || {};
  return Object.freeze({
    ...radar,
    focusItems: Object.freeze(Array.isArray(radar.focusItems) ? radar.focusItems : (Array.isArray(radar.items) ? radar.items.slice(0, 12) : [])),
  });
}

function disconnectedSource(blockedReason) {
  return Object.freeze({ sourceConnected: false, sourceComplete: false, blockedReason });
}

export async function createHomePagesAdapter({ client, user } = {}) {
  if (!client) throw new Error("HOME_PRODUCTIVE_CLIENT_REQUIRED");
  const authenticated = await currentUser(client);
  if (!authenticated?.id || (user?.id && authenticated.id !== user.id)) {
    const error = new Error("HOME_SESSION_REQUIRED");
    error.code = "SESSION_REQUIRED";
    throw error;
  }

  let advisorId = authenticated.id;
  let pipelineAdapter = null;
  let generation = 0;
  let destroyed = false;

  async function pipeline() {
    if (!pipelineAdapter) pipelineAdapter = await createPipelineAdapter({ client });
    return pipelineAdapter;
  }

  async function load({ timeZone, now = new Date(), signal } = {}) {
    const revision = ++generation;
    throwIfAborted(signal);
    if (destroyed) throw new Error("HOME_ADAPTER_DESTROYED");
    if (!timeZone) throw new Error("HOME_TIMEZONE_REQUIRED");
    const before = await currentUser(client);
    if (!before?.id || before.id !== advisorId) {
      const error = new Error("HOME_SESSION_CHANGED");
      error.code = "SESSION_REQUIRED";
      throw error;
    }

    const authorityResult = await loadAuthorities().then(
      value => ({ ok: true, value }),
      error => ({ ok: false, error }),
    );
    throwIfAborted(signal);

    const [pipelineResult, radarResult] = await Promise.all([
      pipeline().then(adapter => adapter.reload()).then(
        cards => ({ ok: true, cards }),
        error => ({ ok: false, error }),
      ),
      readRadar(client, timeZone, now, signal).then(
        radar => ({ ok: true, radar }),
        error => ({ ok: false, error }),
      ),
    ]);
    throwIfAborted(signal);

    if (revision !== generation || destroyed) throw abortError();
    const after = await currentUser(client);
    if (!after?.id || after.id !== advisorId) {
      const error = new Error("HOME_SESSION_CHANGED_AFTER_READ");
      error.code = "SESSION_REQUIRED";
      throw error;
    }

    let agenda = null;
    let agendaState = "SOURCE_UNAVAILABLE";
    let agendaError = null;
    if (authorityResult.ok && pipelineResult.ok) {
      try {
        const input = buildAgendaInputFromPipeline(pipelineResult.cards);
        agenda = authorityResult.value.buildAgendaReadModel({ ...input, now });
        agendaState = "READY";
      } catch (error) {
        agendaError = errorSummary(error, "HOME_AGENDA_PROJECTION_FAILED");
      }
    } else {
      agendaError = errorSummary(
        authorityResult.ok ? pipelineResult.error : authorityResult.error,
        authorityResult.ok ? "HOME_PIPELINE_SOURCE_FAILED" : "HOME_AGENDA_AUTHORITY_UNAVAILABLE",
      );
    }

    let stack = null;
    let priorityState = "SOURCE_UNAVAILABLE";
    let priorityError = null;
    if (authorityResult.ok) {
      try {
        const policyService = radarResult.ok
          ? Object.freeze({
              sourceConnected: true,
              sourceComplete: true,
              radarSnapshot: normalizeRadarForOrchestrator(radarResult.radar),
              freshness: { asOf: new Date(now).toISOString(), authority: "CARTERA_050_FUTURE_RADAR" },
            })
          : Object.freeze({
              sourceConnected: true,
              sourceComplete: false,
              sourceUnavailable: true,
              blockedReason: "CARTERA_050_SOURCE_UNAVAILABLE",
            });
        stack = await authorityResult.value.buildProductiveSmartWidgetStack({
          now: new Date(now).toISOString(),
          timeZone,
          signal,
          session: { status: "AUTHENTICATED", advisorId },
          sources: {
            activity: disconnectedSource("MICK_ACTIVITY_SCORING_SNAPSHOT_NOT_CONNECTED_TO_AURA_HOME"),
            monthlyGoal: disconnectedSource("ADVISOR_MONTHLY_POLICY_GOAL_NOT_CONNECTED_TO_AURA_HOME"),
            policyService,
            opportunities: disconnectedSource("PIPELINE_BITACORA_SIGNAL_MAPPING_NOT_CONNECTED"),
            income: disconnectedSource("AURA_HOME_DOES_NOT_DERIVE_COMPENSATION"),
          },
        });
        priorityState = stack?.stackStatus || "EMPTY";
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        priorityError = errorSummary(error, "HOME_PRIORITY_ORCHESTRATOR_FAILED");
      }
    } else {
      priorityError = errorSummary(authorityResult.error, "HOME_PRIORITY_AUTHORITY_UNAVAILABLE");
    }

    let attention = null;
    let attentionState = "UNKNOWN";
    let attentionError = null;
    if (authorityResult.ok) {
      try {
        const projectionBundle = stack
          ? authorityResult.value.projectProductiveSmartWidgetStack({
              advisorReference: advisorId,
              stack,
            })
          : Object.freeze({
              adapter: "FORGE_HOME_ATTENTION_SMART_WIDGET_ADAPTER_007",
              advisorReference: advisorId,
              sourceState: priorityState,
              sourceOrder: Object.freeze([]),
              projections: Object.freeze([]),
              omitted: Object.freeze(priorityError ? [{
                sourceReference: null,
                reason: priorityError.code,
              }] : []),
              diagnostics: Object.freeze({
                sourceSelectionOwner: "PRODUCTIVE_SMART_WIDGET_ORCHESTRATOR",
                rankingPerformed: false,
                scoreCalculated: false,
                domainWrites: 0,
              }),
            });
        attention = authorityResult.value.composeHomeAttention({
          advisorReference: advisorId,
          projectionBundle,
          sourceState: priorityState,
          asOf: new Date(now).toISOString(),
        });
        attentionState = attention.state;
        attentionError = priorityError;
      } catch (error) {
        attentionState = "ERROR";
        attentionError = errorSummary(error, "HOME_ATTENTION_ORCHESTRATION_FAILED");
      }
    } else {
      attentionState = "ERROR";
      attentionError = errorSummary(authorityResult.error, "HOME_ATTENTION_AUTHORITY_UNAVAILABLE");
    }

    return Object.freeze({
      advisorId,
      generatedAt: new Date(now).toISOString(),
      timeZone,
      pipeline: Object.freeze({
        state: pipelineResult.ok ? "READY" : "SOURCE_UNAVAILABLE",
        cards: Object.freeze(pipelineResult.ok ? pipelineResult.cards : []),
        error: pipelineResult.ok ? null : errorSummary(pipelineResult.error, "HOME_PIPELINE_SOURCE_FAILED"),
      }),
      agenda: Object.freeze({ state: agendaState, value: agenda, error: agendaError }),
      radar: Object.freeze({
        state: radarResult.ok ? "READY" : "SOURCE_UNAVAILABLE",
        value: radarResult.ok ? radarResult.radar : null,
        error: radarResult.ok ? null : errorSummary(radarResult.error, "HOME_CARTERA_SOURCE_FAILED"),
      }),
      priority: Object.freeze({ state: priorityState, value: stack, error: priorityError }),
      attention: Object.freeze({ state: attentionState, value: attention, error: attentionError }),
      mick: Object.freeze({
        state: "BLOCKED_BY_MISSING_EVIDENCE",
        value: null,
        reason: "MICK_OBSERVATION_SOURCE_NOT_CONNECTED_TO_AURA_HOME",
      }),
      diagnostics: Object.freeze({
        agendaAuthority: "advisor-os/next-action/agenda-read-model.js",
        priorityAuthority: "advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.mjs",
        decisionProjectionAuthority: "FORGE_CROSS_DOMAIN_DECISION_PROJECTION:FCDP-004-001",
        attentionAuthority: "FORGE_HOME_ATTENTION_ORCHESTRATION:FHAO-007-001",
        carteraAuthority: "forge_cartera050_list_future_radar",
        pipelineAuthority: "AURA_PIPELINE_PAGES_ADAPTER_READ_ONLY_USAGE",
        productWrites: 0,
        homeDomainWrites: 0,
        newProductiveEngines: 0,
        localAttentionRanking: false,
      }),
    });
  }

  function scrub(reason = "session-scrub") {
    generation += 1;
    advisorId = null;
    pipelineAdapter = null;
    return Object.freeze({ scrubbed: true, reason });
  }

  function destroy() {
    destroyed = true;
    scrub("destroy");
  }

  const api = Object.freeze({ load, scrub, destroy, diagnostics: () => Object.freeze({
    advisorId,
    productWrites: 0,
    homeDomainWrites: 0,
    rootAuthorityImports: true,
  }) });
  return api;
}

export const HOME_PAGES_ADAPTER_CONTRACT = ROOT;
