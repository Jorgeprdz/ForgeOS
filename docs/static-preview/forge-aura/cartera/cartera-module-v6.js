import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v5.js?base=cartera-person-workspace-directory-projection-016';
import { loadCarteraPersonProjection } from './cartera-adapter-pages-v11.js?v=cartera-person-workspace-directory-projection-016';
import { maskPolicyNumber, truthLabel } from './cartera-core.js';
import { presentProductReference } from './cartera-person-projection-016.js?v=cartera-person-workspace-directory-projection-016';

const ENTITY_LABEL = Object.freeze({ PERSON: 'Persona', ACCOUNT: 'Cuenta', POLICY: 'Póliza' });
const ENTITY_GLYPH = Object.freeze({ PERSON: '○', ACCOUNT: '▦', POLICY: '▤' });
const TAB_IDS = Object.freeze(['summary', 'policies', 'relationship']);

function contactLabel(contact) {
  if (!contact || contact.state === 'NOT_INFORMED') return 'No informado';
  if (contact.state === 'UNAVAILABLE') return 'Fuente no disponible';
  if (contact.state === 'RESTRICTED') return 'Dato restringido';
  return contact.value || 'No informado';
}

function contactMeta(contact) {
  if (!contact || contact.state !== 'AVAILABLE') return '';
  if (contact.source === 'PIPELINE_PROSPECT') return 'Pipeline vinculado · no implica consentimiento de contacto';
  if (contact.consentStatus && contact.consentStatus !== 'NOT_ASSERTED') {
    return `Método de contacto · consentimiento ${String(contact.consentStatus).toLocaleLowerCase('es-MX')}`;
  }
  return 'Método de contacto vinculado';
}

function policyStateSummary(projection) {
  if (projection?.policyProjection?.sourceState === 'UNAVAILABLE') return 'No disponible';
  const policies = projection?.policies || [];
  const active = policies.filter(policy => String(policy.status_value || '').toUpperCase() === 'ACTIVE').length;
  if (!policies.length) return 'Sin pólizas vinculadas';
  return active ? `${policies.length} · ${active} activa${active === 1 ? '' : 's'}` : String(policies.length);
}

function summaryMarkup(projection) {
  const contacts = projection?.contacts || {};
  const policyState = projection?.policyProjection?.sourceState || 'UNAVAILABLE';
  const contactState = contacts.sourceState || 'UNAVAILABLE';
  return `
    <section class="cartera-section cartera-person-summary-016" id="cartera-person-panel-summary" role="tabpanel" aria-labelledby="cartera-person-tab-summary" data-person-panel="summary">
      <div class="cartera-person-summary-016__heading">
        <div>
          <p class="cartera-eyebrow">RESUMEN</p>
          <h2>${projection?.relationshipLabel || 'Persona'}</h2>
          <p>Identidad confirmada y contexto disponible desde sus autoridades de origen.</p>
        </div>
        <div class="cartera-person-policy-count-016" data-source-state="${policyState}">
          <strong>${policyStateSummary(projection)}</strong>
          <span>Pólizas</span>
        </div>
      </div>
      <div class="cartera-person-contact-grid-016" data-source-state="${contactState}">
        <article>
          <small>Teléfono</small>
          <strong>${contactLabel(contacts.phone)}</strong>
          <span>${contactMeta(contacts.phone)}</span>
        </article>
        <article>
          <small>WhatsApp</small>
          <strong>${contactLabel(contacts.whatsapp)}</strong>
          <span>${contactMeta(contacts.whatsapp)}</span>
        </article>
        <article>
          <small>Correo</small>
          <strong>${contactLabel(contacts.email)}</strong>
          <span>${contactMeta(contacts.email)}</span>
        </article>
      </div>
      ${contactState === 'UNAVAILABLE' ? '<p class="cartera-person-source-note-016">No pudimos consultar los datos de contacto. Esto no significa que la persona no tenga información registrada.</p>' : ''}
      ${policyState === 'UNAVAILABLE' ? '<p class="cartera-person-source-note-016">No pudimos consultar las pólizas relacionadas. La indisponibilidad no se representa como cero.</p>' : ''}
    </section>`;
}

