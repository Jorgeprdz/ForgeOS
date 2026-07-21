import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream, mkdirSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const puppeteer = (await import(process.env.FORGE_PUPPETEER_CORE_PATH)).default;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_PIPELINE_COCKPIT_EVIDENCE_DIR;
assert.ok(chromiumPath && evidenceDir, "BROWSER_PATHS_REQUIRED");
mkdirSync(evidenceDir, { recursive: true });
const root = process.cwd();
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
  const harness = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/advisor-os/sales-pipeline/pipeline-ui.css"><style>body{margin:0;background:#050b16}</style></head><body><section data-root></section><script>window.__external=[];window.__invocations=0;window.__statusWrites=0;document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');const href=link?.href||'';if(href.startsWith('tel:')||href.startsWith('https://wa.me/')||href.startsWith('https://calendar.google.com/')){window.__external.push({href,trusted:event.isTrusted});event.preventDefault()}},true);</script><script src="/advisor-os/sales-pipeline/pipeline-ui.js"></script><script>window.__rows=[{id:'p1',fullName:'Prospecto Demo',phone:'+525500000001',whatsapp:'+525500000001',source:'Referido',referrerName:'Referente Demo',status:'referred_new',nextActionAt:'2026-07-24T10:00:00Z',createdAt:'2026-07-18T00:00:00Z'},{id:'p2',fullName:'Prospecto Norte',phone:'+525500000002',source:'Evento',status:'referred_new',createdAt:'2026-07-19T00:00:00Z'},{id:'p3',fullName:'Prospecto Cita',phone:'+525500000003',whatsapp:'+525500000003',source:'Proyecto 200',status:'appointment_scheduled',nextActionAt:'2026-07-25T09:00:00Z'}];window.ForgeProductiveProspectService067G17B={create(){return{async listProspects(){return window.__rows.slice()},async updateProspect(id,changes){window.__statusWrites=Number(window.__statusWrites||0)+1;const row=window.__rows.find(item=>item.id===id);Object.assign(row,changes);return {...row}},async createProspect(){throw new Error('OUT_OF_SCOPE')},async archiveProspect(){throw new Error('OUT_OF_SCOPE')}}}};</script><script src="/advisor-os/sales-pipeline/productive-prospect-ui.js"></script><script>const client={functions:{async invoke(_name,{body}){window.__invocations=Number(window.__invocations||0)+1;return{data:{resultState:'SUCCESS',draftCandidate:{rawText:'Hola, '+body.prospectMessageContext.displayName+'. Borrador '+window.__invocations+'.',sendsMessage:false,sourceMutable:false},metadata:{providerId:'gemini'},error:null},error:null}}}};window.__pipeline=ForgeProductiveProspectUI067G17B.create({client,root:document.querySelector('[data-root]')});window.__pipeline.load();</script></body></html>`;
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  if (pathname === "/harness") return response.writeHead(200, { "Content-Type": "text/html" }).end(harness);
  const candidate = normalize(join(root, pathname.replace(/^\/+/, "")));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try { const info = await stat(candidate); const file = info.isDirectory() ? join(candidate, "index.html") : candidate; response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" }); createReadStream(file).pipe(response); } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await puppeteer.launch({ executablePath: chromiumPath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"] });
