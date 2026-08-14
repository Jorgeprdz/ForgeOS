import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { renderCartera050FutureRadar } from '../../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const auraTokens = await readFile('docs/static-preview/forge-aura/aura-tokens.css', 'utf8');
const auraShell = await readFile('docs/static-preview/forge-aura/aura-shell.css', 'utf8');

const baseSignal = Object.freeze({
  signalReference: 'CARTERA050:PAYMENT:PERSON-1', personReference: 'PERSON:1', personDisplayName: 'PERSONA DE PRUEBA', policyReference: 'POLICY:1',
  signalType: 'UNCONFIRMED_PAYMENT_EVIDENCE', eventDate: '2026-08-13', horizon: 'TODAY', truthClass: 'RECOMMENDATION', sourceAuthority: 'PAYMENT_OBLIGATION', sourceRecordReference: 'PAYMENT:1',
  whyThisPerson: 'Existe una obligación de pago gobernada para esta persona.', whyNow: 'La fecha operativa corresponde al día actual.', evidenceSummary: ['Pago programado', 'Evidencia pendiente de confirmar'], uncertainty: 'No confirma que el pago haya ocurrido.', smallestUsefulAction: 'Revisar la evidencia de pago.', advisorConfirmationRequired: true, readOnly: true,
});
const secondSignal = Object.freeze({ ...baseSignal, signalReference: 'CARTERA050:REVIEW:PERSON-1', signalType: 'RELATIONSHIP_REVIEW_DUE', sourceAuthority: 'RELATIONSHIP_MEMORY', sourceRecordReference: 'RELATIONSHIP:1', evidenceSummary: ['Última revisión registrada'], whyNow: 'La revisión de relación está vencida.', smallestUsefulAction: 'Revisar la relación antes de decidir el siguiente paso.' });
const radar = Object.freeze({ items: Object.freeze([baseSignal, secondSignal]), focusItems: Object.freeze([baseSignal, secondSignal]), summary: Object.freeze({ byHorizon: Object.freeze({ TODAY: 2, NEXT_7_DAYS: 0, NEXT_30_DAYS: 0, NEXT_90_DAYS: 0, CONFIRMATION_REQUIRED: 0, OVERDUE: 0 }) }), sourceAvailability: Object.freeze({ policyPayment: 'AVAILABLE', relationshipMemory: 'AVAILABLE', documentIntake: 'AVAILABLE', conservationIntelligence: 'NOT_CONNECTED', compensationIntelligence: 'NOT_CONNECTED' }) });
const viewports = [{ name: 'DESKTOP', width: 1440, height: 900 },{ name: 'DEX', width: 1920, height: 1080 },{ name: 'MOBILE', width: 390, height: 844 }];

for (const viewport of viewports) {
  test(`${viewport.name}: one person owns two Aura-native signals without overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const html = renderCartera050FutureRadar({ status: 'READY', radar, horizon: 'ALL', actionableSignalReference: baseSignal.signalReference, decisionState: null, presentationState: 'PERSISTED', operationState: null });
    await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${auraTokens}\n${auraShell}\nhtml,body{margin:0;max-width:100%;overflow-x:hidden}body{padding:16px;background:var(--surface,#f4f5fb)}*{box-sizing:border-box}</style></head><body>${html}</body></html>`);

    await expect(page.locator('[data-radar-person-reference="PERSON:1"]')).toHaveCount(1);
    await expect(page.locator('[data-radar-signal-reference]')).toHaveCount(2);
    await expect(page.getByText('2 cosas para revisar')).toBeVisible();
    await expect(page.getByText('Pago por confirmar')).toBeVisible();
    await expect(page.getByText('Revisión de relación')).toBeVisible();
    await expect(page.getByText('Requiere revisión')).toHaveCount(1);
    await expect(page.getByText('CONFIRMAR', { exact: true })).toHaveCount(0);
    await expect(page.locator('.radar002-evidence summary').first()).toHaveText('Ver evidencia');

    const actionable = page.locator(`[data-radar-signal-reference="${baseSignal.signalReference}"]`);
    for (const decision of ['ACCEPT','MODIFY','DEFER','DISMISS']) await expect(actionable.locator(`[data-radar-decision="${decision}"][data-radar-signal="${baseSignal.signalReference}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-radar-signal-reference="${secondSignal.signalReference}"] [data-radar-decision]`)).toHaveCount(0);

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
      personRight: document.querySelector('[data-radar-person-reference]')?.getBoundingClientRect().right ?? 0,
      buttonRadius: getComputedStyle(document.querySelector('[data-radar-decision="ACCEPT"]')).borderRadius,
      chipHeight: document.querySelector('[data-radar-horizon="TODAY"]')?.getBoundingClientRect().height ?? 0,
      refreshHeight: document.querySelector('[data-radar-refresh]')?.getBoundingClientRect().height ?? 0,
    }));
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.personRight).toBeLessThanOrEqual(geometry.innerWidth + 0.5);
    expect(geometry.buttonRadius).not.toBe('0px');
    expect(geometry.chipHeight).toBeGreaterThanOrEqual(40);
    expect(geometry.refreshHeight).toBeGreaterThanOrEqual(40);
  });
}

test('exact document packet gets Review; policy-level lineage gets review badge only', async ({ page }) => {
  const packet = Object.freeze({ ...secondSignal, signalReference:'CARTERA050:DOC:PACKET', signalType:'INCOMPLETE_POLICY_DATA', sourceAuthority:'DOCUMENT_INTAKE', sourceRecordReference:'POLICY_PACKET:AURA:abc' });
  const policyOnly = Object.freeze({ ...secondSignal, signalReference:'CARTERA050:DOC:POLICY', signalType:'INCOMPLETE_POLICY_DATA', sourceAuthority:'DOCUMENT_INTAKE', sourceRecordReference:'POLICY:abc' });
  const model = { ...radar, items:[packet,policyOnly], focusItems:[packet,policyOnly], summary:{byHorizon:{TODAY:2,NEXT_7_DAYS:0,NEXT_30_DAYS:0,NEXT_90_DAYS:0,CONFIRMATION_REQUIRED:0,OVERDUE:0}} };
  await page.setContent(renderCartera050FutureRadar({ status:'READY', radar:model, horizon:'ALL' }));
  await expect(page.locator('[data-radar-review-packet="POLICY_PACKET:AURA:abc"]')).toHaveCount(1);
  await expect(page.locator('[data-open-policy="POLICY_PACKET:AURA:abc"]')).toHaveText('Revisar');
  await expect(page.locator('[data-radar-signal-reference="CARTERA050:DOC:POLICY"] .radar002-badge')).toHaveText('Requiere revisión');
  await expect(page.locator('[data-radar-signal-reference="CARTERA050:DOC:POLICY"] [data-radar-review-packet]')).toHaveCount(0);
});
