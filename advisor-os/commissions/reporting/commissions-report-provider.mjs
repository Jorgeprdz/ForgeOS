import {
  createReportProviderPort,
} from "../../reporting/application/report-provider-port.mjs";

import {
  COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION,
  normalizeCommissionReportPeriodModel,
} from "../domain/commission-report-read-model.mjs";

export const COMMISSIONS_REPORT_PROVIDER_SCHEMA_VERSION =
  "commissions-report-provider.v1";

export const COMMISSIONS_REPORT_DEFINITION_ID =
  "commissions-ledger";

export const COMMISSIONS_REPORT_DEFINITION_VERSION =
  "commissions-ledger.v1";

const SUPPORTED_RUNTIME_SCHEMAS =
  new Set([
    "commission-report-read-runtime.v1",
    "commission-ledger-read-composition.v1",
  ]);

export class CommissionsReportProviderError
  extends TypeError {
  constructor(message) {
    super(
      `CommissionsReportProvider: ${message}`,
    );
    this.name =
      "CommissionsReportProviderError";
  }
}

function fail(message) {
  throw new CommissionsReportProviderError(
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
      "readRuntime does not satisfy accepted commission ledger read authority",
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

export function createCommissionsReportProvider({
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
        "effectiveDate",
      valueKind:
        "DATE",
      nullable:
        false,
    },
    {
      dimensionId:
        "commissionKind",
      valueKind:
        "STRING",
      nullable:
        false,
    },
    {
      dimensionId:
        "productPlan",
      valueKind:
        "STRING",
      nullable:
        false,
    },
    {
      dimensionId:
        "paymentFrequency",
      valueKind:
        "STRING",
      nullable:
        false,
    },
    {
      dimensionId:
        "policyYear",
      valueKind:
        "NUMBER",
      nullable:
        false,
    },
  ];

  const measures = [
    {
      measureId:
        "commissionAmount",
      valueKind:
        "NUMBER",
      unit:
        "CURRENCY",
      aggregation:
        "SUM",
      nullable:
        false,
    },
    {
      measureId:
        "premiumAmount",
      valueKind:
        "NUMBER",
      unit:
        "CURRENCY",
      aggregation:
        "SUM",
      nullable:
        false,
    },
    {
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
      measureId:
        "policyCount",
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
          "commissions",
        providerVersion:
          COMMISSIONS_REPORT_PROVIDER_SCHEMA_VERSION,
        domain:
          "COMMISSIONS",
        capabilities: [
          "ACCEPTED_COMMISSION_PERIOD_READ_MODEL",
          "INITIAL_RENEWAL_LEDGER_PROJECTION",
          "COMMISSION_CURRENCY_MEASURES",
          "COMMISSION_POLICY_FACTS",
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
            effectiveDateFrom:
              query.period.from,
            effectiveDateTo:
              query.period.to,
            asOf:
              query.asOf,
          });

        const model =
          normalizeCommissionReportPeriodModel(
            raw,
          );

        if (
          model.schemaVersion !==
          COMMISSION_REPORT_PERIOD_MODEL_SCHEMA_VERSION
        ) {
          fail(
            "readRuntime returned an unsupported period model",
          );
        }

        if (
          model.period.effectiveDateFrom !==
            query.period.from ||
          model.period.effectiveDateTo !==
            query.period.to
        ) {
          fail(
            "commission period coverage does not match provider slice",
          );
        }

        if (
          model.period.asOf !==
          query.asOf
        ) {
          fail(
            "commission period asOf does not match provider slice",
          );
        }

        const rows =
          model.entries.map(
            (entry) => {
              const dimensionValues = {
                effectiveDate:
                  entry.effectiveDate,
                commissionKind:
                  entry.commissionKind,
                productPlan:
                  entry.productPlan,
                paymentFrequency:
                  entry.paymentFrequency,
                policyYear:
                  entry.policyYear,
              };
              const measureValues = {
                commissionAmount:
                  entry.commissionAmount,
                premiumAmount:
                  entry.premiumAmount,
                points:
                  entry.points,
                policyCount:
                  entry.policyCount,
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
                "FUTURE_EFFECTIVE",
              count:
                model.exclusions
                  .futureEffective,
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
                "commission-ledger-read-runtime",
              sourceVersion:
                model.sourceSchemaVersion,
              authority:
                "ACCEPTED_COMMISSION_LEDGER",
            },
          ],
        };
      },
    });

  return Object.freeze({
    schemaVersion:
      COMMISSIONS_REPORT_PROVIDER_SCHEMA_VERSION,
    definition:
      Object.freeze({
        definitionId:
          COMMISSIONS_REPORT_DEFINITION_ID,
        definitionVersion:
          COMMISSIONS_REPORT_DEFINITION_VERSION,
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
            "effectiveDate",
            "commissionKind",
          ]),
        defaultMeasures:
          Object.freeze([
            "commissionAmount",
            "premiumAmount",
            "points",
            "policyCount",
          ]),
      }),
    port,
    boundary:
      Object.freeze({
        commissionReadAuthority:
          true,
        commissionCalculationAuthority:
          false,
        commissionRateAuthority:
          false,
        bonusCalculationAuthority:
          false,
        legacyCommissionEngineAuthority:
          false,
        legacyZeroSkeletonAuthority:
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
