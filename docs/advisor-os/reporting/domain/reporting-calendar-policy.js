export const REPORTING_CALENDAR_POLICY_SCHEMA_VERSION =
  "reporting-calendar-policy.v1";

export const REPORTING_CURRENT_PERIOD_MODES =
  Object.freeze([
    "TO_AS_OF",
    "FULL_PERIOD",
  ]);

const INPUT_KEYS =
  new Set([
    "weekStartsOn",
    "fiscalYearStartMonth",
    "fiscalYearStartDay",
    "twoYearAnchorYear",
    "currentPeriodMode",
    "allowFuturePeriods",
  ]);

export class ReportingCalendarPolicyError
  extends TypeError {
  constructor(message) {
    super(
      `ReportingCalendarPolicy: ${message}`,
    );
    this.name =
      "ReportingCalendarPolicyError";
  }
}

function policyError(message) {
  throw new ReportingCalendarPolicyError(
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
    policyError(
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
      policyError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function integerBetween(
  value,
  minimum,
  maximum,
  label,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    policyError(
      `${label} must be an integer between ${minimum} and ${maximum}`,
    );
  }

  return value;
}

function safeInteger(
  value,
  label,
) {
  if (!Number.isSafeInteger(value)) {
    policyError(
      `${label} must be a safe integer`,
    );
  }

  return value;
}

function boolean(
  value,
  label,
) {
  if (typeof value !== "boolean") {
    policyError(
      `${label} must be boolean`,
    );
  }

  return value;
}

export function createReportingCalendarPolicy(
  input = {},
) {
  assertPlainObject(
    input,
    "policy",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "policy",
  );

  const currentPeriodMode =
    input.currentPeriodMode ??
    "TO_AS_OF";

  if (
    !REPORTING_CURRENT_PERIOD_MODES.includes(
      currentPeriodMode,
    )
  ) {
    policyError(
      "currentPeriodMode is not supported",
    );
  }

  return Object.freeze({
    schemaVersion:
      REPORTING_CALENDAR_POLICY_SCHEMA_VERSION,
    weekStartsOn:
      integerBetween(
        input.weekStartsOn ?? 1,
        1,
        7,
        "weekStartsOn",
      ),
    fiscalYearStartMonth:
      integerBetween(
        input.fiscalYearStartMonth ?? 1,
        1,
        12,
        "fiscalYearStartMonth",
      ),
    fiscalYearStartDay:
      integerBetween(
        input.fiscalYearStartDay ?? 1,
        1,
        28,
        "fiscalYearStartDay",
      ),
    twoYearAnchorYear:
      safeInteger(
        input.twoYearAnchorYear ?? 2000,
        "twoYearAnchorYear",
      ),
    currentPeriodMode,
    allowFuturePeriods:
      boolean(
        input.allowFuturePeriods ?? false,
        "allowFuturePeriods",
      ),
    rangeSemantics:
      "INCLUSIVE_DATE",
    timeZoneAuthority:
      "REQUEST_IANA_TIME_ZONE",
    asOfAuthority:
      "REQUEST_CANONICAL_INSTANT",
  });
}
