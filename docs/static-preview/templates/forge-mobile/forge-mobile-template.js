/* FORGEOS:FORGE_MOBILE_TEMPLATE_INTERACTIONS_001 */
(function () {
  "use strict";

  function setWidgetIndex(root, index) {
    var max = 3;
    index = Math.max(0, Math.min(max, index));
    root.style.setProperty("--forge-widget-index", String(index));
    var dots = root.querySelector(".forge-widget-dots");
    if (dots) dots.style.setProperty("--forge-dot-index", String(index));
    Array.prototype.forEach.call(root.querySelectorAll(".forge-widget-dots button"), function (button, buttonIndex) {
      button.classList.toggle("is-active", buttonIndex === index);
      button.setAttribute("aria-current", buttonIndex === index ? "true" : "false");
    });
  }

  function bootWidget(root) {
    var startX = 0;
    var viewport = root.querySelector(".forge-widget-viewport");
    Array.prototype.forEach.call(root.querySelectorAll(".forge-widget-dots button"), function (button, index) {
      button.addEventListener("click", function () {
        setWidgetIndex(root, index);
      });
    });
    if (viewport) {
      viewport.addEventListener("touchstart", function (event) {
        if (event.touches && event.touches.length) startX = event.touches[0].clientX;
      }, { passive: true });
      viewport.addEventListener("touchend", function (event) {
        if (!event.changedTouches || !event.changedTouches.length) return;
        var delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) < 34) return;
        var current = Number(root.dataset.widgetIndex || "0");
        var next = current + (delta < 0 ? 1 : -1);
        root.dataset.widgetIndex = String(Math.max(0, Math.min(3, next)));
        setWidgetIndex(root, Number(root.dataset.widgetIndex));
      }, { passive: true });
    }
    root.dataset.widgetIndex = "0";
    setWidgetIndex(root, 0);
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll(".forge-smart-widget"), bootWidget);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
