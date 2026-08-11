import { expect, test } from '@playwright/test';

async function mount(page) {
  await page.goto('/tests/e2e/fixtures/forge-beta2-013-ru11-home/index.html');
  await page.evaluate(async () => {
    const root = document.querySelector('#root');
    root.innerHTML = `
      <section class="home-aura" data-home-state="READY">
        <p class="home-attention-summary">2 señales gobernadas requieren tu revisión.</p>
        <div class="home-state"><strong>No pudimos consultar tu agenda</strong><span>Forge no mostrará cero pendientes mientras la proyección canónica no responda.</span></div>
        <div class="home-state"><strong>Sin señales</strong><span>Future Radar confirmó que no hay elementos de atención en la respuesta actual.</span></div>
        <div class="home-cartera-copy">
          <details>
            <summary>Ver por qué</summary>
            <p>Hay una fecha cercana que conviene revisar.</p>
            <p><b>Verdad:</b> REVIEW_REQUIRED · <b>Fuente:</b> CRS_10_RELATIONSHIP_INTELLIGENCE</p>
            <p><b>Incertidumbre:</b> Falta confirmar si la fecha sigue vigente.</p>
          </details>
        </div>
        <article class="home-alfred-card" data-state="EMPTY">
          <div class="home-alfred-copy">
            <p class="home-mini-label">ALFRED</p>
            <h2>No hay una señal gobernada que exija atención</h2>
            <p>Decision Projection no entregó elementos activos en la composición actual.</p>
            <div class="home-alfred-actions">
              <details><summary>Ver por qué</summary><p>Estado de atención: EMPTY.</p></details>
            </div>
          </div>
        </article>
        <p class="home-truth-note">Inicio transporta Decision Projection → Attention. No crea tareas.</p>
      </section>`;
    const { normalizeHomePresentation } = await import(
      `/docs/static-preview/forge-aura/home/home-human-presentation-013.js?acceptance=${Date.now()}`
    );
    normalizeHomePresentation(root);
  });
}

test('RU11 primary Home copy becomes advisor-facing and removes architecture vocabulary', async ({ page }) => {
  await mount(page);
  await expect(page.locator('.home-attention-summary')).toHaveText('2 asuntos requieren tu revisión.');
  await expect(page.locator('.home-state').first()).toContainText('La agenda no respondió');
  await expect(page.locator('.home-state').nth(1)).toContainText('No hay elementos adicionales que requieran revisión');
  await expect(page.locator('.home-alfred-card h2')).toHaveText('No hay algo adicional que requiera tu atención ahora');
  await expect(page.locator('.home-truth-note')).toContainText('Inicio resume información de las fuentes conectadas');

  const primaryText = await page.locator('.home-aura').evaluate(node => {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('[data-home-technical-disclosure]').forEach(item => item.remove());
    return clone.textContent || '';
  });
  expect(primaryText).not.toMatch(/Decision Projection|señal(?:es)? gobernada|proyección canónica|owners productivos|Future Radar|Verdad:|Fuente:/i);
});

test('RU11 retains raw source traceability only inside a closed technical disclosure', async ({ page }) => {
  await mount(page);
  const outer = page.locator('.home-cartera-copy > details');
  await expect(outer.locator('summary').first()).toHaveText('Por qué conviene revisarlo');
  const technical = outer.locator('[data-home-technical-disclosure]');
  await expect(technical).toHaveCount(1);
  await expect(technical).not.toHaveAttribute('open', '');
  await expect(technical.locator('summary')).toHaveText('Información técnica');
  await expect(technical).toContainText('CRS_10_RELATIONSHIP_INTELLIGENCE');
  await expect(outer).not.toHaveAttribute('open', '');
});

test('RU11 preserves uncertainty and does not turn presentation into an action or truth engine', async ({ page }) => {
  await mount(page);
  const details = page.locator('.home-cartera-copy > details');
  await details.locator('summary').first().click();
  await expect(details).toContainText('Lo que falta por confirmar: Falta confirmar si la fecha sigue vigente.');
  await expect(page.locator('.home-aura')).toHaveAttribute('data-human-presentation-contract', 'FORGE_HOME_HUMAN_INTERPRETATION_013');
  const disclosures = page.locator('[data-home-technical-disclosure]');
  await expect(disclosures).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(disclosures.nth(index)).not.toHaveAttribute('open', '');
  }
});
