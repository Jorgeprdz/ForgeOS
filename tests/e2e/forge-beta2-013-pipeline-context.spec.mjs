import { expect, test } from '@playwright/test';

const record = Object.freeze({
  id: 'p-context-013',
  fullName: 'Prospecto Contexto',
  status: 'contacted',
  stageLabel: 'Contactado',
  sourceValue: 'Referido',
  sourceSummary: 'Referido',
  phone: '+525511111111',
  productInterest: 'Protección',
  latestActivity: { label: 'Llamada', occurredAt: '2026-08-10T18:00:00-06:00' },
  nextCommitment: null,
  timelineState: 'CONNECTED',
  prospect: {
    id: 'p-context-013',
    fullName: 'Prospecto Contexto',
    source: 'Referido',
    initialContext: 'Solicitó revisar opciones de protección.',
    phone: '+525511111111',
  },
});

function relationshipComposition() {
  return {
    contractType: 'FORGE_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION',
    contractVersion: 'CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001',
    personReference: 'PERSON:SYNTHETIC:013',
    itemCount: 2,
    reviewCount: 1,
    domains: {
      FUTURE_RADAR: {
        id: 'FUTURE_RADAR',
        label: 'Radar futuro',
        authority: 'CARTERA050_FUTURE_RADAR_READ_MODEL',
        scope: 'PERSON',
        status: 'AVAILABLE',
        items: [{
          reference: 'FUTURE:013:1',
          label: 'Cambio familiar por revisar',
          summary: 'Existe un evento futuro registrado que puede cambiar el contexto de la conversación.',
          state: 'REVIEW_REQUIRED',
          scope: 'PERSON',
          uncertainty: 'La fecha exacta todavía no está confirmada.',
          smallestUsefulAction: 'Confirmar si el evento sigue vigente',
          evidenceCount: 2,
          deepLink: '?nav=person&person=PERSON%3ASYNTHETIC%3A013',
        }],
      },
      PRODUCTIVITY_PROOF: {
        id: 'PRODUCTIVITY_PROOF',
        label: 'Evidencia de productividad',
        authority: 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL',
        scope: 'ADVISOR',
        status: 'AVAILABLE',
        items: [{
          reference: 'PRODUCTIVITY:013:1',
          label: 'Actividad reciente del asesor',
          summary: 'Existe actividad comercial reciente relacionada con este periodo.',
          state: 'OBSERVED',
          scope: 'ADVISOR',
          uncertainty: null,
          smallestUsefulAction: 'Revisar el detalle antes de usarlo como contexto',
          evidenceCount: 1,
          deepLink: '?nav=person&person=PERSON%3ASYNTHETIC%3A013',
        }],
      },
    },
    boundaries: {
      existingCarteraIntelligenceReused: true,
      secondScoreEngine: false,
      automaticContact: false,
      localMutationControls: false,
    },
  };
}

async function mount(page, { intelligence = 'none' } = {}) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-intent/index.html');
  await page.evaluate(async ({ record, intelligence }) => {
    const { createPipelineModule } = await import(
      `/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js?acceptance=${Date.now()}`
    );
    const root = document.querySelector('#root');
    root.innerHTML = '';
    let cards = [structuredClone(record)];
    const adapter = {
      capabilities: {
        createProspect: true,
        importProspects: false,
        intelligenceAvailable: intelligence !== 'none',
        relationshipIntelligenceAvailable: intelligence === 'relationship',
        existingCarteraIntelligenceReused: intelligence === 'relationship',
      },
      reload: async () => cards,
      getCards: () => cards,
      create: async () => null,
      update: async () => cards[0],
      archive: async () => null,
      changeStage: async () => cards[0],
      timeline: async () => [],
      whatsappUrl: () => null,
    };
    if (intelligence !== 'none') {
      adapter.intelligence = async prospectId => ({
        consumerId: 'FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A',
        state: 'partial',
        identityState: 'LINKED',
        personReference: 'PERSON:SYNTHETIC:013',
        opportunityAuthorityState: 'NOT_PRODUCTIVE',
        degradedReasons: intelligence === 'relationship'
          ? ['OPPORTUNITY_AUTHORITY_NOT_PRODUCTIVE', 'NO_AUTHORIZED_PROJECTIONS']
          : [],
        provenance: { sourceAuthorities: ['PIPELINE', 'RELATIONSHIP_INTELLIGENCE'] },
        relationshipIntelligence: intelligence === 'relationship' ? {
          contractType: 'FORGE_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION',
          contractVersion: 'CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001',
          personReference: 'PERSON:SYNTHETIC:013',
          itemCount: 2,
          reviewCount: 1,
          domains: {
            FUTURE_RADAR: {
              id: 'FUTURE_RADAR', scope: 'PERSON', status: 'AVAILABLE', items: [{
                reference: 'FUTURE:013:1', label: 'Cambio familiar por revisar',
                summary: 'Existe un evento futuro registrado que puede cambiar el contexto de la conversación.',
                state: 'REVIEW_REQUIRED', scope: 'PERSON',
                uncertainty: 'La fecha exacta todavía no está confirmada.',
                smallestUsefulAction: 'Confirmar si el evento sigue vigente', evidenceCount: 2,
                deepLink: '?nav=person&person=PERSON%3ASYNTHETIC%3A013',
              }],
            },
            PRODUCTIVITY_PROOF: {
              id: 'PRODUCTIVITY_PROOF', scope: 'ADVISOR', status: 'AVAILABLE', items: [{
                reference: 'PRODUCTIVITY:013:1', label: 'Actividad reciente del asesor',
                summary: 'Existe actividad comercial reciente relacionada con este periodo.',
                state: 'OBSERVED', scope: 'ADVISOR', uncertainty: null,
                smallestUsefulAction: 'Revisar el detalle antes de usarlo como contexto', evidenceCount: 1,
                deepLink: '?nav=person&person=PERSON%3ASYNTHETIC%3A013',
              }],
            },
          },
        } : null,
        projections: intelligence === 'projection' ? [{
          decisionReference: `DECISION:${prospectId}:013`,
          domain: 'RELACIÓN',
          title: 'Conviene revisar el contexto familiar',
          whyNow: 'Hay información reciente del prospecto que puede cambiar la conversación.',
          truthState: 'SUPPORTED',
          humanDecisionRequired: true,
          provenance: { sourceAuthorities: ['RELATIONSHIP_INTELLIGENCE'] },
          recommendedAction: { label: 'Revisar la información antes de contactar' },
        }] : [],
      });
    }
    const module = createPipelineModule({
      root,
      client: {},
      adapterFactory: async () => adapter,
      nowProvider: () => new Date('2026-08-10T21:59:00-06:00'),
      windowRef: window,
    });
    await module.mount();
    window.__pipelineContext013 = module;
  }, { record, intelligence });
  await expect(page.locator('[data-record-id="p-context-013"]')).toBeVisible();
}

