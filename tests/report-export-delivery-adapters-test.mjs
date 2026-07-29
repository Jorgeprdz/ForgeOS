import test from "node:test";
import assert from "node:assert/strict";

import {
  REPORT_EXPORT_REQUEST_SCHEMA_VERSION,
  REPORT_EXPORT_BUNDLE_SCHEMA_VERSION,
  REPORT_EXPORT_FILE_SCHEMA_VERSION,
  REPORT_EXPORT_MANIFEST_SCHEMA_VERSION,
  REPORT_EXPORT_FORMATS,
  ReportExportContractError,
  canonicalizeExportValue,
  createExportDigest,
  assertUniversalReportForExport,
  createReportExportRequest,
  createReportExportFile,
} from "../advisor-os/reporting/export/report-export-contract.mjs";

import {
  JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
  JsonReportExportAdapterError,
  createJsonReportExportAdapter,
} from "../advisor-os/reporting/export/json-report-export-adapter.mjs";

import {
  CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
  CsvReportExportAdapterError,
  createCsvReportExportAdapter,
} from "../advisor-os/reporting/export/csv-report-export-adapter.mjs";

import {
  REPORT_DELIVERY_RECEIPT_SCHEMA_VERSION,
  DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION,
  ReportDeliveryAdapterError,
  createDownloadDescriptorDeliveryAdapter,
} from "../advisor-os/reporting/delivery/download-descriptor-delivery-adapter.mjs";

function report(overrides = {}) {
  return {
    schemaVersion:
      "universal-report-model.v1",
    sourceResolvedRequestKey:
      "resolved-request-001",
    definition: {
      definitionId:
        "performance-daily",
      definitionVersion:
        "performance-daily.v1",
    },
    provider: {
      providerId:
        "performance",
      providerVersion:
        "performance-report-provider.v1",
      domain:
        "PERFORMANCE",
    },
    authority: {
      organizationId:
        "organization-001",
      principalId:
        "advisor-001",
    },
    period: {
      from:
        "2026-07-01",
      to:
        "2026-07-02",
      dayCount:
        2,
      inclusive:
        true,
    },
    timeZone:
      "America/Mexico_City",
    asOf:
      "2026-07-02T18:00:00.000Z",
    dimensions: [
      {
        schemaVersion:
          "report-dimension-capability.v1",
        dimensionId:
          "evaluationDate",
        valueKind:
          "DATE",
        nullable:
          false,
      },
      {
        schemaVersion:
          "report-dimension-capability.v1",
        dimensionId:
          "status",
        valueKind:
          "STRING",
        nullable:
          false,
      },
    ],
    measures: [
      {
        schemaVersion:
          "report-measure-capability.v1",
        measureId:
          "points",
        valueKind:
          "NUMBER",
        unit:
          "POINTS",
        aggregation:
          "SUM",
        nullable:
          false,
      },
      {
        schemaVersion:
          "report-measure-capability.v1",
        measureId:
          "target",
        valueKind:
          "NUMBER",
        unit:
          "POINTS",
        aggregation:
          "SUM",
        nullable:
          false,
      },
    ],
    rows: [
      {
        schemaVersion:
          "universal-report-row.v1",
        rowKey:
          "row-001",
        dimensions: {
          evaluationDate:
            "2026-07-01",
          status:
            "MET",
        },
        measures: {
          points:
            12,
          target:
            10,
        },
      },
      {
        schemaVersion:
          "universal-report-row.v1",
        rowKey:
          "row-002",
        dimensions: {
          evaluationDate:
            "2026-07-02",
          status:
            "=HYPERLINK(\"bad\")",
        },
        measures: {
          points:
            7.5,
          target:
            10,
        },
      },
    ],
    totals: {
      points:
        19.5,
      target:
        20,
    },
    exclusions: [
      {
        code:
          "SUPPRESSED",
        count:
          1,
      },
    ],
    provenance: [
      {
        sourceId:
          "performance-period-runtime",
        sourceVersion:
          "performance-period-evaluation.v1",
        authority:
          "PERFORMANCE_SCORING",
      },
    ],
    execution: {
      schemaVersion:
        "universal-report-execution.v1",
      sliceCount:
        2,
      providerCallCount:
        2,
    },
    reportId:
      "universal-report:abc123",
    state:
      "READY",
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
    ...overrides,
  };
}

function request(
  format,
  overrides = {},
) {
  return {
    schemaVersion:
      "report-export-request.v1",
    format,
    fileNameBase:
      "performance-july",
    spreadsheetSafe:
      true,
    ...overrides,
  };
}

