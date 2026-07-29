import {
  assertUniversalReportForExport,
  canonicalizeExportValue,
  createReportExportBundle,
  createReportExportFile,
  createReportExportRequest,
} from "./report-export-contract.mjs";

export const JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION =
  "json-report-export-adapter.v1";

export class JsonReportExportAdapterError
  extends TypeError {
  constructor(message) {
    super(
      `JsonReportExportAdapter: ${message}`,
    );
    this.name =
      "JsonReportExportAdapterError";
  }
}

export function createJsonReportExportAdapter() {
  return Object.freeze({
    schemaVersion:
      JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
    format:
      "JSON",

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
        "JSON"
      ) {
        throw new JsonReportExportAdapterError(
          "request format must be JSON",
        );
      }

      const content =
        `${JSON.stringify(
          canonicalizeExportValue(
            source,
          ),
          null,
          2,
        )}\n`;
      const dataFile =
        createReportExportFile({
          fileName:
            `${normalizedRequest.fileNameBase}.json`,
          mediaType:
            "application/json; charset=utf-8",
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
