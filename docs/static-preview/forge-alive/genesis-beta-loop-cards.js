// genesis-beta-loop-cards.js
// Renders Genesis Beta Loop UI read‑model cards in the static preview.
// This script runs in the Forge Alive static preview (type="module").
// It builds a read‑only model from a fixture and injects cards into the
// #genesis-cards container using the existing glass‑card styling.

import { buildGenesisBetaLoopUiReadModel } from "../../manager-os/genesis-beta-loop/genesis-beta-loop-ui-read-model.js";
import { buildJorgeMariaFollowup15DaysFixture } from "../../manager-os/genesis-beta-loop/fixtures/jorge-maria-followup-15-days.fixture.js";

/**
 * Simple utility to create an element with optional class list and innerHTML.
 */
function el(tag, classList = [], html = "") {
  const e = document.createElement(tag);
  if (classList.length) e.classList.add(...classList);
  if (html) e.innerHTML = html;
  return e;
}

/** Render a single card based on the read‑model definition. */
function renderCard(card) {
  const container = el("div", ["mini-card", "glass"]);
  // Title
  const title = el("h3", [], card.title);
  container.appendChild(title);
  // Subtitle (optional)
  if (card.subtitle) {
    const subtitle = el("p", ["eyebrow"], card.subtitle);
    container.appendChild(subtitle);
  }
  // Status badge
  const status = el("span", ["badge", "status"], card.statusLabel);
  container.appendChild(status);
  // Decision badge
  const decision = el("span", ["badge", "decision"], card.decisionLabel);
  container.appendChild(decision);
  // Evidence summary (list of refs)
  if (card.evidenceSummary && card.evidenceSummary.evidenceRefs?.length) {
    const ev = el("ul", ["evidence-list"]);
    card.evidenceSummary.evidenceRefs.forEach(ref => {
      ev.appendChild(el("li", [], ref));
    });
    container.appendChild(ev);
  }
  // Uncertainty warnings (if any)
  if (card.uncertaintySummary && card.uncertaintySummary.warnings?.length) {
    const uw = el("ul", ["warning-list"]);
    card.uncertaintySummary.warnings.forEach(w => {
      uw.appendChild(el("li", [], w));
    });
    container.appendChild(uw);
  }
  return container;
}

function main() {
  // Build the static read‑model using the fixture.
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const readModel = buildGenesisBetaLoopUiReadModel(fixture);

  const target = document.getElementById("genesis-cards");
  if (!target) return;
  // Clear any placeholder content.
  target.innerHTML = "";
  readModel.cards.forEach(card => {
    const cardEl = renderCard(card);
    target.appendChild(cardEl);
  });
}

// Execute when DOM is ready.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
