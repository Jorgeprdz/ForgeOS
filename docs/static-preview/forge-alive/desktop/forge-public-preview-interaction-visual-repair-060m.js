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

/* FORGEOS:COMMAND_BAR_EMPTY_IDLE_INPUT_REPAIR_060W:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";
  var PLACEHOLDER = "/quick actions";
  var userTouched = false;

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, input[aria-controls='forge-command-results-060m'], [role='textbox'][aria-controls='forge-command-results-060m']");
  }

  function valueOf(input) {
    if (!input) {
      return "";
    }
    if ("value" in input) {
      return String(input.value || "");
    }
    return String(input.textContent || "");
  }

  function setValue(input, value) {
    if (!input) {
      return;
    }
    if ("value" in input) {
      input.value = value;
    } else {
      input.textContent = value;
    }
  }

  function looksLikeStaticPrefill(value) {
    var text = String(value || "").trim().toLowerCase();
    if (!text || text.charAt(0) !== "/") {
      return false;
    }
    return text.indexOf("lariza") !== -1 ||
      text.indexOf("gmm") !== -1 ||
      text.indexOf("/cotizar") !== -1 ||
      text.indexOf("/follow") !== -1 ||
      text.indexOf("/llamar") !== -1 ||
      text.indexOf("/buscar") !== -1 ||
      text.indexOf("/mandar") !== -1 ||
      text.indexOf("/subir") !== -1;
  }

  function hideResultPanel(input) {
    if (!input) {
      return;
    }
    var panel = document.getElementById(input.getAttribute("aria-controls") || "forge-command-results-060m");
    if (panel) {
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }
    input.removeAttribute("aria-activedescendant");
    var root = input.closest(".dw-command-zone-056y, .dw-command-shell-056y, .dw-command-card-056y, .command-shell");
    if (root) {
      root.removeAttribute("data-forge-command-overlay-active-060s");
    }
  }

  function clearStaticPrefill() {
    if (!isDesktop() || userTouched) {
      return;
    }
    var input = commandInput();
    if (!input) {
      return;
    }
    input.setAttribute("placeholder", PLACEHOLDER);
    input.setAttribute("inputmode", "text");
    input.removeAttribute("aria-readonly");
    if ("readOnly" in input) {
      input.readOnly = false;
    }
    if (!looksLikeStaticPrefill(valueOf(input))) {
      return;
    }
    setValue(input, "");
    hideResultPanel(input);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    document.documentElement.setAttribute("data-forge-command-idle-input-empty-060w", "true");
  }

  function markTouched() {
    userTouched = true;
  }

  function bindInteractionGuard() {
    var input = commandInput();
    if (!input || input.getAttribute("data-forge-command-empty-idle-bound-060w") === "true") {
      return;
    }
    input.setAttribute("data-forge-command-empty-idle-bound-060w", "true");
    input.addEventListener("keydown", markTouched, { once: true });
    input.addEventListener("input", markTouched, { once: true });
    input.addEventListener("paste", markTouched, { once: true });
  }

  function scheduleClear() {
    bindInteractionGuard();
    clearStaticPrefill();
    window.setTimeout(clearStaticPrefill, 0);
    window.setTimeout(clearStaticPrefill, 80);
    window.setTimeout(clearStaticPrefill, 220);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleClear, { once: true });
  } else {
    scheduleClear();
  }
  window.addEventListener("load", scheduleClear);
  window.__forgeRunCommandBarEmptyIdleInputRepair060W = clearStaticPrefill;
})();
/* FORGEOS:COMMAND_BAR_EMPTY_IDLE_INPUT_REPAIR_060W:END */

/* FORGEOS:COMMAND_BAR_QUICK_ACTIONS_PLACEHOLDER_060X:START */
(function () {
  "use strict";

  var PLACEHOLDER = "/quick actions";

  function commandInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input, input[aria-controls='forge-command-results-060m'], [role='textbox'][aria-controls='forge-command-results-060m']");
  }

  function applyPlaceholder() {
    var input = commandInput();
    if (!input) {
      return;
    }
    input.setAttribute("placeholder", PLACEHOLDER);
    document.documentElement.setAttribute("data-forge-command-quick-actions-placeholder-060x", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyPlaceholder, { once: true });
  } else {
    applyPlaceholder();
  }
  window.addEventListener("load", applyPlaceholder);
  window.__forgeApplyCommandBarQuickActionsPlaceholder060X = applyPlaceholder;
})();
/* FORGEOS:COMMAND_BAR_QUICK_ACTIONS_PLACEHOLDER_060X:END */

