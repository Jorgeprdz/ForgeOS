import { createCarteraModule as createBaseCarteraModule } from './cartera-module.js?base=cartera-pdf-semantic-completion-014';
import { createCarteraAdapter as createSemanticCarteraAdapter } from './cartera-adapter-pages-v8.js?v=cartera-pdf-semantic-completion-014';
import {
  coverageExtractionState,
  formatCivilDateEs,
  normalizeCoverageCandidates,
  normalizeMoneyValue,
  paymentFrequencyLabel,
  policyStatusLabel,
  semanticReviewCompleteness,
} from './cartera-semantic-v1.js?v=cartera-pdf-semantic-completion-014';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[char]);
}

function normalizedName(value) {
  return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function amountLabel(value, currency) {
  const number = normalizeMoneyValue(value);
  if (number === null) return 'No identificado';
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
  return `${formatted}${currency ? ` ${currency}` : ''}`;
}

function policyTypeLabel(value) {
  const text = String(value || '').trim();
  if (!text) return 'Por confirmar';
  return text.toUpperCase() === 'NORMAL' ? 'Normal' : text;
}

function extractionQualityLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Lectura: confianza no informada';
  if (number >= .9) return 'Lectura del documento: alta';
  if (number >= .7) return 'Lectura del documento: media';
  return 'Lectura del documento: revisar con cuidado';
}

function coverageConfidenceLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Confianza no informada';
  if (number >= .9) return 'Alta';
  if (number >= .7) return 'Media';
  return 'Baja';
}

function statusValue(value) {
  const upper = String(value || '').trim().toUpperCase();
  return ['ACTIVE','ISSUED','PENDING','SUSPENDED','LAPSED','CANCELLED'].includes(upper) ? upper : 'UNKNOWN';
}

function safePeopleOptions(people) {
  return (people || []).map(person => {
    const reference = String(person.reference || '');
    const label = String(person.label || 'Persona');
    const secondary = String(person.secondary || 'Persona existente');
    return `<option value="${escapeHtml(reference)}">${escapeHtml(label)} · ${escapeHtml(secondary)}</option>`;
  }).join('');
}

function coverageRows(review) {
  return normalizeCoverageCandidates(review?.coverageCandidates || review?.edgeCandidate?.coverageCandidates || []);
}

const GAP_LABELS = Object.freeze({
  policyNumber: 'Número de póliza',
  product: 'Producto',
  policyTypeOrStatus: 'Tipo o estado de póliza',
  issueDate: 'Fecha de emisión',
  effectiveDate: 'Fecha de inicio',
  expirationDate: 'Fecha de fin',
  currency: 'Moneda',
  paymentFrequency: 'Forma de pago',
  basicPremiumTotal: 'Prima básica total',
  plannedPremium: 'Prima planeada',
  annualTotal: 'Total anual',
  coverageCandidates: 'Coberturas',
});

function coverageSummary(state, count) {
  if (count > 0) return `${count} coberturas candidatas`;
  if (state === 'INCOMPLETE_REVIEW_REQUIRED') return 'Coberturas requieren revisión';
  if (state === 'NO_COVERAGE_SECTION_DETECTED') return 'Sin sección de coberturas detectada';
  return 'Coberturas por identificar';
}

function coverageEmptyMessage(state) {
  if (state === 'INCOMPLETE_REVIEW_REQUIRED') {
    return '<div class="cartera-warning"><strong>Coberturas requieren revisión.</strong><br>Forge detectó una sección de coberturas, pero no obtuvo filas estructuradas suficientes. No se interpreta como ausencia de coberturas.</div>';
  }
  if (state === 'NO_COVERAGE_SECTION_DETECTED') {
    return '<div class="cartera-info"><strong>No se identificó una sección de coberturas.</strong><br>Revisa el documento antes de confirmar. Forge no convierte esta ausencia de extracción en un hecho de póliza.</div>';
  }
  return '<div class="cartera-warning"><strong>Coberturas por identificar.</strong><br>La extracción no pudo determinar con suficiente claridad si el documento contiene una sección de coberturas. Forge no inventará beneficios ni sumas aseguradas.</div>';
}

