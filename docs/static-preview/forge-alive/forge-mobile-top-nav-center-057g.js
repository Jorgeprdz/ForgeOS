/* FORGEOS:FORGE_MOBILE_TOP_NAV_CENTER_057G:START */
(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 767px), (max-width: 900px) and (orientation: landscape)";
  var media = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : { matches: true };

  function isMobile() {
    return !!media.matches;
  }

  function centerTopNav() {
    if (!isMobile()) return;
    var nav = document.querySelector(".forge-mobile-context-nav-057d");
    if (!nav) return;

    nav.scrollLeft = 0;
    nav.style.marginLeft = "auto";
    nav.style.marginRight = "auto";
    nav.style.left = "auto";
    nav.style.right = "auto";
    nav.style.transform = "none";
    nav.setAttribute("data-forge-057g-centered", "true");
    document.documentElement.classList.add("forge-mobile-top-nav-centered-057g");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", centerTopNav);
  } else {
    centerTopNav();
  }

  window.addEventListener("load", centerTopNav, { passive: true });
  window.addEventListener("resize", centerTopNav, { passive: true });
  window.setTimeout(centerTopNav, 120);
  window.setTimeout(centerTopNav, 420);
  window.setTimeout(centerTopNav, 900);
})();
/* FORGEOS:FORGE_MOBILE_TOP_NAV_CENTER_057G:END */