/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:START */
(function () {
  "use strict";

  var MENU_ID = "forge-profile-menu-060y";

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.textContent || node.value || node.getAttribute("aria-label") || "").trim();
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

  function findProfileAnchor() {
    var existing = document.querySelector("[data-forge-profile-anchor-060y='true']");
    if (existing) {
      return existing;
    }
    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    var matches = nodes.filter(function (node) {
      var rect = visibleRect(node);
      var text = textOf(node);
      if (!rect || text !== "J") {
        return false;
      }
      return rect.top < 170 && rect.left > Math.max(640, window.innerWidth * 0.68) && rect.width >= 34 && rect.width <= 78 && rect.height >= 34 && rect.height <= 78;
    });
    matches.sort(function (a, b) {
      var ar = visibleRect(a);
      var br = visibleRect(b);
      return (br.left + br.top) - (ar.left + ar.top);
    });
    return matches[0] || null;
  }

  function hideSidebarIdentity() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("aside *, nav *, [class*='side'] *, [class*='rail'] *"));
    var candidates = nodes.filter(function (node) {
      var text = textOf(node);
      if (text.indexOf("Jorge") === -1 || text.indexOf("Asesor financiero") === -1) {
        return false;
      }
      var rect = visibleRect(node);
      return rect && rect.left < 360 && rect.top > 260 && rect.width < 340 && rect.height < 180;
    });
    candidates.sort(function (a, b) {
      var ar = visibleRect(a);
      var br = visibleRect(b);
      return (ar.width * ar.height) - (br.width * br.height);
    });
    var target = candidates[0];
    if (target && !target.closest("#" + MENU_ID)) {
      target.setAttribute("data-forge-sidebar-profile-footer-060y", "true");
      target.setAttribute("aria-hidden", "true");
    }
  }

  function profileMenu() {
    var menu = document.getElementById(MENU_ID);
    if (menu) {
      return menu;
    }
    menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "forge-profile-menu-060y";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Menu de perfil");
    menu.innerHTML =
      '<div class="forge-profile-menu-060y__head">' +
        '<div class="forge-profile-menu-060y__avatar" data-forge-google-profile-ready-060y="true">J</div>' +
        '<div>' +
          '<div class="forge-profile-menu-060y__name">Jorge Fernandez</div>' +
          '<div class="forge-profile-menu-060y__role">Asesor financiero</div>' +
        '</div>' +
      '</div>' +
      '<div class="forge-profile-menu-060y__actions">' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="theme">Cambiar tema</button>' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="options">Opciones</button>' +
        '<button class="forge-profile-menu-060y__action" type="button" role="menuitem" data-forge-profile-action-060y="logout">Cerrar sesión</button>' +
      '</div>' +
      '<div class="forge-profile-menu-060y__status" aria-live="polite">Vista estática segura</div>';
    document.body.appendChild(menu);
    return menu;
  }

  function placeMenu(anchor, menu) {
    var rect = visibleRect(anchor);
    if (!rect) {
      return;
    }
    var right = Math.max(18, Math.round(window.innerWidth - rect.right));
    var top = Math.round(rect.bottom + 18);
    menu.style.setProperty("--forge-profile-menu-right-060y", right + "px");
    menu.style.setProperty("--forge-profile-menu-top-060y", top + "px");
  }

  function setStatus(menu, text) {
    var status = menu.querySelector(".forge-profile-menu-060y__status");
    if (status) {
      status.textContent = text;
    }
  }

  function bindMenu(anchor, menu) {
    if (anchor.getAttribute("data-forge-profile-bound-060y") === "true") {
      return;
    }
    anchor.setAttribute("data-forge-profile-bound-060y", "true");
    anchor.setAttribute("data-forge-profile-anchor-060y", "true");
    anchor.setAttribute("role", "button");
    anchor.setAttribute("tabindex", "0");
    anchor.setAttribute("aria-haspopup", "menu");
    anchor.setAttribute("aria-expanded", "false");
    anchor.setAttribute("aria-controls", MENU_ID);
    anchor.setAttribute("title", "Perfil y opciones");

    function openMenu() {
      placeMenu(anchor, menu);
      menu.hidden = false;
      anchor.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      menu.hidden = true;
      anchor.setAttribute("aria-expanded", "false");
    }

    function toggleMenu(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    anchor.addEventListener("click", toggleMenu);
    anchor.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        toggleMenu(event);
      }
      if (event.key === "Escape") {
        closeMenu();
      }
    });
    document.addEventListener("click", function (event) {
      if (menu.hidden) {
        return;
      }
      if (event.target === anchor || anchor.contains(event.target) || menu.contains(event.target)) {
        return;
      }
      closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
    window.addEventListener("resize", function () {
      if (!menu.hidden) {
        placeMenu(anchor, menu);
      }
    });

    Array.prototype.slice.call(menu.querySelectorAll("[data-forge-profile-action-060y]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.getAttribute("data-forge-profile-action-060y");
        if (action === "theme") {
          setStatus(menu, "Cambio de tema preparado en preview.");
        } else if (action === "options") {
          setStatus(menu, "Opciones preparadas para cuenta.");
        } else if (action === "logout") {
          setStatus(menu, "Cerrar sesión requiere autenticación real.");
        }
      });
    });
  }

  function runProfileRepair() {
    hideSidebarIdentity();
    var anchor = findProfileAnchor();
    if (!anchor) {
      return;
    }
    var menu = profileMenu();
    bindMenu(anchor, menu);
    document.documentElement.setAttribute("data-forge-profile-menu-ready-060y", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runProfileRepair, { once: true });
  } else {
    runProfileRepair();
  }
  window.addEventListener("load", runProfileRepair);
  window.__forgeRunProfileMenuPrepSidebarIdentityRepair060Y = runProfileRepair;
})();
/* FORGEOS:PROFILE_MENU_PREP_SIDEBAR_IDENTITY_REPAIR_060Y:END */

