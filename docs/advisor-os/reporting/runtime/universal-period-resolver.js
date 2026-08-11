import {
  createHash,
} from "node:crypto";

import {
  REPORTING_CALENDAR_POLICY_SCHEMA_VERSION,
  createReportingCalendarPolicy,
} from "../domain/reporting-calendar-policy.js";

export const UNIVERSAL_PERIOD_RESOLVER_SCHEMA_VERSION =
  "universal-period-resolver.v1";

export const RESOLVED_REPORT_PERIOD_SCHEMA_VERSION =
  "resolved-report-period.v1";

export const RESOLVED_UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION =
  "resolved-universal-report-request.v1";

export const UNIVERSAL_PERIOD_RESOLVER_CAPABILITIES =
  Object.freeze([
    "TO_DATE_PERIODS",
    "CALENDAR_PERIODS",
    "ROLLING_PERIODS",
    "CUSTOM_RANGE",
    "FISCAL_YEAR_POLICY",
    "IANA_TIME_ZONE",
    "INCLUSIVE_DATE_RANGE",
  ]);

export const CANONICAL_REPORT_PERIOD_KINDS =
  Object.freeze([
    "TODAY",
    "WEEK_TO_DATE",
    "MONTH_TO_DATE",
    "QUARTER_TO_DATE",
    "YEAR_TO_DATE",
    "FISCAL_YEAR_TO_DATE",
    "CALENDAR_WEEK",
    "CALENDAR_MONTH",
    "CALENDAR_TWO_MONTH_PERIOD",
    "CALENDAR_QUARTER",
    "CALENDAR_HALF_YEAR",
    "CALENDAR_YEAR",
    "CALENDAR_TWO_YEAR_PERIOD",
    "ROLLING_7_DAYS",
    "ROLLING_30_DAYS",
    "ROLLING_90_DAYS",
    "ROLLING_365_DAYS",
    "ROLLING_12_MONTHS",
    "CUSTOM_RANGE",
  ]);

export const REPORT_PERIOD_KIND_ALIASES =
  Object.freeze({
    WTD:
      "WEEK_TO_DATE",
    MTD:
      "MONTH_TO_DATE",
    QTD:
      "QUARTER_TO_DATE",
    YTD:
      "YEAR_TO_DATE",
    FYTD:
      "FISCAL_YEAR_TO_DATE",
    SEMIANNUAL:
      "CALENDAR_HALF_YEAR",
    BIENNIAL:
      "CALENDAR_TWO_YEAR_PERIOD",
  });

const RESOLVER_INPUT_KEYS =
  new Set([
    "policy",
  ]);

const PERIOD_PARAMETER_KEYS =
  Object.freeze({
    TODAY:
      new Set(),
    WEEK_TO_DATE:
      new Set(),
    MONTH_TO_DATE:
      new Set(),
    QUARTER_TO_DATE:
      new Set(),
    YEAR_TO_DATE:
      new Set(),
    FISCAL_YEAR_TO_DATE:
      new Set(),
    CALENDAR_WEEK:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_MONTH:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_TWO_MONTH_PERIOD:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_QUARTER:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_HALF_YEAR:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_YEAR:
      new Set([
        "referenceDate",
      ]),
    CALENDAR_TWO_YEAR_PERIOD:
      new Set([
        "referenceDate",
      ]),
    ROLLING_7_DAYS:
      new Set(),
    ROLLING_30_DAYS:
      new Set(),
    ROLLING_90_DAYS:
      new Set(),
    ROLLING_365_DAYS:
      new Set(),
    ROLLING_12_MONTHS:
      new Set(),
    CUSTOM_RANGE:
      new Set([
        "from",
        "to",
      ]),
  });

const REQUEST_SCHEMA =
  "universal-report-request.v1";

const PERIOD_INPUT_SCHEMA =
  "report-period-input.v1";

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/u;

const MILLISECONDS_PER_DAY =
  86_400_000;

