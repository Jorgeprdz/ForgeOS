import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const AURA = path.join(ROOT, 'docs/static-preview/forge-aura');
const CARTERA = path.join(AURA, 'cartera');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const router = read('docs/static-preview/forge-aura/aura-router-v4.js');
const app = read('docs/static-preview/forge-aura/app-v4.js');
const shell = read('docs/static-preview/forge-aura/aura-shell.js');
const index = read('docs/static-preview/forge-aura/index.html');
const moduleSource = read('docs/static-preview/forge-aura/cartera/cartera-module.js');
const moduleV4Source = read('docs/static-preview/forge-aura/cartera/cartera-module-v4.js');
const adapterSource = read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js');
const adapterV8Source = read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js');
const semanticSource = read('docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js');
const coverageAdapterSource = read('docs/static-preview/forge-aura/cartera/cartera-coverage-adapter.js');
const coreSource = read('docs/static-preview/forge-aura/cartera/cartera-core.js');

function walkJs(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkJs(target);
    return entry.isFile() && entry.name.endsWith('.js') ? [target] : [];
  });
}
const carteraJs = walkJs(CARTERA);
const carteraSource = carteraJs.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const coreUrl = pathToFileURL(path.join(CARTERA, 'cartera-core.js')).href;
const coverageAdapterUrl = pathToFileURL(path.join(CARTERA, 'cartera-coverage-adapter.js')).href;
const directSupabaseDml = /\.from\s*\([^)]*\)(?:(?!;)[\s\S]){0,600}\.(?:insert|update|delete)\s*\(/;

function queryFor(table) {
  const state = { eq: [] };
  const query = {
    select() { return query; }, eq(column, value) { state.eq.push([column, value]); return query; }, is() { return query; }, order() { return query; }, limit() { return query; },
    async single() {
      if (table === 'canonical_policies') return { data: { id: 'policy-db-id', policy_reference: 'policy:test', current_version: 7, archived_at: null }, error: null };
      if (table === 'policy_versions') { assert.deepEqual(state.eq, [['policy_id','policy-db-id'],['version_number',7]]); return { data: { id:'policy-version-db-id', policy_version_reference:'policy-version:test:7', version_number:7, evidence_version_id:'evidence-db-id' }, error:null }; }
      if (table === 'policy_evidence_versions') { assert.deepEqual(state.eq, [['id','evidence-db-id'],['policy_id','policy-db-id']]); return { data:{evidence_version_reference:'evidence-version:test'}, error:null }; }
      throw new Error(`UNEXPECTED_TABLE_${table}`);
    },
  };
  return query;
}

test('Cartera is registered in the shared Aura V4 router and shell', () => {
  assert.match(router, /cartera:\s*["']cartera["']/); assert.match(shell, /data-aura-route-link=["']cartera["']/); assert.match(app, /createAuraRouter/); assert.match(app, /createAuraShell/); assert.match(app, /createAuraAuth/); assert.match(app, /createCarteraModule/); assert.doesNotMatch(carteraSource, /function\s+createAura(?:Router|Shell|Auth)|const\s+createAura(?:Router|Shell|Auth)/);
});
test('Aura Light remains the only presentation boundary for Cartera', () => { assert.match(index, /FORGE_AURA_LIGHT_2026_V4/); assert.match(index, /aura-tokens\.css/); assert.doesNotMatch(carteraSource, /material3[^'"\n]*\.css|forge-m3-app-shell|phone-shell/); });
test('policy entry hierarchy is PDF first, bulk second and manual third', () => { assert.match(moduleSource, /Sube la carátula de la póliza|Subir carátula/); assert.match(moduleSource, /Excel o CSV/); assert.match(moduleSource, /Capturar manualmente/); });
test('PDF extraction enters Evidence 020B and only human confirmation crosses 020C', () => { assert.match(adapterSource, /forge_cartera020b_admit_evidence/); assert.match(adapterSource, /forge_cartera020b_claim_evidence/); assert.match(adapterSource, /forge_cartera020b_record_processing_result/); assert.match(adapterSource, /requiresHumanReview:true/); assert.match(adapterSource, /createsPolicyTruth:false/); assert.match(adapterSource, /forge_cartera020c_prepare_identity_orchestration/); assert.match(adapterSource, /forge_cartera020c_attach_policy_confirmation/); assert.match(adapterSource, /requiresExplicitExecution:true/); });
test('PDF Edge intake authenticates from the Aura V4 client session only', () => { assert.match(adapterSource, /client\.auth\.getSession\(\)/); assert.match(adapterSource, /sessionHeaders\(client,windowRef\)/); assert.doesNotMatch(adapterSource, /ForgeProductiveProspectBootstrap067G17B|ForgeAlivePublicConfig067G17A1/); });
test('PDF multi-Coverage extraction is candidate-only and governed', () => {
  assert.match(adapterSource, /pdfMultiCoverageExtraction:false/);
  assert.match(adapterV8Source, /pdfMultiCoverageExtraction:\s*true/);
  assert.match(adapterV8Source, /confirmNewPolicyCoverage/);
  assert.match(semanticSource, /createsTruth:\s*false/);
  assert.match(semanticSource, /requiresHumanReview:\s*true/);
  assert.match(moduleV4Source, /Coberturas detectadas/);
  assert.doesNotMatch(moduleV4Source, /Coberturas detectadas: no disponibles en este parser/);
});
test('Cartera frontend contains no canonical insert/update/delete writes', () => { for (const file of carteraJs) assert.doesNotMatch(fs.readFileSync(file,'utf8'), directSupabaseDml, `direct canonical mutation found in ${path.relative(ROOT,file)}`); });
test('bulk unknown semantics preserve absent or unrecognized facts without defaults', async () => { const { mapPortfolioRows } = await import(`${coreUrl}?contract=${Date.now()}`); const result=mapPortfolioRows([['Titular','Poliza','Producto','Estado','Moneda','Frecuencia'],['Ana Sintética','SYN-1','Vida','estado misterioso','','cuando se pueda']],'synthetic.csv'); assert.equal(result.length,1); assert.equal(result[0].draft.status,null); assert.equal(result[0].draft.currency,null); assert.equal(result[0].draft.paymentFrequency,null); assert.equal(result[0].state,'REQUIRES_REVIEW'); });
test('no legacy unknown normalization forces MXN, ACTIVE or MONTHLY', () => { assert.doesNotMatch(adapterSource, /\|\|\s*['"]MXN['"]/); assert.doesNotMatch(adapterSource, /\|\|\s*['"]ACTIVE['"]/); assert.doesNotMatch(adapterSource, /\|\|\s*['"]MONTHLY['"]/); assert.doesNotMatch(coreSource, /\|\|\s*['"]MXN['"]/); assert.doesNotMatch(coreSource, /\|\|\s*['"]ACTIVE['"]/); assert.doesNotMatch(coreSource, /\|\|\s*['"]MONTHLY['"]/); });
test('Coverage writer binds exact PolicyVersion/Evidence and keeps unknown facts null', async () => {
  const calls=[]; const client={auth:{getUser:async()=>({data:{user:{id:'advisor:test'}},error:null})},from:table=>queryFor(table),rpc:async(name,args)=>{calls.push({name,args});return{data:{status:'CONFIRMED',readAfterWriteVerified:true},error:null};}};
  const { confirmNewPolicyCoverage }=await import(`${coverageAdapterUrl}?contract=${Date.now()}`); await confirmNewPolicyCoverage({client,policyReference:'policy:test',input:{policyCoverageReference:'coverage:test',coverageKind:'OTHER',coveragePeriodValue:12,paymentPeriodValue:1}}); assert.equal(calls.length,1); assert.equal(calls[0].name,'forge_policy_intelligence_confirm_policy_coverages'); const command=calls[0].args.p_command; assert.equal(command.policyVersionReference,'policy-version:test:7'); assert.equal(command.evidenceVersionReference,'evidence-version:test'); assert.equal(command.coverages[0].policyVersionReference,'policy-version:test:7'); assert.equal(command.coverages[0].currency,null); assert.equal(command.coverages[0].coverageState,null); assert.equal(command.coverages[0].coveragePeriodUnit,null); assert.equal(command.coverages[0].paymentPeriodUnit,null);
});
test('Policy Workspace reads Coverage only through canonical RPC and supports children', async () => { assert.match(adapterSource, /forge_policy_intelligence_read_policy_coverages/); assert.match(coverageAdapterSource, /forge_policy_intelligence_confirm_policy_coverages/); const { coverageRows }=await import(`${coreUrl}?coverage=${Date.now()}`); const rows=coverageRows({coverages:[{policyCoverageReference:'c:1',coverageLabel:'Uno'},{policyCoverageReference:'c:2',coverageLabel:'Dos'},{policyCoverageReference:'c:3',coverageLabel:'Tres'}]}); assert.equal(rows.length,3); assert.deepEqual(rows.map(row=>row.reference),['c:1','c:2','c:3']); });
test('beneficiary PII is never projected by the generic indicator', async () => { const { sanitizeBeneficiaryIndicator }=await import(`${coreUrl}?privacy=${Date.now()}`); const trap='RESTRICTED_SYNTHETIC_VALUE'; const safe=sanitizeBeneficiaryIndicator([{roleType:'BENEFICIARY',displayName:trap,governmentId:trap}]); assert.equal(safe.detected,true); assert.equal(JSON.stringify(safe).includes(trap),false); assert.match(safe.detail,/restringida/i); assert.doesNotMatch(moduleV4Source,/beneficiary.*(?:displayName|governmentId|phone|email)/i); });
test('attention layer is capped at three explainable signals with no automatic decision', async () => { const { deriveAttention }=await import(`${coreUrl}?attention=${Date.now()}`); const policies=Array.from({length:8},(_,index)=>({policy_reference:`policy:${index}`,policy_number:`SYN-${index}`,completeness_state:'PARTIAL',conflict_state:'CLEAR'})); assert.equal(deriveAttention({policies}).length,3); assert.match(moduleSource,/Máximo tres señales explicables/); assert.match(moduleSource,/Ninguna acción se ejecuta automáticamente/); });
test('relationship/productivity context remains advisory and non-manipulative', () => { assert.match(adapterSource,/no score, probabilidad ni acción automática/); assert.match(moduleSource,/Nada aquí crea oportunidades o mensajes automáticamente/); assert.doesNotMatch(carteraSource,/auto(?:matic)?(?:Message|Opportunity|Decision)|manipulat/i); });
test('session lifecycle has abort, revision guard, unmount and DOM scrub boundaries', () => { assert.match(moduleSource,/AbortController/); assert.match(moduleSource,/revision/); assert.match(moduleSource,/abort\(/); assert.match(moduleSource,/unmount/); assert.match(app,/unmount/); assert.match(app,/bootRevision|revision/i); assert.match(app,/replaceChildren\s*\(\s*\)/); });
test('Product Intelligence, identity, Policy and Coverage authorities are not duplicated', () => { assert.doesNotMatch(carteraSource,/createProductIntelligence|writeProductTruth|createPolicyTruth|createCoverageTruth/); assert.match(adapterSource,/forge_cartera010b_confirm_identity_and_policy|forge_cartera020c_attach_policy_confirmation/); assert.match(coverageAdapterSource,/forge_policy_intelligence_confirm_policy_coverages/); });
test('Aura import map bridges canonical Pages runtime instead of publishing Material 3', () => { assert.match(index, /["']\.\.\/forge-alive-material3\/["']\s*:\s*["']\.\.\/forge-alive\/["']/); assert.match(adapterSource,/safe-xlsx-decoder\.js/); });
