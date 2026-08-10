import { createPipelineAdapter as createConversationAdapter } from './pipeline-adapter-pages-v4.js?v=forge-aura-conversation-workspace-011a';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
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
  });
}