/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:START */
(function () {
  "use strict";

  function textOf(node) {
    if (!node) {
      return "";
    }
    return String(node.textContent || node.value || node.getAttribute("aria-label") || node.title || "").trim();
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

  function findProfileAnchor() {
    var anchor = document.querySelector("[data-forge-profile-anchor-060y='true']");
    if (anchor) {
      return anchor;
    }
    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    var candidates = nodes.filter(function (node) {
      var rect = visibleRect(node);
      if (!rect || textOf(node) !== "J") {
        return false;
      }
      return rect.top < 170 && rect.left > Math.max(640, window.innerWidth * 0.68) && rect.width >= 34 && rect.width <= 78 && rect.height >= 34 && rect.height <= 78;
    });
    candidates.sort(function (a, b) {
      return visibleRect(b).left - visibleRect(a).left;
    });
    return candidates[0] || null;
  }

  function isRedundantTopbarIcon(node, anchorRect) {
    var rect = visibleRect(node);
    if (!rect || !anchorRect) {
      return false;
    }
    if (node.getAttribute("data-forge-profile-anchor-060y") === "true" || textOf(node) === "J") {
      return false;
    }
    var nearProfile = rect.top < 170 &&
      rect.right <= anchorRect.left + 4 &&
      rect.left >= anchorRect.left - 150 &&
      rect.width >= 28 &&
      rect.width <= 70 &&
      rect.height >= 28 &&
      rect.height <= 70;
    if (!nearProfile) {
      return false;
    }
    var label = textOf(node).toLowerCase();
    return label === "!" ||
      label.indexOf("!") !== -1 ||
      label.indexOf("gear") !== -1 ||
      label.indexOf("settings") !== -1 ||
      label.indexOf("config") !== -1 ||
      label.indexOf("ajuste") !== -1 ||
      label.indexOf("opcion") !== -1 ||
      label.length <= 2;
  }

  function cleanupTopbarIcons() {
    var anchor = findProfileAnchor();
    var anchorRect = visibleRect(anchor);
    if (!anchor || !anchorRect) {
      return;
    }

    var nodes = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], a, div, span"));
    nodes.forEach(function (node) {
      if (node === anchor || anchor.contains(node) || node.closest(".forge-profile-menu-060y")) {
        return;
      }
      if (isRedundantTopbarIcon(node, anchorRect)) {
        node.setAttribute("data-forge-topbar-redundant-profile-icon-060z", "true");
        node.setAttribute("aria-hidden", "true");
        node.setAttribute("tabindex", "-1");
      }
    });
    document.documentElement.setAttribute("data-forge-topbar-profile-icons-clean-060z", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanupTopbarIcons, { once: true });
  } else {
    cleanupTopbarIcons();
  }
  window.addEventListener("load", cleanupTopbarIcons);
  window.__forgeRunTopbarProfileIconCleanup060Z = cleanupTopbarIcons;
})();
/* FORGEOS:TOPBAR_PROFILE_ICON_CLEANUP_060Z:END */

/* FORGEOS:PROFILE_MENU_COPY_AND_SPACING_POLISH_061B:START */
(function () {
  "use strict";

  function polishProfileMenuCopy() {
    var menu = document.getElementById("forge-profile-menu-060y");
    if (!menu) {
      return;
    }
    menu.querySelectorAll("button, div, span").forEach(function (node) {
      if (node.textContent === "Cerrar sesion") {
        node.textContent = "Cerrar sesión";
      }
      if (node.textContent === "Vista estatica segura") {
        node.textContent = "Vista estática segura";
      }
    });
    document.documentElement.setAttribute("data-forge-profile-menu-polished-061b", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", polishProfileMenuCopy, { once: true });
  } else {
    polishProfileMenuCopy();
  }
  window.addEventListener("load", polishProfileMenuCopy);
  window.__forgePolishProfileMenuCopyAndSpacing061B = polishProfileMenuCopy;
})();
/* FORGEOS:PROFILE_MENU_COPY_AND_SPACING_POLISH_061B:END */

/* FORGEOS:PREMIUM_FINAL_POLISH_IMPLEMENTATION_061E:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function markPremiumPolishReady() {
    if (!isDesktop()) {
      return;
    }
    document.documentElement.setAttribute("data-forge-premium-final-polish-061e", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markPremiumPolishReady, { once: true });
  } else {
    markPremiumPolishReady();
  }
  window.addEventListener("load", markPremiumPolishReady);
  window.__forgeMarkPremiumFinalPolish061E = markPremiumPolishReady;
})();
/* FORGEOS:PREMIUM_FINAL_POLISH_IMPLEMENTATION_061E:END */

/* FORGEOS:PREMIUM_FINAL_VISUAL_REPAIR_IMPLEMENTATION_061G:START */
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 901px)";

  function isDesktop() {
    return !window.matchMedia || window.matchMedia(DESKTOP_QUERY).matches;
  }

  function markVisualRepairReady() {
    if (!isDesktop()) {
      return;
    }
    document.documentElement.setAttribute("data-forge-premium-final-visual-repair-061g", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markVisualRepairReady, { once: true });
  } else {
    markVisualRepairReady();
  }
  window.addEventListener("load", markVisualRepairReady);
  window.__forgeMarkPremiumFinalVisualRepair061G = markVisualRepairReady;
})();
/* FORGEOS:PREMIUM_FINAL_VISUAL_REPAIR_IMPLEMENTATION_061G:END */

