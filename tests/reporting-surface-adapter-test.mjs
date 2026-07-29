import test from "node:test";
import assert from "node:assert/strict";

import {
  createJsonReportExportAdapter,
} from "../advisor-os/reporting/export/json-report-export-adapter.mjs";

import {
  createCsvReportExportAdapter,
} from "../advisor-os/reporting/export/csv-report-export-adapter.mjs";

import {
  createDownloadDescriptorDeliveryAdapter,
} from "../advisor-os/reporting/delivery/download-descriptor-delivery-adapter.mjs";

import {
  REPORTING_SURFACE_MODEL_SCHEMA_VERSION,
  REPORTING_SURFACE_COLUMN_SCHEMA_VERSION,
  REPORTING_SURFACE_ROW_SCHEMA_VERSION,
  REPORTING_SURFACE_TOTAL_SCHEMA_VERSION,
  REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA_VERSION,
  REPORTING_SURFACE_ADAPTER_CAPABILITIES,
  REPORTING_SURFACE_EXPORT_FORMATS,
  ReportingSurfaceContractError,
  assertNoPresentationOwnership,
  assertUniversalReportForSurface,
  createReportingSurfaceExportRequest,
  createReportingSurfaceModel,
} from "../advisor-os/reporting/application/reporting-surface-contract.mjs";

import {
  REPORTING_SURFACE_ADAPTER_SCHEMA_VERSION,
  ReportingSurfaceAdapterError,
  createReportingSurfaceAdapter,
} from "../advisor-os/reporting/application/reporting-surface-adapter.mjs";

function report(overrides = {}) {
  return {
    schemaVersion:
      "universal-report-model.v1",
    sourceResolvedRequestKey:
      "resolved-request-001",
    definition: {
      definitionId:
        "activity-by-type",
      definitionVersion:
        "activity-by-type.v1",
    },
    provider: {
      providerId:
        "activity",
      providerVersion:
        "activity-report-provider.v1",
      domain:
        "ACTIVITY",
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
          "activityType",
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
          "observedActivityCount",
        valueKind:
          "NUMBER",
        unit:
          "COUNT",
        aggregation:
          "SUM",
        nullable:
          false,
      },
      {
        schemaVersion:
          "report-measure-capability.v1",
        measureId:
          "eligibleActivityCount",
        valueKind:
          "NUMBER",
        unit:
          "COUNT",
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
          activityType:
            "CONTACT_ATTEMPTED",
        },
        measures: {
          observedActivityCount:
            3,
          eligibleActivityCount:
            2,
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
          activityType:
            "CONVERSATION_COMPLETED",
        },
        measures: {
          observedActivityCount:
            2,
          eligibleActivityCount:
            2,
        },
      },
    ],
    totals: {
      observedActivityCount:
        5,
      eligibleActivityCount:
        4,
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
          "activity-read-runtime",
        sourceVersion:
          "activity-period-aggregation.v1",
        authority:
          "ACTIVITY_READ_RUNTIME",
      },
    ],
    execution: {
      schemaVersion:
        "universal-report-execution.v1",
      mode:
        "BATCHED",
      sliceCount:
        2,
    },
    reportId:
      "universal-report:activity-001",
    state:
      "READY",
    comparison: {
      schemaVersion:
        "report-comparison-result.v1",
      comparisonId:
        "activity-mom",
      kind:
        "PREVIOUS_PERIOD",
      measures: [
        {
          measureId:
            "eligibleActivityCount",
          currentValue:
            4,
          baselineValue:
            3,
          delta:
            1,
        },
      ],
    },
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

function exportRequest(
  format,
  overrides = {},
) {
  return {
    schemaVersion:
      "reporting-surface-export-request.v1",
    format,
    fileNameBase:
      "activity-july",
    spreadsheetSafe:
      true,
    ...overrides,
  };
}

function adapter(overrides = {}) {
  return createReportingSurfaceAdapter({
    jsonExportAdapter:
      overrides.jsonExportAdapter ??
      createJsonReportExportAdapter(),
    csvExportAdapter:
      overrides.csvExportAdapter ??
      createCsvReportExportAdapter(),
    deliveryAdapter:
      overrides.deliveryAdapter ??
      createDownloadDescriptorDeliveryAdapter(),
  });
}

test("exports surface schemas", () => {
  assert.equal(
    REPORTING_SURFACE_MODEL_SCHEMA_VERSION,
    "reporting-surface-model.v1",
  );
  assert.equal(
    REPORTING_SURFACE_COLUMN_SCHEMA_VERSION,
    "reporting-surface-column.v1",
  );
  assert.equal(
    REPORTING_SURFACE_ROW_SCHEMA_VERSION,
    "reporting-surface-row.v1",
  );
  assert.equal(
    REPORTING_SURFACE_TOTAL_SCHEMA_VERSION,
    "reporting-surface-total.v1",
  );
  assert.equal(
    REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA_VERSION,
    "reporting-surface-export-request.v1",
  );
});

