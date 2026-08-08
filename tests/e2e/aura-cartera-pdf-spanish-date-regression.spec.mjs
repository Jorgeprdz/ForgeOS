import { test, expect } from '@playwright/test';

const FIXTURE = 'http://127.0.0.1:4174/tests/fixtures/aura-cartera-pdf-spanish-date-regression.html';

function escapePdfText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildRegressionPdf() {
  const lines = [
    'CARATULA DE LA POLIZA DE SEGURO DE VIDA INDIVIDUAL',
    'PLAN BASICO IMAGINA SER 65 - 15 PAGOS UDI',
    'POLIZA SYN-IMAGINA-011',
    'FECHA DE EMISION 05/AGO/2026',
    'FECHA DE EFECTIVIDAD 05/AGO/2026',
    'FECHA DE VENCIMIENTO 05/AGO/2053',
    'PRIMA BASICA TOTAL 3,976.96',
  ];
  const stream = [
    'BT',
    '/F1 12 Tf',
    '72 740 Td',
    ...lines.flatMap((line, index) => index === 0
      ? [`(${escapePdfText(line)}) Tj`]
      : ['0 -22 Td', `(${escapePdfText(line)}) Tj`]),
    'ET',
  ].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  }
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

const upload = async page => {
  await page.locator('[data-pdf-input]').setInputFiles({
    name: 'imagina-ser-spanish-date-regression.pdf',
    mimeType: 'application/pdf',
    buffer: buildRegressionPdf(),
  });
};

test('same already-admitted Imagina Ser PDF reopens pending review without reprocessing', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(FIXTURE, { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-regression-harness', 'READY_FULL_CHAIN_REOPEN');

  await page.locator('[data-add-policy]').first().click();
  await expect(page.locator('[data-pdf-input]')).toBeAttached();
  await upload(page);

  await expect(page.getByText('PÓLIZA DETECTADA')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input[name="effectiveFrom"]')).toHaveValue('2026-08-05');
  await expect(page.locator('input[name="effectiveTo"]')).toHaveValue('2053-08-05');
  await expect(page.locator('body')).not.toContainText('Invalid time value');

  const firstTrace = await page.evaluate(() => window.__PDF_FULL_CHAIN_TRACE__);
  expect(firstTrace.functionInvocations).toHaveLength(1);
  expect(firstTrace.functionInvocations[0]).toMatchObject({
    name: 'cartera-pdf-intake',
    fileName: 'imagina-ser-spanish-date-regression.pdf',
    mimeType: 'application/pdf',
    hasBase64: true,
  });
  expect(firstTrace.admitted).toBe(true);
  expect(firstTrace.claims).toBeGreaterThanOrEqual(4);
  expect(firstTrace.resultStages).toEqual([
    'classified',
    'extraction_candidate_created',
    'packet_created',
    'confirmation_required',
  ]);
  expect(firstTrace.storedPendingReview).toBe(true);
  expect(firstTrace.rpcNames).toContain('forge_cartera020b_admit_evidence');
  expect(firstTrace.rpcNames).toContain('forge_cartera020b_record_processing_result');
  expect(firstTrace.resultEffectiveDates.length).toBeGreaterThanOrEqual(3);
  for (const observed of firstTrace.resultEffectiveDates) {
    expect(observed.effectiveFrom).toBe('2026-08-05');
    expect(observed.effectiveTo).toBe('2053-08-05');
  }

  const firstFunctionCount = firstTrace.functionInvocations.length;
  const firstClaimCount = firstTrace.claims;
  const firstRpcCount = firstTrace.rpcNames.length;
  const firstStageCount = firstTrace.resultStages.length;

  await page.locator('.cartera-dialog-close').click();
  await page.locator('[data-add-policy]').first().click();
  await expect(page.locator('[data-pdf-input]')).toBeAttached();
  await upload(page);

  await expect(page.getByText('PÓLIZA DETECTADA')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('input[name="effectiveFrom"]')).toHaveValue('2026-08-05');
  await expect(page.locator('input[name="effectiveTo"]')).toHaveValue('2053-08-05');
  await expect(page.locator('body')).not.toContainText('No pudimos completar el procesamiento del PDF');
  await expect(page.locator('body')).not.toContainText('Invalid time value');

  const secondTrace = await page.evaluate(() => window.__PDF_FULL_CHAIN_TRACE__);
  expect(secondTrace.pendingReviewReads).toBeGreaterThanOrEqual(2);
  expect(secondTrace.functionInvocations).toHaveLength(firstFunctionCount);
  expect(secondTrace.claims).toBe(firstClaimCount);
  expect(secondTrace.rpcNames).toHaveLength(firstRpcCount);
  expect(secondTrace.resultStages).toHaveLength(firstStageCount);
  expect(pageErrors).toEqual([]);
});
