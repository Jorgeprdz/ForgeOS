import {
  assertUniversalReportForExport,
  createReportExportBundle,
  createReportExportFile,
  createReportExportRequest,
} from "./report-export-contract.mjs";

export const CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION =
  "csv-report-export-adapter.v1";

const FORMULA_PREFIX =
  /^[=+\-@\t\r]/u;

export class CsvReportExportAdapterError
  extends TypeError {
  constructor(message) {
    super(
      `CsvReportExportAdapter: ${message}`,
    );
    this.name =
      "CsvReportExportAdapterError";
  }
}

function cellText(
  value,
  spreadsheetSafe,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new CsvReportExportAdapterError(
        "numeric cells must be finite",
      );
    }

    return String(value);
  }

  if (typeof value === "boolean") {
    return value
      ? "true"
      : "false";
  }

  if (typeof value !== "string") {
    return JSON.stringify(
      value,
    );
  }

  if (
    spreadsheetSafe &&
    FORMULA_PREFIX.test(value)
  ) {
    return `'${value}`;
  }

  return value;
}

function quoteCsvCell(value) {
  const text =
    String(value);

  if (
    /[",\r\n]/u.test(text)
  ) {
    return (
      '"' +
      text.replaceAll(
        '"',
        '""',
      ) +
      '"'
    );
  }

  return text;
}

export function createCsvReportExportAdapter() {
  return Object.freeze({
    schemaVersion:
      CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
    format:
      "CSV",

    export({
      report,
      request,
    }) {
      const source =
        assertUniversalReportForExport(
          report,
        );
      const normalizedRequest =
        createReportExportRequest(
          request,
        );

      if (
        normalizedRequest.format !==
        "CSV"
      ) {
        throw new CsvReportExportAdapterError(
          "request format must be CSV",
        );
      }

      const dimensionIds =
        source.dimensions.map(
          (dimension) =>
            dimension.dimensionId,
        );
      const measureIds =
        source.measures.map(
          (measure) =>
            measure.measureId,
        );
      const columns = [
        ...dimensionIds,
        ...measureIds,
      ];
      const lines = [
        columns
          .map(
            quoteCsvCell,
          )
          .join(","),
      ];

      for (const row of source.rows) {
        const cells = [
          ...dimensionIds.map(
            (dimensionId) =>
              row.dimensions[
                dimensionId
              ],
          ),
          ...measureIds.map(
            (measureId) =>
              row.measures[
                measureId
              ],
          ),
        ];

        lines.push(
          cells
            .map(
              (value) =>
                quoteCsvCell(
                  cellText(
                    value,
                    normalizedRequest
                      .spreadsheetSafe,
                  ),
                ),
            )
            .join(","),
        );
      }

      const content =
        `${lines.join("\r\n")}\r\n`;
      const dataFile =
        createReportExportFile({
          fileName:
            `${normalizedRequest.fileNameBase}.csv`,
          mediaType:
            "text/csv; charset=utf-8",
          content,
        });

      return createReportExportBundle({
        report:
          source,
        request:
          normalizedRequest,
        dataFiles: [
          dataFile,
        ],
      });
    },

    boundary:
      Object.freeze({
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
      }),
  });
}
