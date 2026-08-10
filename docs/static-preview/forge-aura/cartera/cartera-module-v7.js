import { createCarteraModule as createPreviousModule } from './cartera-module-v6.js?v=forge-beta2-post-release-recovery-010i';
import { createCarteraAdapter as createRecoveryAdapter } from './cartera-adapter-pages-v12.js?v=forge-beta2-real-production-contract-recovery-010j';

function e(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

const SAFE_FIELD_LABELS = Object.freeze({
  holderName: 'Titular',
  contractorName: 'Contratante',
  insuredName: 'Asegurado',
  policyNumber: 'Número de póliza',
  productName: 'Producto',
  policyType: 'Tipo de póliza',
  status: 'Estado',
  issueDate: 'Fecha de emisión',
  effectiveFrom: 'Inicio de vigencia',
  effectiveTo: 'Fin de vigencia',
  currency: 'Moneda',
  paymentFrequency: 'Forma de pago',
  premiumAmount: 'Prima documental',
  basicPremiumTotal: 'Prima básica total',
  plannedPremium: 'Prima planeada',
  annualTotal: 'Total anual',
  sumInsured: 'Suma asegurada',
  coverageSectionDetected: 'Sección de coberturas detectada',
  beneficiariesDetected: 'Beneficiarios detectados',
});

function claimProjection(claim) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    return { value: claim, posture: 'LEGACY_VALUE' };
  }
  if (Object.prototype.hasOwnProperty.call(claim, 'confirmedValue') && claim.confirmedValue !== null && claim.confirmedValue !== '') {
    return { value: claim.confirmedValue, posture: 'CONFIRMED_EVIDENCE_VALUE' };
  }
  if (Object.prototype.hasOwnProperty.call(claim, 'candidateValue') && claim.candidateValue !== null && claim.candidateValue !== '') {
    return { value: claim.candidateValue, posture: 'CANDIDATE_EVIDENCE_VALUE' };
  }
  if (Object.prototype.hasOwnProperty.call(claim, 'value') && claim.value !== null && claim.value !== '') {
    return { value: claim.value, posture: 'LEGACY_VALUE' };
  }
  if (Object.prototype.hasOwnProperty.call(claim, 'normalizedValue') && claim.normalizedValue !== null && claim.normalizedValue !== '') {
    return { value: claim.normalizedValue, posture: 'LEGACY_NORMALIZED_VALUE' };
  }
  return { value: null, posture: 'UNKNOWN' };
}

function printable(value) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  if (value === null || value === undefined || value === '') return 'No identificado';
  if (Array.isArray(value)) return `${value.length} elementos`;
  if (typeof value === 'object') return 'Dato estructurado disponible';
  return String(value);
}

function factsHtml(fields = {}) {
  const rows = Object.entries(SAFE_FIELD_LABELS).flatMap(([key, label]) => {
    if (!Object.prototype.hasOwnProperty.call(fields || {}, key)) return [];
    const projection = claimProjection(fields[key]);
    if (projection.value === null || projection.value === undefined || projection.value === '') return [];
    return [{ label, ...projection }];
  });
  if (!rows.length) return '<p>No encontramos campos generales recuperables en esta Evidence Version.</p>';
  return `<dl class="cartera-facts cartera-evidence-facts">${rows.map(item => `
    <div class="cartera-fact">
      <dt>${e(item.label)}</dt>
      <dd>${e(printable(item.value))}</dd>
      ${item.posture === 'CANDIDATE_EVIDENCE_VALUE' ? '<small>Candidato extraído · no confirmado como hecho canónico</small>' : ''}
    </div>`).join('')}
  </dl>`;
}

function periodLabel(period) {
  if (!period || typeof period !== 'object') return '—';
  const value = period.value ?? null;
  const unit = period.unit ?? null;
  return value && unit ? `${value} ${unit}` : '—';
}

