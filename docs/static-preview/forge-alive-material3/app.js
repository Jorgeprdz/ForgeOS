import { createForgeShell } from "./forge-shell.js";
import { createHomeModule } from "./home-module.js";
import { createQuotesModule } from "./quotes-module.js?v=quote-calculator-parity-005";
import { createPipelineModule } from "./pipeline-module.js?v=ui-m06-pipeline-010";
import "./pipeline-ui-stability.js?v=manual-pipeline-stability-001";
import "./pipeline-interaction-authority.js?v=pipeline-interaction-authority-001";
import "./quote-runtime-hotfix-m05e003.js?v=m05e-003";
import "./quote-runtime-printable-closure-m05e005.js?v=m05e-005";

const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const envBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const legacyBase = new URL(sourceLayout ? "../forge-alive/" : "../forge-alive-runtime/", import.meta.url);
const advisorBase = new URL(sourceLayout ? "../../../advisor-os/sales-pipeline/" : "../../advisor-os/sales-pipeline/", import.meta.url);
const loadAuthority = async (base, path) => import(new URL(path, base));

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
document.documentElement.dataset.quoteCalculatorRuntime = "M05E-005";
