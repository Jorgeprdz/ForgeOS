import { createPipelineModule as createBasePipelineModule } from './pipeline-module.js?v=forge-aura-conversation-workspace-011a-base';
import { createPipelineAdapter as createConversationPipelineAdapter } from './pipeline-adapter-pages-v5.js?v=forge-aura-conversation-workspace-011a';
import { createConversationWorkspaceController } from './pipeline-conversation-workspace.js?v=forge-aura-conversation-workspace-011a';

export function createPipelineModule({
  root,
  client,
  windowRef = window,
  globalState,
  nowProvider = () => new Date(),
} = {}) {
  if (!root || !client) throw new Error('AURA_PIPELINE_ROOT_AND_CLIENT_REQUIRED');

  let adapter = null;
  const adapterFactory = async options => {
    adapter = await createConversationPipelineAdapter(options);
    return adapter;
  };

  const workspace = createConversationWorkspaceController({
    root,
    windowRef,
    globalState,
  });

  const base = createBasePipelineModule({
    root,
    client,
    windowRef,
    globalState,
    adapterFactory,
    nowProvider,
  });

  function whatsappTrigger(target) {
    const element = target?.closest?.(
      '[data-action="whatsapp"], [data-recommendation-action="whatsapp"], [data-priority-action="whatsapp"]',
    );
    return element && root.contains(element) ? element : null;
  }

  function interceptWhatsapp(event) {
    const trigger = whatsappTrigger(event.target);
    if (!trigger || trigger.disabled) return;
    const id = trigger.dataset.id;
    const card = adapter?.getCards?.().find(item => String(item.id) === String(id));
    if (!card) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    workspace.open({ card, adapter, trigger });
  }

  root.addEventListener('click', interceptWhatsapp, true);

  function destroy() {
    root.removeEventListener('click', interceptWhatsapp, true);
    workspace.destroy();
    adapter = null;
    return base.destroy?.();
  }

  return Object.freeze({
    ...base,
    destroy,
  });
}
