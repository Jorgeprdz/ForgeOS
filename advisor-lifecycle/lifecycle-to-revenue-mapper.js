import {
  PRECONTRACT_REVENUE_CLASSIFICATIONS,
} from './precontract-revenue-classifier.js';

export const LIFECYCLE_REVENUE_BUCKETS = Object.freeze({
  POTENTIAL: 'potential',
  BLOCKED: 'blocked',
  PAID_CONFIRMED: 'paid_confirmed',
  CANCELLED: 'cancelled',
});

export function mapLifecycleToRevenue(classification = {}) {
  const type = classification.classification;

  if (type === PRECONTRACT_REVENUE_CLASSIFICATIONS.PAYOUT_TRUTH) {
    return {
      revenueBucket: LIFECYCLE_REVENUE_BUCKETS.PAID_CONFIRMED,
      reason: classification.reason,
      generated: true,
      payable: true,
      payoutTruth: true,
      excludedFromGeneratedTotals: false,
      warnings: [],
    };
  }

  if (type === PRECONTRACT_REVENUE_CLASSIFICATIONS.FORFEITED_COMMISSION) {
    return {
      revenueBucket: LIFECYCLE_REVENUE_BUCKETS.CANCELLED,
      reason: classification.reason,
      generated: false,
      payable: false,
      payoutTruth: false,
      excludedFromGeneratedTotals: true,
      warnings: ['Forfeited commission is separated; no silent netting.'],
    };
  }

  if (type === PRECONTRACT_REVENUE_CLASSIFICATIONS.ORIGINATED_PRODUCTION) {
    return {
      revenueBucket: LIFECYCLE_REVENUE_BUCKETS.POTENTIAL,
      reason: classification.reason,
      generated: false,
      payable: false,
      payoutTruth: false,
      excludedFromGeneratedTotals: true,
      warnings: ['Precontract production is attributed but not generated paid revenue.'],
    };
  }

  return {
    revenueBucket: LIFECYCLE_REVENUE_BUCKETS.BLOCKED,
    reason: classification.reason || 'blocked_by_precontract_lifecycle',
    generated: false,
    payable: false,
    payoutTruth: false,
    excludedFromGeneratedTotals: true,
    warnings: [
      ...(classification.warnings || []),
      'Blocked precontract revenue is not zero.',
    ],
  };
}
