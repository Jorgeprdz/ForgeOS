import {
  CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
} from "../export/csv-report-export-adapter.mjs";

import {
  JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
} from "../export/json-report-export-adapter.mjs";

import {
  DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION,
} from "../delivery/download-descriptor-delivery-adapter.mjs";

import {
  REPORTING_SURFACE_ADAPTER_CAPABILITIES,
  REPORTING_SURFACE_EXPORT_FORMATS,
  REPORTING_SURFACE_MODEL_SCHEMA_VERSION,
  ReportingSurfaceContractError,
  assertPlainSurfaceObject,
  assertUniversalReportForSurface,
  createReportingSurfaceExportRequest,
  createReportingSurfaceModel,
  deepFreezeSurfaceValue,
} from "./reporting-surface-contract.mjs";

export const REPORTING_SURFACE_ADAPTER_SCHEMA_VERSION =
  "reporting-surface-adapter.v1";

const INPUT_KEYS =
  new Set([
    "jsonExportAdapter",
    "csvExportAdapter",
    "deliveryAdapter",
  ]);

const PREPARE_DOWNLOAD_KEYS =
  new Set([
    "report",
    "request",
  ]);

export class ReportingSurfaceAdapterError
  extends TypeError {
  constructor(message) {
    super(
      `ReportingSurfaceAdapter: ${message}`,
    );
    this.name =
      "ReportingSurfaceAdapterError";
  }
}

function fail(message) {
  throw new ReportingSurfaceAdapterError(
    message,
  );
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

function normalizeExportAdapter(
  value,
  schemaVersion,
  format,
  label,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    value.schemaVersion !==
      schemaVersion ||
    value.format !==
      format ||
    typeof value.export !==
      "function"
  ) {
    fail(
      `${label} is not an accepted ${format} export adapter`,
    );
  }

  return value;
}

function normalizeDeliveryAdapter(
  value,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    value.schemaVersion !==
      DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION ||
    value.deliveryMode !==
      "DOWNLOAD_DESCRIPTOR" ||
    typeof value.deliver !==
      "function"
  ) {
    fail(
      "deliveryAdapter is not an accepted download descriptor adapter",
    );
  }

  return value;
}

function exportRequest(
  request,
) {
  const normalized =
    createReportingSurfaceExportRequest(
      request,
    );

  return {
    schemaVersion:
      "report-export-request.v1",
    format:
      normalized.format,
    fileNameBase:
      normalized.fileNameBase,
    spreadsheetSafe:
      normalized.spreadsheetSafe,
  };
}

export function createReportingSurfaceAdapter(
  input,
) {
  assertPlainSurfaceObject(
    input,
    "input",
  );
  assertExactKeys(
    input,
    INPUT_KEYS,
    "input",
  );

  const adapters =
    new Map([
      [
        "JSON",
        normalizeExportAdapter(
          input.jsonExportAdapter,
          JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
          "JSON",
          "jsonExportAdapter",
        ),
      ],
      [
        "CSV",
        normalizeExportAdapter(
          input.csvExportAdapter,
          CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
          "CSV",
          "csvExportAdapter",
        ),
      ],
    ]);
  const deliveryAdapter =
    normalizeDeliveryAdapter(
      input.deliveryAdapter,
    );

  return deepFreezeSurfaceValue({
    schemaVersion:
      REPORTING_SURFACE_ADAPTER_SCHEMA_VERSION,
    capabilities:
      REPORTING_SURFACE_ADAPTER_CAPABILITIES,
    exportFormats:
      REPORTING_SURFACE_EXPORT_FORMATS,

    project(report) {
      try {
        return createReportingSurfaceModel({
          report,
        });
      } catch (error) {
        if (
          error instanceof
          ReportingSurfaceContractError
        ) {
          throw error;
        }

        throw error;
      }
    },

    prepareDownload(inputValue) {
      assertPlainSurfaceObject(
        inputValue,
        "prepareDownload input",
      );
      assertExactKeys(
        inputValue,
        PREPARE_DOWNLOAD_KEYS,
        "prepareDownload input",
      );

      const report =
        assertUniversalReportForSurface(
          inputValue.report,
        );
      const request =
        createReportingSurfaceExportRequest(
          inputValue.request,
        );
      const adapter =
        adapters.get(
          request.format,
        );

      if (!adapter) {
        fail(
          `no export adapter for ${request.format}`,
        );
      }

      const bundle =
        adapter.export({
          report,
          request:
            exportRequest(
              request,
            ),
        });
      const receipt =
        deliveryAdapter.deliver(
          bundle,
        );

      return deepFreezeSurfaceValue({
        schemaVersion:
          "reporting-surface-download.v1",
        sourceReportId:
          report.reportId,
        sourceSurfaceSchemaVersion:
          REPORTING_SURFACE_MODEL_SCHEMA_VERSION,
        format:
          request.format,
        exportId:
          bundle.exportId,
        deliveryId:
          receipt.deliveryId,
        status:
          receipt.status,
        descriptors:
          receipt.descriptors,
        manifest:
          bundle.manifest,
        boundary: {
          sourceReportMutation:
            false,
          reportExecutionAuthority:
            false,
          aggregationAuthority:
            false,
          comparisonAuthority:
            false,
          browserDownloadSideEffect:
            false,
          fileSystemWrite:
            false,
          networkSend:
            false,
          emailSend:
            false,
          persistenceMutationAuthority:
            false,
        },
      });
    },

    boundary:
      deepFreezeSurfaceValue({
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
      }),

    presentationBoundary:
      deepFreezeSurfaceValue({
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
      }),
  });
}
