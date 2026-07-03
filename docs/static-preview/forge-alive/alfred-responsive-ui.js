/* FORGEOS:ALFRED_RESPONSIVE_UI_056J:START */
(function () {
  const MOBILE_QUERY = "(max-width: 767px), (max-width: 900px) and (orientation: landscape)";

  function isMobileSurface() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function queryAny(selectors, root = document) {
    for (const selector of selectors) {
      const found = root.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  function ensureCommandInput(pill) {
    let input = queryAny([".command-pill-input", "input", "[role='textbox']", "[contenteditable='true']"], pill);
    if (!input) {
      input = document.createElement("div");
      input.className = "command-pill-input";
      input.setAttribute("role", "textbox");
      input.setAttribute("tabindex", "0");
      input.textContent = "Buscar o pedir a Alfred...";
      pill.appendChild(input);
    }
    return input;
  }

  function ensureCloseButton(pill) {
    let close = queryAny([".command-pill-close", "[data-command-close]"], pill);
    if (!close) {
      close = document.createElement("button");
      close.type = "button";
      close.className = "command-pill-close";
      close.setAttribute("aria-label", "Cerrar barra de Alfred");
      close.textContent = "×";
      pill.appendChild(close);
    }
    return close;
  }

  function initCommandBar() {
    const layer = queryAny([".command-orb-layer", "[data-command-orb-layer]"]);
    if (!layer) return;

    const pill = queryAny([".command-pill", "[data-command-pill]"], layer) || layer;
    const trigger = queryAny([".command-pill-slash", "[data-command-trigger]", "button"], layer) || pill;
    const input = ensureCommandInput(pill);
    const close = ensureCloseButton(pill);

    layer.classList.add("alfred-command-ready-056j");
    layer.setAttribute("data-command-state", "closed");

    function open() {
      if (!isMobileSurface()) return;
      layer.classList.add("is-open");
      layer.setAttribute("data-command-state", "open");
      window.setTimeout(() => {
        if (typeof input.focus === "function") input.focus({ preventScroll: true });
      }, 260);
    }

    function closeBar() {
      layer.classList.remove("is-open");
      layer.setAttribute("data-command-state", "closed");
      if (typeof input.blur === "function") input.blur();
    }

    function toggle(event) {
      if (!isMobileSurface()) return;
      if (event) event.preventDefault();
      if (layer.classList.contains("is-open")) {
        closeBar();
      } else {
        open();
      }
    }

    trigger.addEventListener("click", toggle);
    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeBar();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeBar();
    });

    window.addEventListener("resize", () => {
      if (!isMobileSurface()) closeBar();
    });
  }

  function getCards(carousel) {
    return Array.from(carousel.children).filter((child) => {
      return !child.classList.contains("smart-widget-mouse-controls") &&
        !child.classList.contains("smart-widget-dots-056i") &&
        !child.classList.contains("smart-widget-dots-056j");
    });
  }

  function ensureSmartWidgetDots() {
    const stack = queryAny([".smart-widget-stack", "#smart-widget-stack"]);
    const carousel = queryAny([".smart-widget-carousel"], stack || document);
    if (!stack || !carousel) return;

    stack.hidden = false;
    carousel.hidden = false;

    const cards = getCards(carousel);
    cards.forEach((card) => {
      card.hidden = false;
      card.removeAttribute("aria-hidden");
    });
    if (cards.length <= 1) return;

    let dots = stack.querySelector(".smart-widget-dots-056j");
    if (!dots) {
      dots = document.createElement("div");
      dots.className = "smart-widget-dots-056j";
      dots.setAttribute("aria-label", "Indicadores de contexto vivo");
      cards.forEach((card, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "smart-widget-dot-056j";
        button.setAttribute("aria-label", `Ver señal ${index + 1}`);
        button.addEventListener("click", () => {
          carousel.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
        });
        dots.appendChild(button);
      });
      stack.appendChild(dots);
    }

    const buttons = Array.from(dots.querySelectorAll(".smart-widget-dot-056j"));
    function update() {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let active = 0;
      let best = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const distance = Math.abs(center - (card.offsetLeft + card.offsetWidth / 2));
        if (distance < best) {
          best = distance;
          active = index;
        }
      });
      buttons.forEach((button, index) => {
        button.classList.toggle("is-active", index === active);
        button.setAttribute("aria-current", index === active ? "true" : "false");
      });
    }

    carousel.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function addBottomNavIcons() {
    const nav = queryAny([".bottom-nav"]);
    if (!nav) return;
    const icons = ["⌂", "◇", "◎", "⌘", "•••"];
    Array.from(nav.children).forEach((item, index) => {
      if (!item.getAttribute("data-icon")) {
        item.setAttribute("data-icon", icons[index] || "•");
      }
    });
  }

  function init() {
    document.documentElement.classList.add("alfred-responsive-ui-056j");
    initCommandBar();
    ensureSmartWidgetDots();
    addBottomNavIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
/* FORGEOS:ALFRED_RESPONSIVE_UI_056J:END */

/* FORGEOS:ALFRED_CONCIERGE_VISUAL_REPAIR_LITE_056K */
(function(){
  function ready(fn){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn,{once:true}):fn();}
  function q(s,r){return (r||document).querySelector(s);}
  function all(s,r){return Array.from((r||document).querySelectorAll(s));}

  function orb(){
    var layer=q(".command-orb-layer,[data-command-orb-layer]");
    if(!layer)return;
    var trigger=q(".command-pill-slash,[data-command-trigger],button",layer)||layer;
    var close=q(".command-pill-close,[data-command-close]",layer);
    var input=q(".command-pill-input,input,[role='textbox']",layer);
    layer.classList.add("alfred-concierge-orb-056k");
    trigger.setAttribute("aria-label","Abrir Alfred Concierge");
    trigger.setAttribute("title","Alfred Concierge");
    if(input){input.setAttribute("placeholder","Pide claridad a Alfred...");}
    function setOpen(v){
      layer.classList.toggle("is-open",v);
      layer.setAttribute("aria-expanded",v?"true":"false");
      if(v&&input&&input.blur)requestAnimationFrame(function(){input.blur();});
    }
    document.addEventListener("click",function(e){
      if(!layer.contains(e.target))return;
      if(input&&e.target===input&&layer.classList.contains("is-open"))return;
      if(close&&(e.target===close||close.contains(e.target))){
        e.preventDefault(); e.stopImmediatePropagation(); setOpen(false); return;
      }
      if(e.target===trigger||trigger.contains(e.target)||!layer.classList.contains("is-open")){
        e.preventDefault(); e.stopImmediatePropagation(); setOpen(!layer.classList.contains("is-open"));
      }
    },true);
  }

  function widgets(){
    var shell=q(".phone-shell")||document.body;
    var stack=q(".smart-widget-stack",shell);
    if(!stack){
      stack=document.createElement("section");
      stack.className="smart-widget-stack";
      stack.setAttribute("aria-label","Smart Widgets de Alfred");
      shell.appendChild(stack);
    }
    stack.hidden=false; stack.removeAttribute("hidden");
    var carousel=q(".smart-widget-carousel",stack);
    if(!carousel){
      carousel=document.createElement("div");
      carousel.className="smart-widget-carousel";
      stack.appendChild(carousel);
    }
    var cards=all(".smart-widget-card,.smart-widget-panel",carousel);
    if(cards.length===0){
      [["Seguimiento caliente","3 oportunidades requieren revisión antes de enfriarse."],["Razón clara","Alfred muestra evidencia y por qué actuar ahora."],["Preview segura","Sin envío, sin CRM y sin calendario real."]].forEach(function(x){
        var c=document.createElement("article");
        c.className="smart-widget-card";
        var h=document.createElement("h3"); h.textContent=x[0];
        var p=document.createElement("p"); p.textContent=x[1];
        c.appendChild(h); c.appendChild(p); carousel.appendChild(c);
      });
      cards=all(".smart-widget-card,.smart-widget-panel",carousel);
    }
    cards.forEach(function(c){c.hidden=false;c.removeAttribute("hidden");});
    var dots=q(".smart-widget-dots-056k",stack);
    if(!dots){dots=document.createElement("div");dots.className="smart-widget-dots-056k";stack.appendChild(dots);}
    dots.textContent="";
    cards.forEach(function(card,i){
      var b=document.createElement("button");
      b.type="button"; b.className="smart-widget-dot-056k"+(i===0?" is-active":"");
      b.setAttribute("aria-label","Ver Smart Widget "+(i+1));
      b.onclick=function(){card.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"}); all(".smart-widget-dot-056k",dots).forEach(function(d,j){d.classList.toggle("is-active",j===i);});};
      dots.appendChild(b);
    });
  }

  ready(function(){orb();widgets();setTimeout(widgets,300);setTimeout(widgets,900);});
})();

/* FORGEOS:ALFRED_COMMAND_BAR_INPUT_PILL_REPAIR_056K2 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function queryAny(selectors, root) {
    var scope = root || document;
    for (var i = 0; i < selectors.length; i += 1) {
      var node = scope.querySelector(selectors[i]);
      if (node) return node;
    }
    return null;
  }

  function ensureInputPill() {
    var layer = queryAny([".command-orb-layer", "[data-command-orb-layer]"]);
    if (!layer) return;

    var pill = queryAny([".command-pill", "[data-command-pill]"], layer) || layer;
    var trigger = queryAny([".command-pill-slash", "[data-command-trigger]", "button"], layer) || pill;
    var input = queryAny([".command-pill-input", "input", "[role='textbox']", "[contenteditable='true']"], pill);
    var close = queryAny([".command-pill-close", "[data-command-close]"], pill);
    var submit = queryAny([".command-pill-submit-056k2"], pill);

    layer.classList.add("alfred-command-input-pill-056k2");
    trigger.classList.add("alfred-bowtie-trigger-056k2");
    trigger.setAttribute("aria-label", "Abrir command bar de Alfred");
    trigger.setAttribute("title", "Alfred Concierge");

    if (!input) {
      input = document.createElement("input");
      input.type = "text";
      input.className = "command-pill-input";
      pill.insertBefore(input, trigger.nextSibling);
    }
    input.setAttribute("placeholder", "Pide claridad a Alfred...");
    input.setAttribute("aria-label", "Escribe un comando para Alfred");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("inputmode", "text");

    if (!close) {
      close = document.createElement("button");
      close.type = "button";
      close.className = "command-pill-close";
      close.textContent = "×";
      close.setAttribute("aria-label", "Cerrar command bar");
      pill.appendChild(close);
    }

    if (!submit) {
      submit = document.createElement("button");
      submit.type = "button";
      submit.className = "command-pill-submit-056k2";
      submit.textContent = "↵";
      submit.setAttribute("aria-label", "Revisar comando en modo solo lectura");
      pill.appendChild(submit);
    }

    function setOpen(open) {
      layer.classList.toggle("is-open", open);
      layer.setAttribute("aria-expanded", open ? "true" : "false");
      trigger.setAttribute("aria-label", open ? "Cerrar command bar de Alfred" : "Abrir command bar de Alfred");
      if (open) {
        window.setTimeout(function () {
          if (input && typeof input.focus === "function") input.focus({ preventScroll: true });
        }, 420);
      } else if (input && typeof input.blur === "function") {
        input.blur();
      }
    }

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !layer.contains(target)) return;

      if (target === input) return;

      if (close && (target === close || close.contains(target))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        return;
      }

      if (submit && (target === submit || submit.contains(target))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(true);
        if (input && typeof input.focus === "function") input.focus({ preventScroll: true });
        return;
      }

      if (target === trigger || trigger.contains(target) || !layer.classList.contains("is-open")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(!layer.classList.contains("is-open"));
      }
    }, true);
  }

  ready(function () {
    ensureInputPill();
    setTimeout(ensureInputPill, 300);
  });
})();

/* FORGEOS:ALFRED_COMMAND_BAR_MOBILE_HARD_RESET_056K3 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function buildCommandBar() {
    var oldRoot = document.querySelector(".alfred-command-root-056k3");
    if (oldRoot) return oldRoot;

    var root = document.createElement("section");
    root.className = "alfred-command-root-056k3";
    root.setAttribute("aria-label", "Alfred command bar");
    root.setAttribute("aria-expanded", "false");

    var shell = document.createElement("div");
    shell.className = "alfred-command-shell-056k3";

    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "alfred-command-launcher-056k3";
    launcher.setAttribute("aria-label", "Abrir Alfred Concierge");
    launcher.setAttribute("title", "Alfred Concierge");

    var input = document.createElement("input");
    input.type = "text";
    input.className = "alfred-command-input-056k3";
    input.placeholder = "Pide claridad a Alfred...";
    input.setAttribute("aria-label", "Escribe un comando para Alfred");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("inputmode", "text");

    var close = document.createElement("button");
    close.type = "button";
    close.className = "alfred-command-close-056k3";
    close.textContent = "X";
    close.setAttribute("aria-label", "Cerrar command bar");

    var submit = document.createElement("button");
    submit.type = "button";
    submit.className = "alfred-command-submit-056k3";
    submit.textContent = ">";
    submit.setAttribute("aria-label", "Revisar comando en modo solo lectura");

    shell.appendChild(launcher);
    shell.appendChild(input);
    shell.appendChild(close);
    shell.appendChild(submit);
    root.appendChild(shell);
    document.body.appendChild(root);

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      root.setAttribute("aria-expanded", open ? "true" : "false");
      launcher.setAttribute("aria-label", open ? "Cerrar Alfred Concierge" : "Abrir Alfred Concierge");
      if (open) {
        window.setTimeout(function () {
          input.focus({ preventScroll: true });
        }, 380);
      } else {
        input.blur();
      }
    }

    launcher.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(!root.classList.contains("is-open"));
    });

    close.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(false);
    });

    submit.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(true);
      input.focus({ preventScroll: true });
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    return root;
  }

  ready(function () {
    buildCommandBar();
    setTimeout(buildCommandBar, 300);
    setTimeout(buildCommandBar, 900);
  });
})();

/* FORGEOS:ALFRED_MOBILE_COMMAND_PALETTE_ACTIONS_056K4 */
(function () {
  "use strict";

  var actions = [
    { command: "/Llamar", label: "Llamar a Juan", detail: "Abre revisión de llamada. No marca en preview.", icon: "L" },
    { command: "/Mandar mensaje", label: "Mandar mensaje a Juan", detail: "Prepara borrador. No envía.", icon: "M" },
    { command: "/Follow", label: "Follow Juan", detail: "Crea plan de seguimiento. No crea tarea.", icon: "F" },
    { command: "/Agenda", label: "Revisar agenda con Juan", detail: "Preview de calendario. No crea evento.", icon: "A" },
    { command: "/Referido", label: "Pedir referido", detail: "Sugiere mensaje de referido. Revisión humana.", icon: "R" },
    { command: "/Juan", label: "Abrir contexto de Juan", detail: "Muestra contexto vivo de muestra.", icon: "J" }
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getMatches(query) {
    var q = normalize(query).replace(/^\//, "");
    if (!q) return actions.slice(0, 4);
    return actions.filter(function (action) {
      return normalize(action.command).indexOf(q) !== -1 ||
        normalize(action.label).indexOf(q) !== -1 ||
        normalize(action.detail).indexOf(q) !== -1;
    }).slice(0, 5);
  }

  function updateKeyboardInset() {
    var vv = window.visualViewport;
    var inset = 0;
    if (vv) {
      inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    }
    document.documentElement.style.setProperty("--alfred-056k4-keyboard", inset + "px");
    document.documentElement.classList.toggle("alfred-keyboard-open-056k4", inset > 80);
  }

  function buildCommandPalette() {
    var oldRoot = document.querySelector(".alfred-command-root-056k4");
    if (oldRoot) return oldRoot;

    var root = el("section", "alfred-command-root-056k4");
    root.setAttribute("aria-label", "Alfred command palette");
    root.setAttribute("aria-expanded", "false");

    var results = el("div", "alfred-command-results-056k4");
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "Resultados de comandos de Alfred");

    var shell = el("div", "alfred-command-shell-056k4");
    var launcher = el("button", "alfred-command-launcher-056k4");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Abrir Alfred Concierge");
    launcher.setAttribute("title", "Alfred Concierge");

    var mark = el("span", "alfred-command-mark-056k4");
    mark.setAttribute("aria-hidden", "true");
    launcher.appendChild(mark);

    var input = el("input", "alfred-command-input-056k4");
    input.type = "text";
    input.placeholder = "/Llamar, /Mandar mensaje, /Juan...";
    input.setAttribute("aria-label", "Escribe una accion para Alfred");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("inputmode", "text");

    var close = el("button", "alfred-command-close-056k4", "X");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar command palette");

    var submit = el("button", "alfred-command-submit-056k4", ">");
    submit.type = "button";
    submit.setAttribute("aria-label", "Revisar accion en modo solo lectura");

    shell.appendChild(launcher);
    shell.appendChild(input);
    shell.appendChild(close);
    shell.appendChild(submit);
    root.appendChild(results);
    root.appendChild(shell);
    document.body.appendChild(root);

    function renderResults() {
      var matches = getMatches(input.value);
      results.textContent = "";
      root.classList.toggle("has-query", input.value.trim().length > 0);
      root.classList.toggle("has-results", matches.length > 0);

      matches.forEach(function (match, index) {
        var button = el("button", "alfred-command-result-056k4" + (index === 0 ? " is-active" : ""));
        button.type = "button";
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");

        var icon = el("span", "alfred-result-icon-056k4", match.icon);
        var main = el("span", "alfred-result-main-056k4");
        var title = el("span", "alfred-result-title-056k4", match.command + " · " + match.label);
        var detail = el("span", "alfred-result-subtitle-056k4", match.detail);
        var lock = el("span", "alfred-result-lock-056k4", "Preview");

        main.appendChild(title);
        main.appendChild(detail);
        button.appendChild(icon);
        button.appendChild(main);
        button.appendChild(lock);

        button.addEventListener("click", function () {
          input.value = match.command + " ";
          input.focus({ preventScroll: true });
          renderResults();
        });
        results.appendChild(button);
      });
    }

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      root.setAttribute("aria-expanded", open ? "true" : "false");
      launcher.setAttribute("aria-label", open ? "Cerrar Alfred Concierge" : "Abrir Alfred Concierge");
      updateKeyboardInset();
      if (open) {
        renderResults();
        window.setTimeout(function () {
          input.focus({ preventScroll: true });
          updateKeyboardInset();
          renderResults();
        }, 280);
      } else {
        input.blur();
        root.classList.remove("has-query");
      }
    }

    launcher.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(!root.classList.contains("is-open"));
    });

    close.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(false);
    });

    submit.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(true);
      renderResults();
      input.focus({ preventScroll: true });
    });

    input.addEventListener("input", renderResults);
    input.addEventListener("focus", function () {
      setOpen(true);
      updateKeyboardInset();
      renderResults();
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateKeyboardInset, { passive: true });
      window.visualViewport.addEventListener("scroll", updateKeyboardInset, { passive: true });
    }
    window.addEventListener("resize", updateKeyboardInset, { passive: true });
    window.addEventListener("orientationchange", updateKeyboardInset, { passive: true });
    updateKeyboardInset();
    renderResults();
    return root;
  }

  ready(function () {
    buildCommandPalette();
    setTimeout(buildCommandPalette, 300);
    setTimeout(buildCommandPalette, 900);
  });
})();

