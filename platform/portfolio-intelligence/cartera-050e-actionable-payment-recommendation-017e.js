const SIGNAL_TYPE = 'UNCONFIRMED_PAYMENT_EVIDENCE';
const SOURCE_AUTHORITY = 'PAYMENT_OBLIGATION';
const ACTION_OWNER = 'CARTERA_030C';
const ACTION_TARGET_TYPE = 'PAYMENT_OBLIGATION';
const EXPECTED_ACTION = 'CONFIRM_PAYMENT';
const SMALLEST_USEFUL_ACTION = 'Revisar la evidencia y confirmar o rechazar el pago.';

export function isCartera017eActionablePaymentRecommendation(item) {
  return Boolean(
    item
    && item.signalType === SIGNAL_TYPE
    && item.sourceAuthority === SOURCE_AUTHORITY
    && item.policyReference
    && item.sourceRecordReference
    && item.signalReference
    && item.smallestUsefulAction === SMALLEST_USEFUL_ACTION
  );
}

export function toCartera017eActionablePaymentRecommendation(item) {
  if (!isCartera017eActionablePaymentRecommendation(item)) {
    throw new Error('CARTERA_017E_RECOMMENDATION_NOT_ACTION_ADDRESSABLE');
  }
  return Object.freeze({
    ...item,
    decisionReference: item.signalReference,
    recommendationVersion: item.signalReference,
    sourceDomain: 'CARTERA',
    subject: Object.freeze({ type: 'POLICY', reference: item.policyReference }),
    commercialPersonReference: item.personReference || null,
    policyReference: item.policyReference,
    signalReference: item.signalReference,
    paymentObligationReference: item.sourceRecordReference,
    actionAddressable: true,
    actionOwner: ACTION_OWNER,
    actionTarget: Object.freeze({ type: ACTION_TARGET_TYPE, reference: item.sourceRecordReference }),
    expectedAction: EXPECTED_ACTION,
  });
}

export const CARTERA_017E_ACTIONABLE_PAYMENT_RECOMMENDATION = Object.freeze({
  signalType: SIGNAL_TYPE,
  sourceAuthority: SOURCE_AUTHORITY,
  actionOwner: ACTION_OWNER,
  actionTargetType: ACTION_TARGET_TYPE,
  expectedAction: EXPECTED_ACTION,
  smallestUsefulAction: SMALLEST_USEFUL_ACTION,
});
