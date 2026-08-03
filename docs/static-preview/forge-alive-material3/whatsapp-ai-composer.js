const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const TRIGGER_SELECTOR = "[data-prepare-productive-message]";
const LAYER_SELECTOR = "[data-whatsapp-ai-composer-layer]";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/whatsapp-draft`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function ensureStyles() {
  if (document.querySelector("[data-whatsapp-ai-composer-styles]")) return;
  const style = document.createElement("style");
  style.dataset.whatsappAiComposerStyles = "true";
  style.textContent = `
    .whatsapp-ai-layer{position:fixed;inset:0;z-index:1500;display:grid;place-items:center;padding:20px;background:rgba(2,8,18,.76)}
    .whatsapp-ai-dialog{width:min(640px,100%);max-height:calc(100dvh - 40px);overflow:auto;padding:22px;border:1px solid rgba(170,199,255,.2);border-radius:24px;background:#0b1a30;color:#f5f2ff;box-shadow:0 28px 90px rgba(0,0,0,.55)}
    .whatsapp-ai-dialog header,.whatsapp-ai-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}.whatsapp-ai-dialog label{display:grid;gap:7px;margin:16px 0}.whatsapp-ai-dialog select,.whatsapp-ai-dialog textarea,.whatsapp-ai-dialog input{box-sizing:border-box;width:100%;padding:11px;border:1px solid rgba(170,199,255,.22);border-radius:12px;background:#071426;color:inherit;font:inherit}.whatsapp-ai-dialog textarea{min-height:180px;resize:vertical}.whatsapp-ai-dialog button{min-height:42px;padding:9px 14px;border:1px solid rgba(170,199,255,.2);border-radius:12px;background:rgba(255,255,255,.06);color:inherit;font:inherit;cursor:pointer}.whatsapp-ai-dialog [data-generate-ai-draft],.whatsapp-ai-dialog [data-open-whatsapp-draft]{background:rgba(82,230,223,.14);color:#9ef2ed;font-weight:800}.whatsapp-ai-error{color:#ffb4ab}.whatsapp-ai-note{opacity:.78;font-size:.88rem}@media(max-width:640px){.whatsapp-ai-layer{align-items:end;padding:0}.whatsapp-ai-dialog{max-height:calc(100dvh - 16px);border-radius:24px 24px 0 0;padding-bottom:calc(22px + env(safe-area-inset-bottom))}.whatsapp-ai-actions{display:grid;grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function closeLayer() {
  document.querySelector(LAYER_SELECTOR)?.remove();
  document.documentElement.removeAttribute("data-whatsapp-ai-composer-open");
}

function contextFromTrigger(trigger) {
  const card = trigger.closest("[data-productive-prospect-card]");
  return {
    name: card?.querySelector("[data-productive-card-identity] strong, .pipeline-module__productive-name strong")?.textContent?.trim() || "",
    stage: card?.querySelector("[data-productive-stage-control]")?.selectedOptions?.[0]?.textContent?.trim() || card?.dataset?.productiveStage || "",
    source: card?.querySelector("[data-productive-source-label]")?.textContent?.trim() || card?.dataset?.productiveSource || "",
    lastActivity: card?.querySelector("[data-productive-last-activity]")?.textContent?.trim() || "",
    notes: card?.innerText?.trim().slice(0, 1200) || "",
    phone: card?.dataset?.productivePhone || "",
  };
}

async function sessionHeaders() {
  const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
  const accessToken = session?.data?.session?.access_token;
  if (!accessToken) throw Object.assign(new Error("Tu sesión expiró. Inicia sesión nuevamente."), { code: "AUTH_REQUIRED" });
  const anonKey = globalThis.__ENV__?.SUPABASE_ANON_KEY || globalThis.ForgeAlivePublicConfig067G17A1?.supabaseAnonKey;
  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: anonKey || accessToken,
    "Content-Type": "application/json",
  };
}

