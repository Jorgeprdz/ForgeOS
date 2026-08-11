import { expect, test } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/forge-beta2-013-intent/index.html';

async function mountQuoteLifecycle(page) {
  await page.goto(fixture);
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main data-forge-module="dedicated-new-quote-static-route" data-forge-intake-state="empty">
        <section class="fq-upload-105dr">
          <label for="fq-solution-online-pdf-105dr">Seleccionar PDF</label>
          <input id="fq-solution-online-pdf-105dr" type="file">
          <button class="fq-send-pdf-105dr" type="button" disabled hidden aria-disabled="true">Revisar resultado</button>
          <span class="fq-file-status-105dr" role="status">Selecciona un archivo para comenzar.</span>
        </section>
        <div data-forge-intake-results hidden aria-hidden="true"><p>Resultado extraído</p></div>
      </main>`;

    const submit = document.querySelector('.fq-send-pdf-105dr');
    const status = document.querySelector('.fq-file-status-105dr');
    let candidateReady = false;
    window.__reviewClickCount014 = 0;
    window.ForgeQuoteCalculators = {};
    window.ForgeNuevaCotizacionAcceptedQuoteRuntime = { submit, status };
    window.ForgeAcceptedQuoteBridge = {
      getCurrentQuotePreviewCalculationState() {
        return { candidateReady, state: 'CALCULATING_PREVIEW' };
      },
    };
    submit.addEventListener('click', () => {
      window.__reviewClickCount014 += 1;
      if (document.querySelector('[data-quote-preview-confirmation-popup="true"]')) return;
      const popup = document.createElement('div');
      popup.dataset.quotePreviewConfirmationPopup = 'true';
      popup.setAttribute('role', 'dialog');
      popup.textContent = 'Revisión humana abierta';
      document.body.append(popup);
    });
    setTimeout(() => { candidateReady = true; }, 20);
  });
  await page.addScriptTag({ url: '/docs/static-preview/quote-runtime/forge-quote-intake-state.js?v=014-browser' });
}

test('BUG01 extracted PDF opens existing human review even while calculation is pending', async ({ page }) => {
  await mountQuoteLifecycle(page);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('forge:accepted-quote-packet-ready', {
      detail: { packet: { id: 'PDF-014', nativeResult: {}, context: {} } },
    }));
  });

  await expect(page.locator('[data-quote-preview-confirmation-popup="true"]')).toBeVisible();
  await expect(page.locator('.fq-file-status-105dr')).toHaveText('Datos encontrados. Revisa la información antes de confirmarla.');
  await expect(page.locator('.fq-send-pdf-105dr')).toBeDisabled();
  const contract = await page.evaluate(() => window.ForgeQuoteIntakeState.repair014);
  expect(contract).toMatchObject({
    opensReviewBeforeCalculationCompletes: true,
    retriesUntilExistingBridgeCanOpen: true,
    usesExistingAcceptanceBridge: true,
    createsQuoteAuthority: false,
    calculatesQuote: false,
    confirmsAutomatically: false,
    persistsAutomatically: false,
  });
});

test('BUG01 retry remains idempotent and does not create duplicate review dialogs', async ({ page }) => {
  await mountQuoteLifecycle(page);
  await page.evaluate(() => {
    const packet = { id: 'PDF-014-IDEMPOTENT', nativeResult: {}, context: {} };
    window.dispatchEvent(new CustomEvent('forge:accepted-quote-packet-ready', { detail: { packet } }));
    setTimeout(() => window.dispatchEvent(new CustomEvent('forge:accepted-quote-packet-ready', { detail: { packet } })), 90);
  });
  await expect(page.locator('[data-quote-preview-confirmation-popup="true"]')).toHaveCount(1);
  await page.waitForTimeout(180);
  await expect(page.locator('[data-quote-preview-confirmation-popup="true"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.__reviewClickCount014)).toBe(1);
});

test('BUG11 visible language gate ignores hidden diagnostics but catches architecture leaked to the advisor', async ({ page }) => {
  await page.goto(fixture);
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main id="surface-014">
        <h1>Seguimiento con cliente</h1>
        <p>Revisa la información antes de continuar.</p>
        <details class="aura-technical-disclosure" hidden><summary>Información técnica</summary><p>CommercialPerson CRS-10 RLS</p></details>
      </main>`;
  });
  await page.addScriptTag({ type: 'module', url: '/docs/static-preview/forge-aura/recomposition/human-language-gate-014.js?v=014-browser' });
  await expect.poll(() => page.evaluate(() => Boolean(window.ForgeAuraHumanLanguageGate014))).toBe(true);

  let result = await page.evaluate(() => window.ForgeAuraHumanLanguageGate014.audit(document.querySelector('#surface-014')));
  expect(result.count).toBe(0);

  await page.evaluate(() => {
    const leak = document.createElement('p');
    leak.id = 'leak-014';
    leak.textContent = 'CommercialPerson con Relationship Intelligence';
    document.querySelector('#surface-014').append(leak);
  });
  result = await page.evaluate(() => window.ForgeAuraHumanLanguageGate014.audit(document.querySelector('#surface-014')));
  expect(result.count).toBeGreaterThan(0);

  await page.evaluate(() => { document.querySelector('#leak-014').textContent = 'Información vinculada con esta persona.'; });
  result = await page.evaluate(() => window.ForgeAuraHumanLanguageGate014.audit(document.querySelector('#surface-014')));
  expect(result.count).toBe(0);
});

test('BUG05 governed context uses available viewport with no horizontal clipping', async ({ page }) => {
  await page.goto(fixture);
  await page.evaluate(() => {
    document.body.innerHTML = `
      <div data-aura-governed-context-dialog="true" style="position:fixed;inset:0;display:grid;place-items:center">
        <section class="aura-governed-dialog">
          <header><h2 id="aura-governed-context-title">Ver contexto</h2></header>
          <div class="aura-dialog__body" data-governed-context-body>
            <section data-pipeline-relationship-context="AVAILABLE">
              <h3>Seguimiento con esta persona</h3>
              <p>Existe información suficiente para revisar el siguiente paso sin repetir explicaciones.</p>
              <div style="width:2000px;max-width:100%">Contenido largo gobernado</div>
            </section>
          </div>
        </section>
      </div>`;
  });
  await page.addScriptTag({ type: 'module', url: '/docs/static-preview/forge-aura/recomposition/governed-context-presentation-014.js?v=014-browser' });

  const geometry = await page.locator('.aura-governed-dialog').evaluate(node => {
    const rect = node.getBoundingClientRect();
    const body = node.querySelector('.aura-dialog__body');
    return {
      width: rect.width,
      viewport: window.innerWidth,
      maxHeight: rect.height,
      bodyClientWidth: body.clientWidth,
      bodyScrollWidth: body.scrollWidth,
      overflowX: getComputedStyle(body).overflowX,
    };
  });
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.width).toBeGreaterThan(Math.min(360, geometry.viewport * 0.7));
  expect(geometry.bodyScrollWidth).toBeLessThanOrEqual(geometry.bodyClientWidth + 2);
  expect(geometry.overflowX).toBe('hidden');
  await expect(page.locator('#aura-governed-context-title')).toHaveText('Información útil para decidir el siguiente paso');
});
