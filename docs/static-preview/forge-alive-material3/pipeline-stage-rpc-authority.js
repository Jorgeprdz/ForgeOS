const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const STAGE_SELECTOR = "[data-productive-stage-control]";
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.stage-rpc-authority");
const DEFERRED_RECONCILE_KEY = Symbol.for(
  "forge.material3.pipeline.stage-rpc-deferred-reconcile",
);
const ALLOWED_STAGES = new Set([
  "referred_new",
  "contacted",
  "appointment_scheduled",
  "proposal",
  "decision",
  "client",
]);
const STAGE_LABELS = Object.freeze({
  referred_new: "Nuevo",
  contacted: "Contactado",
  appointment_scheduled: "Cita agendada",
  proposal: "Propuesta",
  decision: "En decisión",
  client: "Cliente",
});

function stageErrorMessage(error) {
  const code = String(error?.code || error?.message || "");
  if (/AUTH|JWT|SESSION/i.test(code)) {
    return "Tu sesión expiró. Inicia sesión nuevamente para cambiar el estado.";
  }
  if (/NOT_OWNED|NOT_FOUND|PGRST116/i.test(code)) {
    return "No encontramos este prospecto dentro de tu Pipeline.";
  }
  if (/NOT_ALLOWED|INVALID/i.test(code)) {
    return "Ese estado no está permitido para el Pipeline.";
  }
  return "Supabase no confirmó el cambio de estado. Intenta nuevamente.";
}

function ensureStatusNode(root) {
  let node = root.querySelector("[data-pipeline-stage-rpc-status]");
  if (node) return node;
  node = root.ownerDocument.createElement("p");
  node.className = "pipeline-module__referral-status pipeline-module__stage-rpc-status";
  node.dataset.pipelineStageRpcStatus = "";
  node.hidden = true;
  root.querySelector(".pipeline-module__header")?.insertAdjacentElement("afterend", node);
  if (!node.isConnected) root.prepend(node);
  return node;
}

function showStatus(root, message, { error = false, persist = false } = {}) {
  const node = ensureStatusNode(root);
  node.hidden = false;
  node.textContent = message;
  node.dataset.state = error ? "error" : "success";
  node.setAttribute("role", error ? "alert" : "status");
  clearTimeout(showStatus.timer);
  if (!persist) {
    showStatus.timer = setTimeout(() => {
      if (!node.isConnected) return;
      node.hidden = true;
      node.textContent = "";
      delete node.dataset.state;
    }, 4200);
  }
}

function normalizeRpcProspect(data) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  return Object.freeze({
    ...row,
    id: row.id,
    status: row.status,
    fullName: row.full_name ?? row.fullName,
    updatedAt: row.updated_at ?? row.updatedAt,
  });
}

function isDiagnosticRuntime() {
  return globalThis.__ENV__?.diagnostic === true
    || Object.prototype.hasOwnProperty.call(
      globalThis,
      "__FORGE_DIAGNOSTIC_AUTHENTICATED__",
    );
}

async function requestDiagnosticStageTransition({ client, prospectId, status }) {
  if (!client?.from) {
    const error = new Error("PIPELINE_STAGE_DIAGNOSTIC_STORE_UNAVAILABLE");
    error.code = "PIPELINE_STAGE_DIAGNOSTIC_STORE_UNAVAILABLE";
    throw error;
  }

  const { data, error } = await client
    .from("prospects")
    .update({
      status,
      updated_by: "diagnostic-advisor",
      updated_at: new Date().toISOString(),
    })
    .eq("id", prospectId)
    .is("archived_at", null)
    .select("*")
    .single();
  if (error) throw error;

  const prospect = normalizeRpcProspect(data);
  if (prospect?.id !== prospectId || prospect?.status !== status) {
    const mismatch = new Error("PIPELINE_STAGE_DIAGNOSTIC_CONFIRMATION_MISMATCH");
    mismatch.code = "PIPELINE_STAGE_DIAGNOSTIC_CONFIRMATION_MISMATCH";
    throw mismatch;
  }
  return prospect;
}

