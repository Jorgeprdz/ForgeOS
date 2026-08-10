import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const FIXTURE='/tests/fixtures/forge-aura-conversation-cartera-011a.html';
mkdirSync('artifacts/011a/screenshots',{recursive:true});

function watchErrors(page){
  const pageErrors=[];
  const failed=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  page.on('response',response=>{
    const url=new URL(response.url());
    if(url.origin==='http://127.0.0.1:4181'&&response.status()>=400)failed.push(`${response.status()} ${url.pathname}`);
  });
  return {pageErrors,failed};
}

async function ready(page,width=390,height=844){
  const errors=watchErrors(page);
  await page.setViewportSize({width,height});
  await page.goto(FIXTURE,{waitUntil:'commit'});
  try {
    await page.waitForFunction(
      () => document.documentElement?.dataset?.forge011a === 'READY',
      null,
      {timeout:10000},
    );
  } catch (error) {
    throw new Error(`FORGE_011A_READY_TIMEOUT: ${errors.pageErrors.join(' | ') || 'NO_PAGEERROR_CAPTURED'} :: ${error.message}`);
  }
  return errors;
}

async function noHorizontalOverflow(page,width){
  await expect.poll(()=>page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})))
    .toEqual({scroll:width,client:width});
}

test('011A Cartera groups confirmed policy below canonical person without technical product leakage',async({page})=>{
  const errors=await ready(page,390,844);
  const cartera=page.locator('#cartera-root');
  const people=cartera.locator('[data-directory-kind="PERSON"]');
  await expect(people).toHaveCount(1);
  await expect(cartera.locator('[data-directory-kind="POLICY"]')).toHaveCount(0);
  await expect(people.getByText('ADRIAN ORTIZ GARCIA',{exact:true})).toBeVisible();
  await expect(people.getByText('Pipeline vinculado',{exact:true})).toBeVisible();
  await expect(people.getByText('IMAGINA SER 65 - 15 PAGOS UDI',{exact:true})).toBeVisible();
  await expect(people.getByText('••••6169',{exact:true})).toBeVisible();
  await expect(cartera.getByText(/product:imagina-ser/i)).toHaveCount(0);
  const border=await people.evaluate(node=>getComputedStyle(node).borderLeftStyle);
  expect(border).toBe('solid');
  await noHorizontalOverflow(page,390);
  await page.screenshot({path:'artifacts/011a/screenshots/cartera-390.png',fullPage:true});
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

test('011A WhatsApp action opens Conversation Workspace, not wa.me, until exact approval',async({page})=>{
  const errors=await ready(page,412,915);
  const pipeline=page.locator('#pipeline-root');
  const whatsapp=pipeline.locator('button[data-action="whatsapp"]').last();
  await expect(whatsapp).toBeEnabled();
  await whatsapp.click();

  const workspace=page.locator('[data-aura-conversation-workspace="011A"]');
  await expect(workspace).toBeVisible();
  expect(await page.evaluate(()=>window.__FORGE_011A_TRACE__.opens.length)).toBe(0);
  await expect(workspace.getByText('Preparar mensaje',{exact:true})).toBeVisible();
  await expect(workspace.getByText('Contactado',{exact:true})).toBeVisible();

  await workspace.locator('[data-generate-draft]').click();
  await expect(workspace.locator('[data-draft-block]')).toBeVisible();
  await expect(workspace.locator('[data-draft-source]')).toHaveText('Generado por IA');
  await expect(workspace.locator('[data-draft]')).toHaveValue(/dar seguimiento/i);

  const providerRequest=await page.evaluate(()=>window.__FORGE_011A_TRACE__.providerRequests.at(-1));
  expect(Object.keys(providerRequest).sort()).toEqual(['conversationBrief','providerId','requestMetadata','requestVersion'].sort());
  expect(JSON.stringify(providerRequest)).not.toContain('Contexto privado que nunca debe llegar al provider.');
  expect(providerRequest.conversationBrief.status).toBe('SUCCESS');
  expect(providerRequest.conversationBrief.humanApprovalRequired).toBe(true);

  await workspace.locator('[data-approve-draft]').click();
  await expect(workspace.locator('[data-open-whatsapp]')).toBeEnabled();
  const approved=await workspace.locator('[data-draft]').inputValue();

  await workspace.locator('[data-draft]').fill(`${approved} Cambio humano.`);
  await expect(workspace.locator('[data-open-whatsapp]')).toBeDisabled();
  await workspace.locator('[data-approve-draft]').click();
  await expect(workspace.locator('[data-open-whatsapp]')).toBeEnabled();
  const exact=await workspace.locator('[data-draft]').inputValue();

  await workspace.locator('[data-open-whatsapp]').click();
  const opened=await page.evaluate(()=>window.__FORGE_011A_TRACE__.opens.at(-1)||'');
  expect(opened).toContain('https://wa.me/525500001234?text=');
  expect(decodeURIComponent(new URL(opened).searchParams.get('text'))).toBe(exact);
  expect(await page.evaluate(()=>window.__FORGE_011A_TRACE__.timelineAppends.length)).toBe(0);
  await page.screenshot({path:'artifacts/011a/screenshots/conversation-approved-412.png',fullPage:true});
  await noHorizontalOverflow(page,412);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

test('011A NASH Combat stays inside workspace, excludes legacy final response, and persists only reviewed classification',async({page})=>{
  const errors=await ready(page,390,844);
  const pipeline=page.locator('#pipeline-root');
  await pipeline.locator('button[data-action="whatsapp"]').last().click();
  const workspace=page.locator('[data-aura-conversation-workspace="011A"]');
  await workspace.locator('[data-conversation-tab="combat"]').click();
  await workspace.locator('[data-combat-objection]').fill('Está muy caro');
  await workspace.locator('[data-analyze-combat]').click();
  await expect(workspace.locator('[data-combat-result]')).toBeVisible();
  await expect(workspace.getByText('Clasificación candidata',{exact:true})).toBeVisible();
  await expect(workspace.getByText(/no se usa ninguna respuesta final hardcodeada/i)).toBeVisible();

  await workspace.locator('[data-review-combat]').click();
  await expect(workspace.locator('[data-conversation-panel="message"]')).toBeVisible();
  await workspace.locator('[data-generate-draft]').click();
  await expect(workspace.locator('[data-draft-block]')).toBeVisible();

  const request=await page.evaluate(()=>window.__FORGE_011A_TRACE__.providerRequests.at(-1));
  const serialized=JSON.stringify(request);
  expect(serialized).not.toContain('Está muy caro');
  expect(serialized).not.toContain('objectionKillerMessage');
  expect(request.conversationBrief.strategy.questionsToAsk.length).toBeGreaterThan(0);

  await workspace.locator('[data-conversation-tab="combat"]').click();
  await workspace.locator('[data-register-combat]').click();
  await expect(workspace.getByText(/Se registró únicamente la clasificación revisada/i)).toBeVisible();
  const append=await page.evaluate(()=>window.__FORGE_011A_TRACE__.timelineAppends.at(-1));
  expect(append.p_event_type).toBe('OBJECTION_RECORDED');
  expect(append.p_payload.objectionCode).toBeTruthy();
  expect(append.p_payload.resolutionStatus).toBe('OPEN');
  expect(JSON.stringify(append)).not.toContain('Está muy caro');
  await page.screenshot({path:'artifacts/011a/screenshots/nash-combat-390.png',fullPage:true});
  await noHorizontalOverflow(page,390);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.failed).toEqual([]);
});

for(const viewport of [
  {name:'mobile-390',width:390,height:844},
  {name:'mobile-412',width:412,height:915},
  {name:'tablet-768',width:768,height:1024},
  {name:'desktop-1440',width:1440,height:900},
]){
  test(`011A visual geometry ${viewport.name}: no horizontal overflow or modal collision`,async({page})=>{
    const errors=await ready(page,viewport.width,viewport.height);
    await page.locator('#pipeline-root button[data-action="whatsapp"]').last().click();
    const workspace=page.locator('[data-aura-conversation-workspace="011A"]');
    await expect(workspace).toBeVisible();
    await noHorizontalOverflow(page,viewport.width);
    const geometry=await workspace.locator('.aura-conversation').evaluate(node=>{
      const rect=node.getBoundingClientRect();
      return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:innerWidth,height:innerHeight};
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width+.5);
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.height+.5);
    await page.screenshot({path:`artifacts/011a/screenshots/${viewport.name}.png`,fullPage:true});
    expect(errors.pageErrors).toEqual([]);
    expect(errors.failed).toEqual([]);
  });
}