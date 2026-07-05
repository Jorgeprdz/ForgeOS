/* FORGEOS:PUBLIC_PREVIEW_INTERACTION_VISUAL_REPAIR_060M:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";
  var PREVIEW_CARD_ID = "forge-local-read-model-preview-060l";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.value || node.textContent || node.getAttribute("aria-label") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function visibleRect(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") {
      return null;
    }
    var rect = node.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return rect;
  }

  function restoreCommandInputs() {
    var candidates = Array.prototype.slice.call(
      document.querySelectorAll(".dw-command-input-056y, .command-pill-input")
    );

    candidates.forEach(function (node) {
      node.removeAttribute("data-forge-command-static-060m");
      node.removeAttribute("aria-readonly");
      node.removeAttribute("tabindex");
      node.setAttribute("inputmode", "text");
      node.setAttribute("autocomplete", "off");
      if ("readOnly" in node) {
        node.readOnly = false;
      }
      if (node.parentElement) {
        node.parentElement.removeAttribute("data-forge-command-static-wrap-060m");
      }
    });
  }

  function commandRows(root) {
    var buttons = Array.prototype.slice.call(
      root.querySelectorAll(".dw-command-suggestions-058e [data-command-value], .dw-decision-strip-058e [data-command-value]")
    );

    return buttons.map(function (button) {
      var value = button.getAttribute("data-command-value") || "";
      var title = button.getAttribute("data-preview-title") || value || textOf(button);
      var copy = button.getAttribute("data-preview-copy") || "Preview seguro. Requiere aprobacion humana antes de cualquier accion.";
      return {
        value: value,
        title: title,
        copy: copy,
        searchText: (value + " " + title + " " + copy + " " + textOf(button)).toLowerCase()
      };
    }).filter(function (row) {
      return row.value;
    });
  }

  function setPreview(root, row) {
    var title = root.querySelector("[data-command-preview-title-058e]");
    var copy = root.querySelector("[data-command-preview-copy-058e]");
    if (title && row && row.title) {
      title.textContent = row.title;
    }
    if (copy && row && row.copy) {
      copy.textContent = row.copy;
    }
  }

  function renderCommandResults(root, rows, query, activeIndex) {
    var results = root.querySelector(".dw-command-results-056y");
    var zone = results && results.closest ? results.closest(".dw-command-zone-056y") : null;
    if (!results) {
      return;
    }

    if (!rows.length) {
      results.hidden = true;
      results.innerHTML = "";
      root.classList.remove("is-command-active-060m");
      if (zone) {
        zone.classList.remove("is-command-active-060m");
      }
      return;
    }

    results.innerHTML = rows.map(function (row, index) {
      var isActive = index === activeIndex;
      var title = row.title || row.value;
      var copy = row.copy || "Preview seguro. Requiere aprobacion humana antes de cualquier accion.";
      var value = row.value || query || "";
      return (
        '<button id="forge-command-result-060m-' + index + '" type="button" role="option" aria-selected="' + (isActive ? "true" : "false") + '" data-command-result-value="' + escapeHtml(value) + '">' +
          '<span>' + escapeHtml(title) + '</span>' +
          '<strong>' + escapeHtml(value) + '</strong>' +
          '<small>' + escapeHtml(copy) + '</small>' +
        '</button>'
      );
    }).join("");
    results.hidden = false;
    results.setAttribute("aria-expanded", "true");
    root.classList.add("is-command-active-060m");
    if (zone) {
      zone.classList.add("is-command-active-060m");
    }
  }

  function filterRows(rows, value) {
    var query = String(value || "").trim().toLowerCase();
    if (!query) {
      return rows.slice(0, 4);
    }
    var cleanedQuery = query.replace(/^\//, "");
    var matches = rows.filter(function (row) {
      return row.searchText.indexOf(cleanedQuery) !== -1 ||
        row.value.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 5);

    return matches;
  }

  function hideResults(root) {
    var results = root.querySelector(".dw-command-results-056y");
    var input = root.querySelector(".dw-command-input-056y");
    var zone = results && results.closest ? results.closest(".dw-command-zone-056y") : null;
    if (results) {
      results.hidden = true;
      results.innerHTML = "";
      results.setAttribute("aria-expanded", "false");
    }
    if (input) {
      input.removeAttribute("aria-activedescendant");
    }
    root.classList.remove("is-command-active-060m");
    if (zone) {
      zone.classList.remove("is-command-active-060m");
    }
  }

  function setupDesktopCommandBar(root) {
    if (!root || root.dataset.ready060m === "true") {
      return;
    }
    root.dataset.ready060m = "true";

    var input = root.querySelector(".dw-command-input-056y");
    var results = root.querySelector(".dw-command-results-056y");
    var rows = commandRows(root);
    var submit = root.querySelector(".dw-command-submit-056y");
    var suggestionButtons = Array.prototype.slice.call(root.querySelectorAll(".dw-command-suggestions-058e [data-command-value], .dw-decision-strip-058e [data-command-value]"));
    var activeIndex = -1;
    var visibleRows = [];

    if (!input || !results) {
      return;
    }

    results.hidden = true;
    results.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", results.id || "forge-command-results-060m");
    if (!results.id) {
      results.id = "forge-command-results-060m";
    }

    function updateResults() {
      if (!input.value.trim()) {
        activeIndex = -1;
        visibleRows = [];
        hideResults(root);
        return;
      }
      visibleRows = filterRows(rows, input.value);
      if (activeIndex >= visibleRows.length) {
        activeIndex = visibleRows.length - 1;
      }
      renderCommandResults(root, visibleRows, input.value, activeIndex);
      if (activeIndex >= 0) {
        input.setAttribute("aria-activedescendant", "forge-command-result-060m-" + activeIndex);
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function applyValue(value, keepOpen) {
      var row = rows.filter(function (item) {
        return item.value === value;
      })[0] || { value: value, title: value, copy: "Preview seguro. Requiere aprobacion humana antes de cualquier accion." };
      input.value = row.value;
      setPreview(root, row);
      if (keepOpen) {
        activeIndex = 0;
        visibleRows = [row];
        renderCommandResults(root, visibleRows, input.value, activeIndex);
      } else {
        activeIndex = -1;
        visibleRows = [];
        hideResults(root);
      }
      input.focus();
    }

    input.addEventListener("focus", function () {
      activeIndex = -1;
      updateResults();
    });
    input.addEventListener("input", function () {
      activeIndex = 0;
      updateResults();
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        hideResults(root);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!visibleRows.length || results.hidden) {
          updateResults();
          return;
        }
        activeIndex = Math.min(visibleRows.length - 1, activeIndex + 1);
        updateResults();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!visibleRows.length || results.hidden) {
          updateResults();
          return;
        }
        activeIndex = Math.max(0, activeIndex - 1);
        updateResults();
        return;
      }

      if (event.key === "Enter" && visibleRows.length && activeIndex >= 0) {
        event.preventDefault();
        applyValue(visibleRows[activeIndex].value, false);
      }
    });
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        if (!root.matches(":focus-within")) {
          hideResults(root);
        }
      }, 140);
    });

    results.addEventListener("pointerdown", function (event) {
      event.preventDefault();
    });
    results.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("[data-command-result-value]") : null;
      if (!button) {
        return;
      }
      applyValue(button.getAttribute("data-command-result-value") || "", false);
    });

    suggestionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyValue(button.getAttribute("data-command-value") || "", false);
      });
    });

    if (submit) {
      submit.addEventListener("click", function () {
        var value = input.value.trim() || (rows[0] && rows[0].value) || "";
        if (value) {
          applyValue(value, false);
        }
      });
    }
  }

  function markQuoteCards() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".dw-command-suggestions-058e button, .dw-table-056y td, .dw-table-056y th"));
    nodes.forEach(function (node) {
      var rect = visibleRect(node);
      if (!rect || rect.width < 120 || rect.height < 36 || rect.height > 180) {
        return;
      }

      var content = textOf(node).toLowerCase();
      if (content.indexOf("cotizar") !== -1 && content.indexOf("/cotizar") !== -1) {
        node.classList.add("forge-visual-repair-060m-quote-card");
      }
    });
  }

  function findCommandSurface() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("button, [role='button']"));
    var prepare = buttons.filter(function (node) {
      return textOf(node).toLowerCase().indexOf("preparar preview") !== -1;
    })[0];

    var node = prepare;
    while (node && node !== document.body) {
      var rect = visibleRect(node);
      if (rect && rect.width >= 620 && rect.height >= 120 && rect.height <= 360) {
        return node;
      }
      node = node.parentElement;
    }

    return null;
  }

  function findWideContentMount() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("main, section, div"));
    var options = nodes.map(function (node) {
      return { node: node, rect: visibleRect(node) };
    }).filter(function (entry) {
      return entry.rect &&
        entry.rect.width >= 640 &&
        entry.rect.height >= 240 &&
        entry.rect.left >= 220 &&
        entry.node !== document.body &&
        entry.node !== document.documentElement;
    }).sort(function (a, b) {
      return (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height);
    });

    return options.length ? options[0].node : null;
  }

  function repairPreviewCardMount() {
    var card = document.getElementById(PREVIEW_CARD_ID);
    if (!card) {
      return;
    }

    var commandSurface = findCommandSurface();
    if (commandSurface && commandSurface.parentElement) {
      commandSurface.insertAdjacentElement("afterend", card);
      return;
    }

    var mount = findWideContentMount();
    if (mount) {
      mount.appendChild(card);
    }
  }

  function runRepair() {
    if (!isDesktop()) {
      return;
    }
    restoreCommandInputs();
    Array.prototype.forEach.call(document.querySelectorAll(".forge-desktop-workspace-056y"), setupDesktopCommandBar);
    markQuoteCards();
    repairPreviewCardMount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runRepair, { once: true });
  } else {
    runRepair();
  }

  window.addEventListener("load", runRepair);
  window.addEventListener("forge:local-read-model-source:060i", function () {
    window.setTimeout(runRepair, 0);
  });
  window.__forgeRunPublicPreviewInteractionVisualRepair060M = runRepair;
})();
/* FORGEOS:PUBLIC_PREVIEW_INTERACTION_VISUAL_REPAIR_060M:END */