/* FORGEOS:ALFRED_IOS_COMMAND_PALETTE_POLISH_056K5 */
(function () {
  "use strict";

  var actions = [
    { command: "/Llamar", label: "Llamar a Juan", detail: "Abre revision de llamada. No marca en preview.", icon: "L" },
    { command: "/Mandar mensaje", label: "Mandar mensaje a Juan", detail: "Prepara borrador. No envia.", icon: "M" },
    { command: "/Follow", label: "Follow Juan", detail: "Crea plan de seguimiento. No crea tarea.", icon: "F" },
    { command: "/Agenda", label: "Revisar agenda con Juan", detail: "Preview de calendario. No crea evento.", icon: "A" },
    { command: "/Referido", label: "Pedir referido", detail: "Sugiere mensaje de referido. Revision humana.", icon: "R" },
    { command: "/Juan", label: "Abrir contexto de Juan", detail: "Muestra contexto vivo de muestra.", icon: "J" }
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getMatches(query) {
    var q = normalize(query).replace(/^\//, "");
    if (!q) return [];
    return actions.filter(function (action) {
      return normalize(action.command).indexOf(q) !== -1 ||
        normalize(action.label).indexOf(q) !== -1 ||
        normalize(action.detail).indexOf(q) !== -1;
    }).slice(0, 5);
  }

  function updateKeyboardInset() {
    var vv = window.visualViewport;
    var inset = 0;
    if (vv) {
      inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    }
    document.documentElement.style.setProperty("--alfred-056k5-keyboard", inset + "px");
    document.documentElement.classList.toggle("alfred-keyboard-open-056k5", inset > 80);
  }

  function removeOlderRoots() {
    [".alfred-command-root-056k3", ".alfred-command-root-056k4"].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        node.setAttribute("hidden", "hidden");
        node.style.display = "none";
      });
    });
  }

  function buildCommandPalette() {
    removeOlderRoots();
    var oldRoot = document.querySelector(".alfred-command-root-056k5");
    if (oldRoot) return oldRoot;

    var root = el("section", "alfred-command-root-056k5");
    root.setAttribute("aria-label", "Alfred command palette");
    root.setAttribute("aria-expanded", "false");

    var results = el("div", "alfred-command-results-056k5");
    results.setAttribute("role", "listbox");
    results.setAttribute("aria-label", "Resultados de comandos de Alfred");

    var shell = el("div", "alfred-command-shell-056k5");
    var launcher = el("button", "alfred-command-launcher-056k5");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Abrir Alfred Concierge");
    launcher.setAttribute("title", "Alfred Concierge");

    var mark = el("span", "alfred-bowtie-mark-056k5");
    mark.setAttribute("aria-hidden", "true");
    var knot = el("span", "alfred-bowtie-knot-056k5");
    mark.appendChild(knot);
    launcher.appendChild(mark);

    var input = el("input", "alfred-command-input-056k5");
    input.type = "text";
    input.placeholder = "/Llamar, /Mandar mensaje, /Juan...";
    input.setAttribute("aria-label", "Escribe una accion para Alfred");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("inputmode", "text");

    var close = el("button", "alfred-command-close-056k5", "X");
    close.type = "button";
    close.setAttribute("aria-label", "Cerrar command palette");

    var submit = el("button", "alfred-command-submit-056k5", ">");
    submit.type = "button";
    submit.setAttribute("aria-label", "Revisar accion en modo solo lectura");

    shell.appendChild(launcher);
    shell.appendChild(input);
    shell.appendChild(close);
    shell.appendChild(submit);
    root.appendChild(results);
    root.appendChild(shell);
    document.body.appendChild(root);

    function renderResults() {
      var query = input.value.trim();
      var matches = getMatches(query);
      results.textContent = "";
      root.classList.toggle("has-query", query.length > 0);
      root.classList.toggle("has-results", query.length > 0 && matches.length > 0);

      if (!query) return;

      matches.forEach(function (match, index) {
        var button = el("button", "alfred-command-result-056k5" + (index === 0 ? " is-active" : ""));
        button.type = "button";
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");

        var icon = el("span", "alfred-result-icon-056k5", match.icon);
        var main = el("span", "alfred-result-main-056k5");
        var title = el("span", "alfred-result-title-056k5", match.command + " · " + match.label);
        var detail = el("span", "alfred-result-subtitle-056k5", match.detail);
        var lock = el("span", "alfred-result-lock-056k5", "Preview");

        main.appendChild(title);
        main.appendChild(detail);
        button.appendChild(icon);
        button.appendChild(main);
        button.appendChild(lock);

        button.addEventListener("click", function () {
          input.value = match.command + " ";
          input.focus({ preventScroll: true });
          renderResults();
        });
        results.appendChild(button);
      });
    }

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      root.setAttribute("aria-expanded", open ? "true" : "false");
      launcher.setAttribute("aria-label", open ? "Cerrar Alfred Concierge" : "Abrir Alfred Concierge");
      updateKeyboardInset();
      if (open) {
        renderResults();
        window.setTimeout(function () {
          input.focus({ preventScroll: true });
          updateKeyboardInset();
          renderResults();
        }, 300);
      } else {
        input.blur();
        root.classList.remove("has-query");
        root.classList.remove("has-results");
      }
    }

    launcher.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(!root.classList.contains("is-open"));
    });

    close.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(false);
    });

    submit.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(true);
      input.focus({ preventScroll: true });
      renderResults();
    });

    input.addEventListener("input", renderResults);
    input.addEventListener("focus", function () {
      root.classList.add("is-open");
      updateKeyboardInset();
      renderResults();
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateKeyboardInset, { passive: true });
      window.visualViewport.addEventListener("scroll", updateKeyboardInset, { passive: true });
    }
    window.addEventListener("resize", updateKeyboardInset, { passive: true });
    window.addEventListener("orientationchange", updateKeyboardInset, { passive: true });
    updateKeyboardInset();
    renderResults();
    return root;
  }

  ready(function () {
    buildCommandPalette();
    setTimeout(buildCommandPalette, 300);
    setTimeout(buildCommandPalette, 900);
  });
})();

