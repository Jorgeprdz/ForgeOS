import {
  humanContextCopy,
  humanStateLabel,
  presentationDiagnostics,
} from './human-context-presentation-013.js?v=forge-beta2-013-human-context';

const DOMAIN_LABELS = Object.freeze({
  FUTURE_RADAR: 'Lo que viene',
  RELATIONSHIP_GROWTH: 'Cómo va la relación',
  RELATIONAL_ACTIVATION: 'Conversaciones por retomar',
  ECONOMIC_CONNECTION: 'Conexiones económicas',
  RELATIONSHIP_CAPITAL: 'Red y relación',
  PRODUCTIVITY_PROOF: 'Contexto de tu actividad',
});

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function domainsOf(composition) {
  return composition?.domains && typeof composition.domains === 'object'
    ? Object.values(composition.domains)
    : [];
}

function visibleItems(composition) {
  return domainsOf(composition).flatMap(domain => (domain?.items || []).map(item => ({ domain, item })));
}

export function hasUsableRelationshipContext(composition) {
  return visibleItems(composition).length > 0;
}

function itemHtml(domain, item) {
  const advisorScope = item.scope === 'ADVISOR';
  const copy = humanContextCopy(item);
  return `
    <article class="aura-governed-projection" data-pipeline-crs10-item="${esc(item.reference)}" data-context-scope="${esc(item.scope || domain.scope || 'PERSON')}">
      <p class="aura-eyebrow">${esc(DOMAIN_LABELS[domain.id] || domain.label || 'Contexto')}</p>
      <h4>${esc(item.label || 'Información para revisar')}</h4>
      ${advisorScope ? '<p><strong>Sobre tu actividad:</strong> esta información corresponde a tu seguimiento y no se atribuye al prospecto.</p>' : ''}
      ${copy.summary ? `<p>${esc(copy.summary)}</p>` : ''}
      ${copy.uncertainty ? `<p><strong>Falta revisar:</strong> ${esc(copy.uncertainty)}</p>` : ''}
      ${copy.smallestUsefulAction ? `<p><strong>Puedes revisar:</strong> ${esc(copy.smallestUsefulAction)}</p>` : ''}
      <p><small>${esc(humanStateLabel(item.state, 'Información disponible'))}</small></p>
      ${item.deepLink ? `<p><a href="${esc(item.deepLink)}" data-pipeline-crs10-deep-link>Abrir en Cartera</a></p>` : ''}
    </article>
  `;
}

function technicalHtml(composition) {
  return `
    <details class="aura-technical-disclosure" data-pipeline-crs10-technical hidden>
      <summary>Información técnica de la relación</summary>
      <dl class="aura-detail">
        <div><dt>Contrato</dt><dd>${esc(composition?.contractVersion || 'CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001')}</dd></div>
        <div><dt>CommercialPerson</dt><dd>${esc(composition?.personReference || 'No informada')}</dd></div>
        <div><dt>Señales</dt><dd>${esc(composition?.itemCount || 0)}</dd></div>
        <div><dt>Por revisar</dt><dd>${esc(composition?.reviewCount || 0)}</dd></div>
      </dl>
      <p>CRS-10 reutiliza las autoridades existentes de Cartera. No crea score, memoria relacional paralela ni acciones automáticas.</p>
    </details>
  `;
}

export function relationshipContextHtml(composition) {
  if (!composition) return '';
  const pairs = visibleItems(composition);
  const degraded = domainsOf(composition).filter(domain => ['DEGRADED', 'UNAVAILABLE'].includes(domain?.status));

  if (!pairs.length) {
    return `
      <section class="aura-inline-empty" data-pipeline-relationship-context="EMPTY">
        <h3>No hay información adicional para esta relación</h3>
        <p>Con la información disponible, Forge no tiene más contexto útil para mostrar aquí. Los datos que falten se mantienen como pendientes de revisión.</p>
        ${degraded.length ? '<p><small>Parte de la información no está disponible en este momento.</small></p>' : ''}
      </section>
    `;
  }

  return `
    <section class="aura-governed-context-summary" data-pipeline-relationship-context="AVAILABLE">
      <h3>Seguimiento con esta persona</h3>
      <p>Esto resume información que ya está vinculada con la persona para ayudarte a revisar el siguiente paso.</p>
      <div class="aura-governed-projection-list">
        ${pairs.map(({ domain, item }) => itemHtml(domain, item)).join('')}
      </div>
      ${degraded.length ? '<p><small>Parte de la información no está disponible en este momento.</small></p>' : ''}
    </section>
  `;
}

export function pipelinePresentationDiagnostics() {
  return Object.freeze({
    presentation: presentationDiagnostics(),
    relationshipPresentation: 'CRS10_PASSTHROUGH_ONLY',
    createsRelationshipMeaning: false,
    technicalDisclosureRendered: false,
  });
}

export { DOMAIN_LABELS, technicalHtml };