/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:START */
(function () {
  "use strict";

  var READ_MODEL = {
    modelName: "forge.alive.workspace.read_model.v1",
    workspace: {
      workspaceId: "forge-alive-static-command-preview",
      workspaceName: "Mi dia",
      surface: "desktop.command_workspace",
      mode: "static_preview",
      ownerDisplayName: "Jorge Fernandez"
    },
    previewPolicy: {
      requiresHumanApproval: true,
      externalEffectsAllowed: false,
      recordMutationAllowed: false,
      scheduleMutationAllowed: false,
      messageDeliveryAllowed: false,
      providerExecutionAllowed: false
    },
    actionRegistry: [
      {
        actionId: "command.quick_actions",
        label: "/quick actions",
        aliases: ["/", "/quick", "/quick actions", "acciones"],
        contractStatus: "preview_only",
        sourceModule: "command_bar",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      },
      {
        actionId: "report.prepare_preview",
        label: "Preparar preview",
        aliases: ["preparar", "preview", "reporte"],
        contractStatus: "needs_approval",
        sourceModule: "reportes",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "opportunity.review",
        label: "Revisar oportunidad",
        aliases: ["revisar", "review", "lariza"],
        contractStatus: "preview_only",
        sourceModule: "pipeline",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      },
      {
        actionId: "client.follow_preview",
        label: "Preparar follow",
        aliases: ["follow", "/follow", "seguimiento"],
        contractStatus: "needs_approval",
        sourceModule: "clientes",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "quote.prepare_preview",
        label: "Preparar cotizacion",
        aliases: ["cotizar", "/cotizar", "cotizacion"],
        contractStatus: "needs_approval",
        sourceModule: "cotizaciones",
        requiresHumanApproval: true,
        previewOnly: true,
        blockedReasonIds: ["approval_required"]
      },
      {
        actionId: "record.open_preview",
        label: "Abrir detalle",
        aliases: ["abrir", "detalle", "open"],
        contractStatus: "preview_only",
        sourceModule: "workspace",
        requiresHumanApproval: false,
        previewOnly: true,
        blockedReasonIds: ["preview_only_boundary"]
      }
    ],
    commandCatalog: [
      {
        commandId: "quick-actions",
        actionId: "command.quick_actions",
        title: "/quick actions",
        subtitle: "Lista acciones preview-safe disponibles para este workspace.",
        tokens: ["/", "/quick", "quick", "actions", "acciones"],
        targetType: "workspace",
        targetId: "forge-alive-static-command-preview"
      },
      {
        commandId: "prepare-report-preview",
        actionId: "report.prepare_preview",
        title: "Preparar preview",
        subtitle: "Construye un resumen revisable sin ejecutar efectos reales.",
        tokens: ["preparar", "preview", "reporte", "alfred"],
        targetType: "workspace",
        targetId: "forge-alive-static-command-preview"
      },
      {
        commandId: "review-lariza",
        actionId: "opportunity.review",
        title: "Revisar Lariza",
        subtitle: "Abre detalle local de oportunidad y riesgo.",
        tokens: ["revisar", "review", "lariza", "oportunidad"],
        targetType: "opportunity",
        targetId: "opp-lariza-gmm"
      },
      {
        commandId: "follow-juan",
        actionId: "client.follow_preview",
        title: "/follow Juan",
        subtitle: "Prepara seguimiento con aprobacion humana requerida.",
        tokens: ["follow", "/follow", "juan", "seguimiento"],
        targetType: "client",
        targetId: "client-juan"
      },
      {
        commandId: "quote-lariza",
        actionId: "quote.prepare_preview",
        title: "/cotizar GMM Lariza",
        subtitle: "Prepara workspace de cotizacion sin emitir documentos.",
        tokens: ["cotizar", "/cotizar", "cotizacion", "gmm", "lariza"],
        targetType: "opportunity",
        targetId: "opp-lariza-gmm"
      },
      {
        commandId: "open-octavio",
        actionId: "record.open_preview",
        title: "Abrir Octavio",
        subtitle: "Abre detalle local del registro en modo preview.",
        tokens: ["abrir", "open", "octavio", "detalle"],
        targetType: "client",
        targetId: "client-octavio"
      }
    ],
    blockedReasons: [
      {
        reasonId: "preview_only_boundary",
        message: "Disponible solo como preview seguro."
      },
      {
        reasonId: "approval_required",
        message: "Requiere aprobacion humana antes de cualquier efecto real."
      }
    ]
  };

  var activeIndex = 0;
  var currentRows = [];

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function findInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input");
  }

  function findRoot(input) {
    return input && (input.closest(".dw-command-zone-056y") || input.closest(".dw-command-shell-056y") || input.parentElement);
  }

  function actionById(actionId) {
    return READ_MODEL.actionRegistry.filter(function (action) {
      return action.actionId === actionId;
    })[0] || null;
  }

  function statusLabel(action) {
    if (!action) {
      return "blocked";
    }
    if (action.contractStatus === "needs_approval") {
      return "approval";
    }
    return action.contractStatus.replace("_", " ");
  }

  function ensurePanel(root, input) {
    var panel = document.getElementById("forge-contract-results-062c");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "forge-contract-results-062c";
      panel.className = "forge-contract-results-062c dw-command-results-056y";
      panel.setAttribute("role", "listbox");
      panel.setAttribute("data-forge-contract-results-panel-062c", "true");
      panel.hidden = true;
      root.appendChild(panel);
    }
    input.setAttribute("aria-controls", panel.id);
    input.setAttribute("aria-autocomplete", "list");
    return panel;
  }

  function ensureStatus(root) {
    var status = root.querySelector(".forge-contract-preview-status-062c");
    if (!status) {
      status = document.createElement("div");
      status.className = "forge-contract-preview-status-062c";
      status.setAttribute("aria-live", "polite");
      status.setAttribute("data-forge-contract-status-062c", "true");
      root.appendChild(status);
    }
    return status;
  }

  function queryRows(query) {
    var q = normalize(query);
    if (!q) {
      return [];
    }
    if (q === "/" || q === "/quick" || q === "/quick actions") {
      return READ_MODEL.commandCatalog.slice(0);
    }
    return READ_MODEL.commandCatalog.filter(function (command) {
      var haystack = [command.title, command.subtitle].concat(command.tokens || []).join(" ");
      return normalize(haystack).indexOf(q) !== -1;
    });
  }

  function hidePanel(root, panel) {
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    if (root) {
      root.removeAttribute("data-forge-contract-panel-active-062c");
    }
    currentRows = [];
    activeIndex = 0;
  }

  function selectCommand(root, input, command) {
    var action = actionById(command.actionId);
    var status = ensureStatus(root);
    input.value = command.title;
    input.setAttribute("data-forge-selected-action-contract-062c", command.actionId);
    status.textContent = command.title + " - " + (action ? action.label : "Accion bloqueada") + " - " + statusLabel(action) + ". Sin efectos reales.";
    window.dispatchEvent(new CustomEvent("forge:action-contract-preview:062c", {
      detail: {
        commandId: command.commandId,
        actionId: command.actionId,
        targetType: command.targetType,
        targetId: command.targetId,
        status: action ? action.contractStatus : "blocked",
        previewOnly: true
      }
    }));
  }

  function render(input) {
    var root = findRoot(input);
    if (!root) {
      return;
    }
    var panel = ensurePanel(root, input);
    currentRows = queryRows(input.value);
    if (!currentRows.length) {
      hidePanel(root, panel);
      return;
    }
    activeIndex = Math.min(activeIndex, currentRows.length - 1);
    root.setAttribute("data-forge-contract-panel-active-062c", "true");
    panel.hidden = false;
    panel.innerHTML = currentRows.map(function (command, index) {
      var action = actionById(command.actionId);
      return '<button type="button" class="forge-contract-result-062c" role="option" data-index="' + index + '" aria-selected="' + (index === activeIndex ? "true" : "false") + '">' +
        '<span><span class="forge-contract-result-062c__title">' + command.title + '</span>' +
        '<span class="forge-contract-result-062c__subtitle">' + command.subtitle + '</span></span>' +
        '<span class="forge-contract-result-062c__status">' + statusLabel(action) + '</span>' +
      '</button>';
    }).join("");
  }

  function bind() {
    var input = findInput();
    if (!input || input.getAttribute("data-forge-contract-bound-062c") === "true") {
      return;
    }
    var root = findRoot(input);
    if (!root) {
      return;
    }
    var panel = ensurePanel(root, input);
    input.setAttribute("data-forge-contract-bound-062c", "true");
    input.setAttribute("placeholder", "/quick actions");
    root.setAttribute("data-forge-read-model-bound-062c", READ_MODEL.modelName);

    input.addEventListener("input", function () {
      activeIndex = 0;
      render(input);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        hidePanel(root, panel);
        return;
      }
      if (!currentRows.length) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentRows.length;
        render(input);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = (activeIndex + currentRows.length - 1) % currentRows.length;
        render(input);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        selectCommand(root, input, currentRows[activeIndex]);
        hidePanel(root, panel);
      }
    });

    panel.addEventListener("click", function (event) {
      var button = event.target.closest(".forge-contract-result-062c");
      if (!button) {
        return;
      }
      var index = Number(button.getAttribute("data-index"));
      if (currentRows[index]) {
        selectCommand(root, input, currentRows[index]);
        hidePanel(root, panel);
        input.focus();
      }
    });

    document.documentElement.setAttribute("data-forge-action-contracts-062c", "true");
  }

  function run() {
    window.__forgeAliveWorkspaceReadModel062C = READ_MODEL;
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  window.addEventListener("load", run);
  window.__forgeRunCommandBarActionContracts062C = run;
})();
/* FORGEOS:COMMAND_BAR_ACTION_CONTRACT_IMPLEMENTATION_062C:END */

