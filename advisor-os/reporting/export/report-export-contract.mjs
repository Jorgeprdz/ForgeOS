import {
  createHash,
} from "node:crypto";

import {
  UNIVERSAL_REPORT_MODEL_SCHEMA_VERSION,
  UNIVERSAL_REPORT_ROW_SCHEMA_VERSION,
} from "../domain/universal-report-model.mjs";

export const REPORT_EXPORT_REQUEST_SCHEMA_VERSION =
  "report-export-request.v1";

export const REPORT_EXPORT_BUNDLE_SCHEMA_VERSION =
  "report-export-bundle.v1";

export const REPORT_EXPORT_FILE_SCHEMA_VERSION =
  "report-export-file.v1";

export const REPORT_EXPORT_MANIFEST_SCHEMA_VERSION =
  "report-export-manifest.v1";

export const REPORT_EXPORT_FORMATS =
  Object.freeze([
    "JSON",
    "CSV",
  ]);

const REQUEST_KEYS =
  new Set([
    "schemaVersion",
    "format",
    "fileNameBase",
    "spreadsheetSafe",
  ]);

const FILE_NAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;

export class ReportExportContractError
  extends TypeError {
  constructor(message) {
    super(
      `ReportExportContract: ${message}`,
    );
    this.name =
      "ReportExportContractError";
  }
}

function fail(message) {
  throw new ReportExportContractError(
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

export function canonicalizeExportValue(
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
      canonicalizeExportValue,
    );
  }

  if (
    value === null ||
    typeof value !== "object" ||
    Object.getPrototypeOf(value) !==
      Object.prototype
  ) {
    fail(
      "export values must be JSON-compatible",
    );
  }

  const result = {};

  for (const key of
    Object.keys(value).sort()) {
    result[key] =
      canonicalizeExportValue(
        value[key],
      );
  }

  return result;
}

export function createExportDigest(
  value,
) {
  return createHash(
    "sha256",
  )
    .update(
      JSON.stringify(
        canonicalizeExportValue(
          value,
        ),
      ),
    )
    .digest("hex");
}

