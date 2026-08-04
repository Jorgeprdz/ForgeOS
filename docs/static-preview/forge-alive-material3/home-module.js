import { createAuthenticatedProductiveHome } from "./home-productive-orchestrator.js";
import { createHomeMonthlyGoalEditor } from "./home-monthly-goal-editor.js";
import { createHomeMickGoalGapCoach } from "./home-mick-goal-coach.js";

const homeStateKey = Symbol.for("forge.ui-m04.home.state");

function prepareProductiveRoot(root) {
  const staticPlan = root.querySelector(".plan-card");
  const staticFollowup = root.querySelector(".next-card");
  for (const node of [staticPlan, staticFollowup]) {
    if (!node) continue;
    node.hidden = true;
    node.dataset.replacedByProductiveSmartWidgets = "true";
    node.setAttribute("aria-hidden", "true");
  }

  const summary = root.querySelector(".summary-section") || document.createElement("section");
  if (!summary.isConnected) root.appendChild(summary);
  summary.removeAttribute("data-home-static-placeholder");
  summary.className = "summary-section productive-home-section";
  summary.removeAttribute("aria-labelledby");
  summary.replaceChildren();

  const productiveRoot = document.createElement("section");
  productiveRoot.dataset.forgeProductiveSmartWidgetRoot = "true";
  productiveRoot.dataset.forgePrivateSurface = "home-smart-widgets";
  productiveRoot.dataset.canonicalHomeActions = "true";
  productiveRoot.hidden = true;
  productiveRoot.dataset.homeGridSpan = "4x4";
  productiveRoot.setAttribute("aria-label", "Plan de hoy y seguimiento prioritario");
  summary.appendChild(productiveRoot);

  const access = document.createElement("section");
  access.className = "home-recovery-access";
  access.dataset.homeRecoveryAccess = "true";
  access.setAttribute("aria-label", "Accesos productivos");
  access.innerHTML = `
    <button type="button" data-home-route="cartera" data-home-grid-span="4x2"><span>CARTERA</span><strong>Revisa pólizas y evidencia</strong><small>Abre señales, vigencias y alta gobernada.</small></button>
    <button type="button" data-home-route="actividad" data-home-grid-span="2x2"><span>ACTIVIDAD</span><strong>Registra una interacción</strong><small>Confirmación humana y Timeline.</small></button>
    <button type="button" data-home-route="comisiones" data-home-grid-span="2x2"><span>COMISIONES</span><strong>Consulta ingreso verificable</strong><small>Pagado, devengado y desconocido separados.</small></button>
    <button type="button" data-home-route="pipeline" data-home-grid-span="4x2"><span>PIPELINE</span><strong>Continúa el trabajo comercial</strong><small>Sin crear acciones ni seguimientos automáticamente.</small></button>`;
  summary.appendChild(access);
  return { productiveRoot };
}

function createHonestEmptyCard(role) {
  const article = document.createElement("article");
  article.className = `productive-smart-widget is-${role} productive-smart-widget-canonical-empty`;
  article.dataset.canonicalRole = role;
  article.dataset.widgetState = "EMPTY";
  article.innerHTML = `
    <p class="productive-smart-widget-eyebrow">${role === "plan" ? "PLAN DE HOY" : "SIGUIENTE MEJOR ACCIÓN"}</p>
    <h3 class="productive-smart-widget-title">${role === "plan" ? "Sin una prioridad confiable todavía" : "Sin seguimiento prioritario calculable"}</h3>
    <p class="productive-smart-widget-subtitle">Forge esperará señales reales antes de recomendar una acción.</p>
    <div class="productive-smart-widget-footer"><span class="productive-smart-widget-confidence">Sin datos inventados</span></div>`;
  return article;
}

function makeReasonExpandable(card) {
  const reason = card.querySelector(".productive-smart-widget-reason");
  if (!reason || reason.dataset.expandableReason === "true") return;
  reason.dataset.expandableReason = "true";
  reason.hidden = true;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "productive-smart-widget-why-toggle";
  toggle.textContent = "¿Por qué?";
  toggle.setAttribute("aria-expanded", "false");
  toggle.addEventListener("click", () => {
    reason.hidden = !reason.hidden;
    toggle.setAttribute("aria-expanded", String(!reason.hidden));
    toggle.textContent = reason.hidden ? "¿Por qué?" : "Ocultar explicación";
  });
  reason.before(toggle);
}

