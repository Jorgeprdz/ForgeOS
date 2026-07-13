const layer = document.querySelector("[data-command-orb-layer]");

const localCommandResults = {
  juan: [
    ["Juan Orozco", "Poliza ABC · revisión"],
    ["Juan Martinez", "Prospecto · revisar"],
    ["Juan Perez", "Ultimo contacto hace 76 dias · seguimiento"],
  ],
  follow: [
    ["Seguimiento prioritario", "Solo revisión · sin envío"],
    ["Maria", "Necesita razón clara · 8 dias"],
    ["Octavio", "Falta confirmar cita · 5 dias"],
  ],
  agenda: [
    ["Agenda de la mañana", "Solo revisión"],
    ["Revision 16:00", "Punto de revisión"],
  ],
};

function normalizeCommand(value) {
  return value.trim().replace(/^\//, "").toLowerCase();
}

let commandTransitionTimerR16d3 = 0;
let commandOpenFrameR16d3 = 0;

function openLayer() {
  if (!layer) return;

  window.clearTimeout(commandTransitionTimerR16d3);
  window.cancelAnimationFrame(commandOpenFrameR16d3);

  const pill = layer.querySelector(".command-pill");
  const input = layer.querySelector(".command-pill-input");

  layer.classList.remove("is-closing");
  layer.classList.add("is-opening");
  layer.setAttribute("aria-expanded", "true");

  if (pill) {
    void pill.offsetWidth;
  }

  commandOpenFrameR16d3 = window.requestAnimationFrame(() => {
    layer.classList.add("is-expanded");
    layer.classList.remove("is-opening");

    commandOpenFrameR16d3 = window.requestAnimationFrame(() => {
      if (input) input.focus({ preventScroll: true });
    });
  });
}

function closeLayer() {
  if (!layer) return;

  window.clearTimeout(commandTransitionTimerR16d3);
  window.cancelAnimationFrame(commandOpenFrameR16d3);

  const input = layer.querySelector(".command-pill-input");
  const results = layer.querySelector(".command-orb-results");
  const active = document.activeElement;

  if (input) {
    input.value = "";
    input.blur();
  }

  if (
    active instanceof HTMLElement &&
    layer.contains(active)
  ) {
    active.blur();
  }

  if (results) results.hidden = true;

  layer.classList.remove(
    "is-expanded",
    "is-opening",
    "is-typing",
  );
  layer.classList.add("is-closing");
  layer.setAttribute("aria-expanded", "false");

  updateCommandControls();

  commandTransitionTimerR16d3 = window.setTimeout(() => {
    layer.classList.remove("is-closing");
  }, 460);
}

function renderResults(value) {
  if (!layer) return;
  const results = layer.querySelector(".command-orb-results");
  if (!results) return;

  const key = normalizeCommand(value);
  const rows = localCommandResults[key] || (key ? localCommandResults.juan : []);

  results.hidden = rows.length === 0;
  results.innerHTML = rows
    .map(([title, meta]) => `<article><strong>${title}</strong><span>${meta}</span></article>`)
    .join("");

  layer.classList.toggle("is-typing", key.length > 0);
}

function updateCommandControls() {
  if (!layer) return;
  const input = layer.querySelector(".command-pill-input");
  const send = layer.querySelector(".command-pill-send");
  const hasValue = Boolean(input && input.value.trim());
  if (send) send.disabled = !hasValue;
  layer.classList.toggle("has-command-value", hasValue);
}

function submitCommand() {
  if (!layer) return;
  const input = layer.querySelector(".command-pill-input");
  const command = input ? input.value.trim() : "";
  if (!command) {
    if (input) input.focus();
    return;
  }
  renderResults(command);
  layer.dispatchEvent(new CustomEvent("forge:home-command-submit", {
    bubbles: true,
    detail: { command, previewOnly: true },
  }));
}

if (layer && layer.dataset.forgeCommandBarR16c1Bound !== "true") {
  layer.dataset.forgeCommandBarR16c1Bound = "true";
  layer.setAttribute("aria-expanded", "false");
  const orb = layer.querySelector(".command-orb");
  const pill = layer.querySelector(".command-pill");
  const close = layer.querySelector(".command-pill-close");
  const input = layer.querySelector(".command-pill-input");
  const send = layer.querySelector(".command-pill-send");

  const captureCloseR16d3 = (event) => {
    const target = event.target.closest(".command-pill-close");

    if (!target || !layer.contains(target)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    closeLayer();
  };

  if (
    layer.dataset.forgeCommandCloseCaptureR16d3 !== "true"
  ) {
    layer.dataset.forgeCommandCloseCaptureR16d3 = "true";

    layer.addEventListener(
      "pointerdown",
      captureCloseR16d3,
      true,
    );

    layer.addEventListener(
      "click",
      captureCloseR16d3,
      true,
    );
  }

  if (orb) {
    orb.addEventListener("click", openLayer);
  }

  if (pill) {
    pill.addEventListener("click", (event) => {
      if (close && close.contains(event.target)) return;
      openLayer();
    });
  }

  if (close) {
    close.setAttribute("type", "button");
    close.setAttribute("aria-label", "Cerrar command bar");

    close.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeLayer();
    });
  }

  if (send) {
    send.addEventListener("click", (event) => {
      event.stopPropagation();
      submitCommand();
    });
  }

  if (input) {
    input.addEventListener("focus", openLayer);
    input.addEventListener("input", (event) => {
      renderResults(event.target.value);
      updateCommandControls();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLayer();
        if (orb) orb.focus();
      } else if (event.key === "Enter") {
        event.preventDefault();
        submitCommand();
      }
    });
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (!input.value.trim() && !layer.matches(":focus-within")) {
          closeLayer();
        }
      }, 120);
    });
  }
  updateCommandControls();
}

// FORGEOS:DESKTOP_CONTEXT_DRAWER_054F:START
(() => {
  const initDesktopContextDrawer = () => {
    const toggle = document.querySelector(".desktop-context-toggle");
    const panel = document.querySelector(".desktop-context-rail");
    const close = document.querySelector(".desktop-context-close");

    if (!toggle || !panel) {
      return;
    }

    const setOpen = (isOpen) => {
      document.body.classList.toggle("desktop-context-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      panel.setAttribute("aria-hidden", String(!isOpen));
    };

    toggle.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("desktop-context-open"));
    });

    if (close) {
      close.addEventListener("click", () => setOpen(false));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDesktopContextDrawer, { once: true });
  } else {
    initDesktopContextDrawer();
  }
})();
// FORGEOS:DESKTOP_CONTEXT_DRAWER_054F:END