export function assertUniversalReportForExport(
  report,
) {
  assertPlainObject(
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

  requiredString(
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

  assertPlainObject(
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

  assertPlainObject(
    report.execution,
    "report.execution",
  );

  const dimensionIds =
    report.dimensions.map(
      (dimension, index) => {
        assertPlainObject(
          dimension,
          `report.dimensions[${index}]`,
        );

        return requiredString(
          dimension.dimensionId,
          `report.dimensions[${index}].dimensionId`,
        );
      },
    );

  const measureIds =
    report.measures.map(
      (measure, index) => {
        assertPlainObject(
          measure,
          `report.measures[${index}]`,
        );

        return requiredString(
          measure.measureId,
          `report.measures[${index}].measureId`,
        );
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

  for (
    let index = 0;
    index < report.rows.length;
    index += 1
  ) {
    const row =
      report.rows[index];

    assertPlainObject(
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

    requiredString(
      row.rowKey,
      `report.rows[${index}].rowKey`,
    );

    assertPlainObject(
      row.dimensions,
      `report.rows[${index}].dimensions`,
    );
    assertPlainObject(
      row.measures,
      `report.rows[${index}].measures`,
    );

    for (const dimensionId of dimensionIds) {
      if (!(dimensionId in row.dimensions)) {
        fail(
          `report.rows[${index}] lacks dimension ${dimensionId}`,
        );
      }

      canonicalizeExportValue(
        row.dimensions[dimensionId],
      );
    }

    for (const measureId of measureIds) {
      if (!(measureId in row.measures)) {
        fail(
          `report.rows[${index}] lacks measure ${measureId}`,
        );
      }

      canonicalizeExportValue(
        row.measures[measureId],
      );
    }
  }

  canonicalizeExportValue(
    report.totals,
  );
  canonicalizeExportValue(
    report.exclusions,
  );
  canonicalizeExportValue(
    report.provenance,
  );
  canonicalizeExportValue(
    report.execution,
  );
  canonicalizeExportValue(
    report.comparison,
  );

  return report;
}

export function createReportExportRequest(
  input,
) {
  assertPlainObject(
    input,
    "request",
  );
  assertExactKeys(
    input,
    REQUEST_KEYS,
    "request",
  );

  if (
    input.schemaVersion !==
    REPORT_EXPORT_REQUEST_SCHEMA_VERSION
  ) {
    fail(
      "request schemaVersion is unsupported",
    );
  }

  if (
    !REPORT_EXPORT_FORMATS.includes(
      input.format,
    )
  ) {
    fail(
      "request format is unsupported",
    );
  }

  const fileNameBase =
    requiredString(
      input.fileNameBase,
      "request.fileNameBase",
    );

  if (
    !FILE_NAME_PATTERN.test(
      fileNameBase,
    ) ||
    fileNameBase.includes("..")
  ) {
    fail(
      "request.fileNameBase is unsafe",
    );
  }

  if (
    typeof input.spreadsheetSafe !==
    "boolean"
  ) {
    fail(
      "request.spreadsheetSafe must be boolean",
    );
  }

  return deepFreeze({
    schemaVersion:
      REPORT_EXPORT_REQUEST_SCHEMA_VERSION,
    format:
      input.format,
    fileNameBase,
    spreadsheetSafe:
      input.spreadsheetSafe,
  });
}

export function createReportExportFile({
  fileName,
  mediaType,
  content,
}) {
  const normalizedFileName =
    requiredString(
      fileName,
      "file.fileName",
    );
  const normalizedMediaType =
    requiredString(
      mediaType,
      "file.mediaType",
    );

  if (
    normalizedFileName.includes("/") ||
    normalizedFileName.includes("\\") ||
    normalizedFileName.includes("..")
  ) {
    fail(
      "file.fileName is unsafe",
    );
  }

  if (typeof content !== "string") {
    fail(
      "file.content must be a string",
    );
  }

  const byteLength =
    Buffer.byteLength(
      content,
      "utf8",
    );
  const sha256 =
    createHash(
      "sha256",
    )
      .update(
        content,
        "utf8",
      )
      .digest("hex");

  return deepFreeze({
    schemaVersion:
      REPORT_EXPORT_FILE_SCHEMA_VERSION,
    fileName:
      normalizedFileName,
    mediaType:
      normalizedMediaType,
    content,
    byteLength,
    sha256,
  });
}

export function createReportExportManifest({
  report,
  request,
  dataFiles,
}) {
  assertUniversalReportForExport(
    report,
  );
  const normalizedRequest =
    createReportExportRequest(
      request,
    );

  if (
    !Array.isArray(dataFiles) ||
    dataFiles.length === 0
  ) {
    fail(
      "dataFiles must be a non-empty array",
    );
  }

  const fileNames =
    new Set();

  for (
    let index = 0;
    index < dataFiles.length;
    index += 1
  ) {
    const file =
      dataFiles[index];

    assertPlainObject(
      file,
      `dataFiles[${index}]`,
    );

    if (
      file.schemaVersion !==
      REPORT_EXPORT_FILE_SCHEMA_VERSION
    ) {
      fail(
        `dataFiles[${index}] schemaVersion is unsupported`,
      );
    }

    if (
      fileNames.has(
        file.fileName,
      )
    ) {
      fail(
        `duplicate export file ${file.fileName}`,
      );
    }

    fileNames.add(
      file.fileName,
    );
  }

  const manifest = {
    schemaVersion:
      REPORT_EXPORT_MANIFEST_SCHEMA_VERSION,
    sourceReport: {
      schemaVersion:
        report.schemaVersion,
      reportId:
        report.reportId,
      state:
        report.state,
      definition:
        report.definition,
      provider:
        report.provider,
      authority:
        report.authority,
      period:
        report.period,
      timeZone:
        report.timeZone,
      asOf:
        report.asOf,
      rowCount:
        report.rows.length,
      dimensions:
        report.dimensions.map(
          (dimension) =>
            dimension.dimensionId,
        ),
      measures:
        report.measures.map(
          (measure) =>
            measure.measureId,
        ),
      totals:
        report.totals,
      exclusions:
        report.exclusions,
      provenance:
        report.provenance,
      execution:
        report.execution,
      comparison:
        report.comparison,
    },
    export: {
      format:
        normalizedRequest.format,
      fileNameBase:
        normalizedRequest.fileNameBase,
      spreadsheetSafe:
        normalizedRequest
          .spreadsheetSafe,
      files:
        dataFiles.map(
          (file) => ({
            fileName:
              file.fileName,
            mediaType:
              file.mediaType,
            byteLength:
              file.byteLength,
            sha256:
              file.sha256,
          }),
        ),
    },
    boundary: {
      sourceReportMutation:
        false,
      recalculationAuthority:
        false,
      comparisonAuthority:
        false,
      deliverySideEffectAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  };

  return deepFreeze(
    canonicalizeExportValue(
      manifest,
    ),
  );
}

export function createReportExportBundle({
  report,
  request,
  dataFiles,
}) {
  const manifest =
    createReportExportManifest({
      report,
      request,
      dataFiles,
    });
  const manifestContent =
    `${JSON.stringify(
      canonicalizeExportValue(
        manifest,
      ),
      null,
      2,
    )}\n`;
  const manifestFile =
    createReportExportFile({
      fileName:
        `${request.fileNameBase}.manifest.json`,
      mediaType:
        "application/json; charset=utf-8",
      content:
        manifestContent,
    });
  const files =
    deepFreeze([
      ...dataFiles,
      manifestFile,
    ]);
  const identity = {
    schemaVersion:
      REPORT_EXPORT_BUNDLE_SCHEMA_VERSION,
    sourceReportId:
      report.reportId,
    format:
      request.format,
    fileNameBase:
      request.fileNameBase,
    spreadsheetSafe:
      request.spreadsheetSafe,
    files:
      files.map(
        (file) => ({
          fileName:
            file.fileName,
          mediaType:
            file.mediaType,
          byteLength:
            file.byteLength,
          sha256:
            file.sha256,
        }),
      ),
  };

  return deepFreeze({
    ...identity,
    exportId:
      `report-export:${createExportDigest(identity)}`,
    files,
    manifest,
    boundary: {
      sourceReportMutation:
        false,
      recalculationAuthority:
        false,
      comparisonAuthority:
        false,
      deliverySideEffectAuthority:
        false,
      persistenceMutationAuthority:
        false,
    },
  });
}
