import {
  projectPerformanceDailyReadModel,
  projectPerformancePeriodReadModel,
} from "../application/performance-read-model-projector.mjs";

export const PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION =
  "performance-read-runtime.v1";

export const PERFORMANCE_READ_RUNTIME_CAPABILITIES =
  Object.freeze([
    "PERFORMANCE_DAILY_READ_MODEL",
    "PERFORMANCE_PERIOD_READ_MODEL",
  ]);

const SOURCE_SCHEMA =
  "performance-period-runtime.v1";

const REQUIRED_CAPABILITIES = [
  "PERFORMANCE_DAILY_SCORE",
  "PERFORMANCE_PERIOD_SERIES",
];

export class PerformanceReadRuntimeError
  extends TypeError {
  constructor(message) {
    super(`PerformanceReadRuntime: ${message}`);
    this.name = "PerformanceReadRuntimeError";
  }
}

function error(message) {
  throw new PerformanceReadRuntimeError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    error(`${label} must be a plain object`);
  }
}

function string(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    error(`${label} must be a non-empty string`);
  }

  return value.trim();
}

function freeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    freeze(nested);
  }

  return Object.freeze(value);
}

export function createPerformanceReadRuntime({
  performanceRuntime,
} = {}) {
  plain(performanceRuntime, "performanceRuntime");

  if (performanceRuntime.schemaVersion !== SOURCE_SCHEMA) {
    error("performanceRuntime schemaVersion is not supported");
  }

  plain(
    performanceRuntime.authority,
    "performanceRuntime.authority",
  );
  plain(
    performanceRuntime.policy,
    "performanceRuntime.policy",
  );

  if (!Array.isArray(performanceRuntime.capabilities)) {
    error("performanceRuntime.capabilities must be an array");
  }

  for (const capability of REQUIRED_CAPABILITIES) {
    if (
      !performanceRuntime.capabilities.includes(
        capability,
      )
    ) {
      error(`performanceRuntime lacks ${capability}`);
    }
  }

  if (typeof performanceRuntime.scoreDay !== "function") {
    error("performanceRuntime.scoreDay must be a function");
  }

  if (
    typeof performanceRuntime.scorePeriod !==
    "function"
  ) {
    error("performanceRuntime.scorePeriod must be a function");
  }

  return freeze({
    schemaVersion:
      PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION,
    authority: {
      organizationId:
        string(
          performanceRuntime.authority.organizationId,
          "performanceRuntime.authority.organizationId",
        ),
      advisorId:
        string(
          performanceRuntime.authority.advisorId,
          "performanceRuntime.authority.advisorId",
        ),
    },
    policy: {
      schemaVersion:
        string(
          performanceRuntime.policy.schemaVersion,
          "performanceRuntime.policy.schemaVersion",
        ),
      policyId:
        string(
          performanceRuntime.policy.policyId,
          "performanceRuntime.policy.policyId",
        ),
      dailyTargetPoints:
        performanceRuntime.policy.dailyTargetPoints,
    },
    maxDays: performanceRuntime.maxDays,
    capabilities:
      PERFORMANCE_READ_RUNTIME_CAPABILITIES,

    async readDay(query) {
      return projectPerformanceDailyReadModel(
        await performanceRuntime.scoreDay(query),
      );
    },

    async readPeriod(query) {
      return projectPerformancePeriodReadModel(
        await performanceRuntime.scorePeriod(query),
      );
    },
  });
}
