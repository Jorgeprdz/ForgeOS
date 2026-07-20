"use strict";
(function(global){
const CONTRACT_ID="FORGE_PRODUCTIVE_PROSPECT_BOOTSTRAP_067G17B_V1";
const MODULE_BASE_URL=global.document?.currentScript?.src||global.document?.baseURI||"";
let client=null;
let libraryPromise=null;
let contactActionsPromise=null;
function loadScript(path,globalName,datasetName){
 if(global[globalName])return Promise.resolve(global[globalName]);
 return new Promise((resolve,reject)=>{
  const script=global.document.createElement("script");
  script.src=new URL(path,MODULE_BASE_URL).href;
  script.dataset[datasetName]="true";
  script.onload=()=>global[globalName]?resolve(global[globalName]):reject(Object.assign(new Error(`${globalName}_INVALID`),{code:"CONTACT_ACTIONS_UNAVAILABLE"}));
  script.onerror=()=>reject(Object.assign(new Error(`${globalName}_LOAD_FAILED`),{code:"CONTACT_ACTIONS_UNAVAILABLE"}));
  global.document.head.append(script);
 });
}
function loadContactActions(){
 if(global.ForgeProspectContactActions067G17C2A)return Promise.resolve(global.ForgeProspectContactActions067G17C2A);
 if(!global.document)return Promise.reject(Object.assign(new Error("PROSPECT_CONTACT_ACTIONS_UNAVAILABLE"),{code:"CONTACT_ACTIONS_UNAVAILABLE"}));
 if(contactActionsPromise)return contactActionsPromise;
 contactActionsPromise=loadScript("prospect-message-context-adapter.js","ForgeProspectMessageContextAdapter067G17N6","forgeProspectMessageContextAdapter")
  .then(()=>loadScript("../../manager-os/message-generation/nash-prospect-deterministic-draft-adapter.js","ForgeNashProspectDeterministicDraftAdapter067G17N7","forgeNashProspectDraftAdapter"))
  .then(()=>loadScript("prospect-contact-actions.js","ForgeProspectContactActions067G17C2A","forgeProspectContactActions"));
 return contactActionsPromise;
}
function loadBrowserLibrary(){
 if(typeof global.supabase?.createClient==="function")return Promise.resolve(global.supabase);
 if(!global.document)return Promise.reject(Object.assign(new Error("SUPABASE_BROWSER_CLIENT_UNAVAILABLE"),{code:"CLIENT_UNAVAILABLE"}));
 if(libraryPromise)return libraryPromise;
 libraryPromise=new Promise((resolve,reject)=>{
  const script=global.document.createElement("script");
  script.src="https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js";
  script.dataset.forgeSupabaseClient="2.108.2";
  script.onload=()=>typeof global.supabase?.createClient==="function"?resolve(global.supabase):reject(Object.assign(new Error("SUPABASE_BROWSER_CLIENT_INVALID"),{code:"CLIENT_UNAVAILABLE"}));
  script.onerror=()=>reject(Object.assign(new Error("SUPABASE_BROWSER_CLIENT_LOAD_FAILED"),{code:"NETWORK_ERROR"}));
  global.document.head.append(script);
 });
 return libraryPromise;
}
async function getClient(){
 await loadContactActions();
 const config=global.ForgeAlivePublicConfig067G17A1;
 const state=config?.current?.();
 if(!config?.allowsProductiveProspectCrud?.()||state?.state!=="READY"){
  const error=new Error(state?.state==="DEMO_EXPLICIT"?"PRODUCTIVE_PROSPECTS_DISABLED_IN_DEMO":"PRODUCTIVE_PROSPECT_CONFIG_BLOCKED");
  error.code=state?.state==="DEMO_EXPLICIT"?"DEMO_MODE":"CONFIG_BLOCKED";
  throw error;
 }
 if(client)return client;
 const library=await loadBrowserLibrary();
 const {SUPABASE_URL,SUPABASE_KEY}=state.publicConfig;
 client=library.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
async function getSession(){const c=await getClient();return c.auth.getSession();}
async function getUser(){const c=await getClient();return c.auth.getUser();}
async function signInWithGoogle(options={}){
 const c=await getClient();
 const redirectTo=typeof options.redirectTo==="string"?options.redirectTo:"";
 return c.auth.signInWithOAuth({provider:"google",options:{redirectTo,skipBrowserRedirect:false}});
}
async function signOut(){const c=await getClient();return c.auth.signOut();}
async function onAuthStateChange(callback){
 if(typeof callback!=="function")throw new Error("AUTH_STATE_CALLBACK_REQUIRED");
 const c=await getClient();
 return c.auth.onAuthStateChange(callback);
}
function diagnostics(){const state=global.ForgeAlivePublicConfig067G17A1?.current?.();return Object.freeze({contractId:CONTRACT_ID,configState:state?.state||"UNAVAILABLE",demoMode:state?.demoMode===true,clientInitialized:Boolean(client)});}
global.ForgeProductiveProspectBootstrap067G17B=Object.freeze({contractId:CONTRACT_ID,getClient,getSession,getUser,signInWithGoogle,signOut,onAuthStateChange,diagnostics});
if(typeof module!=="undefined"&&module.exports)module.exports={getClient,getSession,getUser,signInWithGoogle,signOut,onAuthStateChange,diagnostics,loadContactActions};
})(typeof globalThis!=="undefined"?globalThis:window);
