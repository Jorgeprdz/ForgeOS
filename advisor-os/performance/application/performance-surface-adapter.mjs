import {
  createSupabasePerformanceReadRuntime,
} from "../runtime/supabase-performance-read-runtime.mjs";

export const PERFORMANCE_SURFACE_ADAPTER_SCHEMA_VERSION =
  "performance-surface-adapter.v1";

export const PERFORMANCE_DAILY_SURFACE_SCHEMA_VERSION =
  "performance-daily-surface.v1";

export const PERFORMANCE_PERIOD_SURFACE_SCHEMA_VERSION =
  "performance-period-surface.v1";

export const PERFORMANCE_DASHBOARD_SURFACE_SCHEMA_VERSION =
  "performance-dashboard-surface.v1";

export const PERFORMANCE_SURFACE_ADAPTER_CAPABILITIES =
  Object.freeze([
    "PERFORMANCE_DAILY_SURFACE",
    "PERFORMANCE_PERIOD_SURFACE",
    "PERFORMANCE_DASHBOARD_SURFACE",
  ]);

const SUPPORTED_RUNTIME_SCHEMAS =
  new Set([
    "performance-read-runtime.v1",
    "performance-supabase-read-composition.v1",
  ]);

const DAILY_READ_MODEL_SCHEMA =
  "performance-daily-read-model.v1";

const PERIOD_READ_MODEL_SCHEMA =
  "performance-period-read-model.v1";

const ADAPTER_KEYS =
  new Set([
    "readRuntime",
  ]);

const DAY_QUERY_KEYS =
  new Set([
    "evaluationDate",
    "asOf",
  ]);

const PERIOD_QUERY_KEYS =
  new Set([
    "evaluationDateFrom",
    "evaluationDateTo",
    "asOf",
  ]);

const DASHBOARD_QUERY_KEYS =
  new Set([
    "evaluationDate",
    "evaluationDateFrom",
    "evaluationDateTo",
    "asOf",
  ]);

const PROHIBITED_PRESENTATION_KEYS =
  new Set([
    "title",
    "label",
    "color",
    "icon",
    "component",
    "route",
    "navigation",
    "className",
    "style",
  ]);

export class PerformanceSurfaceAdapterError
  extends TypeError {
  constructor(message) {
    super(
      `PerformanceSurfaceAdapter: ${message}`,
    );
    this.name =
      "PerformanceSurfaceAdapterError";
  }
}

function adapterError(message) {
  throw new PerformanceSurfaceAdapterError(
    message,
  );
}

