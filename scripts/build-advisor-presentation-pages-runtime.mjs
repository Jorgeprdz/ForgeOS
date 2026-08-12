import { copyFile, mkdir } from "node:fs/promises";

const directRuntimeCopies = Object.freeze([
  ["../platform/navigation-runtime.js", "../docs/platform/navigation-runtime.js"],
  ["../platform/portfolio-intelligence/cartera-050d-future-radar-view.js", "../docs/platform/portfolio-intelligence/cartera-050d-future-radar-view.js"],
  ["../platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js", "../docs/platform/portfolio-intelligence/cartera-050e-actionable-payment-recommendation-017e.js"],
]);

await mkdir(new URL("../docs/platform/portfolio-intelligence/", import.meta.url), { recursive: true });
for (const [source, target] of directRuntimeCopies) {
  await copyFile(new URL(source, import.meta.url), new URL(target, import.meta.url));
}

await import("./prepare-material3-auth-entry.mjs");
await import("./prepare-material3-runtime-fail-closed.mjs");
await import("./forge-ui-recovery-cache-versioning.mjs");
await import("./build-advisor-presentation-pages-runtime-base.mjs");
await import("./prepare-advisor-forecast-pages-runtime.mjs");
await import("./prepare-mick-goal-gap-pages-runtime.mjs");
await import("./prepare-cartera-policy-entry-pages-runtime.mjs");
await import("./prepare-cartera-canonical-pages-runtime.mjs");
await import("./prepare-aura-home-pages-authorities.mjs");
await import("./prepare-gmm-quote-pages-runtime.mjs");
await import("./forge-pages-transitive-cache-versioning.mjs");
