import { createPipelineModule as createGovernedPipelineBridge } from './pipeline-consumer-bridge-008.js?v=forge-aura-production-entrypoint-hotfix-011b-base';
import { createPipelineAdapter as createConversationPipelineAdapter } from '../pipeline/pipeline-adapter-pages-v5.js?v=forge-aura-production-entrypoint-hotfix-011b';
import { createConversationWorkspaceController } from '../pipeline/pipeline-conversation-workspace.js?v=forge-aura-production-entrypoint-hotfix-011b';

export function createPipelineModule(options = {}) {
  const { root, client, windowRef = window, globalState } = options;
  if (!root || !client) throw new Error('AURA_PIPELINE_ROOT_AND_CLIENT_REQUIRED');

  let adapter = null;
  const workspace = createConversationWorkspaceController({ root, windowRef, globalState });
  const base = createGovernedPipelineBridge({
    ...options,
    windowRef,
    adapterFactory: async args => {
      adapter = await createConversationPipelineAdapter(args);
      return adapter;
    },
  });

  const onClick = event => {
    const trigger = event.target?.closest?.('[data-action="whatsapp"], [data-recommendation-action="whatsapp"], [data-priority-action="whatsapp"]');
    if (!trigger || !root.contains(trigger) || trigger.disabled) return;
    const id = String(trigger.dataset.id || '');
    const card = adapter?.getCards?.().find(item => String(item.id) === id);
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    workspace.open({ card, adapter, trigger });
  };

  root.addEventListener('click', onClick, true);

  return Object.freeze({
    ...base,
    async destroy() {
      root.removeEventListener('click', onClick, true);
      workspace.destroy();
      adapter = null;
      return base.destroy?.();
    },
  });
}