function coverageEvidenceHtml(fields = {}) {
  const projection = claimProjection(fields.coverageCandidates);
  const rows = Array.isArray(projection.value) ? projection.value : [];
  if (!rows.length) return '';
  return `<div class="cartera-evidence-coverages" data-evidence-coverages>
    <h3>Coberturas encontradas en el documento</h3>
    <p>Estas filas son evidencia recuperada del PDF confirmado. No sustituyen a las coberturas canónicas de Policy Intelligence.</p>
    <div class="coverage-list">${rows.map((row, index) => `
      <article class="coverage-row">
        <strong>${e(row.coverageLabel || `Cobertura ${index + 1}`)}</strong>
        <span>${e(row.sumInsured ?? '—')} ${e(row.currency || '')}<small>Suma asegurada documental</small></span>
        <span>${e(row.premiumAmount ?? '—')} ${e(row.currency || '')}<small>Prima documental</small></span>
        <span>${e(row.annexReference || '—')}<small>Anexo</small></span>
        <details class="coverage-meta"><summary>Más evidencia</summary><dl>
          <div><dt>Periodo cobertura</dt><dd>${e(periodLabel(row.coveragePeriod))}</dd></div>
          <div><dt>Periodo pago</dt><dd>${e(periodLabel(row.paymentPeriod))}</dd></div>
          <div><dt>Inicio</dt><dd>${e(row.effectiveFrom || '—')}</dd></div>
          <div><dt>Origen</dt><dd>${e(row.sourceSection || row.source || 'Documento')}</dd></div>
        </dl></details>
      </article>`).join('')}
    </div>
  </div>`;
}

function evidenceHtml(evidence) {
  if (!evidence) return `<section class="cartera-section" data-policy-evidence-recovery data-contract-recovery="010j">
    <h2>Documento y evidencia</h2><p>No encontramos una Evidence Version ligada a la versión actual.</p>
  </section>`;
  return `<section class="cartera-section" data-policy-evidence-recovery data-contract-recovery="010j">
    <h2>Documento y evidencia recuperada</h2>
    <p>Información recuperada de la Evidence Version que respaldó la confirmación. Evidencia ≠ verdad canónica.</p>
    ${factsHtml(evidence.fieldClaims || {})}
    ${coverageEvidenceHtml(evidence.fieldClaims || {})}
    <div class="cartera-info cartera-technical-reference">
      <strong>Estado de evidencia: ${e(evidence.verificationState || 'No identificado')}</strong><br>
      Fuente: ${e(evidence.sourceType || 'No identificada')} · ${e(evidence.evidenceVersionReference || 'Sin referencia visible')}
    </div>
  </section>`;
}

