import assert from 'node:assert/strict';
import http from 'node:http';
import { appendFileSync, createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const puppeteer = (await import(process.env.FORGE_PUPPETEER_CORE_PATH)).default;
const chromiumPath = process.env.FORGE_CHROMIUM_PATH;
const evidenceDir = process.env.FORGE_067G17C_EVIDENCE_DIR;
assert.ok(chromiumPath && evidenceDir, 'BROWSER_PATHS_AND_EVIDENCE_REQUIRED');
mkdirSync(evidenceDir, { recursive: true });
const root = process.cwd();
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };
const harness = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>067G17C2A Contact Actions</title><link rel="stylesheet" href="/advisor-os/sales-pipeline/pipeline-ui.css"><script>
window.__SIDE_EFFECTS={open:0,assign:0,replace:0,click:0,fetch:0,timeout:0,interval:0,mutation:0,performance:0,statusWrites:0};window.__EXTERNAL_NAVIGATIONS=[];
document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(link&&/^(tel:|https:\\/\\/(?:wa\\.me|calendar\\.google\\.com))/.test(link.href)){window.__EXTERNAL_NAVIGATIONS.push({href:link.href,trusted:event.isTrusted});event.preventDefault();}},true);
window.open=()=>{window.__SIDE_EFFECTS.open+=1};window.fetch=()=>{window.__SIDE_EFFECTS.fetch+=1;return Promise.reject(new Error('FETCH_INTERCEPTED'))};const nativeClick=HTMLElement.prototype.click;HTMLElement.prototype.click=function(){window.__SIDE_EFFECTS.click+=1;return nativeClick.call(this)};window.setTimeout=()=>{window.__SIDE_EFFECTS.timeout+=1;return 0};window.setInterval=()=>{window.__SIDE_EFFECTS.interval+=1;return 0};window.MutationObserver=class{constructor(){window.__SIDE_EFFECTS.mutation+=1}observe(){}disconnect(){}};window.PerformanceObserver=class{constructor(){window.__SIDE_EFFECTS.performance+=1}observe(){}disconnect(){}};
</script></head><body><main data-harness-root></main><script src="/advisor-os/sales-pipeline/pipeline-ui.js"></script><script src="/advisor-os/sales-pipeline/prospect-message-context-adapter.js"></script><script src="/manager-os/message-generation/nash-prospect-deterministic-draft-adapter.js"></script><script src="/advisor-os/sales-pipeline/prospect-contact-actions.js"></script><script>
const verifiedField=value=>({value,evidence:['fixture:verified'],verificationStatus:'VERIFIED',freshness:'2026-07-20T00:00:00Z',privacyClassification:'FORGE_CONFIDENTIAL_PROSPECT'});const messageContext=name=>({prospectIdentityReference:'prospect:fixture',advisorIdentityReference:'advisor:fixture',contextPurpose:'PROSPECT_INTRODUCTION',projectedAt:'2026-07-20T00:00:00Z',fields:{prospectDisplayName:verifiedField(name),advisorDisplayName:verifiedField('Jorge Palacios')}});window.__ROWS=[{id:'valid',fullName:'Prospecto Demo',status:'referred_new',phoneNormalized:'+525500000001',whatsappNormalized:'+525500000001',source:'Referido',referrerName:'Referente Demo',initialContext:'Fixture controlado',createdAt:'2026-07-20T00:00:00Z',prospectMessageContextInput:messageContext('Prospecto Demo')},{id:'invalid',fullName:'Prospecto Sin Número',status:'referred_new',phone:'123',whatsapp:'abc',source:'Evento',createdAt:'2026-07-20T00:00:00Z'}];window.ForgeProductiveProspectService067G17B={create(){return{async listProspects(){return window.__ROWS.slice()},async createProspect(){throw new Error('OUT_OF_SCOPE')},async updateProspect(){window.__SIDE_EFFECTS.statusWrites+=1;throw new Error('STATUS_WRITE')},async archiveProspect(){throw new Error('OUT_OF_SCOPE')}}}};
</script><script src="/advisor-os/sales-pipeline/productive-prospect-ui.js"></script><script>window.__PIPELINE=window.ForgeProductiveProspectUI067G17B.create({client:{},root:document.querySelector('[data-harness-root]')});window.__PIPELINE.load();</script></body></html>`;
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  if (pathname === '/forge-067g17c-harness') { response.writeHead(200, { 'Content-Type':'text/html' }).end(harness); return; }
  const candidate = normalize(join(root, pathname.replace(/^\/+/, '')));
  if (!candidate.startsWith(root)) return response.writeHead(403).end();
  try { const info = await stat(candidate); const file = info.isDirectory() ? join(candidate, 'index.html') : candidate; response.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream' }); createReadStream(file).pipe(response); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath:chromiumPath, headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote'] });
const report = { status:'PASS', viewports:[], checks:[] };
const record = (name, details={}) => report.checks.push({ name, status:'PASS', ...details });
const zero = value => Object.values(value).every(count => count === 0);
const sourceHead = process.env.FORGE_SOURCE_HEAD;
const captureTimestamp = process.env.FORGE_CAPTURE_TIMESTAMP;
const captureIndex = join(evidenceDir, 'capture-index.jsonl');
assert.match(sourceHead || '', /^[0-9a-f]{40}$/);
assert.match(captureTimestamp || '', /^\d{8}-\d{6}$/);
function captureName(viewport, zoom, state) {
  return `067g17c2a__contact-detail__${viewport}__${Math.round(zoom * 100)}pct__${state}__${captureTimestamp}.png`;
}
async function capture(page, { viewport, zoom, state, type='contact-detail', expected='Visible, contained, reviewable and user-controlled' }) {
  const file = captureName(viewport, zoom, state);
  await page.screenshot({ path:join(evidenceDir,file), fullPage:false });
  appendFileSync(captureIndex, `${JSON.stringify({ CAPTURE_FILE:file, CAPTURE_TYPE:type, VIEWPORT:viewport, ZOOM:`${Math.round(zoom*100)}%`, STATE:state, EXPECTED_RESULT:expected, ACTUAL_RESULT:'Matches expected result', PASS_OR_FAIL:'PASS', SOURCE_HEAD:sourceHead, TIMESTAMP:new Date().toISOString() })}\n`);
}
try {
  const page = await browser.newPage();
  const external = [];
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (/^(tel:|https:\/\/(?:wa\.me|calendar\.google\.com))/.test(url)) { external.push(url); request.abort(); }
    else request.continue();
  });
  await page.setViewport({ width:390, height:844, isMobile:true, hasTouch:true });
  await page.goto(`${baseUrl}/forge-067g17c-harness`, { waitUntil:'networkidle0' });
  await page.waitForSelector('[data-open-prospect="valid"]');
  const lifecycle = await page.evaluate(async () => {
    dispatchEvent(new Event('pageshow')); dispatchEvent(new PopStateEvent('popstate'));
    dispatchEvent(new StorageEvent('storage')); dispatchEvent(new CustomEvent('forge:test'));
    await window.__PIPELINE.load();
    return window.__SIDE_EFFECTS;
  });
  assert.equal(zero(lifecycle), true, `AUTOMATIC_SIDE_EFFECT:${JSON.stringify(lifecycle)}`);
  assert.equal(external.length, 0);
  record('ZERO_AUTOMATIC_EXECUTION', lifecycle);

  await page.click('[data-open-prospect="valid"]');
  await page.waitForSelector('[data-prospect-detail-dialog][open]');
  assert.equal(await page.$$eval('[data-prospect-detail-dialog]', nodes => nodes.length), 1);
  record('RERENDER_HAS_ONE_DETAIL_LISTENER');
  assert.equal(external.length, 0);
  const valid = await page.evaluate(() => ({
    labels:[...document.querySelectorAll('.forge-prospect-action-row>*')].map(node => node.textContent.trim()),
    call:document.querySelector('[data-call-action]').getAttribute('href'),
    wa:document.querySelector('[data-whatsapp-action]').getAttribute('href'),
    preview:document.querySelector('[data-whatsapp-preview]').value,
    sideEffects:window.__SIDE_EFFECTS,
  }));
  assert.deepEqual(valid.labels, ['Llamar','WhatsApp','Agendar']);
  assert.equal(valid.call, 'tel:+525500000001');
  assert.doesNotMatch(valid.preview, /Soy tu asesor|Información privada|90000/);
  assert.equal(zero(valid.sideEffects), true);
  record('VALID_CALL_AND_REVIEWABLE_WHATSAPP');
  await page.$eval('[data-whatsapp-preview]', node => node.scrollIntoView({ block:'center' }));
  await capture(page,{ viewport:'390x844',zoom:1,state:'call-enabled-whatsapp-preview' });
  await page.$eval('[data-call-action]', node => node.scrollIntoView({ block:'center' }));
  await page.click('[data-call-action]');
  let intercepted = await page.evaluate(() => window.__EXTERNAL_NAVIGATIONS);
  assert.equal(intercepted.filter(item => item.trusted && item.href === 'tel:+525500000001').length, 1);
  record('TRUSTED_CALL_CLICK_INTERCEPTED');

  await page.select('[data-whatsapp-tone]', 'cercano');
  assert.equal(external.length, 0);
  assert.equal(zero(await page.evaluate(() => window.__SIDE_EFFECTS)), true);
  record('TONE_CHANGE_DOES_NOT_OPEN');
  await page.$eval('[data-whatsapp-preview]', node => node.scrollIntoView({ block:'center' }));
  await capture(page,{ viewport:'390x844',zoom:1,state:'tone-change-no-external-open' });

  await page.click('[data-whatsapp-action]');
  await new Promise(resolve => setImmediate(resolve));
  intercepted = await page.evaluate(() => window.__EXTERNAL_NAVIGATIONS);
  assert.ok(intercepted.some(item => item.trusted && item.href.startsWith('https://wa.me/525500000001?text=')));
  record('TRUSTED_WHATSAPP_CLICK_INTERCEPTED');

  await page.$eval('[data-calendar-date]', node => { node.value='2026-08-12'; node.dispatchEvent(new Event('change',{bubbles:true})); });
  assert.equal(await page.$eval('[data-calendar-action]', node => node.hasAttribute('href')), false);
  await page.$eval('[data-calendar-error]', node => node.scrollIntoView({ block:'center' }));
  await capture(page,{ viewport:'390x844',zoom:1,state:'calendar-invalid' });
  await page.$eval('[data-calendar-time]', node => { node.value='09:30'; node.dispatchEvent(new Event('change',{bubbles:true})); });
  const calendar = await page.$eval('[data-calendar-action]', node => node.href);
  assert.match(calendar, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  assert.match(decodeURIComponent(calendar), /America\/Mexico_City/);
  await page.$eval('[data-calendar-preview]', node => node.scrollIntoView({ block:'center' }));
  await capture(page,{ viewport:'390x844',zoom:1,state:'calendar-valid' });
  assert.equal(intercepted.filter(item => item.href.includes('calendar.google.com')).length, 0);
  await page.click('[data-calendar-action]');
  await new Promise(resolve => setImmediate(resolve));
  intercepted = await page.evaluate(() => window.__EXTERNAL_NAVIGATIONS);
  assert.equal(intercepted.filter(item => item.trusted && item.href.includes('calendar.google.com')).length, 1);
  record('CALENDAR_INVALID_BLOCKED_VALID_CLICK_INTERCEPTED');

  await page.click('[data-close-prospect-detail]');
  await page.click('[data-open-prospect="invalid"]');
  const invalid = await page.evaluate(() => ({ call:document.querySelector('[data-call-action]').getAttribute('aria-disabled'), wa:document.querySelector('[data-whatsapp-action]').getAttribute('aria-disabled') }));
  assert.deepEqual(invalid, { call:'true', wa:'true' });
  record('INVALID_PHONE_ACTIONS_DISABLED');
  await page.$eval('[data-call-action]', node => node.scrollIntoView({ block:'center' }));
  await capture(page,{ viewport:'390x844',zoom:1,state:'call-disabled-no-number' });

  await page.reload({ waitUntil:'networkidle0' });
  assert.equal(external.length, 0);
  assert.equal(zero(await page.evaluate(() => window.__SIDE_EFFECTS)), true);
  record('RELOAD_DOES_NOT_ACT');

  const viewports = [[360,800],[390,844],[768,1024],[1024,768],[1280,800],[1366,768],[1440,900],[1536,864]];
  for (const zoom of [1,1.25]) for (const [width,height] of viewports) {
    await page.setViewport({ width, height, deviceScaleFactor:zoom, isMobile:width<600, hasTouch:width<600 });
    await page.goto(`${baseUrl}/forge-067g17c-harness`, { waitUntil:'networkidle0' });
    await page.click('[data-open-prospect="valid"]');
    const geometry = await page.evaluate(() => {
      const dialog=document.querySelector('[data-prospect-detail-dialog]'); const rect=dialog.getBoundingClientRect();
      const actions=[...document.querySelectorAll('.forge-prospect-action-row>*')].map(node=>{const r=node.getBoundingClientRect();return {w:r.width,h:r.height,visible:r.width>0&&r.height>0};});
      return { overflow:document.documentElement.scrollWidth>innerWidth+1, within:rect.left>=0&&rect.right<=innerWidth+1&&rect.top>=0&&rect.bottom<=innerHeight+1, actions };
    });
    assert.equal(geometry.overflow, false, `OVERFLOW:${width}x${height}@${zoom}`);
    assert.equal(geometry.within, true, `DIALOG_CLIPPED:${width}x${height}@${zoom}`);
    assert.equal(geometry.actions.every(action => action.visible && action.h >= 44), true, `ACTION_TARGET:${width}x${height}@${zoom}`);
    report.viewports.push({ width,height,zoom,status:'PASS' });
    await capture(page,{ viewport:`${width}x${height}`,zoom,state:'final-accepted-actions-visible' });
  }
  await page.focus('[data-call-action]');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.matches('[data-whatsapp-action]')), true);
  await capture(page,{ viewport:'1536x864',zoom:1.25,state:'keyboard-focus' });
  const keyboardBefore = (await page.evaluate(() => window.__EXTERNAL_NAVIGATIONS)).length;
  await page.keyboard.press('Enter');
  const keyboardAfter = await page.evaluate(() => window.__EXTERNAL_NAVIGATIONS);
  assert.equal(keyboardAfter.length, keyboardBefore + 1);
  assert.equal(keyboardAfter.at(-1).trusted, true);
  record('KEYBOARD_FOCUS_AND_TOUCH_TARGETS');
  writeFileSync(join(evidenceDir,'067g17c-contact-actions-browser-report.json'), JSON.stringify(report,null,2));
  console.log('067G17C2A CONTACT ACTIONS BROWSER: PASS');
} finally { await browser.close(); server.close(); }
