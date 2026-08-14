import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot=process.cwd();
export const CARTERA_REVIEW_PAGES_RUNTIME_ID='POST_017E_HOTFIX_002_CARTERA_REVIEW_RUNTIME_V1';
export const CARTERA_REVIEW_RUNTIME_ENTRYPOINTS=Object.freeze([
  'advisor-os/cartera/canonical-confirmation-review-service.js',
  'advisor-os/cartera/persistent-confirmation-orchestration-service.js',
  'policy-operations/intake/cartera-020c-governed-command-composer.js',
]);
function posix(value){return value.split(sep).join('/');}
function clean(value){return String(value||'').split(/[?#]/,1)[0];}
function specifiers(source){const out=new Set();for(const pattern of [/\b(?:import|export)\s+(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/gs,/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g])for(const match of source.matchAll(pattern))if(match[1]?.startsWith('.'))out.add(match[1]);return [...out];}
async function resolveModule(importer,specifier){const unresolved=resolve(dirname(join(repoRoot,importer)),clean(specifier));const extension=extname(unresolved);const candidates=extension?[unresolved]:[unresolved,`${unresolved}.js`,`${unresolved}.mjs`,join(unresolved,'index.js')];for(const candidate of candidates){try{await access(candidate);const path=posix(relative(repoRoot,candidate));if(path==='..'||path.startsWith('../'))throw new Error(`CARTERA_REVIEW_PAGES_IMPORT_OUTSIDE_REPO=${importer}:${specifier}`);if(!/[.]m?js$/i.test(path))throw new Error(`CARTERA_REVIEW_PAGES_NON_BROWSER_IMPORT=${importer}:${specifier}`);return path;}catch(error){if(error?.code!=='ENOENT')throw error;}}throw new Error(`CARTERA_REVIEW_PAGES_IMPORT_MISSING=${importer}:${specifier}`);}
async function collect(){const pending=[...CARTERA_REVIEW_RUNTIME_ENTRYPOINTS],found=new Set();while(pending.length){const current=pending.pop();if(found.has(current))continue;const source=await readFile(join(repoRoot,current),'utf8');found.add(current);for(const specifier of specifiers(source)){const dependency=await resolveModule(current,specifier);if(!found.has(dependency))pending.push(dependency);}}return [...found].sort();}
async function exactCopy(source,target){await mkdir(dirname(target),{recursive:true});await copyFile(source,target);const [a,b]=await Promise.all([readFile(source),readFile(target)]);if(!a.equals(b))throw new Error(`CARTERA_REVIEW_PAGES_COPY_MISMATCH=${target}`);}
export async function prepareCarteraReviewPagesRuntime({siteDir='_site'}={}){const site=resolve(siteDir);await access(site);const files=await collect();for(const file of files)await exactCopy(join(repoRoot,file),join(site,file));for(const required of CARTERA_REVIEW_RUNTIME_ENTRYPOINTS)await access(join(site,required));const manifest=Object.freeze({contractId:CARTERA_REVIEW_PAGES_RUNTIME_ID,entrypoints:CARTERA_REVIEW_RUNTIME_ENTRYPOINTS,files});await writeFile(join(site,'cartera-review-pages-runtime.json'),`${JSON.stringify(manifest,null,2)}\n`);console.log(`CARTERA_REVIEW_PAGES_RUNTIME=PASS files=${files.length}`);console.log('CARTERA_REVIEW_AUTHORITY_REUSED=CARTERA-020C->CARTERA-010B');return manifest;}
const invoked=process.argv[1]?resolve(process.argv[1]):'';if(invoked&&invoked===fileURLToPath(import.meta.url))await prepareCarteraReviewPagesRuntime({siteDir:process.argv[2]||'_site'});
