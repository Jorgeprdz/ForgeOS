import {
  createHash,
} from "node:crypto";

import {
  REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION,
  createReportProviderDescriptor,
} from "../domain/reporting-kernel-contract.js";

export const REPORT_PROVIDER_PORT_SCHEMA_VERSION =
  "report-provider-port.v1";

export const REPORT_PROVIDER_CONTRACT_SCHEMA_VERSION =
  "report-provider-contract.v1";

export const REPORT_DIMENSION_CAPABILITY_SCHEMA_VERSION =
  "report-dimension-capability.v1";

export const REPORT_MEASURE_CAPABILITY_SCHEMA_VERSION =
  "report-measure-capability.v1";

export const REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION =
  "report-provider-slice-query.v1";

export const REPORT_PROVIDER_SLICE_SCHEMA_VERSION =
  "report-provider-slice.v1";

export const REPORT_PROVIDER_BATCHING_MODES =
  Object.freeze([
    "NONE",
    "CONTIGUOUS_DATE_RANGES",
  ]);

export const REPORT_VALUE_KINDS =
  Object.freeze([
    "STRING",
    "NUMBER",
    "BOOLEAN",
    "DATE",
    "DATETIME",
  ]);

export const REPORT_MEASURE_UNITS =
  Object.freeze([
    "COUNT",
    "POINTS",
    "CURRENCY",
    "PERCENT",
    "RATIO",
    "DURATION",
    "CUSTOM",
  ]);

export const REPORT_MEASURE_AGGREGATIONS =
  Object.freeze([
    "SUM",
    "AVERAGE",
    "MIN",
    "MAX",
    "FIRST",
    "LAST",
    "NONE",
  ]);

const PORT_INPUT_KEYS =
  new Set([
    "descriptor",
    "dimensions",
    "measures",
    "maxSliceDays",
    "batchingMode",
    "readSlice",
  ]);

const DIMENSION_KEYS =
  new Set([
    "dimensionId",
    "valueKind",
    "nullable",
  ]);

const MEASURE_KEYS =
  new Set([
    "measureId",
    "valueKind",
    "unit",
    "aggregation",
    "nullable",
  ]);

const RAW_SLICE_KEYS =
  new Set([
    "rows",
    "exclusions",
    "provenance",
  ]);

const ROW_KEYS =
  new Set([
    "dimensions",
    "measures",
  ]);

const EXCLUSION_KEYS =
  new Set([
    "code",
    "count",
  ]);

const PROVENANCE_KEYS =
  new Set([
    "sourceId",
    "sourceVersion",
    "authority",
  ]);

const IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u;

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/u;

export class ReportProviderPortError
  extends TypeError {
  constructor(message) {
    super(
      `ReportProviderPort: ${message}`,
    );
    this.name =
      "ReportProviderPortError";
  }
}