/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.value || node.textContent || node.getAttribute("aria-label") || "").trim();
  }

  function visibleRect(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") {
      return null;
    }
    var rect = node.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return rect;
  }

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, [aria-controls='forge-command-results-060m']");
  }

  function commandRoot(input) {
    if (!input) {
      return null;
    }
    return input.closest(".dw-command-zone-056y, .dw-command-shell-056y, .command-shell, .dw-command-card-056y") || input.parentElement;
  }

  function markResultPanel(root, input) {
    var panel = document.getElementById(input.getAttribute("aria-controls") || "forge-command-results-060m");
    if (!panel && root) {
      panel = root.querySelector("[role='listbox'], .forge-command-results-060m, .command-results");
    }
    if (!panel) {
      return null;
    }
    panel.setAttribute("data-forge-command-results-panel-060s", "true");
    return panel;
  }

  function markStaticSuggestions(root, panel) {
    if (!root) {
      return [];
    }
    var candidates = Array.prototype.slice.call(root.querySelectorAll("div, section, article, li, button"));
    return candidates.filter(function (node) {
      if (node === panel || (panel && panel.contains(node))) {
        return false;
      }
      var content = textOf(node).toLowerCase();
      return content.indexOf("cotizar") !== -1 && content.indexOf("/cotizar") !== -1;
    }).map(function (node) {
      node.setAttribute("data-forge-static-command-suggestions-060s", "true");
      return node;
    });
  }

  function setOverlayGeometry(root, input) {
    var rootRect = visibleRect(root);
    var inputRect = visibleRect(input);
    if (!rootRect || !inputRect) {
      return;
    }
    var top = Math.max(56, Math.round(inputRect.bottom - rootRect.top + 10));
    var left = Math.max(12, Math.round(inputRect.left - rootRect.left));
    var right = Math.max(12, Math.round(rootRect.right - inputRect.right));
    root.style.setProperty("--forge-command-overlay-top-060s", top + "px");
    root.style.setProperty("--forge-command-overlay-left-060s", left + "px");
    root.style.setProperty("--forge-command-overlay-right-060s", right + "px");
  }

  function setActive(root, suggestions, active) {
    if (!root) {
      return;
    }
    if (active) {
      root.setAttribute("data-forge-command-overlay-active-060s", "true");
    } else {
      root.removeAttribute("data-forge-command-overlay-active-060s");
    }
    suggestions.forEach(function (node) {
      if (active) {
        node.setAttribute("data-forge-static-command-suggestions-collapsed-060s", "true");
      } else {
        node.removeAttribute("data-forge-static-command-suggestions-collapsed-060s");
      }
    });
  }

  function runOverlayPolish() {
    if (!isDesktop()) {
      return;
    }
    var input = commandInput();
    var root = commandRoot(input);
    if (!input || !root) {
      return;
    }
    root.setAttribute("data-forge-command-overlay-root-060s", "true");
    var panel = markResultPanel(root, input);
    var suggestions = markStaticSuggestions(root, panel);

    function update() {
      setOverlayGeometry(root, input);
      setActive(root, suggestions, Boolean(input.value && input.value.trim()));
    }

    input.addEventListener("focus", update);
    input.addEventListener("input", update);
    input.addEventListener("keydown", function () {
      window.setTimeout(update, 0);
    });
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        setActive(root, suggestions, false);
      }, 160);
    });
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runOverlayPolish, { once: true });
  } else {
    runOverlayPolish();
  }
  window.addEventListener("load", runOverlayPolish);
  window.__forgeRunCommandBarSearchOverlayPolish060S = runOverlayPolish;
})();
/* FORGEOS:COMMAND_BAR_SEARCH_OVERLAY_POLISH_060S:END */

