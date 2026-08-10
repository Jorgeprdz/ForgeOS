import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v5.js?v=forge-beta2-post-release-recovery-010i';
import { createCarteraAdapter as createRecoveryAdapter } from './cartera-adapter-pages-v11.js?v=forge-beta2-post-release-recovery-010i';

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
  product: 'Producto',
  policyType: 'Tipo de póliza',
  status: 'Estado',
  issueDate: 'Fecha de emisión',
  effectiveFrom: 'Inicio de vigencia',
  effectiveTo: 'Fin de vigencia',
  effectiveDate: 'Inicio de vigencia',
  expirationDate: 'Fin de vigencia',
  currency: 'Moneda',
  paymentFrequency: 'Forma de pago',
  premiumAmount: 'Prima',
  basicPremiumTotal: 'Prima básica total',
  plannedPremium: 'Prima planeada',
  annualTotal: 'Total anual',
  sumInsured: 'Suma asegurada',
  coverageSectionDetected: 'Sección de coberturas detectada',
});

function claimValue(claim) {
  if (claim && typeof claim === 'object' && !Array.isArray(claim)) {
    if (Object.prototype.hasOwnProperty.call(claim, 'value')) return claim.value;
    if (Object.prototype.hasOwnProperty.call(claim, 'normalizedValue')) return claim.normalizedValue;
    return null;
  }
  return claim;
}

function printable(value) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  if (value === null || value === undefined || value === '') return 'No identificado';
  if (Array.isArray(value)) return value.length ? `${value.length} elementos` : 'Sin elementos';
  if (typeof value === 'object') return 'Dato estructurado disponible';
  return String(value);
}

function safeFactRows(fields = {}) {
  return Object.entries(SAFE_FIELD_LABELS)
    .filter(([key]) => Object.prototype.hasOwnProperty.call(fields || {}, key))
    .map(([key, label]) => ({ label, value: claimValue(fields[key]) }))
    .filter(item => item.value !== null && item.value !== undefined && item.value !== '');
}

function evidenceFactsHtml(fields = {}) {
  const rows = safeFactRows(fields);
  if (!rows.length) {
    return '<p>La evidencia está vinculada, pero no contiene campos generales recuperables para esta vista.</p>';
  }
  return `<dl class="cartera-facts">${rows.map(item => `
    <div class="cartera-fact"><dt>${e(item.label)}</dt><dd>${e(printable(item.value))}</dd></div>
  `).join('')}</dl>`;
}

function evidenceRecoveryHtml(evidence) {
  if (!evidence) {
    return `<section class="cartera-section" data-policy-evidence-recovery>
      <h2>Documento y evidencia</h2>
      <p>No encontramos una Evidence Version ligada a la versión actual de esta póliza.</p>
      <div class="cartera-info"><strong>La póliza canónica no se modifica.</strong><br>La ausencia de esta proyección no convierte datos desconocidos en ceros ni supuestos.</div>
    </section>`;
  }
  return `<section class="cartera-section" data-policy-evidence-recovery>
    <h2>Documento y evidencia recuperada</h2>
    <p>Estos datos provienen de la Evidence Version que respaldó la confirmación. Se muestran como evidencia; no sustituyen los hechos canónicos de la póliza.</p>
    ${evidenceFactsHtml(evidence.fieldClaims || {})}
    <div class="cartera-info">
      <strong>Estado de evidencia: ${e(evidence.verificationState || 'No identificado')}</strong><br>
      Fuente: ${e(evidence.sourceType || 'No identificada')} · Evidencia: ${e(evidence.evidenceVersionReference || 'Sin referencia visible')}
    </div>
  </section>`;
}

