import {
  createHash,
} from "node:crypto";

export const COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION =
  "commission-report-period-read-model.v1";

export const COMMISSION_REPORT_ENTRY_SCHEMA_VERSION =
  "commission-report-entry.v1";

export const COMMISSION_REPORT_EXCLUSIONS_SCHEMA_VERSION =
  "commission-report-exclusions.v1";

export const COMMISSION_REPORT_KINDS =
  Object.freeze([
    "INITIAL",
    "RENEWAL",
  ]);

const MODEL_KEYS =
  new Set([
    "schemaVersion",
    "sourceSchemaVersion",
    "authority",
    "period",
    "entries",
    "exclusions",
  ]);

const AUTHORITY_KEYS =
  new Set([
    "organizationId",
    "advisorId",
  ]);

const PERIOD_KEYS =
  new Set([
    "effectiveDateFrom",
    "effectiveDateTo",
    "asOf",
  ]);

const ENTRY_KEYS =
  new Set([
    "effectiveDate",
    "commissionKind",
    "productPlan",
    "paymentFrequency",
    "policyYear",
    "commissionAmount",
    "premiumAmount",
    "points",
    "policyCount",
  ]);

const EXCLUSION_KEYS =
  new Set([
    "futureEffective",
    "suppressed",
    "unverified",
    "total",
  ]);

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/u;

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

export class CommissionReportReadModelError
  extends TypeError {
  constructor(message) {
    super(
      `CommissionReportReadModel: ${message}`,
    );
    this.name =
      "CommissionReportReadModelError";
  }
}

