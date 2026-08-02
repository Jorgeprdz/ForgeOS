"use strict";

const {
  ADVISOR_COMPENSATION_EVENT_STATES,
  clone,
  deepFreeze,
  validateAdvisorCompensationEvent
} = require("../events/advisor-compensation-event-contract");
const {
  resolveAdvisorCompensationMonthlyPeriod
} = require("./advisor-compensation-period-attribution");

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details) error.details = details;
  throw error;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function validateTimeline(events) {
  if (!events.length) return;
  const ordered = [...events].sort((a, b) => a.sequence - b.sequence);
  for (let index = 0; index < ordered.length; index += 1) {
    const event = ordered[index];
    const expectedSequence = index + 1;
    if (event.sequence !== expectedSequence) {
      fail("ADVISOR_COMPENSATION_INCOME_SEQUENCE_CONFLICT", {
        aggregateKey: event.aggregateKey,
        expectedSequence,
        actualSequence: event.sequence
      });
    }
    if (index === 0) {
      if (event.previousEventId !== null) {
        fail("ADVISOR_COMPENSATION_INCOME_FIRST_EVENT_PREVIOUS_FORBIDDEN");
      }
    } else if (event.previousEventId !== ordered[index - 1].eventId) {
      fail("ADVISOR_COMPENSATION_INCOME_PREVIOUS_EVENT_MISMATCH");
    }
  }

  if (ordered[0].state !== ADVISOR_COMPENSATION_EVENT_STATES.ESTIMATED) {
    fail("ADVISOR_COMPENSATION_INCOME_ESTIMATED_BASE_REQUIRED");
  }

  let earnedSeen = false;
  let terminalReversalSeen = false;
  for (const event of ordered) {
    if (terminalReversalSeen) {
      fail("ADVISOR_COMPENSATION_INCOME_EVENT_AFTER_REVERSAL_FORBIDDEN");
    }
    if (event.state === ADVISOR_COMPENSATION_EVENT_STATES.ESTIMATED) {
      if (event.sequence !== 1) {
        fail("ADVISOR_COMPENSATION_INCOME_MULTIPLE_ESTIMATED_EVENTS");
      }
      continue;
    }
    if (event.state === ADVISOR_COMPENSATION_EVENT_STATES.EARNED) {
      if (earnedSeen) {
        fail("ADVISOR_COMPENSATION_INCOME_MULTIPLE_EARNED_EVENTS");
      }
      earnedSeen = true;
      continue;
    }
    if ([
      ADVISOR_COMPENSATION_EVENT_STATES.ADJUSTED,
      ADVISOR_COMPENSATION_EVENT_STATES.REVERSED
    ].includes(event.state) && !earnedSeen) {
      fail("ADVISOR_COMPENSATION_INCOME_EARNED_EVENT_REQUIRED");
    }
    if (event.state === ADVISOR_COMPENSATION_EVENT_STATES.REVERSED) {
      terminalReversalSeen = true;
    }
  }
}

function projectAggregate(events) {
  validateTimeline(events);
  const ordered = [...events].sort((a, b) => a.sequence - b.sequence);
  const estimatedEvent = ordered[0];
  const earnedEvent = ordered.find(
    (event) => event.state === ADVISOR_COMPENSATION_EVENT_STATES.EARNED
  ) || null;
  const adjustments = ordered.filter(
    (event) => event.state === ADVISOR_COMPENSATION_EVENT_STATES.ADJUSTED
  );
  const reversals = ordered.filter(
    (event) => event.state === ADVISOR_COMPENSATION_EVENT_STATES.REVERSED
  );
  const adjustmentAmount = roundMoney(
    adjustments.reduce((total, event) => total + event.amount.value, 0)
  );
  const reversalAmount = roundMoney(
    reversals.reduce((total, event) => total + event.amount.value, 0)
  );
  const earnedGross = earnedEvent ? earnedEvent.amount.value : 0;
  const earnedNet = roundMoney(earnedGross + adjustmentAmount + reversalAmount);
  const latest = ordered[ordered.length - 1];
  const periodAttribution =
    resolveAdvisorCompensationMonthlyPeriod(estimatedEvent);

  return deepFreeze({
    aggregateKey: estimatedEvent.aggregateKey,
    advisorReference: estimatedEvent.advisorReference,
    policyReference: estimatedEvent.policyReference,
    paymentEventId: estimatedEvent.paymentEventId,
    periodKey: periodAttribution.monthlyPeriodKey,
    sourcePeriodKey: estimatedEvent.periodKey,
    periodAttributionSource: periodAttribution.source,
    currency: estimatedEvent.amount.currency,
    concept: estimatedEvent.concept,
    kind: estimatedEvent.kind,
    latestState: latest.state,
    latestEventId: latest.eventId,
    eventCount: ordered.length,
    estimatedAmount: earnedEvent ? 0 : estimatedEvent.amount.value,
    earnedGrossAmount: earnedGross,
    adjustmentAmount,
    reversalAmount,
    earnedNetAmount: earnedNet,
    estimatedEventId: estimatedEvent.eventId,
    earnedEventId: earnedEvent ? earnedEvent.eventId : null,
    adjustmentEventIds: adjustments.map((event) => event.eventId),
    reversalEventIds: reversals.map((event) => event.eventId),
    sourceCalculationDigest:
      estimatedEvent.lineage?.sourceCalculationDigest || null,
    rulePackDigest: estimatedEvent.ruleSnapshot?.rulePackDigest || null,
    events: ordered.map(clone),
    safeguards: {
      estimatedAndEarnedNotDoubleCounted: true,
      adjustmentsAppliedAsDelta: true,
      reversalsAppliedAsNegative: true
    }
  });
}