export class UniversalPeriodResolverError
  extends TypeError {
  constructor(message) {
    super(
      `UniversalPeriodResolver: ${message}`,
    );
    this.name =
      "UniversalPeriodResolverError";
  }
}

function resolverError(message) {
  throw new UniversalPeriodResolverError(
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
    resolverError(
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
      resolverError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function canonicalInstant(
  value,
  label,
) {
  const candidate =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      candidate.getTime(),
    )
  ) {
    resolverError(
      `${label} must be an ISO instant`,
    );
  }

  return candidate.toISOString();
}

function canonicalTimeZone(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    resolverError(
      `${label} must be an IANA time zone`,
    );
  }

  const normalized =
    value.trim();

  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          normalized,
      },
    ).format(
      new Date(0),
    );
  } catch {
    resolverError(
      `${label} must be an IANA time zone`,
    );
  }

  return normalized;
}

function parseDate(
  value,
  label,
) {
  if (typeof value !== "string") {
    resolverError(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const match =
    DATE_PATTERN.exec(
      value,
    );

  if (!match) {
    resolverError(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const date = {
    year:
      Number(match[1]),
    month:
      Number(match[2]),
    day:
      Number(match[3]),
  };
  const candidate =
    new Date(
      Date.UTC(
        date.year,
        date.month - 1,
        date.day,
      ),
    );

  if (
    candidate.getUTCFullYear() !==
      date.year ||
    candidate.getUTCMonth() + 1 !==
      date.month ||
    candidate.getUTCDate() !==
      date.day
  ) {
    resolverError(
      `${label} is not a valid date`,
    );
  }

  return date;
}

function formatDate(date) {
  return [
    String(date.year)
      .padStart(4, "0"),
    String(date.month)
      .padStart(2, "0"),
    String(date.day)
      .padStart(2, "0"),
  ].join("-");
}

function dateSerial(date) {
  return Math.floor(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day,
    ) /
      MILLISECONDS_PER_DAY,
  );
}

function fromDateSerial(serial) {
  const date =
    new Date(
      serial *
        MILLISECONDS_PER_DAY,
    );

  return {
    year:
      date.getUTCFullYear(),
    month:
      date.getUTCMonth() + 1,
    day:
      date.getUTCDate(),
  };
}

function compareDates(
  left,
  right,
) {
  return (
    dateSerial(left) -
    dateSerial(right)
  );
}

function addDays(
  date,
  count,
) {
  return fromDateSerial(
    dateSerial(date) +
      count,
  );
}

function daysInMonth(
  year,
  month,
) {
  return new Date(
    Date.UTC(
      year,
      month,
      0,
    ),
  ).getUTCDate();
}

function addMonths(
  date,
  count,
) {
  const totalMonths =
    date.year * 12 +
    (date.month - 1) +
    count;
  const year =
    Math.floor(
      totalMonths / 12,
    );
  const monthIndex =
    totalMonths -
    year * 12;
  const month =
    monthIndex + 1;

  return {
    year,
    month,
    day:
      Math.min(
        date.day,
        daysInMonth(
          year,
          month,
        ),
      ),
  };
}

function startOfMonth(date) {
  return {
    year:
      date.year,
    month:
      date.month,
    day: 1,
  };
}

function endOfMonth(date) {
  return {
    year:
      date.year,
    month:
      date.month,
    day:
      daysInMonth(
        date.year,
        date.month,
      ),
  };
}

function startOfYear(date) {
  return {
    year:
      date.year,
    month: 1,
    day: 1,
  };
}

function endOfYear(date) {
  return {
    year:
      date.year,
    month: 12,
    day: 31,
  };
}

function isoDayOfWeek(date) {
  const day =
    new Date(
      Date.UTC(
        date.year,
        date.month - 1,
        date.day,
      ),
    ).getUTCDay();

  return day === 0
    ? 7
    : day;
}

function startOfWeek(
  date,
  weekStartsOn,
) {
  const offset =
    (
      isoDayOfWeek(date) -
      weekStartsOn +
      7
    ) %
    7;

  return addDays(
    date,
    -offset,
  );
}

function localDateAt(
  instant,
  timeZone,
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      new Date(instant),
    );
  const values =
    Object.fromEntries(
      parts
        .filter(
          (part) =>
            part.type !== "literal",
        )
        .map(
          (part) => [
            part.type,
            part.value,
          ],
        ),
    );

  return parseDate(
    `${values.year}-${values.month}-${values.day}`,
    "local asOf date",
  );
}

function normalizeKind(value) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    resolverError(
      "period.kind must be a non-empty string",
    );
  }

  const inputKind =
    value.trim();

  if (inputKind === "BIANNUAL") {
    resolverError(
      "BIANNUAL is ambiguous; use SEMIANNUAL or BIENNIAL",
    );
  }

  const canonicalKind =
    REPORT_PERIOD_KIND_ALIASES[
      inputKind
    ] ??
    inputKind;

  if (
    !CANONICAL_REPORT_PERIOD_KINDS.includes(
      canonicalKind,
    )
  ) {
    resolverError(
      `period.kind ${inputKind} is not supported`,
    );
  }

  return {
    inputKind,
    canonicalKind,
  };
}

