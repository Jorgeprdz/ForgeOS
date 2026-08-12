const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const shared = await import(new URL(
  sourceLayout
    ? '../../../../platform/event-evidence/recommendation-decision-control-017c.js'
    : '../../../platform/event-evidence/recommendation-decision-control-017c.js',
  import.meta.url,
).href);

export const createAuraDecisionControl = shared.createAuraDecisionControl;
