import { copyFile, mkdir } from "node:fs/promises";

await mkdir(new URL("../docs/platform/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../platform/navigation-runtime.js", import.meta.url),
  new URL("../docs/platform/navigation-runtime.js", import.meta.url),
);

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
