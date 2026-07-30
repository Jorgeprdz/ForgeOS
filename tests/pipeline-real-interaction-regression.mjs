import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_TEST_BASE_URL || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";
const appCss = new URL("app.css?v=pipeline-real-interaction", baseUrl).href;
const modalCss = new URL("pipeline-referral-modal.css?v=pipeline-real-interaction", baseUrl).href;
const authorityUrl = new URL("pipeline-interaction-authority.js?v=pipeline-real-interaction", baseUrl).href;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
const page = await context.newPage();
const roundBox = box => ({ x: Math.round(box.x * 100) / 100, y: Math.round(box.y * 100) / 100, width: Math.round(box.width * 100) / 100, height: Math.round(box.height * 100) / 100 });

try {
  await page.goto(new URL("manifest.json", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html><html data-forge-theme="dark"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${appCss}"></head><body>
  <main class="app"><section class="pipeline-module" data-forge-pipeline-module><div class="pipeline-module__stages"><article class="pipeline-module__prospect pipeline-module__productive-card" data-productive-prospect-card="prospect-1" data-productive-stage="appointment_scheduled">
  <header class="pipeline-module__productive-identity"><strong>Jorge Ignacio Palacios Rodriguez</strong><span class="pipeline-module__productive-stage" data-productive-stage-label>Cita agendada</span></header>
  <label class="pipeline-module__stage-control"><span>Estado del prospecto</span><select data-productive-stage-control="prospect-1"><option value="appointment_scheduled" selected>Cita agendada</option><option value="proposal">Propuesta</option><option value="client">Cliente</option></select></label>
  <div class="pipeline-module__card-actions" data-productive-card-actions><button type="button">Ver contexto</button><button type="button">Preparar mensaje</button><button type="button">NASH Combat</button><button type="button">Revisar NBA</button><a href="tel:+525500000000">Llamar</a><button type="button" disabled>Agendar</button></div>
  </article></div></section></main>
  <script>
  const card=document.querySelector('[data-productive-prospect-card]');const select=document.querySelector('[data-productive-stage-control]');const label=document.querySelector('[data-productive-stage-label]');
  select.addEventListener('change',async()=>{const requested=select.value;card.dataset.productiveStage=requested;label.textContent=select.selectedOptions[0].textContent;await new Promise(r=>setTimeout(r,100));card.dataset.productiveStage='appointment_scheduled';label.textContent='Cita agendada';select.value='appointment_scheduled';});
  document.addEventListener('click',e=>{if(!e.target.closest('[data-productive-card-actions] button,[data-productive-card-actions] a'))return;if(document.querySelector('[data-material3-referral-styles]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href=${JSON.stringify(modalCss)};link.dataset.material3ReferralStyles='true';document.head.append(link);});
  </script></body></html>`);
  await page.addScriptTag({ type: "module", url: authorityUrl });
  await page.waitForFunction(() => document.documentElement.dataset.pipelineInteractionAuthority === "ready");
  await page.waitForFunction(() => document.styleSheets.length >= 2);
  const actions = page.locator("[data-productive-card-actions] > *");
  const before = await actions.evaluateAll(nodes => nodes.map(node => { const b=node.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; }));
  await page.getByRole("button", { name: "Ver contexto" }).click();
  await page.waitForFunction(() => document.querySelector('[data-material3-referral-styles]')?.sheet);
  const after = await actions.evaluateAll(nodes => nodes.map(node => { const b=node.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; }));
  assert.deepEqual(after.map(roundBox), before.map(roundBox), "BUTTON_GEOMETRY_CHANGED_AFTER_FIRST_INTERACTION");
  const card = page.locator('[data-productive-prospect-card="prospect-1"]');
  const select = page.locator('[data-productive-stage-control="prospect-1"]');
  await select.selectOption("proposal");
  await page.waitForTimeout(40);
  assert.equal(await card.getAttribute("data-productive-stage"), "proposal", "STAGE_DID_NOT_CHANGE_IMMEDIATELY");
  const proposalBorder = await card.evaluate(node => getComputedStyle(node).borderLeftColor);
  await page.waitForTimeout(250);
  assert.equal(await card.getAttribute("data-productive-stage"), "proposal", "CONFIRMED_STAGE_REVERTED_AFTER_STALE_RELOAD");
  assert.equal(await select.inputValue(), "proposal", "SELECT_REVERTED_AFTER_STALE_RELOAD");
  assert.equal(await card.evaluate(node => getComputedStyle(node).borderLeftColor), proposalBorder, "STAGE_COLOR_REVERTED_AFTER_STALE_RELOAD");
  console.log("PIPELINE_BUTTON_GEOMETRY_AFTER_INTERACTION=STABLE");
  console.log("PIPELINE_CONFIRMED_STAGE_AFTER_DELAY=PERSISTED");
} finally { await context.close(); await browser.close(); }
