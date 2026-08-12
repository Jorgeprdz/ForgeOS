import { createHomeModule as createBaseHomeModule } from "./home-module.js?v=forge-home-017d-base";
import { createHomePagesAdapter } from "./home-adapter-pages-v1.js";
import { createAuraDecisionControl } from "./home-decision-control-017c.js?v=forge-commercial-leverage-017c";
import { createAuraPresentationEvidenceControl } from "./home-presentation-evidence-017e.js?v=forge-commercial-pilot-evidence-017e";
import {
  clearRecommendationDecisionLineage,
  setRecommendationDecisionLineage,
} from "../recommendation-lineage-session-017e.js?v=forge-commercial-pilot-evidence-017e";

function decisionReference(item) {
  return String(item?.decisionReference || "").trim();
}

function lineageFor(item, decision, advisorId) {
  const ref = decisionReference(item);
  if (!ref || !decision || decision.tenant_id !== advisorId) return null;
  if (!['ACCEPTED', 'MODIFIED'].includes(decision.payload?.decision)) return null;
  if (decision.payload?.recommendation_reference !== ref) return null;
  if (Number.isNaN(Date.parse(decision.occurred_at))) return null;
  return Object.freeze({
    advisorId,
    recommendationReference: ref,
    recommendationVersion: item.recommendationVersion || item.provenance?.recommendationVersion || null,
    decisionEventId: decision.event_id,
    decisionOccurredAt: decision.occurred_at,
    decision: decision.payload.decision,
    subjectType: item.subject?.type || null,
    subjectReference: item.subject?.reference || null,
    actionOwner: item.actionOwner || null,
    actionTarget: item.actionTarget || null,
  });
}

export function createHomeModule(options = {}) {
  const { root, client, user, globalState, onNavigate } = options;
  if (!root || !client || !user?.id) throw new Error("AURA_HOME_017E_AUTHENTICATED_CONTEXT_REQUIRED");

  let latestSnapshot = null;
  let scheduled = false;
  const presentationControl = createAuraPresentationEvidenceControl({ client, user });
  const decisionReader = createAuraDecisionControl({ client, user, globalState: null });
  const originalFactory = options.homeAdapterFactory || createHomePagesAdapter;

  const instrumentedFactory = async factoryOptions => {
    const adapter = await originalFactory(factoryOptions);
    return Object.freeze({
      ...adapter,
      async load(request = {}) {
        const snapshot = await adapter.load(request);
        latestSnapshot = snapshot;
        return snapshot;
      },
    });
  };

  function renderedRecommendationItems() {
    const refs = new Set(
      [...root.querySelectorAll("[data-decision-reference]")]
        .filter(card => card.querySelector("[data-home-decision-control]"))
        .map(card => String(card.dataset.decisionReference || "").trim())
        .filter(Boolean),
    );
    return (latestSnapshot?.attention?.value?.items || []).filter(item => refs.has(decisionReference(item)));
  }

  function observePresentedRecommendations() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      const items = renderedRecommendationItems();
      if (!items.length) return;
      void presentationControl.presentAll(items, {
        presentationSurface: "AURA_HOME",
        presentedAt: new Date().toISOString(),
      }).catch(error => {
        console.warn("AURA_RECOMMENDATION_PRESENTATION_EVIDENCE_FAILED", error?.code || error?.message);
      });
      void decisionReader.read().catch(error => {
        console.warn("AURA_017E_DECISION_LINEAGE_READ_FAILED", error?.code || error?.message);
      });
    });
  }

  const observer = new MutationObserver(() => observePresentedRecommendations());

  async function navigateFromRecommendation(route, ref) {
    const item = latestSnapshot?.attention?.value?.items?.find(candidate => decisionReference(candidate) === ref) || null;
    let lineage = null;
    try {
      await decisionReader.read();
      lineage = item ? lineageFor(item, decisionReader.latest(ref), user.id) : null;
    } catch (error) {
      console.warn("AURA_017E_DECISION_LINEAGE_READ_FAILED", error?.code || error?.message);
    }
    if (lineage) setRecommendationDecisionLineage(lineage);
    else clearRecommendationDecisionLineage(user.id);
    onNavigate?.(route);
  }

  function captureRecommendationNavigation(event) {
    const button = event.target.closest?.("[data-home-route]");
    const card = button?.closest?.("[data-decision-reference]");
    const ref = String(card?.dataset?.decisionReference || "").trim();
    if (!button || !card || !ref || !root.contains(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void navigateFromRecommendation(button.dataset.homeRoute, ref);
  }

  const base = createBaseHomeModule({
    ...options,
    homeAdapterFactory: instrumentedFactory,
    onNavigate: route => {
      clearRecommendationDecisionLineage(user.id);
      onNavigate?.(route);
    },
  });

  return Object.freeze({
    ...base,
    async mount() {
      root.addEventListener("click", captureRecommendationNavigation, true);
      observer.observe(root, { childList: true, subtree: true });
      await base.mount();
      observePresentedRecommendations();
    },
    async unmount() {
      observer.disconnect();
      root.removeEventListener("click", captureRecommendationNavigation, true);
      return base.unmount?.();
    },
    async scrub(reason = "session-scrub") {
      observer.disconnect();
      root.removeEventListener("click", captureRecommendationNavigation, true);
      clearRecommendationDecisionLineage(user.id);
      return base.scrub?.(reason);
    },
    async destroy() {
      observer.disconnect();
      root.removeEventListener("click", captureRecommendationNavigation, true);
      void presentationControl.close();
      void decisionReader.close();
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        ...base.diagnostics?.(),
        presentationEvidence: "RECOMMENDATION_PRESENTED",
        presentedDoesNotMeanViewed: true,
        decisionLineageTransport: "EPHEMERAL_ONLY",
      });
    },
  });
}