function projectAdvisorCompensationEventsToIncome({
  events = [],
  advisorReference,
  periodKey,
  currency = "MXN"
} = {}) {
  if (!Array.isArray(events)) {
    fail("ADVISOR_COMPENSATION_INCOME_EVENTS_ARRAY_REQUIRED");
  }
  if (!advisorReference) {
    fail("ADVISOR_COMPENSATION_INCOME_ADVISOR_REQUIRED");
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey || "")) {
    fail("ADVISOR_COMPENSATION_INCOME_PERIOD_INVALID");
  }

  const expectedCurrency = String(currency).toUpperCase();
  const byId = new Map();
  const byAggregate = new Map();

  for (const event of events) {
    const validation = validateAdvisorCompensationEvent(event);
    if (!validation.valid) {
      fail("ADVISOR_COMPENSATION_INCOME_EVENT_INVALID", validation.errors);
    }
    if (event.advisorReference !== advisorReference) {
      continue;
    }
    const periodAttribution =
      resolveAdvisorCompensationMonthlyPeriod(event);
    if (periodAttribution.monthlyPeriodKey !== periodKey) {
      continue;
    }
    if (event.amount.currency !== expectedCurrency) {
      fail("ADVISOR_COMPENSATION_INCOME_EVENT_CURRENCY_MISMATCH");
    }

    const existing = byId.get(event.eventId);
    if (existing) {
      if (existing.eventDigest === event.eventDigest) continue;
      fail("ADVISOR_COMPENSATION_INCOME_EVENT_ID_CONFLICT");
    }
    byId.set(event.eventId, event);

    const aggregate = byAggregate.get(event.aggregateKey) || [];
    byAggregate.set(event.aggregateKey, [...aggregate, event]);
  }

  const aggregates = [...byAggregate.values()]
    .map(projectAggregate)
    .sort((a, b) => a.aggregateKey.localeCompare(b.aggregateKey));

  const sum = (field) => roundMoney(
    aggregates.reduce((total, aggregate) => total + aggregate[field], 0)
  );

  return deepFreeze({
    advisorReference,
    periodKey,
    currency: expectedCurrency,
    aggregateCount: aggregates.length,
    eventCount: [...byId.values()].length,
    estimatedAggregateCount: aggregates.filter(
      (aggregate) => aggregate.estimatedAmount !== 0
    ).length,
    earnedAggregateCount: aggregates.filter(
      (aggregate) => aggregate.earnedEventId !== null
    ).length,
    amounts: {
      estimated: sum("estimatedAmount"),
      earnedGross: sum("earnedGrossAmount"),
      adjustments: sum("adjustmentAmount"),
      reversals: sum("reversalAmount"),
      earnedNet: sum("earnedNetAmount")
    },
    aggregates,
    safeguards: {
      estimatedAndEarnedNotDoubleCounted: true,
      quoteIncomeIncluded: false,
      issuedPremiumIncluded: false,
      payoutTruthIncluded: false,
      externalMutationAuthorized: false
    }
  });
}

module.exports = {
  roundMoney,
  validateTimeline,
  projectAggregate,
  projectAdvisorCompensationEventsToIncome
};