function semanticReviewHtml(review, people) {
  const candidate = review?.edgeCandidate || {};
  const coverages = coverageRows(review);
  const coverageState = candidate.coverageExtractionState || review?.pdfCoverageExtraction || coverageExtractionState(candidate);
  const completeness = candidate.reviewCompleteness || review?.reviewCompleteness || semanticReviewCompleteness(candidate);
  const currency = candidate.currency || null;
  const holder = candidate.person || candidate.contractor || '';
  const contractor = candidate.contractor || candidate.person || '';
  const insured = candidate.insured || '';
  const sameDocumentPerson = Boolean(contractor && insured && normalizedName(contractor) === normalizedName(insured));
  const distinctInsured = Boolean(contractor && insured && !sameDocumentPerson);
  const beneficiaryDetected = candidate.beneficiariesDetected === true || review?.fields?.beneficiariesDetected?.value === true;
  const status = statusValue(candidate.status);
  const semanticGaps = [...new Set(completeness.gaps || [])];
  if (!candidate.status) semanticGaps.push('policyStatusHumanDecision');
  const unresolved = semanticGaps.map(key => key === 'policyStatusHumanDecision' ? 'Estado de póliza' : (GAP_LABELS[key] || key));
  const pendingCount = unresolved.length + 1 + (insured ? 1 : 0) + coverages.length;
  const reviewSummary = completeness.criticalGapCount > 0
    ? `Revisión: ${completeness.criticalGapCount} datos críticos pendientes`
    : 'Revisión: hechos principales extraídos; confirma antes de incorporar';

  const coverageHtml = coverages.length
    ? `<div class="cartera-semantic-coverages" role="list">
        ${coverages.map((coverage, index) => `
          <label class="cartera-semantic-coverage" data-coverage-candidate="${escapeHtml(coverage.candidateReference)}">
            <input type="checkbox" data-coverage-confirm value="${escapeHtml(coverage.candidateReference)}">
            <span class="cartera-semantic-coverage__main">
              <strong>${escapeHtml(coverage.coverageLabel || `Cobertura ${index + 1}`)}</strong>
              <small>${escapeHtml(coverage.coverageCode || coverage.annexReference || 'Sin código visible')}</small>
            </span>
            <span><strong>${escapeHtml(amountLabel(coverage.sumInsured, coverage.currency))}</strong><small>Suma asegurada</small></span>
            <span><strong>${escapeHtml(amountLabel(coverage.premiumAmount, coverage.currency))}</strong><small>Prima documental</small></span>
            <span><strong>${escapeHtml(coverage.annexReference || '—')}</strong><small>Anexo</small></span>
            <span><strong>${escapeHtml(formatCivilDateEs(coverage.effectiveFrom))}</strong><small>Inicio</small></span>
            <span><strong>${escapeHtml(coverageConfidenceLabel(coverage.confidence))}</strong><small>Confianza de extracción · requiere confirmación</small></span>
          </label>`).join('')}
       </div>`
    : coverageEmptyMessage(coverageState);

  const unresolvedHtml = unresolved.length
    ? unresolved.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>La extracción conserva los hechos documentales principales; todavía falta tu confirmación humana.</li>';

  return `
    <div class="cartera-semantic-review" data-semantic-review="014">
      <div class="cartera-progress" aria-label="Progreso de incorporación">
        <span>1 Documento</span><span>2 Evidencia</span><span>3 Extracción</span>
        <span data-active="true">4 Revisión humana</span><span>5 Confirmación</span>
      </div>

      <section class="cartera-semantic-hero" aria-labelledby="semantic-document-title">
        <div>
          <p class="cartera-eyebrow">DOCUMENTO DETECTADO</p>
          <h3 id="semantic-document-title">${escapeHtml(candidate.product || 'Producto por confirmar')}</h3>
          <p>${escapeHtml(candidate.policyNumber || 'Número de póliza por confirmar')} · La extracción sigue siendo evidencia, no verdad canónica.</p>
        </div>
        <aside class="cartera-semantic-rail" aria-label="Calidad de revisión">
          <strong>${escapeHtml(coverageSummary(coverageState, coverages.length))}</strong>
          <span>${pendingCount} decisiones por revisar</span>
          <small>${escapeHtml(reviewSummary)} · ${escapeHtml(extractionQualityLabel(candidate.confidence))}</small>
        </aside>
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-policy-title">
        <header><div><p class="cartera-eyebrow">DETECTADO</p><h3 id="semantic-policy-title">Póliza</h3></div></header>
        <dl class="cartera-semantic-facts">
          <div><dt>Producto</dt><dd>${escapeHtml(candidate.product || 'Por confirmar')}</dd></div>
          <div><dt>Número de póliza</dt><dd>${escapeHtml(candidate.policyNumber || 'Por confirmar')}</dd></div>
          <div><dt>Tipo de póliza</dt><dd>${escapeHtml(policyTypeLabel(candidate.policyType))}</dd></div>
          <div><dt>Estado</dt><dd>${escapeHtml(policyStatusLabel(candidate.status))}</dd></div>
          <div><dt>Emisión</dt><dd>${escapeHtml(formatCivilDateEs(candidate.issueDate))}</dd></div>
          <div><dt>Inicio</dt><dd>${escapeHtml(formatCivilDateEs(candidate.effectiveDate))}</dd></div>
          <div><dt>Fin</dt><dd>${escapeHtml(formatCivilDateEs(candidate.expirationDate))}</dd></div>
          <div><dt>Moneda</dt><dd>${escapeHtml(candidate.currency || 'Por confirmar')}</dd></div>
          <div><dt>Forma de pago</dt><dd>${escapeHtml(paymentFrequencyLabel(candidate.paymentFrequency))}</dd></div>
        </dl>
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-premium-title">
        <header><div><p class="cartera-eyebrow">PRIMA Y COBRO</p><h3 id="semantic-premium-title">Hechos documentales separados</h3></div></header>
        <div class="cartera-semantic-premiums">
          <article><small>Prima básica total</small><strong>${escapeHtml(amountLabel(candidate.basicPremiumTotal, currency))}</strong><p>No se convierte automáticamente en prima canónica.</p></article>
          <article><small>Prima planeada</small><strong>${escapeHtml(amountLabel(candidate.plannedPremium, currency))}</strong><p>Se conserva como concepto documental independiente.</p></article>
          <article><small>Total anual</small><strong>${escapeHtml(amountLabel(candidate.annualTotal, currency))}</strong><p>No se colapsa silenciosamente con otros importes.</p></article>
        </div>
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-roles-title">
        <header><div><p class="cartera-eyebrow">ASEGURADO Y CONTRATANTE</p><h3 id="semantic-roles-title">Roles documentales</h3></div></header>
        <div class="cartera-semantic-parties">
          <article><small>Contratante / titular</small><strong>${escapeHtml(contractor || holder || 'Por confirmar')}</strong></article>
          <article><small>Asegurado</small><strong>${escapeHtml(insured || 'Por confirmar')}</strong></article>
        </div>
        ${sameDocumentPerson ? '<div class="cartera-info">El documento muestra a la misma persona en ambos roles. Forge no los fusionará: debes confirmarlo explícitamente.</div>' : ''}
        ${distinctInsured ? '<div class="cartera-warning"><strong>El asegurado es una persona distinta.</strong><br>Esta revisión no puede confirmar silenciosamente esa identidad; requiere un flujo de resolución adicional antes de incorporar.</div>' : ''}
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-beneficiary-title">
        <header><div><p class="cartera-eyebrow">BENEFICIARIOS</p><h3 id="semantic-beneficiary-title">${beneficiaryDetected ? 'Beneficiarios detectados' : 'Beneficiarios no confirmados'}</h3></div></header>
        <div class="cartera-info"><strong>Información protegida.</strong><br>La revisión general no muestra nombres, porcentajes, PII ni referencias internas de beneficiarios.</div>
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-coverage-title">
        <header><div><p class="cartera-eyebrow">COBERTURAS</p><h3 id="semantic-coverage-title">Coberturas detectadas</h3><p>Marca cada cobertura después de comprobarla contra el documento.</p></div><span>${coverages.length ? `${coverages.length} candidatas` : 'Revisión requerida'}</span></header>
        ${coverageHtml}
      </section>

      <section class="cartera-semantic-section" aria-labelledby="semantic-decisions-title">
        <header><div><p class="cartera-eyebrow">REQUIERE TU DECISIÓN</p><h3 id="semantic-decisions-title">Antes de incorporar</h3></div></header>
        <form data-pdf-review class="cartera-semantic-decisions" novalidate>
          <fieldset class="cartera-semantic-choice">
            <legend>Cómo resolver al titular</legend>
            <label><input type="radio" name="personMode" value="existing" ${people.length ? '' : 'disabled'}> Vincular persona existente</label>
            <label><input type="radio" name="personMode" value="new"> Crear persona nueva</label>
          </fieldset>

          <label data-existing-person hidden>Persona existente
            <select name="existingPersonReference">
              <option value="">Selecciona una persona…</option>
              ${safePeopleOptions(people)}
            </select>
          </label>

          <label>Nombre para la identidad revisada
            <input name="holderName" value="${escapeHtml(holder)}" autocomplete="name" required>
          </label>

          <label>Estado
            <select name="status">
              <option value="UNKNOWN" ${status === 'UNKNOWN' ? 'selected' : ''}>No identificado</option>
              <option value="ACTIVE" ${status === 'ACTIVE' ? 'selected' : ''}>Activa</option>
              <option value="ISSUED" ${status === 'ISSUED' ? 'selected' : ''}>Emitida</option>
              <option value="PENDING" ${status === 'PENDING' ? 'selected' : ''}>Pendiente</option>
              <option value="SUSPENDED" ${status === 'SUSPENDED' ? 'selected' : ''}>Suspendida</option>
              <option value="LAPSED" ${status === 'LAPSED' ? 'selected' : ''}>Vencida</option>
              <option value="CANCELLED" ${status === 'CANCELLED' ? 'selected' : ''}>Cancelada</option>
            </select>
          </label>

          ${insured ? `<label class="cartera-check cartera-semantic-role-confirm"><input type="checkbox" name="confirmSamePersonInsured" ${distinctInsured ? 'disabled' : ''}><span>Confirmo que contratante/titular y asegurado corresponden a la misma persona para esta póliza.</span></label>` : ''}

          <input type="hidden" name="policyNumber" value="${escapeHtml(candidate.policyNumber || '')}">
          <input type="hidden" name="productLabel" value="${escapeHtml(candidate.product || '')}">
          <input type="hidden" name="currency" value="${escapeHtml(candidate.currency || '')}">
          <input type="hidden" name="paymentFrequency" value="${escapeHtml(candidate.paymentFrequency || '')}">
          <input type="hidden" name="issueDate" value="${escapeHtml(candidate.issueDate || '')}">
          <input type="hidden" name="effectiveFrom" value="${escapeHtml(candidate.effectiveDate || '')}">
          <input type="hidden" name="effectiveTo" value="${escapeHtml(candidate.expirationDate || '')}">

          <div class="cartera-semantic-pending">
            <strong>Datos por confirmar</strong>
            <ul>${unresolvedHtml}</ul>
          </div>

          <div class="cartera-semantic-confirm">
            <div><strong>Tu confirmación crea la frontera de verdad.</strong><small>Documento → evidencia → revisión humana → writers gobernados.</small></div>
            <button class="cartera-primary" type="submit" disabled>Confirmar e incorporar</button>
          </div>
        </form>
      </section>
    </div>`;
}

