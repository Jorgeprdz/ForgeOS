import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const FIXTURE='/tests/fixtures/forge-aura-conversation-cartera-011a.html';
mkdirSync('artifacts/011b/screenshots',{recursive:true});

async function prepare(page,width=390,height=844){
  await page.route('**/docs/static-preview/forge-aura/pipeline/pipeline-module-v2.js*',route=>route.fulfill({
    status:200,
    contentType:'application/javascript',
    body:"export { createPipelineModule } from '/docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-011b.js?v=forge-aura-production-entrypoint-hotfix-011b';",
  }));
  await page.route('**/docs/static-preview/forge-aura/cartera/cartera-relational-011a.css*',route=>route.fulfill({
    status:200,
    contentType:'text/css',
    body:"@import url('/docs/static-preview/forge-aura/cartera/cartera-relational-011b.css?v=forge-aura-production-entrypoint-hotfix-011b');",
  }));
  await page.setViewportSize({width,height});
  await page.goto(FIXTURE,{waitUntil:'commit'});
  await page.waitForFunction(()=>document.documentElement?.dataset?.forge011a==='READY',null,{timeout:10000});
}

test('011B Cartera renders one integrated relationship card without a second policy box',async({page})=>{
  await prepare(page,390,844);
  const root=page.locator('#cartera-root');
  const card=root.locator('.cartera-relationship-card');
  const person=card.locator(':scope > [data-directory-kind="PERSON"]');
  const policy=card.locator('[data-directory-kind="POLICY"]');
  await expect(card).toHaveCount(1);
  await expect(person).toHaveCount(1);
  await expect(policy).toHaveCount(1);
  await expect(root.locator('.cartera-directory-list > [data-directory-kind="POLICY"]')).toHaveCount(0);
  await expect(person.getByText(/adrian ortiz garcia/i)).toBeVisible();
  await expect(card.getByText('IMAGINA SER 65 - 15 PAGOS UDI',{exact:true})).toBeVisible();
  await expect(card.getByText('••••6169',{exact:true})).toBeVisible();

  const geometry=await page.evaluate(()=>{
    const card=document.querySelector('#cartera-root .cartera-relationship-card');
    const person=card?.querySelector(':scope > [data-directory-kind="PERSON"]');
    const policy=card?.querySelector('[data-directory-kind="POLICY"]');
    const heading=card?.querySelector('.cartera-related-heading');
    const icon=policy?.querySelector('.cartera-directory-icon');
    const cs=node=>node?getComputedStyle(node):null;
    return {
      cardBorder:cs(card)?.borderTopStyle,
      personBorder:cs(person)?.borderTopStyle,
      policyBorder:cs(policy)?.borderTopStyle,
      headingDisplay:cs(heading)?.display,
      policyIconDisplay:cs(icon)?.display,
    };
  });
  expect(geometry.cardBorder).toBe('solid');
  expect(geometry.personBorder).toBe('none');
  expect(geometry.policyBorder).toBe('none');
  expect(geometry.headingDisplay).toBe('none');
  expect(geometry.policyIconDisplay).toBe('none');
  await page.screenshot({path:'artifacts/011b/screenshots/cartera-integrated-390.png',fullPage:true});
});

test('011B productive Pipeline bridge blocks direct WhatsApp until exact human approval',async({page})=>{
  await prepare(page,412,915);
  const pipeline=page.locator('#pipeline-root');
  const whatsapp=pipeline.locator('button[data-action="whatsapp"]').last();
  await expect(whatsapp).toBeEnabled();
  await whatsapp.click();

  const workspace=page.locator('[data-aura-conversation-workspace="011A"]');
  await expect(workspace).toBeVisible();
  expect(await page.evaluate(()=>window.__FORGE_011A_TRACE__.opens.length)).toBe(0);

  await workspace.locator('[data-generate-draft]').click();
  await expect(workspace.locator('[data-draft-block]')).toBeVisible();
  expect(await page.evaluate(()=>window.__FORGE_011A_TRACE__.opens.length)).toBe(0);

  await workspace.locator('[data-approve-draft]').click();
  await expect(workspace.locator('[data-open-whatsapp]')).toBeEnabled();
  const approved=await workspace.locator('[data-draft]').inputValue();
  await page.screenshot({path:'artifacts/011b/screenshots/conversation-approved-412.png',fullPage:true});
  await workspace.locator('[data-open-whatsapp]').click();

  const opened=await page.evaluate(()=>window.__FORGE_011A_TRACE__.opens.at(-1)||'');
  expect(opened).toContain('https://wa.me/525500001234?text=');
  expect(decodeURIComponent(new URL(opened).searchParams.get('text'))).toBe(approved);
});
