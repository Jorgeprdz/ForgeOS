import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adapter = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-accepted-quote-adapter.js",
    import.meta.url,
  ),
  "utf8",
);
const bridge = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  adapter,
  /from\s+["']\.\/forge-orvi-static-preview-runtime\.js\?v=r15l_orvi_runtime_20260712_1["']/,
);
assert.match(adapter, /\bisOrviAcceptedQuotePacket\b/);
assert.match(adapter, /\bbuildOrviAcceptedQuoteCalculation\b/);
assert.match(
  adapter,
  /if\s*\(\s*isOrviAcceptedQuotePacket\s*\(\s*enrichedPacket\s*,\s*nativeResult\s*\)\s*\)\s*\{\s*return\s+buildOrviAcceptedQuoteCalculation/s,
);

const orviIndex = adapter.indexOf(
  "if (isOrviAcceptedQuotePacket(enrichedPacket, nativeResult))",
);
const vidaIndex = adapter.indexOf(
  "if (isVidaMujerAccepted107z15p2R9C(enrichedPacket, nativeResult))",
);
const segubecaIndex = adapter.indexOf(
  "if (isSegubecaAcceptedR14E(enrichedPacket, nativeResult))",
);
assert.ok(orviIndex >= 0);
assert.ok(vidaIndex > orviIndex);
assert.ok(segubecaIndex > vidaIndex);

assert.match(
  bridge,
  /forge-accepted-quote-adapter\.js\?v=r15l_orvi_end_to_end_20260712_1/,
);
assert.match(
  bridge,
  /forge-benefit-summary-renderer\.js\?v=r15l_orvi_end_to_end_20260712_1/,
);

console.log("PASS R15L ORVI accepted-quote runtime wiring", {
  orviRouteBeforeExistingProducts: true,
  acceptedAdapterVersionBumped: true,
  rendererVersionBumped: true,
});