function pipelineIdentityHtml(workspace) {
  const linked = Array.isArray(workspace?.linkedProspects) ? workspace.linkedProspects : [];
  if (!linked.length) return '';
  return `<section class="cartera-section" data-pipeline-identity-continuity="010j">
    <h2>Identidad comercial</h2>
    <div class="cartera-info"><strong>Pipeline vinculado</strong><br>Esta persona y ${linked.length === 1 ? 'el registro correspondiente de Pipeline comparten una identidad confirmada.' : `${linked.length} registros de Pipeline comparten identidad confirmada.`}</div>
    ${linked.map(item => `<div class="cartera-directory-row" data-linked-prospect="${e(item.prospectReference)}">
      <span class="cartera-directory-icon">P</span>
      <span><strong>${e(item.displayName)}</strong><small>Pipeline · ${e(item.status || 'Etapa no identificada')} · ${item.contactAvailable ? 'Contacto disponible' : 'Contacto no disponible'}</small></span>
      <span class="cartera-kind">VINCULADO</span>
    </div>`).join('')}
  </section>`;
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const windowRef = options.windowRef || doc.defaultView || window;
  const base = createPreviousModule(options);
  let observer = null;
  let adapterPromise = null;
  let currentPolicyReference = null;
  let currentPersonReference = null;
  let policyLoading = null;
  let personLoading = null;

  const adapter = () => {
    adapterPromise ||= createRecoveryAdapter({ client: options.client, windowRef });
    return adapterPromise;
  };

  function captureReference(event) {
    if (event.target?.closest?.('[data-back]')) {
      currentPolicyReference = null;
      currentPersonReference = null;
      return;
    }
    const directory = event.target?.closest?.('[data-directory-reference][data-directory-kind]');
    if (directory) {
      if (directory.dataset.directoryKind === 'POLICY') {
        currentPolicyReference = directory.dataset.directoryReference || null;
        currentPersonReference = null;
      } else if (directory.dataset.directoryKind === 'PERSON') {
        currentPersonReference = directory.dataset.directoryReference || null;
        currentPolicyReference = null;
      }
      return;
    }
    const openPolicy = event.target?.closest?.('[data-open-policy]');
    const reference = String(openPolicy?.dataset.openPolicy || '');
    if (reference && !reference.startsWith('POLICY_PACKET:AURA:')) {
      currentPolicyReference = reference;
      currentPersonReference = null;
    }
  }

  async function repairPolicyEvidence() {
    if (!currentPolicyReference || policyLoading === currentPolicyReference) return;
    const workspace = root.querySelector('.cartera-workspace');
    if (!workspace) return;
    const reference = currentPolicyReference;
    const existing = root.querySelector('[data-policy-evidence-recovery]');
    if (existing?.dataset.contractRecovery === '010j') return;
    policyLoading = reference;
    try {
      const recovered = await (await adapter()).loadPolicyWorkspace(reference);
      if (reference !== currentPolicyReference || !root.querySelector('.cartera-workspace')) return;
      const holder = doc.createElement('div');
      holder.innerHTML = evidenceHtml(recovered?.evidence || null);
      const section = holder.firstElementChild;
      const stale = root.querySelector('[data-policy-evidence-recovery]');
      if (stale && section) stale.replaceWith(section);
      else if (section) root.querySelector('.cartera-workspace')?.append(section);
    } catch {
      // Base Policy Workspace remains usable. No truth or persistence is changed here.
    } finally {
      if (policyLoading === reference) policyLoading = null;
    }
  }

  async function repairPersonIdentity() {
    if (!currentPersonReference || personLoading === currentPersonReference) return;
    if (!root.querySelector('.cartera-workspace') || root.querySelector('[data-pipeline-identity-continuity]')) return;
    const reference = currentPersonReference;
    personLoading = reference;
    try {
      const workspace = await (await adapter()).loadPersonWorkspace(reference);
      if (reference !== currentPersonReference || !root.querySelector('.cartera-workspace')) return;
      const html = pipelineIdentityHtml(workspace);
      if (!html) return;
      const holder = doc.createElement('div');
      holder.innerHTML = html;
      const section = holder.firstElementChild;
      const tabs = root.querySelector('.cartera-tabs');
      if (tabs && section) tabs.before(section);
      else if (section) root.querySelector('.cartera-workspace')?.append(section);
    } catch {
      // Identity continuity is additive and read-only; base person view remains available.
    } finally {
      if (personLoading === reference) personLoading = null;
    }
  }

  function enhance() {
    void repairPolicyEvidence();
    void repairPersonIdentity();
  }

  function start() {
    root.addEventListener('click', captureReference, true);
    observer = new MutationObserver(enhance);
    observer.observe(root, { childList: true, subtree: true });
  }

  function stop() {
    root.removeEventListener('click', captureReference, true);
    observer?.disconnect();
    observer = null;
    adapterPromise = null;
    currentPolicyReference = null;
    currentPersonReference = null;
    policyLoading = null;
    personLoading = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      start();
      await base.mount?.();
      enhance();
    },
    async reload() {
      const result = await base.reload?.();
      enhance();
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
