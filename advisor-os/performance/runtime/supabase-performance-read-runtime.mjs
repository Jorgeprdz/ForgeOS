import {
  createSupabaseActivityReadRuntime,
} from "../../activity/runtime/activity-read-runtime.mjs";

import {
  PERFORMANCE_SCORING_POLICY_V1,
  assertPerformanceScoringPolicy,
} from "../domain/performance-scoring-policy.mjs";

import {
  createPerformancePeriodRuntime,
} from "./performance-period-runtime.mjs";

import {
  PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION,
  createPerformanceReadRuntime,
} from "./performance-read-runtime.mjs";

export const PERFORMANCE_SUPABASE_READ_COMPOSITION_SCHEMA_VERSION =
  "performance-supabase-read-composition.v1";

export const PERFORMANCE_SUPABASE_READ_COMPOSITION_CAPABILITIES =
  Object.freeze([
    "PERFORMANCE_DAILY_READ_MODEL",
    "PERFORMANCE_PERIOD_READ_MODEL",
    "SUPABASE_ACTIVITY_READ_COMPOSITION",
  ]);

const INPUT_KEYS = new Set([
  "client",
  "organizationId",
  "advisorId",
  "clock",
  "policy",
  "maxDays",
  "activityAggregation",
]);

export class PerformanceSupabaseReadCompositionError
  extends TypeError {
  constructor(message) {
    super(
      `PerformanceSupabaseReadComposition: ${message}`,
    );
    this.name =
      "PerformanceSupabaseReadCompositionError";
  }
}

function compositionError(message) {
  throw new PerformanceSupabaseReadCompositionError(
    message,
  );
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    compositionError(
      `${label} must be a plain object`,
    );
  }
}

function assertExactKeys(
  value,
  allowed,
  label,
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      compositionError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function requiredString(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    compositionError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function assertClient(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    typeof value.rpc !== "function"
  ) {
    compositionError(
      "client must expose rpc(name, parameters)",
    );
  }

  return value;
}

function normalizeOptionalObject(
  value,
  label,
) {
  if (value === undefined) {
    return undefined;
  }

  assertPlainObject(value, label);

  return Object.freeze({ ...value });
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

export function createSupabasePerformanceReadRuntime(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  const client =
    assertClient(input.client);
  const organizationId =
    requiredString(
      input.organizationId,
      "organizationId",
    );
  const advisorId =
    requiredString(
      input.advisorId,
      "advisorId",
    );
  const policy =
    assertPerformanceScoringPolicy(
      input.policy ??
        PERFORMANCE_SCORING_POLICY_V1,
    );
  const activityAggregation =
    normalizeOptionalObject(
      input.activityAggregation,
      "activityAggregation",
    );

  const activityRuntime =
    createSupabaseActivityReadRuntime({
      client,
      organizationId,
      advisorId,
      clock: input.clock,
      aggregation:
        activityAggregation,
    });

  const performanceRuntime =
    createPerformancePeriodRuntime({
      activityRuntime,
      policy,
      clock: input.clock,
      maxDays: input.maxDays,
    });

  const readRuntime =
    createPerformanceReadRuntime({
      performanceRuntime,
    });

  if (
    readRuntime.schemaVersion !==
    PERFORMANCE_READ_RUNTIME_SCHEMA_VERSION
  ) {
    compositionError(
      "read runtime schemaVersion is not supported",
    );
  }

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_SUPABASE_READ_COMPOSITION_SCHEMA_VERSION,
    readRuntimeSchemaVersion:
      readRuntime.schemaVersion,
    authority: {
      organizationId,
      advisorId,
    },
    policy: {
      schemaVersion:
        readRuntime.policy.schemaVersion,
      policyId:
        readRuntime.policy.policyId,
      dailyTargetPoints:
        readRuntime.policy.dailyTargetPoints,
    },
    maxDays:
      readRuntime.maxDays,
    capabilities:
      PERFORMANCE_SUPABASE_READ_COMPOSITION_CAPABILITIES,
    persistence: {
      kind:
        "SUPABASE_ACTIVITY_RPC",
      mode:
        "READ_ONLY",
      listRpc:
        "activity_records_list_v1",
      directTableAccess:
        false,
      appendAuthorized:
        false,
      schemaMutationAuthorized:
        false,
    },

    async readDay(query) {
      return readRuntime.readDay(query);
    },

    async readPeriod(query) {
      return readRuntime.readPeriod(query);
    },
  });
}
