import "./legacy-ui-retirement.js?v=legacy-ui-retirement-001";
import { createForgeShell } from "./forge-shell.js";
import { createHomeModule } from "./home-module.js";
import { createQuotesModule } from "./quotes-module.js?v=quote-calculator-parity-006";
import { createPipelineModule } from "./pipeline-module.js?v=ui-m06-pipeline-012";
import "./pipeline-ui-stability.js?v=manual-pipeline-stability-001";
import "./pipeline-stage-rpc-authority.js?v=pipeline-stage-rpc-authority-002";
import "./pipeline-interaction-authority.js?v=pipeline-interaction-authority-001";
import "./pipeline-prospect-admin.js?v=pipeline-prospect-admin-001";
import "./pipeline-action-identity.js?v=pipeline-action-identity-001";
import "./pipeline-google-calendar.js?v=pipeline-google-calendar-001";
import "./pipeline-context-journal.js?v=pipeline-context-journal-002";
import "./pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-003";
import "./pipeline-filter-count-authority.js?v=pipeline-filter-count-001";
import "./pipeline-stage-filter-authority.js?v=pipeline-stage-filter-001";

const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const envBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const moduleBase = new URL("./", import.meta.url);
const legacyBase = new URL(sourceLayout ? "../forge-alive/" : "../forge-alive-runtime/", import.meta.url);
const advisorBase = new URL(sourceLayout ? "../../../advisor-os/sales-pipeline/" : "../../advisor-os/sales-pipeline/", import.meta.url);
const fesBase = new URL(sourceLayout ? "../../../platform/event-evidence/" : "../../platform/event-evidence/", import.meta.url);
const loadAuthority = async (base, path) => import(new URL(path, base));

function installReportingCryptoImportMap() {
  if (document.querySelector("[data-reporting-crypto-import-map]")) return;
  const importMap = document.createElement("script");
  importMap.type = "importmap";
  importMap.dataset.reportingCryptoImportMap = "true";
  importMap.textContent = JSON.stringify({
    imports: {
      "node:crypto": new URL("node-crypto-shim.mjs", import.meta.url).href,
    },
  });
  document.head.append(importMap);
}

if (!document.querySelector("[data-pipeline-prospect-admin-styles]")) {
  const adminStyles = document.createElement("link");
  adminStyles.rel = "stylesheet";
  adminStyles.href = new URL("pipeline-prospect-admin.css?v=pipeline-prospect-admin-001", import.meta.url);
  adminStyles.dataset.pipelineProspectAdminStyles = "true";
  document.head.append(adminStyles);
}

await loadAuthority(envBase, "env.js");
await loadAuthority(
  moduleBase,
  "quote-runtime-pages-rate-fetch-bridge-m05e010.js?v=m05e-010",
);
await loadAuthority(
  moduleBase,
  "quote-runtime-hotfix-m05e003.js?v=m05e-010-pages-rate",
);
await loadAuthority(
  moduleBase,
  "quote-runtime-vida-mujer-handoff-m05e009.js?v=m05e-009",
);
await loadAuthority(
  moduleBase,
  "quote-runtime-vida-mujer-visual-m05e010.js?v=m05e-010",
);
await loadAuthority(
  moduleBase,
  "quote-runtime-printable-closure-m05e006.js?v=m05e-010-landscape",
);

await loadAuthority(legacyBase, "forge-alive-public-config-067g17a1.js");
await loadAuthority(advisorBase, "productive-prospect-bootstrap.js");
if (!document.querySelector("[data-forge-auth-entry-styles]")) {
  const authStyles = document.createElement("link");
  authStyles.rel = "stylesheet";
  authStyles.href = new URL("forge-alive-auth-entry-067g17b1.css", legacyBase);
  authStyles.dataset.forgeAuthEntryStyles = "true";
  document.head.append(authStyles);
}
await loadAuthority(legacyBase, "forge-alive-auth-entry-067g17b1.js");

if (
  !globalThis.ForgeAlivePublicConfig067G17A1
  || !globalThis.ForgeProductiveProspectBootstrap067G17B
  || !globalThis.ForgeAliveAuthEntry067G17B1
) {
  document.body.insertAdjacentHTML("afterbegin", '<p role="alert" data-auth-runtime-error>No se pudo iniciar la autenticación de Forge.</p>');
  throw new Error("MATERIAL3_AUTH_AUTHORITIES_REQUIRED");
}

await loadAuthority(fesBase, "canonical-activity-event-contract.js");
await loadAuthority(fesBase, "activity-ledger-contract.js");
await loadAuthority(fesBase, "activity-ledger-local-store.js");
await loadAuthority(fesBase, "activity-ledger-sync-service.js");
await loadAuthority(fesBase, "activity-ledger-supabase-gateway.js");
await loadAuthority(fesBase, "activity-ledger-browser-runtime.js");

if (!globalThis.ForgeActivityLedgerBrowserRuntimeFES02C) {
  throw new Error("REP_16D_FES_LEDGER_BROWSER_RUNTIME_REQUIRED");
}

installReportingCryptoImportMap();
const { createActivityModule } = await import(
  "./activity-module.js?v=rep-16d-001"
);

const application = document.querySelector("[data-forge-application]");
const moduleViewport = document.querySelector(
  "[data-forge-module-viewport]",
);
const homeRoot = document.querySelector("[data-forge-home-module]");
const quotesRoot = document.querySelector("[data-forge-quotes-module]");
const pipelineRoot = document.querySelector("[data-forge-pipeline-module]");
let activityRoot = document.querySelector("[data-forge-activity-module]");

if (moduleViewport && !activityRoot) {
  activityRoot = document.createElement("section");
  activityRoot.className = "activity-module";
  activityRoot.dataset.forgeActivityModule = "true";
  activityRoot.dataset.routeModule = "actividad";
  activityRoot.hidden = true;
  activityRoot.setAttribute("aria-label", "Actividad");
  moduleViewport.append(activityRoot);
}

if (
  !application
  || !moduleViewport
  || !homeRoot
  || !quotesRoot
  || !pipelineRoot
  || !activityRoot
) {
  throw new Error("UI-M04 canonical shell boundary is incomplete");
}

const shell = createForgeShell({
  root: application,
  moduleViewport,
});
const home = createHomeModule({
  root: homeRoot,
  shell,
});
const quotes = createQuotesModule({
  root: quotesRoot,
  shell,
});
const pipeline = createPipelineModule({
  root: pipelineRoot,
  shell,
});
const activity = createActivityModule({
  root: activityRoot,
  shell,
});

shell
  .registerRouteModule("inicio", home)
  .registerRouteModule("pipeline", pipeline)
  .registerRouteModule("quotes", quotes)
  .registerRouteModule("actividad", activity);
shell.initialize();

document.documentElement.dataset.forgeCleanHomeReady = "true";
document.documentElement.dataset.forgeShellReady = "true";
document.documentElement.dataset.quoteCalculatorRuntime = "M05E-006";
document.documentElement.dataset.vidaMujerVisualClosure = "M05E-010";
document.documentElement.dataset.activityReportingRuntime = "REP-16D";
