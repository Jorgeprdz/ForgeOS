import {
  REVIEW_STATE_TYPE,
  getSalesPresentationReviewState,
  subscribeSalesPresentationReviewState,
  updateSalesPresentationSlide,
} from "./forge-sales-presentation-review-state-store.js";

const VERSION = "R16J2";

let overlay = null;
let bound = false;
let unsubscribe = null;
let callbacks = null;
let activeSlideId = null;
let noticeTimer = 0;

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const display = (value) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
};

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

function isDebugMode() {
  const value = new URLSearchParams(location.search).get("debug");
  return value === "1" || value === "true";
}

function buildSalesPresentationEditablePreviewModel(reviewState) {
  if (reviewState?.packetType !== REVIEW_STATE_TYPE) {
    throw new TypeError("Valid review state required");
  }

  return Object.freeze({
    packetType: "SALES_PRESENTATION_EDITABLE_PREVIEW_MODEL",
    version: VERSION,
    sessionId: reviewState.sessionId,
    contentRevision: reviewState.contentRevision,
    status: reviewState.status,
    approval: reviewState.approval,
    exportAuthorization: reviewState.exportAuthorization,
    safety: reviewState.safety,
    slides: reviewState.slides.map((slide) =>
      Object.freeze({
        ...slide,
        editableFields: Object.freeze([
          "title",
          "purpose",
          "notes",
        ]),
        facts: slide.facts.map((fact) =>
          Object.freeze({
            ...fact,
            editable: false,
          }),
        ),
      }),
    ),
  });
}

function stateLabel(model) {
  if (model.exportAuthorization.authorized) {
    return "Exportación lista";
  }

  if (model.approval.approved) {
    return "Aprobada";
  }

  return "Borrador editable";
}

function findFact(model, patterns) {
  for (const slide of model.slides) {
    for (const fact of slide.facts) {
      const label = normalize(fact.label);

      if (patterns.some((pattern) => label.includes(pattern))) {
        return fact;
      }
    }
  }

  return null;
}

function contextValue(fact) {
  const value = display(fact?.value).trim();
  return value || "Sin dato confirmado";
}

function currentSlide(model) {
  const candidate = model.slides.find(
    (slide) => slide.id === activeSlideId,
  );

  if (candidate) return candidate;

  const first = model.slides[0] || null;
  activeSlideId = first?.id || null;
  return first;
}

