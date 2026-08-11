import {
  humanContextCopy,
  humanEvidenceLabel,
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
      ${advisorScope ? '<p><strong>Contexto del asesor:</strong> esto habla de tu actividad y no se atribuye al prospecto.</p>' : ''}
      ${copy.summary ? `<p>${esc(copy.summary)}</p>` : ''}
      ${copy.uncertainty ? `<p><strong>Lo que falta por confirmar:</strong> ${esc(copy.uncertainty)}</p>` : ''}
      ${copy.smallestUsefulAction ? `<p><strong>Qué podrías revisar:</strong> ${esc(copy.smallestUsefulAction)}. Tú decides si hacerlo.</p>` : ''}
      <p><small>${esc(humanStateLabel(item.state, 'Contexto disponible'))} · ${esc(humanEvidenceLabel(item.evidenceCount))}</small></p>
      ${item.deepLink ? `<p><a href="${esc(item.deepLink)}" data-pipeline-crs10-deep-link>Abrir en Cartera</a></p>` : ''}
    </article>
  `;
}

function technicalHtml(composition) {
  return `
    <details class="aura-technical-disclosure" data-pipeline-crs10-technical>
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
        <h3>La relación está vinculada, pero no hay señales adicionales</h3>
        <p>Forge revisó las fuentes disponibles de Cartera y no encontró información relacional útil para mostrar aquí. No va a completar el espacio con inferencias.</p>
        ${degraded.length ? `<p><small>${esc(degraded.length)} fuente(s) no estuvieron disponibles por completo.</small></p>` : ''}
        ${technicalHtml(composition)}
      </section>
    `;
  }

  return `
    <section class="aura-governed-context-summary" data-pipeline-relationship-context="AVAILABLE">
      <h3>Lo que ya sabemos de la relación</h3>
      <p>Estas señales vienen de información existente en Cartera. Te ayudan a entender el contexto antes de actuar, pero no deciden por ti.</p>
      <div class="aura-governed-projection-list">
        ${pairs.map(({ domain, item }) => itemHtml(domain, item)).join('')}
      </div>
      ${degraded.length ? `<p><small>${esc(degraded.length)} fuente(s) tienen información incompleta o no disponible.</small></p>` : ''}
      ${technicalHtml(composition)}
    </section>
  `;
}

export function pipelinePresentationDiagnostics() {
  return Object.freeze({
    presentation: presentationDiagnostics(),
    relationshipPresentation: 'CRS10_PASSTHROUGH_ONLY',
    createsRelationshipMeaning: false,
  });
}

export { DOMAIN_LABELS };
