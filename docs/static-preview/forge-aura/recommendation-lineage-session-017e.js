const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const shared = await import(new URL(
  sourceLayout
    ? '../../../platform/event-evidence/recommendation-lineage-session-017e.js'
    : '../../platform/event-evidence/recommendation-lineage-session-017e.js',
  import.meta.url,
).href);

export const setRecommendationDecisionLineage = shared.setRecommendationDecisionLineage;
export const recommendationDecisionLineageFor = shared.recommendationDecisionLineageFor;
export const consumeRecommendationDecisionLineage = shared.consumeRecommendationDecisionLineage;
export const clearRecommendationDecisionLineage = shared.clearRecommendationDecisionLineage;