function assertPlainObject(
  value,
  label,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    adapterError(
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
      adapterError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function requiredString(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    adapterError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function nonNegativeNumber(
  value,
  label,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    adapterError(
      `${label} must be a non-negative number`,
    );
  }

  return value;
}

function nonNegativeInteger(
  value,
  label,
) {
  const normalized =
    nonNegativeNumber(
      value,
      label,
    );

  if (!Number.isSafeInteger(normalized)) {
    adapterError(
      `${label} must be an integer`,
    );
  }

  return normalized;
}

function boolean(
  value,
  label,
) {
  if (typeof value !== "boolean") {
    adapterError(
      `${label} must be boolean`,
    );
  }

  return value;
}

function canonicalInstant(
  value,
  label,
) {
  const input =
    requiredString(
      value,
      label,
    );
  const parsed =
    new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    adapterError(
      `${label} must be an ISO instant`,
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

function assertNoPresentationKeys(
  value,
  path = "value",
) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(
      (item, index) => {
        assertNoPresentationKeys(
          item,
          `${path}[${index}]`,
        );
      },
    );
    return;
  }

  for (const [key, nested] of
    Object.entries(value)) {
    if (
      PROHIBITED_PRESENTATION_KEYS.has(key)
    ) {
      adapterError(
        `${path}.${key} is presentation-owned`,
      );
    }

    assertNoPresentationKeys(
      nested,
      `${path}.${key}`,
    );
  }
}

function normalizeAuthority(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  if (
    value.activityEligibilityAuthority !==
      true ||
    value.activityScoringAuthority !==
      false ||
    value.performancePolicyAuthority !==
      true ||
    value.rankingAuthority !==
      false ||
    value.humanWorthAuthority !==
      false ||
    value.enforcementAuthority !==
      false
  ) {
    adapterError(
      `${label} violates authority boundary`,
    );
  }

  return {
    activityEligibilityAuthority: true,
    activityScoringAuthority: false,
    performancePolicyAuthority: true,
    rankingAuthority: false,
    humanWorthAuthority: false,
    enforcementAuthority: false,
  };
}

function normalizeIdentity(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  return {
    organizationId:
      requiredString(
        value.organizationId,
        `${label}.organizationId`,
      ),
    advisorId:
      requiredString(
        value.advisorId,
        `${label}.advisorId`,
      ),
  };
}

function normalizePolicy(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  return {
    schemaVersion:
      requiredString(
        value.schemaVersion,
        `${label}.schemaVersion`,
      ),
    policyId:
      requiredString(
        value.policyId,
        `${label}.policyId`,
      ),
    dailyTargetPoints:
      nonNegativeInteger(
        value.dailyTargetPoints ??
          value.targetPoints,
        `${label}.dailyTargetPoints`,
      ),
  };
}

function normalizeRuntime(value) {
  assertPlainObject(
    value,
    "readRuntime",
  );

  if (
    !SUPPORTED_RUNTIME_SCHEMAS.has(
      value.schemaVersion,
    )
  ) {
    adapterError(
      "readRuntime schemaVersion is not supported",
    );
  }

  if (
    typeof value.readDay !== "function" ||
    typeof value.readPeriod !== "function"
  ) {
    adapterError(
      "readRuntime must expose readDay and readPeriod",
    );
  }

  if (
    !Array.isArray(value.capabilities) ||
    !value.capabilities.includes(
      "PERFORMANCE_DAILY_READ_MODEL",
    ) ||
    !value.capabilities.includes(
      "PERFORMANCE_PERIOD_READ_MODEL",
    )
  ) {
    adapterError(
      "readRuntime lacks read model capabilities",
    );
  }

  return {
    runtime: value,
    schemaVersion:
      value.schemaVersion,
    identity:
      normalizeIdentity(
        value.authority,
        "readRuntime.authority",
      ),
    policy:
      normalizePolicy(
        value.policy,
        "readRuntime.policy",
      ),
  };
}

function normalizeActivityRows(
  value,
  label,
) {
  if (!Array.isArray(value)) {
    adapterError(
      `${label} must be an array`,
    );
  }

  return value.map(
    (item, index) => {
      assertPlainObject(
        item,
        `${label}[${index}]`,
      );

      const activityType =
        requiredString(
          item.activityType,
          `${label}[${index}].activityType`,
        );

      return {
        key:
          activityType,
        activityType,
        count:
          nonNegativeInteger(
            item.count,
            `${label}[${index}].count`,
          ),
        pointsPerActivity:
          nonNegativeInteger(
            item.pointsPerActivity,
            `${label}[${index}].pointsPerActivity`,
          ),
        awardedPoints:
          nonNegativeInteger(
            item.awardedPoints,
            `${label}[${index}].awardedPoints`,
          ),
        shareOfPointsPercent:
          nonNegativeNumber(
            item.shareOfPointsPercent,
            `${label}[${index}].shareOfPointsPercent`,
          ),
        counted:
          boolean(
            item.counted,
            `${label}[${index}].counted`,
          ),
      };
    },
  );
}

function normalizeExclusions(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );

  const futureRecorded =
    nonNegativeInteger(
      value.futureRecorded,
      `${label}.futureRecorded`,
    );
  const suppressed =
    nonNegativeInteger(
      value.suppressed,
      `${label}.suppressed`,
    );
  const total =
    nonNegativeInteger(
      value.total,
      `${label}.total`,
    );

  if (
    total !==
    futureRecorded + suppressed
  ) {
    adapterError(
      `${label}.total is inconsistent`,
    );
  }

  return {
    futureRecorded,
    suppressed,
    total,
  };
}

function requestKey(parts) {
  return parts.join("\u001f");
}

function projectDailySurface(
  source,
  runtimeSchemaVersion,
) {
  assertPlainObject(
    source,
    "daily read model",
  );

  if (
    source.schemaVersion !==
    DAILY_READ_MODEL_SCHEMA
  ) {
    adapterError(
      "daily read model schemaVersion is not supported",
    );
  }

  assertNoPresentationKeys(
    source,
    "daily read model",
  );

  const identity =
    normalizeIdentity(
      source.identity,
      "daily read model.identity",
    );
  const policy =
    normalizePolicy(
      {
        ...source.policy,
        dailyTargetPoints:
          source.headline?.targetPoints,
      },
      "daily read model.policy",
    );

  assertPlainObject(
    source.period,
    "daily read model.period",
  );
  assertPlainObject(
    source.headline,
    "daily read model.headline",
  );
  assertPlainObject(
    source.activity,
    "daily read model.activity",
  );

  const evaluationDate =
    requiredString(
      source.period.evaluationDate,
      "daily read model.period.evaluationDate",
    );
  const asOf =
    canonicalInstant(
      source.period.asOf,
      "daily read model.period.asOf",
    );
  const totalPoints =
    nonNegativeInteger(
      source.headline.totalPoints,
      "daily read model.headline.totalPoints",
    );
  const targetPoints =
    nonNegativeInteger(
      source.headline.targetPoints,
      "daily read model.headline.targetPoints",
    );
  const rows =
    normalizeActivityRows(
      source.activity.items,
      "daily read model.activity.items",
    );

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_DAILY_SURFACE_SCHEMA_VERSION,
    sourceSchemaVersion:
      source.schemaVersion,
    provenance: {
      runtimeSchemaVersion,
      readModelSchemaVersion:
        source.schemaVersion,
    },
    request: {
      kind: "DAY",
      evaluationDate,
      asOf,
      key:
        requestKey([
          "DAY",
          identity.organizationId,
          identity.advisorId,
          evaluationDate,
          asOf,
          policy.policyId,
        ]),
    },
    identity,
    policy: {
      ...policy,
      dailyTargetPoints:
        targetPoints,
    },
    state:
      source.activity.empty === true
        ? "EMPTY"
        : "READY",
    headline: {
      totalPoints,
      targetPoints,
      remainingPoints:
        nonNegativeInteger(
          source.headline.remainingPoints,
          "daily read model.headline.remainingPoints",
        ),
      excessPoints:
        nonNegativeInteger(
          source.headline.excessPoints,
          "daily read model.headline.excessPoints",
        ),
      progressPercent:
        nonNegativeNumber(
          source.headline.progressPercent,
          "daily read model.headline.progressPercent",
        ),
      uncappedProgressPercent:
        nonNegativeNumber(
          source.headline.uncappedProgressPercent,
          "daily read model.headline.uncappedProgressPercent",
        ),
      progressRatio:
        nonNegativeNumber(
          source.headline.progressRatio,
          "daily read model.headline.progressRatio",
        ),
      targetStatus:
        requiredString(
          source.headline.targetStatus,
          "daily read model.headline.targetStatus",
        ),
    },
    activity: {
      eligibleActivityCount:
        nonNegativeInteger(
          source.activity.eligibleActivityCount,
          "daily read model.activity.eligibleActivityCount",
        ),
      countedActivityCount:
        nonNegativeInteger(
          source.activity.countedActivityCount,
          "daily read model.activity.countedActivityCount",
        ),
      zeroPointActivityCount:
        nonNegativeInteger(
          source.activity.zeroPointActivityCount,
          "daily read model.activity.zeroPointActivityCount",
        ),
      rows,
    },
    exclusions:
      normalizeExclusions(
        source.exclusions,
        "daily read model.exclusions",
      ),
    authority:
      normalizeAuthority(
        source.authority,
        "daily read model.authority",
      ),
  });
}