export async function requestStageTransition({ client, prospectId, status }) {
  if (!prospectId || !ALLOWED_STAGES.has(status)) {
    const error = new Error("PIPELINE_STAGE_NOT_ALLOWED");
    error.code = "PIPELINE_STAGE_NOT_ALLOWED";
    throw error;
  }

  // The visual diagnostic owns an in-memory PostgREST-shaped store and has no
  // deployed database function. This seam is unreachable in public/runtime
  // configuration; production remains RPC-only and fail-closed.
  if (isDiagnosticRuntime()) {
    return requestDiagnosticStageTransition({ client, prospectId, status });
  }

  if (!client?.rpc) {
    const error = new Error("PIPELINE_STAGE_RPC_CLIENT_UNAVAILABLE");
    error.code = "PIPELINE_STAGE_RPC_CLIENT_UNAVAILABLE";
    throw error;
  }

  const { data, error } = await client.rpc(
    "forge_pipeline_update_prospect_stage",
    {
      p_prospect_id: prospectId,
      p_status: status,
    },
  );
  if (error) throw error;

  const prospect = normalizeRpcProspect(data);
  if (prospect?.id !== prospectId || prospect?.status !== status) {
    const mismatch = new Error("PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH");
    mismatch.code = "PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH";
    mismatch.details = Object.freeze({
      prospectId,
      requestedStatus: status,
      returnedId: prospect?.id || null,
      returnedStatus: prospect?.status || null,
    });
    throw mismatch;
  }
  return prospect;
}

async function getProductiveClient() {
  const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (!bootstrap?.getClient) {
    const error = new Error("PIPELINE_STAGE_BOOTSTRAP_UNAVAILABLE");
    error.code = "PIPELINE_STAGE_BOOTSTRAP_UNAVAILABLE";
    throw error;
  }
  return bootstrap.getClient();
}

function applyConfirmedStage(card, select, status) {
  card.dataset.productiveStage = status;
  card.dataset.stagePersistence = "saved";
  select.value = status;
  select.dataset.confirmedStage = status;
  select.removeAttribute("aria-invalid");
  card.querySelector("[data-productive-stage-label]")?.replaceChildren(
    card.ownerDocument.createTextNode(STAGE_LABELS[status] || status),
  );
}

function reconcileFilteredCardPresence(root, card, status) {
  const sourceFilter = root.querySelector("[data-productive-filter-source]")?.value || "";
  const statusFilter = root.querySelector("[data-productive-filter-status]")?.value || "";
  const matchesSource = !sourceFilter || card.dataset.productiveSource === sourceFilter;
  const matchesStatus = !statusFilter || status === statusFilter;
  if (matchesSource && matchesStatus) return true;

  const container = card.closest("[data-productive-pipeline-cards]");
  card.remove();
  const remaining = container?.querySelectorAll(CARD_SELECTOR).length || 0;
  const countNode = root.querySelector("[data-productive-filter-count]");
  const total = Number(
    String(countNode?.textContent || "").match(/de\s+(\d+)/i)?.[1] || 0,
  );
  if (countNode) countNode.textContent = `${remaining} de ${total} prospectos`;

  if (container && remaining === 0) {
    const empty = root.ownerDocument.createElement("section");
    empty.className = "pipeline-module__filter-empty";
    empty.dataset.productiveFilterEmpty = "";
    empty.innerHTML = "<p>No hay prospectos que coincidan con estos filtros.</p>";
    container.replaceWith(empty);
  }
  return false;
}

function scheduleDeferredReconciliation(root, confirmed) {
  root[DEFERRED_RECONCILE_KEY] = Object.freeze({
    prospectId: confirmed.id,
    prospectStatus: confirmed.status,
    confirmedAt: Date.now(),
  });
  root.ownerDocument.documentElement.dataset.pipelineStageDeferredReconcile = "pending";
}

function flushDeferredReconciliation({
  root,
  windowRef,
  source = "pipeline-stage-rpc-deferred-reconcile",
}) {
  const pending = root[DEFERRED_RECONCILE_KEY];
  if (!pending) return false;
  delete root[DEFERRED_RECONCILE_KEY];
  delete root.ownerDocument.documentElement.dataset.pipelineStageDeferredReconcile;
  windowRef.dispatchEvent(new windowRef.CustomEvent(
    "forge:auth-state-changed",
    {
      detail: Object.freeze({
        status: "authenticated",
        source,
        prospectId: pending.prospectId,
        prospectStatus: pending.prospectStatus,
      }),
    },
  ));
  return true;
}