test("exports canonical export schemas", () => {
  assert.equal(
    REPORT_EXPORT_REQUEST_SCHEMA_VERSION,
    "report-export-request.v1",
  );
  assert.equal(
    REPORT_EXPORT_BUNDLE_SCHEMA_VERSION,
    "report-export-bundle.v1",
  );
  assert.equal(
    REPORT_EXPORT_FILE_SCHEMA_VERSION,
    "report-export-file.v1",
  );
  assert.equal(
    REPORT_EXPORT_MANIFEST_SCHEMA_VERSION,
    "report-export-manifest.v1",
  );
});

test("exports JSON and CSV formats", () => {
  assert.deepEqual(
    REPORT_EXPORT_FORMATS,
    [
      "JSON",
      "CSV",
    ],
  );
});

test("canonicalizes object keys", () => {
  assert.deepEqual(
    Object.keys(
      canonicalizeExportValue({
        z:
          1,
        a:
          2,
      }),
    ),
    [
      "a",
      "z",
    ],
  );
});

test("creates deterministic export digests", () => {
  assert.equal(
    createExportDigest({
      b:
        2,
      a:
        1,
    }),
    createExportDigest({
      a:
        1,
      b:
        2,
    }),
  );
});

test("rejects non-JSON-compatible values", () => {
  assert.throws(
    () =>
      canonicalizeExportValue(
        new Date(),
      ),
    ReportExportContractError,
  );
});

test("accepts a universal report", () => {
  assert.equal(
    assertUniversalReportForExport(
      report(),
    ).reportId,
    "universal-report:abc123",
  );
});

test("rejects unsupported report schemas", () => {
  assert.throws(
    () =>
      assertUniversalReportForExport(
        report({
          schemaVersion:
            "dashboard-model.v1",
        }),
      ),
    /schemaVersion/u,
  );
});

test("requires READY or EMPTY state", () => {
  assert.throws(
    () =>
      assertUniversalReportForExport(
        report({
          state:
            "LOADING",
        }),
      ),
    /READY or EMPTY/u,
  );
});

test("requires report dimensions", () => {
  assert.throws(
    () =>
      assertUniversalReportForExport(
        report({
          dimensions:
            null,
        }),
      ),
    /dimensions/u,
  );
});

test("rejects duplicate dimensions", () => {
  const value =
    report();
  value.dimensions = [
    value.dimensions[0],
    value.dimensions[0],
  ];

  assert.throws(
    () =>
      assertUniversalReportForExport(
        value,
      ),
    /unique/u,
  );
});

test("rejects duplicate measures", () => {
  const value =
    report();
  value.measures = [
    value.measures[0],
    value.measures[0],
  ];

  assert.throws(
    () =>
      assertUniversalReportForExport(
        value,
      ),
    /unique/u,
  );
});

test("requires universal report rows", () => {
  const value =
    report();
  value.rows[0].schemaVersion =
    "table-row.v1";

  assert.throws(
    () =>
      assertUniversalReportForExport(
        value,
      ),
    /schemaVersion/u,
  );
});

test("requires every selected dimension", () => {
  const value =
    report();
  delete value.rows[0]
    .dimensions.status;

  assert.throws(
    () =>
      assertUniversalReportForExport(
        value,
      ),
    /lacks dimension/u,
  );
});

test("requires every selected measure", () => {
  const value =
    report();
  delete value.rows[0]
    .measures.target;

  assert.throws(
    () =>
      assertUniversalReportForExport(
        value,
      ),
    /lacks measure/u,
  );
});

test("normalizes an export request", () => {
  assert.equal(
    createReportExportRequest(
      request("JSON"),
    ).format,
    "JSON",
  );
});

test("rejects unknown request fields", () => {
  assert.throws(
    () =>
      createReportExportRequest({
        ...request("JSON"),
        recalculate:
          true,
      }),
    /unknown field/u,
  );
});

test("rejects unsupported formats", () => {
  assert.throws(
    () =>
      createReportExportRequest(
        request("XLSX"),
      ),
    /unsupported/u,
  );
});

test("rejects unsafe file names", () => {
  assert.throws(
    () =>
      createReportExportRequest(
        request(
          "JSON",
          {
            fileNameBase:
              "../report",
          },
        ),
      ),
    /unsafe/u,
  );
});

test("requires spreadsheetSafe boolean", () => {
  assert.throws(
    () =>
      createReportExportRequest(
        request(
          "CSV",
          {
            spreadsheetSafe:
              "yes",
          },
        ),
      ),
    /boolean/u,
  );
});

test("creates UTF-8 export files", () => {
  const file =
    createReportExportFile({
      fileName:
        "á.json",
      mediaType:
        "application/json",
      content:
        "á",
    });

  assert.equal(
    file.byteLength,
    2,
  );
  assert.equal(
    file.sha256.length,
    64,
  );
});

