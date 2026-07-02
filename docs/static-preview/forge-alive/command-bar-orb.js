const layer = document.querySelector("[data-command-orb-layer]");

const localCommandResults = {
  juan: [
    ["Juan Orozco", "Poliza ABC · preview"],
    ["Juan Martinez", "Prospecto · review"],
    ["Juan Perez", "Ultimo contacto hace 76 dias · follow-up"],
  ],
  follow: [
    ["Seguimiento prioritario", "Review only · no send"],
    ["Maria", "Necesita reason why claro · 8 dias"],
    ["Octavio", "Falta confirmar cita · 5 dias"],
  ],
  agenda: [
    ["Agenda de la mañana", "Preview only"],
    ["Revision 16:00", "Review checkpoint"],
  ],
};

function normalizeCommand(value) {
  return value.trim().replace(/^\//, "").toLowerCase();
}

function openLayer() {
  if (!layer) return;
  layer.classList.add("is-expanded");
  const input = layer.querySelector(".command-pill-input");
  if (input) {
    window.requestAnimationFrame(() => input.focus());
  }
}

function closeLayer() {
  if (!layer) return;
  const input = layer.querySelector(".command-pill-input");
  const results = layer.querySelector(".command-orb-results");
  if (input) input.value = "";
  if (results) results.hidden = true;
  layer.classList.remove("is-expanded", "is-typing");
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

if (layer) {
  const orb = layer.querySelector(".command-orb");
  const close = layer.querySelector(".command-pill-close");
  const input = layer.querySelector(".command-pill-input");

  if (orb) {
    orb.addEventListener("click", openLayer);
  }

  if (close) {
    close.addEventListener("click", closeLayer);
  }

  if (input) {
    input.addEventListener("input", (event) => renderResults(event.target.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLayer();
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
}
