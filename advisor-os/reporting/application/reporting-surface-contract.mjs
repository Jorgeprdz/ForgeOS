import {
  createHash,
} from "node:crypto";

import {
  UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
  UNIVERSAL_REPORT_ROW_SCHEMA_VERSION,
} from "../domain/universal-report-model.mjs";

export const REPORTING_SURFACE_MODEL_SCHEMA_VERSION =
  "reporting-surface-model.v1";

export const REPORTING_SURFACE_COLUMN_SCHEMA_VERSION =
  "reporting-surface-column.v1";

export const REPORTING_SURFACE_ROW_SCHEMA_VERSION =
  "reporting-surface-row.v1";

export const REPORTING_SURFACE_TOTAL_SCHEMA_VERSION =
  "reporting-surface-total.v1";

export const REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA_VERSION =
  "reporting-surface-export-request.v1";

export const REPORTING_SURFACE_ADAPTER_CAPABILITIES =
  Object.freeze([
    "UNIVERSAL_REPORT_SURFACE",
    "SEMANTIC_TABLE_SURFACE",
    "TOTALS_SURFACE",
    "EXCLUSIONS_SURFACE",
    "PROVENANCE_SURFACE",
    "COMPARISON_SURFACE",
    "EXPORT_DOWNLOAD_SURFACE",
  ]);

export const REPORTING_SURFACE_EXPORT_FORMATS =
  Object.freeze([
    "JSON",
    "CSV",
  ]);

const EXPORT_REQUEST_KEYS =
  new Set([
    "schemaVersion",
    "format",
    "fileNameBase",
    "spreadsheetSafe",
  ]);

const FILE_NAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;

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
    "layout",
  ]);

export class ReportingSurfaceContractError
  extends TypeError {
  constructor(message) {
    super(
      `ReportingSurfaceContract: ${message}`,
    );
    this.name =
      "ReportingSurfaceContractError";
  }
}

function fail(message) {
  throw new ReportingSurfaceContractError(
    message,
  );
}

export function assertPlainSurfaceObject(
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

export function requiredSurfaceString(
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

function canonicalDate(
  value,
  label,
) {
  const normalized =
    requiredSurfaceString(
      value,
      label,
    );

  if (
    !/^\d{4}-\d{2}-\d{2}$/u.test(
      normalized,
    )
  ) {
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
      requiredSurfaceString(
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

export function deepFreezeSurfaceValue(
  value,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of
    Object.values(value)) {
    deepFreezeSurfaceValue(
      nested,
    );
  }

  return Object.freeze(value);
}

export function canonicalizeSurfaceValue(
  value,
) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      canonicalizeSurfaceValue,
    );
  }

  if (
    value === null ||
    typeof value !== "object" ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    fail(
      "surface values must be JSON-compatible",
    );
  }

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    result[key] =
      canonicalizeSurfaceValue(
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
        canonicalizeSurfaceValue(
          value,
        ),
      ),
    )
    .digest("hex");
}

export function assertNoPresentationOwnership(
  value,
  path = "surface",
) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(
      (item, index) =>
        assertNoPresentationOwnership(
          item,
          `${path}[${index}]`,
        ),
    );
    return;
  }

  for (const [
    key,
    nested,
  ] of Object.entries(value)) {
    if (
      PROHIBITED_PRESENTATION_KEYS.has(
        key,
      )
    ) {
      fail(
        `${path}.${key} is presentation-owned`,
      );
    }

    assertNoPresentationOwnership(
      nested,
      `${path}.${key}`,
    );
  }
}

function assertCapability(
  value,
  label,
  identityKey,
) {
  assertPlainSurfaceObject(
    value,
    label,
  );

  requiredSurfaceString(
    value.schemaVersion,
    `${label}.schemaVersion`,
  );
  requiredSurfaceString(
    value[identityKey],
    `${label}.${identityKey}`,
  );
  requiredSurfaceString(
    value.valueKind,
    `${label}.valueKind`,
  );

  if (
    typeof value.nullable !==
    "boolean"
  ) {
    fail(
      `${label}.nullable must be boolean`,
    );
  }

  canonicalizeSurfaceValue(
    value,
  );

  return value;
}