function portError(message) {
  throw new ReportProviderPortError(
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
    portError(
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
      portError(
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
    portError(
      `${label} must be a canonical identifier`,
    );
  }

  return value.trim();
}

function enumValue(
  value,
  allowed,
  label,
) {
  if (!allowed.includes(value)) {
    portError(
      `${label} is not supported`,
    );
  }

  return value;
}

function boolean(
  value,
  label,
) {
  if (typeof value !== "boolean") {
    portError(
      `${label} must be boolean`,
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
    portError(
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
    portError(
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

function normalizeDescriptor(
  value,
) {
  if (
    value?.schemaVersion ===
    REPORT_PROVIDER_DESCRIPTOR_SCHEMA_VERSION
  ) {
    return value;
  }

  return createReportProviderDescriptor(
    value,
  );
}

function capabilityMap(
  value,
  normalizer,
  identityKey,
  label,
) {
  if (!Array.isArray(value)) {
    portError(
      `${label} must be an array`,
    );
  }

  const result =
    new Map();

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const capability =
      normalizer(
        value[index],
        `${label}[${index}]`,
      );
    const identity =
      capability[
        identityKey
      ];

    if (result.has(identity)) {
      portError(
        `${label} contains duplicate ${identity}`,
      );
    }

    result.set(
      identity,
      capability,
    );
  }

  return result;
}

function normalizeDimension(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );
  assertExactKeys(
    value,
    DIMENSION_KEYS,
    label,
  );

  return deepFreeze({
    schemaVersion:
      REPORT_DIMENSION_CAPABILITY_SCHEMA_VERSION,
    dimensionId:
      identifier(
        value.dimensionId,
        `${label}.dimensionId`,
      ),
    valueKind:
      enumValue(
        value.valueKind,
        REPORT_VALUE_KINDS,
        `${label}.valueKind`,
      ),
    nullable:
      boolean(
        value.nullable ?? false,
        `${label}.nullable`,
      ),
  });
}

function normalizeMeasure(
  value,
  label,
) {
  assertPlainObject(
    value,
    label,
  );
  assertExactKeys(
    value,
    MEASURE_KEYS,
    label,
  );

  return deepFreeze({
    schemaVersion:
      REPORT_MEASURE_CAPABILITY_SCHEMA_VERSION,
    measureId:
      identifier(
        value.measureId,
        `${label}.measureId`,
      ),
    valueKind:
      enumValue(
        value.valueKind,
        REPORT_VALUE_KINDS,
        `${label}.valueKind`,
      ),
    unit:
      enumValue(
        value.unit,
        REPORT_MEASURE_UNITS,
        `${label}.unit`,
      ),
    aggregation:
      enumValue(
        value.aggregation,
        REPORT_MEASURE_AGGREGATIONS,
        `${label}.aggregation`,
      ),
    nullable:
      boolean(
        value.nullable ?? false,
        `${label}.nullable`,
      ),
  });
}

function assertValueKind(
  value,
  capability,
  label,
) {
  if (
    value === null &&
    capability.nullable
  ) {
    return null;
  }

  switch (
    capability.valueKind
  ) {
    case "STRING":
      if (typeof value !== "string") {
        portError(
          `${label} must be string`,
        );
      }
      return value;

    case "NUMBER":
      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        portError(
          `${label} must be a finite number`,
        );
      }
      return value;

    case "BOOLEAN":
      if (typeof value !== "boolean") {
        portError(
          `${label} must be boolean`,
        );
      }
      return value;

    case "DATE":
      if (
        typeof value !== "string" ||
        !DATE_PATTERN.test(value)
      ) {
        portError(
          `${label} must be YYYY-MM-DD`,
        );
      }
      return value;

    case "DATETIME": {
      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        portError(
          `${label} must be an ISO instant`,
        );
      }

      return date.toISOString();
    }

    default:
      portError(
        `${label} uses an unsupported value kind`,
      );
  }
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

export function createReportProviderPort(
  input,
) {
  assertPlainObject(
    input,
    "provider port",
  );
  assertExactKeys(
    input,
    PORT_INPUT_KEYS,
    "provider port",
  );

  const descriptor =
    normalizeDescriptor(
      input.descriptor,
    );
  const dimensions =
    capabilityMap(
      input.dimensions ?? [],
      normalizeDimension,
      "dimensionId",
      "provider dimensions",
    );
  const measures =
    capabilityMap(
      input.measures,
      normalizeMeasure,
      "measureId",
      "provider measures",
    );

  if (measures.size === 0) {
    portError(
      "provider measures must not be empty",
    );
  }

  if (
    typeof input.readSlice !==
    "function"
  ) {
    portError(
      "readSlice must be a function",
    );
  }

  const batchingMode =
    enumValue(
      input.batchingMode ?? "NONE",
      REPORT_PROVIDER_BATCHING_MODES,
      "batchingMode",
    );
  const maxSliceDays =
    positiveInteger(
      input.maxSliceDays,
      "maxSliceDays",
    );
  const dimensionList =
    deepFreeze(
      [...dimensions.values()]
        .sort(
          (left, right) =>
            left.dimensionId.localeCompare(
              right.dimensionId,
            ),
        ),
    );
  const measureList =
    deepFreeze(
      [...measures.values()]
        .sort(
          (left, right) =>
            left.measureId.localeCompare(
              right.measureId,
            ),
        ),
    );
  const contract =
    deepFreeze({
      schemaVersion:
        REPORT_PROVIDER_CONTRACT_SCHEMA_VERSION,
      descriptor,
      dimensions:
        dimensionList,
      measures:
        measureList,
      slicePolicy: {
        maxSliceDays,
        batchingMode,
        batchingSupported:
          batchingMode !== "NONE",
        rangeSemantics:
          "INCLUSIVE_DATE",
      },
      boundary: {
        domainTruthAuthority:
          true,
        periodResolutionAuthority:
          false,
        universalAggregationAuthority:
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

  const port = {
    schemaVersion:
      REPORT_PROVIDER_PORT_SCHEMA_VERSION,
    contract,

    async readSlice(query) {
      return input.readSlice(
        query,
      );
    },
  };

  return deepFreeze(port);
}

export function assertReportProviderPort(
  value,
) {
  if (
    value?.schemaVersion !==
      REPORT_PROVIDER_PORT_SCHEMA_VERSION ||
    value.contract?.schemaVersion !==
      REPORT_PROVIDER_CONTRACT_SCHEMA_VERSION ||
    typeof value.readSlice !==
      "function"
  ) {
    portError(
      "provider does not satisfy report provider port",
    );
  }

  return value;
}

export function normalizeReportProviderSlice({
  raw,
  query,
  port,
} = {}) {
  assertReportProviderPort(
    port,
  );
  assertPlainObject(
    raw,
    "provider slice",
  );
  assertExactKeys(
    raw,
    RAW_SLICE_KEYS,
    "provider slice",
  );

  if (
    query?.schemaVersion !==
    REPORT_PROVIDER_SLICE_QUERY_SCHEMA_VERSION
  ) {
    portError(
      "query schemaVersion is not supported",
    );
  }

  if (!Array.isArray(raw.rows)) {
    portError(
      "provider slice.rows must be an array",
    );
  }

  const dimensions =
    new Map(
      port.contract.dimensions.map(
        (item) => [
          item.dimensionId,
          item,
        ],
      ),
    );
  const measures =
    new Map(
      port.contract.measures.map(
        (item) => [
          item.measureId,
          item,
        ],
      ),
    );

  const rows =
    raw.rows.map(
      (row, rowIndex) => {
        assertPlainObject(
          row,
          `provider slice.rows[${rowIndex}]`,
        );
        assertExactKeys(
          row,
          ROW_KEYS,
          `provider slice.rows[${rowIndex}]`,
        );
        assertPlainObject(
          row.dimensions,
          `provider slice.rows[${rowIndex}].dimensions`,
        );
        assertPlainObject(
          row.measures,
          `provider slice.rows[${rowIndex}].measures`,
        );

        assertExactKeys(
          row.dimensions,
          new Set(
            query.dimensions,
          ),
          `provider slice.rows[${rowIndex}].dimensions`,
        );
        assertExactKeys(
          row.measures,
          new Set(
            query.measures,
          ),
          `provider slice.rows[${rowIndex}].measures`,
        );

        const normalizedDimensions =
          {};
        const normalizedMeasures =
          {};

        for (const dimensionId of
          query.dimensions) {
          const capability =
            dimensions.get(
              dimensionId,
            );

          if (
            !Object.hasOwn(
              row.dimensions,
              dimensionId,
            )
          ) {
            if (capability.nullable) {
              normalizedDimensions[
                dimensionId
              ] = null;
              continue;
            }

            portError(
              `provider slice row is missing dimension ${dimensionId}`,
            );
          }

          normalizedDimensions[
            dimensionId
          ] =
            assertValueKind(
              row.dimensions[
                dimensionId
              ],
              capability,
              `provider slice.rows[${rowIndex}].dimensions.${dimensionId}`,
            );
        }

        for (const measureId of
          query.measures) {
          const capability =
            measures.get(
              measureId,
            );

          if (
            !Object.hasOwn(
              row.measures,
              measureId,
            )
          ) {
            if (capability.nullable) {
              normalizedMeasures[
                measureId
              ] = null;
              continue;
            }

            portError(
              `provider slice row is missing measure ${measureId}`,
            );
          }

          normalizedMeasures[
            measureId
          ] =
            assertValueKind(
              row.measures[
                measureId
              ],
              capability,
              `provider slice.rows[${rowIndex}].measures.${measureId}`,
            );
        }

        return {
          dimensions:
            normalizedDimensions,
          measures:
            normalizedMeasures,
        };
      },
    );

  if (!Array.isArray(raw.exclusions)) {
    portError(
      "provider slice.exclusions must be an array",
    );
  }

  const exclusions =
    raw.exclusions.map(
      (item, index) => {
        assertPlainObject(
          item,
          `provider slice.exclusions[${index}]`,
        );
        assertExactKeys(
          item,
          EXCLUSION_KEYS,
          `provider slice.exclusions[${index}]`,
        );

        return {
          code:
            identifier(
              item.code,
              `provider slice.exclusions[${index}].code`,
            ),
          count:
            nonNegativeInteger(
              item.count,
              `provider slice.exclusions[${index}].count`,
            ),
        };
      },
    );

  if (
    !Array.isArray(raw.provenance) ||
    raw.provenance.length === 0
  ) {
    portError(
      "provider slice.provenance must be a non-empty array",
    );
  }

  const provenance =
    raw.provenance.map(
      (item, index) => {
        assertPlainObject(
          item,
          `provider slice.provenance[${index}]`,
        );
        assertExactKeys(
          item,
          PROVENANCE_KEYS,
          `provider slice.provenance[${index}]`,
        );

        return {
          sourceId:
            identifier(
              item.sourceId,
              `provider slice.provenance[${index}].sourceId`,
            ),
          sourceVersion:
            identifier(
              item.sourceVersion,
              `provider slice.provenance[${index}].sourceVersion`,
            ),
          authority:
            identifier(
              item.authority,
              `provider slice.provenance[${index}].authority`,
            ),
        };
      },
    );

  const identity = {
    schemaVersion:
      REPORT_PROVIDER_SLICE_SCHEMA_VERSION,
    queryKey:
      query.queryKey,
    provider: {
      providerId:
        port.contract.descriptor.providerId,
      providerVersion:
        port.contract.descriptor.providerVersion,
      domain:
        port.contract.descriptor.domain,
    },
    definition: {
      definitionId:
        query.definition.definitionId,
      definitionVersion:
        query.definition.definitionVersion,
    },
    period:
      query.period,
    dimensions:
      query.dimensions,
    measures:
      query.measures,
    rows,
    exclusions,
    provenance,
    authority: {
      domainTruthAuthority:
        true,
      periodResolutionAuthority:
        false,
      universalAggregationAuthority:
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
  };

  return deepFreeze({
    ...identity,
    sliceKey:
      `report-provider-slice:${digest(identity)}`,
    status:
      "PROVIDER_SLICE_READ",
  });
}
