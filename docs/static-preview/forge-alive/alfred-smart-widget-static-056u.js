/* FORGEOS:ALFRED_STATIC_SMART_WIDGET_IN_INDEX_056U */
(function () {
  "use strict";

  function setIndex(root, index) {
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-static-card-056u"));
    var max = Math.max(0, cards.length - 1);
    index = Math.max(0, Math.min(max, index));
    root.dataset.index056u = String(index);
    root.dataset.forgeHomeCarouselIndexR16c = String(index);
    var dots = root.querySelector(".forge-smart-widget-static-dots-056u");
    if (dots) dots.style.setProperty("--forge-dot-offset-056u", String(index * 22) + "px");
    Array.prototype.forEach.call(root.querySelectorAll(".forge-smart-widget-static-dot-056u"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056u", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
    cards.forEach(function (card, cardIndex) {
      card.hidden = cardIndex !== index;
      card.setAttribute("aria-hidden", cardIndex === index ? "false" : "true");
    });
    var previous = root.querySelector("[data-forge-home-carousel-previous-r16c]");
    var next = root.querySelector("[data-forge-home-carousel-next-r16c]");
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === max;

    var viewport = root.querySelector(".forge-smart-widget-static-viewport-056u");
    var active = cards[index];
    if (viewport && active) {
      window.requestAnimationFrame(function () {
        viewport.style.height = Math.ceil(active.getBoundingClientRect().height) + "px";
      });
    }
  }

  function ensureControls(root) {
    var existing = root.querySelector(".forge-home-carousel-controls-r16c");
    if (existing) return existing;

    var controls = document.createElement("div");
    controls.className = "forge-home-carousel-controls-r16c";
    controls.setAttribute("aria-label", "Controles del carrusel de contexto vivo");

    var previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Anterior";
    previous.setAttribute("data-forge-home-carousel-previous-r16c", "true");
    previous.setAttribute("aria-label", "Ver tarjeta anterior");

    var next = document.createElement("button");
    next.type = "button";
    next.textContent = "Siguiente";
    next.setAttribute("data-forge-home-carousel-next-r16c", "true");
    next.setAttribute("aria-label", "Ver tarjeta siguiente");

    previous.addEventListener("click", function () {
      setIndex(root, Number(root.dataset.index056u || "0") - 1);
    });
    next.addEventListener("click", function () {
      setIndex(root, Number(root.dataset.index056u || "0") + 1);
    });

    controls.appendChild(previous);
    controls.appendChild(next);
    var viewport = root.querySelector(".forge-smart-widget-static-viewport-056u");
    root.insertBefore(controls, viewport || root.firstChild);
    return controls;
  }

  function boot(root) {
    if (!root) return;
    if (root.dataset.ready056u === "true") {
      setIndex(root, Number(root.dataset.index056u || "0"));
      return;
    }
    root.dataset.ready056u = "true";
    root.dataset.forgeHomeSmartWidgetR16c = "canonical";
    var startX = 0;
    var viewport = root.querySelector(".forge-smart-widget-static-viewport-056u");
    ensureControls(root);
    Array.prototype.forEach.call(root.querySelectorAll(".forge-smart-widget-static-dot-056u"), function (dot, index) {
      dot.addEventListener("click", function () {
        setIndex(root, index);
      });
    });
    if (viewport) {
      viewport.setAttribute("tabindex", "0");
      viewport.setAttribute("aria-roledescription", "carrusel");
      viewport.addEventListener("touchstart", function (event) {
        if (event.touches && event.touches.length) startX = event.touches[0].clientX;
      }, { passive: true });
      viewport.addEventListener("touchend", function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        var delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) < 34) return;
        var current = Number(root.dataset.index056u || "0");
        setIndex(root, current + (delta < 0 ? 1 : -1));
      }, { passive: true });
      viewport.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        var current = Number(root.dataset.index056u || "0");
        setIndex(root, current + (event.key === "ArrowRight" ? 1 : -1));
      });
    }
    setIndex(root, 0);
  }

  function mount() {
    Array.prototype.forEach.call(document.querySelectorAll(".forge-smart-widget-static-056u"), boot);
  }

  document.addEventListener("DOMContentLoaded", mount);
  window.addEventListener("load", mount);
  window.addEventListener("pageshow", mount);
  window.addEventListener("popstate", mount);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) mount();
  });
  window.addEventListener("resize", mount, { passive: true });
  window.addEventListener("orientationchange", mount, { passive: true });
})();
