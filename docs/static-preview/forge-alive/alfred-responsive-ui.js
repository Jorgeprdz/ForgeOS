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
