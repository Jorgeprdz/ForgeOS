/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_DEDUP_057M:START */
(function () {
  "use strict";

  function isMobile() {
    return window.matchMedia &&
      window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function getRole(widget) {
    return widget.getAttribute("data-forge-057l-role") || "";
  }

  function ensurePreviewLabel(widget, text) {
    var kicker = widget.querySelector(".forge-widget-kicker-057j");
    if (!kicker) return;

    var existing = kicker.querySelector(".forge-widget-preview-label-057m");
    if (existing) {
      existing.textContent = text;
      return;
    }

    var label = el("span", "forge-widget-preview-label-057m", text);
    var last = kicker.querySelector("span:last-child");
    if (last && last !== kicker.querySelector("span:first-child")) {
      last.replaceWith(label);
    } else {
      kicker.appendChild(label);
    }
  }

  function ensureWeekDays(widget) {
    if (widget.querySelector(".forge-widget-days-057m")) return;
    var chart = widget.querySelector(".forge-widget-chart-057j");
    if (!chart) return;

    var days = el("div", "forge-widget-days-057m");
    ["Lu", "Ma", "Mi", "Ju", "Vi"].forEach(function (day) {
      days.appendChild(el("span", "", day));
    });
    chart.insertAdjacentElement("afterend", days);
  }

  function removeDuplicateNextAction(widgets) {
    var nextActionWidgets = widgets.filter(function (widget) {
      var title = widget.querySelector(".forge-widget-title-057j");
      var role = getRole(widget);
      return role === "next-action" ||
        (title && /seguimiento prioritario/i.test(title.textContent || ""));
    });

    if (nextActionWidgets.length <= 1) return;

    nextActionWidgets.slice(1).forEach(function (widget) {
      widget.setAttribute("data-forge-057m-hidden", "true");
      widget.setAttribute("aria-hidden", "true");
    });
  }

  function polishCopy(widgets) {
    widgets.forEach(function (widget) {
      var role = getRole(widget);
      var title = widget.querySelector(".forge-widget-title-057j");
      var copy = widget.querySelector(".forge-widget-copy-057j");
      var action = widget.querySelector(".forge-widget-action-057j");

      if (role === "commissions-chart") {
        ensurePreviewLabel(widget, "Preview");
        if (title) title.textContent = "$142k";
        if (copy) copy.textContent = "Proyección mensual. Gap: $58k.";
      }

      if (role === "activity-points") {
        ensurePreviewLabel(widget, "Semana");
        ensureWeekDays(widget);
        if (title) title.textContent = "18 / 25";
        if (copy) copy.textContent = "Faltan 7 puntos hoy.";
      }

      if (role === "production-chart") {
        ensurePreviewLabel(widget, "Muestra");
        ensureWeekDays(widget);
        if (copy) copy.textContent = "Lariza y Octavio pueden mover el cierre.";
        if (action) action.textContent = "Abrir plan";
      }
    });
  }

  function mount() {
    if (!isMobile()) return;
    document.documentElement.classList.add("forge-mobile-widget-grid-dedup-057m");

    var widgets = Array.prototype.slice.call(document.querySelectorAll(".forge-mobile-widget-057j"));
    removeDuplicateNextAction(widgets);
    polishCopy(widgets);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  window.addEventListener("load", mount, { once: true });
  window.setTimeout(mount, 300);
})();
/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_DEDUP_057M:END */
