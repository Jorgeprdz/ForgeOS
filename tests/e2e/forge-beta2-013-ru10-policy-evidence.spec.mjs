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
            ? `<div class="coverage-list">${Array.from({ length: canonical }, (_, index) => `<article class="coverage-row">Canónica ${index + 1}</article>`).join('')}</div>`
            : '<div class="cartera-warning">No hay detalle de coberturas confirmado. Esto no significa que la póliza no tenga coberturas.</div>'}
        </section>
        <section class="cartera-section" data-policy-evidence-recovery data-contract-recovery="010j">
          <h2>Documento y evidencia recuperada</h2>
          <p>Evidencia ≠ verdad canónica.</p>
          ${evidence > 0
            ? `<div data-evidence-coverages><div class="coverage-list">${Array.from({ length: evidence }, (_, index) => `<article class="coverage-row">Documental ${index + 1}</article>`).join('')}</div></div>`
            : ''}
        </section>
      </div>`;
    const { reconcilePolicyWorkspace } = await import(
      `/docs/static-preview/forge-aura/cartera/cartera-module-v10-013.js?acceptance=${Date.now()}`
    );
    reconcilePolicyWorkspace(root);
  }, { canonical, evidence });
}

test('RU10 document evidence without canonical coverage gets one explicit presentation state', async ({ page }) => {
  await mount(page, { canonical: 0, evidence: 2 });
  const summary = page.locator('[data-policy-evidence-truth-state="DOCUMENT_EVIDENCE_ONLY"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('El documento sí contiene coberturas');
  await expect(summary).toContainText('todavía no hay detalle de coberturas confirmado en la póliza');
  await expect(summary).toContainText('evidencia documental');
  await expect(summary).toContainText('no deben leerse como coberturas contratadas confirmadas');
  await expect(page.locator('[data-evidence-coverages] .coverage-row')).toHaveCount(2);
});

test('RU10 canonical coverage plus document evidence explains authority precedence without hiding either source', async ({ page }) => {
  await mount(page, { canonical: 1, evidence: 2 });
  const summary = page.locator('[data-policy-evidence-truth-state="CANONICAL_AND_DOCUMENT_EVIDENCE"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Policy Truth');
  await expect(summary).toContainText('no crean ni reemplazan coberturas por sí solas');
  await expect(page.locator('section[aria-labelledby="coverage-title"] .coverage-row')).toHaveCount(1);
  await expect(page.locator('[data-evidence-coverages] .coverage-row')).toHaveCount(2);
});

test('RU10 absence of both sources remains unknown, never zero coverage truth', async ({ page }) => {
  await mount(page, { canonical: 0, evidence: 0 });
  const summary = page.locator('[data-policy-evidence-truth-state="NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS"]');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Esto no significa que la póliza no tenga coberturas');
});