function fail(message) {
  throw new CommissionReportReadModelError(
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
    fail(
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
      fail(
        `${label} contains unknown field ${key}`,
      );
    }
  }

  for (const key of allowed) {
    if (!(key in value)) {
      fail(
        `${label}.${key} is required`,
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
    fail(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function identifier(
  value,
  label,
) {
  const normalized =
    requiredString(
      value,
      label,
    );

  if (!IDENTIFIER_PATTERN.test(normalized)) {
    fail(
      `${label} must be a canonical identifier`,
    );
  }

  return normalized;
}

function canonicalDate(
  value,
  label,
) {
  const normalized =
    requiredString(
      value,
      label,
    );

  if (!DATE_PATTERN.test(normalized)) {
    fail(
      `${label} must be YYYY-MM-DD`,
    );
  }

  const parsed =
    new Date(
      `${normalized}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !==
      normalized
  ) {
    fail(
      `${label} must be a valid date`,
    );
  }

  return normalized;
}

function canonicalInstant(
  value,
  label,
) {
  const parsed =
    new Date(
      requiredString(
        value,
        label,
      ),
    );

  if (Number.isNaN(parsed.getTime())) {
    fail(
      `${label} must be an ISO instant`,
    );
  }

  return parsed.toISOString();
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
    fail(
      `${label} must be a non-negative number`,
    );
  }

  return value;
}

function positiveInteger(
  value,
  label,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    fail(
      `${label} must be a positive integer`,
    );
  }

  return value;
}

function nonNegativeInteger(
  value,
  label,
) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    fail(
      `${label} must be a non-negative integer`,
    );
  }

  return value;
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

function canonicalize(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
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

function normalizeAuthority(value) {
  assertPlainObject(
    value,
    "authority",
  );
  assertExactKeys(
    value,
    AUTHORITY_KEYS,
    "authority",
  );

  return {
    organizationId:
      identifier(
        value.organizationId,
        "authority.organizationId",
      ),
    advisorId:
      identifier(
        value.advisorId,
        "authority.advisorId",
      ),
  };
}

function normalizePeriod(value) {
  assertPlainObject(
    value,
    "period",
  );
  assertExactKeys(
    value,
    PERIOD_KEYS,
    "period",
  );

  const effectiveDateFrom =
    canonicalDate(
      value.effectiveDateFrom,
      "period.effectiveDateFrom",
    );
  const effectiveDateTo =
    canonicalDate(
      value.effectiveDateTo,
      "period.effectiveDateTo",
    );

  if (
    effectiveDateFrom >
    effectiveDateTo
  ) {
    fail(
      "period dates are reversed",
    );
  }

  return {
    effectiveDateFrom,
    effectiveDateTo,
    asOf:
      canonicalInstant(
        value.asOf,
        "period.asOf",
      ),
  };
}

function normalizeEntry(
  value,
  index,
  period,
) {
  const label =
    `entries[${index}]`;

  assertPlainObject(
    value,
    label,
  );
  assertExactKeys(
    value,
    ENTRY_KEYS,
    label,
  );

  const effectiveDate =
    canonicalDate(
      value.effectiveDate,
      `${label}.effectiveDate`,
    );

  if (
    effectiveDate <
      period.effectiveDateFrom ||
    effectiveDate >
      period.effectiveDateTo
  ) {
    fail(
      `${label}.effectiveDate is outside period`,
    );
  }

  if (
    !COMMISSION_REPORT_KINDS.includes(
      value.commissionKind,
    )
  ) {
    fail(
      `${label}.commissionKind is unsupported`,
    );
  }

  return {
    schemaVersion:
      COMMISSION_REPORT_ENTRY_SCHEMA_VERSION,
    effectiveDate,
    commissionKind:
      value.commissionKind,
    productPlan:
      requiredString(
        value.productPlan,
        `${label}.productPlan`,
      ),
    paymentFrequency:
      requiredString(
        value.paymentFrequency,
        `${label}.paymentFrequency`,
      ),
    policyYear:
      positiveInteger(
        value.policyYear,
        `${label}.policyYear`,
      ),
    commissionAmount:
      nonNegativeNumber(
        value.commissionAmount,
        `${label}.commissionAmount`,
      ),
    premiumAmount:
      nonNegativeNumber(
        value.premiumAmount,
        `${label}.premiumAmount`,
      ),
    points:
      nonNegativeNumber(
        value.points,
        `${label}.points`,
      ),
    policyCount:
      positiveInteger(
        value.policyCount,
        `${label}.policyCount`,
      ),
  };
}

function normalizeExclusions(value) {
  assertPlainObject(
    value,
    "exclusions",
  );
  assertExactKeys(
    value,
    EXCLUSION_KEYS,
    "exclusions",
  );

  const futureEffective =
    nonNegativeInteger(
      value.futureEffective,
      "exclusions.futureEffective",
    );
  const suppressed =
    nonNegativeInteger(
      value.suppressed,
      "exclusions.suppressed",
    );
  const unverified =
    nonNegativeInteger(
      value.unverified,
      "exclusions.unverified",
    );
  const total =
    nonNegativeInteger(
      value.total,
      "exclusions.total",
    );

  if (
    total !==
    futureEffective +
      suppressed +
      unverified
  ) {
    fail(
      "exclusions.total must equal its components",
    );
  }

  return {
    schemaVersion:
      COMMISSION_REPORT_EXCLUSIONS_SCHEMA_VERSION,
    futureEffective,
    suppressed,
    unverified,
    total,
  };
}

export function normalizeCommissionReportPeriodModel(
  value,
) {
  assertPlainObject(
    value,
    "model",
  );
  assertExactKeys(
    value,
    MODEL_KEYS,
    "model",
  );

  if (
    value.schemaVersion !==
    COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION
  ) {
    fail(
      "model schemaVersion is unsupported",
    );
  }

  if (!Array.isArray(value.entries)) {
    fail(
      "entries must be an array",
    );
  }

  const authority =
    normalizeAuthority(
      value.authority,
    );
  const period =
    normalizePeriod(
      value.period,
    );
  const entries =
    value.entries
      .map(
        (entry, index) =>
          normalizeEntry(
            entry,
            index,
            period,
          ),
      )
      .sort(
        (left, right) =>
          left.effectiveDate.localeCompare(
            right.effectiveDate,
          ) ||
          left.commissionKind.localeCompare(
            right.commissionKind,
          ) ||
          left.productPlan.localeCompare(
            right.productPlan,
          ) ||
          left.paymentFrequency.localeCompare(
            right.paymentFrequency,
          ) ||
          left.policyYear -
            right.policyYear,
      );
  const exclusions =
    normalizeExclusions(
      value.exclusions,
    );
  const sourceSchemaVersion =
    identifier(
      value.sourceSchemaVersion,
      "sourceSchemaVersion",
    );

  const modelKey =
    digest({
      sourceSchemaVersion,
      authority,
      period,
      entries,
      exclusions,
    });

  return deepFreeze({
    schemaVersion:
      COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION,
    sourceSchemaVersion,
    authority,
    period,
    entries,
    exclusions,
    modelKey,
    boundary: {
      acceptedLedgerProjection:
        true,
      commissionCalculationAuthority:
        false,
      commissionRateAuthority:
        false,
      bonusCalculationAuthority:
        false,
      legacyEngineAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}