function setTab(tablist, panels, nextId, focus = false) {
  if (!TAB_IDS.includes(nextId)) return;
  tablist.querySelectorAll('[role="tab"]').forEach(button => {
    const selected = button.dataset.personTab === nextId;
    button.setAttribute('aria-selected', selected ? 'true' : 'false');
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  for (const [id, panel] of Object.entries(panels)) {
    if (!panel) continue;
    panel.hidden = id !== nextId;
    panel.tabIndex = id === nextId ? 0 : -1;
  }
}

function bindTabs(tablist, panels) {
  const buttons = [...tablist.querySelectorAll('[role="tab"]')];
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => setTab(tablist, panels, button.dataset.personTab));
    button.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === null) return;
      event.preventDefault();
      setTab(tablist, panels, buttons[next].dataset.personTab, true);
    });
  });
}

function humanizeDirectory(root) {
  root.querySelectorAll('button.cartera-directory-row[data-directory-kind]:not([data-entity-presentation="016"])').forEach(row => {
    const kind = String(row.dataset.directoryKind || '').toUpperCase();
    row.dataset.entityPresentation = '016';
    const icon = row.querySelector('.cartera-directory-icon');
    const strong = row.querySelector('strong');
    const small = row.querySelector('small');
    const type = row.querySelector('.cartera-kind');
    if (icon) icon.textContent = ENTITY_GLYPH[kind] || '•';
    if (type) type.textContent = ENTITY_LABEL[kind] || '';
    if (kind === 'POLICY' && strong && small) {
      const maskedNumber = strong.textContent.trim();
      const productLabel = presentProductReference(small.textContent);
      strong.textContent = productLabel;
      small.textContent = `${maskedNumber} · Póliza`;
    }
  });
}

function humanizePolicyRows(workspace) {
  workspace.querySelectorAll('button.cartera-directory-row[data-open-policy]:not([data-policy-presentation="016"])').forEach(row => {
    const strong = row.querySelector('strong');
    const small = row.querySelector('small');
    if (!strong || !small) return;
    const maskedNumber = strong.textContent.trim();
    const parts = small.textContent.split(' · ');
    const rawProduct = parts.shift() || '';
    const status = parts.join(' · ');
    strong.textContent = presentProductReference(rawProduct);
    small.textContent = `${maskedNumber}${status ? ` · ${status}` : ''}`;
    row.dataset.policyPresentation = '016';
  });
}

function humanizePolicyWorkspace(root) {
  const workspace = root.querySelector('.cartera-workspace');
  if (!workspace || workspace.dataset.policyPresentation === '016') return;
  const eyebrow = workspace.querySelector('.cartera-workspace__hero .cartera-eyebrow');
  if (String(eyebrow?.textContent || '').trim() !== 'POLICY WORKSPACE') return;
  const title = workspace.querySelector('.cartera-workspace__hero h1');
  if (title) title.textContent = presentProductReference(title.textContent);
  workspace.dataset.policyPresentation = '016';
}

