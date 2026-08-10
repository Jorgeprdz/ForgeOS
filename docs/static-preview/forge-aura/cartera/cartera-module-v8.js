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

function presentationToken(token) {
  const raw = text(token);
  if (!raw) return '';
  if (/^\d+$/.test(raw)) return raw;
  if (/^[A-Z0-9]{2,6}$/.test(raw)) return raw;
  const lower = raw.toLocaleLowerCase('es-MX');
  if (['udi', 'mxn', 'usd'].includes(lower)) return lower.toUpperCase();
  return lower.charAt(0).toLocaleUpperCase('es-MX') + lower.slice(1);
}

function presentTechnicalProductReference(value) {
  const source = text(value);
  if (!source) return 'Producto no identificado';
  const withoutNamespace = source.replace(/^product:/i, '');
  const tokens = withoutNamespace.split(/[-_/\s]+/).filter(Boolean);
  if (!tokens.length) return 'Producto no identificado';
  return tokens.map(presentationToken).filter(Boolean).join(' ');
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

function flattenedPolicyPresentation(presentation) {
  const byReference = new Map();
  for (const relationships of Object.values(presentation || {})) {
    for (const policy of relationships?.policies || []) {
      const reference = text(policy.reference);
      if (reference && !byReference.has(reference)) byReference.set(reference, policy);
    }
  }
  return byReference;
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

  function updateAttentionCopy() {
    const panel = root.querySelector('[aria-labelledby="cartera-attention-title"]');
    if (!panel || panel.dataset.acceptancePresentation012 === 'true') return;
    const title = panel.querySelector('#cartera-attention-title');
    const eyebrow = panel.querySelector('.cartera-eyebrow');
    const helper = panel.querySelector('header p:not(.cartera-eyebrow)');
    const countNode = panel.querySelector(':scope > header > span');
    const items = [...panel.querySelectorAll('.cartera-attention-item')];
    if (!items.length) return;

    const policyReferences = new Set(
      items
        .map(item => text(item.querySelector('[data-open-policy]')?.dataset.openPolicy))
        .filter(Boolean),
    );
    const itemCount = items.length;
    const policyCount = policyReferences.size;
    const topicLabel = `${itemCount} ${itemCount === 1 ? 'tema' : 'temas'} por revisar`;
    const policyLabel = policyCount
      ? ` en ${policyCount} ${policyCount === 1 ? 'póliza' : 'pólizas'}`
      : '';

    if (eyebrow) eyebrow.textContent = 'PARA REVISAR';
    if (title) title.textContent = `${topicLabel}${policyLabel}`;
    if (helper) helper.textContent = 'Una misma póliza puede generar varios temas —por ejemplo datos pendientes, próximos eventos o pagos—. Ninguna acción se ejecuta automáticamente.';
    if (countNode) countNode.textContent = `${itemCount} ${itemCount === 1 ? 'tema' : 'temas'}`;
    panel.dataset.acceptancePresentation012 = 'true';
  }

  function projectPersonContinuity(personRow, relationships) {
    const secondary = personRow.querySelector('small');
    const desiredSecondary = relationships?.pipelineLinked === true ? 'Pipeline vinculado' : null;
    if (secondary && desiredSecondary && secondary.textContent !== desiredSecondary) {
      secondary.textContent = desiredSecondary;
    }
  }

  function projectPolicyPresentation(policyRow, policy) {
    const primary = policyRow.querySelector('strong');
    const secondary = policyRow.querySelector('small');
    const kind = policyRow.querySelector('.cartera-kind');
    const desiredPrimary = policy.displayLabel || 'Producto no identificado';
    const desiredSecondary = policy.maskedPolicyNumber || 'Número no identificado';
    const desiredKind = policy.relationshipLabel || 'PÓLIZA';

    if (primary && primary.textContent !== desiredPrimary) primary.textContent = desiredPrimary;
    if (secondary && secondary.textContent !== desiredSecondary) secondary.textContent = desiredSecondary;
    if (kind && kind.textContent !== desiredKind) kind.textContent = desiredKind;
  }

  function decoratePersonPolicyRows(presentation) {
    const policyByReference = flattenedPolicyPresentation(presentation);
    root.querySelectorAll('.cartera-workspace button[data-open-policy]:not([data-policy-detail-affordance="012"])').forEach(row => {
      const reference = text(row.dataset.openPolicy);
      if (!reference || reference.startsWith('POLICY_PACKET:AURA:')) return;
      const primary = row.querySelector('strong');
      const secondary = row.querySelector('small');
      if (!primary || !secondary) return;

      const maskedNumber = text(primary.textContent);
      const secondaryParts = text(secondary.textContent).split(' · ');
      const rawProduct = secondaryParts.shift() || '';
      const status = secondaryParts.join(' · ');
      const relation = policyByReference.get(reference);
      const projectedLabel = text(relation?.displayLabel);
      const productLabel = projectedLabel && projectedLabel !== 'Producto no identificado'
        ? projectedLabel
        : presentTechnicalProductReference(rawProduct);

      primary.textContent = productLabel;
      secondary.textContent = `${maskedNumber}${status ? ` · ${status}` : ''}`;
      const icon = row.querySelector('.cartera-directory-icon');
      if (icon) icon.textContent = 'P';
      if (!row.querySelector('.cartera-policy-open-cue')) {
        appendText(row, 'span', 'cartera-policy-open-cue', 'Ver detalle');
      }
      row.setAttribute('aria-label', `Abrir detalle de ${productLabel}, póliza ${maskedNumber}`);
      row.dataset.policyDetailAffordance = '012';
    });
  }

  async function decorateDirectory() {
    decorateScheduled = false;
    if (destroyed || !root.isConnected) return;
    const presentation = await projection();
    if (destroyed || !root.isConnected) return;

    updateAttentionCopy();
    decoratePersonPolicyRows(presentation);
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
      projectPersonContinuity(personRow, relationships);
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
            projectPolicyPresentation(policyRow, policy);
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
