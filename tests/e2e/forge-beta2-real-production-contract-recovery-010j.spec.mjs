import { expect, test } from '@playwright/test';

const FIXTURE='/tests/fixtures/forge-beta2-real-production-contract-recovery-010j.html';

function watchErrors(page){
  const pageErrors=[];
  const failed=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  page.on('response',response=>{
    const url=new URL(response.url());
    if(url.origin==='http://127.0.0.1:4179'&&response.status()>=400)failed.push(`${response.status()} ${url.pathname}`);
  });
  return {pageErrors,failed};
}

async function ready(page){
  const errors=watchErrors(page);
  await page.setViewportSize({width:390,height:844});
  await page.goto(FIXTURE,{waitUntil:'networkidle'});
  await expect(page.locator('html')).toHaveAttribute('data-recovery010j','READY');
  return errors;
}

async function noHorizontalOverflow(page){
  await expect.poll(()=>page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})))
    .toEqual({scroll:390,client:390});
}

test('010J real contract: one Home subject, no duplicate Policy attention, Pipeline contact enabled',async({page})=>{
  const errors=await ready(page);
  expect(await page.evaluate(()=>window.__RECOVERY_010J_TRACE__.homeGrouped)).toBe(1);

  const cartera=page.locator('#cartera-root');
  await expect(cartera.locator('.cartera-attention-item')).toHaveCount(2);
  await expect(cartera.getByText('Evidencia pendiente')).toHaveCount(0);
  await expect(cartera.getByText('Persona · Pipeline vinculado')).toBeVisible();

  const pipeline=page.locator('#pipeline-root');
  const whatsapp=pipeline.locator('button[data-action="whatsapp"]').last();
  await expect(whatsapp).toBeEnabled();
  await expect(pipeline.locator('a[href="tel:+525500001234"]').last()).toBeVisible();
  await whatsapp.click();
  await expect.poll(()=>page.evaluate(()=>window.__RECOVERY_010J_TRACE__.opens.at(-1)||''))
    .toContain('https://wa.me/525500001234');

  await noHorizontalOverflow(page);
  expect(await page.evaluate(()=>window.__RECOVERY_010J_TRACE__.unexpectedFunction||null)).toBeNull();
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

test('010J real contract: Policy reopens with confirmed/candidate evidence and 5 documentary coverages without mobile overflow',async({page})=>{
  const errors=await ready(page);
  const cartera=page.locator('#cartera-root');
  await cartera.locator('[data-directory-kind="POLICY"]').click();

  const recovery=cartera.locator('[data-policy-evidence-recovery][data-contract-recovery="010j"]');
  await expect(recovery).toBeVisible();
  await expect(recovery.getByText('IMAGINA SER 65 - 15 PAGOS UDI',{exact:true})).toBeVisible();
  await expect(recovery.getByText('6,816.96',{exact:true})).toBeVisible();
  await expect(recovery.getByText('Candidato extraído · no confirmado como hecho canónico')).toBeVisible();
  await expect(recovery.locator('[data-evidence-coverages] .coverage-row')).toHaveCount(5);
  await expect(recovery.getByText(/Estado de evidencia: CONFIRMED/)).toBeVisible();
  await expect(cartera.getByText('PERSONA DEMO',{exact:true}).first()).toBeVisible();

  await noHorizontalOverflow(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

test('010J real contract: Person Workspace visibly proves confirmed Pipeline identity continuity',async({page})=>{
  const errors=await ready(page);
  const cartera=page.locator('#cartera-root');
  await cartera.locator('[data-directory-kind="PERSON"]').click();

  const continuity=cartera.locator('[data-pipeline-identity-continuity="010j"]');
  await expect(continuity).toBeVisible();
  await expect(continuity.getByText('Pipeline vinculado',{exact:true})).toBeVisible();
  await expect(continuity.getByText(/Pipeline · client · Contacto disponible/)).toBeVisible();
  await expect(continuity.locator('[data-linked-prospect]')).toHaveCount(1);

  await noHorizontalOverflow(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});
