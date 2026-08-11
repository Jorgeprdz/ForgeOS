const CONTRACT_ID = 'FORGE_CARTERA_POLICY_EVIDENCE_PRESENTATION_013';

function makeSummary(doc, state, title, detail) {
  const section = doc.createElement('section');
  section.className = 'cartera-section cartera-policy-evidence-truth-013';
  section.dataset.policyEvidenceTruthState = state;
  section.dataset.presentationContract = CONTRACT_ID;
  const heading = doc.createElement('h2');
  heading.textContent = 'Coberturas de esta póliza';
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

function coverageWord(count) {
  return count === 1 ? 'cobertura' : 'coberturas';
}

function confirmedWord(count) {
  return count === 1 ? 'confirmada' : 'confirmadas';
}

function foundWord(count) {
  return count === 1 ? 'encontrada' : 'encontradas';
}

function reconcileCanonicalSection(canonicalSection, canonicalCount, evidenceCount) {
  const warning = canonicalSection.querySelector('.cartera-warning');
  const action = canonicalSection.querySelector('[data-add-coverage]');
  if (canonicalCount === 0 && evidenceCount > 0) {
    if (warning) {
      warning.textContent = `Encontramos ${evidenceCount} ${coverageWord(evidenceCount)} en el documento. Revísalas antes de confirmarlas.`;
    }
    if (action) {
      action.textContent = 'Revisar coberturas';
      action.dataset.policyEvidenceReviewAction = 'DOCUMENT_FOUND';
    }
  }
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

  reconcileCanonicalSection(canonicalSection, canonicalCount, evidenceCount);

  let state;
  let title;
  let detail;
  if (canonicalCount > 0 && evidenceCount > 0) {
    state = 'CANONICAL_AND_DOCUMENT_EVIDENCE';
    title = `Hay ${canonicalCount} ${coverageWord(canonicalCount)} ${confirmedWord(canonicalCount)} y ${evidenceCount} ${foundWord(evidenceCount)} en el documento.`;
    detail = 'Las confirmadas forman parte de la póliza. Las encontradas en el documento se muestran por separado para que puedas revisarlas sin confundirlas con información ya confirmada.';
  } else if (canonicalCount === 0 && evidenceCount > 0) {
    state = 'DOCUMENT_EVIDENCE_ONLY';
    title = `Encontramos ${evidenceCount} ${coverageWord(evidenceCount)} en tu póliza.`;
    detail = 'Revísalas para confirmar que estén correctas. Hasta entonces se muestran como información encontrada en el documento, no como coberturas confirmadas.';
  } else if (canonicalCount > 0) {
    state = 'CANONICAL_ONLY';
    title = `Hay ${canonicalCount} ${coverageWord(canonicalCount)} ${confirmedWord(canonicalCount)} en la póliza.`;
    detail = 'No encontramos filas adicionales de coberturas en el documento disponible para esta vista.';
  } else {
    state = 'NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS';
    title = 'Todavía no tenemos detalle de coberturas para mostrar.';
    detail = 'Esto no significa que la póliza no tenga coberturas. Revisa el documento para completar la información cuando esté disponible.';
  }

  if (existing?.dataset.policyEvidenceTruthState === state) {
    const strong = existing.querySelector('strong');
    const textNode = strong?.nextSibling?.nextSibling;
    if (strong) strong.textContent = title;
    if (textNode?.nodeType === 3) textNode.textContent = detail;
    return existing;
  }
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