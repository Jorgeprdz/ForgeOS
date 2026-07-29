import {
  createHash,
} from "node:crypto";

export const PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION =
  "portfolio-policy-period-read-model.v1";

export const PORTFOLIO_POLICY_ENTRY_SCHEMA_VERSION =
  "portfolio-policy-entry.v1";

export const PORTFOLIO_POLICY_EXCLUSIONS_SCHEMA_VERSION =
  "portfolio-policy-exclusions.v1";

export const PORTFOLIO_POLICY_SCOPES =
  Object.freeze([
    "CLIENT",
    "PERSONAL",
  ]);

const MODEL_KEYS =
  new Set([
    "schemaVersion",
    "sourceSchemaVersion",
    "authority",
    "period",
    "policies",
    "exclusions",
  ]);

const AUTHORITY_KEYS =
  new Set([
    "organizationId",
    "advisorId",
  ]);

const PERIOD_KEYS =
  new Set([
    "emissionDateFrom",
    "emissionDateTo",
    "asOf",
  ]);

const POLICY_KEYS =
  new Set([
    "emissionDate",
    "policyStatus",
    "productPlan",
    "productVariant",
    "currency",
    "paymentFrequency",
    "collectionChannel",
    "policyScope",
    "premiumAmount",
    "sumAssuredAmount",
  ]);

const EXCLUSION_KEYS =
  new Set([
    "futureEmission",
    "suppressed",
    "unverified",
    "total",
  ]);

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/u;

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

const CURRENCY_PATTERN =
  /^[A-Z]{3}$/u;

export class PortfolioPolicyReadModelError
  extends TypeError {
  constructor(message) {
    super(
      `PortfolioPolicyReadModel: ${message}`,
    );
    this.name =
      "PortfolioPolicyReadModelError";
  }
}

function fail(message) {
  throw new PortfolioPolicyReadModelError(
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

function optionalString(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    fail(
      "optional text values must be strings or null",
    );
  }

  const normalized =
    value.trim();

  return normalized === ""
    ? null
    : normalized;
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

function currency(value) {
  const normalized =
    requiredString(
      value,
      "policy.currency",
    ).toUpperCase();

  if (!CURRENCY_PATTERN.test(normalized)) {
    fail(
      "policy.currency must be ISO 4217 style",
    );
  }

  return normalized;
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

  const emissionDateFrom =
    canonicalDate(
      value.emissionDateFrom,
      "period.emissionDateFrom",
    );
  const emissionDateTo =
    canonicalDate(
      value.emissionDateTo,
      "period.emissionDateTo",
    );

  if (
    emissionDateFrom >
    emissionDateTo
  ) {
    fail(
      "period dates are reversed",
    );
  }

  return {
    emissionDateFrom,
    emissionDateTo,
    asOf:
      canonicalInstant(
        value.asOf,
        "period.asOf",
      ),
  };
}

function normalizePolicy(
  value,
  index,
  period,
) {
  const label =
    `policies[${index}]`;

  assertPlainObject(
    value,
    label,
  );
  assertExactKeys(
    value,
    POLICY_KEYS,
    label,
  );

  const emissionDate =
    canonicalDate(
      value.emissionDate,
      `${label}.emissionDate`,
    );

  if (
    emissionDate <
      period.emissionDateFrom ||
    emissionDate >
      period.emissionDateTo
  ) {
    fail(
      `${label}.emissionDate is outside period`,
    );
  }

  if (
    !PORTFOLIO_POLICY_SCOPES.includes(
      value.policyScope,
    )
  ) {
    fail(
      `${label}.policyScope is unsupported`,
    );
  }

  return {
    schemaVersion:
      PORTFOLIO_POLICY_ENTRY_SCHEMA_VERSION,
    emissionDate,
    policyStatus:
      requiredString(
        value.policyStatus,
        `${label}.policyStatus`,
      ),
    productPlan:
      requiredString(
        value.productPlan,
        `${label}.productPlan`,
      ),
    productVariant:
      optionalString(
        value.productVariant,
      ),
    currency:
      currency(
        value.currency,
      ),
    paymentFrequency:
      optionalString(
        value.paymentFrequency,
      ),
    collectionChannel:
      optionalString(
        value.collectionChannel,
      ),
    policyScope:
      value.policyScope,
    premiumAmount:
      nonNegativeNumber(
        value.premiumAmount,
        `${label}.premiumAmount`,
      ),
    sumAssuredAmount:
      nonNegativeNumber(
        value.sumAssuredAmount,
        `${label}.sumAssuredAmount`,
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

  const futureEmission =
    nonNegativeInteger(
      value.futureEmission,
      "exclusions.futureEmission",
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
    futureEmission +
      suppressed +
      unverified
  ) {
    fail(
      "exclusions.total must equal its components",
    );
  }

  return {
    schemaVersion:
      PORTFOLIO_POLICY_EXCLUSIONS_SCHEMA_VERSION,
    futureEmission,
    suppressed,
    unverified,
    total,
  };
}

export function normalizePortfolioPolicyPeriodModel(
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
    PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION
  ) {
    fail(
      "model schemaVersion is unsupported",
    );
  }

  if (!Array.isArray(value.policies)) {
    fail(
      "policies must be an array",
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
  const policies =
    value.policies
      .map(
        (policy, index) =>
          normalizePolicy(
            policy,
            index,
            period,
          ),
      )
      .sort(
        (left, right) =>
          left.emissionDate.localeCompare(
            right.emissionDate,
          ) ||
          left.policyStatus.localeCompare(
            right.policyStatus,
          ) ||
          left.productPlan.localeCompare(
            right.productPlan,
          ) ||
          left.currency.localeCompare(
            right.currency,
          ),
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
      policies,
      exclusions,
    });

  return deepFreeze({
    schemaVersion:
      PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION,
    sourceSchemaVersion,
    authority,
    period,
    policies,
    exclusions,
    modelKey,
    boundary: {
      acceptedPolicyProjection:
        true,
      portfolioMutationAuthority:
        false,
      policyStatusDerivationAuthority:
        false,
      renewalDerivationAuthority:
        false,
      foreignExchangeAuthority:
        false,
      clientPiiProjectionAuthority:
        false,
    },
  });
}
