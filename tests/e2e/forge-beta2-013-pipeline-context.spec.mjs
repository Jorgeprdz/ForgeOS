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

async function mount(page, { intelligence = 'none' } = {}) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-intent/index.html');
  await page.evaluate(async ({ record, intelligence }) => {
    await import(`/docs/static-preview/forge-aura/recomposition/governed-context-presentation-014.js?acceptance=${Date.now()}`);
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

test('context unavailable presents a clear no-action state with no dead CTA', async ({ page }) => {
  await mount(page, { intelligence: 'none' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'false');
  await expect(recommendation).toContainText('No hay contexto adicional disponible');
  await expect(recommendation.locator('[data-pipeline-governed-context]')).toHaveCount(0);
});

test('BUG05 governed context is human-facing, wide and hides architecture mechanics', async ({ page }) => {
  await mount(page, { intelligence: 'projection' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'true');
  await recommendation.getByRole('button', { name: 'Ver contexto', exact: true }).click();

  const layer = page.locator('[data-aura-governed-context-dialog]');
  const dialog = layer.locator('.aura-governed-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Información útil para decidir el siguiente paso');
  await expect(dialog).toContainText('Conviene revisar el contexto familiar');
  const primary = await dialog.innerText();
  expect(primary).not.toMatch(/CRS-03|FCDP-004-001|CommercialPerson|Opportunity authority|FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A|RELATIONSHIP_INTELLIGENCE|truthState|sourceAuthorities/i);

  const technical = dialog.locator('[data-pipeline-context-technical]').first();
  await expect(technical).toBeHidden();

  const geometry = await dialog.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const body = node.querySelector('.aura-dialog__body');
    return {
      width: rect.width,
      viewport: window.innerWidth,
      bodyOverflowX: getComputedStyle(body).overflowX,
      bodyScrollWidth: body.scrollWidth,
      bodyClientWidth: body.clientWidth,
    };
  });
  expect(geometry.width).toBeGreaterThan(Math.min(720, geometry.viewport * 0.65));
  expect(geometry.bodyOverflowX).toBe('hidden');
  expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(geometry.bodyClientWidth + 2);
});

test('BUG03/06 CRS10 context preserves meaning and uncertainty without repeated technical explanation', async ({ page }) => {
  await mount(page, { intelligence: 'relationship' });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await recommendation.getByRole('button', { name: 'Ver contexto', exact: true }).click();

  const dialog = page.locator('[data-aura-governed-context-dialog]');
  const relationship = dialog.locator('[data-pipeline-relationship-context="AVAILABLE"]');
  await expect(relationship).toBeVisible();
  await expect(relationship).toContainText('Seguimiento con esta persona');
  await expect(relationship).toContainText('Cambio familiar por revisar');
  await expect(relationship).toContainText('La fecha exacta todavía no está confirmada.');
  await expect(relationship).toContainText('Confirmar si el evento sigue vigente');
  await expect(relationship).toContainText('Sobre tu actividad:');
  await expect(relationship.locator('[data-pipeline-crs10-deep-link]').first()).toHaveAttribute('href', /\?nav=person/);
  await expect(dialog.locator('[data-aura-governed-projections="EMPTY"]')).toHaveCount(0);
  await expect(dialog.locator('[data-pipeline-crs10-technical]')).toBeHidden();

  const visible = await dialog.innerText();
  expect(visible).not.toMatch(/CRS-10|CARTERA050|CARTERA100|relationshipScore|priorityScore|NO_AUTHORIZED_PROJECTIONS|CommercialPerson|source-owner|evidencia/i);
  expect((visible.match(/Seguimiento con esta persona/g) || []).length).toBe(1);
});

test('015R decision context shows one concise conclusion for each governed state', async ({ page }) => {
  for (const scenario of [
    { mode: 'projection', state: 'CONTEXT_SUFFICIENT', file: 'sufficient', conclusion: 'Conviene revisar el contexto familiar', action: 'Revisar la información antes de contactar' },
    { mode: 'relationship', state: 'CONTEXT_INCOMPLETE_BUT_ACTIONABLE', file: 'incomplete-actionable', conclusion: 'Falta completar una parte del contexto', action: 'Completar información' },
    { mode: 'empty', state: 'CONTEXT_INSUFFICIENT', file: 'insufficient', conclusion: 'No tengo suficiente información para recomendar el siguiente paso todavía.', action: 'Completar información' },
  ]) {
    await mount(page, { intelligence: scenario.mode });
    await page.locator('[data-record-id="p-context-013"] [data-pipeline-governed-context]').click();
    const dialog = page.locator('[data-aura-governed-context-dialog]');
    const summary = dialog.locator(`[data-consumer-state="${scenario.state}"]`);
    await expect(summary).toBeAttached();
    if (scenario.state === 'CONTEXT_SUFFICIENT') await expect(summary).toBeHidden();
    else await expect(summary).toBeVisible();
    await expect(dialog).toContainText(scenario.conclusion);
    await expect(dialog).toContainText(scenario.action);
    await expect(dialog.locator('[data-pipeline-context-technical]')).toBeHidden();
    const visible = await dialog.innerText();
    expect(visible).not.toMatch(/read-model|canonical|CommercialPerson|sourceAuthorities|truthState|FORGE_PIPELINE/i);
    if (scenario.state === 'CONTEXT_INSUFFICIENT') {
      expect((visible.match(/suficiente información/gi) || []).length).toBe(1);
      await expect(dialog.locator('[data-aura-governed-projections="EMPTY"]')).toHaveCount(0);
    }
    await dialog.locator('.aura-governed-dialog').screenshot({ path: `artifacts/forge-decision-context-015r-${scenario.file}.png` });
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  }
});