function canonicalizeSmartWidgets(productiveRoot) {
  const heading = productiveRoot.querySelector(".productive-smart-widget-heading");
  if (heading) heading.hidden = true;
  const cards = productiveRoot.querySelector(".productive-smart-widget-cards");
  if (!cards) return;

  const rendered = [...cards.querySelectorAll(":scope > .productive-smart-widget")];
  const plan = rendered[0] || createHonestEmptyCard("plan");
  const followup = rendered[1] || createHonestEmptyCard("followup");

  plan.dataset.canonicalRole = "plan";
  plan.classList.add("is-plan");
  const planEyebrow = plan.querySelector(".productive-smart-widget-eyebrow");
  if (planEyebrow) planEyebrow.textContent = "PLAN DE HOY";

  followup.dataset.canonicalRole = "followup";
  followup.classList.remove("is-primary");
  followup.classList.add("is-followup");
  const followupEyebrow = followup.querySelector(".productive-smart-widget-eyebrow");
  if (followupEyebrow) followupEyebrow.textContent = "✦ SIGUIENTE MEJOR ACCIÓN";

  makeReasonExpandable(plan);
  makeReasonExpandable(followup);
  cards.replaceChildren(plan, followup);
  cards.dataset.canonicalActionCards = "true";

  const inventory = productiveRoot.querySelector(".productive-smart-widget-inventory");
  if (inventory) inventory.dataset.supportingIntelligence = "true";
  productiveRoot.dataset.intelligenceAbsorbed = "true";
}

export function createHomeModule({ root, shell }) {
  if (root[homeStateKey]) return root[homeStateKey];

  const abortController = new AbortController();
  const { signal } = abortController;
  const input = document.querySelector(".alfred-input input");
  const toast = document.querySelector(".toast");
  const { productiveRoot } = prepareProductiveRoot(root);
  const productiveHome = createAuthenticatedProductiveHome({ root: productiveRoot, shell });
  const monthlyGoalEditor = createHomeMonthlyGoalEditor({
    root: productiveRoot,
    productiveHome,
  });
  const mickGoalCoach = createHomeMickGoalGapCoach({
    root: productiveRoot,
    productiveHome,
    onNavigate: (routeId) => navigate(routeId, {
      view: routeId === "actividad" ? "advisor-forecast" : null,
    }),
  });
  let mounted = false;
  let toastTimer = null;

  function announce(message) {
    if (!toast) return;
    if (toastTimer !== null) window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
      toastTimer = null;
    }, 2400);
  }

  function navigate(routeId, { view = null } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("nav", routeId);
    for (const key of ["person", "sourceType", "sourceRef", "from"]) url.searchParams.delete(key);
    if (view) url.searchParams.set("view", view);
    else url.searchParams.delete("view");
    window.history.pushState({ forgeRoute: routeId, source: "home" }, "", `${url.pathname}${url.search}${url.hash}`);
    shell.reconcile();
  }

  function bindClick(target, handler) {
    if (!target || target.dataset.forgeHomeActionBound === "true") return;
    target.dataset.forgeHomeActionBound = "true";
    target.addEventListener("click", handler, { signal });
  }

  function bindStaticHomeActions() {
    bindClick(root.querySelector(".opportunities .section-heading button"), () => navigate("pipeline"));
    root.querySelectorAll(".opportunity-list .opportunity").forEach((button) => bindClick(button, () => navigate("pipeline")));
    root.querySelectorAll("[data-home-route]").forEach((button) => {
      bindClick(button, () => navigate(button.dataset.homeRoute));
    });

    const alfredSend = document.querySelector('.alfred-input button[aria-label="Enviar a Alfred"]');
    bindClick(alfredSend, () => {
      if (!input?.value.trim()) {
        input?.focus({ preventScroll: true });
        announce("Escribe una instrucción para Alfred.");
        return;
      }
      shell.setAlfredState("action", "action");
      announce("Alfred conserva la instrucción como propuesta; tu instrucción permanece sin enviar y ninguna acción se ejecuta sin aprobación humana.");
    });
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    document.querySelectorAll(".suggestions button").forEach((button) => {
      button.addEventListener("click", () => {
        if (!input) return;
        input.value = button.textContent;
        input.focus({ preventScroll: true });
        shell.setAlfredState("action", "action");
        shell.syncVisualViewport();
      }, { signal });
    });
    input?.addEventListener("focus", shell.syncVisualViewport, { signal });
    input?.addEventListener("blur", () => window.setTimeout(shell.syncVisualViewport, 120), { signal });
    bindStaticHomeActions();
    monthlyGoalEditor.mount();
    mickGoalCoach.mount();
    productiveHome.mount();
  }

  const api = Object.freeze({
    id: "inicio",
    root,
    mount,
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      Promise.resolve(productiveHome.reconcile()).then(() => {
        canonicalizeSmartWidgets(productiveRoot);
        monthlyGoalEditor.reconcile();
        mickGoalCoach.resume("home-reconcile");
      });
    },
    unmount() {
      root.hidden = true;
      root.dataset.moduleActive = "false";
      monthlyGoalEditor.close();
      mickGoalCoach.scrub("home-route-unmounted");
      productiveHome.scrub("home-route-unmounted");
    },
    diagnostics() {
      return Object.freeze({
        productiveHome: productiveHome.diagnostics?.(),
        monthlyGoalEditor: monthlyGoalEditor.diagnostics?.(),
        mickGoalCoach: mickGoalCoach.diagnostics?.(),
        canonicalActionCards: productiveRoot.dataset.canonicalActionCards === "true" || productiveRoot.dataset.intelligenceAbsorbed === "true",
      });
    },
  });
  root[homeStateKey] = api;
  return api;
}
