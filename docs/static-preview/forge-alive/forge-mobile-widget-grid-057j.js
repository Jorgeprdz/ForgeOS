/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_057J:START */
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

  function widget(size, className) {
    var node = el("article", "forge-mobile-widget-057j" + (className ? " " + className : ""));
    node.setAttribute("data-size", size);
    return node;
  }

  function kicker(text, right) {
    var row = el("div", "forge-widget-kicker-057j");
    row.appendChild(el("span", "", text));
    if (right) row.appendChild(el("span", "", right));
    return row;
  }

  function chart(values) {
    var node = el("div", "forge-widget-chart-057j");
    values.forEach(function (value) {
      var bar = document.createElement("i");
      bar.style.height = value + "%";
      node.appendChild(bar);
    });
    return node;
  }

  function spark(value) {
    var node = el("div", "forge-widget-spark-057j");
    var fill = document.createElement("span");
    fill.style.setProperty("--value", value);
    node.appendChild(fill);
    return node;
  }

  function buildGrid() {
    var grid = el("section", "forge-mobile-widget-grid-057j");
    grid.setAttribute("aria-label", "Forge mobile widget grid");

    var next = widget("4x4", "is-hero");
    next.appendChild(kicker("Siguiente mejor acción", "86"));
    next.appendChild(el("h2", "forge-widget-title-057j", "Seguimiento prioritario"));
    next.appendChild(el("p", "forge-widget-copy-057j", "Juan necesita revisión antes de que se enfríe. Abre /Follow con contexto listo."));
    next.appendChild(spark("86%"));
    next.appendChild(el("button", "forge-widget-action-057j", "Preparar preview"));
    grid.appendChild(next);

    var meta = widget("2x2");
    meta.appendChild(kicker("Meta mensual"));
    meta.appendChild(el("h3", "forge-widget-title-057j", "64%"));
    meta.appendChild(el("p", "forge-widget-copy-057j", "6 / 10 familias protegidas"));
    meta.appendChild(spark("64%"));
    grid.appendChild(meta);

    var follow = widget("2x2");
    follow.appendChild(kicker("Seguimiento"));
    follow.appendChild(el("h3", "forge-widget-title-057j", "78%"));
    follow.appendChild(el("p", "forge-widget-copy-057j", "Activo, 3 relaciones en riesgo"));
    follow.appendChild(spark("78%"));
    grid.appendChild(follow);

    var commissions = widget("4x2");
    commissions.appendChild(kicker("Comisiones", "Proyección"));
    commissions.appendChild(el("h3", "forge-widget-title-057j", "$142,000"));
    commissions.appendChild(el("p", "forge-widget-copy-057j", "Producción esperada con gap de $58,000 contra meta."));
    commissions.appendChild(chart([38, 44, 52, 61, 57, 72, 86]));
    grid.appendChild(commissions);

    var activity = widget("4x2");
    activity.appendChild(kicker("Actividad / 25 puntos", "Hoy"));
    activity.appendChild(el("h3", "forge-widget-title-057j", "18 / 25"));
    activity.appendChild(el("p", "forge-widget-copy-057j", "Faltan 7 puntos. Prioriza una llamada y dos seguimientos."));
    activity.appendChild(chart([50, 68, 42, 74, 58, 82, 72]));
    grid.appendChild(activity);

    var opportunities = widget("4x2");
    opportunities.appendChild(kicker("Oportunidades", "Muestra"));
    var list = el("div", "forge-widget-list-057j");
    [
      ["Lariza", "Pidió revisar opciones", "72%"],
      ["Octavio", "Falta confirmar cita", "65%"],
      ["María", "Necesita razón clara", "40%"]
    ].forEach(function (item) {
      var row = el("div");
      var left = el("span");
      left.appendChild(el("strong", "", item[0]));
      left.appendChild(document.createElement("br"));
      left.appendChild(el("small", "", item[1]));
      row.appendChild(left);
      row.appendChild(el("b", "", item[2]));
      list.appendChild(row);
    });
    opportunities.appendChild(list);
    grid.appendChild(opportunities);

    var production = widget("4x4");
    production.appendChild(kicker("Producción", "4x4"));
    production.appendChild(el("h3", "forge-widget-title-057j", "Gap recuperable"));
    production.appendChild(el("p", "forge-widget-copy-057j", "El gap baja si Lariza y Octavio avanzan esta semana. Usa Alfred para preparar el plan."));
    production.appendChild(chart([24, 39, 47, 63, 66, 78, 88]));
    production.appendChild(el("button", "forge-widget-action-057j", "Ver plan de producción"));
    grid.appendChild(production);

    grid.appendChild(el("p", "forge-widget-grid-note-057j", "Widgets 2x2, 4x2 y 4x4 en preview seguro."));
    return grid;
  }

  function removeLegacyMetricGrid() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".grid"));
    grids.forEach(function (node) {
      if (node.querySelector(".mini-card")) {
        node.setAttribute("data-forge-057j-legacy-grid", "hidden");
        node.hidden = true;
      }
    });
  }

  function mount() {
    if (!isMobile()) return;

    removeLegacyMetricGrid();

    var existing = document.querySelector(".forge-mobile-widget-grid-057j");
    var grid = existing || buildGrid();
    if (!existing) {
      var anchor = document.querySelector(".forge-smart-widget-static-056u") ||
        document.querySelector("[data-smart-widget-mobile-slot]") ||
        document.querySelector(".action-card") ||
        document.querySelector(".panel");

      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(grid, anchor.nextSibling);
      } else {
        document.querySelector(".phone-shell").appendChild(grid);
      }
    }

    document.documentElement.classList.add("forge-mobile-widget-grid-ready-057j");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  window.addEventListener("resize", function () {
    if (isMobile()) mount();
  }, { passive: true });
})();
/* FORGEOS:FORGE_MOBILE_WIDGET_GRID_057J:END */