function buildPersonTabs(workspace, projection) {
  if (workspace.dataset.personProjection === '016') return;
  const tablist = workspace.querySelector('.cartera-tabs');
  if (!tablist) return;
  const directSections = [...workspace.children].filter(node => node.classList?.contains('cartera-section'));
  const policies = directSections.find(section => /^Pólizas relacionadas$/i.test(section.querySelector('h2')?.textContent?.trim() || ''));
  const relationship = directSections.find(section => /^Relación$/i.test(section.querySelector('h2')?.textContent?.trim() || ''));
  const context = directSections.find(section => /^Contexto para revisión$/i.test(section.querySelector('h2')?.textContent?.trim() || ''));
  if (!policies || !relationship || !context) return;

  policies.id = 'cartera-person-panel-policies';
  policies.setAttribute('role', 'tabpanel');
  policies.setAttribute('aria-labelledby', 'cartera-person-tab-policies');
  policies.dataset.personPanel = 'policies';

  const relationPanel = workspace.ownerDocument.createElement('div');
  relationPanel.className = 'cartera-person-relation-panel-016';
  relationPanel.id = 'cartera-person-panel-relationship';
  relationPanel.setAttribute('role', 'tabpanel');
  relationPanel.setAttribute('aria-labelledby', 'cartera-person-tab-relationship');
  relationPanel.dataset.personPanel = 'relationship';
  relationship.before(relationPanel);
  relationPanel.append(relationship, context);

  tablist.insertAdjacentHTML('afterend', summaryMarkup(projection));
  const summary = workspace.querySelector('[data-person-panel="summary"]');

  tablist.innerHTML = `
    <button type="button" id="cartera-person-tab-summary" role="tab" data-person-tab="summary" aria-controls="cartera-person-panel-summary" aria-selected="true">Resumen</button>
    <button type="button" id="cartera-person-tab-policies" role="tab" data-person-tab="policies" aria-controls="cartera-person-panel-policies" aria-selected="false" tabindex="-1">Pólizas</button>
    <button type="button" id="cartera-person-tab-relationship" role="tab" data-person-tab="relationship" aria-controls="cartera-person-panel-relationship" aria-selected="false" tabindex="-1">Relación</button>`;

  if (projection?.policyProjection?.sourceState === 'UNAVAILABLE') {
    const policyMessage = policies.querySelector('p');
    if (policyMessage && /No hay pólizas generales vinculadas/i.test(policyMessage.textContent || '')) {
      policyMessage.textContent = 'No pudimos consultar las pólizas relacionadas.';
    }
  }

  humanizePolicyRows(workspace);
  bindTabs(tablist, { summary, policies, relationship: relationPanel });
  setTab(tablist, { summary, policies, relationship: relationPanel }, 'summary');
  workspace.dataset.personProjection = '016';
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  if (!root || !options.client) throw new Error('AURA_CARTERA_ROOT_AND_CLIENT_REQUIRED');
  const base = createBaseCarteraModule(options);
  let personReference = null;
  let observer = null;
  let projectionGeneration = 0;
  let disposed = false;

  function capturePersonReference(event) {
    const row = event.target?.closest?.('[data-directory-kind="PERSON"][data-directory-reference]');
    if (row) personReference = row.dataset.directoryReference || null;
  }

  async function upgradePersonWorkspace() {
    const workspace = root.querySelector('.cartera-workspace');
    if (!workspace || workspace.dataset.personProjection === '016' || workspace.dataset.personProjectionLoading === 'true') return;
    const eyebrow = workspace.querySelector('.cartera-workspace__hero .cartera-eyebrow');
    if (String(eyebrow?.textContent || '').trim() !== 'PERSON WORKSPACE' || !personReference) return;
    workspace.dataset.personProjectionLoading = 'true';
    const generation = ++projectionGeneration;
    try {
      const projection = await loadCarteraPersonProjection({ client: options.client, reference: personReference });
      if (disposed || generation !== projectionGeneration || !workspace.isConnected) return;
      buildPersonTabs(workspace, projection);
    } catch {
      if (disposed || generation !== projectionGeneration || !workspace.isConnected) return;
      buildPersonTabs(workspace, {
        relationshipLabel: 'Persona',
        contacts: { sourceState: 'UNAVAILABLE' },
        policies: [],
        policyProjection: { sourceState: 'UNAVAILABLE', count: 0 },
      });
    } finally {
      if (workspace.isConnected) delete workspace.dataset.personProjectionLoading;
    }
  }

  function upgrade() {
    if (disposed) return;
    humanizeDirectory(root);
    humanizePolicyWorkspace(root);
    void upgradePersonWorkspace();
  }

  function start() {
    disposed = false;
    root.addEventListener('click', capturePersonReference, true);
    observer ||= new MutationObserver(upgrade);
    observer.observe(root, { childList: true, subtree: true });
    upgrade();
  }

  function stop() {
    disposed = true;
    projectionGeneration += 1;
    observer?.disconnect();
    observer = null;
    root.removeEventListener('click', capturePersonReference, true);
    personReference = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      start();
      await base.mount?.();
      upgrade();
    },
    async reload() {
      const result = await base.reload?.();
      upgrade();
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      stop();
      return base.destroy?.();
    },
  });
}
