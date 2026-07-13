/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_POLISH_057L:START */
(function () {
  "use strict";

  function isMobile() {
    return window.matchMedia &&
      window.matchMedia("(max-width: 900px)").matches;
  }

  function text(node, value) {
    if (node && value) node.textContent = value;
  }

  function applyWidgetCopy() {
    var widgets = Array.prototype.slice.call(document.querySelectorAll(".forge-mobile-widget-057j"));

    widgets.forEach(function (widget) {
      var kicker = widget.querySelector(".forge-widget-kicker-057j span:first-child");
      var title = widget.querySelector(".forge-widget-title-057j");
      var copy = widget.querySelector(".forge-widget-copy-057j");
      var action = widget.querySelector(".forge-widget-action-057j");
      var key = (kicker && kicker.textContent || "").trim().toLowerCase();

      if (key.indexOf("siguiente") !== -1) {
        text(title, "Seguimiento prioritario");
        text(copy, "Juan necesita revisión. Prepara /Follow con contexto listo.");
        text(action, "Preparar preview");
        widget.setAttribute("data-forge-057l-role", "next-action");
      }

      if (key.indexOf("comisiones") !== -1) {
        text(title, "$142k");
        text(copy, "Proyección esperada. Gap: $58k contra meta.");
        widget.setAttribute("data-forge-057l-role", "commissions-chart");
      }

      if (key.indexOf("actividad") !== -1) {
        text(title, "18 / 25");
        text(copy, "Faltan 7 puntos. Una llamada y dos seguimientos.");
        widget.setAttribute("data-forge-057l-role", "activity-points");
      }

      if (key.indexOf("producción") !== -1 || key.indexOf("produccion") !== -1) {
        text(title, "Gap recuperable");
        text(copy, "Lariza y Octavio pueden mover el cierre semanal.");
        text(action, "Ver plan");
        widget.setAttribute("data-forge-057l-role", "production-chart");
      }
    });
  }

  function compactAlfredHero() {
    var heading = document.querySelector("#alfred-forge-heading");
    var card = heading && heading.closest(".assistant-card");
    if (!card) return;

    card.setAttribute("data-forge-057l-compact", "true");

    var paragraph = card.querySelector("p");
    if (paragraph && /Prioriza seguimiento antes de que se enfr/i.test(paragraph.textContent)) {
      paragraph.textContent = "Prioriza seguimiento antes de que se enfríe.";
    }
  }

  function hideLegacyMetricGrid() {
    Array.prototype.slice.call(document.querySelectorAll(".grid")).forEach(function (grid) {
      if (grid.querySelector(".mini-card")) {
        grid.hidden = true;
        grid.setAttribute("data-forge-057j-legacy-grid", "hidden");
      }
    });
  }

  function mount() {
    if (!isMobile()) return;
    document.documentElement.classList.add("forge-mobile-widget-grid-polished-057l");
    compactAlfredHero();
    hideLegacyMetricGrid();
    applyWidgetCopy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  window.addEventListener("load", mount, { once: true });
  window.setTimeout(mount, 250);
})();
/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_POLISH_057L:END */
