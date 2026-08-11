import {
  createHash,
} from "node:crypto";

export const UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION =
  "universal-report-model.v1";

export const UNIVERSAL_REPORT_ROW_SCHEMA_VERSION =
  "universal-report-row.v1";

export const UNIVERSAL_REPORT_EXECUTION_SCHEMA_VERSION =
  "universal-report-execution.v1";

const INPUT_KEYS =
  new Set([
    "resolvedRequest",
    "definition",
    "providerContract",
    "rows",
    "totals",
    "exclusions",
    "provenance",
    "execution",
  ]);

const RESOLVED_REQUEST_SCHEMA =
  "resolved-universal-report-request.v1";

const DEFINITION_SCHEMA =
  "report-definition.v1";

const PROVIDER_CONTRACT_SCHEMA =
  "report-provider-contract.v1";

export class UniversalReportModelError
  extends TypeError {
  constructor(message) {
    super(
      `UniversalReportModel: ${message}`,
    );
    this.name =
      "UniversalReportModelError";
  }
}

function modelError(message) {
  throw new UniversalReportModelError(
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
    modelError(
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
      modelError(
        `${label} contains unknown field ${key}`,
      );
    }
  }
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

function selectedCapabilities(
  available,
  selectedIds,
  identityKey,
  label,
) {
  const byId =
    new Map(
      available.map(
        (item) => [
          item[identityKey],
          item,
        ],
      ),
    );

  return selectedIds.map(
    (identity) => {
      const capability =
        byId.get(identity);

      if (!capability) {
        modelError(
          `${label} ${identity} is not declared by provider`,
        );
      }

      return capability;
    },
  );
}

export function createUniversalReportModel(
  input,
) {
  assertPlainObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  const {
    resolvedRequest,
    definition,
    providerContract,
    rows,
    totals,
    exclusions,
    provenance,
    execution,
  } = input;

  if (
    resolvedRequest?.schemaVersion !==
    RESOLVED_REQUEST_SCHEMA
  ) {
    modelError(
      "resolvedRequest schemaVersion is not supported",
    );
  }

  if (
    definition?.schemaVersion !==
    DEFINITION_SCHEMA
  ) {
    modelError(
      "definition schemaVersion is not supported",
    );
  }

  if (
    providerContract?.schemaVersion !==
    PROVIDER_CONTRACT_SCHEMA
  ) {
    modelError(
      "providerContract schemaVersion is not supported",
    );
  }

  if (
    definition.definitionId !==
      resolvedRequest.definitionId ||
    definition.providerId !==
      resolvedRequest.provider.providerId
  ) {
    modelError(
      "definition does not match resolved request",
    );
  }

  if (
    providerContract.descriptor.providerId !==
      resolvedRequest.provider.providerId ||
    providerContract.descriptor.providerVersion !==
      resolvedRequest.provider.providerVersion
  ) {
    modelError(
      "provider contract does not match resolved request",
    );
  }

  if (!Array.isArray(rows)) {
    modelError(
      "rows must be an array",
    );
  }

  assertPlainObject(
    totals,
    "totals",
  );

  if (!Array.isArray(exclusions)) {
    modelError(
      "exclusions must be an array",
    );
  }

  if (!Array.isArray(provenance)) {
    modelError(
      "provenance must be an array",
    );
  }

  assertPlainObject(
    execution,
    "execution",
  );

  const dimensions =
    selectedCapabilities(
      providerContract.dimensions,
      resolvedRequest.dimensions,
      "dimensionId",
      "dimension",
    );
  const measures =
    selectedCapabilities(
      providerContract.measures,
      resolvedRequest.measures,
      "measureId",
      "measure",
    );

  const normalizedRows =
    rows.map(
      (row, index) => {
        assertPlainObject(
          row,
          `rows[${index}]`,
        );
        assertPlainObject(
          row.dimensions,
          `rows[${index}].dimensions`,
        );
        assertPlainObject(
          row.measures,
          `rows[${index}].measures`,
        );

        return {
          schemaVersion:
            UNIVERSAL_REPORT_ROW_SCHEMA_VERSION,
          rowKey:
            `universal-report-row:${digest(row)}`,
          dimensions:
            row.dimensions,
          measures:
            row.measures,
        };
      },
    );

  const identity = {
    schemaVersion:
      UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
    sourceResolvedRequestKey:
      resolvedRequest.resolvedRequestKey,
    definition: {
      definitionId:
        definition.definitionId,
      definitionVersion:
        definition.definitionVersion,
    },
    provider:
      resolvedRequest.provider,
    authority:
      resolvedRequest.authority,
    period:
      resolvedRequest.period,
    timeZone:
      resolvedRequest.timeZone,
    asOf:
      resolvedRequest.asOf,
    dimensions,
    measures,
    rows:
      normalizedRows,
    totals,
    exclusions,
    provenance,
    execution: {
      schemaVersion:
        UNIVERSAL_REPORT_EXECUTION_SCHEMA_VERSION,
      ...execution,
    },
  };

  return deepFreeze({
    ...identity,
    reportId:
      `universal-report:${digest(identity)}`,
    state:
      normalizedRows.length === 0
        ? "EMPTY"
        : "READY",
    comparison:
      null,
    boundary: {
      reportingAggregationAuthority:
        true,
      domainTruthAuthority:
        false,
      periodResolutionAuthority:
        false,
      comparisonAuthority:
        false,
      exportAuthority:
        false,
      uiAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}