test("rejects unsafe export file paths", () => {
  assert.throws(
    () =>
      createReportExportFile({
        fileName:
          "folder/report.json",
        mediaType:
          "application/json",
        content:
          "{}",
      }),
    /unsafe/u,
  );
});

test("exports JSON adapter schema", () => {
  assert.equal(
    JSON_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
    "json-report-export-adapter.v1",
  );
});

test("creates the JSON adapter", () => {
  assert.equal(
    createJsonReportExportAdapter()
      .format,
    "JSON",
  );
});

test("JSON adapter rejects CSV requests", () => {
  assert.throws(
    () =>
      createJsonReportExportAdapter()
        .export({
          report:
            report(),
          request:
            request("CSV"),
        }),
    JsonReportExportAdapterError,
  );
});

test("JSON export creates data and manifest files", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });

  assert.equal(
    bundle.files.length,
    2,
  );
  assert.deepEqual(
    bundle.files.map(
      (file) =>
        file.fileName,
    ),
    [
      "performance-july.json",
      "performance-july.manifest.json",
    ],
  );
});

test("JSON export preserves full report identity", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const exported =
    JSON.parse(
      bundle.files[0].content,
    );

  assert.equal(
    exported.reportId,
    report().reportId,
  );
  assert.deepEqual(
    exported.totals,
    report().totals,
  );
});

test("JSON export preserves exclusions and provenance", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const exported =
    JSON.parse(
      bundle.files[0].content,
    );

  assert.deepEqual(
    exported.exclusions,
    report().exclusions,
  );
  assert.deepEqual(
    exported.provenance,
    report().provenance,
  );
});

test("JSON export is deterministic", () => {
  const adapter =
    createJsonReportExportAdapter();
  const first =
    adapter.export({
      report:
        report(),
      request:
        request("JSON"),
    });
  const second =
    adapter.export({
      report:
        report(),
      request:
        request("JSON"),
    });

  assert.equal(
    first.exportId,
    second.exportId,
  );
  assert.equal(
    first.files[0].content,
    second.files[0].content,
  );
});

test("JSON export is deeply immutable", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });

  assert.equal(
    Object.isFrozen(bundle),
    true,
  );
  assert.equal(
    Object.isFrozen(bundle.files),
    true,
  );
  assert.equal(
    Object.isFrozen(bundle.files[0]),
    true,
  );
});

test("exports CSV adapter schema", () => {
  assert.equal(
    CSV_REPORT_EXPORT_ADAPTER_SCHEMA_VERSION,
    "csv-report-export-adapter.v1",
  );
});

test("creates the CSV adapter", () => {
  assert.equal(
    createCsvReportExportAdapter()
      .format,
    "CSV",
  );
});

test("CSV adapter rejects JSON requests", () => {
  assert.throws(
    () =>
      createCsvReportExportAdapter()
        .export({
          report:
            report(),
          request:
            request("JSON"),
        }),
    CsvReportExportAdapterError,
  );
});

test("CSV export creates data and manifest files", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.deepEqual(
    bundle.files.map(
      (file) =>
        file.fileName,
    ),
    [
      "performance-july.csv",
      "performance-july.manifest.json",
    ],
  );
});

test("CSV header preserves dimension then measure order", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.equal(
    bundle.files[0].content
      .split("\r\n")[0],
    "evaluationDate,status,points,target",
  );
});

test("CSV preserves numeric values without recalculation", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });
  const lines =
    bundle.files[0].content
      .split("\r\n");

  assert.equal(
    lines[1],
    "2026-07-01,MET,12,10",
  );
  assert.equal(
    lines[2],
    "2026-07-02,\"'=HYPERLINK(\"\"bad\"\")\",7.5,10",
  );
});

test("CSV protects spreadsheet formula strings", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.match(
    bundle.files[0].content,
    /'=HYPERLINK/u,
  );
});

test("CSV can preserve raw formula-like strings when disabled", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request(
            "CSV",
            {
              spreadsheetSafe:
                false,
            },
          ),
      });

  assert.doesNotMatch(
    bundle.files[0].content,
    /'=HYPERLINK/u,
  );
});

test("CSV quotes commas", () => {
  const value =
    report();
  value.rows[0].dimensions.status =
    "MET,EXCEEDED";

  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          value,
        request:
          request("CSV"),
      });

  assert.match(
    bundle.files[0].content,
    /"MET,EXCEEDED"/u,
  );
});

test("CSV quotes embedded quotes", () => {
  const value =
    report();
  value.rows[0].dimensions.status =
    'HE SAID "YES"';

  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          value,
        request:
          request("CSV"),
      });

  assert.match(
    bundle.files[0].content,
    /"HE SAID ""YES"""/u,
  );
});

