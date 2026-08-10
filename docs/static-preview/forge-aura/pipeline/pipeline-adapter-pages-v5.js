import { createPipelineAdapter as createConversationAdapter } from './pipeline-adapter-pages-v4.js?v=forge-aura-conversation-workspace-011a';

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

export async function createPipelineAdapter(options = {}) {
  const adapter = await createConversationAdapter(options);
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
      const appended = await adapter.timelineService.appendProspectTimelineEvent(prospectId, {
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
