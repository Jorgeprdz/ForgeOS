import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { getCachedRates } = require('./exchange-rate-cache-engine');
const {
  buildUniversalUdiQuoteProjection
} = require('./shared-udi-projection-engine');

const BLOCKED_NO_VERIFIED_UDI_RATE = 'BLOCKED_NO_VERIFIED_UDI_RATE';
const SCENARIO_LABEL = 'SCENARIO_BASED_ESTIMATE_NOT_GUARANTEED';
const DEFAULT_SAVINGS_UDI_GROWTH_RATE = 0.04;
const DEFAULT_RETIREMENT_UDI_GROWTH_RATE = 0.045;

export async function getVerifiedUdiRateMetadata({
  rateProvider = getCachedRates
} = {}) {
  try {
    const cache = await rateProvider();
    const udi = cache?.rates?.UDI_MXN;
    const currentUdiValue = Number(udi?.value || 0);

    if (!currentUdiValue) {
      return {
        status: BLOCKED_NO_VERIFIED_UDI_RATE,
        currentUdiValue: null,
        source: null,
        sourceDate: null,
        sourceMode: null,
        cacheStatus: cache?.cacheStatus || null
      };
    }

    return {
      status: 'VERIFIED_UDI_RATE_AVAILABLE',
      currentUdiValue,
      source: udi.source,
      sourceDate: udi.date,
      sourceMode: cache.cacheStatus === 'CACHE_HIT' ? 'CACHE' : 'LIVE',
      cacheStatus: cache.cacheStatus,
      seriesId: udi.seriesId,
      title: udi.title
    };
  } catch (error) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      currentUdiValue: null,
      source: null,
      sourceDate: null,
      sourceMode: null,
      cacheStatus: null,
      error: error.message
    };
  }
}

export function calculateTotalContributed({
  totalAnnualPremium = 0,
  premiumPayingYears = 0,
} = {}) {
  const annualPremium = Number(totalAnnualPremium);
  const payingYears = Number(premiumPayingYears);
  if (!Number.isFinite(annualPremium) || annualPremium < 0) {
    throw new TypeError("totalAnnualPremium must be a finite non-negative number");
  }
  if (!Number.isFinite(payingYears) || payingYears < 0) {
    throw new TypeError("premiumPayingYears must be a finite non-negative number");
  }
  return annualPremium * payingYears;
}