function projectPeriodSurface(
  source,
  runtimeSchemaVersion,
) {
  assertPlainObject(
    source,
    "period read model",
  );

  if (
    source.schemaVersion !==
    PERIOD_READ_MODEL_SCHEMA
  ) {
    adapterError(
      "period read model schemaVersion is not supported",
    );
  }

  assertNoPresentationKeys(
    source,
    "period read model",
  );

  const identity =
    normalizeIdentity(
      source.identity,
      "period read model.identity",
    );
  const policy =
    normalizePolicy(
      source.policy,
      "period read model.policy",
    );

  assertPlainObject(
    source.period,
    "period read model.period",
  );
  assertPlainObject(
    source.headline,
    "period read model.headline",
  );
  assertPlainObject(
    source.dayStatus,
    "period read model.dayStatus",
  );
  assertPlainObject(
    source.activity,
    "period read model.activity",
  );

  if (!Array.isArray(source.series)) {
    adapterError(
      "period read model.series must be an array",
    );
  }

  const evaluationDateFrom =
    requiredString(
      source.period.evaluationDateFrom,
      "period read model.period.evaluationDateFrom",
    );
  const evaluationDateTo =
    requiredString(
      source.period.evaluationDateTo,
      "period read model.period.evaluationDateTo",
    );
  const asOf =
    canonicalInstant(
      source.period.asOf,
      "period read model.period.asOf",
    );

  const series =
    source.series.map(
      (item, index) => {
        assertPlainObject(
          item,
          `period read model.series[${index}]`,
        );

        const evaluationDate =
          requiredString(
            item.evaluationDate,
            `period read model.series[${index}].evaluationDate`,
          );

        return {
          key:
            evaluationDate,
          evaluationDate,
          totalPoints:
            nonNegativeInteger(
              item.totalPoints,
              `period read model.series[${index}].totalPoints`,
            ),
          targetPoints:
            nonNegativeInteger(
              item.targetPoints,
              `period read model.series[${index}].targetPoints`,
            ),
          remainingPoints:
            nonNegativeInteger(
              item.remainingPoints,
              `period read model.series[${index}].remainingPoints`,
            ),
          progressPercent:
            nonNegativeNumber(
              item.progressPercent,
              `period read model.series[${index}].progressPercent`,
            ),
          targetStatus:
            requiredString(
              item.targetStatus,
              `period read model.series[${index}].targetStatus`,
            ),
          eligibleActivityCount:
            nonNegativeInteger(
              item.eligibleActivityCount,
              `period read model.series[${index}].eligibleActivityCount`,
            ),
        };
      },
    );

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_PERIOD_SURFACE_SCHEMA_VERSION,
    sourceSchemaVersion:
      source.schemaVersion,
    provenance: {
      runtimeSchemaVersion,
      readModelSchemaVersion:
        source.schemaVersion,
    },
    request: {
      kind: "PERIOD",
      evaluationDateFrom,
      evaluationDateTo,
      asOf,
      key:
        requestKey([
          "PERIOD",
          identity.organizationId,
          identity.advisorId,
          evaluationDateFrom,
          evaluationDateTo,
          asOf,
          policy.policyId,
        ]),
    },
    identity,
    policy,
    state:
      source.activity.empty === true
        ? "EMPTY"
        : "READY",
    headline: {
      totalPoints:
        nonNegativeInteger(
          source.headline.totalPoints,
          "period read model.headline.totalPoints",
        ),
      targetPoints:
        nonNegativeInteger(
          source.headline.targetPoints,
          "period read model.headline.targetPoints",
        ),
      remainingPoints:
        nonNegativeInteger(
          source.headline.remainingPoints,
          "period read model.headline.remainingPoints",
        ),
      excessPoints:
        nonNegativeInteger(
          source.headline.excessPoints,
          "period read model.headline.excessPoints",
        ),
      progressPercent:
        nonNegativeNumber(
          source.headline.progressPercent,
          "period read model.headline.progressPercent",
        ),
      uncappedProgressPercent:
        nonNegativeNumber(
          source.headline.uncappedProgressPercent,
          "period read model.headline.uncappedProgressPercent",
        ),
      progressRatio:
        nonNegativeNumber(
          source.headline.progressRatio,
          "period read model.headline.progressRatio",
        ),
      targetStatus:
        requiredString(
          source.headline.targetStatus,
          "period read model.headline.targetStatus",
        ),
      averagePointsPerDay:
        nonNegativeNumber(
          source.headline.averagePointsPerDay,
          "period read model.headline.averagePointsPerDay",
        ),
    },
    dayStatus: {
      targetMetDays:
        nonNegativeInteger(
          source.dayStatus.targetMetDays,
          "period read model.dayStatus.targetMetDays",
        ),
      targetExceededDays:
        nonNegativeInteger(
          source.dayStatus.targetExceededDays,
          "period read model.dayStatus.targetExceededDays",
        ),
      belowTargetDays:
        nonNegativeInteger(
          source.dayStatus.belowTargetDays,
          "period read model.dayStatus.belowTargetDays",
        ),
      successfulDays:
        nonNegativeInteger(
          source.dayStatus.successfulDays,
          "period read model.dayStatus.successfulDays",
        ),
    },
    period: {
      evaluationDateFrom,
      evaluationDateTo,
      asOf,
      dayCount:
        nonNegativeInteger(
          source.period.dayCount,
          "period read model.period.dayCount",
        ),
    },
    series,
    activity: {
      eligibleActivityCount:
        nonNegativeInteger(
          source.activity.eligibleActivityCount,
          "period read model.activity.eligibleActivityCount",
        ),
      rows:
        normalizeActivityRows(
          source.activity.items,
          "period read model.activity.items",
        ),
    },
    exclusions:
      normalizeExclusions(
        source.exclusions,
        "period read model.exclusions",
      ),
    authority:
      normalizeAuthority(
        source.authority,
        "period read model.authority",
      ),
  });
}