function evidencePacketHtml(packet) {
  return `<div class="cartera-flow" data-evidence-packet-review>
    <div>
      <p class="cartera-eyebrow">EVIDENCIA PENDIENTE</p>
      <h3>${e(packet.documentType === 'POLICY' ? 'Documento de póliza' : 'Documento')}</h3>
      <p>Este contenido sigue siendo evidencia pendiente de revisión. Abrirlo no confirma ni modifica la póliza.</p>
    </div>
    ${evidenceFactsHtml(packet.fields || {})}
    <div class="cartera-info">
      <strong>Estado: ${e(packet.confirmationState || 'No identificado')}</strong><br>
      Referencia: ${e(packet.packetReference)}${Number.isFinite(Number(packet.confidence)) ? ` · Confianza de extracción: ${e(Math.round(Number(packet.confidence) * 100))}%` : ''}
    </div>
    ${(packet.warnings || []).length ? `<details><summary>Advertencias de extracción</summary><ul>${packet.warnings.map(warning => `<li>${e(warning)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  const windowRef = options.windowRef || doc.defaultView || window;
  const base = createBaseCarteraModule(options);
  let observer = null;
  let adapterPromise = null;
  let currentPolicyReference = null;
  let evidenceLoadingReference = null;
  let evidenceLayer = null;

  const recoveryAdapter = () => {
    adapterPromise ||= createRecoveryAdapter({ client: options.client, windowRef });
    return adapterPromise;
  };

  function closeEvidenceLayer() {
    evidenceLayer?.remove();
    evidenceLayer = null;
  }

  function showEvidenceLayer(title, body) {
    closeEvidenceLayer();
    const layer = doc.createElement('div');
    layer.className = 'cartera-dialog-layer';
    layer.dataset.evidenceReviewLayer = '010i';
    layer.innerHTML = `<button class="cartera-scrim" data-close-evidence aria-label="Cerrar revisión"></button>
      <section class="cartera-dialog" role="dialog" aria-modal="true" aria-labelledby="cartera-evidence-title">
        <header><h2 id="cartera-evidence-title">${e(title)}</h2><button type="button" class="cartera-dialog-close" data-close-evidence aria-label="Cerrar">×</button></header>
        <div class="cartera-dialog__body">${body}</div>
      </section>`;
    layer.addEventListener('click', event => {
      if (event.target.closest('[data-close-evidence]')) closeEvidenceLayer();
    });
    doc.body.append(layer);
    evidenceLayer = layer;
    queueMicrotask(() => layer.querySelector('[data-close-evidence]')?.focus());
  }

  async function openEvidencePacket(reference) {
    showEvidenceLayer('Revisar documento', '<p role="status">Recuperando evidencia…</p>');
    try {
      const packet = await (await recoveryAdapter()).loadEvidencePacket(reference);
      if (!evidenceLayer?.isConnected) return;
      evidenceLayer.querySelector('.cartera-dialog__body').innerHTML = evidencePacketHtml(packet);
    } catch {
      if (!evidenceLayer?.isConnected) return;
      evidenceLayer.querySelector('.cartera-dialog__body').innerHTML = '<div class="cartera-error" role="alert"><strong>No pudimos recuperar esta evidencia.</strong><br>La póliza canónica no fue modificada. Vuelve a Cartera y reintenta.</div>';
    }
  }

  function rememberPolicyReference(target) {
    const directoryPolicy = target?.closest?.('[data-directory-reference][data-directory-kind="POLICY"]');
    if (directoryPolicy?.dataset.directoryReference) {
      currentPolicyReference = directoryPolicy.dataset.directoryReference;
      return;
    }
    const open = target?.closest?.('[data-open-policy]');
    const reference = String(open?.dataset.openPolicy || '');
    if (reference && !reference.startsWith('POLICY_PACKET:AURA:')) currentPolicyReference = reference;
  }

  function onRootClickCapture(event) {
    rememberPolicyReference(event.target);
    const button = event.target?.closest?.('[data-open-policy]');
    const reference = String(button?.dataset.openPolicy || '');
    if (!reference.startsWith('POLICY_PACKET:AURA:')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void openEvidencePacket(reference);
  }

  function enhanceDirectoryCount() {
    const directory = root.querySelector('.cartera-directory');
    if (!directory || directory.dataset.countBreakdown010i === 'true') return;
    const rows = [...directory.querySelectorAll('[data-directory-kind]')];
    if (!rows.length) return;
    const counts = rows.reduce((out, row) => {
      const kind = String(row.dataset.directoryKind || '');
      out[kind] = (out[kind] || 0) + 1;
      return out;
    }, {});
    const parts = [];
    if (counts.PERSON) parts.push(`${counts.PERSON} ${counts.PERSON === 1 ? 'persona' : 'personas'}`);
    if (counts.ACCOUNT) parts.push(`${counts.ACCOUNT} ${counts.ACCOUNT === 1 ? 'cuenta' : 'cuentas'}`);
    if (counts.POLICY) parts.push(`${counts.POLICY} ${counts.POLICY === 1 ? 'póliza' : 'pólizas'}`);
    const countNode = directory.querySelector(':scope > header > span');
    if (countNode && parts.length) countNode.textContent = parts.join(' · ');
    directory.dataset.countBreakdown010i = 'true';
  }

  async function enhancePolicyEvidence() {
    const workspace = root.querySelector('.cartera-workspace');
    if (!workspace || root.querySelector('[data-policy-evidence-recovery]') || !currentPolicyReference) return;
    if (evidenceLoadingReference === currentPolicyReference) return;
    const reference = currentPolicyReference;
    evidenceLoadingReference = reference;
    try {
      const recovered = await (await recoveryAdapter()).loadPolicyWorkspace(reference);
      if (reference !== currentPolicyReference || !root.querySelector('.cartera-workspace')) return;
      const technical = root.querySelector('.cartera-workspace details.cartera-section');
      const holder = doc.createElement('div');
      holder.innerHTML = evidenceRecoveryHtml(recovered?.evidence || null);
      const section = holder.firstElementChild;
      if (technical && section) technical.before(section);
      else if (section) root.querySelector('.cartera-workspace')?.append(section);
    } catch {
      // Evidence recovery is additive. Base canonical Policy Workspace remains usable if this projection is unavailable.
    } finally {
      if (evidenceLoadingReference === reference) evidenceLoadingReference = null;
    }
  }

  function enhance() {
    enhanceDirectoryCount();
    void enhancePolicyEvidence();
  }

  function startEnhancements() {
    root.addEventListener('click', onRootClickCapture, true);
    observer = new MutationObserver(enhance);
    observer.observe(root, { childList: true, subtree: true });
    enhance();
  }

  function stopEnhancements() {
    root.removeEventListener('click', onRootClickCapture, true);
    observer?.disconnect();
    observer = null;
    closeEvidenceLayer();
    adapterPromise = null;
    currentPolicyReference = null;
    evidenceLoadingReference = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      startEnhancements();
      await base.mount?.();
      enhance();
    },
    async reload() {
      const result = await base.reload?.();
      enhance();
      return result;
    },
    async scrub() {
      stopEnhancements();
      return base.scrub?.();
    },
    async unmount() {
      stopEnhancements();
      return base.unmount?.();
    },
    async destroy() {
      stopEnhancements();
      return base.destroy?.();
    },
  });
}