function ensureUi() {
  if (typeof document === "undefined") return null;

  if (overlay && document.contains(overlay)) {
    return overlay;
  }

  overlay = document.createElement("section");
  overlay.className = "forge-r16j1";
  overlay.hidden = true;
  overlay.setAttribute(
    "data-forge-sales-presentation-workspace-r16j1",
    "true",
  );
  overlay.setAttribute(
    "data-forge-presentation-authority",
    "ADVISOR_OS",
  );
  overlay.setAttribute(
    "data-forge-presentation-editor-route",
    "ADVISOR_OS_IN_PAGE_EDITOR",
  );
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute(
    "aria-label",
    "Workspace de presentación de venta",
  );

  overlay.innerHTML = `
    <div class="forge-r16j1__panel">
      <header class="forge-r16j1__header">
        <div class="forge-r16j1__heading">
          <span class="forge-r16j1__eyebrow">
            Presentación de venta
          </span>
          <h2>Revisión editable</h2>
          <p>
            Ajusta la narrativa. Los datos confirmados permanecen
            bloqueados.
          </p>
        </div>

        <div class="forge-r16j1__header-actions">
          <span
            class="forge-r16j1__state"
            data-role="workspace-state"
          ></span>

          <button
            type="button"
            class="forge-r16j1__icon-button"
            data-action="close"
            aria-label="Cerrar presentación"
          >
            ×
          </button>
        </div>
      </header>

      <div class="forge-r16j1__context" data-role="context">
        <article>
          <span>Objetivo del cliente</span>
          <strong data-role="client-objective"></strong>
        </article>

        <article>
          <span>Encaje documentado</span>
          <strong data-role="recommendation-rationale"></strong>
        </article>

        <article>
          <span>Notas del asesor</span>
          <strong data-role="advisor-notes"></strong>
        </article>
      </div>

      <div class="forge-r16j1__layout">
        <aside class="forge-r16j1__rail">
          <div class="forge-r16j1__rail-title">
            <span>Diapositivas</span>
            <small data-role="slide-count"></small>
          </div>

          <nav
            class="forge-r16j1__slide-nav"
            data-role="slide-nav"
            aria-label="Diapositivas"
          ></nav>
        </aside>

        <main class="forge-r16j1__workspace">
          <section
            class="forge-r16j1__canvas"
            data-role="client-canvas"
          ></section>

          <section
            class="forge-r16j1__editor"
            data-role="slide-editor"
          ></section>
        </main>
      </div>

      <footer class="forge-r16j1__footer">
        <div class="forge-r16j1__footer-copy">
          <strong data-role="notice">
            Revisa cada diapositiva antes de aprobar.
          </strong>
          <small>
            Forge · R16J2 · Advisor OS · revisión local
          </small>
        </div>

        <label class="forge-r16j1__reviewer">
          <span>Aprueba</span>
          <input
            data-role="reviewer"
            autocomplete="name"
            placeholder="Nombre del revisor"
          >
        </label>

        <div class="forge-r16j1__actions">
          <button
            type="button"
            class="forge-r16j1__button forge-r16j1__button--primary"
            data-action="approve"
          >
            Aprobar revisión
          </button>

          <button
            type="button"
            class="forge-r16j1__button"
            data-action="authorize"
          >
            Autorizar PDF
          </button>

          <button
            type="button"
            class="forge-r16j1__button"
            data-action="export"
          >
            Imprimir / PDF
          </button>

          <button
            type="button"
            class="forge-r16j1__button forge-r16j1__button--danger"
            data-action="revoke"
          >
            Revocar
          </button>
        </div>
      </footer>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function setNotice(message, tone = "neutral") {
  const root = ensureUi();
  const notice = root?.querySelector('[data-role="notice"]');

  if (!notice) return;

  notice.textContent = message;
  notice.dataset.tone = tone;

  window.clearTimeout(noticeTimer);

  if (tone !== "error") {
    noticeTimer = window.setTimeout(() => {
      const current = getSalesPresentationReviewState();

      if (!current || root.hidden) return;

      notice.textContent =
        "Revisa cada diapositiva antes de aprobar.";
      notice.dataset.tone = "neutral";
    }, 2200);
  }
}

function renderContext(root, model) {
  const objective = findFact(model, [
    "objetivo",
    "meta del cliente",
    "intencion",
  ]);
  const rationale = findFact(model, [
    "razon",
    "recomendacion",
    "por que",
  ]);

  const notes = model.slides
    .flatMap((slide) => slide.notes)
    .filter(Boolean);

  root.querySelector(
    '[data-role="client-objective"]',
  ).textContent = contextValue(objective);

  root.querySelector(
    '[data-role="recommendation-rationale"]',
  ).textContent = contextValue(rationale);

  root.querySelector(
    '[data-role="advisor-notes"]',
  ).textContent =
    notes[0] || "Sin nota documentada";
}

function renderSlideNav(root, model, selected) {
  root.querySelector('[data-role="slide-count"]').textContent =
    `${model.slides.length}`;

  root.querySelector('[data-role="slide-nav"]').innerHTML =
    model.slides
      .map(
        (slide) => `
          <button
            type="button"
            data-action="select-slide"
            data-slide-id="${esc(slide.id)}"
            aria-current="${
              slide.id === selected.id ? "true" : "false"
            }"
          >
            <span>${slide.position}</span>
            <strong>${esc(slide.title)}</strong>
          </button>
        `,
      )
      .join("");
}

function renderCanvas(root, slide) {
  const factPreview = slide.facts.slice(0, 3);

  root.querySelector('[data-role="client-canvas"]').innerHTML = `
    <div class="forge-r16j1__canvas-watermark">
      Vista del cliente
    </div>

    <div class="forge-r16j1__slide-number">
      ${slide.position.toString().padStart(2, "0")}
    </div>

    <h3>${esc(slide.title)}</h3>
    <p>${esc(slide.purpose)}</p>

    <div class="forge-r16j1__canvas-facts">
      ${factPreview
        .map(
          (fact) => `
            <article>
              <span>${esc(fact.label)}</span>
              <strong>${esc(display(fact.value))}</strong>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderEditor(root, slide) {
  const debug = isDebugMode();

  root.querySelector('[data-role="slide-editor"]').innerHTML = `
    <div class="forge-r16j1__editor-heading">
      <div>
        <span>Narrativa editable</span>
        <h3>Diapositiva ${slide.position}</h3>
      </div>

      <span class="forge-r16j1__lock">
        Datos confirmados bloqueados
      </span>
    </div>

    <label class="forge-r16j1__field">
      <span>Título</span>
      <input
        data-edit-field="title"
        data-role="field-title"
        value="${esc(slide.title)}"
      >
    </label>

    <label class="forge-r16j1__field">
      <span>Propósito</span>
      <textarea
        data-edit-field="purpose"
        data-role="field-purpose"
      >${esc(slide.purpose)}</textarea>
    </label>

    <label class="forge-r16j1__field">
      <span>Notas del asesor</span>
      <textarea
        data-edit-field="notes"
        data-role="field-notes"
      >${esc(slide.notes.join("\n"))}</textarea>
    </label>

    <section class="forge-r16j1__facts">
      <div class="forge-r16j1__facts-heading">
        <div>
          <span>Datos confirmados</span>
          <h4>No editables</h4>
        </div>
        <small>${slide.facts.length} datos</small>
      </div>

      ${slide.facts
        .map(
          (fact) => `
            <article
              class="forge-r16j1__fact"
              data-fact-editable="false"
            >
              <div>
                <span>${esc(fact.label)}</span>
                <strong>${esc(display(fact.value))}</strong>
              </div>

              <small
                data-role="source-path"
                data-forge-debug-only-r16j1="true"
                ${debug ? "" : "hidden"}
              >
                ${esc(fact.sourcePath)}
              </small>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function render(reviewState) {
  const root = ensureUi();

  if (!root || !reviewState) return;

  const reviewerValue =
    root.querySelector('[data-role="reviewer"]')?.value || "";

  const model =
    buildSalesPresentationEditablePreviewModel(reviewState);
  const slide = currentSlide(model);

  if (!slide) {
    setNotice("La sesión no contiene diapositivas.", "error");
    return;
  }

  root.dataset.workspaceDebugMode = String(isDebugMode());

  root.querySelector('[data-role="workspace-state"]').textContent =
    `${stateLabel(model)} · revisión ${model.contentRevision}`;

  renderContext(root, model);
  renderSlideNav(root, model, slide);
  renderCanvas(root, slide);
  renderEditor(root, slide);

  const reviewer =
    root.querySelector('[data-role="reviewer"]');
  const approve =
    root.querySelector('[data-action="approve"]');
  const authorize =
    root.querySelector('[data-action="authorize"]');
  const exportButton =
    root.querySelector('[data-action="export"]');
  const revoke =
    root.querySelector('[data-action="revoke"]');

  reviewer.value = reviewerValue;

  approve.disabled =
    model.approval.approved ||
    !reviewer.value.trim();

  authorize.disabled =
    !model.approval.approved ||
    model.exportAuthorization.authorized;

  exportButton.disabled =
    !model.exportAuthorization.authorized;

  revoke.disabled =
    !model.approval.approved &&
    !model.exportAuthorization.authorized;

  root.dataset.approved = String(model.approval.approved);
  root.dataset.exportAuthorized = String(
    model.exportAuthorization.authorized,
  );
  root.dataset.contentRevision = String(
    model.contentRevision,
  );
}

function openSalesPresentationReviewUi() {
  const root = ensureUi();
  const state = getSalesPresentationReviewState();

  if (!root || !state) return false;

  render(state);
  root.hidden = false;
  document.body.classList.add("forge-r16j1-open");

  const selected =
    root.querySelector(
      '[data-action="select-slide"][aria-current="true"]',
    ) ||
    root.querySelector('[data-action="select-slide"]');

  selected?.focus?.();

  return true;
}

function closeSalesPresentationReviewUi() {
  if (!overlay) return;

  overlay.hidden = true;
  document.body.classList.remove("forge-r16j1-open");
}

function updateActiveSlide(field) {
  const state = getSalesPresentationReviewState();

  if (!state || !activeSlideId) return;

  const value =
    field.dataset.editField === "notes"
      ? field.value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : field.value;

  updateSalesPresentationSlide(activeSlideId, {
    [field.dataset.editField]: value,
  });

  setNotice(
    "Cambios guardados en esta revisión. La aprobación anterior quedó invalidada.",
    "success",
  );
}

function runAction(action, root) {
  if (!callbacks) return;

  if (action === "close") {
    closeSalesPresentationReviewUi();
    return;
  }

  if (action === "approve") {
    const approvedBy =
      root.querySelector('[data-role="reviewer"]').value.trim();

    if (!approvedBy) {
      setNotice(
        "Escribe el nombre de quien aprueba.",
        "error",
      );
      return;
    }

    try {
      callbacks.approveReview({
        approvedBy,
        reviewerType: "HUMAN",
      });
      setNotice(
        "Revisión aprobada. La exportación aún requiere autorización.",
        "success",
      );
    } catch (error) {
      setNotice(error.message, "error");
    }

    return;
  }

  if (action === "authorize") {
    try {
      callbacks.authorizeExport();
      setNotice(
        "Exportación autorizada para esta revisión.",
        "success",
      );
    } catch (error) {
      setNotice(error.message, "error");
    }

    return;
  }

  if (action === "export") {
    try {
      callbacks.exportToPrintPdf();
    } catch (error) {
      setNotice(error.message, "error");
    }

    return;
  }

  if (action === "revoke") {
    callbacks.revokeApproval(
      "HUMAN_REVOKED_FROM_R16J1_WORKSPACE",
    );
    setNotice("Aprobación revocada.", "success");
  }
}

function bindSalesPresentationReviewUi({
  buildReviewBundle,
  startReviewSession,
  approveReview,
  revokeApproval,
  authorizeExport,
  exportToPrintPdf,
} = {}) {
  if (bound || typeof document === "undefined") return;

  const supplied = {
    buildReviewBundle,
    startReviewSession,
    approveReview,
    revokeApproval,
    authorizeExport,
    exportToPrintPdf,
  };

  for (const [name, fn] of Object.entries(supplied)) {
    if (typeof fn !== "function") {
      throw new TypeError(`Missing callback: ${name}`);
    }
  }

  callbacks = Object.freeze(supplied);
  bound = true;

  const boot = () => {
    const root = ensureUi();

    unsubscribe?.();
    unsubscribe = subscribeSalesPresentationReviewState(
      (state) => {
        if (state && !root.hidden) {
          render(state);
        }
      },
    );

    root.addEventListener("change", (event) => {
      const field = event.target.closest(
        "[data-edit-field]",
      );

      if (field) {
        updateActiveSlide(field);
      }
    });

    root.addEventListener("input", (event) => {
      if (!event.target.matches('[data-role="reviewer"]')) {
        return;
      }

      const state = getSalesPresentationReviewState();
      const approve = root.querySelector(
        '[data-action="approve"]',
      );

      approve.disabled =
        Boolean(state?.approval?.approved) ||
        !event.target.value.trim();
    });

    root.addEventListener("click", (event) => {
      const slideButton = event.target.closest(
        '[data-action="select-slide"]',
      );

      if (slideButton) {
        activeSlideId = slideButton.dataset.slideId;
        render(getSalesPresentationReviewState());
        return;
      }

      const action = event.target.closest(
        "[data-action]",
      )?.dataset.action;

      if (action) {
        runAction(action, root);
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSalesPresentationReviewUi();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true },
    );
  } else {
    boot();
  }
}

const api = Object.freeze({
  version: VERSION,
  buildSalesPresentationEditablePreviewModel,
  openSalesPresentationReviewUi,
  closeSalesPresentationReviewUi,
  bindSalesPresentationReviewUi,
  getWorkspaceState() {
    return Object.freeze({
      open: Boolean(overlay && !overlay.hidden),
      activeSlideId,
      debugMode: isDebugMode(),
      approvalAutomatic: false,
      exportAutomatic: false,
      factsEditable: false,
    });
  },
});

globalThis.ForgeSalesPresentationEditablePreview = api;

export {
  buildSalesPresentationEditablePreviewModel,
  openSalesPresentationReviewUi,
  closeSalesPresentationReviewUi,
  bindSalesPresentationReviewUi,
};
