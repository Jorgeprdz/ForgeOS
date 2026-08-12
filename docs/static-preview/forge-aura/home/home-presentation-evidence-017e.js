const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const shared = await import(new URL(
  sourceLayout
    ? '../../../../platform/event-evidence/recommendation-presentation-control-017e.js'
    : '../../../platform/event-evidence/recommendation-presentation-control-017e.js',
  import.meta.url,
).href);

export const createAuraPresentationEvidenceControl = shared.createAuraPresentationEvidenceControl;