async function persistStage(root, select) {
  const card = select.closest(CARD_SELECTOR);
  const prospectId = select.dataset.productiveStageControl;
  if (!card || !prospectId) return;

  const previous = select.dataset.confirmedStage || card.dataset.productiveStage || "";
  const requested = select.value;
  if (!requested || requested === previous) return;

  select.disabled = true;
  select.setAttribute("aria-busy", "true");
  select.removeAttribute("aria-invalid");
  card.dataset.stagePersistence = "saving";
  showStatus(root, "Guardando estado…", { persist: true });

  try {
    const client = await getProductiveClient();
    const confirmed = await requestStageTransition({
      client,
      prospectId,
      status: requested,
    });

    applyConfirmedStage(card, select, confirmed.status);
    const remainedVisible = reconcileFilteredCardPresence(
      root,
      card,
      confirmed.status,
    );
    if (
      remainedVisible
      && root.querySelector(
        `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"]`,
      ) !== card
    ) {
      const mismatch = new Error("PIPELINE_STAGE_CARD_IDENTITY_CHANGED");
      mismatch.code = "PIPELINE_STAGE_CARD_IDENTITY_CHANGED";
      throw mismatch;
    }
    scheduleDeferredReconciliation(root, confirmed);
    showStatus(root, `Estado actualizado a ${STAGE_LABELS[confirmed.status] || confirmed.status}.`);
  } catch (error) {
    const currentCard = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"]`,
    ) || card;
    const currentSelect = currentCard.querySelector(STAGE_SELECTOR) || select;
    currentCard.dataset.productiveStage = previous;
    currentCard.dataset.stagePersistence = "error";
    currentSelect.value = previous;
    currentSelect.dataset.confirmedStage = previous;
    currentSelect.setAttribute("aria-invalid", "true");
    showStatus(root, stageErrorMessage(error), { error: true, persist: true });
    console.error("[ForgeOS][PipelineStageRPC]", error);
  } finally {
    const currentSelect = root.querySelector(
      `${CARD_SELECTOR}[data-productive-prospect-card="${CSS.escape(prospectId)}"] ${STAGE_SELECTOR}`,
    ) || select;
    if (currentSelect.isConnected) {
      currentSelect.disabled = false;
      currentSelect.removeAttribute("aria-busy");
    }
  }
}

export function installPipelineStageRpcAuthority({
  documentRef = document,
  windowRef = window,
} = {}) {
  const root = documentRef.querySelector(ROOT_SELECTOR);
  if (!root) return null;
  if (root[INSTALL_KEY]) return root[INSTALL_KEY];

  const onChange = event => {
    const select = event.target?.closest?.(STAGE_SELECTOR);
    if (!select) return;

    // This is the only stage mutation authority. It intentionally runs before
    // the historic hotfix and the card-local listener.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void persistStage(root, select);
  };
  const onVisibilityChange = () => {
    if (!documentRef.hidden) return;
    flushDeferredReconciliation({
      root,
      windowRef,
      source: "pipeline-stage-rpc-tab-hidden",
    });
  };
  const onNavigation = event => {
    const navigation = event.target?.closest?.("[data-route-id]");
    if (!navigation || navigation.dataset.routeId === "pipeline") return;
    windowRef.setTimeout(() => {
      flushDeferredReconciliation({
        root,
        windowRef,
        source: "pipeline-stage-rpc-route-exit",
      });
    }, 0);
  };

  root.addEventListener("change", onChange, true);
  documentRef.addEventListener("visibilitychange", onVisibilityChange);
  documentRef.addEventListener("click", onNavigation, true);

  documentRef.documentElement.dataset.pipelineStageAuthority = "rpc";
  documentRef.documentElement.dataset.pipelineStageRpcAuthority = "ready";
  documentRef.documentElement.dataset.pipelineStageCommitMode = "in-place";

  const api = Object.freeze({
    installed: true,
    flushDeferredReconciliation: source => flushDeferredReconciliation({
      root,
      windowRef,
      source,
    }),
    disconnect() {
      root.removeEventListener("change", onChange, true);
      documentRef.removeEventListener("visibilitychange", onVisibilityChange);
      documentRef.removeEventListener("click", onNavigation, true);
      delete root[INSTALL_KEY];
      delete root[DEFERRED_RECONCILE_KEY];
      delete documentRef.documentElement.dataset.pipelineStageRpcAuthority;
      delete documentRef.documentElement.dataset.pipelineStageCommitMode;
      delete documentRef.documentElement.dataset.pipelineStageDeferredReconcile;
    },
  });
  root[INSTALL_KEY] = api;
  return api;
}

if (
  typeof document !== "undefined"
  && typeof window !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_STAGE_RPC_AUTHORITY_AUTO_INSTALL__
) {
  installPipelineStageRpcAuthority();
}

export {
  ALLOWED_STAGES,
  STAGE_LABELS,
  flushDeferredReconciliation,
  isDiagnosticRuntime,
  normalizeRpcProspect,
  requestDiagnosticStageTransition,
  scheduleDeferredReconciliation,
};