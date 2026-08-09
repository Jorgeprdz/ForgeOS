import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

fs.mkdirSync('test-results/aura-cartera-pdf-ingress-parity', { recursive: true });
const FIXTURE = 'http://127.0.0.1:4175/tests/fixtures/aura-cartera-pdf-ingress-parity.html';

function escapePdfText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf() {
  const lines = [
    'CARATULA DE POLIZA DE VIDA INDIVIDUAL',
    'PLAN IMAGINA SER 65 - 15 PAGOS UDI',
    'POLIZA VI0003006169',
    'TIPO DE POLIZA NORMAL',
    'MONEDA UDI',
    'FORMA DE PAGO MENSUAL',
    'FECHA DE EMISION 05/AGO/2026',
    'FECHA DE EFECTIVIDAD 05/AGO/2026',
    'FECHA DE VENCIMIENTO 05/AGO/2053',
    'PRIMA BASICA TOTAL 3,976.96',
    'PRIMA PLANEADA 2,840.00',
    'TOTAL ANUAL 6,816.96',
    'COBERTURAS CONTRATADAS',
  ];
  const stream = ['BT','/F1 10 Tf','54 750 Td',...lines.flatMap((line,index)=>index===0?[`(${escapePdfText(line)}) Tj`]:['0 -18 Td',`(${escapePdfText(line)}) Tj`]),'ET'].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) { offsets.push(Buffer.byteLength(pdf)); pdf += object; }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) pdf += `${String(offsets[index]).padStart(10,'0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

const PDF = buildPdf();
const EXPECTED_DIGEST = createHash('sha256').update(PDF).digest('hex');

async function openChooser(page) {
  await page.goto(FIXTURE, { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-ingress-parity-harness', 'READY');
  await page.locator('[data-add-policy]').first().click();
  await expect(page.locator('[data-pdf-input]')).toBeAttached();
  await expect(page.locator('[data-pdf-drop]')).toBeVisible();
}

async function selectPdf(page) {
  await page.locator('[data-pdf-input]').setInputFiles({
    name: 'selector-ingress.pdf', type: 'application/pdf', buffer: PDF,
  });
  await expect(page.locator('[data-semantic-review="014"]')).toBeVisible({ timeout: 10_000 });
}

async function dropPdf(page, { itemsOnly = true } = {}) {
  const bytes = [...PDF];
  await page.locator('[data-pdf-drop]').evaluate((drop, payload) => {
    const file = new File([new Uint8Array(payload.bytes)], 'drop-ingress.pdf', {
      type: 'application/octet-stream', lastModified: 1700000000000,
    });
    const event = new Event('drop', { bubbles: true, cancelable: true });
    const dataTransfer = payload.itemsOnly
      ? { files: [], items: [{ kind: 'file', getAsFile: () => file }] }
      : (() => { const dt = new DataTransfer(); dt.items.add(file); return dt; })();
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
    drop.dispatchEvent(event);
  }, { bytes, itemsOnly });
  await expect(page.locator('[data-semantic-review="014"]')).toBeVisible({ timeout: 10_000 });
}

async function trace(page) {
  return page.evaluate(() => structuredClone(window.__PDF_INGRESS_PARITY_TRACE__));
}

async function semanticSnapshot(page) {
  return page.evaluate(() => {
    const facts = {};
    document.querySelectorAll('.cartera-semantic-facts > div').forEach(node => {
      const key = node.querySelector('dt')?.textContent?.trim();
      const value = node.querySelector('dd')?.textContent?.trim();
      if (key) facts[key] = value || '';
    });
    const premiums = {};
    document.querySelectorAll('.cartera-semantic-premiums article').forEach(node => {
      const key = node.querySelector('small')?.textContent?.trim();
      const value = node.querySelector('strong')?.textContent?.trim();
      if (key) premiums[key] = value || '';
    });
    return {
      facts,
      premiums,
      coverageCount: document.querySelectorAll('[data-coverage-candidate]').length,
      coverageSummary: document.querySelector('.cartera-semantic-rail strong')?.textContent?.trim() || '',
      bodyHasLegacyUnsupported: document.body.textContent.includes('POLICY_COVERAGE_EXTRACTION_NOT_SUPPORTED'),
    };
  });
}

async function expectSemanticCompletion(page) {
  await expect(page.getByText('IMAGINA SER 65 - 15 PAGOS UDI').first()).toBeVisible();
  await expect(page.getByText('Normal', { exact: true })).toBeVisible();
  await expect(page.getByText('No identificado', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('05 ago 2026', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('05 ago 2053', { exact: true })).toBeVisible();
  await expect(page.getByText('UDI', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Mensual', { exact: true })).toBeVisible();
  await expect(page.getByText('3,976.96 UDI', { exact: true })).toBeVisible();
  await expect(page.getByText('2,840.00 UDI', { exact: true })).toBeVisible();
  await expect(page.getByText('6,816.96 UDI', { exact: true })).toBeVisible();
  await expect(page.locator('[data-coverage-candidate]')).toHaveCount(10);
  await expect(page.getByText('10 coberturas candidatas', { exact: true })).toBeVisible();
  await expect(page.getByText('Beneficiarios detectados', { exact: true })).toBeVisible();
}

// MEDIA SELECTOR — CHECK 1/3: the real input path hashes the uploaded bytes and invokes current Edge once.
test('selector check 1/3 — transport reaches current Edge from legacy pending packet', async ({ page }) => {
  await openChooser(page);
  await selectPdf(page);
  const value = await trace(page);
  expect(value.functionInvocations).toHaveLength(1);
  expect(value.functionInvocations[0]).toMatchObject({ name: 'cartera-pdf-intake', mimeType: 'application/pdf' });
  expect(value.functionInvocations[0].base64Length).toBeGreaterThan(100);
  expect(value.refreshCommands).toHaveLength(1);
  expect(value.refreshCommands[0].documentDigest).toBe(EXPECTED_DIGEST);
  expect(value.refreshCommands[0].basePacketReference).toBe(`POLICY_PACKET:AURA:${EXPECTED_DIGEST.slice(0,40)}`);
  expect(value.refreshCommands[0].refreshPacketReference).toBe(`POLICY_PACKET:AURA:SEMANTIC_REFRESH:${EXPECTED_DIGEST.slice(0,40)}`);
  expect(value.legacyPacketReads).toBeGreaterThanOrEqual(1);
});

// MEDIA SELECTOR — CHECK 2/3: legacy semantics are replaced only by an append-only refresh review.
test('selector check 2/3 — append-only semantic refresh renders complete human review', async ({ page }) => {
  await openChooser(page);
  await selectPdf(page);
  await expectSemanticCompletion(page);
  const value = await trace(page);
  const command = value.refreshCommands[0];
  expect(command.extractedFields.policyType.value).toBe('NORMAL');
  expect(command.extractedFields.status.value).toBeNull();
  expect(command.extractedFields.issueDate.value).toBe('2026-08-05');
  expect(command.extractedFields.currency.value).toBe('UDI');
  expect(command.extractedFields.paymentFrequency.value).toBe('MONTHLY');
  expect(command.extractedFields.basicPremiumTotal.value).toBe(3976.96);
  expect(command.extractedFields.plannedPremium.value).toBe(2840);
  expect(command.extractedFields.annualTotal.value).toBe(6816.96);
  expect(command.extractedFields.coverageCandidates.value).toHaveLength(10);
  expect(command.warnings).not.toContain('POLICY_COVERAGE_EXTRACTION_NOT_SUPPORTED');
  await page.screenshot({ path: 'test-results/aura-cartera-pdf-ingress-parity/selector-semantic.png', fullPage: true });
});

// MEDIA SELECTOR — CHECK 3/3: reopening the same PDF uses the refreshed packet and does not re-extract.
test('selector check 3/3 — same PDF reopens refreshed packet without second Edge call', async ({ page }) => {
  await openChooser(page);
  await selectPdf(page);
  const firstSnapshot = await semanticSnapshot(page);
  const first = await trace(page);
  await page.locator('.cartera-dialog-close').click();
  await page.locator('[data-add-policy]').first().click();
  await page.locator('[data-pdf-input]').setInputFiles({ name: 'selector-ingress.pdf', type: 'application/pdf', buffer: PDF });
  await expect(page.locator('[data-semantic-review="014"]')).toBeVisible({ timeout: 10_000 });
  const secondSnapshot = await semanticSnapshot(page);
  const second = await trace(page);
  expect(secondSnapshot).toEqual(firstSnapshot);
  expect(second.functionInvocations).toHaveLength(first.functionInvocations.length);
  expect(second.refreshCommands).toHaveLength(first.refreshCommands.length);
  expect(second.refreshPacketReads).toBeGreaterThan(first.refreshPacketReads);
});

// DRAG & DROP — CHECK 1/3: item-only / octet-stream drops are normalized into the same hidden input pipeline.
test('drag drop check 1/3 — items-only octet-stream PDF reaches selector-equivalent transport', async ({ page }) => {
  await openChooser(page);
  await dropPdf(page, { itemsOnly: true });
  const value = await trace(page);
  expect(value.functionInvocations).toHaveLength(1);
  expect(value.functionInvocations[0]).toMatchObject({
    name: 'cartera-pdf-intake', fileName: 'drop-ingress.pdf', mimeType: 'application/pdf',
  });
  expect(value.refreshCommands).toHaveLength(1);
  expect(value.refreshCommands[0].documentDigest).toBe(EXPECTED_DIGEST);
  expect(value.refreshCommands[0].basePacketReference).toBe(`POLICY_PACKET:AURA:${EXPECTED_DIGEST.slice(0,40)}`);
  await expect(page.locator('[data-pdf-drop-error]')).toHaveCount(0);
});

// DRAG & DROP — CHECK 2/3: semantic result must be complete and identical in meaning to selector ingestion.
test('drag drop check 2/3 — semantic refresh survives drag and drop', async ({ page }) => {
  await openChooser(page);
  await dropPdf(page, { itemsOnly: false });
  await expectSemanticCompletion(page);
  const value = await trace(page);
  expect(value.refreshCommands).toHaveLength(1);
  expect(value.refreshCommands[0].extractedFields.coverageCandidates.value).toHaveLength(10);
  await page.screenshot({ path: 'test-results/aura-cartera-pdf-ingress-parity/drop-semantic.png', fullPage: true });
});

// DRAG & DROP — CHECK 3/3: repeated drops reopen the refreshed packet without duplicate extraction/refresh.
test('drag drop check 3/3 — repeated drop reopens refreshed packet without duplicate work', async ({ page }) => {
  await openChooser(page);
  await dropPdf(page, { itemsOnly: true });
  const firstSnapshot = await semanticSnapshot(page);
  const first = await trace(page);
  await page.locator('.cartera-dialog-close').click();
  await page.locator('[data-add-policy]').first().click();
  await dropPdf(page, { itemsOnly: true });
  const secondSnapshot = await semanticSnapshot(page);
  const second = await trace(page);
  expect(secondSnapshot).toEqual(firstSnapshot);
  expect(second.functionInvocations).toHaveLength(first.functionInvocations.length);
  expect(second.refreshCommands).toHaveLength(first.refreshCommands.length);
  expect(second.refreshPacketReads).toBeGreaterThan(first.refreshPacketReads);
});

// PARITY CHECK: both ingress methods must produce the same digest and visible semantics.
test('selector and drag drop produce identical digest and semantic snapshot', async ({ browser }) => {
  const selectorPage = await browser.newPage();
  const dropPage = await browser.newPage();
  await openChooser(selectorPage);
  await selectPdf(selectorPage);
  await openChooser(dropPage);
  await dropPdf(dropPage, { itemsOnly: true });

  const selectorTrace = await trace(selectorPage);
  const dropTrace = await trace(dropPage);
  expect(selectorTrace.refreshCommands[0].documentDigest).toBe(EXPECTED_DIGEST);
  expect(dropTrace.refreshCommands[0].documentDigest).toBe(EXPECTED_DIGEST);
  expect(await semanticSnapshot(dropPage)).toEqual(await semanticSnapshot(selectorPage));
  await selectorPage.close();
  await dropPage.close();
});
