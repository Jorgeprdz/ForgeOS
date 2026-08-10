import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v7.js?v=forge-aura-conversation-cartera-011a-base';
import { createCarteraAdapter as createRelationalCarteraAdapter } from './cartera-adapter-pages-v13.js?v=forge-aura-conversation-cartera-011a';

function text(value) {
  return String(value ?? '').trim();
}

function appendText(parent, tag, className, value) {
  const node = parent.ownerDocument.createElement(tag);
  if (className) node.className = className;
  node.textContent = text(value);
  parent.append(node);
  return node;
}

function relationGroup(doc, heading, items, kind) {
  if (!items?.length) return null;
  const group = doc.createElement('span');
  group.className = 'cartera-related-group';
  appendText(group, 'span', 'cartera-related-heading', heading);

  for (const item of items) {
    const row = doc.createElement('span');
    row.className = 'cartera-related-item';
    row.dataset.relatedKind = kind;
    row.dataset.relatedReference = text(item.reference);

    const main = doc.createElement('span');
    main.className = 'cartera-related-item-main';
    appendText(main, 'strong', '', item.displayLabel || (kind === 'POLICY' ? 'Producto no identificado' : 'Cuenta'));
    appendText(main, 'small', '', kind === 'POLICY' ? item.maskedPolicyNumber : item.relationshipLabel);
    row.append(main);
    appendText(row, 'span', 'cartera-related-role', item.relationshipLabel || 'Relación confirmada');
    group.append(row);
  }
  return group;
}

export function createCarteraModule({
  root,
  client,
  windowRef = window,
  globalState,
} = {}) {
  if (!root || !client) throw new Error('AURA_CARTERA_ROOT_AND_CLIENT_REQUIRED');

  let adapter = null;
  let observer = null;
  let decorateScheduled = false;

  const adapterFactory = async options => {
    adapter = await createRelationalCarteraAdapter(options);
    return adapter;
  };

  const base = createBaseCarteraModule({
    root,
    client,
    windowRef,
    globalState,
    adapterFactory,
  });

  function decorateDirectory() {
    decorateScheduled = false;
    const presentation = adapter?.getRelationshipPresentation?.() || {};
    const rows = root.querySelectorAll?.('.cartera-directory-row[data-directory-kind="PERSON"]') || [];

    for (const row of rows) {
      if (row.dataset.carteraRelationalDecorated === 'true') continue;
      row.dataset.carteraRelationalDecorated = 'true';
      const reference = text(row.dataset.directoryReference);
      const relationships = presentation[reference];
      if (!relationships) continue;
      const policies = relationships.policies || [];
      const accounts = relationships.accounts || [];
      if (!policies.length && !accounts.length) continue;

      row.dataset.carteraHasRelations = 'true';
      const content = row.children?.[1];
      if (!content) continue;

      const wrapper = root.ownerDocument.createElement('span');
      wrapper.className = 'cartera-related-entities';
      const policyGroup = relationGroup(
        root.ownerDocument,
        policies.length === 1 ? 'Póliza' : 'Pólizas',
        policies,
        'POLICY',
      );
      const accountGroup = relationGroup(
        root.ownerDocument,
        accounts.length === 1 ? 'Cuenta' : 'Cuentas',
        accounts,
        'ACCOUNT',
      );
      if (policyGroup) wrapper.append(policyGroup);
      if (accountGroup) wrapper.append(accountGroup);
      content.append(wrapper);

      const relationSummary = [
        policies.length ? `${policies.length} póliza${policies.length === 1 ? '' : 's'}` : '',
        accounts.length ? `${accounts.length} cuenta${accounts.length === 1 ? '' : 's'}` : '',
      ].filter(Boolean).join(', ');
      row.setAttribute('aria-label', `${row.querySelector('strong')?.textContent || 'Persona'} · ${relationSummary}`);
    }
  }

  function scheduleDecorate() {
    if (decorateScheduled) return;
    decorateScheduled = true;
    queueMicrotask(decorateDirectory);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(scheduleDecorate);
    observer.observe(root, { childList: true, subtree: true });
  }

  async function mount() {
    startObserver();
    await base.mount();
    decorateDirectory();
  }

  async function reload() {
    await base.reload?.();
    decorateDirectory();
  }

  function destroy() {
    observer?.disconnect();
    observer = null;
    adapter = null;
    return base.destroy?.();
  }

  return Object.freeze({
    ...base,
    mount,
    reload,
    destroy,
  });
}