/* FORGEOS:COMMAND_BAR_INPUT_ONLY_CLEANUP_060U:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.value || node.textContent || node.getAttribute("aria-label") || "").trim();
  }

  function hideStaticSuggestions() {
    if (!isDesktop()) {
      return;
    }
    var selectors = [
      ".dw-command-suggestions-058e",
      ".dw-command-suggestions-056y",
      ".command-suggestions"
    ];
    var nodes = Array.prototype.slice.call(document.querySelectorAll(selectors.join(",")));
    var commandRoot = document.querySelector(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y");
    if (commandRoot) {
      Array.prototype.slice.call(commandRoot.querySelectorAll("div, section, article, li, button")).forEach(function (node) {
        var content = textOf(node).toLowerCase();
        if (content.indexOf("/cotizar") !== -1 || content.indexOf("/follow") !== -1 || content.indexOf("/llamar") !== -1 || content.indexOf("/buscar") !== -1 || content.indexOf("/mandar") !== -1 || content.indexOf("/subir") !== -1) {
          if (!node.hasAttribute("data-forge-command-results-panel-060s") && !node.closest("[data-forge-command-results-panel-060s='true']")) {
            nodes.push(node);
          }
        }
      });
    }
    nodes.forEach(function (node) {
      node.setAttribute("data-forge-command-static-suggestion-060u", "true");
      node.setAttribute("aria-hidden", "true");
    });
    document.documentElement.setAttribute("data-forge-command-input-only-cleanup-060u", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideStaticSuggestions, { once: true });
  } else {
    hideStaticSuggestions();
  }
  window.addEventListener("load", hideStaticSuggestions);
  window.__forgeRunCommandBarInputOnlyCleanup060U = hideStaticSuggestions;
})();
/* FORGEOS:COMMAND_BAR_INPUT_ONLY_CLEANUP_060U:END */