function periodFamily(kind) {
  if (
    kind === "TODAY" ||
    kind.endsWith("_TO_DATE")
  ) {
    return "TO_DATE";
  }

  if (
    kind.startsWith(
      "CALENDAR_",
    )
  ) {
    return "CALENDAR";
  }

  if (
    kind.startsWith(
      "ROLLING_",
    )
  ) {
    return "ROLLING";
  }

  return "CUSTOM";
}

function fiscalRange(
  referenceDate,
  policy,
) {
  const candidate = {
    year:
      referenceDate.year,
    month:
      policy.fiscalYearStartMonth,
    day:
      policy.fiscalYearStartDay,
  };
  const start =
    compareDates(
      referenceDate,
      candidate,
    ) >= 0
      ? candidate
      : {
          ...candidate,
          year:
            candidate.year - 1,
        };

  return {
    from:
      start,
    naturalTo:
      addDays(
        {
          ...start,
          year:
            start.year + 1,
        },
        -1,
      ),
  };
}

function calendarRange(
  kind,
  referenceDate,
  policy,
) {
  switch (kind) {
    case "CALENDAR_WEEK": {
      const from =
        startOfWeek(
          referenceDate,
          policy.weekStartsOn,
        );

      return {
        from,
        naturalTo:
          addDays(
            from,
            6,
          ),
      };
    }

    case "CALENDAR_MONTH": {
      return {
        from:
          startOfMonth(
            referenceDate,
          ),
        naturalTo:
          endOfMonth(
            referenceDate,
          ),
      };
    }

    case "CALENDAR_TWO_MONTH_PERIOD": {
      const startMonth =
        Math.floor(
          (referenceDate.month - 1) /
            2,
        ) *
          2 +
        1;
      const from = {
        year:
          referenceDate.year,
        month:
          startMonth,
        day: 1,
      };

      return {
        from,
        naturalTo:
          endOfMonth(
            addMonths(
              from,
              1,
            ),
          ),
      };
    }

    case "CALENDAR_QUARTER": {
      const startMonth =
        Math.floor(
          (referenceDate.month - 1) /
            3,
        ) *
          3 +
        1;
      const from = {
        year:
          referenceDate.year,
        month:
          startMonth,
        day: 1,
      };

      return {
        from,
        naturalTo:
          endOfMonth(
            addMonths(
              from,
              2,
            ),
          ),
      };
    }

    case "CALENDAR_HALF_YEAR": {
      const startMonth =
        referenceDate.month <= 6
          ? 1
          : 7;
      const from = {
        year:
          referenceDate.year,
        month:
          startMonth,
        day: 1,
      };

      return {
        from,
        naturalTo:
          endOfMonth(
            addMonths(
              from,
              5,
            ),
          ),
      };
    }

    case "CALENDAR_YEAR": {
      return {
        from:
          startOfYear(
            referenceDate,
          ),
        naturalTo:
          endOfYear(
            referenceDate,
          ),
      };
    }

    case "CALENDAR_TWO_YEAR_PERIOD": {
      const anchor =
        policy.twoYearAnchorYear;
      const startYear =
        anchor +
        Math.floor(
          (
            referenceDate.year -
            anchor
          ) /
            2,
        ) *
          2;

      return {
        from: {
          year:
            startYear,
          month: 1,
          day: 1,
        },
        naturalTo: {
          year:
            startYear + 1,
          month: 12,
          day: 31,
        },
      };
    }

    default:
      resolverError(
        `calendar kind ${kind} is not supported`,
      );
  }
}

