import { expect, test } from '@playwright/test';

async function mount(page, { canonical = 0, evidence = 0 } = {}) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-ru10-policy-evidence/index.html');
  await page.evaluate(async ({ canonical, evidence }) => {
    const root = document.querySelector('#root');
    root.innerHTML = `
      <div class="cartera-workspace">
        <section class="cartera-section" aria-labelledby="coverage-title">
          <h2 id="coverage-title">Coberturas</h2>
          <p>Beneficios contratados como hijos independientes de la póliza.</p>
          ${canonical > 0
            ? `<div class="coverage-list">${Array.from({ length: canonical }, (_, index) => `<article class="coverage-row">Confirmada ${index + 1}</article>`).join('')}</div>`
            : '<div class="cartera-warning">No hay detalle de coberturas confirmado. Esto no significa que la póliza no tenga coberturas.</div>'}
          <button type="button" data-add-coverage>Agregar cobertura revisada</button>
        </section>
        <section class="cartera-section" data-policy-evidence-recovery data-contract-recovery="010j">
          <h2>Información encontrada en el documento</h2>
          ${evidence > 0
            ? `<div data-evidence-coverages><div class="coverage-list">${Array.from({ length: evidence }, (_, index) => `<article class="coverage-row">Encontrada ${index + 1}</article>`).join('')}</div></div>`
            : ''}
        </section>
      </div>`;
    const { reconcilePolicyEvidencePresentation } = await import(
      `/docs/static-preview/forge-aura/cartera/cartera-policy-evidence-presentation-013.js?acceptance=${Date.now()}`
    );
    reconcilePolicyEvidencePresentation(root);
  }, { canonical, evidence });
}

test('BUG04 document-found coverages are visible and explicitly pending review', async ({ page }) => {
  await mount(page, { canonical: 0, evidence: 2 });
  const summary = page.locator('[data-policy-evidence-truth-state="DOCUMENT_EVIDENCE_ONLY"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Encontramos 2 coberturas en tu póliza');
  await expect(summary).toContainText('Revísalas para confirmar que estén correctas');
  await expect(summary).toContainText('no como coberturas confirmadas');
  await expect(page.locator('section[aria-labelledby="coverage-title"] .cartera-warning')).toContainText('Encontramos 2 coberturas en el documento');
  await expect(page.locator('[data-add-coverage]')).toHaveText('Revisar coberturas');
  await expect(page.locator('[data-evidence-coverages] .coverage-row')).toHaveCount(2);
});

test('BUG04 confirmed and document-found coverages coexist without contradiction', async ({ page }) => {
  await mount(page, { canonical: 1, evidence: 2 });
  const summary = page.locator('[data-policy-evidence-truth-state="CANONICAL_AND_DOCUMENT_EVIDENCE"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Hay 1 cobertura confirmada y 2 encontradas en el documento');
  await expect(summary).toContainText('Las confirmadas forman parte de la póliza');
  await expect(summary).toContainText('sin confundirlas con información ya confirmada');
  const visibleText = await summary.innerText();
  expect(visibleText).not.toMatch(/Policy Truth|verdad canónica|evidencia documental/i);
  await expect(page.locator('section[aria-labelledby="coverage-title"] .coverage-row')).toHaveCount(1);
  await expect(page.locator('[data-evidence-coverages] .coverage-row')).toHaveCount(2);
});

test('LAW ZERO absence of rows remains unknown and never becomes zero coverage truth', async ({ page }) => {
  await mount(page, { canonical: 0, evidence: 0 });
  const summary = page.locator('[data-policy-evidence-truth-state="NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Todavía no tenemos detalle de coberturas para mostrar');
  await expect(summary).toContainText('Esto no significa que la póliza no tenga coberturas');
  await expect(summary).not.toContainText('0 coberturas');
});