/* FORGEOS:COMMAND_CLOSE_NAV_PILL_POLISH_056K6 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function svgPath(d, viewBox) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox || "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
    return svg;
  }

  var navIcons = [
    "M3 10.8 12 3l9 7.8M5.5 10v10h13V10M9 20v-6h6v6",
    "M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5",
    "M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6ZM12 2v3M12 19v3M2 12h3M19 12h3",
    "M7 7.5 11 11l1-2 1 2 4-3.5-2.2 4.5L17 16.5 13 13l-1 2-1-2-4 3.5 2.2-4.5L7 7.5Z",
    "M5 12h.01M12 12h.01M19 12h.01"
  ];

  function polishNav() {
    var nav = document.querySelector(".bottom-nav");
    if (!nav || nav.classList.contains("forge-nav-polished-056k6")) return;

    nav.classList.add("forge-nav-polished-056k6");
    var labels = ["Inicio", "Pipeline", "Clientes", "Alfred", "Mas"];
    var items = Array.prototype.slice.call(nav.children).filter(function (node) {
      return node.nodeType === 1;
    }).slice(0, 5);

    items.forEach(function (item, index) {
      var rawText = (item.textContent || labels[index] || "").trim();
      var label = labels[index] || rawText || "Nav";
      item.textContent = "";
      item.classList.add("forge-nav-item-056k6");
      if (index === 3) {
        item.classList.add("is-active-056k6");
        item.setAttribute("aria-current", "page");
      }

      var iconWrap = document.createElement("span");
      iconWrap.className = "forge-nav-icon-056k6";
      iconWrap.appendChild(svgPath(navIcons[index] || navIcons[4]));

      var labelWrap = document.createElement("span");
      labelWrap.className = "forge-nav-label-056k6";
      labelWrap.textContent = label;

      item.appendChild(iconWrap);
      item.appendChild(labelWrap);
    });
  }

  function refineCommandResults() {
    var root = document.querySelector(".alfred-command-root-056k5");
    if (!root) return;
    var input = root.querySelector(".alfred-command-input-056k5");
    var results = root.querySelector(".alfred-command-results-056k5");
    if (!input || !results || root.dataset.refined056k6 === "true") return;
    root.dataset.refined056k6 = "true";

    function prune() {
      var query = String(input.value || "").trim().replace(/^\//, "").toLowerCase();
      var buttons = Array.prototype.slice.call(results.querySelectorAll(".alfred-command-result-056k5"));
      var keepCount = 0;
      buttons.forEach(function (button) {
        var title = (button.querySelector(".alfred-result-title-056k5") || button).textContent.toLowerCase();
        var commandText = title.split("·")[0].replace("/", "").trim();
        var keep = query.length > 0 && commandText.indexOf(query) === 0 && keepCount < 3;
        button.style.display = keep ? "" : "none";
        if (keep) keepCount += 1;
      });
      root.classList.toggle("has-query", query.length > 0);
      root.classList.toggle("has-results", keepCount > 0);
    }

    input.addEventListener("input", function () {
      window.requestAnimationFrame(prune);
    });

    var observer = new MutationObserver(function () {
      prune();
    });
    observer.observe(results, { childList: true, subtree: true });
    prune();
  }

  ready(function () {
    polishNav();
    refineCommandResults();
    setTimeout(polishNav, 300);
    setTimeout(refineCommandResults, 300);
    setTimeout(polishNav, 900);
    setTimeout(refineCommandResults, 900);
  });
})();

/* FORGEOS:NAVIGATION_PILL_HARD_RESET_056K7 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function svgNode(paths, viewBox) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox || "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    paths.forEach(function (d) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function replaceBowTie() {
    var launcher = document.querySelector(".alfred-command-launcher-056k5");
    if (!launcher || launcher.querySelector(".alfred-bowtie-mark-056k7")) return;

    var old = launcher.querySelector(".alfred-bowtie-mark-056k5, .alfred-command-mark-056k4");
    if (old) old.setAttribute("hidden", "hidden");

    var wrap = document.createElement("span");
    wrap.className = "alfred-bowtie-mark-056k7";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = [
      '<svg viewBox="0 0 80 52" aria-hidden="true">',
      '<path d="M5 12 C15 5 28 10 36 21 L36 31 C28 42 15 47 5 40 C11 31 11 21 5 12Z" fill="#071224"/>',
      '<path d="M75 12 C65 5 52 10 44 21 L44 31 C52 42 65 47 75 40 C69 31 69 21 75 12Z" fill="#071224"/>',
      '<rect x="34" y="17" width="12" height="18" rx="6" fill="#F5F8FF"/>',
      '<rect x="37" y="20" width="6" height="12" rx="3" fill="#BDEEFF"/>',
      '<path d="M9 14 C17 10 27 13 34 22" stroke="#F7D584" stroke-opacity=".22" stroke-width="2" fill="none"/>',
      '<path d="M71 14 C63 10 53 13 46 22" stroke="#F7D584" stroke-opacity=".22" stroke-width="2" fill="none"/>',
      '</svg>'
    ].join("");
    launcher.appendChild(wrap);
  }

  function buildNav() {
    if (document.querySelector(".forge-nav-root-056k7")) return;

    var oldNav = document.querySelector(".bottom-nav");
    if (oldNav) {
      oldNav.setAttribute("aria-hidden", "true");
    }

    var nav = document.createElement("nav");
    nav.className = "forge-nav-root-056k7";
    nav.setAttribute("aria-label", "Forge navigation");

    var items = [
      { label: "Inicio", icon: ["M3 10.8 12 3l9 7.8", "M5.5 10v10h13V10", "M9 20v-6h6v6"] },
      { label: "Pipeline", icon: ["M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5"] },
      { label: "Clientes", icon: ["M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z", "M12 2v3M12 19v3M2 12h3M19 12h3"] },
      { label: "Alfred", active: true, icon: ["M7 7.5 11 11l1-2 1 2 4-3.5", "M7 16.5 11 13l1 2 1-2 4 3.5"] },
      { label: "Mas", icon: ["M5 12h.01M12 12h.01M19 12h.01"] }
    ];

    items.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "forge-nav-item-056k7" + (item.active ? " is-active" : "");
      if (item.active) button.setAttribute("aria-current", "page");
      button.setAttribute("aria-label", item.label);

      var icon = document.createElement("span");
      icon.className = "forge-nav-icon-056k7";
      icon.appendChild(svgNode(item.icon));

      var label = document.createElement("span");
      label.className = "forge-nav-label-056k7";
      label.textContent = item.label;

      button.appendChild(icon);
      button.appendChild(label);
      nav.appendChild(button);
    });

    document.body.appendChild(nav);
  }

  function commandResultsOnlyTyped() {
    var root = document.querySelector(".alfred-command-root-056k5");
    var input = root && root.querySelector(".alfred-command-input-056k5");
    var results = root && root.querySelector(".alfred-command-results-056k5");
    if (!root || !input || !results || root.dataset.filtered056k7 === "true") return;
    root.dataset.filtered056k7 = "true";

    function filter() {
      var query = String(input.value || "").trim().replace(/^\//, "").toLowerCase();
      var buttons = Array.prototype.slice.call(results.querySelectorAll(".alfred-command-result-056k5"));
      var shown = 0;
      buttons.forEach(function (button) {
        var titleNode = button.querySelector(".alfred-result-title-056k5");
        var title = String((titleNode || button).textContent || "").toLowerCase();
        var command = title.split("·")[0].replace("/", "").trim();
        var keep = query.length > 0 && command.indexOf(query) === 0 && shown < 3;
        button.style.display = keep ? "" : "none";
        if (keep) shown += 1;
      });
      root.classList.toggle("has-query", query.length > 0);
      root.classList.toggle("has-results", shown > 0);
    }

    input.addEventListener("input", function () {
      window.requestAnimationFrame(filter);
    });
    new MutationObserver(filter).observe(results, { childList: true, subtree: true });
    filter();
  }

  ready(function () {
    buildNav();
    replaceBowTie();
    commandResultsOnlyTyped();
    setTimeout(buildNav, 300);
    setTimeout(replaceBowTie, 300);
    setTimeout(commandResultsOnlyTyped, 300);
    setTimeout(buildNav, 900);
    setTimeout(replaceBowTie, 900);
    setTimeout(commandResultsOnlyTyped, 900);
  });
})();

/* FORGEOS:NAV_MARK_MOTION_MICRO_POLISH_056K8 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function updateIndicator(nav, active) {
    if (!nav || !active) return;
    var navRect = nav.getBoundingClientRect();
    var itemRect = active.getBoundingClientRect();
    var x = Math.max(9, itemRect.left - navRect.left);
    nav.style.setProperty("--forge-nav-indicator-x-056k8", x + "px");
  }

  function addNavMotion() {
    var nav = document.querySelector(".forge-nav-root-056k7");
    if (!nav || nav.dataset.motion056k8 === "true") return;
    nav.dataset.motion056k8 = "true";

    var items = Array.prototype.slice.call(nav.querySelectorAll(".forge-nav-item-056k7"));
    var active = nav.querySelector(".forge-nav-item-056k7.is-active") || items[3] || items[0];
    if (active) {
      items.forEach(function (item) {
        item.classList.toggle("is-active", item === active);
        if (item === active) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      });
      updateIndicator(nav, active);
    }

    items.forEach(function (item) {
      item.addEventListener("pointerdown", function () {
        item.classList.add("is-pressing-056k8");
      });
      item.addEventListener("pointerup", function () {
        item.classList.remove("is-pressing-056k8");
      });
      item.addEventListener("pointercancel", function () {
        item.classList.remove("is-pressing-056k8");
      });
      item.addEventListener("click", function () {
        items.forEach(function (node) {
          node.classList.toggle("is-active", node === item);
          if (node === item) node.setAttribute("aria-current", "page");
          else node.removeAttribute("aria-current");
        });
        nav.classList.add("is-switching-056k8");
        updateIndicator(nav, item);
        window.setTimeout(function () {
          nav.classList.remove("is-switching-056k8");
        }, 540);
      });
    });

    window.addEventListener("resize", function () {
      var selected = nav.querySelector(".forge-nav-item-056k7.is-active");
      updateIndicator(nav, selected);
    }, { passive: true });
  }

  function refineBowTieSvg() {
    var mark = document.querySelector(".alfred-bowtie-mark-056k7");
    if (!mark || mark.dataset.refined056k8 === "true") return;
    mark.dataset.refined056k8 = "true";
    mark.innerHTML = [
      '<svg viewBox="0 0 84 52" aria-hidden="true">',
      '<path class="alfred-bowtie-wing-056k8" d="M6 14 C15 7 27 11 36 21 L36 31 C27 41 15 45 6 38 C11 30 11 22 6 14Z"/>',
      '<path class="alfred-bowtie-wing-056k8" d="M78 14 C69 7 57 11 48 21 L48 31 C57 41 69 45 78 38 C73 30 73 22 78 14Z"/>',
      '<rect x="36.5" y="17" width="11" height="18" rx="5.5" fill="#F5F8FF"/>',
      '<rect x="39.5" y="20" width="5" height="12" rx="2.5" fill="#BDEEFF"/>',
      '<path d="M10 16 C18 12 27 15 34 23" stroke="#F7D584" stroke-opacity=".18" stroke-width="2" fill="none"/>',
      '<path d="M74 16 C66 12 57 15 50 23" stroke="#F7D584" stroke-opacity=".18" stroke-width="2" fill="none"/>',
      '</svg>'
    ].join("");
  }

  ready(function () {
    addNavMotion();
    refineBowTieSvg();
    setTimeout(addNavMotion, 300);
    setTimeout(refineBowTieSvg, 300);
    setTimeout(addNavMotion, 900);
    setTimeout(refineBowTieSvg, 900);
  });
})();

/* FORGEOS:NAV_CENTER_ICONS_PREMIUM_POLISH_056K9 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function svg(markup) {
    var template = document.createElement("template");
    template.innerHTML = markup.trim();
    return template.content.firstChild;
  }

  var premiumIcons = [
    '<svg viewBox="0 0 28 28" aria-hidden="true"><path class="forge-nav-premium-fill-056k9" d="M5.5 12.2 14 5l8.5 7.2v10.3a1.4 1.4 0 0 1-1.4 1.4h-5.2v-6.5h-3.8v6.5H6.9a1.4 1.4 0 0 1-1.4-1.4Z"/><path class="forge-nav-premium-stroke-056k9" d="M4.8 12.5 14 4.7l9.2 7.8"/><path class="forge-nav-premium-stroke-056k9" d="M7.2 11.7v10.5h5v-6h3.6v6h5V11.7"/></svg>',
    '<svg viewBox="0 0 28 28" aria-hidden="true"><path class="forge-nav-premium-fill-056k9" d="M14 4.8 23.2 14 14 23.2 4.8 14Z"/><path class="forge-nav-premium-stroke-056k9" d="M14 4.8 23.2 14 14 23.2 4.8 14Z"/><path class="forge-nav-premium-stroke-056k9" d="M10.2 14h7.6"/></svg>',
    '<svg viewBox="0 0 28 28" aria-hidden="true"><circle class="forge-nav-premium-fill-056k9" cx="14" cy="14" r="5.6"/><circle class="forge-nav-premium-stroke-056k9" cx="14" cy="14" r="4.2"/><path class="forge-nav-premium-stroke-056k9" d="M14 4.8v3M14 20.2v3M4.8 14h3M20.2 14h3"/><path class="forge-nav-premium-stroke-056k9" d="m7.6 7.6 2.1 2.1M18.3 18.3l2.1 2.1M20.4 7.6l-2.1 2.1M9.7 18.3l-2.1 2.1"/></svg>',
    '<svg viewBox="0 0 28 28" aria-hidden="true"><path class="forge-nav-premium-fill-056k9" d="M5.8 9.4c2.9-2 6.4-.8 8.2 2.2 1.8-3 5.3-4.2 8.2-2.2-1.4 2.7-1.4 6.5 0 9.2-2.9 2-6.4.8-8.2-2.2-1.8 3-5.3 4.2-8.2 2.2 1.4-2.7 1.4-6.5 0-9.2Z"/><path class="forge-nav-premium-stroke-056k9" d="M6.4 9.7c2.6-1.7 5.7-.5 7.6 2.7 1.9-3.2 5-4.4 7.6-2.7-1.2 2.5-1.2 6.1 0 8.6-2.6 1.7-5.7.5-7.6-2.7-1.9 3.2-5 4.4-7.6 2.7 1.2-2.5 1.2-6.1 0-8.6Z"/><path class="forge-nav-premium-stroke-056k9" d="M14 11.8v4.4"/></svg>',
    '<svg viewBox="0 0 28 28" aria-hidden="true"><path class="forge-nav-premium-fill-056k9" d="M7 10.5h14a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 1 0-7Z"/><path class="forge-nav-premium-stroke-056k9" d="M8.2 14h.1M14 14h.1M19.8 14h.1"/></svg>'
  ];

  function centerIndicator(nav, item) {
    if (!nav || !item) return;
    var left = item.offsetLeft;
    var width = item.offsetWidth;
    nav.style.setProperty("--forge-nav-indicator-left-056k9", left + "px");
    nav.style.setProperty("--forge-nav-indicator-width-056k9", width + "px");
  }

  function polishIconsAndCenter() {
    var nav = document.querySelector(".forge-nav-root-056k7");
    if (!nav) return;
    var items = Array.prototype.slice.call(nav.querySelectorAll(".forge-nav-item-056k7"));
    if (!items.length) return;

    items.forEach(function (item, index) {
      var icon = item.querySelector(".forge-nav-icon-056k7");
      if (icon && icon.dataset.premium056k9 !== "true") {
        icon.textContent = "";
        icon.appendChild(svg(premiumIcons[index] || premiumIcons[4]));
        icon.dataset.premium056k9 = "true";
      }

      if (item.dataset.center056k9 !== "true") {
        item.dataset.center056k9 = "true";
        item.addEventListener("click", function () {
          items.forEach(function (node) {
            node.classList.toggle("is-active", node === item);
            if (node === item) node.setAttribute("aria-current", "page");
            else node.removeAttribute("aria-current");
          });
          nav.classList.add("is-switching-056k9");
          centerIndicator(nav, item);
          window.setTimeout(function () {
            nav.classList.remove("is-switching-056k9");
          }, 540);
        });
      }
    });

    var active = nav.querySelector(".forge-nav-item-056k7.is-active") || items[3] || items[0];
    centerIndicator(nav, active);
  }

  ready(function () {
    polishIconsAndCenter();
    setTimeout(polishIconsAndCenter, 300);
    setTimeout(polishIconsAndCenter, 900);
    window.addEventListener("resize", polishIconsAndCenter, { passive: true });
    window.addEventListener("orientationchange", polishIconsAndCenter, { passive: true });
  });
})();


/* FORGEOS:ALFRED_MOBILE_SMART_WIDGET_PAGER_056L */
(function () {
  "use strict";

  var SAMPLE_WIDGETS_056L = [
    {
      kicker: "Seguimiento",
      title: "Seguimiento prioritario",
      body: "3 oportunidades de muestra necesitan revision antes de enfriarse.",
      limit: "Muestra segura. No CRM. No envio."
    },
    {
      kicker: "Por que ahora",
      title: "Senales para decidir",
      body: "Hay conversaciones abiertas con contexto suficiente para revisar siguiente accion.",
      limit: "La urgencia es una senal, no una decision."
    },
    {
      kicker: "Incertidumbre",
      title: "Falta juicio humano",
      body: "El humano define tono, momento y aprobacion antes de ejecutar.",
      limit: "Forge no inventa verdad ni reemplaza criterio."
    },
    {
      kicker: "Siguiente revision",
      title: "Abrir plan de accion",
      body: "Usa Alfred para revisar comandos como /Follow Juan o /Mandar mensaje.",
      limit: "Preview only. Toda accion requiere aprobacion."
    }
  ];

  function isMobileSmartWidgetViewport056L() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el056L(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function isWidgetCard056L(node) {
    if (!node || node.nodeType !== 1) return false;
    if (node.classList.contains("smart-widget-dots-056l")) return false;
    if (node.classList.contains("smart-widget-dots-056j")) return false;
    if (node.classList.contains("smart-widget-dots-056i")) return false;
    if (node.classList.contains("smart-widget-mouse-controls")) return false;
    if (node.classList.contains("forge-smart-widget-header-056l")) return false;
    return node.matches(".smart-widget-card, .smart-widget-panel, article, .context-card, .signal-card");
  }

  function createFallbackCard056L(widget) {
    var card = el056L("article", "smart-widget-card forge-smart-widget-page-056l");
    card.setAttribute("data-smart-widget-fallback-056l", "safe-sample");
    card.appendChild(el056L("div", "forge-smart-widget-kicker-056l", widget.kicker));
    card.appendChild(el056L("h3", "smart-widget-title", widget.title));
    card.appendChild(el056L("p", "smart-widget-subtitle", widget.body));
    card.appendChild(el056L("p", "smart-widget-uncertainty", widget.limit));
    return card;
  }

  function ensureHeader056L(stack) {
    if (stack.querySelector(".forge-smart-widget-header-056l")) return;
    var header = el056L("div", "forge-smart-widget-header-056l");
    var copy = el056L("div");
    copy.appendChild(el056L("div", "forge-smart-widget-eyebrow-056l", "Contexto vivo"));
    copy.appendChild(el056L("div", "forge-smart-widget-title-056l", "Senales inteligentes"));
    header.appendChild(copy);
    header.appendChild(el056L("div", "forge-smart-widget-state-056l", "Solo lectura"));
    stack.insertBefore(header, stack.firstChild);
  }

  function normalizeCards056L(stack) {
    var carousel = stack.querySelector(".smart-widget-carousel");
    var cards = [];

    if (carousel) {
      cards = Array.prototype.filter.call(carousel.children, isWidgetCard056L);
    }

    if (!cards.length) {
      cards = Array.prototype.filter.call(stack.querySelectorAll(".smart-widget-card, .smart-widget-panel, article"), function (node) {
        return isWidgetCard056L(node) && !node.closest(".smart-widget-dots-056l");
      });
    }

    if (!carousel) {
      carousel = el056L("div", "smart-widget-carousel forge-smart-widget-carousel-056l");
      stack.appendChild(carousel);
    }

    carousel.classList.add("forge-smart-widget-carousel-056l");
    carousel.setAttribute("aria-label", "Senales inteligentes");

    cards = cards.slice(0, 4);
    cards.forEach(function (card) {
      if (card.parentElement !== carousel) carousel.appendChild(card);
    });

    while (cards.length < 4) {
      var fallback = createFallbackCard056L(SAMPLE_WIDGETS_056L[cards.length]);
      carousel.appendChild(fallback);
      cards.push(fallback);
    }

    Array.prototype.forEach.call(carousel.children, function (child, index) {
      if (!isWidgetCard056L(child)) return;
      if (cards.indexOf(child) === -1 || index > 3) {
        child.hidden = true;
        child.style.display = "none";
        return;
      }
      child.hidden = false;
      child.style.display = "";
      child.classList.add("forge-smart-widget-page-056l");
      child.setAttribute("role", "group");
      child.setAttribute("aria-roledescription", "tarjeta");
      child.setAttribute("aria-label", "Senal " + (cards.indexOf(child) + 1) + " de 4");
    });

    return { carousel: carousel, cards: cards };
  }

  function buildDots056L(stack, carousel, cards) {
    var existing = stack.querySelector(".smart-widget-dots-056l");
    if (existing) existing.remove();

    var dots = el056L("div", "smart-widget-dots-056l");
    dots.setAttribute("aria-label", "Indicador de senales inteligentes");
    dots.style.setProperty("--forge-smart-dot-progress-056l", "0");
    dots.style.setProperty("--forge-smart-dot-index-056l", "0");

    var glider = el056L("span", "smart-widget-dot-glider-056l");
    glider.setAttribute("aria-hidden", "true");
    dots.appendChild(glider);

    cards.forEach(function (_card, index) {
      var button = el056L("button", "smart-widget-dot-056l");
      button.type = "button";
      button.setAttribute("aria-label", "Ver senal " + (index + 1));
      button.addEventListener("click", function () {
        carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
      });
      dots.appendChild(button);
    });

    carousel.insertAdjacentElement("afterend", dots);
    return dots;
  }

  function updateSmartWidgetDots056L(dots, cards, activeIndex, progress) {
    var previous = Number(dots.style.getPropertyValue("--forge-smart-dot-progress-056l") || "0");
    dots.style.setProperty("--forge-smart-dot-progress-056l", String(progress));
    dots.style.setProperty("--forge-smart-dot-index-056l", String(activeIndex));
    dots.classList.toggle("is-moving-right-056l", progress >= previous);
    dots.classList.toggle("is-moving-left-056l", progress < previous);

    window.clearTimeout(dots._forgeSmartWidgetDropTimer056L);
    dots._forgeSmartWidgetDropTimer056L = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056l", "is-moving-left-056l");
    }, 240);

    cards.forEach(function (card, index) {
      card.classList.toggle("is-active-056l", index === activeIndex);
    });

    Array.prototype.forEach.call(dots.querySelectorAll(".smart-widget-dot-056l"), function (button, index) {
      button.classList.toggle("is-active-056l", index === activeIndex);
      button.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  }

  function wirePager056L(carousel, dots, cards) {
    var raf = 0;
    var sync = function () {
      raf = 0;
      var width = carousel.clientWidth || 1;
      var max = Math.max(0, cards.length - 1);
      var raw = Math.max(0, Math.min(max, carousel.scrollLeft / width));
      var active = Math.max(0, Math.min(max, Math.round(raw)));
      updateSmartWidgetDots056L(dots, cards, active, raw);
    };

    carousel.addEventListener("scroll", function () {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener("resize", function () {
      window.requestAnimationFrame(sync);
    }, { passive: true });

    sync();
  }

  function mountSmartWidgetPager056L() {
    if (!isMobileSmartWidgetViewport056L()) return;
    var stack = document.getElementById("smart-widget-stack") || document.querySelector(".smart-widget-stack");
    if (!stack || stack.dataset.smartWidgetPager056l === "ready") return;
    stack.dataset.smartWidgetPager056l = "ready";
    stack.hidden = false;
    stack.removeAttribute("hidden");
    ensureHeader056L(stack);
    var normalized = normalizeCards056L(stack);
    var dots = buildDots056L(stack, normalized.carousel, normalized.cards);
    wirePager056L(normalized.carousel, dots, normalized.cards);
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(mountSmartWidgetPager056L, 80);
    window.setTimeout(mountSmartWidgetPager056L, 420);
  });
  window.addEventListener("load", function () {
    window.setTimeout(mountSmartWidgetPager056L, 160);
  });
})();


/* FORGEOS:ALFRED_MOBILE_SMART_WIDGET_PAGER_DOTS_REPAIR_056L2 */
(function () {
  "use strict";

  var cards056L2 = [
    {
      kicker: "Seguimiento",
      score: "86",
      title: "Seguimiento prioritario",
      body: "Relacion abierta con riesgo de enfriarse.",
      why: "Por que ahora: hay senales de seguimiento pendiente.",
      limit: "Incertidumbre: el humano decide tono y momento.",
      chips: ["Autoridad humana", "Solo revision"]
    },
    {
      kicker: "Decision",
      score: "78",
      title: "Senales para decidir",
      body: "Forge muestra contexto para ordenar criterio antes de actuar.",
      why: "Por que ahora: hay oportunidades que pueden perder temperatura.",
      limit: "Senal no es decision. Contexto no es verdad.",
      chips: ["Contexto vivo", "Sin ejecucion"]
    },
    {
      kicker: "Juicio",
      score: "92",
      title: "Falta contexto",
      body: "Primero mejora el juicio; luego decide si vale la pena actuar.",
      why: "Por que ahora: la incertidumbre pesa mas que ejecutar rapido.",
      limit: "Unknown no es cero. Alfred no inventa evidencia.",
      chips: ["Hold humano", "Ley cero"]
    },
    {
      kicker: "Siguiente revision",
      score: "80",
      title: "Abrir plan de accion",
      body: "Usa Alfred para revisar comandos como /Follow Juan o /Mandar mensaje.",
      why: "Por que ahora: la command bar convierte intencion en preview revisable.",
      limit: "Preview only. Toda accion requiere aprobacion.",
      chips: ["Preview", "No envio"]
    }
  ];

  function isMobile056L2() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el056L2(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function renderCard056L2(card, index) {
    var article = el056L2("article", "forge-smart-widget-card-056l2");
    article.setAttribute("role", "group");
    article.setAttribute("aria-label", "Senal inteligente " + (index + 1) + " de 4");

    var top = el056L2("div", "forge-smart-widget-card-top-056l2");
    top.appendChild(el056L2("div", "forge-smart-widget-kicker-056l2", card.kicker));
    var score = el056L2("div", "forge-smart-widget-score-056l2");
    score.appendChild(el056L2("strong", "", card.score));
    score.appendChild(el056L2("span", "", "senal"));
    top.appendChild(score);
    article.appendChild(top);

    article.appendChild(el056L2("h3", "", card.title));
    article.appendChild(el056L2("p", "forge-smart-widget-body-056l2", card.body));

    var chips = el056L2("div", "forge-smart-widget-chips-056l2");
    card.chips.forEach(function (chip) {
      chips.appendChild(el056L2("span", "forge-smart-widget-chip-056l2", chip));
    });
    article.appendChild(chips);

    article.appendChild(el056L2("p", "forge-smart-widget-why-056l2", card.why));
    article.appendChild(el056L2("p", "forge-smart-widget-limit-056l2", card.limit));
    return article;
  }

  function clearLegacySmartWidgetDots056L2(stack) {
    Array.prototype.forEach.call(stack.querySelectorAll(
      ".smart-widget-dots, .smart-widget-dots-056i, .smart-widget-dots-056j, .smart-widget-dots-056l, .smart-widget-mouse-controls"
    ), function (node) {
      if (!node.closest(".forge-smart-widget-pager-root-056l2")) {
        node.setAttribute("hidden", "true");
        node.style.display = "none";
      }
    });
  }

  function mountSmartWidgetPager056L2() {
    if (!isMobile056L2()) return;
    var stack = document.getElementById("smart-widget-stack") || document.querySelector(".smart-widget-stack");
    if (!stack) return;

    clearLegacySmartWidgetDots056L2(stack);

    var existing = stack.querySelector(".forge-smart-widget-pager-root-056l2");
    if (existing) return;

    stack.classList.add("forge-smart-widget-stack-normalized-056l2");
    stack.hidden = false;
    stack.removeAttribute("hidden");

    var root = el056L2("section", "forge-smart-widget-pager-root-056l2");
    root.setAttribute("aria-label", "Senales inteligentes");
    root.style.setProperty("--forge-smart-widget-index-056l2", "0");

    var heading = el056L2("header", "forge-smart-widget-heading-056l2");
    heading.appendChild(el056L2("div", "forge-smart-widget-eyebrow-056l2", "Contexto vivo"));
    heading.appendChild(el056L2("h2", "", "Senales para decidir"));
    heading.appendChild(el056L2("p", "", "Forge muestra contexto; el humano decide."));
    root.appendChild(heading);

    var viewport = el056L2("div", "forge-smart-widget-viewport-056l2");
    var track = el056L2("div", "forge-smart-widget-track-056l2");
    cards056L2.forEach(function (card, index) {
      track.appendChild(renderCard056L2(card, index));
    });
    viewport.appendChild(track);
    root.appendChild(viewport);

    var dots = el056L2("div", "forge-smart-widget-dots-056l2");
    dots.setAttribute("aria-label", "Indicador de senales inteligentes");
    var glider = el056L2("span", "forge-smart-widget-glider-056l2");
    glider.setAttribute("aria-hidden", "true");
    dots.appendChild(glider);
    cards056L2.forEach(function (_card, index) {
      var dot = el056L2("button", "forge-smart-widget-dot-056l2");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ver senal " + (index + 1));
      dot.addEventListener("click", function () {
        setIndex056L2(root, dots, index);
      });
      dots.appendChild(dot);
    });
    root.appendChild(dots);
    stack.appendChild(root);

    var touchStartX = 0;
    viewport.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) return;
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener("touchend", function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;
      var delta = event.changedTouches[0].clientX - touchStartX;
      var current = Number(root.dataset.smartWidgetIndex056l2 || "0");
      if (Math.abs(delta) < 34) return;
      setIndex056L2(root, dots, current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    setIndex056L2(root, dots, 0);
  }

  function setIndex056L2(root, dots, requestedIndex) {
    var max = cards056L2.length - 1;
    var previous = Number(root.dataset.smartWidgetIndex056l2 || "0");
    var index = Math.max(0, Math.min(max, requestedIndex));
    root.dataset.smartWidgetIndex056l2 = String(index);
    root.style.setProperty("--forge-smart-widget-index-056l2", String(index));
    dots.style.setProperty("--forge-smart-dot-active-056l2", String(index));
    dots.classList.toggle("is-moving-right-056l2", index >= previous);
    dots.classList.toggle("is-moving-left-056l2", index < previous);

    window.clearTimeout(dots._forgeSmartWidgetMotion056L2);
    dots._forgeSmartWidgetMotion056L2 = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056l2", "is-moving-left-056l2");
    }, 280);

    Array.prototype.forEach.call(dots.querySelectorAll(".forge-smart-widget-dot-056l2"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056l2", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function scheduleSmartWidgetPager056L2() {
    window.setTimeout(mountSmartWidgetPager056L2, 60);
    window.setTimeout(mountSmartWidgetPager056L2, 260);
    window.setTimeout(mountSmartWidgetPager056L2, 720);
  }

  document.addEventListener("DOMContentLoaded", scheduleSmartWidgetPager056L2);
  window.addEventListener("load", scheduleSmartWidgetPager056L2);
})();


/* FORGEOS:ALFRED_MOBILE_SMART_WIDGET_SINGLE_STACK_056L3 */
(function () {
  "use strict";

  var cards056L3 = [
    {
      kicker: "Seguimiento",
      score: "86",
      title: "Seguimiento prioritario",
      body: "Relacion abierta con riesgo de enfriarse.",
      why: "Por que ahora: hay senales de seguimiento pendiente.",
      limit: "Incertidumbre: el humano decide tono y momento.",
      chips: ["Autoridad humana", "Solo revision"]
    },
    {
      kicker: "Decision",
      score: "78",
      title: "Senales para decidir",
      body: "Forge muestra contexto para ordenar criterio antes de actuar.",
      why: "Por que ahora: hay oportunidades que pueden perder temperatura.",
      limit: "Senal no es decision. Contexto no es verdad.",
      chips: ["Contexto vivo", "Sin ejecucion"]
    },
    {
      kicker: "Juicio",
      score: "92",
      title: "Falta contexto",
      body: "Primero mejora el juicio; luego decide si vale la pena actuar.",
      why: "Por que ahora: la incertidumbre pesa mas que ejecutar rapido.",
      limit: "Unknown no es cero. Alfred no inventa evidencia.",
      chips: ["Hold humano", "Ley cero"]
    },
    {
      kicker: "Siguiente revision",
      score: "80",
      title: "Abrir plan de accion",
      body: "Usa Alfred para revisar comandos como /Follow Juan o /Mandar mensaje.",
      why: "Por que ahora: la command bar convierte intencion en preview revisable.",
      limit: "Preview only. Toda accion requiere aprobacion.",
      chips: ["Preview", "No envio"]
    }
  ];

  function isMobile056L3() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el056L3(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function unique056L3(nodes) {
    var seen = [];
    nodes.forEach(function (node) {
      if (node && seen.indexOf(node) === -1) seen.push(node);
    });
    return seen;
  }

  function stackCandidates056L3() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("#smart-widget-stack, .smart-widget-stack"));
    Array.prototype.forEach.call(document.querySelectorAll(".forge-smart-widget-pager-root-056l, .forge-smart-widget-pager-root-056l2, .forge-smart-widget-pager-root-056l3"), function (root) {
      if (root.parentElement) candidates.push(root.parentElement);
    });
    return unique056L3(candidates).filter(function (node) {
      return node && node.nodeType === 1 && document.documentElement.contains(node);
    });
  }

  function pickKeeper056L3(candidates) {
    if (!candidates.length) return null;
    return candidates[candidates.length - 1];
  }

  function hideDuplicateStacks056L3(candidates, keeper) {
    candidates.forEach(function (node) {
      if (node === keeper) return;
      node.classList.add("forge-smart-widget-duplicate-hidden-056l3");
      node.setAttribute("aria-hidden", "true");
      node.style.display = "none";
    });
  }

  function renderCard056L3(card, index) {
    var article = el056L3("article", "forge-smart-widget-card-056l3");
    article.setAttribute("role", "group");
    article.setAttribute("aria-label", "Senal inteligente " + (index + 1) + " de 4");

    var top = el056L3("div", "forge-smart-widget-card-top-056l3");
    top.appendChild(el056L3("div", "forge-smart-widget-kicker-056l3", card.kicker));
    var score = el056L3("div", "forge-smart-widget-score-056l3");
    score.appendChild(el056L3("strong", "", card.score));
    score.appendChild(el056L3("span", "", "senal"));
    top.appendChild(score);
    article.appendChild(top);

    article.appendChild(el056L3("h3", "", card.title));
    article.appendChild(el056L3("p", "forge-smart-widget-body-056l3", card.body));

    var chips = el056L3("div", "forge-smart-widget-chips-056l3");
    card.chips.forEach(function (chip) {
      chips.appendChild(el056L3("span", "forge-smart-widget-chip-056l3", chip));
    });
    article.appendChild(chips);

    article.appendChild(el056L3("p", "forge-smart-widget-why-056l3", card.why));
    article.appendChild(el056L3("p", "forge-smart-widget-limit-056l3", card.limit));
    return article;
  }

  function buildPager056L3() {
    var root = el056L3("section", "forge-smart-widget-pager-root-056l3");
    root.setAttribute("aria-label", "Senales inteligentes");
    root.style.setProperty("--forge-smart-widget-index-056l3", "0");

    var viewport = el056L3("div", "forge-smart-widget-viewport-056l3");
    var track = el056L3("div", "forge-smart-widget-track-056l3");
    cards056L3.forEach(function (card, index) {
      track.appendChild(renderCard056L3(card, index));
    });
    viewport.appendChild(track);
    root.appendChild(viewport);

    var dots = el056L3("div", "forge-smart-widget-dots-056l3");
    dots.setAttribute("aria-label", "Indicador de senales inteligentes");
    var glider = el056L3("span", "forge-smart-widget-glider-056l3");
    glider.setAttribute("aria-hidden", "true");
    dots.appendChild(glider);

    cards056L3.forEach(function (_card, index) {
      var dot = el056L3("button", "forge-smart-widget-dot-056l3");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ver senal " + (index + 1));
      dot.addEventListener("click", function () {
        setIndex056L3(root, dots, index);
      });
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
      var current = Number(root.dataset.smartWidgetIndex056l3 || "0");
      setIndex056L3(root, dots, current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    setIndex056L3(root, dots, 0);
    return root;
  }

  function setIndex056L3(root, dots, requestedIndex) {
    var max = cards056L3.length - 1;
    var previous = Number(root.dataset.smartWidgetIndex056l3 || "0");
    var index = Math.max(0, Math.min(max, requestedIndex));
    root.dataset.smartWidgetIndex056l3 = String(index);
    root.style.setProperty("--forge-smart-widget-index-056l3", String(index));
    dots.style.setProperty("--forge-smart-dot-active-056l3", String(index));
    dots.classList.toggle("is-moving-right-056l3", index >= previous);
    dots.classList.toggle("is-moving-left-056l3", index < previous);

    window.clearTimeout(dots._forgeSmartWidgetMotion056L3);
    dots._forgeSmartWidgetMotion056L3 = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056l3", "is-moving-left-056l3");
    }, 280);

    Array.prototype.forEach.call(dots.querySelectorAll(".forge-smart-widget-dot-056l3"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056l3", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function normalizeSmartWidgets056L3() {
    if (!isMobile056L3()) return;
    var candidates = stackCandidates056L3();
    var keeper = pickKeeper056L3(candidates);
    if (!keeper) return;

    hideDuplicateStacks056L3(candidates, keeper);
    keeper.classList.remove("forge-smart-widget-stack-normalized-056l2");
    keeper.classList.remove("forge-smart-widget-stack-normalized-056l");
    keeper.classList.add("forge-smart-widget-stack-normalized-056l3");
    keeper.hidden = false;
    keeper.removeAttribute("hidden");
    keeper.removeAttribute("aria-hidden");
    keeper.style.display = "";

    Array.prototype.forEach.call(keeper.children, function (child) {
      child.remove();
    });

    keeper.appendChild(buildPager056L3());
  }

  function schedule056L3() {
    [80, 360, 900, 1600, 2600].forEach(function (delay) {
      window.setTimeout(normalizeSmartWidgets056L3, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule056L3);
  window.addEventListener("load", schedule056L3);
})();


/* FORGEOS:ALFRED_MOBILE_LANDSCAPE_SAME_LANGUAGE_056M */
(function () {
  "use strict";

  function isPhoneLandscape056M() {
    return window.matchMedia("(max-width: 900px) and (orientation: landscape)").matches;
  }

  function textLooksLikeDesktopDrawer056M(text) {
    var compact = String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
    return compact.indexOf("forge alive") !== -1 &&
      compact.indexOf("inicio") !== -1 &&
      compact.indexOf("pipeline") !== -1 &&
      compact.indexOf("clientes") !== -1 &&
      compact.indexOf("alfred") !== -1 &&
      compact.indexOf("mas") !== -1;
  }

  function hideLandscapeDrawerHeuristics056M() {
    var selectors = [
      ".alfred-desktop-menu-pill",
      ".alfred-desktop-menu-button",
      ".alfred-desktop-menu-panel",
      ".alfred-desktop-sidebar",
      ".alfred-desktop-nav",
      ".desktop-sidebar",
      ".desktop-nav",
      ".side-nav",
      ".context-rail",
      ".context-drawer",
      "[data-desktop-menu]",
      "[data-desktop-sidebar]"
    ];

    selectors.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (node) {
        if (node.closest(".forge-nav-root-056k7")) return;
        node.classList.add("forge-landscape-side-menu-hidden-056m");
        node.setAttribute("aria-hidden", "true");
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("aside, nav, section, div"), function (node) {
      if (node.closest(".forge-nav-root-056k7")) return;
      if (node.closest(".alfred-command-root-056k5")) return;
      if (node.closest("#smart-widget-stack")) return;
      if (!textLooksLikeDesktopDrawer056M(node.textContent)) return;
      var rect = node.getBoundingClientRect();
      if (rect.left <= 180 && rect.width <= 360 && rect.height >= 120) {
        node.classList.add("forge-landscape-side-menu-hidden-056m");
        node.setAttribute("aria-hidden", "true");
      }
    });
  }

  function applyLandscapeLanguage056M() {
    var root = document.documentElement;
    if (!isPhoneLandscape056M()) {
      root.classList.remove("forge-mobile-landscape-056m");
      return;
    }
    root.classList.add("forge-mobile-landscape-056m");
    hideLandscapeDrawerHeuristics056M();
  }

  function scheduleLandscapeLanguage056M() {
    [40, 220, 700, 1400, 2400].forEach(function (delay) {
      window.setTimeout(applyLandscapeLanguage056M, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleLandscapeLanguage056M);
  window.addEventListener("load", scheduleLandscapeLanguage056M);
  window.addEventListener("resize", scheduleLandscapeLanguage056M, { passive: true });
  window.addEventListener("orientationchange", scheduleLandscapeLanguage056M, { passive: true });
})();


/* FORGEOS:ALFRED_LANDSCAPE_FINAL_CONTROLS_056M2 */
(function () {
  "use strict";

  function isLandscape056M2() {
    return window.matchMedia("(max-width: 900px) and (orientation: landscape)").matches;
  }

  function hideNode056M2(node) {
    if (!node || node.closest(".forge-nav-root-056k7")) return;
    if (node.closest(".alfred-command-root-056k5")) return;
    if (node.closest(".forge-smart-widget-pager-root-056l3")) return;
    node.classList.add("forge-landscape-hidden-056m2");
    node.setAttribute("aria-hidden", "true");
  }

  function compactText056M2(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function looksLikeHamburger056M2(node) {
    var text = compactText056M2(node);
    var aria = String(node.getAttribute && (node.getAttribute("aria-label") || node.getAttribute("title") || "") || "").toLowerCase();
    if (text === "☰" || text === "≡" || text === "☷") return true;
    if (aria.indexOf("menu") !== -1 || aria.indexOf("menú") !== -1 || aria.indexOf("navigation") !== -1) return true;
    if (node.matches && node.matches("button, [role='button'], .hamburger, .menu, .menu-button, .menu-pill")) {
      var rect = node.getBoundingClientRect();
      return rect.left < 240 && rect.width <= 96 && rect.height <= 96;
    }
    return false;
  }

  function looksLikeContextChip056M2(node) {
    var text = compactText056M2(node);
    if (text !== "contexto vivo" && text !== "contexto vivo 3") return false;
    var rect = node.getBoundingClientRect();
    if (rect.width > 340 || rect.height > 90) return false;
    if (node.closest("#smart-widget-stack")) return false;
    return true;
  }

  function hideResidualLandscapeControls056M2() {
    if (!isLandscape056M2()) return;
    Array.prototype.forEach.call(document.querySelectorAll(
      ".alfred-desktop-menu-pill, .alfred-desktop-menu-button, .alfred-desktop-menu-panel, .context-rail, .context-drawer, [data-desktop-menu], [data-desktop-sidebar], .hamburger, .menu-button, .menu-pill"
    ), hideNode056M2);

    Array.prototype.forEach.call(document.querySelectorAll("button, [role='button'], nav, aside, section, div, span"), function (node) {
      if (looksLikeHamburger056M2(node) || looksLikeContextChip056M2(node)) hideNode056M2(node);
    });
  }

  function updateKeyboardOffset056M2() {
    var root = document.documentElement;
    if (!isLandscape056M2()) {
      root.classList.remove("forge-mobile-landscape-056m2", "forge-keyboard-open-056m2");
      root.style.removeProperty("--forge-keyboard-offset-056m2");
      return;
    }

    root.classList.add("forge-mobile-landscape-056m2");
    var offset = 0;
    if (window.visualViewport) {
      offset = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    }
    if (offset > 80) {
      root.classList.add("forge-keyboard-open-056m2");
    } else {
      root.classList.remove("forge-keyboard-open-056m2");
      offset = 0;
    }
    root.style.setProperty("--forge-keyboard-offset-056m2", Math.round(offset) + "px");
    hideResidualLandscapeControls056M2();
  }

  function schedule056M2() {
    [30, 180, 500, 1100, 2200].forEach(function (delay) {
      window.setTimeout(updateKeyboardOffset056M2, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule056M2);
  window.addEventListener("load", schedule056M2);
  window.addEventListener("resize", schedule056M2, { passive: true });
  window.addEventListener("orientationchange", schedule056M2, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateKeyboardOffset056M2, { passive: true });
    window.visualViewport.addEventListener("scroll", updateKeyboardOffset056M2, { passive: true });
  }

  document.addEventListener("focusin", function () {
    window.setTimeout(updateKeyboardOffset056M2, 80);
    window.setTimeout(updateKeyboardOffset056M2, 260);
  });
  document.addEventListener("focusout", function () {
    window.setTimeout(updateKeyboardOffset056M2, 120);
    window.setTimeout(updateKeyboardOffset056M2, 380);
  });
})();


/* FORGEOS:ALFRED_MOBILE_UX85_DENSITY_HIERARCHY_056N */
(function () {
  "use strict";

  function isMobile056N() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function cleanText056N(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function findTextNode056N(needles) {
    var lowerNeedles = needles.map(function (needle) { return needle.toLowerCase(); });
    var nodes = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,p,span,div,section,article"));
    return nodes.find(function (node) {
      var text = cleanText056N(node.textContent).toLowerCase();
      if (!text || text.length > 500) return false;
      return lowerNeedles.some(function (needle) { return text.indexOf(needle) !== -1; });
    }) || null;
  }

  function nearestCard056N(node) {
    if (!node) return null;
    var current = node;
    var best = node;
    var hops = 0;
    while (current && current !== document.body && hops < 8) {
      if (current.matches && current.matches("article, section, .card, [class*='card'], [class*='panel'], [class*='widget']")) {
        best = current;
        var textLength = cleanText056N(current.textContent).length;
        if (textLength > 80 && textLength < 1600) return current;
      }
      current = current.parentElement;
      hops += 1;
    }
    return best && best !== document.body ? best : null;
  }

  function addClassByText056N(needles, className) {
    var node = findTextNode056N(needles);
    var card = nearestCard056N(node);
    if (!card) return null;
    card.classList.add(className);
    return card;
  }

  function ensureDecisionCue056N(planCard) {
    if (!planCard || planCard.querySelector(".forge-ux85-decision-cue-056n")) return;
    var cue = document.createElement("div");
    cue.className = "forge-ux85-decision-cue-056n";
    var strong = document.createElement("strong");
    strong.textContent = "Siguiente mejor accion";
    var span = document.createElement("span");
    span.textContent = "revisar dia";
    cue.appendChild(strong);
    cue.appendChild(span);
    planCard.insertBefore(cue, planCard.firstElementChild || null);
  }

  function labelSecondarySection056N(card, label) {
    if (!card || card.querySelector(".forge-ux85-section-label-056n")) return;
    var marker = document.createElement("div");
    marker.className = "forge-ux85-section-label-056n";
    marker.textContent = label;
    card.insertBefore(marker, card.firstElementChild || null);
  }

  function buildMetricBlock056N() {
    var metaNode = findTextNode056N(["Meta mensual"]);
    var followNode = findTextNode056N(["Seguimiento"]);
    var meta = nearestCard056N(metaNode);
    var follow = nearestCard056N(followNode);
    if (!meta || !follow || meta === follow) return;
    if (meta.parentElement && meta.parentElement.classList.contains("forge-ux85-metric-block-056n")) return;

    var wrapper = document.createElement("section");
    wrapper.className = "forge-ux85-metric-block-056n forge-ux85-secondary-056n";
    meta.parentElement.insertBefore(wrapper, meta);
    wrapper.appendChild(meta);
    wrapper.appendChild(follow);
  }

  function applyUx85Polish056N() {
    if (!isMobile056N()) return;
    document.documentElement.classList.add("forge-ux85-mobile-056n");

    var alfred = addClassByText056N(["Detecte un cuello", "Detecté un cuello"], "forge-ux85-alfred-card-056n");
    var plan = addClassByText056N(["Plan de hoy"], "forge-ux85-plan-056n");
    var opportunities = addClassByText056N(["Oportunidades"], "forge-ux85-opportunities-056n");
    var recommendations = addClassByText056N(["Recomendaciones"], "forge-ux85-recommendations-056n");

    if (alfred) alfred.classList.remove("forge-ux85-secondary-056n");
    if (plan) {
      plan.classList.remove("forge-ux85-secondary-056n");
      ensureDecisionCue056N(plan);
    }
    if (opportunities) {
      opportunities.classList.add("forge-ux85-secondary-056n");
      labelSecondarySection056N(opportunities, "Despues de decidir");
    }
    if (recommendations) {
      recommendations.classList.add("forge-ux85-secondary-056n");
      labelSecondarySection056N(recommendations, "Notas de apoyo");
    }
    buildMetricBlock056N();
  }

  function scheduleUx85Polish056N() {
    [80, 360, 900, 1600, 2600].forEach(function (delay) {
      window.setTimeout(applyUx85Polish056N, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", scheduleUx85Polish056N);
  window.addEventListener("load", scheduleUx85Polish056N);
  window.addEventListener("resize", scheduleUx85Polish056N, { passive: true });
  window.addEventListener("orientationchange", scheduleUx85Polish056N, { passive: true });
})();


/* FORGEOS:ALFRED_MOBILE_UX90_PROFILE_MENU_SMARTWIDGET_FOCUS_056O */
(function () {
  "use strict";

  function isMobile056O() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el056O(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function normalizeText056O(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function findGreetingAvatar056O() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("button, [role='button'], .avatar, [class*='avatar'], [class*='profile'], div, span"));
    return candidates.find(function (node) {
      var text = normalizeText056O(node.textContent);
      if (text !== "F") return false;
      var rect = node.getBoundingClientRect();
      return rect.width >= 38 && rect.width <= 96 && rect.height >= 38 && rect.height <= 96 && rect.top < 220;
    }) || null;
  }

  function makeOption056O(icon, title, subtitle, status, action) {
    var button = el056O("button", "forge-profile-option-056o");
    button.type = "button";
    button.dataset.profileAction056o = action;
    button.appendChild(el056O("span", "forge-profile-option-icon-056o", icon));
    var copy = el056O("span");
    copy.appendChild(el056O("span", "forge-profile-option-title-056o", title));
    copy.appendChild(el056O("span", "forge-profile-option-subtitle-056o", subtitle));
    button.appendChild(copy);
    button.appendChild(el056O("span", "forge-profile-status-056o", status));
    return button;
  }

  function ensureProfileMenu056O(trigger) {
    var existing = document.querySelector(".forge-profile-menu-056o");
    if (existing) return existing;

    var menu = el056O("section", "forge-profile-menu-056o");
    menu.setAttribute("aria-label", "Opciones de perfil");
    menu.setAttribute("aria-hidden", "true");

    var head = el056O("div", "forge-profile-menu-head-056o");
    head.appendChild(el056O("div", "forge-profile-avatar-056o", "F"));
    var identity = el056O("div");
    identity.appendChild(el056O("div", "forge-profile-name-056o", "Jorge"));
    identity.appendChild(el056O("div", "forge-profile-meta-056o", "Google Auth proximamente"));
    head.appendChild(identity);
    menu.appendChild(head);

    menu.appendChild(makeOption056O("G", "Cuenta Google", "Foto y sesion real cuando Auth este listo", "preview", "google"));
    menu.appendChild(makeOption056O("☼", "Tema claro", "Vista temporal sin guardar preferencia", "local", "light"));
    menu.appendChild(makeOption056O("☾", "Tema oscuro", "Regresa a Forge navy", "local", "dark"));
    menu.appendChild(makeOption056O("↗", "Cerrar sesion", "Bloqueado en static preview", "locked", "logout"));

    document.body.appendChild(menu);

    menu.addEventListener("click", function (event) {
      var option = event.target.closest("[data-profile-action-056o]");
      if (!option) return;
      var action = option.dataset.profileAction056o;
      if (action === "light") {
        document.documentElement.classList.add("forge-light-preview-056o");
        return;
      }
      if (action === "dark") {
        document.documentElement.classList.remove("forge-light-preview-056o");
        return;
      }
      if (action === "logout") {
        option.querySelector(".forge-profile-status-056o").textContent = "requiere auth";
        return;
      }
      if (action === "google") {
        option.querySelector(".forge-profile-status-056o").textContent = "pronto";
      }
    });

    document.addEventListener("click", function (event) {
      if (!menu.classList.contains("is-open-056o")) return;
      if (menu.contains(event.target)) return;
      if (trigger.contains(event.target)) return;
      closeProfileMenu056O(menu, trigger);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeProfileMenu056O(menu, trigger);
    });

    return menu;
  }

  function openProfileMenu056O(menu, trigger) {
    menu.classList.add("is-open-056o");
    menu.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeProfileMenu056O(menu, trigger) {
    menu.classList.remove("is-open-056o");
    menu.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
  }

  function wireProfile056O() {
    if (!isMobile056O()) return;
    var trigger = findGreetingAvatar056O();
    if (!trigger || trigger.dataset.profileMenu056o === "ready") return;
    trigger.dataset.profileMenu056o = "ready";
    trigger.classList.add("forge-profile-trigger-056o");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Abrir opciones de perfil");
    var menu = ensureProfileMenu056O(trigger);

    function toggle() {
      if (menu.classList.contains("is-open-056o")) {
        closeProfileMenu056O(menu, trigger);
      } else {
        openProfileMenu056O(menu, trigger);
      }
    }

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });
    trigger.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
  }

  function enforceOneSmartWidgetViewport056O() {
    if (!isMobile056O()) return;
    var root = document.querySelector(".forge-smart-widget-pager-root-056l3");
    if (!root) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll(".forge-smart-widget-card-056l3"));
    cards.forEach(function (card, index) {
      card.classList.toggle("forge-ux90-hidden-extra-widget-056o", index > 3);
    });
    var track = root.querySelector(".forge-smart-widget-track-056l3");
    if (track) {
      track.style.width = "400%";
      track.style.flexWrap = "nowrap";
    }
  }

  function applyUx90Mobile056O() {
    if (!isMobile056O()) return;
    document.documentElement.classList.add("forge-ux90-mobile-056o");
    wireProfile056O();
    enforceOneSmartWidgetViewport056O();
  }

  function schedule056O() {
    [80, 360, 900, 1600, 2800].forEach(function (delay) {
      window.setTimeout(applyUx90Mobile056O, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule056O);
  window.addEventListener("load", schedule056O);
  window.addEventListener("resize", schedule056O, { passive: true });
  window.addEventListener("orientationchange", schedule056O, { passive: true });
})();


/* FORGEOS:ALFRED_MOBILE_UX99_FOCUS_LAYER_056P */
(function () {
  "use strict";

  var widgets056P = [
    {
      kicker: "Seguimiento",
      score: "86",
      title: "Seguimiento prioritario",
      body: "Relacion abierta con riesgo de enfriarse.",
      limit: "El humano decide tono y momento."
    },
    {
      kicker: "Decision",
      score: "78",
      title: "Senales para decidir",
      body: "Forge ordena contexto antes de sugerir accion.",
      limit: "Senal no es decision. Contexto no es verdad."
    },
    {
      kicker: "Juicio",
      score: "92",
      title: "Falta contexto",
      body: "Primero mejora el juicio; luego decide.",
      limit: "Unknown no es cero."
    },
    {
      kicker: "Revision",
      score: "80",
      title: "Abrir plan de accion",
      body: "Usa Alfred para revisar /Follow Juan.",
      limit: "Preview only. Requiere aprobacion."
    }
  ];

  function isMobile056P() {
    return window.matchMedia("(max-width: 767px), (max-width: 900px) and (orientation: landscape)").matches;
  }

  function el056P(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function bowtieSvg056P() {
    return [
      '<svg viewBox="0 0 84 52" aria-hidden="true">',
      '<path d="M6 13 C16 6 29 10 38 22 L38 30 C29 42 16 46 6 39 C11 31 11 21 6 13Z" fill="#061326"/>',
      '<path d="M78 13 C68 6 55 10 46 22 L46 30 C55 42 68 46 78 39 C73 31 73 21 78 13Z" fill="#061326"/>',
      '<rect x="36" y="20" width="12" height="12" rx="5" fill="#F5F8FF"/>',
      '<path d="M11 16 C20 11 30 14 37 24" stroke="#F2CF75" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
      '<path d="M73 16 C64 11 54 14 47 24" stroke="#76DBFF" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
      '</svg>'
    ].join("");
  }

  function text056P(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findTextNode056P(needles) {
    var lowerNeedles = needles.map(function (needle) { return needle.toLowerCase(); });
    return Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,p,span,div,section,article")).find(function (node) {
      var value = text056P(node).toLowerCase();
      if (!value || value.length > 700) return false;
      return lowerNeedles.some(function (needle) { return value.indexOf(needle) !== -1; });
    }) || null;
  }

  function nearestCard056P(node) {
    var current = node;
    var fallback = node;
    var hops = 0;
    while (current && current !== document.body && hops < 9) {
      if (current.matches && current.matches("article, section, .card, [class*='card'], [class*='panel'], [class*='widget']")) {
        fallback = current;
        var size = text056P(current).length;
        if (size > 70 && size < 1800) return current;
      }
      current = current.parentElement;
      hops += 1;
    }
    return fallback && fallback !== document.body ? fallback : null;
  }

  function hideOldSmartWidgets056P() {
    Array.prototype.forEach.call(document.querySelectorAll("#smart-widget-stack, .smart-widget-stack, .forge-smart-widget-pager-root-056l3"), function (node) {
      if (!node.closest(".forge-ux99-focus-root-056p")) {
        node.classList.add("forge-ux99-old-smart-hidden-056p");
        node.setAttribute("aria-hidden", "true");
      }
    });

    ["Seguimiento prioritario", "Abrir plan de accion", "Abrir plan de acción", "Senales para decidir", "Señales para decidir", "Falta contexto"].forEach(function (label) {
      var node = findTextNode056P([label]);
      var card = nearestCard056P(node);
      if (card && !card.closest(".forge-ux99-focus-root-056p")) {
        card.classList.add("forge-ux99-old-smart-hidden-056p");
        card.setAttribute("aria-hidden", "true");
      }
    });
  }

  function compactSecondary056P() {
    var opportunities = nearestCard056P(findTextNode056P(["Oportunidades"]));
    var recommendations = nearestCard056P(findTextNode056P(["Recomendaciones"]));
    if (opportunities && !opportunities.closest(".forge-ux99-focus-root-056p")) {
      opportunities.classList.add("forge-ux99-secondary-compact-056p");
    }
    if (recommendations && !recommendations.closest(".forge-ux99-focus-root-056p")) {
      recommendations.classList.add("forge-ux99-secondary-compact-056p");
    }
  }

  function replaceAlfredPlaceholder056P() {
    var candidates = Array.prototype.slice.call(document.querySelectorAll("div,span,button"));
    candidates.forEach(function (node) {
      if (node.dataset.alfredMark056p === "ready") return;
      if (text056P(node) !== "A") return;
      var rect = node.getBoundingClientRect();
      if (rect.width < 34 || rect.width > 90 || rect.height < 34 || rect.height > 90) return;
      if (!text056P(node.closest("section,article,div") || "").toLowerCase().includes("alfred")) return;
      node.dataset.alfredMark056p = "ready";
      node.classList.add("forge-ux99-alfred-mark-056p");
      node.innerHTML = bowtieSvg056P();
    });
  }

  function buildWidgetCard056P(widget, index) {
    var card = el056P("article", "forge-ux99-widget-056p");
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", "Senal " + (index + 1) + " de 4");
    var top = el056P("div", "forge-ux99-widget-top-056p");
    top.appendChild(el056P("div", "forge-ux99-widget-kicker-056p", widget.kicker));
    top.appendChild(el056P("div", "forge-ux99-widget-score-056p", widget.score));
    card.appendChild(top);
    card.appendChild(el056P("h3", "", widget.title));
    card.appendChild(el056P("p", "", widget.body));
    card.appendChild(el056P("p", "", widget.limit));
    return card;
  }

  function setFocusIndex056P(root, dots, requested) {
    var previous = Number(root.dataset.focusIndex056p || "0");
    var index = Math.max(0, Math.min(widgets056P.length - 1, requested));
    root.dataset.focusIndex056p = String(index);
    root.style.setProperty("--forge-ux99-index-056p", String(index));
    dots.style.setProperty("--forge-ux99-dot-index-056p", String(index));
    dots.classList.toggle("is-moving-right-056p", index >= previous);
    dots.classList.toggle("is-moving-left-056p", index < previous);
    window.clearTimeout(dots._focusMotion056P);
    dots._focusMotion056P = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056p", "is-moving-left-056p");
    }, 260);
    Array.prototype.forEach.call(dots.querySelectorAll(".forge-ux99-dot-056p"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056p", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function buildFocusRoot056P() {
    var root = el056P("section", "forge-ux99-focus-root-056p");
    root.setAttribute("aria-label", "Forge enfoque del dia");
    root.style.setProperty("--forge-ux99-index-056p", "0");

    var hero = el056P("div", "forge-ux99-focus-hero-056p");
    var mark = el056P("div", "forge-ux99-alfred-mark-056p");
    mark.innerHTML = bowtieSvg056P();
    hero.appendChild(mark);

    var copy = el056P("div");
    copy.appendChild(el056P("div", "forge-ux99-eyebrow-056p", "Alfred Concierge"));
    copy.appendChild(el056P("h2", "forge-ux99-title-056p", "Haz esto ahora"));
    copy.appendChild(el056P("div", "forge-ux99-subtitle-056p", "Revisa seguimiento prioritario antes de que se enfrie."));
    hero.appendChild(copy);
    root.appendChild(hero);

    var row = el056P("div", "forge-ux99-action-row-056p");
    row.appendChild(el056P("span", "forge-ux99-chip-056p", "Autoridad humana"));
    row.appendChild(el056P("span", "forge-ux99-chip-056p", "Solo revision"));
    row.appendChild(el056P("span", "forge-ux99-chip-056p", "No envio"));
    root.appendChild(row);

    var carousel = el056P("div", "forge-ux99-carousel-056p");
    var viewport = el056P("div", "forge-ux99-viewport-056p");
    var track = el056P("div", "forge-ux99-track-056p");
    widgets056P.forEach(function (widget, index) {
      track.appendChild(buildWidgetCard056P(widget, index));
    });
    viewport.appendChild(track);
    carousel.appendChild(viewport);

    var dots = el056P("div", "forge-ux99-dots-056p");
    dots.setAttribute("aria-label", "Indicador de senales");
    dots.appendChild(el056P("span", "forge-ux99-glider-056p"));
    widgets056P.forEach(function (_widget, index) {
      var dot = el056P("button", "forge-ux99-dot-056p");
      dot.type = "button";
      dot.setAttribute("aria-label", "Ver senal " + (index + 1));
      dot.addEventListener("click", function () {
        setFocusIndex056P(root, dots, index);
      });
      dots.appendChild(dot);
    });
    carousel.appendChild(dots);
    root.appendChild(carousel);

    var startX = 0;
    viewport.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) return;
      startX = event.touches[0].clientX;
    }, { passive: true });
    viewport.addEventListener("touchend", function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;
      var delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) < 34) return;
      var current = Number(root.dataset.focusIndex056p || "0");
      setFocusIndex056P(root, dots, current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    setFocusIndex056P(root, dots, 0);
    return root;
  }

  function mountFocusLayer056P() {
    if (!isMobile056P()) return;
    document.documentElement.classList.add("forge-ux99-mobile-056p");
    if (document.querySelector(".forge-ux99-focus-root-056p")) return;
    var plan = nearestCard056P(findTextNode056P(["Plan de hoy"]));
    var anchor = plan || nearestCard056P(findTextNode056P(["Detecte un cuello", "Detecté un cuello"]));
    var focus = buildFocusRoot056P();
    if (anchor && anchor.parentElement) {
      anchor.insertAdjacentElement("afterend", focus);
    } else {
      document.body.insertBefore(focus, document.body.firstElementChild || null);
    }
    hideOldSmartWidgets056P();
    compactSecondary056P();
    replaceAlfredPlaceholder056P();
  }

  function applyUx99FocusLayer056P() {
    if (!isMobile056P()) return;
    mountFocusLayer056P();
    hideOldSmartWidgets056P();
    compactSecondary056P();
    replaceAlfredPlaceholder056P();
  }

  function schedule056P() {
    [80, 360, 900, 1600, 2800].forEach(function (delay) {
      window.setTimeout(applyUx99FocusLayer056P, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule056P);
  window.addEventListener("load", schedule056P);
  window.addEventListener("resize", schedule056P, { passive: true });
  window.addEventListener("orientationchange", schedule056P, { passive: true });
})();


/* FORGEOS:RESTORE_FOCUS_WIDGETS_AND_BOWTIE_056P2 */
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

  function bowtieSvg() {
    return '<svg viewBox="0 0 84 52" aria-hidden="true"><path d="M6 13 C16 6 29 10 38 22 L38 30 C29 42 16 46 6 39 C11 31 11 21 6 13Z" fill="#061326"/><path d="M78 13 C68 6 55 10 46 22 L46 30 C55 42 68 46 78 39 C73 31 73 21 78 13Z" fill="#061326"/><rect x="36" y="20" width="12" height="12" rx="5" fill="#F5F8FF"/><path d="M11 16 C20 11 30 14 37 24" stroke="#F2CF75" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M73 16 C64 11 54 14 47 24" stroke="#76DBFF" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>';
  }

  function text(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findText(needles) {
    var lower = needles.map(function (item) { return item.toLowerCase(); });
    return Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,p,span,div,section,article")).find(function (node) {
      var value = text(node).toLowerCase();
      if (!value || value.length > 800) return false;
      return lower.some(function (needle) { return value.indexOf(needle) !== -1; });
    }) || null;
  }

  function nearestCard(node) {
    var current = node;
    var candidate = node;
    var hops = 0;
    while (current && current !== document.body && hops < 10) {
      if (current.matches && current.matches("article, section, .card, [class*='card'], [class*='panel'], [class*='widget']")) {
        candidate = current;
        var size = text(current).length;
        if (size > 70 && size < 1800) return current;
      }
      current = current.parentElement;
      hops += 1;
    }
    return candidate && candidate !== document.body ? candidate : null;
  }

  function replaceA() {
    var alfredLabel = findText(["ALFRED / FORGE", "ALFRED"]);
    var container = alfredLabel ? nearestCard(alfredLabel) : document;
    Array.prototype.slice.call((container || document).querySelectorAll("div,span,button")).forEach(function (node) {
      if (node.dataset.bowtie056p2 === "ready") return;
      if (text(node) !== "A") return;
      var rect = node.getBoundingClientRect();
      if (rect.width < 34 || rect.width > 96 || rect.height < 34 || rect.height > 96) return;
      node.dataset.bowtie056p2 = "ready";
      node.classList.add("forge-alfred-a-replaced-056p2");
      node.innerHTML = bowtieSvg();
    });
  }

  function setIndex(root, dots, requested) {
    var previous = Number(root.dataset.focusIndex056p2 || "0");
    var index = Math.max(0, Math.min(widgets.length - 1, requested));
    root.dataset.focusIndex056p2 = String(index);
    root.style.setProperty("--forge-focus-index-056p2", String(index));
    dots.style.setProperty("--forge-focus-dot-index-056p2", String(index));
    dots.classList.toggle("is-moving-right-056p2", index >= previous);
    dots.classList.toggle("is-moving-left-056p2", index < previous);
    window.clearTimeout(dots._timer056p2);
    dots._timer056p2 = window.setTimeout(function () {
      dots.classList.remove("is-moving-right-056p2", "is-moving-left-056p2");
    }, 260);
    Array.prototype.forEach.call(dots.querySelectorAll(".forge-focus-dot-056p2"), function (dot, dotIndex) {
      dot.classList.toggle("is-active-056p2", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function buildFocus() {
    var root = el("section", "forge-focus-root-056p2");
    root.style.setProperty("--forge-focus-index-056p2", "0");
    root.setAttribute("aria-label", "Alfred enfoque del dia");

    var hero = el("div", "forge-focus-hero-056p2");
    var mark = el("div", "forge-bowtie-disc-056p2");
    mark.innerHTML = bowtieSvg();
    hero.appendChild(mark);
    var copy = el("div");
    copy.appendChild(el("div", "forge-focus-eyebrow-056p2", "Alfred Concierge"));
    copy.appendChild(el("h2", "forge-focus-title-056p2", "Haz esto ahora"));
    copy.appendChild(el("div", "forge-focus-subtitle-056p2", "Revisa seguimiento prioritario antes de que se enfrie."));
    hero.appendChild(copy);
    root.appendChild(hero);

    var viewport = el("div", "forge-focus-viewport-056p2");
    var track = el("div", "forge-focus-track-056p2");
    widgets.forEach(function (widget, index) {
      var card = el("article", "forge-focus-card-056p2");
      var top = el("div", "forge-focus-card-top-056p2");
      top.appendChild(el("div", "forge-focus-kicker-056p2", widget[0]));
      top.appendChild(el("div", "forge-focus-score-056p2", widget[1]));
      card.appendChild(top);
      card.appendChild(el("h3", "", widget[2]));
      card.appendChild(el("p", "", widget[3]));
      card.appendChild(el("p", "", widget[4]));
      track.appendChild(card);
    });
    viewport.appendChild(track);
    root.appendChild(viewport);

    var dots = el("div", "forge-focus-dots-056p2");
    dots.appendChild(el("span", "forge-focus-glider-056p2"));
    widgets.forEach(function (_widget, index) {
      var dot = el("button", "forge-focus-dot-056p2");
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
      var current = Number(root.dataset.focusIndex056p2 || "0");
      setIndex(root, dots, current + (delta < 0 ? 1 : -1));
    }, { passive: true });
    setIndex(root, dots, 0);
    return root;
  }

  function hideOldSmartWidgets() {
    Array.prototype.forEach.call(document.querySelectorAll("#smart-widget-stack, .smart-widget-stack, .forge-smart-widget-pager-root-056l3, .forge-ux99-focus-root-056p"), function (node) {
      if (!node.closest(".forge-focus-root-056p2")) {
        node.classList.add("forge-ux99-old-smart-hidden-056p");
        node.setAttribute("aria-hidden", "true");
      }
    });
  }

  function mountFocus() {
    if (!isMobile()) return;
    document.documentElement.classList.add("forge-ux99-mobile-056p2");
    var focus = document.querySelector(".forge-focus-root-056p2");
    if (!focus) {
      focus = buildFocus();
      var plan = nearestCard(findText(["Plan de hoy"]));
      if (plan && plan.parentElement) {
        plan.insertAdjacentElement("afterend", focus);
      } else {
        document.body.insertBefore(focus, document.body.firstElementChild || null);
      }
    }
    hideOldSmartWidgets();
    replaceA();
  }

  function schedule() {
    [60, 240, 700, 1400, 2600, 4200].forEach(function (delay) {
      window.setTimeout(mountFocus, delay);
    });
  }

  document.addEventListener("DOMContentLoaded", schedule);
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
})();
