import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderer = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  renderer,
  /from\s+["']\.\/forge-orvi-product-dashboard-adapter\.js["']/,
);
assert.match(renderer, /\bbuildOrviDashboardModel\b/);
assert.match(renderer, /\bisOrviProduct\b/);
assert.match(renderer, /\brenderOrviDashboard\b/);
assert.match(
  renderer,
  /function\s+renderOrviBenefitSummary\s*\(\s*calc\s*,\s*benefitSummary\s*\)/,
);

assert.match(
  renderer,
  /!renderOrviBenefitSummary\s*\(\s*calc\s*,\s*benefitSummary\s*\)\s*&&\s*!renderSegubecaBenefitSummary\s*\(\s*calc\s*,\s*benefitSummary\s*\)\s*&&\s*!renderImaginaSerBenefitSummary\s*\(\s*calc\s*,\s*benefitSummary\s*\)/s,
);
assert.match(
  renderer,
  /!renderOrviBenefitSummary\s*\(\s*calc\s*,\s*lateSummary\s*\)\s*&&\s*!renderSegubecaBenefitSummary\s*\(\s*calc\s*,\s*lateSummary\s*\)\s*&&\s*!renderImaginaSerBenefitSummary\s*\(\s*calc\s*,\s*lateSummary\s*\)/s,
);

assert.match(
  renderer,
  /buildOrviDashboardModel\s*\(\s*\{\s*\.\.\.\(\s*calc\s*\|\|\s*\{\}\s*\)\s*,\s*benefitSummary\s*\}\s*\)/s,
);
assert.match(
  renderer,
  /renderOrviDashboard\s*\(\s*model\s*,\s*\{\s*appendValue:\s*appendSemanticValue\s*\}\s*\)/s,
);
assert.match(renderer, /normalizeBenefitLayout107z15p2R9E\s*\(\s*\)/);
assert.equal(
  (
    renderer.match(
      /!renderOrviBenefitSummary\s*\(\s*calc\s*,/g,
    ) || []
  ).length,
  2,
);

console.log("PASS R15K ORVI benefit summary renderer wiring", {
  orviImport: true,
  directRoute: true,
  lateRoute: true,
  routePrecedence: "ORVI_BEFORE_SEGUBECA_BEFORE_IMAGINA_SER",
  sharedLayoutNormalization: true,
});