function toDateRange(
  kind,
  referenceDate,
  policy,
) {
  switch (kind) {
    case "TODAY":
      return {
        from:
          referenceDate,
        naturalTo:
          referenceDate,
      };

    case "WEEK_TO_DATE":
      return {
        from:
          startOfWeek(
            referenceDate,
            policy.weekStartsOn,
          ),
        naturalTo:
          addDays(
            startOfWeek(
              referenceDate,
              policy.weekStartsOn,
            ),
            6,
          ),
      };

    case "MONTH_TO_DATE":
      return {
        from:
          startOfMonth(
            referenceDate,
          ),
        naturalTo:
          endOfMonth(
            referenceDate,
          ),
      };

    case "QUARTER_TO_DATE": {
      const startMonth =
        Math.floor(
          (referenceDate.month - 1) /
            3,
        ) *
          3 +
        1;
      const from = {
        year:
          referenceDate.year,
        month:
          startMonth,
        day: 1,
      };

      return {
        from,
        naturalTo:
          endOfMonth(
            addMonths(
              from,
              2,
            ),
          ),
      };
    }

    case "YEAR_TO_DATE":
      return {
        from:
          startOfYear(
            referenceDate,
          ),
        naturalTo:
          endOfYear(
            referenceDate,
          ),
      };

    case "FISCAL_YEAR_TO_DATE":
      return fiscalRange(
        referenceDate,
        policy,
      );

    default:
      resolverError(
        `to-date kind ${kind} is not supported`,
      );
  }
}

function rollingRange(
  kind,
  referenceDate,
) {
  const days = {
    ROLLING_7_DAYS: 7,
    ROLLING_30_DAYS: 30,
    ROLLING_90_DAYS: 90,
    ROLLING_365_DAYS: 365,
  }[kind];

  if (days) {
    return {
      from:
        addDays(
          referenceDate,
          -(days - 1),
        ),
      naturalTo:
        referenceDate,
    };
  }

  if (
    kind ===
    "ROLLING_12_MONTHS"
  ) {
    return {
      from:
        addDays(
          addMonths(
            referenceDate,
            -12,
          ),
          1,
        ),
      naturalTo:
        referenceDate,
    };
  }

  resolverError(
    `rolling kind ${kind} is not supported`,
  );
}

