import { createPipelineAdapter as createConversationAdapter } from './pipeline-adapter-pages-v4.js?v=forge-aura-conversation-workspace-011a';

const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const rootUrl = new URL(sourceLayout ? '../../../../' : '../../../', import.meta.url);
let timelineAuthorityPromise;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function text(value) {
  return String(value ?? '').trim();
}

function cardProspect(card) {
  return card?.prospect || card;
}

async function ensureTimelineAuthority() {
  if (timelineAuthorityPromise) return timelineAuthorityPromise;
  timelineAuthorityPromise = (async () => {
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js', rootUrl).href}?v=forge-aura-commercial-loop-011c`);
    await import(`${new URL('advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js', rootUrl).href}?v=forge-aura-commercial-loop-011c`);
    const authority = globalThis.ForgeProspectTimelineServiceNFAST08;
    if (!authority?.create) throw new Error('NFAST_08_TIMELINE_AUTHORITY_UNAVAILABLE');
    return authority;
  })().catch(error => {
    timelineAuthorityPromise = null;
    throw error;
  });
  return timelineAuthorityPromise;
}

export async function createPipelineAdapter(options = {}) {
  if (!options.client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createConversationAdapter(options);
  const timelineAuthority = await ensureTimelineAuthority();
  const timelineService = timelineAuthority.create(options.client);

  return Object.freeze({
    ...adapter,
    async prepareMessage(card, request = {}) {
      const prepared = await adapter.prepareMessage(card, request);
      const blocked = prepared?.validation?.decision === 'BLOCK_WHATSAPP';
      return freeze({
        ...prepared,
        status: blocked ? 'BLOCKED' : prepared.status,
      });
    },
    async registerObjection(card, combat) {
      if (combat?.reviewed !== true || !combat?.classification?.type) {
        throw new Error('REVIEWED_OBJECTION_CLASSIFICATION_REQUIRED');
      }
      const prospect = cardProspect(card);
      const prospectId = text(prospect?.id || card?.id);
      if (!prospectId) throw new Error('PROSPECT_REFERENCE_REQUIRED');
      const occurredAt = new Date().toISOString();
      const appended = await timelineService.appendProspectTimelineEvent(prospectId, {
        eventType: 'OBJECTION_RECORDED',
        occurredAt,
        sourceRecordReference: `PROSPECT:${prospectId}`,
        payload: {
          objectionCode: text(combat.classification.type),
          resolutionStatus: 'OPEN',
        },
        evidenceReferences: [`PROSPECT:${prospectId}`],
        idempotencyKey: `OBJECTION:${prospectId}:${text(combat.classification.type)}:${occurredAt}`,
      });
      return freeze({
        registered: true,
        eventReference: appended?.id || null,
        eventType: appended?.eventType || 'OBJECTION_RECORDED',
        objectionCode: text(combat.classification.type),
        resolutionStatus: 'OPEN',
        rawObjectionPersisted: false,
        pipelineReloadRequired: false,
      });
    },
  });
}
