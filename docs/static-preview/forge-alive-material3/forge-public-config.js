const EXPECTED_PROJECT_REF="rmlxigxysujsuwzgoimv";
function resolvePublicConfig(env=globalThis.__ENV__){
  const url=String(env?.SUPABASE_URL||"").trim();
  const key=String(env?.SUPABASE_KEY||"").trim();
  let projectRef=null;
  try{projectRef=url?new URL(url).hostname.split(".")[0]:null;}catch{}
  const valid=Boolean(url&&key&&projectRef===EXPECTED_PROJECT_REF);
  return Object.freeze({
    valid,projectRef,expectedProjectRef:EXPECTED_PROJECT_REF,
    reason:valid?null:url||key?"PUBLIC_CONFIG_INCOMPLETE":"PUBLIC_CONFIG_MISSING",
  });
}
function renderBlockingNotice(state){
  document.querySelector("[data-forge-public-config-notice]")?.remove();
  if(state.valid)return;
  const notice=document.createElement("aside");
  notice.dataset.forgePublicConfigNotice="true";
  notice.setAttribute("role","alert");
  notice.textContent="Forge está bloqueado: falta la configuración pública requerida.";
  document.body.prepend(notice);
}
const state=resolvePublicConfig();
globalThis.__FORGE_PUBLIC_CONFIG_STATE__=state;
renderBlockingNotice(state);
export{EXPECTED_PROJECT_REF,resolvePublicConfig,renderBlockingNotice};