export function buildRetirementPresentationScenario({
  parsedQuote = {},
  udiRateMetadata = {}
}) {
  const currentUdiValue = Number(udiRateMetadata.currentUdiValue || 0);

  if (!currentUdiValue) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      reason: 'Retirement MXN scenario requires verified UDI rate metadata.',
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue: null,
      source: null,
      sourceDate: null,
      sourceMode: null,
      calculationMode: SCENARIO_LABEL
    };
  }

  const base = parsedQuote.scenarios?.base;

  if (!base?.monthlyIncome || !base?.lumpSum) {
    return {
      status: 'BLOCKED_NO_RETIREMENT_SCENARIO_EVIDENCE',
      reason: 'Retirement scenario values must come from extracted/source evidence.',
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue,
      source: udiRateMetadata.source,
      sourceDate: udiRateMetadata.sourceDate,
      sourceMode: udiRateMetadata.sourceMode,
      calculationMode: SCENARIO_LABEL
    };
  }

  const premium = parsedQuote.premiumStructure;

  const totalContributed = calculateTotalContributed(premium);
  const annualIncome =
    parsedQuote.annualIncomeUdiAtRetirement ??
    base.annualIncome ??
    base.annualIncomeUdi ??
    base.monthlyIncome * 12;
  const maxAge = Math.max(
    99,
    parsedQuote.maxAge || 0,
    ...[75, 80, 90, 99]
  );

  let projection;

  try {
    projection = buildUniversalUdiQuoteProjection({
      baseUdiValue: currentUdiValue,
      baseUdiSource: udiRateMetadata.source,
      baseUdiDate: udiRateMetadata.sourceDate,
      currentAge: parsedQuote.currentAge,
      retirementAge: parsedQuote.retirementAge,
      maxAge,
      annualPremiumUdi: premium.totalAnnualPremium,
      premiumPayingYears: premium.premiumPayingYears,
      sumAssuredUdi:
        parsedQuote.sumAssuredUdi ??
        parsedQuote.sumAssured ??
        parsedQuote.sumInsured ??
        null,
      singlePaymentUdiAtRetirement: base.lumpSum,
      monthlyIncomeUdiAtRetirement: base.monthlyIncome,
      annualIncomeUdiAtRetirement: annualIncome,
      savingsUdiGrowthRate:
        parsedQuote.savingsUdiGrowthRate ??
        parsedQuote.annualUdiGrowthRate ??
        DEFAULT_SAVINGS_UDI_GROWTH_RATE,
      retirementUdiGrowthRate:
        parsedQuote.retirementUdiGrowthRate ??
        DEFAULT_RETIREMENT_UDI_GROWTH_RATE,
      projectedUdiAtRetirement:
        parsedQuote.projectedUdiAtRetirement ??
        parsedQuote.projectedUdiValueAtRetirement ??
        null,
      incomeMilestoneAges: [75, 80, 90, 99]
    });
  } catch (error) {
    return {
      status: 'BLOCKED_NO_RETIREMENT_SCENARIO_EVIDENCE',
      reason: error.message,
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue,
      source: udiRateMetadata.source,
      sourceDate: udiRateMetadata.sourceDate,
      sourceMode: udiRateMetadata.sourceMode,
      calculationMode: SCENARIO_LABEL
    };
  }

  const ages = [
    parsedQuote.retirementAge,
    premium.paidUntilAge,
    75,
    80,
    90,
    99
  ].filter((age, index, array) => array.indexOf(age) === index)
   .sort((a, b) => a - b);

  const milestones = ages.map((age) => {
    const accumulated = projection.retirement.accumulatedIncome.find(
      item => item.toAge === age
    );
    const yearsReceiving = accumulated?.yearsReceiving ?? 0;
    const totalReceivedUdi = accumulated?.udi ?? 0;

    return {
      age,
      yearsReceiving,
      totalReceivedUdi,
      totalReceivedMXN: accumulated?.mxn ?? null,
      calculationMode: SCENARIO_LABEL,
      reason:
        age === premium.paidUntilAge
          ? 'Termina periodo de pago limitado'
          : age === parsedQuote.retirementAge
            ? 'Inicio de retiro'
            : age === 75
              ? '10 años cobrando renta'
              : age === 80
                ? '15 años cobrando renta'
                : age === 90
                  ? 'Escenario de longevidad'
                  : 'Última edad visible en la cotización'
    };
  });

  return {
    status: 'READY',
    productName: parsedQuote.productName,
    currency: parsedQuote.currency,
    currentUdiValue,
    source: udiRateMetadata.source,
    sourceDate: udiRateMetadata.sourceDate,
    sourceMode: udiRateMetadata.sourceMode,
    cacheStatus: udiRateMetadata.cacheStatus,
    calculationMode: SCENARIO_LABEL,

    summary: {
      currentAge: parsedQuote.currentAge,
      retirementAge: parsedQuote.retirementAge,
      coverageYears: parsedQuote.coverageYears,

      premiumPayingYears: premium.premiumPayingYears,
      paidUntilAge: premium.paidUntilAge,

      basicAnnualPremiumUDI: premium.basicAnnualPremium,
      basicAnnualPremiumMXN: premium.basicAnnualPremium * currentUdiValue,

      plannedAnnualContributionUDI: premium.plannedAnnualContribution,
      plannedAnnualContributionMXN: premium.plannedAnnualContribution * currentUdiValue,

      totalAnnualPremiumUDI: premium.totalAnnualPremium,
      totalAnnualPremiumMXN:
        projection.totalContributed.annualPayments[0]?.mxn ?? null,

      totalContributedUDI: totalContributed,
      totalContributedMXN: projection.totalContributed.mxn,

      lumpSumUDI: base.lumpSum,
      lumpSumMXN: projection.retirement.singlePayment.mxnAtRetirement,

      monthlyIncomeUDI: base.monthlyIncome,
      monthlyIncomeMXN: projection.retirement.monthlyIncome.mxnAtRetirement,
      annualIncomeUDI: annualIncome,
      annualIncomeMXN: projection.retirement.annualIncome.mxnAtRetirement,
      projectedUdiAtRetirement:
        projection.retirement.singlePayment.projectedUdiValue,
      udiProjection: projection,
      calculationMode: SCENARIO_LABEL,
      currencySource: {
        currentUdiValue,
        source: udiRateMetadata.source,
        sourceDate: udiRateMetadata.sourceDate,
        sourceMode: udiRateMetadata.sourceMode
      }
    },

    milestones
  };
}
