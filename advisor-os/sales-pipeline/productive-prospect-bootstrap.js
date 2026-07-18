"use strict";
(function(global){
const CONTRACT_ID="FORGE_PRODUCTIVE_PROSPECT_BOOTSTRAP_067G17B_V1";
let client=null;
let libraryPromise=null;
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
if(typeof module!=="undefined"&&module.exports)module.exports={getClient,getSession,getUser,signInWithGoogle,signOut,onAuthStateChange,diagnostics};
})(typeof globalThis!=="undefined"?globalThis:window);
