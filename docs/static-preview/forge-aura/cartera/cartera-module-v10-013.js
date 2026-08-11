import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v9.js?v=forge-beta2-013-policy-evidence-presentation-base';

const PRESENTATION_ID = 'FORGE_CARTERA_POLICY_EVIDENCE_PRESENTATION_013';

function makeSummary(doc, state, title, detail) {
  const section = doc.createElement('section');
  section.className = 'cartera-section cartera-policy-evidence-truth-013';
  section.dataset.policyEvidenceTruthState = state;
  section.dataset.presentationContract = PRESENTATION_ID;
  const heading = doc.createElement('h2');
  heading.textContent = 'Qué está confirmado y qué viene del documento';
  const box = doc.createElement('div');
  box.className = state === 'DOCUMENT_EVIDENCE_ONLY' ? 'cartera-warning' : 'cartera-info';
  const strong = doc.createElement('strong');
  strong.textContent = title;
  const br = doc.createElement('br');
  const copy = doc.createTextNode(detail);
  box.append(strong, br, copy);
  section.append(heading, box);
  return section;
}

function reconcilePolicyWorkspace(root) {
  const workspace = root.querySelector('.cartera-workspace');
  if (!workspace) return;
  const canonicalSection = workspace.querySelector('#coverage-title')?.closest('.cartera-section');
  const evidenceSection = workspace.querySelector('[data-policy-evidence-recovery]');
  if (!canonicalSection || !evidenceSection) return;

  const canonicalCount = canonicalSection.querySelectorAll('.coverage-row').length;
  const evidenceCount = evidenceSection.querySelectorAll('[data-evidence-coverages] .coverage-row').length;
  const existing = workspace.querySelector('[data-policy-evidence-truth-state]');

  let state;
  let title;
  let detail;
  if (canonicalCount > 0 && evidenceCount > 0) {
    state = 'CANONICAL_AND_DOCUMENT_EVIDENCE';
    title = 'La póliza tiene coberturas confirmadas y también existe evidencia documental.';
    detail = 'Las coberturas confirmadas son la referencia de Policy Truth. Las filas del documento explican de dónde vino parte de la evidencia, pero no crean ni reemplazan coberturas por sí solas.';
  } else if (canonicalCount === 0 && evidenceCount > 0) {
    state = 'DOCUMENT_EVIDENCE_ONLY';
    title = 'El documento sí contiene coberturas, pero todavía no hay detalle de coberturas confirmado en la póliza.';
    detail = 'Puedes revisar la evidencia recuperada del PDF. Hasta que exista confirmación canónica, esas filas siguen siendo evidencia documental y no deben leerse como coberturas contratadas confirmadas.';
  } else if (canonicalCount > 0) {
    state = 'CANONICAL_ONLY';
    title = 'La póliza sí tiene detalle de coberturas confirmado.';
    detail = 'No hay filas de cobertura recuperadas en la Evidence Version visible. La ausencia de esa evidencia en esta vista no invalida las coberturas canónicas.';
  } else {
    state = 'NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS';
    title = 'No hay detalle de coberturas confirmado ni filas documentales recuperadas para esta vista.';
    detail = 'Esto no significa que la póliza no tenga coberturas. Significa únicamente que Forge no tiene detalle suficiente para afirmarlas aquí.';
  }

  if (existing?.dataset.policyEvidenceTruthState === state) return;
  existing?.remove();
  const section = makeSummary(workspace.ownerDocument, state, title, detail);
  canonicalSection.before(section);
}

export function createCarteraModule(options = {}) {
  const { root, windowRef = window } = options;
  if (!root) throw new Error('AURA_CARTERA_ROOT_REQUIRED');
  const base = createBaseCarteraModule(options);
  let observer = null;
  let scheduled = false;
  let destroyed = false;

  function reconcile() {
    scheduled = false;
    if (destroyed || !root.isConnected) return;
    reconcilePolicyWorkspace(root);
  }

  function schedule() {
    if (scheduled || destroyed) return;
    scheduled = true;
    queueMicrotask(reconcile);
  }

  function start() {
    if (observer) return;
    const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(schedule);
    observer.observe(root, { childList: true, subtree: true });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    scheduled = false;
  }

  return Object.freeze({
    ...base,
    async mount() {
      destroyed = false;
      await base.mount?.();
      start();
      reconcile();
    },
    async reload() {
      const result = await base.reload?.();
      reconcile();
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
      destroyed = true;
      stop();
      return base.destroy?.();
    },
  });
}

export { PRESENTATION_ID, reconcilePolicyWorkspace };
