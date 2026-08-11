import {
  createHash,
} from "node:crypto";

export const UNIVERSAL_REPORTING_KERNEL_SCHEMA_VERSION =
  "universal-reporting-kernel.v1";

export const REPORTING_AUTHORITY_BINDING_SCHEMA_VERSION =
  "reporting-authority-binding.v1";

export const REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION =
  "report-provider-descriptor.v1";

export const UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION =
  "universal-report-request.v1";

export const REPORT_PERIOD_INPUT_SCHEMA_VERSION =
  "report-period-input.v1";

export const UNIVERSAL_REPORTING_KERNEL_CAPABILITIES =
  Object.freeze([
    "REPORT_REQUEST_IDENTITY",
    "PROVIDER_REGISTRY",
    "CANONICAL_AS_OF",
    "DETERMINISTIC_REQUEST_KEY",
    "AUTHORITY_BINDING",
  ]);

const AUTHORITY_INPUT_KEYS =
  new Set([
    "organizationId",
    "principalId",
  ]);

const PROVIDER_INPUT_KEYS =
  new Set([
    "providerId",
    "providerVersion",
    "domain",
    "capabilities",
  ]);

const PERIOD_INPUT_KEYS =
  new Set([
    "kind",
    "parameters",
  ]);

const REQUEST_INPUT_KEYS =
  new Set([
    "definitionId",
    "providerId",
    "period",
    "timeZone",
    "asOf",
    "dimensions",
    "measures",
    "metadata",
  ]);

const PROHIBITED_NESTED_KEYS =
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
    "sql",
    "rpc",
    "table",
    "mutation",
    "write",
    "insert",
    "update",
    "delete",
  ]);

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

const PERIOD_KIND_PATTERN =
  /^[A-Z][A-Z0-9_]*$/u;

export class UniversalReportingContractError
  extends TypeError {
  constructor(message) {
    super(
      `UniversalReportingContract: ${message}`,
    );
    this.name =
      "UniversalReportingContractError";
  }
}

function contractError(message) {
  throw new UniversalReportingContractError(
    message,
  );
}

export function assertPlainObject(
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
    contractError(
      `${label} must be a plain object`,
    );
  }

  return value;
}

export function assertExactKeys(
  value,
  allowed,
  label,
) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      contractError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
}

function identifier(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    !IDENTIFIER_PATTERN.test(
      value.trim(),
    )
  ) {
    contractError(
      `${label} must be a canonical identifier`,
    );
  }

  return value.trim();
}

function periodKind(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    !PERIOD_KIND_PATTERN.test(
      value.trim(),
    )
  ) {
    contractError(
      `${label} must be an uppercase period identifier`,
    );
  }

  return value.trim();
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
    contractError(
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
    contractError(
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
    contractError(
      `${label} must be an IANA time zone`,
    );
  }

  return normalized;
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

function canonicalValue(
  value,
  label,
  path = label,
) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {
    if (!Number.isFinite(value)) {
      contractError(
        `${path} contains a non-finite number`,
      );
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      (item, index) =>
        canonicalValue(
          item,
          label,
          `${path}[${index}]`,
        ),
    );
  }

  assertPlainObject(
    value,
    path,
  );

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    if (
      PROHIBITED_NESTED_KEYS.has(key)
    ) {
      contractError(
        `${path}.${key} crosses presentation or persistence boundary`,
      );
    }

    const nested =
      value[key];

    if (nested === undefined) {
      contractError(
        `${path}.${key} cannot be undefined`,
      );
    }

    result[key] =
      canonicalValue(
        nested,
        label,
        `${path}.${key}`,
      );
  }

  return result;
}

function canonicalStringify(value) {
  return JSON.stringify(
    canonicalValue(
      value,
      "request identity",
    ),
  );
}

function canonicalStringSet(
  value,
  label,
) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    contractError(
      `${label} must be an array`,
    );
  }

  const normalized =
    value.map(
      (item, index) =>
        identifier(
          item,
          `${label}[${index}]`,
        ),
    );

  return [
    ...new Set(normalized),
  ].sort();
}