/* FORGEOS:COMMAND_BAR_CONTRACT_RESULT_VISUAL_REPAIR_062C1:START */
(function () {
  "use strict";

  function findInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input");
  }

  function findRoot(input) {
    return input && (input.closest(".dw-command-zone-056y") || input.closest(".dw-command-shell-056y") || input.parentElement);
  }

  function updateGeometry() {
    var input = findInput();
    var root = findRoot(input);
    if (!input || !root) {
      return;
    }
    root.setAttribute("data-forge-contract-result-visual-repair-062c1", "true");
    var inputRect = input.getBoundingClientRect();
    var rootRect = root.getBoundingClientRect();
    var top = Math.max(68, Math.round(inputRect.bottom - rootRect.top + 12));
    root.style.setProperty("--forge-contract-panel-top-062c1", top + "px");
    root.style.setProperty("--forge-contract-panel-left-062c1", "28px");
    root.style.setProperty("--forge-contract-panel-right-062c1", "28px");
  }

  function runRepair() {
    updateGeometry();
    var input = findInput();
    if (!input || input.getAttribute("data-forge-contract-visual-repair-bound-062c1") === "true") {
      return;
    }
    input.setAttribute("data-forge-contract-visual-repair-bound-062c1", "true");
    input.addEventListener("input", updateGeometry);
    input.addEventListener("focus", updateGeometry);
    window.addEventListener("resize", updateGeometry);
    document.documentElement.setAttribute("data-forge-contract-result-visual-repair-ready-062c1", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runRepair, { once: true });
  } else {
    runRepair();
  }
  window.addEventListener("load", runRepair);
  window.__forgeRunCommandBarContractResultVisualRepair062C1 = runRepair;
})();
/* FORGEOS:COMMAND_BAR_CONTRACT_RESULT_VISUAL_REPAIR_062C1:END */

