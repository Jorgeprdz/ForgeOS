function requireFunction(value, label) {
  if (typeof value !== "function") throw new TypeError(`${label} must be a function`);
  return value;
}

function assertContext(context) {
  if (!context || typeof context !== "object") throw new TypeError("source context must be an object");
  if (!context.advisorId) throw new TypeError("source context advisorId is required");
  if (context.signal?.aborted) throw new DOMException("Smart widget source load aborted", "AbortError");
  return context;
}

function scopedResult(context, payload) {
  if (payload && payload.advisorId && payload.advisorId !== context.advisorId) {
    throw new Error("Smart widget source returned cross-advisor data");
  }
  return payload && typeof payload === "object" ? payload : {};
}

export function createActivityRepSourceAdapter({
  activityReportingRuntime,
  request = { period: "TODAY", timeZone: "America/Mexico_City" },
  loadScoringSnapshot = null,
} = {}) {
  if (!activityReportingRuntime || typeof activityReportingRuntime.runChartReady !== "function") {
    throw new TypeError("activityReportingRuntime.runChartReady is required");
  }
  return Object.freeze({
    sourceId: "ACTIVITY_REP_SOURCE_ADAPTER",
    authority: ["FES", "REP"],
    async load(contextInput) {
      const context = assertContext(contextInput);
      const reportResult = await activityReportingRuntime.runChartReady({
        ...request,
        timeZone: request.timeZone || context.timeZone,
        asOf: request.asOf || context.now,
        metadata: {
          ...(request.metadata || {}),
          advisorId: context.advisorId,
          smartWidgetSource: true,
        },
      });
      if (context.signal?.aborted) throw new DOMException("Smart widget source load aborted", "AbortError");
      const scoringSnapshot = typeof loadScoringSnapshot === "function"
        ? scopedResult(context, await loadScoringSnapshot(context))
        : null;
      return {
        reportResult,
        scoringSnapshot,
        sourceConnected: true,
        sourceComplete: Boolean(scoringSnapshot),
      };
    },
  });
}

export function createMonthlyPolicyGoalSourceAdapter({ loadGoalSnapshot, loadPolicyFacts } = {}) {
  const goalLoader = requireFunction(loadGoalSnapshot, "loadGoalSnapshot");
  const factsLoader = requireFunction(loadPolicyFacts, "loadPolicyFacts");
  return Object.freeze({
    sourceId: "MONTHLY_POLICY_GOAL_SOURCE_ADAPTER",
    authority: ["ADVISOR_MONTHLY_POLICY_GOAL", "PRODUCTION_EVENTS"],
    async load(contextInput) {
      const context = assertContext(contextInput);
      const [goalSnapshot, policyFacts] = await Promise.all([
        goalLoader(context),
        factsLoader(context),
      ]);
      if (context.signal?.aborted) throw new DOMException("Smart widget source load aborted", "AbortError");
      scopedResult(context, goalSnapshot);
      for (const fact of Array.isArray(policyFacts) ? policyFacts : []) scopedResult(context, fact);
      return {
        goalSnapshot: goalSnapshot || null,
        policyFacts: Array.isArray(policyFacts) ? policyFacts : [],
        sourceConnected: true,
        sourceComplete: true,
      };
    },
  });
}

export function createCarteraFutureRadarSourceAdapter({ loadRadarSnapshot, connected = false } = {}) {
  if (!connected) {
    return Object.freeze({
      sourceId: "CARTERA_FUTURE_RADAR_SOURCE_ADAPTER",
      authority: ["CARTERA_FUTURE_RADAR"],
      async load(contextInput) {
        assertContext(contextInput);
        return {
          sourceConnected: false,
          sourceComplete: false,
          blockedReason: "WAITING_FOR_CARTERA_050_MAIN_PROMOTION",
        };
      },
    });
  }
  const loader = requireFunction(loadRadarSnapshot, "loadRadarSnapshot");
  return Object.freeze({
    sourceId: "CARTERA_FUTURE_RADAR_SOURCE_ADAPTER",
    authority: ["CARTERA_FUTURE_RADAR"],
    async load(contextInput) {
      const context = assertContext(contextInput);
      const radarSnapshot = scopedResult(context, await loader(context));
      return {
        radarSnapshot,
        sourceConnected: true,
        sourceComplete: true,
      };
    },
  });
}

export function createOpportunityBitacoraSourceAdapter({ loadOpportunities } = {}) {
  const loader = requireFunction(loadOpportunities, "loadOpportunities");
  return Object.freeze({
    sourceId: "OPPORTUNITY_BITACORA_SOURCE_ADAPTER",
    authority: ["PIPELINE", "BITACORA"],
    async load(contextInput) {
      const context = assertContext(contextInput);
      const opportunities = await loader(context);
      for (const opportunity of Array.isArray(opportunities) ? opportunities : []) scopedResult(context, opportunity);
      return {
        opportunities: Array.isArray(opportunities) ? opportunities : [],
        sourceConnected: true,
        sourceComplete: true,
      };
    },
  });
}

export function createIncomeCompensationSourceAdapter({ loadCompensationSnapshot, connected = false } = {}) {
  if (!connected) {
    return Object.freeze({
      sourceId: "INCOME_COMPENSATION_SOURCE_ADAPTER",
      authority: ["COMPENSATION_INTELLIGENCE"],
      async load(contextInput) {
        assertContext(contextInput);
        return {
          sourceConnected: false,
          sourceComplete: false,
          blockedReason: "WAITING_FOR_COMPENSATION_INCOME_TRUTH_MINIMUM",
        };
      },
    });
  }
  const loader = requireFunction(loadCompensationSnapshot, "loadCompensationSnapshot");
  return Object.freeze({
    sourceId: "INCOME_COMPENSATION_SOURCE_ADAPTER",
    authority: ["COMPENSATION_INTELLIGENCE"],
    async load(contextInput) {
      const context = assertContext(contextInput);
      const compensationSnapshot = scopedResult(context, await loader(context));
      return {
        compensationSnapshot,
        sourceConnected: true,
        sourceComplete: true,
      };
    },
  });
}
