import "./legacy-ui-retirement.js?v=legacy-ui-retirement-001";
import { createForgeShell } from "./forge-shell.js";
import { createHomeModule } from "./home-module.js";
import { createQuotesModule } from "./quotes-module-complete.js?v=manual-quotes-complete-001";
import { createPipelineModule } from "./pipeline-module.js?v=ui-m06-pipeline-012";
import "./pipeline-ui-stability.js?v=manual-pipeline-stability-001";
import "./pipeline-stage-rpc-authority.js?v=pipeline-stage-rpc-authority-002";
import "./pipeline-interaction-authority.js?v=pipeline-interaction-authority-001";
import "./pipeline-prospect-admin.js?v=pipeline-prospect-admin-001";
import "./pipeline-action-identity.js?v=pipeline-action-identity-001";
import "./pipeline-calendar-action.js?v=pipeline-calendar-action-001";
import "./pipeline-context-journal.js?v=pipeline-context-journal-002";
import "./pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-003";
import "./pipeline-filter-count-authority.js?v=pipeline-filter-count-001";
import "./pipeline-stage-filter-authority.js?v=pipeline-stage-filter-001";

const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const envBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const legacyBase = new URL(sourceLayout ? "../forge-alive/" : "../forge-alive-runtime/", import.meta.url);
const advisorBase = new URL(sourceLayout ? "../../../advisor-os/sales-pipeline/" : "../../advisor-os/sales-pipeline/", import.meta.url);
const loadAuthority = async (base, path) => import(new URL(path, base));

if (!document.querySelector("[data-pipeline-prospect-admin-styles]")) {
  const adminStyles = document.createElement("link");
  adminStyles.rel = "stylesheet";
  adminStyles.href = new URL("pipeline-prospect-admin.css?v=pipeline-prospect-admin-001", import.meta.url);
  adminStyles.dataset.pipelineProspectAdminStyles = "true";
  document.head.append(adminStyles);
}

await loadAuthority(envBase, "env.js");
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

const application = document.querySelector("[data-forge-application]");
const moduleViewport = document.querySelector(
  "[data-forge-module-viewport]",
);
const homeRoot = document.querySelector("[data-forge-home-module]");
const quotesRoot = document.querySelector("[data-forge-quotes-module]");
const pipelineRoot = document.querySelector("[data-forge-pipeline-module]");

if (!application || !moduleViewport || !homeRoot || !quotesRoot || !pipelineRoot) {
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

shell
  .registerRouteModule("inicio", home)
  .registerRouteModule("pipeline", pipeline)
  .registerRouteModule("quotes", quotes);
shell.initialize();

document.documentElement.dataset.forgeCleanHomeReady = "true";
document.documentElement.dataset.forgeShellReady = "true";