test("exports surface capabilities", () => {
  assert.equal(
    REPORTING_SURFACE_ADAPTER_CAPABILITIES.length,
    7,
  );
  assert.deepEqual(
    REPORTING_SURFACE_EXPORT_FORMATS,
    [
      "JSON",
      "CSV",
    ],
  );
});

test("accepts a universal report", () => {
  assert.equal(
    assertUniversalReportForSurface(
      report(),
    ).reportId,
    "universal-report:activity-001",
  );
});

test("rejects unsupported report schemas", () => {
  assert.throws(
    () =>
      assertUniversalReportForSurface(
        report({
          schemaVersion:
            "dashboard-model.v1",
        }),
      ),
    ReportingSurfaceContractError,
  );
});

test("requires READY or EMPTY state", () => {
  assert.throws(
    () =>
      assertUniversalReportForSurface(
        report({
          state:
            "LOADING",
        }),
      ),
    /READY or EMPTY/u,
  );
});

test("rejects reversed report periods", () => {
  assert.throws(
    () =>
      assertUniversalReportForSurface(
        report({
          period: {
            from:
              "2026-07-03",
            to:
              "2026-07-02",
            dayCount:
              0,
            inclusive:
              true,
          },
        }),
      ),
    /reversed/u,
  );
});

test("requires report dimensions", () => {
  assert.throws(
    () =>
      assertUniversalReportForSurface(
        report({
          dimensions:
            null,
        }),
      ),
    /dimensions/u,
  );
});

test("requires report measures", () => {
  assert.throws(
    () =>
      assertUniversalReportForSurface(
        report({
          measures:
            null,
        }),
      ),
    /measures/u,
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
      assertUniversalReportForSurface(
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
      assertUniversalReportForSurface(
        value,
      ),
    /unique/u,
  );
});

test("requires canonical report rows", () => {
  const value =
    report();
  value.rows[0].schemaVersion =
    "table-row.v1";

  assert.throws(
    () =>
      assertUniversalReportForSurface(
        value,
      ),
    /schemaVersion/u,
  );
});

test("rejects duplicate report row keys", () => {
  const value =
    report();
  value.rows[1].rowKey =
    value.rows[0].rowKey;

  assert.throws(
    () =>
      assertUniversalReportForSurface(
        value,
      ),
    /duplicate report rowKey/u,
  );
});

test("requires every row dimension", () => {
  const value =
    report();
  delete value.rows[0]
    .dimensions.activityType;

  assert.throws(
    () =>
      assertUniversalReportForSurface(
        value,
      ),
    /lacks dimension/u,
  );
});

test("requires every row measure", () => {
  const value =
    report();
  delete value.rows[0]
    .measures.eligibleActivityCount;

  assert.throws(
    () =>
      assertUniversalReportForSurface(
        value,
      ),
    /lacks measure/u,
  );
});

test("requires every total measure", () => {
  const value =
    report();
  delete value.totals
    .eligibleActivityCount;

  assert.throws(
    () =>
      assertUniversalReportForSurface(
        value,
      ),
    /totals lacks measure/u,
  );
});

test("rejects presentation-owned keys", () => {
  assert.throws(
    () =>
      assertNoPresentationOwnership({
        nested: {
          color:
            "red",
        },
      }),
    /presentation-owned/u,
  );
});

test("normalizes export request", () => {
  assert.equal(
    createReportingSurfaceExportRequest(
      exportRequest("JSON"),
    ).format,
    "JSON",
  );
});

test("rejects unknown export request fields", () => {
  assert.throws(
    () =>
      createReportingSurfaceExportRequest({
        ...exportRequest("JSON"),
        downloadNow:
          true,
      }),
    /unknown field/u,
  );
});

test("rejects unsupported export formats", () => {
  assert.throws(
    () =>
      createReportingSurfaceExportRequest(
        exportRequest("PDF"),
      ),
    /unsupported/u,
  );
});

test("rejects unsafe file names", () => {
  assert.throws(
    () =>
      createReportingSurfaceExportRequest(
        exportRequest(
          "CSV",
          {
            fileNameBase:
              "../activity",
          },
        ),
      ),
    /unsafe/u,
  );
});

test("requires spreadsheet safety boolean", () => {
  assert.throws(
    () =>
      createReportingSurfaceExportRequest(
        exportRequest(
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

test("creates a reporting surface", () => {
  assert.equal(
    createReportingSurfaceModel({
      report:
        report(),
    }).schemaVersion,
    "reporting-surface-model.v1",
  );
});

test("surface preserves source identity", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.equal(
    surface.sourceReportId,
    report().reportId,
  );
  assert.deepEqual(
    surface.definition,
    report().definition,
  );
  assert.deepEqual(
    surface.provider,
    report().provider,
  );
});

test("surface preserves authority and period", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.authority,
    report().authority,
  );
  assert.deepEqual(
    surface.period,
    report().period,
  );
  assert.equal(
    surface.asOf,
    report().asOf,
  );
});

test("surface emits dimensions before measures", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.columns.map(
      (column) =>
        column.columnId,
    ),
    [
      "evaluationDate",
      "activityType",
      "observedActivityCount",
      "eligibleActivityCount",
    ],
  );
});

test("surface marks semantic column kinds", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.columns.map(
      (column) =>
        column.kind,
    ),
    [
      "DIMENSION",
      "DIMENSION",
      "MEASURE",
      "MEASURE",
    ],
  );
});