/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.value || node.textContent || node.getAttribute("aria-label") || "").trim();
  }

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, input[aria-controls='forge-command-results-060m']");
  }

  function commandRoot(input) {
    if (!input) {
      return null;
    }
    return input.closest(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y, .command-shell") || input.parentElement;
  }

  function restoreNode(node) {
    if (!node) {
      return;
    }
    node.removeAttribute("data-forge-command-static-suggestion-060u");
    node.removeAttribute("data-forge-command-hidden-secondary-060v");
    node.removeAttribute("aria-hidden");
  }

  function hideNode(node) {
    if (!node) {
      return;
    }
    node.setAttribute("data-forge-command-hidden-secondary-060v", "true");
    node.setAttribute("aria-hidden", "true");
  }

  function looksLikeSecondaryCommandBlock(node, input, root) {
    if (!node || node === input || node.contains(input)) {
      return false;
    }
    if (node.closest("[data-forge-command-results-panel-060s='true']")) {
      return false;
    }
    var content = textOf(node).toLowerCase();
    if (!content) {
      return false;
    }
    if (content.indexOf("preview seguro") !== -1 || content.indexOf("abre workspace") !== -1) {
      return true;
    }
    if (content.indexOf("/cotizar") !== -1 || content.indexOf("/follow") !== -1 || content.indexOf("/llamar") !== -1 || content.indexOf("/buscar") !== -1 || content.indexOf("/mandar") !== -1 || content.indexOf("/subir") !== -1) {
      return true;
    }
    return false;
  }

  function repairCommandBar() {
    if (!isDesktop()) {
      return;
    }

    var input = commandInput();
    var root = commandRoot(input);
    if (!input || !root) {
      return;
    }

    restoreNode(input);
    restoreNode(root);
    restoreNode(root.closest(".dw-command-zone-056y"));
    restoreNode(root.closest(".dw-command-shell-056y"));
    restoreNode(root.closest(".dw-command-card-056y"));

    input.removeAttribute("aria-readonly");
    input.removeAttribute("tabindex");
    input.setAttribute("inputmode", "text");
    input.setAttribute("autocomplete", "off");
    if ("readOnly" in input) {
      input.readOnly = false;
    }

    var inputRow = input.closest(".dw-command-row-056y, .dw-command-input-row-056y, .command-input-row") || input.parentElement;
    if (inputRow) {
      restoreNode(inputRow);
      inputRow.setAttribute("data-forge-command-input-row-060v", "true");
    }

    Array.prototype.slice.call(root.querySelectorAll("[data-forge-command-static-suggestion-060u='true']")).forEach(function (node) {
      restoreNode(node);
    });

    var secondarySelectors = [
      ".dw-command-suggestions-058e",
      ".dw-command-suggestions-056y",
      ".command-suggestions",
      ".dw-decision-strip-058e"
    ];
    Array.prototype.slice.call(root.querySelectorAll(secondarySelectors.join(","))).forEach(function (node) {
      if (!node.contains(input)) {
        hideNode(node);
      }
    });

    Array.prototype.slice.call(root.querySelectorAll("div, section, article, ul, li, button")).forEach(function (node) {
      if (!looksLikeSecondaryCommandBlock(node, input, root)) {
        return;
      }
      var shell = node.closest(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y");
      if (shell && shell.contains(input) && shell === node) {
        return;
      }
      hideNode(node);
    });

    document.documentElement.setAttribute("data-forge-command-input-restored-060v", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairCommandBar, { once: true });
  } else {
    repairCommandBar();
  }
  window.addEventListener("load", repairCommandBar);
  window.addEventListener("forge:local-read-model-source:060i", repairCommandBar);
  window.__forgeRunCommandBarRestoreInputRepair060V = repairCommandBar;
})();
/* FORGEOS:COMMAND_BAR_RESTORE_INPUT_REPAIR_060V:END */
