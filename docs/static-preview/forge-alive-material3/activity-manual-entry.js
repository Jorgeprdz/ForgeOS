const STATE = Symbol.for("forge.activity.manual-entry.beta1-020");
const SOURCE_LAYOUT = import.meta.url.includes("/docs/static-preview/");
const REPOSITORY_BASE = new URL(SOURCE_LAYOUT ? "../../../" : "../../", import.meta.url);
let authorityPromise = null;

function moduleUrl(path) {
  return new URL(path, REPOSITORY_BASE);
}

async function loadAuthority() {
  if (authorityPromise) return authorityPromise;
  authorityPromise = (async () => {
    await import(moduleUrl("platform/event-evidence/canonical-activity-event-contract.js"));
    await import(moduleUrl("platform/event-evidence/activity-ledger-contract.js"));
    await import(moduleUrl("platform/event-evidence/activity-ledger-local-store.js"));
    await import(moduleUrl("platform/event-evidence/activity-ledger-sync-service.js"));
    await import(moduleUrl("platform/event-evidence/activity-ledger-supabase-gateway.js"));
    await import(moduleUrl("platform/event-evidence/activity-ledger-browser-runtime.js"));
    const canonical = globalThis.ForgeCanonicalActivityEventContractFES01;
    const browser = globalThis.ForgeActivityLedgerBrowserRuntimeFES02C;
    if (!canonical?.createCanonicalActivityEvent || !browser?.createFromForgeAlive) {
      throw new Error("FES_MANUAL_ACTIVITY_AUTHORITY_UNAVAILABLE");
    }
    return Object.freeze({ canonical, browser });
  })().catch(error => { authorityPromise = null; throw error; });
  return authorityPromise;
}

function opaque(prefix, value = crypto.randomUUID?.() || Date.now()) {
  return `${prefix}:${String(value).replace(/[^A-Za-z0-9._:@/-]/g, "-").slice(0, 180)}`;
}

async function checksum(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(item => item.toString(16).padStart(2, "0")).join("");
}

function demoSession() {
  return document.documentElement.dataset.forgeDemoSession === "active";
}

function applyDemoBoundary(root) {
  const button = root.querySelector("[data-open-manual-activity]");
  if (!button) return;
  const demo = demoSession();
  button.disabled = demo;
  button.setAttribute("aria-disabled", String(demo));
  let notice = root.querySelector("[data-manual-activity-demo-notice]");
  if (demo && !notice) {
    notice = document.createElement("p");
    notice.className = "activity-authority-note";
    notice.dataset.manualActivityDemoNotice = "true";
    notice.textContent = "La cuenta demo es de solo lectura. En una sesión productiva esta acción queda habilitada.";
    button.before(notice);
  }
  if (!demo) notice?.remove();
}

function render(root) {
  root.innerHTML = `
    <section class="activity-manual-entry organic-card" data-activity-manual-entry>
      <div><p class="section-kicker accent">ACCIÓN RÁPIDA</p><h2>Registrar actividad</h2><p>Guarda una actividad confirmada y relaciónala con la persona, oportunidad o póliza correcta.</p></div>
      <button type="button" data-open-manual-activity>+ Registrar</button>
      <dialog class="activity-entry-dialog" data-manual-activity-dialog>
        <form method="dialog" data-manual-activity-form>
          <header><div><p class="section-kicker accent">NUEVA ACTIVIDAD</p><h2>Registrar actividad confirmada</h2></div><button type="button" data-close-manual-activity aria-label="Cerrar">×</button></header>
          <div class="activity-entry-dialog__body">
            <label>Tipo de actividad<select name="activityType"><option value="CONTACT">Contacto</option><option value="MEETING">Reunión</option><option value="SERVICE">Servicio</option><option value="FOLLOW_UP">Seguimiento</option><option value="OTHER">Otra</option></select></label>
            <label>Persona, prospecto o póliza relacionada<input name="relatedReference" list="forge-activity-related-options" required maxlength="180" placeholder="Busca o escribe una referencia gobernada"><datalist id="forge-activity-related-options" data-manual-activity-related-options></datalist></label>
            <label>Canal<select name="channel"><option value="PHONE">Llamada</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="IN_PERSON">Presencial</option><option value="VIDEO">Videollamada</option><option value="OTHER">Otro</option></select></label>
            <label>Fecha y hora<input type="datetime-local" name="occurredAt" required></label>
            <label>Resultado<select name="outcome"><option value="COMPLETED">Completada</option><option value="NO_ANSWER">Sin respuesta</option><option value="RESCHEDULED">Reprogramada</option><option value="PENDING">Pendiente</option><option value="OTHER">Otro</option></select></label>
            <label>Etapa comercial<input name="commercialStage" maxlength="80" placeholder="Opcional; usa la etapa oficial cuando aplique"></label>
            <label>Notas<input name="notes" maxlength="500" placeholder="Contexto útil; evita datos sensibles innecesarios"></label>
            <label>Siguiente acción<input name="nextAction" maxlength="180" placeholder="Opcional; no se ejecutará automáticamente"></label>
            <label>Fecha de seguimiento<input type="datetime-local" name="followUpAt"></label>
            <p class="activity-authority-note">Se guarda sólo después de tu confirmación. La siguiente acción queda como contexto y no se ejecuta ni crea eventos de calendario automáticamente.</p>
            <p class="activity-entry-error" data-manual-activity-error role="alert" hidden></p>
            <p data-manual-activity-status role="status"></p>
          </div>
          <footer><button type="button" data-close-manual-activity>Cancelar</button><button type="submit" data-save-manual-activity>Confirmar y registrar</button></footer>
        </form>
      </dialog>
    </section>`;
}

