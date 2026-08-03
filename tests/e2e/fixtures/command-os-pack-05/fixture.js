import '../../../../docs/static-preview/forge-alive-material3/person-workspace-entry-bridge.js';
import { Navigation } from '../../../../platform/navigation-runtime.js';
import { registerPersonEntityProvider } from '../../../../platform/commands/entity-provider-adapter.js';
import { resolveEntities, buildEntityNavigation } from '../../../../platform/commands/entity-context-runtime.js';

registerPersonEntityProvider({
  read: async () => [
    { id: 'person-1', name: 'Mariana López', phone: '55 1111 1111' },
    { id: 'person-2', name: 'Mariana López', phone: '55 2222 2222' },
  ],
});

addEventListener('forge:open-person-workspace', (event) => {
  const detail = event.detail || {};
  const url = new URL(location.href);
  url.searchParams.set('nav', 'persona');
  if (detail.personReference) url.searchParams.set('person', detail.personReference);
  history.pushState({ forgeRoute: 'persona' }, '', url);
  document.querySelector('[data-forge-application]').dataset.forgeRoute = 'persona';
  document.querySelector('[data-forge-person-workspace-module]').hidden = false;
  document.querySelector('#receipt').textContent = JSON.stringify(detail);
});

globalThis.pack05 = {
  async search(query) {
    return resolveEntities({ query, types: ['PERSON'] });
  },
  async open(index) {
    const resolution = await resolveEntities({ query: 'mariana', types: ['PERSON'] });
    const target = buildEntityNavigation(resolution.candidates[index]);
    return Navigation.navigate(target.route, target.params);
  },
};