test('RU07 Level 3: unavailable context presents a clear no-action state with no dead CTA', async ({ page }) => {
  await mount(page, { intelligence: 'none' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'false');
  await expect(recommendation).toContainText('No hay contexto adicional disponible');
  await expect(recommendation.locator('[data-pipeline-governed-context]')).toHaveCount(0);
});

test('RU07/RU06 Level 3: actionable FCDP context opens, explains itself, and hides mechanics by default', async ({ page }) => {
  await mount(page, { intelligence: 'projection' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'true');
  const button = recommendation.getByRole('button', { name: 'Ver contexto', exact: true });
  await expect(button).toBeVisible();
  await button.click();

  const dialog = page.locator('[data-aura-governed-context-dialog]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Lo que Forge puede explicar de este prospecto');
  await expect(dialog).toContainText('Conviene revisar el contexto familiar');
  await expect(dialog).toContainText('Tú decides si hacerlo');

  const primary = await dialog.evaluate(node => node.innerText);
  expect(primary).not.toMatch(/CRS-03|FCDP-004-001|CommercialPerson|Opportunity authority|FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A|RELATIONSHIP_INTELLIGENCE|truthState|sourceAuthorities/i);

  const technical = dialog.locator('[data-pipeline-context-technical]').first();
  await expect(technical).toBeVisible();
  await expect(technical).not.toHaveAttribute('open', '');
  await expect(technical.locator('summary')).toHaveText('Información técnica');
  await technical.locator('summary').click();
  await expect(technical).toHaveAttribute('open', '');
  await expect(technical).toContainText('FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A');
  await expect(technical).toContainText('CommercialPerson');
});

test('RU04 Level 3: CRS10 context preserves meaning, uncertainty, evidence and human control without inventing FCDP', async ({ page }) => {
  await mount(page, { intelligence: 'relationship' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'true');
  await recommendation.getByRole('button', { name: 'Ver contexto', exact: true }).click();

  const dialog = page.locator('[data-aura-governed-context-dialog]');
  const relationship = dialog.locator('[data-pipeline-relationship-context="AVAILABLE"]');
  await expect(relationship).toBeVisible();
  await expect(relationship).toContainText('Lo que ya sabemos de la relación');
  await expect(relationship).toContainText('Cambio familiar por revisar');
  await expect(relationship).toContainText('La fecha exacta todavía no está confirmada.');
  await expect(relationship).toContainText('Confirmar si el evento sigue vigente. Tú decides si hacerlo.');
  await expect(relationship).toContainText('2 evidencia(s)');
  await expect(relationship).toContainText('Contexto del asesor: esto habla de tu actividad y no se atribuye al prospecto.');
  await expect(relationship.locator('[data-pipeline-crs10-deep-link]').first()).toHaveAttribute('href', /\?nav=person/);
  await expect(dialog.locator('[data-aura-governed-projections="EMPTY"]')).toHaveCount(0);

  const defaultText = await relationship.evaluate(node => node.innerText);
  expect(defaultText).not.toMatch(/CRS-10|CARTERA050|CARTERA100|relationshipScore|priorityScore|NO_AUTHORIZED_PROJECTIONS/i);

  const technical = relationship.locator('[data-pipeline-crs10-technical]');
  await expect(technical).not.toHaveAttribute('open', '');
  await technical.locator('summary').click();
  await expect(technical).toContainText('CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001');
  await expect(technical).toContainText('No crea score');
});
