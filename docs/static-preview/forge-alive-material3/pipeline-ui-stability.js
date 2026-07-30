const STAGE_LABELS = Object.freeze({
  referred_new: "Nuevo",
  contacted: "Contactado",
  appointment_scheduled: "Cita agendada",
  proposal: "Propuesta",
  decision: "En decisión",
  client: "Cliente",
});

const WORKSPACE_TRIGGER_SELECTOR = [
  "[data-prepare-productive-message]",
  "[data-open-combat]",
  "[data-open-nba]",
  "[data-view-productive-context]",
  "[data-pipeline-create-referral]",
].join(",");

const RERENDER_TRIGGER_SELECTOR = [
  "[data-clear-productive-filters]",
  "[data-register-combat]",
].join(",");

export function stageLabelFor(value) {
  return STAGE_LABELS[value] || value || "Etapa no disponible";
}

export function applyStagePresentation(card, value, persistence = "saving") {
  if (!card || !value) return null;
  const previous = card.dataset?.productiveStage || null;
  const label = stageLabelFor(value);
  if (card.dataset) {
    card.dataset.productiveStage = value;
    card.dataset.stagePersistence = persistence;
  }
  const badge = card.querySelector?.("[data-productive-stage-label]");
  if (badge) badge.textContent = label;
  const select = card.querySelector?.("[data-productive-stage-control]");
  if (select) {
    select.value = value;
    select.setAttribute?.("aria-busy", persistence === "saving" ? "true" : "false");
  }
  return { previous, value, label };
}

export function restoreStagePresentation(card, snapshot) {
  if (!card || !snapshot?.previous) return false;
  applyStagePresentation(card, snapshot.previous, "error");
  const select = card.querySelector?.("[data-productive-stage-control]");
  select?.removeAttribute?.("aria-busy");
  return true;
}

function installStabilityStyles(documentRef) {
  if (documentRef.querySelector("[data-forge-pipeline-stability-styles]")) return;
  const style = documentRef.createElement("style");
  style.dataset.forgePipelineStabilityStyles = "true";
  style.textContent = `
    .pipeline-module__productive-card {
      border-color: color-mix(in srgb, var(--pipeline-stage-accent) 42%, transparent) !important;
      border-left-color: var(--pipeline-stage-accent) !important;
      transition: border-color .16s ease, box-shadow .16s ease, opacity .16s ease;
    }
    .pipeline-module__productive-card[data-stage-persistence="saving"] {
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--pipeline-stage-accent) 32%, transparent),
        0 12px 30px rgba(0, 0, 0, .2);
    }
    .pipeline-module__productive-card[data-stage-persistence="error"] {
      animation: forge-stage-revert .24s ease 1;
    }
    @keyframes forge-stage-revert {
      50% { opacity: .72; }
    }
    @media (hover: none), (pointer: coarse) {
      .pipeline-module__card-actions button:hover,
      .pipeline-module__card-actions a:hover {
        transform: none !important;
      }
    }
  `;
  documentRef.head.append(style);
}

