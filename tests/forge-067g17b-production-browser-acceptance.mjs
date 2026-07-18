import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const required=['FORGE_PUPPETEER_CORE_PATH','FORGE_CHROMIUM_PATH','FORGE_067G17B_PRODUCTION_URL','FORGE_067G17B_EVIDENCE_DIR','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD'];
for(const name of required)assert.ok(process.env[name],`${name}_MISSING`);
const puppeteer=(await import(process.env.FORGE_PUPPETEER_CORE_PATH)).default;
const evidenceDir=process.env.FORGE_067G17B_EVIDENCE_DIR;mkdirSync(evidenceDir,{recursive:true});
const ledger=[];const record=(name,status)=>ledger.push({name,status});
const browser=await puppeteer.launch({executablePath:process.env.FORGE_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage();
const failures=[];page.on('pageerror',error=>failures.push(error.message));page.on('dialog',dialog=>void dialog.accept());
const url=new URL(process.env.FORGE_067G17B_PRODUCTION_URL);url.searchParams.set('nav','pipeline');
const suffix=String(Date.now()).slice(-8),fullName=`067G17B PROD ${suffix}`;
async function submitOpenForm(fields){
 const result=await page.evaluate(values=>{const dialog=document.querySelector('[data-prospect-form-dialog][open]');const form=dialog?.querySelector('[data-prospect-form]');if(!form)return {ok:false,missing:['form']};const missing=[];for(const [name,value] of Object.entries(values)){const field=form.elements.namedItem(name);if(!field){missing.push(name);continue;}field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));}if(missing.length)return {ok:false,missing};form.requestSubmit();return {ok:true,missing:[]};},fields);
 assert.deepEqual(result,{ok:true,missing:[]},'PRODUCTIVE_FORM_CONTRACT_MISSING');
}
async function login(email,password){
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>globalThis.ForgeProductiveProspectBootstrap067G17B?.getClient,{timeout:30000});
 const result=await page.evaluate(async credentials=>{const client=await globalThis.ForgeProductiveProspectBootstrap067G17B.getClient();await client.auth.signOut();const {error}=await client.auth.signInWithPassword(credentials);return error?{error:error.message}:{ok:true};},{email,password});
 assert.equal(result.ok,true,'PRODUCTION_AUTH_FAILED');await page.reload({waitUntil:'domcontentloaded',timeout:60000});await page.waitForSelector('[data-forge-alive-primary-outlet-067g16a]:not([hidden]) [data-productive-prospect-pipeline="067g17b"] [data-add-prospect]',{visible:true,timeout:30000});
}
try{
 await page.setViewport({width:390,height:844,deviceScaleFactor:1});
 await login(process.env.ADVISOR_A_EMAIL,process.env.ADVISOR_A_PASSWORD);record('production_login','PASS');
 const addClicked=await page.evaluate(()=>{const outlet=document.querySelector('[data-forge-alive-primary-outlet-067g16a]:not([hidden])');const pipeline=outlet?.querySelector('[data-productive-prospect-pipeline="067g17b"]');const button=Array.from(pipeline?.querySelectorAll('[data-add-prospect]')||[]).find(node=>node.getClientRects().length&&!node.disabled);if(!button)return false;button.click();return true;});assert.equal(addClicked,true,'VISIBLE_PRODUCTIVE_ADD_PROSPECT_ACTION_MISSING');await page.waitForSelector('[data-prospect-form-dialog][open] [name="fullName"]',{visible:true,timeout:30000});
 await submitOpenForm({fullName,phone:`+52${suffix}21`,source:'Evento',initialContext:'Controlled production acceptance fixture'});
 await page.waitForSelector('[data-prospect-detail-dialog][open]',{timeout:30000});
 const created=await page.evaluate(name=>{const card=Array.from(document.querySelectorAll('.forge-pipeline-card')).find(node=>node.querySelector('h3')?.textContent===name);return {id:card?.querySelector('[data-open-prospect]')?.dataset.openProspect||null,diagnostics:document.querySelector('[data-productive-prospect-pipeline]')?.dataset.productiveProspectPipeline||null};},fullName);
 assert.match(created.id,/^[0-9a-f-]{36}$/i);assert.equal(created.diagnostics,'067g17b');record('productive_create','PASS');record('canonical_id','PASS');record('detail_auto_open','PASS');
 assert.match(await page.$eval('[data-prospect-detail-dialog] .forge-pipeline-product',node=>node.textContent),/Referido nuevo/);record('referred_new_placement','PASS');
 await page.click('[data-edit-prospect]');await page.waitForSelector('[data-prospect-form-dialog][open] [name="occupation"]',{visible:true,timeout:30000});await submitOpenForm({occupation:'Productive acceptance'});await page.waitForSelector('[data-prospect-detail-dialog][open]',{timeout:30000});record('edit','PASS');
 const contact=await page.evaluate(()=>({call:document.querySelector('[data-prospect-detail-dialog] a[href^="tel:"]')?.href,whatsapp:document.querySelector('[data-whatsapp-action]')?.href}));assert.match(contact.call,/^tel:\+52/);assert.match(contact.whatsapp,/^https:\/\/wa\.me\//);record('call_action','PASS');record('whatsapp_action_no_send','PASS');
 await page.click('[data-close-prospect-detail]');await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(name=>Array.from(document.querySelectorAll('.forge-pipeline-card h3')).some(node=>node.textContent===name),{},fullName);record('reload_persistence','PASS');
 await page.screenshot({path:join(evidenceDir,'mobile-390-productive-pipeline.png'),fullPage:true});
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);assert.equal(horizontal,false);record('mobile_horizontal_overflow','NO');
 await page.evaluate(name=>{const card=Array.from(document.querySelectorAll('.forge-pipeline-card')).find(node=>node.querySelector('h3')?.textContent===name);card?.querySelector('[data-open-prospect]')?.click();},fullName);await page.waitForSelector('[data-prospect-detail-dialog][open]');assert.match(await page.$eval('.forge-prospect-detail-list',node=>node.textContent),/Productive acceptance/);record('edit_persistence','PASS');
 await page.click('[data-archive-prospect]');await page.waitForFunction(name=>!Array.from(document.querySelectorAll('.forge-pipeline-card h3')).some(node=>node.textContent===name),{},fullName);record('archive_flow','PASS');record('fixture_cleanup','PASS');
 await login(process.env.ADVISOR_B_EMAIL,process.env.ADVISOR_B_PASSWORD);const disclosed=await page.evaluate(name=>document.body.textContent.includes(name),fullName);assert.equal(disclosed,false);record('advisor_isolation','PASS');
 await page.setViewport({width:1366,height:768,deviceScaleFactor:1});await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#forge-pipeline-title');await page.screenshot({path:join(evidenceDir,'desktop-1366-productive-pipeline.png'),fullPage:true});record('desktop_pipeline','PASS');
 assert.equal(failures.length,0,failures.join('; '));record('production_acceptance','PASS');
}finally{writeFileSync(join(evidenceDir,'ledger.jsonl'),ledger.map(item=>JSON.stringify(item)).join('\n')+'\n');await browser.close();}
console.log('067G17B PRODUCTION BROWSER ACCEPTANCE: PASS');