function resolveRange({
  kind,
  parameters,
  referenceDate,
  localAsOfDate,
  policy,
}) {
  if (
    kind === "CUSTOM_RANGE"
  ) {
    const from =
      parseDate(
        parameters.from,
        "period.parameters.from",
      );
    const to =
      parseDate(
        parameters.to,
        "period.parameters.to",
      );

    if (
      compareDates(
        from,
        to,
      ) > 0
    ) {
      resolverError(
        "custom range from must be on or before to",
      );
    }

    if (
      !policy.allowFuturePeriods &&
      compareDates(
        to,
        localAsOfDate,
      ) > 0
    ) {
      resolverError(
        "custom range cannot extend beyond local asOf date",
      );
    }

    return {
      from,
      to,
      naturalTo:
        to,
      isPartial:
        false,
    };
  }

  if (
    !policy.allowFuturePeriods &&
    compareDates(
      referenceDate,
      localAsOfDate,
    ) > 0
  ) {
    resolverError(
      "referenceDate cannot be after local asOf date",
    );
  }

  const family =
    periodFamily(kind);
  const base =
    family === "TO_DATE"
      ? toDateRange(
          kind,
          referenceDate,
          policy,
        )
      : family === "CALENDAR"
        ? calendarRange(
            kind,
            referenceDate,
            policy,
          )
        : rollingRange(
            kind,
            referenceDate,
          );

  if (
    family === "TO_DATE"
  ) {
    return {
      ...base,
      to:
        referenceDate,
      isPartial:
        compareDates(
          referenceDate,
          base.naturalTo,
        ) < 0,
    };
  }

  if (
    family === "ROLLING"
  ) {
    return {
      ...base,
      to:
        referenceDate,
      isPartial:
        false,
    };
  }

  const containsAsOf =
    compareDates(
      localAsOfDate,
      base.from,
    ) >= 0 &&
    compareDates(
      localAsOfDate,
      base.naturalTo,
    ) <= 0;

  if (
    containsAsOf &&
    policy.currentPeriodMode ===
      "TO_AS_OF"
  ) {
    return {
      ...base,
      to:
        localAsOfDate,
      isPartial:
        compareDates(
          localAsOfDate,
          base.naturalTo,
        ) < 0,
    };
  }

  return {
    ...base,
    to:
      base.naturalTo,
    isPartial:
      false,
  };
}

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      canonicalize,
    );
  }

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    result[key] =
      canonicalize(
        value[key],
      );
  }

  return result;
}

function digest(value) {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        canonicalize(value),
      ),
    )
    .digest("hex");
}

