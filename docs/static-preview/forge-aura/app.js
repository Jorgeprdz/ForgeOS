import { createAuraRouter } from "./aura-router.js";
import { createAuraShell } from "./aura-shell.js";
import { createAuraAuth, renderAuraLogin } from "./aura-auth.js";
import { createPipelineModule } from "./pipeline/pipeline-module.js";

const root=document.querySelector("[data-aura-app]");
const auth=createAuraAuth();
let shell=null;let pipeline=null;let router=null;let bootRevision=0;

function renderBoot(message,state="AUTH_LOADING"){
  root.setAttribute("aria-busy","true");root.innerHTML=`<section class="aura-login" data-aura-auth-state="${state}"><div class="aura-loading"><div aria-hidden="true"></div><h1>${message}</h1><p>Forge mantiene los datos protegidos mientras verifica la sesión.</p></div></section>`;
}
function scrub(){
  pipeline?.destroy();pipeline=null;shell=null;root.replaceChildren();document.querySelectorAll('input[type="password"]').forEach(x=>x.value="");
}
async function showPipeline(snapshot){
  const revision=++bootRevision;scrub();shell=createAuraShell({root,onLogout:async()=>{shell.setGlobalState("Cerrando sesión…");try{await auth.signOut();}finally{scrub();router.navigate("login",{replace:true});renderAuraLogin({root,auth,onAuthenticated:()=>router.navigate("pipeline",{replace:true})});}}});
  shell.setUser(snapshot.user);
  const client=await auth.getClient();if(revision!==bootRevision)return;
  pipeline=createPipelineModule({root:shell.main,client,globalState:shell.setGlobalState});await pipeline.mount();root.setAttribute("aria-busy","false");
}
async function renderRoute(route){
  const snapshot=auth.snapshot();
  if(!snapshot.user?.id){scrub();renderAuraLogin({root,auth,onAuthenticated:next=>{router.navigate("pipeline",{replace:true});void showPipeline(next);}});return;}
  if(route==="pipeline")await showPipeline(snapshot);
}
async function boot(){
  renderBoot("Recuperando tu sesión");
  router=createAuraRouter({onChange:route=>void renderRoute(route)});
  auth.subscribe(snapshot=>{
    if(snapshot.event==="SIGNED_OUT"||snapshot.event==="SESSION_EXPIRED"){
      scrub();router.navigate("login",{replace:true});
      renderAuraLogin({root,auth,onAuthenticated:next=>{router.navigate("pipeline",{replace:true});void showPipeline(next);}});
      if(snapshot.event==="SESSION_EXPIRED"){
        const panel=root.querySelector("[data-aura-auth-state]");panel?.setAttribute("data-aura-auth-state","SESSION_EXPIRED");
        const node=root.querySelector("[data-aura-auth-error]");if(node){node.hidden=false;node.textContent="Tu sesión expiró. Inicia sesión nuevamente.";}
      }
    }
  });
  try{
    const snapshot=await auth.restore();
    if(snapshot.user?.id){router.restoreAfterAuth();await showPipeline(snapshot);}
    else{router.navigate("login",{replace:true});renderAuraLogin({root,auth,onAuthenticated:next=>{router.navigate("pipeline",{replace:true});void showPipeline(next);}});}
  }catch(error){
    scrub();renderAuraLogin({root,auth,onAuthenticated:next=>{router.navigate("pipeline",{replace:true});void showPipeline(next);}});
    root.querySelector("[data-aura-auth-state]")?.setAttribute("data-aura-auth-state","AUTH_ERROR");
    const node=root.querySelector("[data-aura-auth-error]");if(node){node.hidden=false;node.textContent=auth.humanAuthError(error);}
  }
}
void boot();
