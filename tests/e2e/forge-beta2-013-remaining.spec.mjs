import { expect, test } from '@playwright/test';

async function fixture(page) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-intent/index.html');
  return page.locator('#root');
}

test('RU10 browser: one human state reconciles canonical coverages and document evidence', async ({ page }) => {
  const root = await fixture(page);
  const cases = [
    ['DOCUMENT_EVIDENCE_ONLY', false, true, 'Encontramos 1 cobertura en tu póliza'],
    ['CANONICAL_AND_DOCUMENT_EVIDENCE', true, true, 'Hay 1 cobertura confirmada y 1 encontrada en el documento'],
    ['CANONICAL_ONLY', true, false, 'Hay 1 cobertura confirmada en la póliza'],
    ['NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS', false, false, 'Todavía no tenemos detalle de coberturas para mostrar'],
  ];
  for (const [state, canonical, evidence, copy] of cases) {
    await page.evaluate(async ({ canonical, evidence }) => {
      const root = document.querySelector('#root');
      root.innerHTML = `<div class="cartera-workspace">
        <section class="cartera-section"><h2 id="coverage-title">Coberturas</h2>${canonical ? '<div class="coverage-row">Vida</div>' : '<div class="cartera-warning">No hay detalle de coberturas confirmado.</div>'}</section>
        <section data-policy-evidence-recovery>${evidence ? '<div data-evidence-coverages><div class="coverage-row">Vida documental</div></div>' : '<p>Sin filas documentales</p>'}</section>
      </div>`;
      const module = await import(`/docs/static-preview/forge-aura/cartera/cartera-policy-evidence-presentation-013.js?test=${Date.now()}`);
      module.reconcilePolicyEvidencePresentation(root);
    }, { canonical, evidence });
    const summary = root.locator('[data-policy-evidence-truth-state]');
    await expect(summary).toHaveAttribute('data-policy-evidence-truth-state', state);
    await expect(summary).toContainText(copy);
  }
});

test('RU11 browser: Home primary UI removes engine jargon while technical provenance stays closed', async ({ page }) => {
  const root = await fixture(page);
  await page.evaluate(async () => {
    const root = document.querySelector('#root');
    root.innerHTML = `<section class="home-aura">
      <p class="home-attention-summary">2 señales gobernadas requieren tu revisión.</p>
      <article class="home-alfred-card" data-state="EMPTY">
        <div class="home-alfred-copy"><p class="home-mini-label">ALFRED</p><h2>No hay una señal gobernada que exija atención</h2><p>Decision Projection no entregó elementos activos.</p>
          <div class="home-alfred-actions"><details><summary>Ver por qué</summary><p>Estado de atención: EMPTY.</p></details></div>
        </div>
      </article>
      <div class="home-cartera-copy"><details><summary>Ver por qué</summary><p>Hay una fecha por revisar.</p><p><b>Verdad:</b> CONFIRMED · <b>Fuente:</b> FUTURE_RADAR</p><p><b>Incertidumbre:</b> La fecha exacta.</p></details></div>
      <p class="home-truth-note">Inicio transporta Decision Projection → Attention.</p>
    </section>`;
    const module = await import(`/docs/static-preview/forge-aura/home/home-human-presentation-013.js?test=${Date.now()}`);
    module.normalizeHomePresentation(root);
  });
  await expect(root.locator('.home-attention-summary')).toHaveText('2 asuntos requieren tu revisión.');
  await expect(root.locator('.home-alfred-card h2')).toContainText('No hay algo adicional');
  await expect(root.locator('.home-truth-note')).not.toContainText('Decision Projection');
  await expect(root.locator('.home-cartera-copy > details > summary')).toHaveText('Por qué conviene revisarlo');
  const technical = root.locator('.home-cartera-copy [data-home-technical-disclosure]');
  await expect(technical).not.toHaveAttribute('open', '');
  const visible = await root.evaluate(node => node.innerText);
  expect(visible).not.toMatch(/Decision Projection|FHAO-007-001|señal gobernada|FUTURE_RADAR/);
  await expect(technical).toContainText('FUTURE_RADAR');
});

test('RU12 browser: shared presentation contract only translates supplied context', async ({ page }) => {
  await fixture(page);
  const result = await page.evaluate(async () => {
    const module = await import(`/docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js?test=${Date.now()}`);
    return {
      state: module.humanStateLabel('REVIEW_REQUIRED'),
      evidence: module.humanEvidenceLabel(2),
      copy: module.humanContextCopy({ summary: 'Dato existente', uncertainty: 'Falta fecha', smallestUsefulAction: 'Revisar documento' }),
      diagnostics: module.presentationDiagnostics(),
    };
  });
  expect(result.state).toBe('Por revisar');
  expect(result.evidence).toBe('2 datos disponibles para revisar');
  expect(result.copy).toEqual({ summary: 'Dato existente', uncertainty: 'Falta fecha', smallestUsefulAction: 'Revisar documento' });
  expect(result.diagnostics.callsNash).toBe(false);
  expect(result.diagnostics.createsTruth).toBe(false);
  expect(result.diagnostics.createsRecommendation).toBe(false);
});