test("surface preserves measure metadata", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.columns[2],
    {
      schemaVersion:
        "reporting-surface-column.v1",
      columnId:
        "observedActivityCount",
      kind:
        "MEASURE",
      valueKind:
        "NUMBER",
      nullable:
        false,
      unit:
        "COUNT",
      aggregation:
        "SUM",
    },
  );
});

test("surface creates cells in column order", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.rows[0].cells,
    [
      {
        columnId:
          "evaluationDate",
        value:
          "2026-07-01",
      },
      {
        columnId:
          "activityType",
        value:
          "CONTACT_ATTEMPTED",
      },
      {
        columnId:
          "observedActivityCount",
        value:
          3,
      },
      {
        columnId:
          "eligibleActivityCount",
        value:
          2,
      },
    ],
  );
});

test("surface preserves row keys", () => {
  assert.equal(
    createReportingSurfaceModel({
      report:
        report(),
    }).rows[0].rowKey,
    "row-001",
  );
});

test("surface preserves totals without recalculation", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.deepEqual(
    surface.totals.map(
      (total) => [
        total.measureId,
        total.value,
      ],
    ),
    [
      [
        "observedActivityCount",
        5,
      ],
      [
        "eligibleActivityCount",
        4,
      ],
    ],
  );
});

test("surface preserves exclusions", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).exclusions,
    report().exclusions,
  );
});

test("surface preserves provenance", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).provenance,
    report().provenance,
  );
});

test("surface preserves execution metadata", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).execution,
    report().execution,
  );
});

test("surface preserves comparison result", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).comparison,
    report().comparison,
  );
});

test("surface exposes JSON and CSV export semantics", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).export,
    {
      enabled:
        true,
      formats: [
        "JSON",
        "CSV",
      ],
      spreadsheetSafeDefault:
        true,
    },
  );
});

test("empty report creates empty surface", () => {
  const value =
    report({
      rows:
        [],
      state:
        "EMPTY",
      totals: {
        observedActivityCount:
          0,
        eligibleActivityCount:
          0,
      },
    });
  const surface =
    createReportingSurfaceModel({
      report:
        value,
    });

  assert.equal(
    surface.state,
    "EMPTY",
  );
  assert.deepEqual(
    surface.rows,
    [],
  );
});

test("same report creates deterministic surface id", () => {
  assert.equal(
    createReportingSurfaceModel({
      report:
        report(),
    }).surfaceId,
    createReportingSurfaceModel({
      report:
        report(),
    }).surfaceId,
  );
});

test("surface is deeply immutable", () => {
  const surface =
    createReportingSurfaceModel({
      report:
        report(),
    });

  assert.equal(
    Object.isFrozen(surface),
    true,
  );
  assert.equal(
    Object.isFrozen(surface.columns),
    true,
  );
  assert.equal(
    Object.isFrozen(surface.rows[0]),
    true,
  );
});

test("surface claims no execution authority", () => {
  const boundary =
    createReportingSurfaceModel({
      report:
        report(),
    }).boundary;

  assert.equal(
    boundary.reportExecutionAuthority,
    false,
  );
  assert.equal(
    boundary.aggregationAuthority,
    false,
  );
  assert.equal(
    boundary.comparisonAuthority,
    false,
  );
});