function deepFreeze(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of
    Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

function normalizePeriodInput(
  period,
) {
  assertPlainObject(
    period,
    "period",
  );

  if (
    period.schemaVersion !==
    PERIOD_INPUT_SCHEMA
  ) {
    resolverError(
      "period schemaVersion is not supported",
    );
  }

  if (
    period.resolutionStatus !==
    "PENDING_REP_02"
  ) {
    resolverError(
      "period resolutionStatus is not pending REP-02",
    );
  }

  const kinds =
    normalizeKind(
      period.kind,
    );
  const parameters =
    period.parameters ??
    {};

  assertPlainObject(
    parameters,
    "period.parameters",
  );

  const allowed =
    PERIOD_PARAMETER_KEYS[
      kinds.canonicalKind
    ];

  assertExactKeys(
    parameters,
    allowed,
    "period.parameters",
  );

  if (
    kinds.canonicalKind ===
      "CUSTOM_RANGE" &&
    (
      !Object.hasOwn(
        parameters,
        "from",
      ) ||
      !Object.hasOwn(
        parameters,
        "to",
      )
    )
  ) {
    resolverError(
      "CUSTOM_RANGE requires from and to",
    );
  }

  return {
    ...kinds,
    parameters,
  };
}

export function createUniversalPeriodResolver(
  input = {},
) {
  assertPlainObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    RESOLVER_INPUT_KEYS,
    "input",
  );

  const policy =
    input.policy?.schemaVersion ===
      REPORTING_CALENDAR_POLICY_SCHEMA_VERSION
      ? input.policy
      : createReportingCalendarPolicy(
          input.policy ??
          {},
        );

  const resolver = {
    schemaVersion:
      UNIVERSAL_PERIOD_RESOLVER_SCHEMA_VERSION,
    policy,
    capabilities:
      UNIVERSAL_PERIOD_RESOLVER_CAPABILITIES,
    supportedKinds:
      CANONICAL_REPORT_PERIOD_KINDS,
    aliases:
      REPORT_PERIOD_KIND_ALIASES,
    boundary: {
      reportingAuthority:
        true,
      domainTruthAuthority:
        false,
      providerExecutionAuthorized:
        false,
      aggregationAuthorized:
        false,
      comparisonAuthorized:
        false,
      exportAuthorized:
        false,
      uiRenderingAuthorized:
        false,
      persistenceMutationAuthorized:
        false,
    },

    resolvePeriod({
      period,
      timeZone,
      asOf,
    } = {}) {
      const normalized =
        normalizePeriodInput(
          period,
        );
      const canonicalAsOf =
        canonicalInstant(
          asOf,
          "asOf",
        );
      const canonicalZone =
        canonicalTimeZone(
          timeZone,
          "timeZone",
        );
      const localAsOfDate =
        localDateAt(
          canonicalAsOf,
          canonicalZone,
        );
      const referenceDate =
        normalized.parameters
          .referenceDate
          ? parseDate(
              normalized.parameters
                .referenceDate,
              "period.parameters.referenceDate",
            )
          : localAsOfDate;
      const range =
        resolveRange({
          kind:
            normalized.canonicalKind,
          parameters:
            normalized.parameters,
          referenceDate,
          localAsOfDate,
          policy,
        });
      const from =
        formatDate(
          range.from,
        );
      const to =
        formatDate(
          range.to,
        );
      const naturalTo =
        formatDate(
          range.naturalTo,
        );
      const dayCount =
        dateSerial(
          range.to,
        ) -
        dateSerial(
          range.from,
        ) +
        1;

      if (dayCount < 1) {
        resolverError(
          "resolved period must contain at least one day",
        );
      }

      const identity = {
        schemaVersion:
          RESOLVED_REPORT_PERIOD_SCHEMA_VERSION,
        sourceSchemaVersion:
          PERIOD_INPUT_SCHEMA,
        inputKind:
          normalized.inputKind,
        kind:
          normalized.canonicalKind,
        family:
          periodFamily(
            normalized.canonicalKind,
          ),
        from,
        to,
        naturalTo,
        asOf:
          canonicalAsOf,
        localAsOfDate:
          formatDate(
            localAsOfDate,
          ),
        timeZone:
          canonicalZone,
        dayCount,
        inclusive:
          true,
        isPartial:
          range.isPartial,
        parameters:
          normalized.parameters,
        policy,
      };

      return deepFreeze({
        ...identity,
        periodKey:
          `report-period:${digest(identity)}`,
        resolutionStatus:
          "RESOLVED",
      });
    },

    resolveRequest(request) {
      assertPlainObject(
        request,
        "request",
      );

      if (
        request.schemaVersion !==
        REQUEST_SCHEMA
      ) {
        resolverError(
          "request schemaVersion is not supported",
        );
      }

      if (
        request.status !==
        "IDENTIFIED_NOT_EXECUTED"
      ) {
        resolverError(
          "request status is not supported",
        );
      }

      const period =
        this.resolvePeriod({
          period:
            request.period,
          timeZone:
            request.timeZone,
          asOf:
            request.asOf,
        });
      const identity = {
        schemaVersion:
          RESOLVED_UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
        sourceSchemaVersion:
          request.schemaVersion,
        sourceRequestKey:
          request.requestKey,
        authority:
          request.authority,
        definitionId:
          request.definitionId,
        provider:
          request.provider,
        period,
        timeZone:
          request.timeZone,
        asOf:
          request.asOf,
        dimensions:
          request.dimensions,
        measures:
          request.measures,
        metadata:
          request.metadata,
      };

      return deepFreeze({
        ...identity,
        resolvedRequestKey:
          `resolved-report-request:${digest(identity)}`,
        status:
          "PERIOD_RESOLVED_NOT_EXECUTED",
        boundary: {
          providerExecutionAuthorized:
            false,
          periodResolutionComplete:
            true,
          aggregationAuthorized:
            false,
          comparisonAuthorized:
            false,
          exportAuthorized:
            false,
          uiRenderingAuthorized:
            false,
          persistenceMutationAuthorized:
            false,
          domainTruthOwnedByKernel:
            false,
        },
      });
    },
  };

  return deepFreeze(
    resolver,
  );
}
