"use strict";

const {
  createEstimatedAdvisorCompensationEvent
} = require("./advisor-compensation-event-factory");
const {
  evaluateAdvisorCompensationEarnedPromotion,
  promoteAdvisorCompensationEventToEarned
} = require("./advisor-compensation-earned-promotion-gate");
const {
  createAdvisorCompensationAdjustmentEvent,
  createAdvisorCompensationReversalEvent
} = require("./advisor-compensation-adjustment-service");
const {
  createInMemoryAdvisorCompensationEventRepository
} = require("./advisor-compensation-event-repository");

function createAdvisorCompensationEventAuthority({
  repository = createInMemoryAdvisorCompensationEventRepository()
} = {}) {
  if (!repository?.append || !repository?.getLatest) {
    const error = new Error("ADVISOR_COMPENSATION_EVENT_REPOSITORY_REQUIRED");
    error.code = "ADVISOR_COMPENSATION_EVENT_REPOSITORY_REQUIRED";
    throw error;
  }

  return Object.freeze({
    recordEstimated(input) {
      const event = createEstimatedAdvisorCompensationEvent(input);
      return repository.append(event);
    },

    evaluateEarnedPromotion(input) {
      return evaluateAdvisorCompensationEarnedPromotion(input);
    },

    promoteToEarned(input) {
      const evaluation = input.promotionEvaluation ||
        evaluateAdvisorCompensationEarnedPromotion(input);
      const event = promoteAdvisorCompensationEventToEarned({
        ...input,
        promotionEvaluation: evaluation
      });
      return repository.append(event);
    },

    appendAdjustment(input) {
      const event = createAdvisorCompensationAdjustmentEvent(input);
      return repository.append(event);
    },

    appendReversal(input) {
      const event = createAdvisorCompensationReversalEvent(input);
      return repository.append(event);
    },

    getById(eventId, advisorReference) {
      return repository.getById(eventId, advisorReference);
    },

    getTimeline(aggregateKey, advisorReference) {
      return repository.listByAggregate(aggregateKey, advisorReference);
    },

    getLatest(aggregateKey, advisorReference) {
      return repository.getLatest(aggregateKey, advisorReference);
    },

    capabilities: Object.freeze({
      estimatedRecording: true,
      governedEarnedPromotion: true,
      adjustmentEvents: true,
      reversalEvents: true,
      paidPromotion: false,
      appendOnly: true,
      remotePersistence: false
    })
  });
}

module.exports = {
  createAdvisorCompensationEventAuthority
};