function toIso(value, label) {
  if (!value) throw new Error(`${label} es obligatoria.`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${label} no es válida.`);
  return parsed.toISOString();
}

function fields() {}

async function loadRelatedOptions(root, { signal, selectedGeneration, currentGeneration, allowedReferences } = {}) {
  const list = root.querySelector("[data-manual-activity-related-options]");
  if (!list || list.dataset.loaded === "true") return;
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  const client = await bootstrap?.getClient?.();
  if (!client) throw new Error("No pudimos abrir el directorio relacionado.");
  const [people, policies, prospects] = await Promise.all([
    client.from("commercial_people").select("person_reference,display_name").is("archived_at", null).limit(50).abortSignal(signal),
    client.from("canonical_policies").select("policy_reference,policy_number").is("archived_at", null).limit(50).abortSignal(signal),
    client.from("prospects").select("id,display_name").is("archived_at", null).limit(50).abortSignal(signal),
  ]);
  if (signal?.aborted || selectedGeneration !== currentGeneration?.()) return;
  const failed = [people, policies, prospects].find(result => result.error);
  if (failed) throw new Error("No pudimos leer todas las entidades relacionadas.");
  const values = [
    ...(people.data || []).map(item => [item.person_reference, item.display_name]),
    ...(policies.data || []).map(item => [item.policy_reference, `Póliza ${item.policy_number}`]),
    ...(prospects.data || []).map(item => [`prospect:${item.id}`, item.display_name]),
  ].filter(([reference]) => reference);
  allowedReferences.clear();
  values.forEach(([reference]) => allowedReferences.add(reference));
  list.replaceChildren(...values.map(([reference, label]) => {
    const option = document.createElement("option");
    option.value = reference;
    option.label = label || reference;
    return option;
  }));
  list.dataset.loaded = "true";
}

function eventPayload(form, reference, activityReference) {
  const followUpAt = form.elements.followUpAt.value
    ? toIso(form.elements.followUpAt.value, "La fecha de seguimiento")
    : null;
  return {
    subject: { type: "ACTIVITY", id: activityReference },
    payload: {
      activity_reference: activityReference,
      context_reference: reference,
      capture_mode: "MANUAL_CONFIRMED",
      related_reference: reference,
      activity_type: form.elements.activityType.value,
      channel: form.elements.channel.value,
      occurred_at: toIso(form.elements.occurredAt.value, "La fecha y hora"),
      outcome_code: form.elements.outcome.value,
      notes: String(form.elements.notes.value || "").trim() || null,
      commercial_stage: String(form.elements.commercialStage.value || "").trim() || null,
      next_action: String(form.elements.nextAction.value || "").trim() || null,
      follow_up_at: followUpAt,
    },
  };
}

export function createManualActivityEntry({ root } = {}) {
  if (!(root instanceof Element)) throw new TypeError("MANUAL_ACTIVITY_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  render(root);
  const dialog = root.querySelector("[data-manual-activity-dialog]");
  const form = root.querySelector("[data-manual-activity-form]");
  let mounted = false;
  let generation = 0;
  let runtime = null;
  let events = new AbortController();
  let relatedController = null;
  const allowedReferences = new Set();

  async function save() {
    const selectedGeneration = ++generation;
    const saveButton = form.querySelector("[data-save-manual-activity]");
    const errorNode = form.querySelector("[data-manual-activity-error]");
    const statusNode = form.querySelector("[data-manual-activity-status]");
    errorNode.hidden = true;
    saveButton.disabled = true;
    saveButton.setAttribute("aria-busy", "true");
    statusNode.textContent = "Guardando actividad…";
    try {
      if (demoSession()) throw new Error("La cuenta demo es de solo lectura.");
      const { canonical, browser } = await loadAuthority();
      const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
      const session = await bootstrap?.getSession?.();
      const advisorId = session?.data?.session?.user?.id;
      if (!advisorId) throw new Error("Inicia sesión para registrar actividad.");
      if (!runtime) runtime = await browser.createFromForgeAlive({ bootstrap });
      if (selectedGeneration !== generation || !dialog.open) return;
      const now = new Date().toISOString();
      const kind = "ACTIVITY_CONTEXT_ADDED";
      const reference = String(form.elements.relatedReference.value || "").trim();
      if (!/^[A-Za-z0-9._:@/-]{1,180}$/.test(reference)) throw new Error("Usa una referencia gobernada válida.");
      if (!allowedReferences.has(reference)) throw new Error("Selecciona una persona, póliza o prospecto de la lista.");
      const evidenceReference = opaque("evidence:user-confirmation");
      const identity = opaque("manual-activity", form.dataset.entryId);
      const specific = eventPayload(form, reference, opaque("activity", form.dataset.entryId));
      const event = canonical.createCanonicalActivityEvent({
        event_type: kind,
        tenant_id: advisorId,
        actor: { type: "ADVISOR", id: advisorId },
        subject: specific.subject,
        source: { type: "ADVISOR_CONFIRMED", reference: identity, channel: "FORGE_UI" },
        evidence_strength: "HUMAN_CONFIRMED",
        occurred_at: now,
        recorded_at: now,
        effective_period: null,
        causation_id: null,
        correlation_id: reference,
        idempotency_key: identity,
        privacy_class: "PRIVATE",
        payload: specific.payload,
        provenance: { source_system: "FORGE_ACTIVITY_MANUAL_ENTRY", source_record_id: identity, captured_via: "FORGE_UI", evidence_references: [evidenceReference] },
        confirmation_state: "CONFIRMED",
        correction_of: null,
        safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
      });
      await runtime.appendCanonicalEvent({
        canonical_event: event,
        evidence_references: [{
          reference_id: evidenceReference,
          reference_type: "USER_CONFIRMATION",
          source_system: "FORGE_ACTIVITY_MANUAL_ENTRY",
          captured_at: now,
          privacy_class: "PRIVATE",
          checksum: await checksum(`${advisorId}:${kind}:${reference}:${identity}`),
          metadata: { confirmation_actor_type: "ADVISOR", tenant_id: advisorId, actor_id: advisorId },
        }],
        appended_at: now,
      });
      const receipt = await runtime.syncOnce();
      if (selectedGeneration !== generation || !dialog.open) return;
      statusNode.textContent = receipt?.push_failed ? "No pudimos completar el envío. La actividad queda pendiente para reintentar." : "Actividad guardada correctamente.";
      if (!receipt?.push_failed) {
        globalThis.dispatchEvent(new CustomEvent("forge:manual-activity-created", { detail: Object.freeze({ eventId: event.event_id, kind }) }));
        globalThis.setTimeout(() => { if (dialog.open) dialog.close(); }, 650);
      }
    } catch (error) {
      if (selectedGeneration !== generation) return;
      errorNode.textContent = error?.message || "No pudimos registrar la actividad.";
      errorNode.hidden = false;
      statusNode.textContent = "FAILED";
    } finally {
      saveButton.disabled = false;
      saveButton.removeAttribute("aria-busy");
    }
  }

  root.addEventListener("click", event => {
    if (event.target.closest("[data-open-manual-activity]") && !demoSession()) {
      form.reset();
      form.dataset.entryId = crypto.randomUUID?.() || `${Date.now()}`;
      form.elements.occurredAt.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      fields(form);
      dialog.showModal();
      const status = form.querySelector("[data-manual-activity-status]");
      status.textContent = "Buscando personas y pólizas…";
      relatedController?.abort("related-options-replaced");
      relatedController = new AbortController();
      const selectedGeneration = generation;
      loadRelatedOptions(root, {
        signal: relatedController.signal,
        selectedGeneration,
        currentGeneration: () => generation,
        allowedReferences,
      }).then(() => { if (dialog.open && selectedGeneration === generation) status.textContent = "Listo para registrar."; })
        .catch(error => { if (dialog.open) status.textContent = error.message; });
    }
    if (event.target.closest("[data-close-manual-activity]")) dialog.close();
  }, { signal: events.signal });
  form.addEventListener("submit", event => { event.preventDefault(); void save(); }, { signal: events.signal });
  globalThis.addEventListener("forge:demo-session-classified", () => applyDemoBoundary(root), { signal: events.signal });
  fields(form);
  applyDemoBoundary(root);

  const api = Object.freeze({
    mount() { mounted = true; root.hidden = false; },
    unmount() { mounted = false; generation += 1; relatedController?.abort("activity-unmounted"); allowedReferences.clear(); dialog.close(); root.hidden = true; },
    async scrub() { generation += 1; relatedController?.abort("activity-scrubbed"); relatedController = null; allowedReferences.clear(); dialog.close(); form.reset(); root.querySelector("[data-manual-activity-related-options]")?.replaceChildren(); root.querySelector("[data-manual-activity-related-options]")?.removeAttribute("data-loaded"); await runtime?.close?.(); runtime = null; },
    async destroy() { await api.scrub(); events.abort(); delete root[STATE]; },
    diagnostics() { return Object.freeze({ mounted, productiveAuthority: "FES02", rawNotesAllowed: false, boundedPrivateNotesAllowed: true }); },
  });
  root[STATE] = api;
  return api;
}
