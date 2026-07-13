/* FORGEOS:FORGE_MOBILE_VISUAL_REPAIR_057E:START */
(function () {
  "use strict";

  var mobileQuery = "(max-width: 900px)";

  function isMobile() {
    return window.matchMedia && window.matchMedia(mobileQuery).matches;
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
      return;
    }
    fn();
  }

  function forceHoyActive() {
    if (!isMobile()) return;
    var nav = document.querySelector(".forge-mobile-context-nav-057d");
    if (!nav) return;

    Array.prototype.forEach.call(nav.querySelectorAll("button"), function (button) {
      var isHoy = button.getAttribute("data-forge-mobile-context") === "hoy";
      button.classList.toggle("is-active", isHoy);
      if (isHoy) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function keepPlanReadable() {
    if (!isMobile()) return;
    var plan = document.querySelector(".plan-card");
    var orb = document.querySelector(".command-orb-layer");
    if (!plan || !orb || orb.classList.contains("is-open")) return;

    var planRect = plan.getBoundingClientRect();
    var orbRect = orb.getBoundingClientRect();
    var overlapsPlan = !(orbRect.left > planRect.right || orbRect.right < planRect.left || orbRect.top > planRect.bottom || orbRect.bottom < planRect.top);

    if (overlapsPlan && window.scrollY < 260) {
      orb.classList.add("forge-orb-defers-plan-057e");
    } else {
      orb.classList.remove("forge-orb-defers-plan-057e");
    }
  }

  function patchOrbDeferralStyle() {
    if (document.getElementById("forge-orb-defers-plan-057e-style")) return;
    var style = document.createElement("style");
    style.id = "forge-orb-defers-plan-057e-style";
    style.textContent = [
      "@media (max-width: 900px) {",
      "  .command-orb-layer.forge-orb-defers-plan-057e:not(.is-open) {",
      "    opacity: 0.72 !important;",
      "    transform: translateY(34px) scale(0.86) !important;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function bind() {
    if (!isMobile()) return;
    patchOrbDeferralStyle();
    forceHoyActive();
    keepPlanReadable();

    window.addEventListener("scroll", keepPlanReadable, { passive: true });
    window.addEventListener("resize", function () {
      forceHoyActive();
      keepPlanReadable();
    }, { passive: true });

    window.setTimeout(forceHoyActive, 150);
    window.setTimeout(keepPlanReadable, 180);
    window.setTimeout(keepPlanReadable, 600);
  }

  ready(bind);
}());
/* FORGEOS:FORGE_MOBILE_VISUAL_REPAIR_057E:END */