function captureFormInput(form) {
  const values = Object.fromEntries(new FormData(form));
  const confirmedCoverageReferences = [...form.querySelectorAll('[data-coverage-confirm]:checked')]
    .map(input => input.value);
  return {
    ...values,
    currency: values.currency || null,
    paymentFrequency: values.paymentFrequency || null,
    issueDate: values.issueDate || null,
    effectiveFrom: values.effectiveFrom || null,
    effectiveTo: values.effectiveTo || null,
    confirmedCoverageReferences,
    confirmSamePersonInsured: Boolean(form.elements.confirmSamePersonInsured?.checked),
  };
}

export function createCarteraModule(options = {}) {
  const root = options.root;
  const doc = root?.ownerDocument || document;
  let activeAdapter = null;
  let lastReview = null;
  let observer = null;
  let peoplePromise = null;
  let upgradeRevision = 0;

  const adapterFactory = async factoryOptions => {
    const semantic = await createSemanticCarteraAdapter(factoryOptions);
    activeAdapter = Object.freeze({
      ...semantic,
      async processPdf(file, processOptions = {}) {
        const review = await semantic.processPdf(file, processOptions);
        lastReview = review;
        return review;
      },
    });
    return activeAdapter;
  };

  const base = createBaseCarteraModule({
    ...options,
    adapterFactory,
  });

  async function people() {
    if (!peoplePromise) {
      peoplePromise = activeAdapter?.loadDirectory?.()
        .then(items => (items || []).filter(item => item.type === 'PERSON'))
        .catch(() => []);
    }
    return peoplePromise || [];
  }

  function updateReadiness(form, review) {
    const personMode = form.querySelector('input[name="personMode"]:checked')?.value || '';
    const existing = form.elements.existingPersonReference?.value || '';
    const holder = String(form.elements.holderName?.value || '').trim();
    const coverageInputs = [...form.querySelectorAll('[data-coverage-confirm]')];
    const allCoveragesConfirmed = coverageInputs.length === 0 || coverageInputs.every(input => input.checked);
    const coverageState = review?.edgeCandidate?.coverageExtractionState || review?.pdfCoverageExtraction;
    const coverageReady = allCoveragesConfirmed && coverageState !== 'INCOMPLETE_REVIEW_REQUIRED' && coverageState !== 'COVERAGE_PRESENCE_UNKNOWN';
    const insuredRequired = Boolean(review?.edgeCandidate?.insured);
    const samePersonConfirmed = !insuredRequired || Boolean(form.elements.confirmSamePersonInsured?.checked);
    const distinctInsured = Boolean(form.elements.confirmSamePersonInsured?.disabled);
    const identityReady = personMode === 'new'
      ? Boolean(holder)
      : personMode === 'existing' && Boolean(existing);

    const button = form.querySelector('[type="submit"]');
    if (button) button.disabled = !(identityReady && coverageReady && samePersonConfirmed && !distinctInsured);
  }

  function bindSemanticForm(form, review) {
    const existingWrap = form.querySelector('[data-existing-person]');
    form.querySelectorAll('input[name="personMode"]').forEach(input => {
      input.addEventListener('change', () => {
        if (existingWrap) existingWrap.hidden = input.value !== 'existing' || !input.checked;
        updateReadiness(form, review);
      });
    });
    form.addEventListener('input', () => updateReadiness(form, review));
    form.addEventListener('change', () => updateReadiness(form, review));
    updateReadiness(form, review);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      updateReadiness(form, review);
      const button = form.querySelector('[type="submit"]');
      if (!button || button.disabled) return;
      button.disabled = true;
      button.textContent = 'Confirmando…';
      form.querySelector('[data-semantic-error]')?.remove();

      try {
        const input = captureFormInput(form);
        await activeAdapter.confirmPdfReview(review, input);
        form.closest('.cartera-dialog-layer')?.remove();
        options.globalState?.('Póliza incorporada con revisión semántica confirmada.', 'status');
        await base.reload?.();
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Confirmar e incorporar';
        const message = String(error?.code || error?.message || 'No se pudo completar la confirmación.');
        form.insertAdjacentHTML('beforeend', `<div data-semantic-error class="cartera-error" role="alert">${escapeHtml(message)}</div>`);
      }
    });
  }

  async function upgradeReview() {
    const revision = ++upgradeRevision;
    const oldForm = doc.querySelector('.cartera-dialog [data-pdf-review]:not([data-semantic-boundary="014"])');
    if (!oldForm || !lastReview || !activeAdapter) return;
    oldForm.dataset.semanticBoundary = '014-pending';
    const body = oldForm.closest('.cartera-dialog__body');
    if (!body) return;

    const directoryPeople = await people();
    if (revision !== upgradeRevision || !body.isConnected) return;
    body.innerHTML = semanticReviewHtml(lastReview, directoryPeople);
    const form = body.querySelector('[data-pdf-review]');
    if (!form) return;
    form.dataset.semanticBoundary = '014';
    bindSemanticForm(form, lastReview);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => { void upgradeReview(); });
    observer.observe(doc.body, { childList: true, subtree: true });
  }

  function stopObserver() {
    observer?.disconnect();
    observer = null;
    peoplePromise = null;
    lastReview = null;
    activeAdapter = null;
  }

  return Object.freeze({
    ...base,
    async mount() {
      startObserver();
      await base.mount?.();
    },
    async reload() {
      return base.reload?.();
    },
    async scrub() {
      stopObserver();
      return base.scrub?.();
    },
    async unmount() {
      stopObserver();
      return base.unmount?.();
    },
    async destroy() {
      stopObserver();
      return base.destroy?.();
    },
  });
}