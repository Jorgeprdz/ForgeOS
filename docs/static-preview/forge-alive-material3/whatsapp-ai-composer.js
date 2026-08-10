const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const TRIGGER_SELECTOR = "[data-prepare-productive-message]";
const LAYER_SELECTOR = "[data-whatsapp-ai-composer-layer]";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/whatsapp-draft`;
const CORE_URL = "../../../platform/communications/whatsapp-context-humanizer.js";

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
    .whatsapp-ai-dialog{width:min(680px,100%);max-height:calc(100dvh - 40px);overflow:auto;padding:22px;border:1px solid rgba(170,199,255,.2);border-radius:24px;background:#0b1a30;color:#f5f2ff;box-shadow:0 28px 90px rgba(0,0,0,.55)}
    .whatsapp-ai-dialog header,.whatsapp-ai-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}.whatsapp-ai-dialog label{display:grid;gap:7px;margin:16px 0}.whatsapp-ai-dialog select,.whatsapp-ai-dialog textarea,.whatsapp-ai-dialog input{box-sizing:border-box;width:100%;padding:11px;border:1px solid rgba(170,199,255,.22);border-radius:12px;background:#071426;color:inherit;font:inherit}.whatsapp-ai-dialog textarea{min-height:170px;resize:vertical}.whatsapp-ai-dialog button{min-height:42px;padding:9px 14px;border:1px solid rgba(170,199,255,.2);border-radius:12px;background:rgba(255,255,255,.06);color:inherit;font:inherit;cursor:pointer}.whatsapp-ai-dialog [data-humanize-draft],.whatsapp-ai-dialog [data-open-whatsapp-draft]{background:rgba(82,230,223,.14);color:#9ef2ed;font-weight:800}.whatsapp-ai-error{color:#ffb4ab}.whatsapp-ai-note{opacity:.78;font-size:.88rem}.whatsapp-context{padding:12px;border:1px solid rgba(170,199,255,.15);border-radius:14px;background:rgba(255,255,255,.035)}.whatsapp-context ul{margin:8px 0 0;padding-left:20px}@media(max-width:640px){.whatsapp-ai-layer{align-items:end;padding:0}.whatsapp-ai-dialog{max-height:calc(100dvh - 16px);border-radius:24px 24px 0 0;padding-bottom:calc(22px + env(safe-area-inset-bottom))}.whatsapp-ai-actions{display:grid;grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function closeLayer() {
  document.querySelector(LAYER_SELECTOR)?.remove();
  document.documentElement.removeAttribute("data-whatsapp-ai-composer-open");
}

function text(card, selector, fallback = "") {
  return card?.querySelector(selector)?.textContent?.trim() || fallback;
}

function contextFromTrigger(trigger) {
  const card = trigger.closest("[data-productive-prospect-card]");
  return {
    person: {
      id: card?.dataset?.productiveProspectId || "",
      name: text(card, "[data-productive-card-identity] strong, .pipeline-module__productive-name strong"),
      identity: text(card, "[data-productive-person-identity]"),
      occupation: text(card, "[data-productive-occupation]"),
      relationship: text(card, "[data-productive-relationship]"),
      stage: text(card, "[data-productive-stage-control]", card?.dataset?.productiveStage || ""),
      lastActivity: text(card, "[data-productive-last-activity]"),
      source: "PIPELINE_PRODUCTIVE_CARD",
      confirmed: true,
      identityConfirmed: Boolean(text(card, "[data-productive-person-identity]")),
      occupationConfirmed: Boolean(text(card, "[data-productive-occupation]")),
      relationshipConfirmed: Boolean(text(card, "[data-productive-relationship]")),
      stageConfirmed: true,
      activityConfirmed: Boolean(text(card, "[data-productive-last-activity]")),
    },
    referral: {
      referrerName: card?.dataset?.productiveReferrerName || text(card, "[data-productive-referrer-name]"),
      reason: card?.dataset?.productiveReferralReason || text(card, "[data-productive-referral-reason]"),
      summary: card?.dataset?.productiveReferralSummary || "",
      permissionToMention: card?.dataset?.productiveReferralMentionAllowed === "true",
      source: "GOVERNED_REFERRAL_CONTEXT",
      confirmed: card?.dataset?.productiveReferralConfirmed === "true",
      reasonConfirmed: card?.dataset?.productiveReferralReasonConfirmed === "true",
    },
    advisor: {
      name: globalThis.ForgeAuthenticatedAdvisorProfile?.displayName || "",
      profession: globalThis.ForgeAuthenticatedAdvisorProfile?.profession || "asesoría en protección financiera y seguros",
      valueStatement: globalThis.ForgeAuthenticatedAdvisorProfile?.valueStatement || "revisar riesgos personales, familiares y patrimoniales",
      source: globalThis.ForgeAuthenticatedAdvisorProfile ? "AUTHENTICATED_ADVISOR_PROFILE" : "APPROVED_DEFAULT_PROFILE",
      confirmed: true,
      valueConfirmed: true,
    },
    helpHypothesis: {
      text: card?.dataset?.productiveHelpHypothesis || "",
      source: "RELATIONSHIP_INTELLIGENCE",
      confirmed: card?.dataset?.productiveHelpConfirmed === "true",
    },
    phone: card?.dataset?.productivePhone || "",
    prohibitedClaims: ["garantiza rendimientos", "sin riesgo", "aprobación garantizada"],
  };
}

async function sessionHeaders() {
  const session = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getSession?.();
  const accessToken = session?.data?.session?.access_token;
  if (!accessToken) throw Object.assign(new Error("Tu sesión expiró. Inicia sesión nuevamente."), { code: "AUTH_REQUIRED" });
  const anonKey = globalThis.__ENV__?.SUPABASE_ANON_KEY || globalThis.ForgeAlivePublicConfig067G17A1?.supabaseAnonKey;
  return { Authorization: `Bearer ${accessToken}`, apikey: anonKey || accessToken, "Content-Type": "application/json" };
}

function ctaForIntent(intent) {
  return ({
    primer_contacto: "¿Te parece si tenemos una llamada breve esta semana?",
    seguimiento: "¿Te parece si retomamos el tema esta semana?",
    retomar_conversacion: "¿Te parece si retomamos la conversación esta semana?",
    confirmar_cita: "¿Me confirmas si seguimos con la cita acordada?",
    solicitar_documentos: "¿Me ayudas compartiéndome los documentos pendientes?",
    seguimiento_propuesta: "¿Te parece si revisamos juntos cualquier duda sobre la propuesta?",
  })[intent] || "¿Te parece si lo platicamos esta semana?";
}

async function openComposer(trigger) {
  closeLayer();
  ensureStyles();
  const core = await import(CORE_URL);
  const source = contextFromTrigger(trigger);
  const layer = document.createElement("div");
  layer.className = "whatsapp-ai-layer";
  layer.dataset.whatsappAiComposerLayer = "true";
  layer.innerHTML = `
    <section class="whatsapp-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="whatsapp-ai-title">
      <header><div><p>WHATSAPP COMPOSER</p><h2 id="whatsapp-ai-title">Mensaje para ${escapeHtml(source.person.name || "prospecto")}</h2></div><button type="button" data-close-whatsapp-ai aria-label="Cerrar">×</button></header>
      <label><span>Objetivo</span><select data-whatsapp-intent><option value="seguimiento">Seguimiento</option><option value="primer_contacto">Primer contacto</option><option value="retomar_conversacion">Retomar conversación</option><option value="confirmar_cita">Confirmar cita</option><option value="solicitar_documentos">Solicitar documentos</option><option value="seguimiento_propuesta">Seguimiento de propuesta</option></select></label>
      <label><span>Cómo quieres que suene</span><select data-whatsapp-tone><option value="natural y directo">Natural y directo</option><option value="cálido">Cálido</option><option value="profesional">Profesional</option><option value="breve">Breve</option></select></label>
      <section class="whatsapp-context"><strong>Contexto utilizado</strong><ul data-whatsapp-context-list></ul></section>
      <label><span>Mensaje propuesto</span><textarea data-whatsapp-draft></textarea></label>
      <p class="whatsapp-ai-note">ForgeOS define el contenido. La IA sólo mejora cómo suena. No agrega información ni envía el mensaje.</p>
      <p class="whatsapp-ai-error" data-whatsapp-ai-error role="alert" hidden></p>
      <div class="whatsapp-ai-actions"><button type="button" data-close-whatsapp-ai>Cancelar</button><button type="button" data-restore-base>Restaurar base</button><button type="button" data-humanize-draft>Hacerlo sonar natural</button><button type="button" data-open-whatsapp-draft>Abrir WhatsApp</button></div>
    </section>`;
  const draft = layer.querySelector("[data-whatsapp-draft]");
  const intentNode = layer.querySelector("[data-whatsapp-intent]");
  const toneNode = layer.querySelector("[data-whatsapp-tone]");
  const errorNode = layer.querySelector("[data-whatsapp-ai-error]");
  const humanize = layer.querySelector("[data-humanize-draft]");
  const contextList = layer.querySelector("[data-whatsapp-context-list]");
  let baseMessage = null;
  let requestGeneration = 0;

  function rebuildBase() {
    const envelope = core.createWhatsAppContextEnvelope({
      ...source,
      commercialIntent: { type: intentNode.value, cta: ctaForIntent(intentNode.value), tone: toneNode.value },
    });
    const plan = core.planWhatsAppMessage(envelope);
    if (plan.state !== "READY") {
      errorNode.textContent = `Falta contexto obligatorio: ${plan.reasons.join(", ")}`;
      errorNode.hidden = false;
      draft.value = "";
      baseMessage = null;
      return;
    }
    baseMessage = core.renderWhatsAppBaseMessage(plan);
    draft.value = baseMessage.text;
    errorNode.hidden = true;
    const items = [
      `Persona: ${source.person.name || "no disponible"}`,
      source.referral.referrerName && source.referral.permissionToMention ? `Recomendó: ${source.referral.referrerName}` : "Referido: no se mencionará",
      source.referral.reason ? `Motivo: ${source.referral.reason}` : "Motivo: no disponible",
      `Asesor: ${source.advisor.profession}`,
      `CTA: ${baseMessage.cta}`,
    ];
    contextList.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  }

  intentNode.addEventListener("change", rebuildBase);
  toneNode.addEventListener("change", rebuildBase);
  layer.querySelector("[data-restore-base]").addEventListener("click", rebuildBase);
  layer.addEventListener("click", event => {
    if (event.target.closest("[data-close-whatsapp-ai]")) { requestGeneration += 1; closeLayer(); trigger.focus(); }
  });
  humanize.addEventListener("click", async () => {
    if (!baseMessage) return rebuildBase();
    const generation = ++requestGeneration;
    errorNode.hidden = true;
    humanize.disabled = true;
    humanize.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: await sessionHeaders(),
        body: JSON.stringify({
          baseMessage: baseMessage.text,
          lockedCta: baseMessage.cta,
          tone: toneNode.value,
          locale: "es-MX",
          prohibitedClaims: source.prohibitedClaims,
        }),
      });
      const payload = await response.json();
      if (generation !== requestGeneration || !document.contains(layer)) return;
      if (!response.ok || !payload?.draft) throw new Error(payload?.message || payload?.error || "No pudimos humanizar el mensaje.");
      const validation = core.validateHumanizedMessage({ baseMessage: baseMessage.text, humanizedMessage: payload.draft, prohibitedClaims: source.prohibitedClaims });
      if (validation.state !== "PASS") throw new Error(`La versión de IA fue rechazada: ${validation.state}`);
      draft.value = validation.safeText;
      draft.dataset.aiHumanized = "true";
      draft.focus();
    } catch (error) {
      if (generation !== requestGeneration) return;
      draft.value = baseMessage.text;
      errorNode.textContent = `${error.message || "La IA no está disponible."} Se conserva el mensaje base.`;
      errorNode.hidden = false;
    } finally {
      if (generation === requestGeneration) { humanize.disabled = false; humanize.removeAttribute("aria-busy"); }
    }
  });
  layer.querySelector("[data-open-whatsapp-draft]").addEventListener("click", () => {
    const message = draft.value.trim();
    if (!message) { errorNode.textContent = "Escribe un mensaje antes de abrir WhatsApp."; errorNode.hidden = false; return; }
    const phone = String(source.phone || "").replace(/\D/g, "");
    const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(href, "_blank", "noopener,noreferrer");
    globalThis.dispatchEvent(new CustomEvent("forge:whatsapp-draft-opened", { detail: { prospectName: source.person.name, sent: false } }));
  });

  document.body.append(layer);
  document.documentElement.dataset.whatsappAiComposerOpen = "true";
  rebuildBase();
  humanize.focus();
}

function boot() {
  ensureStyles();
  document.addEventListener("click", event => {
    const trigger = event.target.closest(TRIGGER_SELECTOR);
    if (!trigger || !trigger.closest(ROOT_SELECTOR)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openComposer(trigger).catch(error => console.error("WHATSAPP_COMPOSER_OPEN_FAILED", error));
  }, true);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