function openComposer(trigger) {
  closeLayer();
  ensureStyles();
  const context = contextFromTrigger(trigger);
  const layer = document.createElement("div");
  layer.className = "whatsapp-ai-layer";
  layer.dataset.whatsappAiComposerLayer = "true";
  layer.innerHTML = `
    <section class="whatsapp-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsapp-ai-title">
      <header><div><p>WHATSAPP COMPOSER</p><h2 id="whatsapp-ai-title">Mensaje para ${escapeHtml(context.name || "prospecto")}</h2></div><button type="button" data-close-whatsapp-ai aria-label="Cerrar">×</button></header>
      <label><span>Objetivo</span><select data-whatsapp-intent><option value="seguimiento">Seguimiento</option><option value="primer_contacto">Primer contacto</option><option value="retomar_conversacion">Retomar conversación</option><option value="confirmar_cita">Confirmar cita</option><option value="solicitar_documentos">Solicitar documentos</option><option value="seguimiento_propuesta">Seguimiento de propuesta</option></select></label>
      <label><span>Instrucción adicional opcional</span><input data-whatsapp-objective maxlength="500" placeholder="Ej. que suene cálido y directo"></label>
      <label><span>Borrador editable</span><textarea data-whatsapp-draft placeholder="También puedes escribirlo manualmente."></textarea></label>
      <p class="whatsapp-ai-note">La IA sólo redacta. No envía ni modifica Pipeline o Timeline.</p>
      <p class="whatsapp-ai-error" data-whatsapp-ai-error role="alert" hidden></p>
      <div class="whatsapp-ai-actions"><button type="button" data-close-whatsapp-ai>Cancelar</button><button type="button" data-generate-ai-draft>Generar con IA</button><button type="button" data-open-whatsapp-draft>Abrir WhatsApp</button></div>
    </section>`;
  const draft = layer.querySelector("[data-whatsapp-draft]");
  const errorNode = layer.querySelector("[data-whatsapp-ai-error]");
  const generate = layer.querySelector("[data-generate-ai-draft]");
  const openWhatsApp = layer.querySelector("[data-open-whatsapp-draft]");

  layer.addEventListener("click", event => {
    if (event.target.closest("[data-close-whatsapp-ai]")) {
      closeLayer();
      trigger.focus();
    }
  });
  generate.addEventListener("click", async () => {
    errorNode.hidden = true;
    generate.disabled = true;
    generate.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: await sessionHeaders(),
        body: JSON.stringify({
          intent: layer.querySelector("[data-whatsapp-intent]").value,
          context: { ...context, objective: layer.querySelector("[data-whatsapp-objective]").value },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.draft) throw new Error(payload?.message || payload?.error || "No pudimos generar el borrador.");
      draft.value = payload.draft;
      draft.dataset.aiGenerated = "true";
      draft.focus();
    } catch (error) {
      errorNode.textContent = `${error.message || "La IA no está disponible."} Puedes redactar manualmente.`;
      errorNode.hidden = false;
    } finally {
      generate.disabled = false;
      generate.removeAttribute("aria-busy");
    }
  });
  openWhatsApp.addEventListener("click", () => {
    const message = draft.value.trim();
    if (!message) {
      errorNode.textContent = "Escribe o genera un mensaje antes de abrir WhatsApp.";
      errorNode.hidden = false;
      return;
    }
    const phone = String(context.phone || "").replace(/\D/g, "");
    const href = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    globalThis.dispatchEvent(new CustomEvent("forge:whatsapp-draft-opened", { detail: { prospectName: context.name, sent: false } }));
  });

  document.body.append(layer);
  document.documentElement.dataset.whatsappAiComposerOpen = "true";
  generate.focus();
}

function boot() {
  ensureStyles();
  document.addEventListener("click", event => {
    const trigger = event.target.closest(TRIGGER_SELECTOR);
    if (!trigger || !trigger.closest(ROOT_SELECTOR)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openComposer(trigger);
  }, true);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
