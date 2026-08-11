import {
  assertActivityReportSourcePort,
} from "../application/activity-report-source-port.js";

import {
  projectActivityReportToChartReady,
} from "../application/activity-chart-ready-projection.js";

import {
  createActivityReportProvider,
  ACTIVITY_REPORT_DEFINITION_ID,
} from "../providers/activity-report-provider.js";

import {
  createUniversalReportingKernel,
} from "./universal-reporting-kernel.js";

import {
  createUniversalPeriodResolver,
} from "./universal-period-resolver.js";

import {
  createReportProviderRuntime,
} from "./report-provider-runtime.js";

import {
  createUniversalReportAggregationRuntime,
} from "./universal-report-aggregation-runtime.js";

export const ACTIVITY_REPORTING_RUNTIME_SCHEMA_VERSION =
  "activity-reporting-runtime.v1";

const INPUT_KEYS = new Set([
  "sourcePort",
  "clock",
  "calendarPolicy",
]);

const REQUEST_KEYS = new Set([
  "period",
  "timeZone",
  "asOf",
  "dimensions",
  "measures",
  "metadata",
]);

const CHART_REQUEST_KEYS = new Set([
  "period",
  "timeZone",
  "asOf",
  "metadata",
]);

export class ActivityReportingRuntimeError extends TypeError {
  constructor(message) {
    super(`ActivityReportingRuntime: ${message}`);
    this.name = "ActivityReportingRuntimeError";
  }
}

function fail(message) {
  throw new ActivityReportingRuntimeError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function exactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${label} contains unknown field ${key}`);
    }
  }
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function providerDescriptor(provider) {
  const descriptor = provider.port.contract.descriptor;
  return {
    providerId: descriptor.providerId,
    providerVersion: descriptor.providerVersion,
    domain: descriptor.domain,
    capabilities: descriptor.capabilities,
  };
}

export function createActivityReportingRuntime(input) {
  plain(input, "input");
  exactKeys(input, INPUT_KEYS, "input");

  const sourcePort = assertActivityReportSourcePort(input.sourcePort);
  const activityProvider = createActivityReportProvider({ sourcePort });
  const providerRuntime = createReportProviderRuntime({
    providers: [activityProvider.port],
    definitions: [activityProvider.definition],
  });
  const kernel = createUniversalReportingKernel({
    authority: {
      organizationId: sourcePort.authority.organizationId,
      principalId: sourcePort.authority.advisorId,
    },
    providers: [providerDescriptor(activityProvider)],
    ...(input.clock === undefined ? {} : { clock: input.clock }),
  });
  const periodResolver = createUniversalPeriodResolver({
    ...(input.calendarPolicy === undefined
      ? {}
      : { policy: input.calendarPolicy }),
  });
  const aggregationRuntime = createUniversalReportAggregationRuntime({
    providerRuntime,
  });

  const runtime = {
    schemaVersion: ACTIVITY_REPORTING_RUNTIME_SCHEMA_VERSION,
    registry: freeze({
      providerId: activityProvider.port.contract.descriptor.providerId,
      providerVersion:
        activityProvider.port.contract.descriptor.providerVersion,
      definitionId: activityProvider.definition.definitionId,
      definitionVersion: activityProvider.definition.definitionVersion,
    }),
    authority: kernel.authority,
    capabilities: freeze([
      "ACTIVITY_REQUEST_IDENTITY",
      "ACTIVITY_PERIOD_RESOLUTION",
      "ACTIVITY_PROVIDER_EXECUTION",
      "ACTIVITY_UNIVERSAL_AGGREGATION",
      "ACTIVITY_CHART_READY_PROJECTION",
    ]),
    boundary: freeze({
      canonicalEventTruthAuthority: false,
      activityReadAuthority: true,
      activityWriteAuthority: false,
      scoringAuthority: false,
      eventInterpretationAuthority: false,
      reportingAggregationAuthority: true,
      chartCompatibilityAuthority: true,
      uiRenderingAuthority: false,
      presentationStylingAuthority: false,
      aiDecisionAuthority: false,
      persistenceMutationAuthority: false,
    }),

    createRequest(requestInput) {
      const request = plain(requestInput, "request");
      exactKeys(request, REQUEST_KEYS, "request");

      return kernel.createRequest({
        definitionId: ACTIVITY_REPORT_DEFINITION_ID,
        providerId: activityProvider.port.contract.descriptor.providerId,
        period: request.period,
        timeZone: request.timeZone,
        ...(request.asOf === undefined ? {} : { asOf: request.asOf }),
        dimensions: request.dimensions ?? [],
        measures: request.measures ?? [],
        metadata: request.metadata ?? {},
      });
    },

    resolveRequest(requestInput) {
      return periodResolver.resolveRequest(
        this.createRequest(requestInput),
      );
    },

    async runReport(requestInput) {
      return aggregationRuntime.runReport(
        this.resolveRequest(requestInput),
      );
    },

    async runChartReady(requestInput) {
      const request = plain(requestInput, "chart request");
      exactKeys(request, CHART_REQUEST_KEYS, "chart request");

      const report = await this.runReport({
        period: request.period,
        timeZone: request.timeZone,
        ...(request.asOf === undefined ? {} : { asOf: request.asOf }),
        dimensions: [
          "evaluationDate",
          "activityType",
        ],
        measures: [
          "activityCount",
        ],
        metadata: request.metadata ?? {},
      });

      return freeze({
        schemaVersion: "activity-reporting-result.v1",
        report,
        chartReady:
          projectActivityReportToChartReady(report),
        boundary: {
          reportCalculatedByUniversalRuntime: true,
          chartCalculatedMeasures: false,
          uiRenderingAuthority: false,
          aiDecisionAuthority: false,
          persistenceMutationAuthority: false,
        },
      });
    },
  };

  return freeze(runtime);
}
