import {
  MANUAL_ACTIVITY_CAPTURE_OPTIONS,
  buildManualActivityFact,
  isCountableManualActivity,
  requiresAppointmentDuration,
} from "./activity-manual-fact-adapter.js";
import {
  consumeRecommendationDecisionLineage,
  recommendationDecisionLineageFor,
} from "../forge-aura/recommendation-lineage-session-017e.js?v=forge-commercial-pilot-evidence-017e";

const STATE = Symbol.for("forge.activity.manual-entry.fes01-2");
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
    await import(moduleUrl("platform/event-evidence/recommendation-decision-action-lineage.js"));
    const canonical = globalThis.ForgeCanonicalActivityEventContractFES01;
    const browser = globalThis.ForgeActivityLedgerBrowserRuntimeFES02C;
    const lineage = globalThis.ForgeRecommendationDecisionActionLineage017E;
    if (!canonical?.createCanonicalActivityEvent || !browser?.createFromForgeAlive || !lineage?.resolveDecisionActionLineage) {
      throw new Error("FES_MANUAL_ACTIVITY_AUTHORITY_UNAVAILABLE");
    }
    if (canonical.CONTRACT_VERSION !== "FES-01.2") {
      throw new Error("FES_01_2_REQUIRED_FOR_COUNTABLE_CAPTURE");
    }
    return Object.freeze({ canonical, browser, lineage });
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
      <div>
        <p class="section-kicker accent">ACCIÓN RÁPIDA</p>
        <h2>Registrar actividad</h2>
        <p>Elige lo que ocurrió. Forge lo registra como evidencia comercial sin pedirte identificadores técnicos.</p>
      </div>
      <button type="button" data-open-manual-activity>+ Registrar</button>
      <dialog class="activity-entry-dialog" data-manual-activity-dialog>
        <form method="dialog" data-manual-activity-form>
          <header>
            <div><p class="section-kicker accent">NUEVA ACTIVIDAD</p><h2>¿Qué pasó?</h2></div>
            <button type="button" data-close-manual-activity aria-label="Cerrar">×</button>
          </header>
          <div class="activity-entry-dialog__body">
            <label>
              Actividad
              <select name="captureType" data-capture-type>
                ${MANUAL_ACTIVITY_CAPTURE_OPTIONS.map(item => `<option value="${item.value}">${item.label}</option>`).join("")}
              </select>
            </label>
            <label data-related-label>
              Persona relacionada
              <select name="relatedReference" required data-related-reference>
                <option value="">Selecciona una persona o prospecto</option>
              </select>
            </label>
            <label>
              Fecha y hora
              <input type="datetime-local" name="occurredAt" required>
            </label>
            <label data-duration-field hidden>
              Duración estimada
              <select name="durationMinutes">
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60" selected>1 hora</option>
                <option value="90">1 h 30 min</option>
                <option value="120">2 horas</option>
              </select>
            </label>
            <label data-note-field hidden>
              Contexto
              <input name="notes" maxlength="500" placeholder="¿Qué necesitas recordar para el seguimiento?">
            </label>
            <p class="activity-authority-note" data-capture-explanation></p>
            <p class="activity-entry-error" data-manual-activity-error role="alert" hidden></p>
            <p data-manual-activity-status role="status" aria-live="polite"></p>
          </div>
          <footer>
            <button type="button" data-close-manual-activity>Cancelar</button>
            <button type="submit" data-save-manual-activity>Confirmar y registrar</button>
          </footer>
        </form>
      </dialog>
    </section>`;
}

function currentLocalInputValue() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function updateFields(form) {
  const type = form.elements.captureType.value;
  const countable = isCountableManualActivity(type);
  const scheduled = requiresAppointmentDuration(type);
  const contextOnly = type === "CONTEXT_NOTE";
  form.querySelector("[data-duration-field]").hidden = !scheduled;
  form.querySelector("[data-note-field]").hidden = !contextOnly;
  form.querySelector("[data-related-label]").firstChild.textContent = contextOnly
    ? "\n              Persona, prospecto o póliza relacionada\n              "
    : "\n              Persona relacionada\n              ";
  form.querySelector("[data-capture-explanation]").textContent = countable
    ? "Esta confirmación crea un hecho operativo FES. La puntuación sólo cambia cuando la evidencia requerida para el sistema de 25 puntos está completa."
    : "Esta nota queda como contexto de seguimiento y no suma puntos por sí sola.";
}

async function loadRelatedOptions(root, { signal, selectedGeneration, currentGeneration, allowedReferences, referenceKinds } = {}) {
  const select = root.querySelector("[data-related-reference]");
  if (!select || select.dataset.loaded === "true") return;
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  const client = await bootstrap?.getClient?.();
  if (!client) throw new Error("No pudimos abrir el directorio relacionado.");
  const [people, policies, prospects] = await Promise.all([
    client.from("commercial_people").select("person_reference,display_name").is("archived_at", null).limit(80).abortSignal(signal),
    client.from("canonical_policies").select("policy_reference,policy_number").is("archived_at", null).limit(50).abortSignal(signal),
    client.from("prospects").select("id,display_name").is("archived_at", null).limit(80).abortSignal(signal),
  ]);
  if (signal?.aborted || selectedGeneration !== currentGeneration?.()) return;
  const failed = [people, policies, prospects].find(result => result.error);
  if (failed) throw new Error("No pudimos leer todas las entidades relacionadas.");

  const values = [
    ...(people.data || []).map(item => ({ reference: item.person_reference, label: item.display_name || "Persona", kind: "PERSON" })),
    ...(prospects.data || []).map(item => ({ reference: `prospect:${item.id}`, label: item.display_name || "Prospecto", kind: "PROSPECT" })),
    ...(policies.data || []).map(item => ({ reference: item.policy_reference, label: `Póliza ${item.policy_number || "sin número"}`, kind: "POLICY" })),
  ].filter(item => item.reference);

  allowedReferences.clear();
  referenceKinds.clear();
  values.forEach(item => {
    allowedReferences.add(item.reference);
    referenceKinds.set(item.reference, item.kind);
  });

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecciona una persona o prospecto";
  select.replaceChildren(placeholder, ...values.map(item => {
    const option = document.createElement("option");
    option.value = item.reference;
    option.textContent = item.label;
    option.dataset.kind = item.kind;
    return option;
  }));
  select.dataset.loaded = "true";
}

function assertRelatedReference(form, allowedReferences, referenceKinds) {
  const reference = String(form.elements.relatedReference.value || "").trim();
  if (!allowedReferences.has(reference)) throw new Error("Selecciona una relación de la lista.");
  const type = form.elements.captureType.value;
  const kind = referenceKinds.get(reference);
  if (isCountableManualActivity(type) && !["PERSON", "PROSPECT"].includes(kind)) {
    throw new Error("Para esta actividad selecciona una persona o prospecto, no una póliza.");
  }
  return reference;
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
  const events = new AbortController();
  let relatedController = null;
  const allowedReferences = new Set();
  const referenceKinds = new Map();

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
      const { canonical, browser, lineage } = await loadAuthority();
      const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
      const session = await bootstrap?.getSession?.();
      const advisorId = session?.data?.session?.user?.id;
      if (!advisorId) throw new Error("Inicia sesión para registrar actividad.");
      if (!runtime) runtime = await browser.createFromForgeAlive({ bootstrap });
      if (selectedGeneration !== generation || !dialog.open) return;

      const reference = assertRelatedReference(form, allowedReferences, referenceKinds);
      const entryId = form.dataset.entryId;
      const identity = opaque("manual-activity", entryId);
      const evidenceReference = opaque("evidence:user-confirmation", entryId);
      const spec = buildManualActivityFact({
        captureType: form.elements.captureType.value,
        relatedReference: reference,
        occurredAt: form.elements.occurredAt.value,
        durationMinutes: Number(form.elements.durationMinutes.value || 60),
        activityReference: opaque("activity", entryId),
        appointmentReference: opaque("appointment", entryId),
        referralReference: opaque("referral", entryId),
        notes: form.elements.notes.value,
      });
      const lineageResolution = lineage.resolveDecisionActionLineage({
        context: recommendationDecisionLineageFor(advisorId),
        advisorId,
        eventType: spec.eventType,
        payload: spec.payload,
        occurredAt: spec.occurredAt,
      });
      const eventPayload = lineage.payloadWithDecisionLineage(spec.payload, lineageResolution);
      const recordedAt = new Date().toISOString();
      const event = canonical.createCanonicalActivityEvent({
        event_type: spec.eventType,
        tenant_id: advisorId,
        actor: { type: "ADVISOR", id: advisorId },
        subject: spec.subject,
        source: { type: "ADVISOR_CONFIRMED", reference: identity, channel: "FORGE_UI" },
        evidence_strength: "HUMAN_CONFIRMED",
        occurred_at: spec.occurredAt,
        recorded_at: recordedAt,
        effective_period: null,
        causation_id: null,
        correlation_id: reference,
        idempotency_key: identity,
        privacy_class: spec.privacyClass,
        payload: eventPayload,
        provenance: {
          source_system: "FORGE_ACTIVITY_MANUAL_ENTRY",
          source_record_id: identity,
          captured_via: "FORGE_UI",
          evidence_references: [evidenceReference],
        },
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
          captured_at: recordedAt,
          privacy_class: spec.privacyClass,
          checksum: await checksum(`${advisorId}:${spec.eventType}:${reference}:${identity}`),
          metadata: {
            confirmation_actor_type: "ADVISOR",
            tenant_id: advisorId,
            actor_id: advisorId,
            countable_activity_fact: spec.countable,
          },
        }],
        appended_at: recordedAt,
      });

      if (lineageResolution.state === "EXPLICIT_LINEAGE") {
        consumeRecommendationDecisionLineage({
          advisorId,
          decisionEventId: lineageResolution.recommendationDecisionReference,
        });
      }

      const receipt = await runtime.syncOnce();
      if (selectedGeneration !== generation || !dialog.open) return;
      statusNode.textContent = receipt?.push_failed
        ? "La actividad quedó guardada localmente y pendiente de sincronizar."
        : spec.countable
          ? "Actividad confirmada y sincronizada."
          : "Contexto guardado correctamente.";

      if (!receipt?.push_failed) {
        globalThis.dispatchEvent(new CustomEvent("forge:manual-activity-created", {
          detail: Object.freeze({
            eventId: event.event_id,
            kind: spec.eventType,
            countable: spec.countable,
            lineageStatus: lineageResolution.state,
            recommendationDecisionReference: lineageResolution.recommendationDecisionReference,
          }),
        }));
        globalThis.setTimeout(() => { if (dialog.open) dialog.close(); }, 650);
      }
    } catch (error) {
      if (selectedGeneration !== generation) return;
      errorNode.textContent = error?.message || "No pudimos registrar la actividad.";
      errorNode.hidden = false;
      statusNode.textContent = "No se guardó la actividad.";
    } finally {
      saveButton.disabled = false;
      saveButton.removeAttribute("aria-busy");
    }
  }

  root.addEventListener("click", event => {
    if (event.target.closest("[data-open-manual-activity]") && !demoSession()) {
      form.reset();
      form.dataset.entryId = crypto.randomUUID?.() || `${Date.now()}`;
      form.elements.occurredAt.value = currentLocalInputValue();
      updateFields(form);
      dialog.showModal();
      const status = form.querySelector("[data-manual-activity-status]");
      status.textContent = "Buscando personas, prospectos y pólizas…";
      relatedController?.abort("related-options-replaced");
      relatedController = new AbortController();
      const selectedGeneration = generation;
      loadRelatedOptions(root, {
        signal: relatedController.signal,
        selectedGeneration,
        currentGeneration: () => generation,
        allowedReferences,
        referenceKinds,
      }).then(() => {
        if (dialog.open && selectedGeneration === generation) status.textContent = "Listo para registrar.";
      }).catch(error => {
        if (dialog.open) status.textContent = error.message;
      });
    }
    if (event.target.closest("[data-close-manual-activity]")) dialog.close();
  }, { signal: events.signal });

  form.addEventListener("change", event => {
    if (event.target.matches("[data-capture-type]")) updateFields(form);
  }, { signal: events.signal });
  form.addEventListener("submit", event => { event.preventDefault(); void save(); }, { signal: events.signal });
  globalThis.addEventListener("forge:demo-session-classified", () => applyDemoBoundary(root), { signal: events.signal });

  updateFields(form);
  applyDemoBoundary(root);

  const api = Object.freeze({
    mount() { mounted = true; root.hidden = false; },
    unmount() {
      mounted = false;
      generation += 1;
      relatedController?.abort("activity-unmounted");
      allowedReferences.clear();
      referenceKinds.clear();
      dialog.close();
      root.hidden = true;
    },
    async scrub() {
      generation += 1;
      relatedController?.abort("activity-scrubbed");
      relatedController = null;
      allowedReferences.clear();
      referenceKinds.clear();
      dialog.close();
      form.reset();
      const select = root.querySelector("[data-related-reference]");
      if (select) {
        select.replaceChildren();
        select.removeAttribute("data-loaded");
      }
      await runtime?.close?.();
      runtime = null;
    },
    async destroy() {
      await api.scrub();
      events.abort();
      delete root[STATE];
    },
    diagnostics() {
      return Object.freeze({
        mounted,
        productiveAuthority: "FES-01.2 + FES-02C",
        countableManualCapture: true,
        recommendationDecisionLineage: "OPTIONAL_VALIDATED_017E",
        applicationTruthWritableHere: false,
        paidPolicyTruthWritableHere: false,
      });
    },
  });
  root[STATE] = api;
  return api;
}