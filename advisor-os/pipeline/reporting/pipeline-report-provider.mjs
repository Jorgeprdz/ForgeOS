import {
  createReportProviderPort,
} from "../../reporting/application/report-provider-port.mjs";

import {
  PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION,
  normalizePipelineTransitionPeriodModel,
} from "../domain/pipeline-transition-read-model.mjs";

export const PIPELINE_REPORT_PROVIDER_SCHEMA_VERSION =
  "pipeline-report-provider.v1";

export const PIPELINE_REPORT_DEFINITION_ID =
  "pipeline-transitions";

export const PIPELINE_REPORT_DEFINITION_VERSION =
  "pipeline-transitions.v1";

const SUPPORTED_RUNTIME_SCHEMAS =
  new Set([
    "pipeline-transition-read-runtime.v1",
    "pipeline-timeline-read-composition.v1",
  ]);

export class PipelineReportProviderError
  extends TypeError {
  constructor(message) {
    super(
      `PipelineReportProvider: ${message}`,
    );
    this.name =
      "PipelineReportProviderError";
  }
}

function fail(message) {
  throw new PipelineReportProviderError(
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

function assertReadRuntime(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    !SUPPORTED_RUNTIME_SCHEMAS.has(
      value.schemaVersion,
    ) ||
    typeof value.readPeriod !==
      "function"
  ) {
    fail(
      "readRuntime does not satisfy accepted Pipeline transition read authority",
    );
  }

  return value;
}

function selected(
  object,
  keys,
) {
  return Object.fromEntries(
    keys.map(
      (key) => [
        key,
        object[key],
      ],
    ),
  );
}

export function createPipelineReportProvider({
  readRuntime,
  maxSliceDays,
} = {}) {
  const runtime =
    assertReadRuntime(
      readRuntime,
    );
  const sliceDays =
    maxSliceDays ??
    runtime.maxDays ??
    31;

  if (
    !Number.isSafeInteger(sliceDays) ||
    sliceDays < 1
  ) {
    fail(
      "maxSliceDays must be a positive integer",
    );
  }

  const dimensions = [
    {
      dimensionId:
        "transitionDate",
      valueKind:
        "DATE",
      nullable:
        false,
    },
    {
      dimensionId:
        "fromStage",
      valueKind:
        "STRING",
      nullable:
        false,
    },
    {
      dimensionId:
        "toStage",
      valueKind:
        "STRING",
      nullable:
        false,
    },
    {
      dimensionId:
        "hasAppointment",
      valueKind:
        "BOOLEAN",
      nullable:
        false,
    },
    {
      dimensionId:
        "hasPolicy",
      valueKind:
        "BOOLEAN",
      nullable:
        false,
    },
  ];

  const measures = [
    {
      measureId:
        "transitionCount",
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
      measureId:
        "evidenceTokenCount",
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
      measureId:
        "appointmentLinkedTransitionCount",
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
      measureId:
        "policyLinkedTransitionCount",
      valueKind:
        "NUMBER",
      unit:
        "COUNT",
      aggregation:
        "SUM",
      nullable:
        false,
    },
  ];

  const port =
    createReportProviderPort({
      descriptor: {
        providerId:
          "pipeline",
        providerVersion:
          PIPELINE_REPORT_PROVIDER_SCHEMA_VERSION,
        domain:
          "PIPELINE",
        capabilities: [
          "PIPELINE_TRANSITION_PERIOD_READ_MODEL",
          "PIPELINE_STAGE_MOVEMENT_FACTS",
          "PIPELINE_EVIDENCE_COUNTS",
          "PIPELINE_LINKAGE_COUNTS",
        ],
      },
      dimensions,
      measures,
      maxSliceDays:
        sliceDays,
      batchingMode:
        "CONTIGUOUS_DATE_RANGES",

      async readSlice(query) {
        assertPlainObject(
          query,
          "query",
        );

        const raw =
          await runtime.readPeriod({
            transitionDateFrom:
              query.period.from,
            transitionDateTo:
              query.period.to,
            asOf:
              query.asOf,
          });

        const model =
          normalizePipelineTransitionPeriodModel(
            raw,
          );

        if (
          model.schemaVersion !==
          PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA_VERSION
        ) {
          fail(
            "readRuntime returned an unsupported period model",
          );
        }

        if (
          model.period.transitionDateFrom !==
            query.period.from ||
          model.period.transitionDateTo !==
            query.period.to
        ) {
          fail(
            "Pipeline period coverage does not match provider slice",
          );
        }

        if (
          model.period.asOf !==
          query.asOf
        ) {
          fail(
            "Pipeline period asOf does not match provider slice",
          );
        }

        const rows =
          model.transitions.map(
            (transition) => {
              const hasAppointment =
                transition.appointmentId !==
                null;
              const hasPolicy =
                transition.policyId !==
                null;
              const dimensionValues = {
                transitionDate:
                  transition.transitionDate,
                fromStage:
                  transition.fromStage,
                toStage:
                  transition.toStage,
                hasAppointment,
                hasPolicy,
              };
              const measureValues = {
                transitionCount:
                  1,
                evidenceTokenCount:
                  transition.evidence.length,
                appointmentLinkedTransitionCount:
                  hasAppointment
                    ? 1
                    : 0,
                policyLinkedTransitionCount:
                  hasPolicy
                    ? 1
                    : 0,
              };

              return {
                dimensions:
                  selected(
                    dimensionValues,
                    query.dimensions,
                  ),
                measures:
                  selected(
                    measureValues,
                    query.measures,
                  ),
              };
            },
          );

        return {
          rows,
          exclusions: [
            {
              code:
                "FUTURE_RECORDED",
              count:
                model.exclusions
                  .futureRecorded,
            },
            {
              code:
                "SUPPRESSED",
              count:
                model.exclusions
                  .suppressed,
            },
            {
              code:
                "UNVERIFIED",
              count:
                model.exclusions
                  .unverified,
            },
          ],
          provenance: [
            {
              sourceId:
                "pipeline-transition-read-runtime",
              sourceVersion:
                model.sourceSchemaVersion,
              authority:
                "ACCEPTED_PIPELINE_TRANSITION_FACTS",
            },
          ],
        };
      },
    });

  return Object.freeze({
    schemaVersion:
      PIPELINE_REPORT_PROVIDER_SCHEMA_VERSION,
    definition:
      Object.freeze({
        definitionId:
          PIPELINE_REPORT_DEFINITION_ID,
        definitionVersion:
          PIPELINE_REPORT_DEFINITION_VERSION,
        providerId:
          port.contract.descriptor
            .providerId,
        dimensions:
          Object.freeze(
            dimensions.map(
              (item) =>
                item.dimensionId,
            ),
          ),
        measures:
          Object.freeze(
            measures.map(
              (item) =>
                item.measureId,
            ),
          ),
        defaultDimensions:
          Object.freeze([
            "transitionDate",
            "fromStage",
            "toStage",
          ]),
        defaultMeasures:
          Object.freeze([
            "transitionCount",
          ]),
      }),
    port,
    boundary:
      Object.freeze({
        pipelineTransitionReadAuthority:
          true,
        pipelineStageMutationAuthority:
          false,
        currentStageSnapshotAuthority:
          false,
        conversionRateAuthority:
          false,
        forecastAuthority:
          false,
        scoringAuthority:
          false,
        activityProjectionAuthority:
          false,
        crmMutationAuthority:
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
      }),
  });
}
