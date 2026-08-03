import { copyFile, mkdir } from "node:fs/promises";

const navigationSource = new URL("../platform/navigation-runtime.js", import.meta.url);
const navigationTarget = new URL("../docs/platform/navigation-runtime.js", import.meta.url);

await mkdir(new URL("../docs/platform/", import.meta.url), { recursive: true });
await copyFile(navigationSource, navigationTarget);

await import("./prepare-material3-auth-entry.mjs");
await import("./forge-ui-recovery-cache-versioning.mjs");
await import("./build-advisor-presentation-pages-runtime-base.mjs");
await import("./forge-pages-transitive-cache-versioning.mjs");