export function createReportingAuthorityBinding(
  input,
) {
  assertPlainObject(
    input,
    "authority",
  );
  assertExactKeys(
    input,
    AUTHORITY_INPUT_KEYS,
    "authority",
  );

  return deepFreeze({
    schemaVersion:
      REPORTING_AUTHORITY_BINDING_SCHEMA_VERSION,
    organizationId:
      identifier(
        input.organizationId,
        "authority.organizationId",
      ),
    principalId:
      identifier(
        input.principalId,
        "authority.principalId",
      ),
    scope:
      "ORGANIZATION",
    reportingAuthority:
      true,
    domainTruthAuthority:
      false,
    uiAuthority:
      false,
    persistenceAuthority:
      false,
  });
}

export function createReportProviderDescriptor(
  input,
) {
  assertPlainObject(
    input,
    "provider",
  );
  assertExactKeys(
    input,
    PROVIDER_INPUT_KEYS,
    "provider",
  );

  const capabilities =
    canonicalStringSet(
      input.capabilities,
      "provider.capabilities",
    );

  if (capabilities.length === 0) {
    contractError(
      "provider.capabilities must not be empty",
    );
  }

  return deepFreeze({
    schemaVersion:
      REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION,
    providerId:
      identifier(
        input.providerId,
        "provider.providerId",
      ),
    providerVersion:
      identifier(
        input.providerVersion,
        "provider.providerVersion",
      ),
    domain:
      identifier(
        input.domain,
        "provider.domain",
      ),
    capabilities,
    boundary: {
      periodResolutionAuthority:
        false,
      comparisonAuthority:
        false,
      universalAggregationAuthority:
        false,
      universalModelAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}

function createPeriodInput(
  input,
) {
  assertPlainObject(
    input,
    "request.period",
  );
  assertExactKeys(
    input,
    PERIOD_INPUT_KEYS,
    "request.period",
  );

  return deepFreeze({
    schemaVersion:
      REPORT_PERIOD_INPUT_SCHEMA_VERSION,
    kind:
      periodKind(
        input.kind,
        "request.period.kind",
      ),
    parameters:
      canonicalValue(
        input.parameters ?? {},
        "request.period.parameters",
      ),
    resolutionStatus:
      "PENDING_REP_02",
  });
}

export function createUniversalReportRequest({
  input,
  authority,
  provider,
  defaultAsOf,
} = {}) {
  assertPlainObject(
    input,
    "request",
  );
  assertExactKeys(
    input,
    REQUEST_INPUT_KEYS,
    "request",
  );

  if (
    authority?.schemaVersion !==
    REPORTING_AUTHORITY_BINDING_SCHEMA_VERSION
  ) {
    contractError(
      "authority binding schemaVersion is not supported",
    );
  }

  if (
    provider?.schemaVersion !==
    REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION
  ) {
    contractError(
      "provider descriptor schemaVersion is not supported",
    );
  }

  const providerId =
    identifier(
      input.providerId,
      "request.providerId",
    );

  if (
    providerId !==
    provider.providerId
  ) {
    contractError(
      "request.providerId does not match provider descriptor",
    );
  }

  const definitionId =
    identifier(
      input.definitionId,
      "request.definitionId",
    );
  const period =
    createPeriodInput(
      input.period,
    );
  const timeZone =
    canonicalTimeZone(
      input.timeZone,
      "request.timeZone",
    );
  const asOf =
    canonicalInstant(
      input.asOf ??
        defaultAsOf,
      "request.asOf",
    );
  const dimensions =
    canonicalStringSet(
      input.dimensions,
      "request.dimensions",
    );
  const measures =
    canonicalStringSet(
      input.measures,
      "request.measures",
    );
  const metadata =
    canonicalValue(
      input.metadata ?? {},
      "request.metadata",
    );

  const identity = {
    schemaVersion:
      UNIVERSAL_REPORT_REQUEST_SCHEMA_VERSION,
    authority: {
      organizationId:
        authority.organizationId,
      principalId:
        authority.principalId,
    },
    definitionId,
    provider: {
      providerId:
        provider.providerId,
      providerVersion:
        provider.providerVersion,
      domain:
        provider.domain,
    },
    period,
    timeZone,
    asOf,
    dimensions,
    measures,
    metadata,
  };

  const digest =
    createHash("sha256")
      .update(
        canonicalStringify(identity),
      )
      .digest("hex");

  return deepFreeze({
    ...identity,
    requestKey:
      `report-request:${digest}`,
    status:
      "IDENTIFIED_NOT_EXECUTED",
    boundary: {
      providerExecutionAuthorized:
        false,
      periodResolutionComplete:
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
      domainTruthOwnedByKernel:
        false,
    },
  });
}
