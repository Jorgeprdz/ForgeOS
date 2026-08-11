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

async function mount(page, { intelligence = false } = {}) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-intent/index.html');
  await page.evaluate(async ({ record, intelligence }) => {
    const { createPipelineModule } = await import(
      `/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js?acceptance=${Date.now()}`
    );
    const root = document.querySelector('#root');
    root.innerHTML = '';
    let cards = [structuredClone(record)];
    const adapter = {
      capabilities: { createProspect: true, importProspects: false },
      reload: async () => cards,
      getCards: () => cards,
      create: async () => null,
      update: async () => cards[0],
      archive: async () => null,
      changeStage: async () => cards[0],
      timeline: async () => [],
      whatsappUrl: () => null,
    };
    if (intelligence) {
      adapter.intelligence = async prospectId => ({
        consumerId: 'FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A',
        state: 'available',
        identityState: 'CONFIRMED',
        personReference: 'PERSON:SYNTHETIC:013',
        opportunityAuthorityState: 'AVAILABLE',
        degradedReasons: [],
        provenance: { sourceAuthorities: ['PIPELINE', 'RELATIONSHIP_INTELLIGENCE'] },
        projections: [{
          decisionReference: `DECISION:${prospectId}:013`,
          domain: 'RELACIÓN',
          title: 'Conviene revisar el contexto familiar',
          whyNow: 'Hay información reciente del prospecto que puede cambiar la conversación.',
          truthState: 'SUPPORTED',
          humanDecisionRequired: true,
          provenance: { sourceAuthorities: ['RELATIONSHIP_INTELLIGENCE'] },
          recommendedAction: { label: 'Revisar la información antes de contactar' },
        }],
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
  await mount(page, { intelligence: false });
  const recommendation = page.locator('[data-record-id="p-context-013"] .aura-recommendation');
  await expect(recommendation).toHaveAttribute('data-pipeline-context-actionable', 'false');
  await expect(recommendation).toContainText('No hay contexto adicional disponible');
  await expect(recommendation.locator('[data-pipeline-governed-context]')).toHaveCount(0);
});

test('RU07/RU06 Level 3: actionable context opens, explains itself, and hides mechanics by default', async ({ page }) => {
  await mount(page, { intelligence: true });
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
