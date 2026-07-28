import {
  assertActivityRepositoryPort,
} from "../application/activity-repository-port.mjs";

import {
  createActivityFeedProjectionService,
} from "../application/activity-feed-projector.mjs";

import {
  createActivityPeriodAggregationService,
} from "../application/activity-period-aggregator.mjs";

import {
  SupabaseActivityRepository,
} from "../infrastructure/supabase-activity-repository.mjs";

export const ACTIVITY_READ_RUNTIME_SCHEMA_VERSION =
  "activity-read-runtime.v1";

export const ACTIVITY_READ_RUNTIME_CAPABILITIES =
  Object.freeze([
    "ACTIVITY_FEED",
    "ACTIVITY_PERIOD_AGGREGATION",
  ]);

const RUNTIME_KEYS = new Set([
  "repository",
  "organizationId",
  "advisorId",
  "clock",
  "feed",
  "aggregation",
]);

const SUPABASE_RUNTIME_KEYS = new Set([
  "client",
  "organizationId",
  "advisorId",
  "clock",
  "feed",
  "aggregation",
]);

const OPTION_KEYS = new Set([
  "pageSize",
  "maxRecords",
]);

export class ActivityReadRuntimeError
  extends TypeError {
  constructor(message) {
    super(`ActivityReadRuntime: ${message}`);
    this.name = "ActivityReadRuntimeError";
  }
}

function runtimeError(message) {
  throw new ActivityReadRuntimeError(message);
}

function assertPlainObject(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    runtimeError(
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
      runtimeError(
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
    runtimeError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function normalizeClock(value) {
  if (value === undefined) {
    return () => new Date().toISOString();
  }

  if (typeof value !== "function") {
    runtimeError("clock must be a function");
  }

  return value;
}

function normalizeOptions(
  value,
  label,
) {
  if (value === undefined) {
    return Object.freeze({});
  }

  assertPlainObject(value, label);
  assertExactKeys(
    value,
    OPTION_KEYS,
    label,
  );

  return Object.freeze({ ...value });
}

function canonicalClockInstant(clock) {
  const value = clock();

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    runtimeError(
      "clock must return an ISO instant string",
    );
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    runtimeError(
      "clock returned an invalid ISO instant",
    );
  }

  return parsed.toISOString();
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

function authorityBoundQuery(
  queryInput,
  {
    organizationId,
    advisorId,
    clock,
    operation,
  },
) {
  if (queryInput === undefined) {
    queryInput = {};
  }

  assertPlainObject(
    queryInput,
    `${operation} query`,
  );

  if (
    Object.prototype.hasOwnProperty.call(
      queryInput,
      "organizationId",
    )
  ) {
    runtimeError(
      `${operation} query cannot override organizationId`,
    );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      queryInput,
      "advisorId",
    )
  ) {
    runtimeError(
      `${operation} query cannot override advisorId`,
    );
  }

  return {
    ...queryInput,
    organizationId,
    advisorId,
    asOf:
      queryInput.asOf ??
      canonicalClockInstant(clock),
  };
}

export function createActivityReadRuntime(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    RUNTIME_KEYS,
    "input",
  );

  const repository =
    assertActivityRepositoryPort(
      input.repository,
    );
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
  const clock =
    normalizeClock(input.clock);
  const feedOptions =
    normalizeOptions(input.feed, "feed");
  const aggregationOptions =
    normalizeOptions(
      input.aggregation,
      "aggregation",
    );

  const feedService =
    createActivityFeedProjectionService({
      repository,
      ...feedOptions,
    });
  const aggregationService =
    createActivityPeriodAggregationService({
      repository,
      ...aggregationOptions,
    });

  return deepFreeze({
    schemaVersion:
      ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
    authority: {
      organizationId,
      advisorId,
    },
    capabilities:
      ACTIVITY_READ_RUNTIME_CAPABILITIES,

    async feed(queryInput = {}) {
      return feedService.project(
        authorityBoundQuery(
          queryInput,
          {
            organizationId,
            advisorId,
            clock,
            operation: "feed",
          },
        ),
      );
    },

    async aggregatePeriod(queryInput) {
      return aggregationService.aggregate(
        authorityBoundQuery(
          queryInput,
          {
            organizationId,
            advisorId,
            clock,
            operation: "aggregatePeriod",
          },
        ),
      );
    },
  });
}

export function createSupabaseActivityReadRuntime(
  input,
) {
  assertPlainObject(input, "input");
  assertExactKeys(
    input,
    SUPABASE_RUNTIME_KEYS,
    "input",
  );

  const {
    client,
    organizationId,
    advisorId,
    clock,
    feed,
    aggregation,
  } = input;

  const repository =
    new SupabaseActivityRepository({
      client,
    });

  return createActivityReadRuntime({
    repository,
    organizationId,
    advisorId,
    clock,
    feed,
    aggregation,
  });
}
