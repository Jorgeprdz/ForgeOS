/* FORGEOS:FORGE_MOBILE_VISUAL_POLISH_057F:START */
(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 900px)";
  var media = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: true };

  function isMobile() {
    return !!media.matches;
  }

  function queryAny(selectors, root) {
    var scope = root || document;
    for (var i = 0; i < selectors.length; i += 1) {
      var found = scope.querySelector(selectors[i]);
      if (found) return found;
    }
    return null;
  }

  function forceHoyActive() {
    if (!isMobile()) return;
    var nav = document.querySelector(".forge-mobile-context-nav-057d");
    if (!nav) return;

    var buttons = Array.prototype.slice.call(nav.querySelectorAll("button"));
    if (!buttons.length) return;

    var hoy = buttons.find(function (button) {
      return /hoy/i.test(button.textContent || "");
    }) || buttons[0];

    buttons.forEach(function (button) {
      button.classList.toggle("is-active", button === hoy);
      button.setAttribute("aria-selected", button === hoy ? "true" : "false");
    });
  }

  function activateFirstSmartWidget() {
    if (!isMobile()) return;
    var root = document.querySelector(".forge-smart-widget-static-056u");
    if (!root) return;
    if (root.dataset.forgeHomeSmartWidgetR16c === "canonical") return;

    var track = root.querySelector(".forge-smart-widget-static-track-056u");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-card-056u"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-dot-056u"));
    if (!track || !cards.length) return;

    var targetIndex = cards.findIndex(function (card) {
      return /seguimiento|por qu[eé] ahora|relaci[oó]n abierta/i.test(card.textContent || "");
    });
    if (targetIndex < 0) targetIndex = 0;

    root.setAttribute("data-forge-057f-lock", "true");
    root.setAttribute("data-forge-057f-active", String(targetIndex));

    track.style.transform = "translate3d(" + (-100 * targetIndex) + "%, 0, 0)";
    track.style.transition = "transform 520ms cubic-bezier(0.2, 0.9, 0.2, 1)";

    cards.forEach(function (card, index) {
      card.classList.toggle("is-active", index === targetIndex);
      card.setAttribute("aria-hidden", index === targetIndex ? "false" : "true");
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === targetIndex);
      dot.setAttribute("aria-current", index === targetIndex ? "true" : "false");
    });

    var glider = root.querySelector(".forge-smart-widget-static-glider-056u");
    if (glider && dots[targetIndex]) {
      var dot = dots[targetIndex];
      glider.style.transform = "translate3d(" + dot.offsetLeft + "px, 0, 0)";
      glider.style.width = Math.max(24, dot.offsetWidth) + "px";
    }
  }

  function keepOrbBelowPlanCta() {
    if (!isMobile()) return;
    var orb = queryAny([".command-orb-layer", "[data-command-orb-layer]"]);
    var plan = queryAny([".plan-card", ".panel:has(.primary-button)", ".panel"]);
    if (!orb || !plan) return;

    var planBox = plan.getBoundingClientRect();
    var orbBox = orb.getBoundingClientRect();
    var earlyViewport = window.scrollY < 240;
    var overlapsPlan = orbBox.top < planBox.bottom && orbBox.bottom > planBox.top;

    orb.classList.toggle("forge-orb-polish-lower-057f", earlyViewport && overlapsPlan);
  }

  function installOrbLoweringStyle() {
    if (document.getElementById("forge-mobile-visual-polish-057f-style")) return;
    var style = document.createElement("style");
    style.id = "forge-mobile-visual-polish-057f-style";
    style.textContent = [
      "@media (max-width: 900px) {",
      "  .command-orb-layer.forge-orb-polish-lower-057f:not(.is-open) {",
      "    opacity: 0.76 !important;",
      "    transform: translateY(26px) scale(0.88) !important;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function applyPolish() {
    if (!isMobile()) return;
    installOrbLoweringStyle();
    forceHoyActive();
    activateFirstSmartWidget();
    keepOrbBelowPlanCta();
    document.documentElement.classList.add("forge-mobile-polish-057f");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyPolish);
  } else {
    applyPolish();
  }

  window.addEventListener("load", applyPolish, { passive: true });
  window.addEventListener("resize", applyPolish, { passive: true });
  window.addEventListener("scroll", keepOrbBelowPlanCta, { passive: true });
  window.setTimeout(applyPolish, 160);
  window.setTimeout(applyPolish, 520);
  window.setTimeout(applyPolish, 1100);
})();
/* FORGEOS:FORGE_MOBILE_VISUAL_POLISH_057F:END */