test("surface reserves presentation for UI", () => {
  assert.deepEqual(
    createReportingSurfaceModel({
      report:
        report(),
    }).presentationBoundary,
    {
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
  );
});

test("exports adapter schema", () => {
  assert.equal(
    REPORTING_SURFACE_ADAPTER_SCHEMA_VERSION,
    "reporting-surface-adapter.v1",
  );
});

test("requires plain adapter input", () => {
  assert.throws(
    () =>
      createReportingSurfaceAdapter(),
    ReportingSurfaceContractError,
  );
});

test("rejects unsupported JSON adapter", () => {
  assert.throws(
    () =>
      adapter({
        jsonExportAdapter: {
          schemaVersion:
            "json-export.v0",
          format:
            "JSON",
          export() {},
        },
      }),
    ReportingSurfaceAdapterError,
  );
});

test("rejects unsupported CSV adapter", () => {
  assert.throws(
    () =>
      adapter({
        csvExportAdapter: {
          schemaVersion:
            "csv-export.v0",
          format:
            "CSV",
          export() {},
        },
      }),
    ReportingSurfaceAdapterError,
  );
});

test("rejects unsupported delivery adapter", () => {
  assert.throws(
    () =>
      adapter({
        deliveryAdapter: {
          schemaVersion:
            "browser-download.v1",
          deliveryMode:
            "BROWSER",
          deliver() {},
        },
      }),
    ReportingSurfaceAdapterError,
  );
});

test("adapter publishes capabilities", () => {
  assert.deepEqual(
    adapter().capabilities,
    REPORTING_SURFACE_ADAPTER_CAPABILITIES,
  );
});

test("adapter publishes export formats", () => {
  assert.deepEqual(
    adapter().exportFormats,
    [
      "JSON",
      "CSV",
    ],
  );
});

test("adapter projects a report", () => {
  assert.equal(
    adapter()
      .project(
        report(),
      ).sourceReportId,
    report().reportId,
  );
});

test("adapter prepares JSON download", () => {
  const download =
    adapter()
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("JSON"),
      });

  assert.equal(
    download.schemaVersion,
    "reporting-surface-download.v1",
  );
  assert.equal(
    download.format,
    "JSON",
  );
  assert.equal(
    download.status,
    "READY_FOR_CLIENT_DOWNLOAD",
  );
});

test("adapter prepares CSV download", () => {
  const download =
    adapter()
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("CSV"),
      });

  assert.equal(
    download.format,
    "CSV",
  );
  assert.deepEqual(
    download.descriptors.map(
      (descriptor) =>
        descriptor.fileName,
    ),
    [
      "activity-july.csv",
      "activity-july.manifest.json",
    ],
  );
});

test("download preserves manifest totals", () => {
  const download =
    adapter()
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("CSV"),
      });

  assert.deepEqual(
    download.manifest
      .sourceReport
      .totals,
    report().totals,
  );
});

test("download preserves comparison", () => {
  const download =
    adapter()
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("JSON"),
      });

  assert.deepEqual(
    download.manifest
      .sourceReport
      .comparison,
    report().comparison,
  );
});

test("download is deterministic", () => {
  const surfaceAdapter =
    adapter();
  const first =
    surfaceAdapter
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("JSON"),
      });
  const second =
    surfaceAdapter
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("JSON"),
      });

  assert.equal(
    first.exportId,
    second.exportId,
  );
  assert.equal(
    first.deliveryId,
    second.deliveryId,
  );
});

test("download performs no side effect", () => {
  const boundary =
    adapter()
      .prepareDownload({
        report:
          report(),
        request:
          exportRequest("CSV"),
      }).boundary;

  assert.equal(
    boundary.browserDownloadSideEffect,
    false,
  );
  assert.equal(
    boundary.fileSystemWrite,
    false,
  );
  assert.equal(
    boundary.networkSend,
    false,
  );
  assert.equal(
    boundary.emailSend,
    false,
  );
});

test("adapter claims no rendering authority", () => {
  const boundary =
    adapter().boundary;

  assert.equal(
    boundary.uiRenderingAuthority,
    false,
  );
  assert.equal(
    boundary.reportExecutionAuthority,
    false,
  );
  assert.equal(
    boundary.exportFormattingAuthority,
    false,
  );
});

test("adapter reserves presentation ownership for UI", () => {
  assert.equal(
    adapter()
      .presentationBoundary
      .componentsOwnedByUi,
    true,
  );
  assert.equal(
    adapter()
      .presentationBoundary
      .layoutOwnedByUi,
    true,
  );
});

test("adapter and downloads are deeply immutable", () => {
  const surfaceAdapter =
    adapter();
  const download =
    surfaceAdapter.prepareDownload({
      report:
        report(),
      request:
        exportRequest("JSON"),
    });

  assert.equal(
    Object.isFrozen(
      surfaceAdapter,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      download,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      download.descriptors,
    ),
    true,
  );
});

test("adapter exposes no execution calculation comparison or UI methods", () => {
  const value =
    adapter();

  for (const name of [
    "runReport",
    "executeProvider",
    "aggregate",
    "compare",
    "calculate",
    "render",
    "navigate",
    "persist",
    "writeFile",
    "sendEmail",
  ]) {
    assert.equal(
      name in value,
      false,
    );
  }
});
