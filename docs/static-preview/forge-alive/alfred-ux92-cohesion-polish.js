/* FORGEOS:ALFRED_MOBILE_UX92_CONTENT_COHESION_POLISH_056R */
(function () {
  "use strict";

  function isMobile() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function text(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function bowtieSvg() {
    return [
      '<svg viewBox="0 0 96 58" role="img" aria-label="Alfred">',
      '<defs>',
      '<linearGradient id="alfredBowtieGoldCyan056r" x1="0" x2="1" y1="0" y2="1">',
      '<stop offset="0" stop-color="#F7D584"/>',
      '<stop offset="0.52" stop-color="#F2CF75"/>',
      '<stop offset="1" stop-color="#76DBFF"/>',
      '</linearGradient>',
      '</defs>',
      '<path d="M9 17C21 8 35 11 45 25C35 41 21 48 9 40C15 32 15 25 9 17Z" fill="#061326"/>',
      '<path d="M87 17C75 8 61 11 51 25C61 41 75 48 87 40C81 32 81 25 87 17Z" fill="#061326"/>',
      '<path d="M12 18C23 11 35 14 43 26" fill="none" stroke="url(#alfredBowtieGoldCyan056r)" stroke-width="3" stroke-linecap="round"/>',
      '<path d="M84 18C73 11 61 14 53 26" fill="none" stroke="url(#alfredBowtieGoldCyan056r)" stroke-width="3" stroke-linecap="round"/>',
      '<rect x="42" y="22" width="12" height="14" rx="5" fill="#F5F8FF"/>',
      '<circle cx="48" cy="29" r="3.8" fill="#76DBFF" opacity="0.72"/>',
      '</svg>'
    ].join("");
  }

  function containsAny(value, needles) {
    var lower = value.toLowerCase();
    return needles.some(function (needle) {
      return lower.indexOf(needle.toLowerCase()) !== -1;
    });
  }

  function findAlfredInsightCard() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("article, section, div"));
    var matches = nodes.filter(function (node) {
      var value = text(node);
      if (!containsAny(value, ["ALFRED / FORGE", "ALFRED /FORGE"])) return false;
      if (!containsAny(value, ["cuello de botella", "Follow Juan"])) return false;
      var rect = node.getBoundingClientRect();
      return rect.width >= 260 && rect.height >= 120 && rect.height <= 520;
    });
    if (!matches.length) return null;
    matches.sort(function (a, b) {
      var ar = a.getBoundingClientRect();
      var br = b.getBoundingClientRect();
      return (br.width * br.height) - (ar.width * ar.height);
    });
    return matches[0];
  }

  function replaceMonograms() {
    var card = findAlfredInsightCard();
    var scope = card || document;
    Array.prototype.forEach.call(scope.querySelectorAll("div, span, button"), function (node) {
      if (node.dataset.alfredBowtie056r === "ready") return;
      if (text(node) !== "A") return;
      var rect = node.getBoundingClientRect();
      if (rect.width < 28 || rect.width > 112 || rect.height < 28 || rect.height > 112) return;
      node.dataset.alfredBowtie056r = "ready";
      node.classList.add("forge-ux92-bowtie-mark-056r");
      node.innerHTML = bowtieSvg();
    });
  }

  function leafElements(scope) {
    return Array.prototype.slice.call(scope.querySelectorAll("h1,h2,h3,h4,p,span,div")).filter(function (node) {
      return node.children.length === 0;
    });
  }

  function simplifyAlfredCard() {
    var card = findAlfredInsightCard();
    if (!card || card.dataset.alfredSimplified056r === "ready") return;
    card.dataset.alfredSimplified056r = "ready";
    card.classList.add("forge-ux92-card-simplified-056r");
    leafElements(card).forEach(function (node) {
      var value = text(node);
      if (containsAny(value, ["Detecté un cuello de botella", "Detecte un cuello de botella"])) {
        node.textContent = "Haz esto ahora";
      } else if (containsAny(value, ["3 oportunidades de muestra necesitan seguimiento antes de enfriarse"])) {
        node.textContent = "Prioriza seguimiento antes de que se enfríe.";
      }
    });
  }

  function tightenFocusCopy() {
    var focus = document.querySelector(".forge-ux99-focus-056q");
    if (!focus || focus.dataset.cohesion056r === "ready") return;
    focus.dataset.cohesion056r = "ready";
    var eyebrow = focus.querySelector(".forge-ux99-eyebrow-056q");
    var title = focus.querySelector(".forge-ux99-title-056q");
    var subtitle = focus.querySelector(".forge-ux99-subtitle-056q");
    if (eyebrow) eyebrow.textContent = "Siguiente mejor acción";
    if (title) title.textContent = "Haz esto ahora";
    if (subtitle) subtitle.textContent = "Alfred prioriza la revisión que más protege el día.";
  }

  function mount() {
    if (!isMobile()) return;
    document.documentElement.classList.add("forge-ux92-cohesion-056r");
    replaceMonograms();
    simplifyAlfredCard();
    tightenFocusCopy();
  }

  function schedule() {
    [60, 180, 420, 900, 1600, 2600, 4200].forEach(function (delay) {
      window.setTimeout(mount, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
})();
