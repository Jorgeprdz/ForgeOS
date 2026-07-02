const cards = [
  {
    title: "Jorge / Maria",
    context: "Follow-up 15 dias",
    subtitle: "relationship follow-up context, not send approval",
    draft: "Retomar la conversacion con calma y revisar si hace sentido avanzar.",
    evidence: ["previous conversation", "15-day follow-up", "pending follow-up"],
    boundary: "Delivery locked"
  },
  {
    title: "Andres / Juan",
    context: "Bonus proximity",
    subtitle: "motivational context / candidate estimate, not payout truth",
    draft: "Revisar la oportunidad como contexto, sin prometer pago ni resultado.",
    evidence: ["bonus proximity", "relative signal", "consultative message"],
    boundary: "Not payout truth"
  },
  {
    title: "Lupita / Maria",
    context: "Car goal",
    subtitle: "motivation context, not compensation truth",
    draft: "Usar la meta como referencia motivacional, sin convertirla en presion.",
    evidence: ["car goal", "advancement signal", "consistency signal"],
    boundary: "Not compensation truth"
  }
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function chip(text, variant) {
  return el("span", `forge-chip ${variant || ""}`.trim(), text);
}

function renderCard(card) {
  const article = el("article", "mini-card glass genesis-beta-loop-card compact");

  const top = el("div", "genesis-card-top");
  const titleWrap = el("div", "");
  titleWrap.appendChild(el("p", "eyebrow", "Genesis Beta Loop"));
  titleWrap.appendChild(el("h3", "", card.title));
  titleWrap.appendChild(el("p", "muted", card.context));
  top.appendChild(titleWrap);
  top.appendChild(chip("Review only", "gold"));
  article.appendChild(top);

  article.appendChild(el("p", "genesis-subtitle", card.subtitle));

  const chips = el("div", "genesis-card-chips compact");
  chips.appendChild(chip("Human final authority", "blue"));
  chips.appendChild(chip("Not approved", "locked"));
  chips.appendChild(chip("Not sendable", "locked"));
  chips.appendChild(chip(card.boundary, "locked"));
  article.appendChild(chips);

  article.appendChild(el("p", "genesis-draft-preview compact", card.draft));

  const evidence = el("div", "genesis-evidence-row");
  card.evidence.slice(0, 3).forEach((item) => evidence.appendChild(chip(item, "soft")));
  article.appendChild(evidence);

  article.appendChild(el("p", "article-zero-reminder compact", "Article 0: strengthen judgment, not replace it."));

  return article;
}

function main() {
  const target = document.getElementById("genesis-cards");
  if (!target) return;
  target.innerHTML = "";
  cards.forEach((card) => target.appendChild(renderCard(card)));
}

document.addEventListener("DOMContentLoaded", main);
