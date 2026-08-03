const EVENT_BY_OPERATION = Object.freeze({
  SCHEDULE: 'ACTION_SCHEDULED',
  RESCHEDULE: 'ACTION_RESCHEDULED',
  COMPLETE: 'ACTION_COMPLETED',
  CANCEL: 'ACTION_CANCELLED',
  MARK_WAITING: 'CASE_WAITING',
  CLOSE_CASE: 'CASE_CLOSED',
});

function required(value, code) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw Object.assign(new TypeError(code), { code });
  return normalized;
}

export function projectNextActionReceipt(receipt = {}) {
  const operation = required(receipt.operation, 'RECEIPT_OPERATION_REQUIRED').toUpperCase();
  const eventType = EVENT_BY_OPERATION[operation];
  if (!eventType) throw Object.assign(new TypeError('RECEIPT_OPERATION_INVALID'), { code: 'RECEIPT_OPERATION_INVALID' });

  const base = Object.freeze({
    eventType,
    receiptId: required(receipt.receiptId || receipt.mutationId, 'RECEIPT_ID_REQUIRED'),
    advisorPartitionKey: required(receipt.advisorPartitionKey, 'ADVISOR_PARTITION_REQUIRED'),
    prospectReference: required(receipt.prospectReference, 'PROSPECT_REFERENCE_REQUIRED'),
    personReference: receipt.personReference ? String(receipt.personReference) : null,
    occurredAt: required(receipt.occurredAt, 'RECEIPT_OCCURRED_AT_REQUIRED'),
    operation,
    nextActionAt: receipt.nextActionAt || null,
    caseResolution: receipt.caseResolution || null,
  });

  return Object.freeze({
    timeline: Object.freeze({ ...base, projection: 'PERSON_TIMELINE' }),
    pipeline: Object.freeze({ ...base, projection: 'PIPELINE_CARD' }),
    home: Object.freeze({
      ...base,
      projection: 'HOME_PRIORITY',
      attentionRequired: ['ACTION_SCHEDULED', 'ACTION_RESCHEDULED', 'CASE_WAITING'].includes(eventType),
    }),
    activity: Object.freeze({ ...base, projection: 'DAILY_ACTIVITY_CONTEXT' }),
    notificationInput: Object.freeze({
      ...base,
      projection: 'CONTEXTUAL_NOTIFICATION_INPUT',
      sendAuthorized: false,
    }),
  });
}

export function createContinuityPublisher({ publish = () => undefined } = {}) {
  return Object.freeze({
    publishReceipt(receipt) {
      const projections = projectNextActionReceipt(receipt);
      for (const projection of Object.values(projections)) publish(projection);
      return projections;
    },
  });
}