/* FORGEOS:ACTION_CONTRACT_READ_MODEL_PREVIEW_BINDING_062E:START */
(function () {
  "use strict";

  function findInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input");
  }

  function findRoot(input) {
    return input && (input.closest(".dw-command-zone-056y") || input.closest(".dw-command-shell-056y") || input.parentElement);
  }

  function ensurePayloadPanel(root) {
    var panel = root.querySelector(".forge-action-preview-payload-062e");
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "forge-action-preview-payload-062e";
      panel.setAttribute("aria-live", "polite");
      panel.setAttribute("data-forge-action-preview-payload-panel-062e", "true");
      panel.hidden = true;
      root.appendChild(panel);
    }
    return panel;
  }

  function getReadModel() {
    return window.__forgeAliveWorkspaceReadModel062C || null;
  }

  function findAction(model, actionId) {
    if (!model || !model.actionRegistry) {
      return null;
    }
    return model.actionRegistry.filter(function (action) {
      return action.actionId === actionId;
    })[0] || null;
  }

  function findCommand(model, commandId) {
    if (!model || !model.commandCatalog) {
      return null;
    }
    return model.commandCatalog.filter(function (command) {
      return command.commandId === commandId;
    })[0] || null;
  }

  function blockedReasons(model, action) {
    var ids = action && action.blockedReasonIds ? action.blockedReasonIds : ["preview_only_boundary"];
    var reasons = model && model.blockedReasons ? model.blockedReasons : [];
    return ids.map(function (id) {
      var found = reasons.filter(function (reason) {
        return reason.reasonId === id;
      })[0];
      return found ? found.message : id;
    });
  }

  function buildPayload(detail) {
    var model = getReadModel();
    var action = findAction(model, detail.actionId);
    var command = findCommand(model, detail.commandId);
    var policy = model && model.previewPolicy ? model.previewPolicy : {};
    var status = action ? action.contractStatus : "blocked";
    return {
      modelName: model ? model.modelName : "forge.alive.workspace.read_model.v1",
      actionId: detail.actionId,
      commandId: detail.commandId,
      targetType: detail.targetType,
      targetId: detail.targetId,
      status: status,
      sourceModule: action ? action.sourceModule : "unknown",
      previewSummary: command ? command.subtitle : "Preview preparado sin efectos reales.",
      blockedReasons: blockedReasons(model, action),
      requiresHumanApproval: action ? !!action.requiresHumanApproval : true,
      realEffectsAllowed: false,
      previewOnly: true,
      policy: {
        externalEffectsAllowed: !!policy.externalEffectsAllowed,
        recordMutationAllowed: !!policy.recordMutationAllowed,
        scheduleMutationAllowed: !!policy.scheduleMutationAllowed,
        messageDeliveryAllowed: !!policy.messageDeliveryAllowed,
        providerExecutionAllowed: !!policy.providerExecutionAllowed
      }
    };
  }

  function renderPayload(payload) {
    var input = findInput();
    var root = findRoot(input);
    if (!root) {
      return;
    }
    var panel = ensurePayloadPanel(root);
    panel.hidden = false;
    panel.innerHTML =
      '<div class="forge-action-preview-payload-062e__head">' +
        '<div class="forge-action-preview-payload-062e__title">' + payload.actionId + '</div>' +
        '<div class="forge-action-preview-payload-062e__status">' + payload.status.replace("_", " ") + '</div>' +
      '</div>' +
      '<p class="forge-action-preview-payload-062e__body">' +
        payload.previewSummary + ' Fuente: ' + payload.sourceModule + '. ' +
        'Bloqueos: ' + payload.blockedReasons.join("; ") + '. ' +
        'Efectos reales: desactivados.' +
      '</p>';
  }

  function handlePreview(event) {
    var payload = buildPayload(event.detail || {});
    window.__forgeLastActionPreviewPayload062E = payload;
    document.documentElement.setAttribute("data-forge-action-preview-payload-ready-062e", "true");
    renderPayload(payload);
    window.dispatchEvent(new CustomEvent("forge:action-preview-payload:062e", {
      detail: payload
    }));
  }

  function run() {
    window.removeEventListener("forge:action-contract-preview:062c", handlePreview);
    window.addEventListener("forge:action-contract-preview:062c", handlePreview);
    document.documentElement.setAttribute("data-forge-action-preview-binding-062e", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  window.addEventListener("load", run);
  window.__forgeRunActionContractReadModelPreviewBinding062E = run;
})();
/* FORGEOS:ACTION_CONTRACT_READ_MODEL_PREVIEW_BINDING_062E:END */