export function assertUniversalReportForSurface(
  report,
) {
  assertPlainSurfaceObject(
    report,
    "report",
  );

  if (
    report.schemaVersion !==
    UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION
  ) {
    fail(
      "report schemaVersion is unsupported",
    );
  }

  requiredSurfaceString(
    report.reportId,
    "report.reportId",
  );

  if (
    report.state !== "READY" &&
    report.state !== "EMPTY"
  ) {
    fail(
      "report.state must be READY or EMPTY",
    );
  }

  assertPlainSurfaceObject(
    report.definition,
    "report.definition",
  );
  requiredSurfaceString(
    report.definition.definitionId,
    "report.definition.definitionId",
  );
  requiredSurfaceString(
    report.definition.definitionVersion,
    "report.definition.definitionVersion",
  );

  assertPlainSurfaceObject(
    report.provider,
    "report.provider",
  );
  requiredSurfaceString(
    report.provider.providerId,
    "report.provider.providerId",
  );
  requiredSurfaceString(
    report.provider.providerVersion,
    "report.provider.providerVersion",
  );
  requiredSurfaceString(
    report.provider.domain,
    "report.provider.domain",
  );

  assertPlainSurfaceObject(
    report.authority,
    "report.authority",
  );
  requiredSurfaceString(
    report.authority.organizationId,
    "report.authority.organizationId",
  );
  requiredSurfaceString(
    report.authority.principalId,
    "report.authority.principalId",
  );

  assertPlainSurfaceObject(
    report.period,
    "report.period",
  );

  const from =
    canonicalDate(
      report.period.from,
      "report.period.from",
    );
  const to =
    canonicalDate(
      report.period.to,
      "report.period.to",
    );

  if (from > to) {
    fail(
      "report period is reversed",
    );
  }

  canonicalInstant(
    report.asOf,
    "report.asOf",
  );
  requiredSurfaceString(
    report.timeZone,
    "report.timeZone",
  );

  if (!Array.isArray(report.dimensions)) {
    fail(
      "report.dimensions must be an array",
    );
  }

  if (!Array.isArray(report.measures)) {
    fail(
      "report.measures must be an array",
    );
  }

  if (!Array.isArray(report.rows)) {
    fail(
      "report.rows must be an array",
    );
  }

  assertPlainSurfaceObject(
    report.totals,
    "report.totals",
  );

  if (!Array.isArray(report.exclusions)) {
    fail(
      "report.exclusions must be an array",
    );
  }

  if (!Array.isArray(report.provenance)) {
    fail(
      "report.provenance must be an array",
    );
  }

  assertPlainSurfaceObject(
    report.execution,
    "report.execution",
  );

  const dimensionIds =
    report.dimensions.map(
      (dimension, index) => {
        assertCapability(
          dimension,
          `report.dimensions[${index}]`,
          "dimensionId",
        );

        return dimension.dimensionId;
      },
    );

  const measureIds =
    report.measures.map(
      (measure, index) => {
        assertCapability(
          measure,
          `report.measures[${index}]`,
          "measureId",
        );
        requiredSurfaceString(
          measure.unit,
          `report.measures[${index}].unit`,
        );
        requiredSurfaceString(
          measure.aggregation,
          `report.measures[${index}].aggregation`,
        );

        return measure.measureId;
      },
    );

  if (
    new Set(dimensionIds).size !==
    dimensionIds.length
  ) {
    fail(
      "report dimensions must be unique",
    );
  }

  if (
    new Set(measureIds).size !==
    measureIds.length
  ) {
    fail(
      "report measures must be unique",
    );
  }

  const rowKeys =
    new Set();

  report.rows.forEach(
    (row, index) => {
      assertPlainSurfaceObject(
        row,
        `report.rows[${index}]`,
      );

      if (
        row.schemaVersion !==
        UNIVERSAL_REPORT_ROW_SCHEMA_VERSION
      ) {
        fail(
          `report.rows[${index}] schemaVersion is unsupported`,
        );
      }

      const rowKey =
        requiredSurfaceString(
          row.rowKey,
          `report.rows[${index}].rowKey`,
        );

      if (rowKeys.has(rowKey)) {
        fail(
          `duplicate report rowKey ${rowKey}`,
        );
      }

      rowKeys.add(rowKey);

      assertPlainSurfaceObject(
        row.dimensions,
        `report.rows[${index}].dimensions`,
      );
      assertPlainSurfaceObject(
        row.measures,
        `report.rows[${index}].measures`,
      );

      for (const dimensionId of dimensionIds) {
        if (!(dimensionId in row.dimensions)) {
          fail(
            `report.rows[${index}] lacks dimension ${dimensionId}`,
          );
        }

        canonicalizeSurfaceValue(
          row.dimensions[
            dimensionId
          ],
        );
      }

      for (const measureId of measureIds) {
        if (!(measureId in row.measures)) {
          fail(
            `report.rows[${index}] lacks measure ${measureId}`,
          );
        }

        canonicalizeSurfaceValue(
          row.measures[
            measureId
          ],
        );
      }
    },
  );

  for (const measureId of measureIds) {
    if (!(measureId in report.totals)) {
      fail(
        `report.totals lacks measure ${measureId}`,
      );
    }

    canonicalizeSurfaceValue(
      report.totals[
        measureId
      ],
    );
  }

  canonicalizeSurfaceValue(
    report.exclusions,
  );
  canonicalizeSurfaceValue(
    report.provenance,
  );
  canonicalizeSurfaceValue(
    report.execution,
  );
  canonicalizeSurfaceValue(
    report.comparison,
  );

  return report;
}

