/* FORGEOS:UX99_HARD_MOUNT_FOCUS_LAYER_056Q2 */
(function () {
  "use strict";

  var widgets = [
    ["Seguimiento", "86", "Seguimiento prioritario", "Relacion abierta con riesgo de enfriarse.", "El humano decide tono y momento."],
    ["Decision", "78", "Senales para decidir", "Forge ordena contexto antes de sugerir accion.", "Senal no es decision. Contexto no es verdad."],
    ["Juicio", "92", "Falta contexto", "Primero mejora el juicio; luego decide.", "Unknown no es cero."],
    ["Revision", "80", "Abrir plan de accion", "Usa Alfred para revisar /Follow Juan.", "Preview only. Requiere aprobacion."]
  ];

  function isMobile() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function txt(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function bowtieSvg() {
    return '<svg viewBox="0 0 84 52" aria-hidden="true"><path d="M6 13 C16 6 29 10 38 22 L38 30 C29 42 16 46 6 39 C11 31 11 21 6 13Z" fill="#061326"/><path d="M78 13 C68 6 55 10 46 22 L46 30 C55 42 68 46 78 39 C73 31 73 21 78 13Z" fill="#061326"/><rect x="36" y="20" width="12" height="12" rx="5" fill="#F5F8FF"/><path d="M11 16 C20 11 30 14 37 24" stroke="#F2CF75" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M73 16 C64 11 54 14 47 24" stroke="#76DBFF" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>';
  }

  function hasAnyText(node, needles) {
    var value = txt(node).toLowerCase();
    return needles.some(function (needle) {
      return value.indexOf(needle.toLowerCase()) !== -1;
    });
  }

  function candidates() {
    return Array.prototype.slice.call(document.querySelectorAll("article, section, div, main"));
  }

  function rectUsable(node) {
    var rect = node.getBoundingClientRect();
    return rect.width >= 260 && rect.height >= 120 && rect.height <= 620;
  }

  function findOuterCardByTexts(required, optional) {
    var matches = candidates().filter(function (node) {
      if (!rectUsable(node)) return false;
      if (!required.every(function (needle) { return hasAnyText(node, [needle]); })) return false;
      if (optional && optional.length && !hasAnyText(node, optional)) return false;
      return true;
    });
    if (!matches.length) return null;
    matches.sort(function (a, b) {
      var ar = a.getBoundingClientRect();
      var br = b.getBoundingClientRect();
      var aScore = Math.abs(ar.width - window.innerWidth + 40) + Math.abs(ar.height - 240);
      var bScore = Math.abs(br.width - window.innerWidth + 40) + Math.abs(br.height - 240);
      return aScore - bScore;
    });
    return matches[0];
  }

  function findPlanCard() {
    return findOuterCardByTexts(["Plan de hoy"], ["Iniciar revision", "Iniciar revisión", "Prioridad alta"]) ||
      findOuterCardByTexts(["Plan de hoy"], []);
  }

  function findAlfredCard() {
    return findOuterCardByTexts(["Detecte un cuello", "Detecté un cuello"], ["ALFRED / FORGE", "Follow Juan"]) ||
      findOuterCardByTexts(["Detecte un cuello", "Detecté un cuello"], []);
  }

  function setIndex(root, dots, requested) {
    var previous = Number(root.dataset.index056q2 || "0");
    var index = Math.max(0, Math.min(widgets.length - 1, requested));
    root.dataset.index056q2 = String(index);
    root.style.setProperty("--ux99-index-056q", String(index));
    dots.style.setProperty("--ux99-dot-index-056q", String(index));
    dots.classList.toggle("is-moving-right-056q", index >= previous);
    dots.classList.toggle("is-moving-left-056q", index < previous);
    window.clearTimeout(dots._timer056q);
    dots._timer056q = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056q", "is-moving-left-056q");
    }, 260);
    Array.prototype.forEach.call(dots.querySelectorAll(".forge-ux99-dot-056q"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056q", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function buildFocus() {
    var root = el("section", "forge-ux99-focus-056q");
    root.setAttribute("aria-label", "Alfred enfoque del dia");
    root.style.setProperty("--ux99-index-056q", "0");

    var hero = el("div", "forge-ux99-hero-056q");
    var mark = el("div", "forge-ux99-bowtie-disc-056q");
    mark.innerHTML = bowtieSvg();
    hero.appendChild(mark);
    var copy = el("div");
    copy.appendChild(el("div", "forge-ux99-eyebrow-056q", "Alfred Concierge"));
    copy.appendChild(el("h2", "forge-ux99-title-056q", "Haz esto ahora"));
    copy.appendChild(el("div", "forge-ux99-subtitle-056q", "Revisa seguimiento prioritario antes de que se enfrie."));
    hero.appendChild(copy);
    root.appendChild(hero);

    var viewport = el("div", "forge-ux99-viewport-056q");
    var track = el("div", "forge-ux99-track-056q");
    widgets.forEach(function (widget) {
      var card = el("article", "forge-ux99-card-056q");
      var top = el("div", "forge-ux99-card-top-056q");
      top.appendChild(el("div", "forge-ux99-kicker-056q", widget[0]));
      top.appendChild(el("div", "forge-ux99-score-056q", widget[1]));
      card.appendChild(top);
      card.appendChild(el("h3", "", widget[2]));
      card.appendChild(el("p", "", widget[3]));
      card.appendChild(el("p", "", widget[4]));
      track.appendChild(card);
    });
    viewport.appendChild(track);
    root.appendChild(viewport);

    var dots = el("div", "forge-ux99-dots-056q");
    dots.appendChild(el("span", "forge-ux99-glider-056q"));
    widgets.forEach(function (_widget, index) {
      var dot = el("button", "forge-ux99-dot-056q");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ver senal " + (index + 1));
      dot.addEventListener("click", function () { setIndex(root, dots, index); });
      dots.appendChild(dot);
    });
    root.appendChild(dots);

    var startX = 0;
    viewport.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) return;
      startX = event.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener("touchend", function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;
      var delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) < 34) return;
      var current = Number(root.dataset.index056q2 || "0");
      setIndex(root, dots, current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    setIndex(root, dots, 0);
    return root;
  }

  function replaceA() {
    var alfredCard = findAlfredCard();
    if (!alfredCard) return;
    Array.prototype.forEach.call(alfredCard.querySelectorAll("div,span,button"), function (node) {
      if (node.dataset.bowtie056q === "ready") return;
      if (txt(node) !== "A") return;
      var rect = node.getBoundingClientRect();
      if (rect.width < 30 || rect.width > 110 || rect.height < 30 || rect.height > 110) return;
      node.dataset.bowtie056q = "ready";
      node.classList.add("forge-ux99-a-bowtie-056q");
      node.innerHTML = bowtieSvg();
    });
  }

  function hideOldWidgets() {
    Array.prototype.forEach.call(document.querySelectorAll("#smart-widget-stack, .smart-widget-stack, .forge-smart-widget-pager-root-056l3, .forge-ux99-focus-root-056p, .forge-focus-root-056p2"), function (node) {
      if (!node.closest(".forge-ux99-focus-056q")) {
        node.classList.add("forge-ux99-hide-056q");
        node.setAttribute("aria-hidden", "true");
      }
    });
  }

  function ensureFocusMounted() {
    var existing = document.querySelector(".forge-ux99-focus-056q");
    var plan = findPlanCard();
    if (!existing) {
      existing = buildFocus();
    }

    if (plan && plan.parentElement) {
      if (existing.parentElement !== plan.parentElement || existing.previousElementSibling !== plan) {
        plan.insertAdjacentElement("afterend", existing);
      }
    } else if (!existing.parentElement) {
      var alfredCard = findAlfredCard();
      if (alfredCard && alfredCard.parentElement) {
        alfredCard.insertAdjacentElement("afterend", existing);
      } else {
        document.body.insertBefore(existing, document.body.firstElementChild || null);
      }
    }
    existing.classList.remove("forge-ux99-hide-056q");
    existing.removeAttribute("aria-hidden");
  }

  function mount() {
    if (!isMobile()) return;
    document.documentElement.classList.add("forge-ux99-hard-056q");
    ensureFocusMounted();
    hideOldWidgets();
    replaceA();
  }

  function schedule() {
    [50, 180, 420, 900, 1600, 3000, 5000].forEach(function (delay) {
      window.setTimeout(mount, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
})();