/* FORGEOS:QUICK_ACTIONS_PANEL_ACTIVE_STATE_REPAIR_062F1:START */
(function () {
  "use strict";

  function findInput() {
    return document.querySelector(".dw-command-input-056y, .command-pill-input");
  }

  function findRoot(input) {
    return input && (input.closest(".dw-command-zone-056y") || input.closest(".dw-command-shell-056y") || input.parentElement);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function isQuickActions(value) {
    var query = normalize(value);
    return query === "/quick actions" || query === "quick actions";
  }

  function revealResults(root) {
    var panels = root.querySelectorAll(".dw-command-results-056y, .forge-contract-results-062c");
    panels.forEach(function (panel) {
      panel.hidden = false;
      panel.removeAttribute("hidden");
      panel.style.removeProperty("display");
      panel.style.removeProperty("visibility");
      panel.style.removeProperty("opacity");
    });
  }

  function updateQuickActionsPanelState() {
    var input = findInput();
    var root = findRoot(input);
    if (!input || !root) {
      return;
    }
    root.setAttribute("data-forge-quick-actions-panel-repair-ready-062f1", "true");
    if (isQuickActions(input.value || input.textContent)) {
      root.classList.add("is-command-active-060m");
      root.classList.add("is-command-active");
      root.setAttribute("data-forge-quick-actions-panel-active-062f1", "true");
      root.setAttribute("data-forge-contract-panel-active-062c", "true");
      revealResults(root);
    } else {
      root.removeAttribute("data-forge-quick-actions-panel-active-062f1");
    }
  }

  function bind() {
    var input = findInput();
    if (!input) {
      return;
    }
    if (input.getAttribute("data-forge-quick-actions-panel-repair-bound-062f1") !== "true") {
      input.setAttribute("data-forge-quick-actions-panel-repair-bound-062f1", "true");
      input.addEventListener("input", updateQuickActionsPanelState);
      input.addEventListener("keyup", updateQuickActionsPanelState);
      input.addEventListener("focus", updateQuickActionsPanelState);
      input.addEventListener("blur", function () {
        setTimeout(updateQuickActionsPanelState, 80);
      });
    }
    updateQuickActionsPanelState();
    document.documentElement.setAttribute("data-forge-quick-actions-panel-active-state-repair-062f1", "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
  window.addEventListener("load", bind);
  window.__forgeRunQuickActionsPanelActiveStateRepair062F1 = bind;
})();
/* FORGEOS:QUICK_ACTIONS_PANEL_ACTIVE_STATE_REPAIR_062F1:END */

/* FORGEOS:MOBILE_COMMAND_CONTRACT_BINDING_REPAIR_062F3C:START */
(function () {
  "use strict";

  var activeIndex = 0;
  var currentRows = [];

  function normalize(value) {
    return String(value || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function getReadModel() {
    return window.__forgeAliveWorkspaceReadModel062C || null;
  }

  function findRoot() {
    return document.querySelector(".alfred-command-root-056k5");
  }

  function findInput(root) {
    return root && root.querySelector(".alfred-command-input-056k5");
  }

  function findResults(root) {
    return root && root.querySelector(".alfred-command-results-056k5");
  }

  function actionById(model, actionId) {
    if (!model || !model.actionRegistry) {
      return null;
    }
    return model.actionRegistry.filter(function (action) {
      return action.actionId === actionId;
    })[0] || null;
  }

  function commandById(model, commandId) {
    if (!model || !model.commandCatalog) {
      return null;
    }
    return model.commandCatalog.filter(function (command) {
      return command.commandId === commandId;
    })[0] || null;
  }

  function statusLabel(action) {
    if (!action) {
      return "blocked";
    }
    if (action.contractStatus === "needs_approval") {
      return "approval";
    }
    return action.contractStatus.replace("_", " ");
  }

  function blockedReasons(model, action) {
    var ids = action && action.blockedReasonIds ? action.blockedReasonIds : ["preview_only_boundary"];
    var reasons = model && model.blockedReasons ? model.blockedReasons : [];
    return ids.map(function (id) {
      var found = reasons.filter(function (reason) {
        return reason.reasonId === id;
      })[0];
      return found ? found.message : id;
    });
  }

  function queryRows(model, value) {
    var q = normalize(value);
    if (!model || !model.commandCatalog || !q) {
      return [];
    }
    if (q === "/" || q === "/quick" || q === "/quick actions" || q === "quick actions") {
      return model.commandCatalog.slice(0);
    }
    return model.commandCatalog.filter(function (command) {
      var haystack = [command.title, command.subtitle].concat(command.tokens || []).join(" ");
      return normalize(haystack).indexOf(q) !== -1;
    });
  }

  function buildPayload(model, command) {
    var action = actionById(model, command.actionId);
    var policy = model && model.previewPolicy ? model.previewPolicy : {};
    return {
      modelName: model ? model.modelName : "forge.alive.workspace.read_model.v1",
      actionId: command.actionId,
      commandId: command.commandId,
      targetType: command.targetType,
      targetId: command.targetId,
      status: action ? action.contractStatus : "blocked",
      sourceModule: action ? action.sourceModule : "unknown",
      previewSummary: command.subtitle || "Preview preparado sin efectos reales.",
      blockedReasons: blockedReasons(model, action),
      requiresHumanApproval: action ? !!action.requiresHumanApproval : true,
      realEffectsAllowed: false,
      previewOnly: true,
      policy: {
        externalEffectsAllowed: !!policy.externalEffectsAllowed,
        recordMutationAllowed: !!policy.recordMutationAllowed,
        scheduleMutationAllowed: !!policy.scheduleMutationAllowed,
        messageDeliveryAllowed: !!policy.messageDeliveryAllowed,
        providerExecutionAllowed: !!policy.providerExecutionAllowed
      }
    };
  }

  function renderPayload(results, payload) {
    var panel = results.querySelector(".forge-mobile-action-preview-payload-062f3c");
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "forge-mobile-action-preview-payload-062f3c";
      panel.setAttribute("aria-live", "polite");
      panel.setAttribute("data-forge-mobile-action-preview-payload-panel-062f3c", "true");
      results.appendChild(panel);
    }
    panel.innerHTML =
      '<div class="forge-mobile-action-preview-payload-062f3c__head">' +
        '<div class="forge-mobile-action-preview-payload-062f3c__title">' + payload.actionId + '</div>' +
        '<div class="forge-mobile-action-preview-payload-062f3c__status">' + payload.status.replace("_", " ") + '</div>' +
      '</div>' +
      '<p class="forge-mobile-action-preview-payload-062f3c__body">' +
        payload.previewSummary + ' Fuente: ' + payload.sourceModule + '. ' +
        'Bloqueos: ' + payload.blockedReasons.join("; ") + '. ' +
        'Policy: no CRM, no calendario, no envio, no provider. ' +
        'Efectos reales: desactivados.' +
      '</p>';
  }

  function selectCommand(root, input, results, command) {
    var model = getReadModel();
    var payload = buildPayload(model, command);
    input.value = command.title;
    window.__forgeLastActionPreviewPayload062E = payload;
    document.documentElement.setAttribute("data-forge-action-preview-payload-ready-062e", "true");
    document.documentElement.setAttribute("data-forge-mobile-command-contract-selected-062f3c", command.actionId);
    root.classList.add("is-open");
    root.classList.add("has-query");
    root.classList.add("has-results");
    root.setAttribute("data-forge-mobile-command-output-visible-062f3c", "true");
    results.textContent = "";
    renderPayload(results, payload);
    window.dispatchEvent(new CustomEvent("forge:action-preview-payload:062e", {
      detail: payload
    }));
    window.dispatchEvent(new CustomEvent("forge:action-contract-preview:062c", {
      detail: {
        commandId: command.commandId,
        actionId: command.actionId,
        targetType: command.targetType,
        targetId: command.targetId,
        status: payload.status,
        previewOnly: true
      }
    }));
    [0, 180].forEach(function (delay) {
      window.setTimeout(function () {
        root.classList.add("is-open");
        root.classList.add("has-query");
        root.classList.add("has-results");
        root.setAttribute("data-forge-mobile-command-output-visible-062f3c", "true");
        results.textContent = "";
        renderPayload(results, payload);
      }, delay);
    });
  }

  function renderRows(root, input, results) {
    var model = getReadModel();
    currentRows = queryRows(model, input.value);
    results.textContent = "";
    activeIndex = Math.min(activeIndex, Math.max(currentRows.length - 1, 0));
    root.classList.toggle("has-query", String(input.value || "").trim().length > 0);
    root.classList.toggle("has-results", currentRows.length > 0);
    root.setAttribute("data-forge-mobile-command-results-count-062f3c", String(currentRows.length));
    if (currentRows.length > 0) {
      root.setAttribute("data-forge-mobile-command-output-visible-062f3c", "true");
    } else {
      root.removeAttribute("data-forge-mobile-command-output-visible-062f3c");
    }

    currentRows.forEach(function (command, index) {
      var action = actionById(model, command.actionId);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "alfred-command-result-062f3c";
      button.setAttribute("role", "option");
      button.setAttribute("data-index", String(index));
      button.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      button.innerHTML =
        '<span>' +
          '<span class="alfred-command-result-062f3c__title">' + command.title + '</span>' +
          '<span class="alfred-command-result-062f3c__subtitle">' + command.subtitle + '</span>' +
        '</span>' +
        '<span class="alfred-command-result-062f3c__status">' + statusLabel(action) + '</span>';
      button.addEventListener("click", function () {
        selectCommand(root, input, results, command);
      });
      results.appendChild(button);
    });
  }

  function bind() {
    if (!isMobileViewport()) {
      return;
    }
    var root = findRoot();
    var input = findInput(root);
    var results = findResults(root);
    if (!root || !input || !results || input.getAttribute("data-forge-mobile-command-contract-bound-062f3c") === "true") {
      return;
    }

    root.setAttribute("data-forge-mobile-command-contract-bound-062f3c", "true");
    input.setAttribute("data-forge-mobile-command-contract-bound-062f3c", "true");
    input.setAttribute("placeholder", "/quick actions");

    input.addEventListener("input", function () {
      activeIndex = 0;
      renderRows(root, input, results);
      window.setTimeout(function () {
        if (currentRows.length > 0) {
          root.classList.add("has-results");
          root.setAttribute("data-forge-mobile-command-output-visible-062f3c", "true");
        }
      }, 0);
    });

    input.addEventListener("keydown", function (event) {
      if (!currentRows.length) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % currentRows.length;
        renderRows(root, input, results);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = (activeIndex + currentRows.length - 1) % currentRows.length;
        renderRows(root, input, results);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        selectCommand(root, input, results, currentRows[activeIndex]);
      }
    });

    document.documentElement.setAttribute("data-forge-mobile-command-contract-binding-062f3c", "true");
    renderRows(root, input, results);
  }

  function scheduleBind() {
    bind();
    window.setTimeout(bind, 250);
    window.setTimeout(bind, 800);
    window.setTimeout(bind, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBind, { once: true });
  } else {
    scheduleBind();
  }
  window.addEventListener("load", scheduleBind);
  window.addEventListener("resize", scheduleBind);
  window.__forgeRunMobileCommandContractBindingRepair062F3C = scheduleBind;
})();
/* FORGEOS:MOBILE_COMMAND_CONTRACT_BINDING_REPAIR_062F3C:END */
