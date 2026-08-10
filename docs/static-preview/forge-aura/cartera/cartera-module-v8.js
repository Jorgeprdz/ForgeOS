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

function staticRelationRow(doc, item, kind) {
  const row = doc.createElement('div');
  row.className = 'cartera-related-static-row';
  row.dataset.relatedKind = kind;
  row.dataset.relatedReference = text(item.reference);

  const icon = appendText(row, 'span', 'cartera-directory-icon', kind === 'POLICY' ? 'PÓL' : 'A');
  icon.setAttribute('aria-hidden', 'true');
  const main = doc.createElement('span');
  appendText(main, 'strong', '', item.displayLabel || (kind === 'POLICY' ? 'Producto no identificado' : 'Cuenta'));
  appendText(main, 'small', '', kind === 'POLICY' ? item.maskedPolicyNumber : item.relationshipLabel);
  row.append(main);
  appendText(row, 'span', 'cartera-kind', item.relationshipLabel || 'RELACIÓN');
  return row;
}

function relationSection(doc, label) {
  const section = doc.createElement('section');
  section.className = 'cartera-related-section';
  appendText(section, 'p', 'cartera-related-heading', label);
  return section;
}

export function createCarteraModule({
  root,
  client,
  windowRef = window,
  globalState,
} = {}) {
  if (!root || !client) throw new Error('AURA_CARTERA_ROOT_AND_CLIENT_REQUIRED');

  const doc = root.ownerDocument;
  const base = createBaseCarteraModule({ root, client, windowRef, globalState });
  let relationalAdapter = null;
  let projectionPromise = null;
  let observer = null;
  let decorateScheduled = false;
  let destroyed = false;

  async function projection() {
    if (!projectionPromise) {
      projectionPromise = (async () => {
        relationalAdapter ||= await createRelationalCarteraAdapter({ client, windowRef });
        await relationalAdapter.loadDirectory();
        return relationalAdapter.getRelationshipPresentation?.() || {};
      })().catch(error => {
        projectionPromise = null;
        console.error('AURA_CARTERA_RELATIONSHIP_PROJECTION_011A_FAILED', error);
        return {};
      });
    }
    return projectionPromise;
  }

  function relationUseCount(presentation, kind, reference) {
    let count = 0;
    for (const relationships of Object.values(presentation || {})) {
      const list = kind === 'POLICY' ? relationships?.policies : relationships?.accounts;
      if ((list || []).some(item => text(item.reference) === reference)) count += 1;
    }
    return count;
  }

  function updateDirectoryCopy() {
    const directory = root.querySelector('.cartera-directory');
    if (!directory) return;
    const headerCopy = directory.querySelector(':scope > header p:not(.cartera-eyebrow)');
    const desiredCopy = 'Personas como centro de relación; pólizas y cuentas vinculadas aparecen dentro de su contexto cuando existe una relación confirmada.';
    if (headerCopy && headerCopy.textContent !== desiredCopy) headerCopy.textContent = desiredCopy;
  }

  async function decorateDirectory() {
    decorateScheduled = false;
    if (destroyed || !root.isConnected) return;
    const presentation = await projection();
    if (destroyed || !root.isConnected) return;

    updateDirectoryCopy();
    const list = root.querySelector('.cartera-directory-list');
    if (!list) return;
    const personRows = [...list.querySelectorAll(':scope > .cartera-directory-row[data-directory-kind="PERSON"]')];

    for (const personRow of personRows) {
      if (!personRow.isConnected || personRow.closest('.cartera-relationship-card')) continue;
      const reference = text(personRow.dataset.directoryReference);
      const relationships = presentation[reference];
      const policies = relationships?.policies || [];
      const accounts = relationships?.accounts || [];
      if (!policies.length && !accounts.length) continue;

      const card = doc.createElement('article');
      card.className = 'cartera-relationship-card';
      card.dataset.relationshipPersonReference = reference;
      card.setAttribute('aria-label', `Relación comercial de ${personRow.querySelector('strong')?.textContent || 'persona'}`);
      list.insertBefore(card, personRow);

      personRow.classList.add('cartera-relationship-person');
      personRow.dataset.carteraHasRelations = 'true';
      card.append(personRow);

      if (policies.length) {
        const section = relationSection(doc, policies.length === 1 ? 'Póliza' : 'Pólizas');
        for (const policy of policies) {
          const policyReference = text(policy.reference);
          const policyRow = [...list.querySelectorAll(':scope > .cartera-directory-row[data-directory-kind="POLICY"]')]
            .find(row => text(row.dataset.directoryReference) === policyReference);
          const uniquelyOwnedPresentation = relationUseCount(presentation, 'POLICY', policyReference) === 1;
          if (policyRow && uniquelyOwnedPresentation) {
            policyRow.classList.add('cartera-relationship-policy');
            policyRow.dataset.relationshipRole = text(policy.relationshipLabel);
            const label = policyRow.querySelector('small');
            if (label) label.textContent = policy.displayLabel || 'Producto no identificado';
            const kind = policyRow.querySelector('.cartera-kind');
            if (kind) kind.textContent = policy.relationshipLabel || 'PÓLIZA';
            section.append(policyRow);
          } else {
            section.append(staticRelationRow(doc, policy, 'POLICY'));
          }
        }
        card.append(section);
      }

      if (accounts.length) {
        const section = relationSection(doc, accounts.length === 1 ? 'Cuenta' : 'Cuentas');
        for (const account of accounts) section.append(staticRelationRow(doc, account, 'ACCOUNT'));
        card.append(section);
      }
    }

    root.querySelector('.cartera-directory')?.setAttribute('data-relational-presentation', '011a');
  }

  function scheduleDecorate() {
    if (decorateScheduled || destroyed) return;
    decorateScheduled = true;
    queueMicrotask(() => { void decorateDirectory(); });
  }

  function startObserver() {
    if (observer) return;
    const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(scheduleDecorate);
    observer.observe(root, { childList: true, subtree: true });
  }

  function resetProjection() {
    projectionPromise = null;
  }

  async function mount() {
    destroyed = false;
    startObserver();
    await base.mount();
    await decorateDirectory();
  }

  async function reload() {
    resetProjection();
    const result = await base.reload?.();
    await decorateDirectory();
    return result;
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    decorateScheduled = false;
    projectionPromise = null;
    relationalAdapter = null;
  }

  return Object.freeze({
    ...base,
    mount,
    reload,
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      destroyed = true;
      stop();
      return base.destroy?.();
    },
  });
}
