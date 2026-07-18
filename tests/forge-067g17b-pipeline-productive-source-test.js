"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("READY public config explicitly authorizes productive CRUD only",()=>{
 const source=read("docs/static-preview/forge-alive/forge-alive-public-config-067g17a1.js");
 assert.match(source,/state: 'READY'[\s\S]*productiveProspectCrudAuthorized: true/);
 assert.match(source,/allowsProductiveProspectCrud: \(\) => result\.state === 'READY'/);
 assert.match(source,/state: 'DEMO_EXPLICIT'[\s\S]*productiveProspectCrudAuthorized: false/);
});

test("Pipeline consumes Supabase service and never silently falls back to demo",()=>{
 const source=read("docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js");
 assert.match(source,/await globalThis\.ForgeProductiveProspectBootstrap067G17B\.getClient\(\)/);
 assert.match(source,/ForgeProductiveProspectUI067G17B\.create/);
 assert.match(source,/await productivePipeline\.load\(\)/);
 assert.match(source,/config\?\.state === 'DEMO_EXPLICIT'/);
 assert.doesNotMatch(source,/catch[\s\S]{0,300}sample-data|catch[\s\S]{0,300}fixtures/i);
});

test("browser client is pinned and initialized from public config authority",()=>{
 const bootstrap=read("advisor-os/sales-pipeline/productive-prospect-bootstrap.js");
 assert.match(bootstrap,/@supabase\/supabase-js@2\.108\.2\/dist\/umd\/supabase\.js/);
 assert.match(bootstrap,/allowsProductiveProspectCrud/);
 assert.match(bootstrap,/state\.publicConfig/);
 assert.match(bootstrap,/persistSession:true/);
 assert.doesNotMatch(bootstrap,/service.?role|ACCESS_TOKEN|password/i);
});
