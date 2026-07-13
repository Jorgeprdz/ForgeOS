

/* FORGE:093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION:START */
const FORGE_QUOTE_PREVIEW_SAFE_STATIC_BOUNDARY_093B_DASHBOARD = Object.freeze({
  phase: '093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION',
  boundary: 'static_safe_preview_boundary_only',
  labels: [
    'Preview',
    'Solo lectura',
    'Revisión humana',
    'No cotización oficial',
    'Sin envío',
    'Sin CRM',
    'Sin calendario',
  ],
  copy: {
    primary: 'Este preview es solo una referencia operativa. No es una cotización oficial.',
    review: 'Requiere revisión humana antes de cualquier acción real.',
    boundary: 'Sin envío, sin CRM, sin calendario y sin cambios reales.',
  },
  permissions: {
    officialQuoteAllowed: false,
    quoteTruthAllowed: false,
    sendAllowed: false,
    crmWriteAllowed: false,
    calendarCreateAllowed: false,
    backendConnectionAllowed: false,
    providerCallAllowed: false,
    parserExecutionAllowed: false,
    calculatorExecutionAllowed: false,
    banxicoCallAllowed: false,
    newActionHandlerAllowed: false,
    businessLogicChangeAllowed: false,
    dataFlowChangeAllowed: false,
  },
});
/* FORGE:093B_QUOTE_PREVIEW_SAFE_STATIC_UI_SOURCE_PATCH_IMPLEMENTATION:END */

const app = document.querySelector(".alfred-desktop-app-056g7");
const desktopQuery = window.matchMedia
  ? window.matchMedia("(min-width: 900px)")
  : { matches: window.innerWidth >= 900 };

function setActiveButton(buttons, selected) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button === selected);
  });
}

function syncSmartWidgetSlot() {
  const stack = document.getElementById("smart-widget-stack");
  const desktopSlot = document.querySelector("[data-smart-widget-desktop-slot]");
  if (!stack || !desktopSlot) return;

  if (stack.parentElement !== desktopSlot) {
    desktopSlot.appendChild(stack);
  }
  stack.dataset.smartWidgetSlot = "desktop";
}

function syncCommandSlot() {
  const commandLayer = document.querySelector("[data-command-orb-layer]");
  const desktopSlot = document.querySelector("[data-command-desktop-slot]");
  const mobileSlot = document.querySelector("[data-command-mobile-slot]");
  if (!commandLayer || !desktopSlot || !mobileSlot) return;

  const targetSlot = desktopQuery.matches ? desktopSlot : mobileSlot;
  if (commandLayer.parentElement !== targetSlot) {
    targetSlot.appendChild(commandLayer);
  }
}

function syncResponsiveSlots() {
  syncSmartWidgetSlot();
  syncCommandSlot();
}

function hydrateFromSampleData() {
  const sample = window.FORGE_SAMPLE_DATA;
  if (!app || !sample) return;

  const greeting = app.querySelector(".alfred-topbar-056g7 span");
  const dayTitle = app.querySelector(".alfred-topbar-056g7 h1");
  const production = app.querySelector('[data-kpi="produccion"] strong');
  const opportunities = [...app.querySelectorAll(".alfred-opportunity-list-056g7 button")];

  if (greeting && sample.greeting) greeting.textContent = sample.greeting;
  if (dayTitle && sample.dayTitle) dayTitle.textContent = sample.dayTitle;
  if (production && sample.monthlyGoal && sample.monthlyGoal.sampleAmount) {
    production.textContent = sample.monthlyGoal.sampleAmount;
  }

  if (Array.isArray(sample.opportunities)) {
    opportunities.forEach((button, index) => {
      const item = sample.opportunities[index];
      if (!item) return;
      const name = button.querySelector("strong");
      if (name) name.textContent = item.name;
      button.dataset.client = item.name;
    });
  }
}

function initAlfredDesktopDashboard056G7() {
  syncResponsiveSlots();
  if (!app) return;
  hydrateFromSampleData();

  const navButtons = [...app.querySelectorAll(".alfred-nav-056g7 button")];
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(navButtons, button);
      app.dataset.section = button.dataset.section || "inicio";
    });
  });

  const kpiButtons = [...app.querySelectorAll(".alfred-kpi-056g7")];
  kpiButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(kpiButtons, button);
      app.dataset.kpi = button.dataset.kpi || "meta";
    });
  });

  const selectedClient = app.querySelector("#alfred-selected-client-056g7");
  const clientButtons = [...app.querySelectorAll("[data-client]")];
  clientButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton(clientButtons, button);
      if (selectedClient) selectedClient.textContent = button.dataset.client || "Cliente";
    });
  });

  app.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.command || "";
      const commandLayer = document.querySelector("[data-command-orb-layer]");
      const orb = commandLayer && commandLayer.querySelector(".command-orb");
      const input = commandLayer && commandLayer.querySelector(".command-pill-input");
      if (orb) orb.click();
      if (!input) return;
      if (command === "plan") input.value = "follow";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
  });
}

if (desktopQuery.addEventListener) {
  desktopQuery.addEventListener("change", syncResponsiveSlots);
} else if (desktopQuery.addListener) {
  desktopQuery.addListener(syncResponsiveSlots);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAlfredDesktopDashboard056G7);
} else {
  initAlfredDesktopDashboard056G7();
}

window.addEventListener("load", syncResponsiveSlots, { once: true });
if (window.requestAnimationFrame) {
  window.requestAnimationFrame(syncResponsiveSlots);
} else {
  window.setTimeout(syncResponsiveSlots, 0);
}
