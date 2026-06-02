const { buildRelationshipTimeline } = require("./relationship-timeline-engine");
const { buildRelationshipNextAction } = require("./relationship-next-action-engine");
const { detectRelationshipOpportunities } = require("./relationship-opportunity-engine");
const { detectLifeEvents } = require("./life-event-engine");
const { detectReferralOpportunity } = require("./referral-opportunity-engine");
const { buildRelationshipHealth } = require("./relationship-health-engine");
const { buildClientEngagement } = require("./client-engagement-engine");
const { buildRelationshipReview } = require("./relationship-review-engine");

function confidenceFromHealth(relationshipHealth) {
  const map = {
    GREEN: 85,
    YELLOW: 70,
    ORANGE: 60,
    RED: 50
  };

  return map[relationshipHealth] || 60;
}

function average(values = []) {
  const valid = values
    .map(value => Number(value))
    .filter(value => !Number.isNaN(value));

  if (!valid.length) return 0;

  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function buildRelationshipMaster(input = {}) {
  const client = input.client || input.profile || {};
  const clientId = client.id || client.clientId || input.clientId || "UNKNOWN_CLIENT";
  const policies = input.policies || [];
  const relationshipHistory = input.relationshipHistory || [];
  const now = input.now;

  const timelineReport = buildRelationshipTimeline({
    clientId,
    profile: client,
    policies,
    events: input.events || [],
    now
  });

  const nextAction = buildRelationshipNextAction({
    client,
    timeline: timelineReport.timeline,
    policies,
    relationshipHistory,
    now
  });

  const opportunityReport = detectRelationshipOpportunities({
    client,
    policies,
    relationshipHistory,
    timeline: timelineReport.timeline
  });

  const lifeEventReport = detectLifeEvents({
    client,
    policies,
    relationshipHistory,
    timeline: timelineReport.timeline,
    events: input.events || [],
    now
  });

  const referralOpportunity = detectReferralOpportunity({
    client: {
      ...client,
      policyCount: client.policyCount || policies.length
    },
    timeline: timelineReport.timeline,
    opportunities: opportunityReport.opportunities,
    lifeEvents: lifeEventReport.detectedEvents,
    relationshipHistory,
    relationshipScore: opportunityReport.relationshipScore,
    policyCount: policies.length,
    now
  });

  const relationshipHealth = buildRelationshipHealth({
    timeline: timelineReport.timeline,
    opportunities: opportunityReport.opportunities,
    relationshipHistory,
    policies
  });

  const engagement = buildClientEngagement({
    relationshipHistory,
    now
  });

  const reviewRecommendation = buildRelationshipReview({
    client,
    policies,
    timeline: timelineReport.timeline,
    opportunities: opportunityReport.opportunities,
    lifeEvents: lifeEventReport.detectedEvents
  });

  return {
    engine: "RELATIONSHIP_MASTER_ENGINE",
    version: "1.0",
    clientId,
    nextAction,
    opportunities: opportunityReport.opportunities,
    lifeEvents: lifeEventReport,
    referralOpportunity,
    relationshipHealth,
    engagement,
    reviewRecommendation,
    confidence: average([
      referralOpportunity.confidence,
      lifeEventReport.confidence,
      opportunityReport.relationshipScore,
      engagement.engagementScore,
      confidenceFromHealth(relationshipHealth.relationshipHealth)
    ])
  };
}

module.exports = {
  buildRelationshipMaster,
  average
};
