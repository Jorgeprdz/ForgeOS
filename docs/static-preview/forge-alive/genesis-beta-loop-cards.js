const cards = [
  {
    title: "Jorge / Maria",
    context: "Seguimiento 15 dias",
    subtitle: "contexto relacional, no aprobación de envío",
    draft: "Retomar la conversacion con calma y revisar si hace sentido avanzar.",
    evidence: ["conversación previa", "seguimiento 15 días", "seguimiento pendiente"],
    boundary: "Entrega bloqueada"
  },
  {
    title: "Andres / Juan",
    context: "Cercanía a bono",
    subtitle: "contexto motivacional / estimación candidata, no es cálculo final de pago",
    draft: "Revisar la oportunidad como contexto, sin prometer pago ni resultado.",
    evidence: ["cercanía a bono", "señal relativa", "mensaje consultivo"],
    boundary: "No es cálculo final de pago"
  },
  {
    title: "Lupita / Maria",
    context: "Meta de coche",
    subtitle: "contexto motivacional, no verdad de compensación",
    draft: "Usar la meta como referencia motivacional, sin convertirla en presion.",
    evidence: ["meta de coche", "señal de avance", "señal de consistencia"],
    boundary: "No es verdad de compensación"
  }
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function labelRow(label, value) {
  const row = el("div", "genesis-label-row");
  row.appendChild(el("span", "genesis-label-key", label));
  row.appendChild(el("span", "genesis-label-value", value));
  return row;
}

function renderCard(card) {
  const article = el("article", "mini-card glass genesis-beta-loop-card compact");

  article.appendChild(el("p", "eyebrow", "Genesis Beta Loop"));
  article.appendChild(el("h3", "", card.title));
  article.appendChild(el("p", "muted", card.context));
  article.appendChild(el("p", "genesis-subtitle", card.subtitle));

  const labels = el("div", "genesis-label-stack");
  labels.appendChild(labelRow("Autoridad", "Autoridad humana"));
  labels.appendChild(labelRow("Límite", "Solo revisión"));
  labels.appendChild(labelRow("Aprobación", "No aprobado"));
  labels.appendChild(labelRow("Envío", "No enviable"));
  labels.appendChild(labelRow("Bloqueo", card.boundary));
  article.appendChild(labels);

  article.appendChild(el("p", "genesis-draft-preview compact", card.draft));

  const evidence = el("div", "genesis-evidence-row");
  card.evidence.forEach((item) => evidence.appendChild(el("span", "forge-chip soft", item)));
  article.appendChild(evidence);

  article.appendChild(el("p", "article-zero-reminder compact", "Artículo 0: fortalecer el juicio, no reemplazarlo."));

  return article;
}

function main() {
  const target = document.getElementById("genesis-cards");
  if (!target) return;
  target.innerHTML = "";
  cards.forEach((card) => target.appendChild(renderCard(card)));
}

document.addEventListener("DOMContentLoaded", main);
