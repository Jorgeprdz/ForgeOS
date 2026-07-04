/* FORGEOS:FORGE_MOBILE_PATTERN_057D:START */
(function () {
  "use strict";

  var mobileQuery = "(max-width: 767px), (max-width: 900px) and (orientation: landscape)";

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

  function icon(name) {
    var paths = {
      hoy: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
      seguimiento: '<path d="M20 7.5 12 15 8.5 11.5 4 16"></path><path d="M15 7h5v5"></path>',
      produccion: '<path d="M5 20V10"></path><path d="M12 20V4"></path><path d="M19 20v-7"></path>',
      actividad: '<path d="M3 12h4l2-6 4 12 2-6h6"></path>',
      comisiones: '<circle cx="8" cy="8" r="4"></circle><circle cx="16" cy="16" r="4"></circle><path d="m16 8-8 8"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.hoy) + "</svg>";
  }

  function ensureContextNav() {
    if (!isMobile()) return null;

    var existing = document.querySelector(".forge-mobile-context-nav-057d");
    if (existing) return existing;

    var nav = document.createElement("nav");
    nav.className = "forge-mobile-context-nav-057d";
    nav.setAttribute("aria-label", "Navegacion contextual Forge mobile");

    var items = [
      ["hoy", "Hoy"],
      ["seguimiento", "Seguimiento"],
      ["produccion", "Produccion"],
      ["actividad", "Actividad"],
      ["comisiones", "Comisiones"]
    ];

    nav.innerHTML = items.map(function (item, index) {
      return '<button type="button" data-forge-mobile-context="' + item[0] + '"' + (index === 0 ? ' class="is-active" aria-current="page"' : "") + ">" + icon(item[0]) + "<span>" + item[1] + "</span></button>";
    }).join("");

    nav.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-forge-mobile-context]");
      if (!button) return;
      Array.prototype.forEach.call(nav.querySelectorAll("button"), function (candidate) {
        candidate.classList.remove("is-active");
        candidate.removeAttribute("aria-current");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    });

    var hero = document.querySelector(".assistant-card, [aria-labelledby='alfred-forge-heading']");
    var shell = document.querySelector(".phone-shell") || document.body;

    if (hero && hero.parentNode) {
      hero.parentNode.insertBefore(nav, hero);
    } else if (shell.firstElementChild) {
      shell.insertBefore(nav, shell.firstElementChild.nextSibling);
    } else {
      shell.appendChild(nav);
    }

    return nav;
  }

  function bindScrollBehavior(nav) {
    if (!nav || nav.dataset.forgeScrollBound057d === "true") return;
    nav.dataset.forgeScrollBound057d = "true";

    var lastY = window.scrollY || 0;
    var ticking = false;

    function update() {
      var currentY = window.scrollY || 0;
      var goingDown = currentY > lastY + 6;
      var goingUp = currentY < lastY - 6;

      if (currentY > 140 && goingDown) {
        nav.classList.add("is-hidden");
      } else if (goingUp || currentY < 80) {
        nav.classList.remove("is-hidden");
      }

      lastY = currentY;
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  function measureActiveWidget(root) {
    var viewport = root.querySelector(".forge-smart-widget-static-viewport-056u");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-card-056u"));
    if (!viewport || cards.length === 0) return;

    var activeIndex = Math.max(0, Math.min(cards.length - 1, Number(root.dataset.activeIndex057d || 0)));
    var active = cards[activeIndex];
    var height = active.getBoundingClientRect().height;

    if (height > 0) {
      viewport.style.height = Math.ceil(height) + "px";
    }
  }

  function activateWidget(root, index) {
    var track = root.querySelector(".forge-smart-widget-static-track-056u");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-card-056u"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-dot-056u"));
    if (!track || cards.length === 0) return;

    var safeIndex = Math.max(0, Math.min(cards.length - 1, index));
    root.dataset.activeIndex057d = String(safeIndex);
    track.style.transform = "translateX(" + (-safeIndex * 100) + "%)";

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === safeIndex);
      if (dotIndex === safeIndex) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    window.requestAnimationFrame(function () {
      measureActiveWidget(root);
    });
  }

  function bindStaticSmartWidget() {
    if (!isMobile()) return;

    var root = document.querySelector(".forge-smart-widget-static-056u");
    if (!root || root.dataset.forge057dReady === "true") return;

    var dots = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-dot-056u"));
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-card-056u"));
    if (cards.length === 0) return;

    root.dataset.forge057dReady = "true";

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activateWidget(root, index);
      });
    });

    var touchStartX = null;
    root.addEventListener("touchstart", function (event) {
      if (!event.touches || event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    root.addEventListener("touchend", function (event) {
      if (touchStartX === null || !event.changedTouches || event.changedTouches.length !== 1) return;
      var delta = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 44) return;
      var current = Number(root.dataset.activeIndex057d || 0);
      activateWidget(root, current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    activateWidget(root, 0);
    window.addEventListener("resize", function () {
      measureActiveWidget(root);
    }, { passive: true });
  }

  function markReady() {
    document.documentElement.classList.add("forge-mobile-pattern-057d");
  }

  ready(function () {
    if (!isMobile()) return;
    var nav = ensureContextNav();
    bindScrollBehavior(nav);
    bindStaticSmartWidget();
    markReady();
  });
}());
/* FORGEOS:FORGE_MOBILE_PATTERN_057D:END */