try {
  const page = await browser.newPage();
  const viewports = [[390, 844, "mobile"], [768, 1024, "tablet"], [1440, 900, "desktop"]];
  for (const [width, height, label] of viewports) {
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 600, hasTouch: width < 600 });
    await page.goto(`http://127.0.0.1:${server.address().port}/harness`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".forge-pipeline-card");
    const geometry = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, cards: [...document.querySelectorAll(".forge-pipeline-card")].map(card => ({ width: card.getBoundingClientRect().width, actions: [...card.querySelectorAll(".forge-card-action")].every(action => action.getBoundingClientRect().height >= 44) })) }));
    assert.equal(geometry.overflow, false, `${label}_overflow`);
    assert.equal(geometry.cards.every(card => card.width > 0 && card.actions), true, `${label}_card_geometry`);
    await page.screenshot({ path: join(evidenceDir, `${label}-pipeline.png`), fullPage: true });
    await page.click('[data-card-whatsapp="p1"]');
    await page.waitForSelector("[data-message-preview]:not([hidden])");
    await page.evaluate(() => Promise.all(document.querySelector("[data-action-workspace]").getAnimations().map(animation => animation.finished)));
    await page.screenshot({ path: join(evidenceDir, `${label}-whatsapp-gemini.png`), fullPage: true });
    await page.click("[data-close-action-workspace]");
    await page.click('[data-open-prospect="p1"]');
    await page.waitForSelector("[data-prospect-detail-dialog][open]");
    await page.screenshot({ path: join(evidenceDir, `${label}-prospect-detail.png`), fullPage: true });
    await page.click("[data-close-prospect-detail]");
  }
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/harness`, { waitUntil: "networkidle0" });
  await page.select('[data-prospect-status="p1"]', "contacted");
  await page.waitForFunction(() => document.querySelector('[data-prospect-id="p1"]')?.dataset.stage === "contacted");
  assert.equal(await page.evaluate(() => window.__statusWrites), 1);
  await page.click('[data-card-whatsapp="p1"]');
  await page.waitForSelector("[data-message-preview]:not([hidden])");
  await page.evaluate(() => Promise.all(document.querySelector("[data-action-workspace]").getAnimations().map(animation => animation.finished)));
  assert.equal(await page.evaluate(() => document.querySelectorAll("dialog[open], [data-prospect-form-modal]").length), 0);
  assert.deepEqual(await page.evaluate(() => [getComputedStyle(document.body).opacity, getComputedStyle(document.querySelector("[data-action-workspace]")).opacity]), ["1", "1"]);
  assert.equal(await page.$eval("[data-message-editor]", node => node.hidden), true);
  assert.equal(await page.evaluate(() => window.__external.length), 0);
  await page.screenshot({ path: join(evidenceDir, "desktop-whatsapp-gemini.png"), fullPage: true });
  await page.select("[data-message-style]", "brief");
  await page.waitForFunction(() => window.__invocations >= 2);
  assert.equal(await page.evaluate(() => window.__external.length), 0);
  await page.click("[data-regenerate-message]");
  await page.waitForFunction(() => window.__invocations >= 3);
  await page.click("[data-edit-message]");
  assert.equal(await page.$eval("[data-message-editor]", node => !node.hidden), true);
  await page.click("[data-edit-message]");
  await page.click("[data-open-whatsapp]");
  assert.equal(await page.evaluate(() => window.__external.some(item => item.trusted && item.href.startsWith("https://wa.me/"))), true);
  await page.click("[data-close-action-workspace]");
  await page.click('[data-card-calendar="p1"]');
  assert.equal(await page.$eval("[data-open-calendar]", node => node.hasAttribute("href")), false);
  await page.$eval("[data-calendar-date]", node => { node.value = "2026-08-12"; node.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.$eval("[data-calendar-time]", node => { node.value = "09:30"; node.dispatchEvent(new Event("change", { bubbles: true })); });
  assert.match(await page.$eval("[data-open-calendar]", node => node.href), /^https:\/\/calendar\.google\.com/);
  await page.click("[data-close-action-workspace]");
  await page.click('[data-open-prospect="p1"]');
  await page.waitForSelector("[data-prospect-detail-dialog][open]");
  assert.match(await page.$eval(".forge-prospect-detail-list--primary", node => node.textContent), /Teléfono|WhatsApp|Referido por|Etapa/);
  await page.screenshot({ path: join(evidenceDir, "desktop-prospect-detail.png"), fullPage: true });
  console.log("067G17N PIPELINE COCKPIT BROWSER: PASS");
} finally {
  await browser.close();
  server.close();
}
