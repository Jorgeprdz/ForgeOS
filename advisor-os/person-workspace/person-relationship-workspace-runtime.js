const PRIORITY = Object.freeze({
  CRITICAL: 100,
  ACTION_REQUIRED: 80,
  REVIEW_REQUIRED: 60,
  INFORMATION: 20,
});

function text(value) { return String(value || '').trim(); }
function list(value) { return Array.isArray(value) ? value : []; }
function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function personReferenceOf(workspace) {
  return text(
    workspace?.personReference
    || workspace?.identity?.personReference
    || workspace?.identity?.reference
    || workspace?.person?.personReference,
  );
}

function flattenWorkspace(workspace) {
  return list(workspace?.sections).flatMap(section =>
    list(section?.items).map(item => ({ ...item, sectionId: section.id })),
  );
}

function flattenIntelligence(intelligence) {
  return list(intelligence?.domains).flatMap(domain =>
    list(domain?.items).map(item => ({ ...item, domainId: domain.id })),
  );
}

function priorityFor(item) {
  const state = text(item?.state).toUpperCase();
  if (item?.attentionRequired === true || state === 'DISPUTED') return PRIORITY.CRITICAL;
  if (state === 'OVERDUE' || state === 'INFORMATION_REQUIRED') return PRIORITY.ACTION_REQUIRED;
  if (item?.reviewRequired === true || state === 'REVIEW_REQUIRED') return PRIORITY.REVIEW_REQUIRED;
  return PRIORITY.INFORMATION;
}

function normalizePriorityItem(item, source) {
  return freeze({
    reference: text(item?.reference),
    source,
    label: text(item?.label) || 'Revisión pendiente',
    summary: text(item?.summary),
    state: text(item?.state) || 'UNKNOWN',
    authority: text(item?.authority),
    deepLink: text(item?.deepLink),
    smallestUsefulAction: text(item?.smallestUsefulAction),
    uncertainty: text(item?.uncertainty),
    priority: priorityFor(item),
  });
}

export function createPersonRelationshipWorkspaceRuntime({
  workspaceLoader,
  intelligenceLoader,
} = {}) {
  if (typeof workspaceLoader !== 'function') throw new TypeError('PERSON_WORKSPACE_LOADER_REQUIRED');
  if (typeof intelligenceLoader !== 'function') throw new TypeError('RELATIONSHIP_INTELLIGENCE_LOADER_REQUIRED');

  let generation = 0;

  async function load(locator = {}) {
    const selectedGeneration = ++generation;
    const workspace = await workspaceLoader(locator);
    if (selectedGeneration !== generation) return freeze({ status: 'STALE', snapshot: null });

    const personReference = personReferenceOf(workspace);
    if (!personReference) throw new TypeError('PERSON_REFERENCE_UNRESOLVED');

    const intelligence = await intelligenceLoader({ personReference });
    if (selectedGeneration !== generation) return freeze({ status: 'STALE', snapshot: null });

    const intelligencePerson = text(intelligence?.personReference || intelligence?.subject?.personReference);
    if (intelligencePerson && intelligencePerson !== personReference) {
      throw new TypeError('PERSON_CONTEXT_MISMATCH');
    }

    const workspaceItems = flattenWorkspace(workspace);
    const intelligenceItems = flattenIntelligence(intelligence);
    const priorities = [
      ...workspaceItems.map(item => normalizePriorityItem(item, 'WORKSPACE')),
      ...intelligenceItems.map(item => normalizePriorityItem(item, 'RELATIONSHIP_INTELLIGENCE')),
    ].filter(item => item.reference || item.label)
      .sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label));

    const notificationSignals = priorities
      .filter(item => item.priority >= PRIORITY.REVIEW_REQUIRED)
      .slice(0, 5)
      .map(item => freeze({
        id: `PERSON:${personReference}:${item.source}:${item.reference || item.label}`,
        type: item.priority >= PRIORITY.CRITICAL ? 'COMMERCIAL_RISK' : 'WAITING_STALE',
        subjectReference: personReference,
        title: item.label,
        body: item.summary,
        draft: item.smallestUsefulAction,
        route: item.deepLink,
        containsBusinessData: false,
      }));

    return freeze({
      status: 'READY',
      snapshot: {
        personReference,
        workspace,
        intelligence,
        priorities,
        notificationSignals,
        diagnostics: {
          workspaceAuthority: 'CRS_09',
          intelligenceAuthority: 'CRS_10',
          secondPersonStore: false,
          secondScoreEngine: false,
          directWrite: false,
          unknownAsZero: false,
        },
      },
    });
  }

  function scrub() { generation += 1; }

  return Object.freeze({ load, scrub });
}