test("CSV uses CRLF row endings", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.match(
    bundle.files[0].content,
    /\r\n$/u,
  );
});

test("CSV supports empty reports", () => {
  const value =
    report({
      rows:
        [],
      state:
        "EMPTY",
    });
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          value,
        request:
          request("CSV"),
      });

  assert.equal(
    bundle.files[0].content,
    "evaluationDate,status,points,target\r\n",
  );
});

test("manifest preserves source totals exactly", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.deepEqual(
    bundle.manifest
      .sourceReport
      .totals,
    report().totals,
  );
});

test("manifest preserves comparison", () => {
  const value =
    report({
      comparison: {
        schemaVersion:
          "report-comparison-result.v1",
        comparisonId:
          "performance-mom",
      },
    });
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          value,
        request:
          request("JSON"),
      });

  assert.deepEqual(
    bundle.manifest
      .sourceReport
      .comparison,
    value.comparison,
  );
});

test("manifest lists data file hashes", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.equal(
    bundle.manifest
      .export.files[0]
      .sha256,
    bundle.files[0].sha256,
  );
});

test("bundle boundary denies recalculation", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.equal(
    bundle.boundary
      .recalculationAuthority,
    false,
  );
  assert.equal(
    bundle.boundary
      .comparisonAuthority,
    false,
  );
});

test("JSON and CSV export ids differ", () => {
  const json =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const csv =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });

  assert.notEqual(
    json.exportId,
    csv.exportId,
  );
});

test("exports delivery schemas", () => {
  assert.equal(
    REPORT_DELIVERY_RECEIPT_SCHEMA_VERSION,
    "report-delivery-receipt.v1",
  );
  assert.equal(
    DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA_VERSION,
    "download-descriptor-delivery-adapter.v1",
  );
});

test("creates download descriptor adapter", () => {
  assert.equal(
    createDownloadDescriptorDeliveryAdapter()
      .deliveryMode,
    "DOWNLOAD_DESCRIPTOR",
  );
});

test("delivery rejects non-bundles", () => {
  assert.throws(
    () =>
      createDownloadDescriptorDeliveryAdapter()
        .deliver({}),
    ReportDeliveryAdapterError,
  );
});

test("delivery creates one descriptor per file", () => {
  const bundle =
    createCsvReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("CSV"),
      });
  const receipt =
    createDownloadDescriptorDeliveryAdapter()
      .deliver(bundle);

  assert.equal(
    receipt.descriptors.length,
    bundle.files.length,
  );
});

test("delivery preserves file bytes and hashes", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const receipt =
    createDownloadDescriptorDeliveryAdapter()
      .deliver(bundle);

  assert.equal(
    receipt.descriptors[0].content,
    bundle.files[0].content,
  );
  assert.equal(
    receipt.descriptors[0].sha256,
    bundle.files[0].sha256,
  );
  assert.equal(
    receipt.descriptors[0].byteLength,
    bundle.files[0].byteLength,
  );
});

test("delivery is deterministic", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const adapter =
    createDownloadDescriptorDeliveryAdapter();

  assert.equal(
    adapter.deliver(bundle)
      .deliveryId,
    adapter.deliver(bundle)
      .deliveryId,
  );
});

test("delivery performs no side effect", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const receipt =
    createDownloadDescriptorDeliveryAdapter()
      .deliver(bundle);

  assert.equal(
    receipt.status,
    "READY_FOR_CLIENT_DOWNLOAD",
  );
  assert.deepEqual(
    receipt.boundary,
    {
      browserDownloadSideEffect:
        false,
      fileSystemWrite:
        false,
      networkSend:
        false,
      emailSend:
        false,
      persistenceMutation:
        false,
    },
  );
});

test("delivery receipt is deeply immutable", () => {
  const bundle =
    createJsonReportExportAdapter()
      .export({
        report:
          report(),
        request:
          request("JSON"),
      });
  const receipt =
    createDownloadDescriptorDeliveryAdapter()
      .deliver(bundle);

  assert.equal(
    Object.isFrozen(receipt),
    true,
  );
  assert.equal(
    Object.isFrozen(
      receipt.descriptors,
    ),
    true,
  );
});

test("adapters expose no calculation comparison or persistence methods", () => {
  const adapters = [
    createJsonReportExportAdapter(),
    createCsvReportExportAdapter(),
    createDownloadDescriptorDeliveryAdapter(),
  ];

  for (const adapter of adapters) {
    for (const name of [
      "calculate",
      "aggregate",
      "compare",
      "persist",
      "sendEmail",
      "writeFile",
      "openBrowser",
      "mutateReport",
    ]) {
      assert.equal(
        name in adapter,
        false,
      );
    }
  }
});
