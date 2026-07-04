/* FORGEOS:DESKTOP_COMMAND_WORKSPACE_056Y */
(function () {
  "use strict";

  var suggestions = [
    ["Acción", "/llamar Lariza ahora", "Abre preview de llamada", "Preview"],
    ["Cotización", "/cotizar GMM Lariza", "Abre workspace de cotización", "Requiere aprobación"],
    ["Póliza", "/subir póliza Octavio", "Abre flujo documental", "No muta CRM"],
    ["Cliente", "/buscar cliente María", "Abre expediente y contexto", "Solo lectura"],
    ["Pipeline", "/pipeline riesgo alto", "Filtra oportunidades críticas", "Vista"],
    ["Follow", "/follow Juan", "Prepara plan de seguimiento", "Preview"]
  ];

  function isDesktop() {
    return window.matchMedia("(min-width: 901px)").matches;
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function renderResults(root, query) {
    var shell = root.querySelector(".dw-command-shell-056y");
    var results = root.querySelector(".dw-command-results-056y");
    if (!shell || !results) return;
    var normalized = text(query).replace(/^\//, "");
    var active = suggestions.filter(function (item) {
      return !normalized || item.join(" ").toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 5);
    if (!query.trim()) {
      shell.classList.remove("has-results");
      results.innerHTML = "";
      return;
    }
    results.innerHTML = active.map(function (item, index) {
      return '<div class="dw-command-result-056y' + (index === 0 ? ' is-active' : '') + '" role="option">' +
        '<span class="dw-result-type-056y">' + item[0] + '</span>' +
        '<strong>' + item[1] + '</strong>' +
        '<span class="dw-result-lock-056y">' + item[3] + '</span>' +
        '<small>' + item[2] + '</small>' +
        '</div>';
    }).join("");
    shell.classList.add("has-results");
  }

  function bootCommand(root) {
    var input = root.querySelector(".dw-command-input-056y");
    var submit = root.querySelector(".dw-command-submit-056y");
    if (!input || input.dataset.ready056y === "true") return;
    input.dataset.ready056y = "true";
    input.addEventListener("input", function () {
      renderResults(root, input.value);
    });
    input.addEventListener("focus", function () {
      renderResults(root, input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        input.value = "";
        renderResults(root, "");
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.focus();
      }
    });
    if (submit) {
      submit.addEventListener("click", function () {
        input.focus();
        if (!input.value.trim()) input.value = "/follow Juan";
        renderResults(root, input.value);
      });
    }
    document.addEventListener("keydown", function (event) {
      if (!isDesktop()) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.focus();
      }
    });
  }

  function bootNav(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".dw-nav-056y button"), function (button) {
      if (button.dataset.ready056y === "true") return;
      button.dataset.ready056y = "true";
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(root.querySelectorAll(".dw-nav-056y button"), function (item) {
          item.classList.toggle("is-active", item === button);
        });
      });
    });
  }

  function bootQuickActions(root) {
    var input = root.querySelector(".dw-command-input-056y");
    Array.prototype.forEach.call(root.querySelectorAll("[data-command-value]"), function (button) {
      if (button.dataset.ready056y === "true") return;
      button.dataset.ready056y = "true";
      button.addEventListener("click", function () {
        if (!input) return;
        input.value = button.getAttribute("data-command-value") || "";
        input.focus();
        renderResults(root, input.value);
      });
    });
  }

  function boot() {
    if (!isDesktop()) return;
    Array.prototype.forEach.call(document.querySelectorAll(".forge-desktop-workspace-056y"), function (root) {
      bootCommand(root);
      bootNav(root);
      bootQuickActions(root);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", boot);
  window.addEventListener("resize", boot, { passive: true });
})();