export function installPipelineUiStability({
  documentRef = globalThis.document,
  windowRef = globalThis.window,
} = {}) {
  if (!documentRef || !windowRef) return Object.freeze({ installed: false });
  if (documentRef.documentElement.dataset.forgePipelineUiStability === "ready") {
    return Object.freeze({ installed: true, reused: true });
  }

  installStabilityStyles(documentRef);

  const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
  const pendingStages = new Map();
  let anchor = null;
  let anchorRestorationScheduled = false;
  let scrollLockSnapshot = null;
  let observerApplyingStage = false;

  const pipelineRoot = () => documentRef.querySelector("[data-forge-pipeline-module]");
  const escapeValue = value => windowRef.CSS?.escape?.(value) || String(value).replace(/["\\]/g, "\\$&");

  function captureAnchor(target) {
    const card = target?.closest?.("[data-productive-prospect-card]");
    anchor = {
      cardId: card?.dataset?.productiveProspectCard || null,
      top: card?.getBoundingClientRect?.().top ?? null,
      scrollX: windowRef.scrollX || 0,
      scrollY: windowRef.scrollY || 0,
      focusSelector: target?.matches?.("[data-productive-stage-control]")
        ? `[data-productive-stage-control="${escapeValue(target.dataset.productiveStageControl)}"]`
        : null,
    };
  }

  function restoreAnchorAfterRender() {
    if (!anchor || anchorRestorationScheduled) return;
    anchorRestorationScheduled = true;
    windowRef.requestAnimationFrame(() => {
      windowRef.requestAnimationFrame(() => {
        const snapshot = anchor;
        anchor = null;
        anchorRestorationScheduled = false;
        if (!snapshot) return;

        if (snapshot.cardId && snapshot.top !== null) {
          const selector = `[data-productive-prospect-card="${escapeValue(snapshot.cardId)}"]`;
          const nextCard = documentRef.querySelector(selector);
          const nextTop = nextCard?.getBoundingClientRect?.().top;
          if (Number.isFinite(nextTop)) {
            windowRef.scrollBy(0, nextTop - snapshot.top);
          } else {
            windowRef.scrollTo(snapshot.scrollX, snapshot.scrollY);
          }
        } else {
          windowRef.scrollTo(snapshot.scrollX, snapshot.scrollY);
        }

        if (snapshot.focusSelector) {
          documentRef.querySelector(snapshot.focusSelector)?.focus?.({ preventScroll: true });
        }
      });
    });
  }

  function prepareScrollLock() {
    if (scrollLockSnapshot) return;
    const body = documentRef.body;
    const computedPadding = Number.parseFloat(windowRef.getComputedStyle(body).paddingRight) || 0;
    scrollLockSnapshot = {
      inlinePaddingRight: body.style.paddingRight,
      computedPadding,
      scrollbarWidth: Math.max(0, windowRef.innerWidth - documentRef.documentElement.clientWidth),
      scrollX: windowRef.scrollX || 0,
      scrollY: windowRef.scrollY || 0,
    };
  }

  function workspaceIsOpen() {
    const html = documentRef.documentElement;
    return html.hasAttribute("data-forge-productive-workspace-open")
      || html.hasAttribute("data-forge-referral-sheet-open");
  }

  function synchronizeScrollLock() {
    const body = documentRef.body;
    if (workspaceIsOpen()) {
      prepareScrollLock();
      if (scrollLockSnapshot.scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollLockSnapshot.computedPadding + scrollLockSnapshot.scrollbarWidth}px`;
      }
      windowRef.scrollTo(scrollLockSnapshot.scrollX, scrollLockSnapshot.scrollY);
      return;
    }
    if (!scrollLockSnapshot) return;
    body.style.paddingRight = scrollLockSnapshot.inlinePaddingRight;
    windowRef.scrollTo(scrollLockSnapshot.scrollX, scrollLockSnapshot.scrollY);
    scrollLockSnapshot = null;
  }

  documentRef.addEventListener("pointerdown", event => {
    if (event.target?.closest?.(WORKSPACE_TRIGGER_SELECTOR)) prepareScrollLock();
  }, true);

  documentRef.addEventListener("click", event => {
    const workspaceTrigger = event.target?.closest?.(WORKSPACE_TRIGGER_SELECTOR);
    if (workspaceTrigger) {
      prepareScrollLock();
      captureAnchor(workspaceTrigger);
      return;
    }
    const rerenderTrigger = event.target?.closest?.(RERENDER_TRIGGER_SELECTOR);
    if (rerenderTrigger) captureAnchor(rerenderTrigger);
  }, true);

  documentRef.addEventListener("change", event => {
    const select = event.target?.closest?.("[data-productive-stage-control]");
    if (select) {
      const card = select.closest("[data-productive-prospect-card]");
      const cardId = card?.dataset?.productiveProspectCard;
      const desired = select.value;
      const previous = card?.dataset?.productiveStage;
      if (!card || !cardId || !desired || desired === previous) return;

      captureAnchor(select);
      const snapshot = applyStagePresentation(card, desired, "saving");
      pendingStages.set(cardId, {
        ...snapshot,
        cardId,
        desired,
        startedAt: Date.now(),
      });

      const failureObserver = new Observer(() => {
        if (select.getAttribute("aria-invalid") !== "true") return;
        const pending = pendingStages.get(cardId);
        if (pending) restoreStagePresentation(card, pending);
        pendingStages.delete(cardId);
        failureObserver.disconnect();
      });
      failureObserver.observe(select, { attributes: true, attributeFilter: ["aria-invalid"] });
      windowRef.setTimeout(() => failureObserver.disconnect(), 15000);
      return;
    }

    if (event.target?.matches?.("[data-productive-filter-source], [data-productive-filter-status]")) {
      captureAnchor(event.target);
    }
  }, true);

  const htmlObserver = new Observer(synchronizeScrollLock);
  htmlObserver.observe(documentRef.documentElement, {
    attributes: true,
    attributeFilter: [
      "data-forge-productive-workspace-open",
      "data-forge-referral-sheet-open",
    ],
  });

  const rootObserver = new Observer(mutations => {
    if (observerApplyingStage) return;
    const root = pipelineRoot();
    if (!root || !mutations.some(mutation => mutation.type === "childList")) return;

    observerApplyingStage = true;
    try {
      for (const [cardId, pending] of pendingStages) {
        const selector = `[data-productive-prospect-card="${escapeValue(cardId)}"]`;
        const card = root.querySelector(selector);
        if (!card) continue;

        const authoritative = card.dataset.productiveStage;
        if (authoritative === pending.desired) {
          applyStagePresentation(card, pending.desired, "saved");
          card.querySelector?.("[data-productive-stage-control]")?.removeAttribute?.("aria-busy");
          pendingStages.delete(cardId);
          windowRef.setTimeout(() => {
            if (card.isConnected && card.dataset.stagePersistence === "saved") {
              delete card.dataset.stagePersistence;
            }
          }, 900);
        } else if (Date.now() - pending.startedAt > 12000) {
          applyStagePresentation(card, authoritative, "error");
          card.querySelector?.("[data-productive-stage-control]")?.removeAttribute?.("aria-busy");
          pendingStages.delete(cardId);
        }
      }
    } finally {
      observerApplyingStage = false;
    }
    restoreAnchorAfterRender();
  });

  const root = pipelineRoot();
  if (root) rootObserver.observe(root, { childList: true, subtree: false });

  documentRef.documentElement.dataset.forgePipelineUiStability = "ready";

  return Object.freeze({
    installed: true,
    pendingStages,
    synchronizeScrollLock,
    disconnect() {
      htmlObserver.disconnect();
      rootObserver.disconnect();
      delete documentRef.documentElement.dataset.forgePipelineUiStability;
    },
  });
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  installPipelineUiStability();
}