export function createReportingSurfaceExportRequest(
  input,
) {
  assertPlainSurfaceObject(
    input,
    "export request",
  );
  assertExactKeys(
    input,
    EXPORT_REQUEST_KEYS,
    "export request",
  );

  if (
    input.schemaVersion !==
    REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA_VERSION
  ) {
    fail(
      "export request schemaVersion is unsupported",
    );
  }

  if (
    !REPORTING_SURFACE_EXPORT_FORMATS.includes(
      input.format,
    )
  ) {
    fail(
      "export request format is unsupported",
    );
  }

  const fileNameBase =
    requiredSurfaceString(
      input.fileNameBase,
      "export request.fileNameBase",
    );

  if (
    !FILE_NAME_PATTERN.test(
      fileNameBase,
    ) ||
    fileNameBase.includes("..")
  ) {
    fail(
      "export request.fileNameBase is unsafe",
    );
  }

  if (
    typeof input.spreadsheetSafe !==
    "boolean"
  ) {
    fail(
      "export request.spreadsheetSafe must be boolean",
    );
  }

  return deepFreezeSurfaceValue({
    schemaVersion:
      REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA_VERSION,
    format:
      input.format,
    fileNameBase,
    spreadsheetSafe:
      input.spreadsheetSafe,
  });
}

export function createReportingSurfaceModel({
  report,
}) {
  const source =
    assertUniversalReportForSurface(
      report,
    );
  const dimensionColumns =
    source.dimensions.map(
      (dimension) => ({
        schemaVersion:
          REPORTING_SURFACE_COLUMN_SCHEMA_VERSION,
        columnId:
          dimension.dimensionId,
        kind:
          "DIMENSION",
        valueKind:
          dimension.valueKind,
        nullable:
          dimension.nullable,
        unit:
          null,
        aggregation:
          null,
      }),
    );
  const measureColumns =
    source.measures.map(
      (measure) => ({
        schemaVersion:
          REPORTING_SURFACE_COLUMN_SCHEMA_VERSION,
        columnId:
          measure.measureId,
        kind:
          "MEASURE",
        valueKind:
          measure.valueKind,
        nullable:
          measure.nullable,
        unit:
          measure.unit,
        aggregation:
          measure.aggregation,
      }),
    );
  const columns = [
    ...dimensionColumns,
    ...measureColumns,
  ];
  const rows =
    source.rows.map(
      (row) => ({
        schemaVersion:
          REPORTING_SURFACE_ROW_SCHEMA_VERSION,
        rowKey:
          row.rowKey,
        cells:
          columns.map(
            (column) => ({
              columnId:
                column.columnId,
              value:
                column.kind ===
                "DIMENSION"
                  ? row.dimensions[
                      column.columnId
                    ]
                  : row.measures[
                      column.columnId
                    ],
            }),
          ),
      }),
    );
  const totals =
    source.measures.map(
      (measure) => ({
        schemaVersion:
          REPORTING_SURFACE_TOTAL_SCHEMA_VERSION,
        measureId:
          measure.measureId,
        value:
          source.totals[
            measure.measureId
          ],
        unit:
          measure.unit,
        aggregation:
          measure.aggregation,
      }),
    );
  const identity = {
    schemaVersion:
      REPORTING_SURFACE_MODEL_SCHEMA_VERSION,
    sourceReportId:
      source.reportId,
    sourceReportSchemaVersion:
      source.schemaVersion,
    state:
      source.state,
    definition:
      source.definition,
    provider:
      source.provider,
    authority:
      source.authority,
    period:
      source.period,
    timeZone:
      source.timeZone,
    asOf:
      source.asOf,
    columns,
    rows,
    totals,
    exclusions:
      source.exclusions,
    provenance:
      source.provenance,
    execution:
      source.execution,
    comparison:
      source.comparison,
    export: {
      enabled:
        true,
      formats:
        REPORTING_SURFACE_EXPORT_FORMATS,
      spreadsheetSafeDefault:
        true,
    },
  };

  assertNoPresentationOwnership(
    identity,
    "reporting surface",
  );

  return deepFreezeSurfaceValue({
    ...identity,
    surfaceId:
      `reporting-surface:${digest(identity)}`,
    boundary: {
      sourceReportMutation:
        false,
      reportExecutionAuthority:
        false,
      aggregationAuthority:
        false,
      comparisonAuthority:
        false,
      exportFormattingAuthority:
        false,
      deliveryDelegationAuthority:
        true,
      uiRenderingAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
    presentationBoundary: {
      textOwnedByUi:
        true,
      labelsOwnedByUi:
        true,
      colorsOwnedByUi:
        true,
      iconsOwnedByUi:
        true,
      componentsOwnedByUi:
        true,
      navigationOwnedByUi:
        true,
      layoutOwnedByUi:
        true,
    },
  });
}
