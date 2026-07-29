import {
  createReportProviderPort,
} from "../../reporting/application/report-provider-port.mjs";

import {
  PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION,
  normalizePortfolioPolicyPeriodModel,
} from "../domain/portfolio-policy-read-model.mjs";

export const PORTFOLIO_REPORT_PROVIDER_SCHEMA_VERSION =
  "portfolio-report-provider.v1";

export const PORTFOLIO_REPORT_DEFINITION_ID =
  "portfolio-policy-issuance";

export const PORTFOLIO_REPORT_DEFINITION_VERSION =
  "portfolio-policy-issuance.v1";

const SUPPORTED_RUNTIME_SCHEMAS =
  new Set([
    "portfolio-report-read-runtime.v1",
    "portfolio-policy-read-composition.v1",
  ]);

const MONETARY_MEASURES =
  new Set([
    "premiumAmount",
    "sumAssuredAmount",
  ]);

export class PortfolioReportProviderError
  extends TypeError {
  constructor(message) {
    super(
      `PortfolioReportProvider: ${message}`,
    );
    this.name =
      "PortfolioReportProviderError";
  }
}

function fail(message) {
  throw new PortfolioReportProviderError(
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
      "readRuntime does not satisfy accepted portfolio read authority",
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

function assertCurrencyGrouping(query) {
  const hasMonetaryMeasure =
    query.measures.some(
      (measure) =>
        MONETARY_MEASURES.has(measure),
    );

  if (
    hasMonetaryMeasure &&
    !query.dimensions.includes(
      "currency",
    )
  ) {
    fail(
      "currency dimension is required for monetary portfolio measures",
    );
  }
}

export function createPortfolioReportProvider({
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
        "emissionDate",
      valueKind:
        "DATE",
      nullable:
        false,
    },
    {
      dimensionId:
        "policyStatus",
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
        "productVariant",
      valueKind:
        "STRING",
      nullable:
        true,
    },
    {
      dimensionId:
        "currency",
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
        true,
    },
    {
      dimensionId:
        "collectionChannel",
      valueKind:
        "STRING",
      nullable:
        true,
    },
    {
      dimensionId:
        "policyScope",
      valueKind:
        "STRING",
      nullable:
        false,
    },
  ];

  const measures = [
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
        "sumAssuredAmount",
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
          "portfolio",
        providerVersion:
          PORTFOLIO_REPORT_PROVIDER_SCHEMA_VERSION,
        domain:
          "PORTFOLIO",
        capabilities: [
          "ACCEPTED_POLICY_PERIOD_READ_MODEL",
          "POLICY_ISSUANCE_FACT_PROJECTION",
          "PORTFOLIO_NATIVE_CURRENCY_MEASURES",
          "PORTFOLIO_POLICY_STATUS_FACTS",
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
        assertCurrencyGrouping(
          query,
        );

        const raw =
          await runtime.readPeriod({
            emissionDateFrom:
              query.period.from,
            emissionDateTo:
              query.period.to,
            asOf:
              query.asOf,
          });

        const model =
          normalizePortfolioPolicyPeriodModel(
            raw,
          );

        if (
          model.schemaVersion !==
          PORTFOLIO_POLICY_PERIOD_MODEL_SCHEMA_VERSION
        ) {
          fail(
            "readRuntime returned an unsupported period model",
          );
        }

        if (
          model.period.emissionDateFrom !==
            query.period.from ||
          model.period.emissionDateTo !==
            query.period.to
        ) {
          fail(
            "portfolio period coverage does not match provider slice",
          );
        }

        if (
          model.period.asOf !==
          query.asOf
        ) {
          fail(
            "portfolio period asOf does not match provider slice",
          );
        }

        const rows =
          model.policies.map(
            (policy) => {
              const dimensionValues = {
                emissionDate:
                  policy.emissionDate,
                policyStatus:
                  policy.policyStatus,
                productPlan:
                  policy.productPlan,
                productVariant:
                  policy.productVariant,
                currency:
                  policy.currency,
                paymentFrequency:
                  policy.paymentFrequency,
                collectionChannel:
                  policy.collectionChannel,
                policyScope:
                  policy.policyScope,
              };
              const measureValues = {
                premiumAmount:
                  policy.premiumAmount,
                sumAssuredAmount:
                  policy.sumAssuredAmount,
                policyCount:
                  1,
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
                "FUTURE_EMISSION",
              count:
                model.exclusions
                  .futureEmission,
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
                "portfolio-policy-read-runtime",
              sourceVersion:
                model.sourceSchemaVersion,
              authority:
                "ACCEPTED_PORTFOLIO_POLICY_FACTS",
            },
          ],
        };
      },
    });

  return Object.freeze({
    schemaVersion:
      PORTFOLIO_REPORT_PROVIDER_SCHEMA_VERSION,
    definition:
      Object.freeze({
        definitionId:
          PORTFOLIO_REPORT_DEFINITION_ID,
        definitionVersion:
          PORTFOLIO_REPORT_DEFINITION_VERSION,
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
            "emissionDate",
            "policyStatus",
            "currency",
          ]),
        defaultMeasures:
          Object.freeze([
            "premiumAmount",
            "sumAssuredAmount",
            "policyCount",
          ]),
      }),
    port,
    boundary:
      Object.freeze({
        portfolioReadAuthority:
          true,
        portfolioMutationAuthority:
          false,
        premiumCalculationAuthority:
          false,
        policyStatusDerivationAuthority:
          false,
        renewalDerivationAuthority:
          false,
        foreignExchangeAuthority:
          false,
        clientPiiProjectionAuthority:
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