function assertSameIdentity(
  left,
  right,
) {
  if (
    left.organizationId !==
      right.organizationId ||
    left.advisorId !==
      right.advisorId
  ) {
    adapterError(
      "dashboard sources have different identity",
    );
  }
}

function assertSamePolicy(
  left,
  right,
) {
  if (
    left.schemaVersion !==
      right.schemaVersion ||
    left.policyId !==
      right.policyId ||
    left.dailyTargetPoints !==
      right.dailyTargetPoints
  ) {
    adapterError(
      "dashboard sources have different policy",
    );
  }
}

export function createPerformanceSurfaceAdapter(
  input,
) {
  assertPlainObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    ADAPTER_KEYS,
    "input",
  );

  const {
    runtime,
    schemaVersion:
      runtimeSchemaVersion,
    identity,
    policy,
  } = normalizeRuntime(
    input.readRuntime,
  );

  return deepFreeze({
    schemaVersion:
      PERFORMANCE_SURFACE_ADAPTER_SCHEMA_VERSION,
    sourceRuntimeSchemaVersion:
      runtimeSchemaVersion,
    identity,
    policy,
    capabilities:
      PERFORMANCE_SURFACE_ADAPTER_CAPABILITIES,

    async loadDay(query) {
      assertPlainObject(
        query,
        "loadDay query",
      );
      assertExactKeys(
        query,
        DAY_QUERY_KEYS,
        "loadDay query",
      );

      return projectDailySurface(
        await runtime.readDay(query),
        runtimeSchemaVersion,
      );
    },

    async loadPeriod(query) {
      assertPlainObject(
        query,
        "loadPeriod query",
      );
      assertExactKeys(
        query,
        PERIOD_QUERY_KEYS,
        "loadPeriod query",
      );

      return projectPeriodSurface(
        await runtime.readPeriod(query),
        runtimeSchemaVersion,
      );
    },

    async loadDashboard(query) {
      assertPlainObject(
        query,
        "loadDashboard query",
      );
      assertExactKeys(
        query,
        DASHBOARD_QUERY_KEYS,
        "loadDashboard query",
      );

      const asOf =
        canonicalInstant(
          query.asOf,
          "loadDashboard query.asOf",
        );

      const [day, period] =
        await Promise.all([
          this.loadDay({
            evaluationDate:
              query.evaluationDate,
            asOf,
          }),
          this.loadPeriod({
            evaluationDateFrom:
              query.evaluationDateFrom,
            evaluationDateTo:
              query.evaluationDateTo,
            asOf,
          }),
        ]);

      assertSameIdentity(
        day.identity,
        period.identity,
      );
      assertSamePolicy(
        day.policy,
        period.policy,
      );

      return deepFreeze({
        schemaVersion:
          PERFORMANCE_DASHBOARD_SURFACE_SCHEMA_VERSION,
        adapterSchemaVersion:
          PERFORMANCE_SURFACE_ADAPTER_SCHEMA_VERSION,
        request: {
          kind: "DASHBOARD",
          evaluationDate:
            day.request.evaluationDate,
          evaluationDateFrom:
            period.request.evaluationDateFrom,
          evaluationDateTo:
            period.request.evaluationDateTo,
          asOf,
          key:
            requestKey([
              "DASHBOARD",
              day.identity.organizationId,
              day.identity.advisorId,
              day.request.evaluationDate,
              period.request.evaluationDateFrom,
              period.request.evaluationDateTo,
              asOf,
              day.policy.policyId,
            ]),
        },
        identity:
          day.identity,
        policy:
          day.policy,
        state:
          day.state === "EMPTY" &&
          period.state === "EMPTY"
            ? "EMPTY"
            : "READY",
        day,
        period,
        authority:
          day.authority,
        presentationBoundary: {
          labelsOwnedByUi: true,
          colorsOwnedByUi: true,
          iconsOwnedByUi: true,
          componentsOwnedByUi: true,
          navigationOwnedByUi: true,
        },
      });
    },
  });
}

export function createSupabasePerformanceSurfaceAdapter(
  input,
) {
  return createPerformanceSurfaceAdapter({
    readRuntime:
      createSupabasePerformanceReadRuntime(
        input,
      ),
  });
}
