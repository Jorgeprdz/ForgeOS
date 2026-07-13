import assert from "node:assert/strict";

import {
  activateOrviDashboardView,
  buildOrviDashboardModel,
  renderOrviDashboard,
} from "../docs/static-preview/quote-preview-live/forge-orvi-product-dashboard-adapter.js";

function createFakeDocument() {
  return {
    createElement(tag) {
      const listeners = new Map();
      return {
        tagName: String(tag).toUpperCase(),
        className: "",
        dataset: {},
        children: [],
        attributes: {},
        textContent: "",
        hidden: false,
        tabIndex: 0,
        append(...nodes) {
          this.children.push(...nodes);
        },
        appendChild(node) {
          this.children.push(node);
          return node;
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
        getAttribute(name) {
          return this.attributes[name] ?? null;
        },
        addEventListener(type, handler) {
          listeners.set(type, handler);
        },
        click() {
          listeners.get("click")?.();
          if (!listeners.has("click") && typeof this.onclick === "function") {
            this.onclick();
          }
        },
      };
    },
  };
}

function money(value, currency) {
  return { value, currency, status: "available" };
}

function checkpoint(year) {
  return {
    policy_year: year,
    payment_phase:
      year === 10 ? "payment_completion" : "post_payment",
    source_currency: {
      cumulative_paid: money(1200, "UDI"),
      surrender_value: money(year * 500, "UDI"),
      cash_value: money(year * 300, "UDI"),
      total_recovery: money(year * 800, "UDI"),
      recovery_percentage: 100,
    },
    current_mxn: {
      status: "complete",
      cumulative_paid: money(12000, "MXN"),
      surrender_value: money(year * 5000, "MXN"),
      cash_value: money(year * 3000, "MXN"),
      total_recovery: money(year * 8000, "MXN"),
      recovery_difference: money(year * 8000 - 12000, "MXN"),
      recovery_percentage: 100,
    },
    future_mxn: {
      status: "complete",
      projected_rate: {
        value: 10 * 1.045 ** (year - 1),
      },
      cumulative_paid: money(15000, "MXN"),
      surrender_value: money(year * 6000, "MXN"),
      cash_value: money(year * 4000, "MXN"),
      total_recovery: money(year * 9000, "MXN"),
      recovery_difference: money(year * 9000 - 15000, "MXN"),
      recovery_percentage: 120,
      future_values_are_guaranteed: false,
    },
  };
}

const viewModel = {
  view_model_id:
    "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
  canonical_owner: "product-intelligence",
  source_currency: "UDI",
  payment_term_years: 10,
  checkpoint_years: [10, 15, 20],
  navigation: [
    { view_id: "protection", label: "Protección" },
    {
      view_id: "guaranteed_recovery",
      label: "Recuperación garantizada",
    },
  ],
  rate_context: {
    source_date: "01/01/2099",
  },
  views: {
    protection: {
      title: "Protección",
      source_sum_assured: money(50000, "UDI"),
      current_mxn_equivalence: money(500000, "MXN"),
      future_checkpoint_scenarios: [10, 15, 20].map(
        (policyYear) => ({
          policy_year: policyYear,
          projected_rate: {
            value: 10 * 1.045 ** (policyYear - 1),
          },
          projected_sum_assured_mxn: money(
            500000 * 1.045 ** (policyYear - 1),
            "MXN",
          ),
          future_values_are_guaranteed: false,
        }),
      ),
      labels: {
        source_sum_assured: "Suma asegurada contratada",
        current_mxn_equivalence: "Equivalencia actual en MXN",
      },
    },
    guaranteed_recovery: {
      checkpoints: [10, 15, 20].map(checkpoint),
    },
  },
  disclosure_contract: {
    future_values_are_guaranteed: false,
    recommendation: null,
    human_decision_required: true,
  },
};

const model = buildOrviDashboardModel({
  orviDashboardViewModel: viewModel,
});
const dashboard = renderOrviDashboard(model, {
  documentRef: createFakeDocument(),
});

assert.equal(
  dashboard.dataset.forgeOrviResponsiveContract,
  "r15m",
);
assert.equal(
  dashboard.dataset.forgeOrviActiveView,
  "protection",
);

const switcher = dashboard.children[0];
assert.equal(
  switcher.dataset.forgeOrviViewSwitcher,
  "true",
);
assert.equal(
  switcher.getAttribute("aria-label"),
  "Vistas del dashboard ORVI",
);
assert.equal(switcher.children.length, 2);

const [protectionButton, recoveryButton] = switcher.children;
assert.equal(protectionButton.textContent, "Protección");
assert.equal(recoveryButton.textContent, "Recuperación garantizada");
assert.equal(protectionButton.getAttribute("aria-label"), "Protección");
assert.equal(
  recoveryButton.getAttribute("aria-label"),
  "Recuperación garantizada",
);
assert.equal(
  protectionButton.dataset.forgeOrviViewActive,
  "true",
);
assert.equal(
  recoveryButton.dataset.forgeOrviViewActive,
  "false",
);
assert.equal(protectionButton.getAttribute("aria-pressed"), "true");
assert.equal(recoveryButton.getAttribute("aria-pressed"), "false");

const sections = dashboard.__forgeOrviViewSections;
const protectionSections = sections.filter(
  (section) =>
    section.dataset.forgeOrviView === "protection",
);
const recoverySections = sections.filter(
  (section) =>
    section.dataset.forgeOrviView === "guaranteed_recovery",
);
const sharedSections = sections.filter(
  (section) => section.dataset.forgeOrviView === "shared",
);

assert.equal(protectionSections.length, 2);
assert.equal(recoverySections.length, 3);
assert.deepEqual(
  recoverySections.map(
    (section) => section.dataset.forgeOrviSectionOrdinal,
  ),
  ["1", "2", "3"],
);
assert.ok(sharedSections.length >= 1);
assert.equal(
  protectionSections.every((section) => section.hidden === false),
  true,
);
assert.equal(
  recoverySections.every((section) => section.hidden === true),
  true,
);
assert.equal(
  sharedSections.every((section) => section.hidden === false),
  true,
);

recoveryButton.click();

assert.equal(
  dashboard.dataset.forgeOrviActiveView,
  "guaranteed_recovery",
);
assert.equal(
  protectionSections.every((section) => section.hidden === true),
  true,
);
assert.equal(
  recoverySections.every((section) => section.hidden === false),
  true,
);
assert.equal(
  sharedSections.every((section) => section.hidden === false),
  true,
);
assert.equal(protectionButton.getAttribute("aria-pressed"), "false");
assert.equal(recoveryButton.getAttribute("aria-pressed"), "true");

activateOrviDashboardView(dashboard, "protection");
assert.equal(
  dashboard.dataset.forgeOrviActiveView,
  "protection",
);

console.log("PASS R15M ORVI dashboard view navigation", {
  defaultView: "protection",
  alternateView: "guaranteed_recovery",
  protectionSections: protectionSections.length,
  recoverySections: recoverySections.length,
  sharedSections: sharedSections.length,
  ariaPressed: true,
  minimumTouchTargetContract: 44,
});
