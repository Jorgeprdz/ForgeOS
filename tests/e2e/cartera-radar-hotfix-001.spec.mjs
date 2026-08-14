import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { renderCartera050FutureRadar } from '../../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const auraTokens = await readFile('docs/static-preview/forge-aura/aura-tokens.css', 'utf8');
const auraShell = await readFile('docs/static-preview/forge-aura/aura-shell.css', 'utf8');

const baseSignal = Object.freeze({
  signalReference: 'CARTERA050:PAYMENT:PERSON-1',
  personReference: 'PERSON:1',
  personDisplayName: 'PERSONA DE PRUEBA',
  policyReference: 'POLICY:1',
  signalType: 'UNCONFIRMED_PAYMENT_EVIDENCE',
  eventDate: '2026-08-13',
  horizon: 'TODAY',
  truthClass: 'RECOMMENDATION',
  sourceAuthority: 'PAYMENT_OBLIGATION',
  sourceRecordReference: 'PAYMENT:1',
  whyThisPerson: 'Existe una obligación de pago gobernada para esta persona.',
  whyNow: 'La fecha operativa corresponde al día actual.',
  evidenceSummary: ['Pago programado', 'Evidencia pendiente de confirmar'],
  uncertainty: 'No confirma que el pago haya ocurrido.',
  smallestUsefulAction: 'Revisar la evidencia de pago.',
  advisorConfirmationRequired: true,
  readOnly: true,
});

const secondSignal = Object.freeze({
  ...baseSignal,
  signalReference: 'CARTERA050:REVIEW:PERSON-1',
  signalType: 'RELATIONSHIP_REVIEW_DUE',
  sourceAuthority: 'RELATIONSHIP_MEMORY',
  sourceRecordReference: 'RELATIONSHIP:1',
  evidenceSummary: ['Última revisión registrada'],
  whyNow: 'La revisión de relación está vencida.',
  smallestUsefulAction: 'Revisar la relación antes de decidir el siguiente paso.',
});

const radar = Object.freeze({
  items: Object.freeze([baseSignal, secondSignal]),
  focusItems: Object.freeze([baseSignal, secondSignal]),
  summary: Object.freeze({
    byHorizon: Object.freeze({
      TODAY: 2,
      NEXT_7_DAYS: 0,
      NEXT_30_DAYS: 0,
      NEXT_90_DAYS: 0,
      CONFIRMATION_REQUIRED: 0,
      OVERDUE: 0,
    }),
  }),
  sourceAvailability: Object.freeze({
    policyPayment: 'AVAILABLE',
    relationshipMemory: 'AVAILABLE',
    documentIntake: 'AVAILABLE',
    conservationIntelligence: 'NOT_CONNECTED',
    compensationIntelligence: 'NOT_CONNECTED',
  }),
});

const viewports = [
  { name: 'DESKTOP', width: 1440, height: 900 },
  { name: 'DEX', width: 1920, height: 1080 },
  { name: 'MOBILE', width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: one person owns two understandable signals without overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const html = renderCartera050FutureRadar({
      status: 'READY',
      radar,
      horizon: 'ALL',
      actionableSignalReference: baseSignal.signalReference,
      decisionState: null,
      presentationState: 'PERSISTED',
      operationState: null,
    });
    await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${auraTokens}\n${auraShell}\nhtml,body{margin:0;max-width:100%;overflow-x:hidden}body{padding:16px;background:var(--surface,#f4f5fb)}*{box-sizing:border-box}</style></head><body>${html}</body></html>`);

    await expect(page.locator('[data-radar-person-reference="PERSON:1"]')).toHaveCount(1);
    await expect(page.locator('[data-radar-signal-reference]')).toHaveCount(2);
    await expect(page.getByText('2 cosas para revisar')).toBeVisible();
    await expect(page.getByText('UNCONFIRMED_PAYMENT_EVIDENCE')).toBeVisible();
    await expect(page.getByText('RELATIONSHIP_REVIEW_DUE')).toBeVisible();

    const actionable = page.locator(`[data-radar-signal-reference="${baseSignal.signalReference}"]`);
    await expect(actionable.locator(`[data-radar-decision="ACCEPT"][data-radar-signal="${baseSignal.signalReference}"]`)).toHaveCount(1);
    await expect(actionable.locator(`[data-radar-decision="MODIFY"][data-radar-signal="${baseSignal.signalReference}"]`)).toHaveCount(1);
    await expect(actionable.locator(`[data-radar-decision="DEFER"][data-radar-signal="${baseSignal.signalReference}"]`)).toHaveCount(1);
    await expect(actionable.locator(`[data-radar-decision="DISMISS"][data-radar-signal="${baseSignal.signalReference}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-radar-signal-reference="${secondSignal.signalReference}"] [data-radar-decision]`)).toHaveCount(0);

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      personRight: document.querySelector('[data-radar-person-reference]')?.getBoundingClientRect().right ?? 0,
      buttonRadius: getComputedStyle(document.querySelector('[data-radar-decision="ACCEPT"]')).borderRadius,
    }));
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.personRight).toBeLessThanOrEqual(geometry.innerWidth + 0.5);
    expect(geometry.buttonRadius).not.toBe('0px');
  });
}
