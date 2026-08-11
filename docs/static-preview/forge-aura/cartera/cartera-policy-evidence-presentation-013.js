const CONTRACT_ID = 'FORGE_CARTERA_POLICY_EVIDENCE_PRESENTATION_013';

function makeSummary(doc, state, title, detail) {
  const section = doc.createElement('section');
  section.className = 'cartera-section cartera-policy-evidence-truth-013';
  section.dataset.policyEvidenceTruthState = state;
  section.dataset.presentationContract = CONTRACT_ID;
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

export function reconcilePolicyEvidencePresentation(root) {
  const workspace = root?.querySelector?.('.cartera-workspace');
  if (!workspace) return null;
  const canonicalSection = workspace.querySelector('#coverage-title')?.closest('.cartera-section');
  const evidenceSection = workspace.querySelector('[data-policy-evidence-recovery]');
  if (!canonicalSection || !evidenceSection) return null;

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

  if (existing?.dataset.policyEvidenceTruthState === state) return existing;
  existing?.remove();
  const section = makeSummary(workspace.ownerDocument, state, title, detail);
  canonicalSection.before(section);
  return section;
}

export function policyEvidencePresentationDiagnostics() {
  return Object.freeze({
    contractId: CONTRACT_ID,
    role: 'PRESENTATION_ONLY',
    canonicalCoverageOwnerChanged: false,
    evidenceOwnerChanged: false,
    evidencePromotedToTruth: false,
    createsPolicy: false,
    persists: false,
  });
}

export { CONTRACT_ID };
