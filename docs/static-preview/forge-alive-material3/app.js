import "./authenticated-route-guard.js?v=auth-route-guard-001";
import "./login-integrated-demo.js?v=forge-demo-login-001";
import "./rep-17-session-transition-guard.js?v=rep-17c-001";
import "./legacy-ui-retirement.js?v=legacy-ui-retirement-001";
import "./quote-runtime-printable-modal-layer-m05w001.js?v=m05w-001";
import "./quote-runtime-intake-readiness-m05x001.js?v=m05x-001";
import "./person-workspace-entry-bridge.js?v=crs-09-001";
import { createForgeShell } from "./forge-shell.js";
import { createAlfredCommandRuntime } from "./alfred-command-runtime.js?v=alfred-command-runtime-002";
import { createHomeModule } from "./home-module.js";
import { createQuotesModule } from "./quotes-module.js?v=quote-calculator-parity-006";
import { createPipelineModule } from "./pipeline-module.js?v=aura-native-pipeline-002";
import { createPersonWorkspaceModule } from "./person-workspace-module.js?v=crs-09-001";
import "../quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js?v=cartera-001b-001";
import "./pipeline-action-identity.js?v=aura-native-pipeline-002";

const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const envBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const moduleBase = new URL("./", import.meta.url);
const advisorBase = new URL(
  sourceLayout
    ? "../../../advisor-os/sales-pipeline/"
    : "../../advisor-os/sales-pipeline/",
  import.meta.url,
);
const fesBase = new URL(
  sourceLayout ? "../../../platform/event-evidence/" : "../../platform/event-evidence/",
  import.meta.url,
);
const loadAuthority = (base, path) => import(new URL(path, base));

function ensureStylesheet({ selector, href, datasetKey }) {
  if (document.querySelector(selector)) return;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  stylesheet.dataset[datasetKey] = "true";
  document.head.append(stylesheet);
}

if (!document.querySelector("[data-reporting-crypto-import-map]")) {
  throw new Error("REP_16E_REPORTING_IMPORT_MAP_REQUIRED_BEFORE_APP_MODULE");
}

const application = document.querySelector("[data-forge-application]");
const moduleViewport = document.querySelector(
  "[data-forge-module-viewport]",
);
const homeRoot = document.querySelector("[data-forge-home-module]");
const quotesRoot = document.querySelector("[data-forge-quotes-module]");
const pipelineRoot = document.querySelector("[data-forge-pipeline-module]");
let activityRoot = document.querySelector("[data-forge-activity-module]");
let personWorkspaceRoot = document.querySelector("[data-forge-person-workspace-module]");

if (moduleViewport && !activityRoot) {
  activityRoot = document.createElement("section");
  activityRoot.className = "activity-module";
  activityRoot.dataset.forgeActivityModule = "true";
  activityRoot.dataset.routeModule = "actividad";
  activityRoot.hidden = true;
  activityRoot.setAttribute("aria-label", "Actividad y Reportes");
  moduleViewport.append(activityRoot);
}

if (moduleViewport && !personWorkspaceRoot) {
  personWorkspaceRoot = document.createElement("section");
  personWorkspaceRoot.className = "person-workspace-module";
  personWorkspaceRoot.dataset.forgePersonWorkspaceModule = "true";
  personWorkspaceRoot.dataset.routeModule = "persona";
  personWorkspaceRoot.hidden = true;
  personWorkspaceRoot.setAttribute("aria-label", "Workspace productivo de persona");
  moduleViewport.append(personWorkspaceRoot);
}

if (
  !application
  || !moduleViewport
  || !homeRoot
  || !quotesRoot
  || !pipelineRoot
  || !activityRoot
  || !personWorkspaceRoot
) {
  throw new Error("UI-M04 canonical shell boundary is incomplete");
}

const { createActivityModule } = await import(
  "./activity-module.js?v=rep-18-001"
);

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
const personWorkspace = createPersonWorkspaceModule({
  root: personWorkspaceRoot,
  shell,
});

shell
  .registerRouteModule("inicio", home)
  .registerRouteModule("pipeline", pipeline)
  .registerRouteModule("quotes", quotes)
  .registerRouteModule("actividad", activity)
  .registerRouteModule("persona", personWorkspace);
shell.initialize();

const alfred = createAlfredCommandRuntime({
  root: application,
  shell,
});
alfred.initialize();
globalThis.ForgeAlfredCommandRuntimeV2 = alfred;

document.documentElement.dataset.forgeCleanHomeReady = "true";
document.documentElement.dataset.forgeShellReady = "true";
document.documentElement.dataset.forgeShellBoot = "route-first";
document.documentElement.dataset.quoteCalculatorRuntime = "M05E-006";
document.documentElement.dataset.vidaMujerVisualClosure = "M05E-010";
document.documentElement.dataset.activityReportingRuntime = "REP-18";
document.documentElement.dataset.personWorkspaceContract = "CRS-09-001";
document.documentElement.dataset.pipelineRuntime = "AURA_NATIVE_002";

function authorityDatasetKey(name) {
  return `forgeAuthority${name
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("")}`;
}

function markAuthority(name, status, error = null) {
  document.documentElement.dataset[authorityDatasetKey(name)] = status;
  if (!error) return;
  document.documentElement.dataset.forgeAuthorityState = "degraded";
  console.error(`[Forge] ${name} authority failed`, error);
}

function startAuthority(base, path, name) {
  markAuthority(name, "loading");
  const task = loadAuthority(base, path);
  task
    .then(() => {
      markAuthority(name, "ready");
      shell.reconcile();
    })
    .catch((error) => {
      markAuthority(name, "failed", error);
    });
  return task;
}

function refreshActivityIfActive() {
  if (application.dataset.forgeRoute === "actividad") {
    void activity.refresh();
  }
}

function startPrintableAuthority() {
  return startAuthority(
    moduleBase,
    "quote-runtime-printable-closure-m05e006.js?v=m05e-011-eager-print-actions",
    "quote-printable",
  );
}

void startPrintableAuthority();
const environmentAuthority = loadEnvironmentAuthority();
void loadActivityAuthorities();

async function loadEnvironmentAuthority() {
  markAuthority("environment", "loading");
  try {
    await loadAuthority(envBase, "env.js");
    if (!globalThis.__ENV__ || typeof globalThis.__ENV__ !== "object") {
      throw new Error("MATERIAL3_PUBLIC_ENV_REQUIRED");
    }
    markAuthority("environment", "ready");
    shell.reconcile();
    return true;
  } catch (error) {
    markAuthority("environment", "failed", error);
    return false;
  }
}

async function loadActivityAuthorities() {
  const authorities = [
    ["canonical-activity-event-contract.js", "fes-canonical-event"],
    ["activity-ledger-contract.js", "fes-ledger-contract"],
    ["activity-ledger-local-store.js", "fes-ledger-local-store"],
    ["activity-ledger-sync-service.js", "fes-ledger-sync"],
    ["activity-ledger-supabase-gateway.js", "fes-ledger-gateway"],
    ["activity-ledger-browser-runtime.js", "fes-ledger-browser-runtime"],
  ];

  try {
    for (const [path, name] of authorities) {
      await startAuthority(fesBase, path, name);
    }

    if (!globalThis.ForgeActivityLedgerBrowserRuntimeFES02C) {
      throw new Error("REP_16E_FES_LEDGER_BROWSER_RUNTIME_REQUIRED");
    }

    document.documentElement.dataset.activityLedgerRuntime = "ready";
    refreshActivityIfActive();
  } catch (error) {
    markAuthority("activity-runtime", "failed", error);
    document.documentElement.dataset.activityLedgerRuntime = "failed";
    refreshActivityIfActive();
  }
}

async function startOptionalQuoteAuthority(path, name) {
  try {
    await startAuthority(moduleBase, path, name);
    return true;
  } catch {
    return false;
  }
}

async function loadQuoteAuthorities() {
  globalThis.ForgeQuoteIntakeReadinessM05X001?.markPreparing?.();
  try {
    await environmentAuthority;

    await startOptionalQuoteAuthority(
      "quote-runtime-pages-rate-fetch-bridge-m05e010.js?v=m05e-010",
      "quote-rate-bridge",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-hotfix-m05e003.js?v=m05q-001-loop-closure",
      "quote-rate-runtime",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-vida-mujer-handoff-m05e009.js?v=m05r-001-bridge-composition",
      "vida-mujer-handoff",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-bridge-composition-m05r001.js?v=m05r-001",
      "quote-bridge-composition",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-client-identity-transfer-m05v001.js?v=m05v-001",
      "quote-client-identity",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-client-identity-persistence-m05y001.js?v=m05y-002-single-m05z-instance",
      "quote-client-identity-persistence",
    );
    await startOptionalQuoteAuthority(
      "quote-runtime-vida-mujer-visual-m05e010.js?v=m05t-001-coalesced",
      "vida-mujer-visual",
    );
  } finally {
    globalThis.ForgeQuoteIntakeReadinessM05X001?.markReady?.();
  }
}

function showAuthRuntimeError() {
  if (document.querySelector("[data-auth-runtime-error]")) return;
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<p role="alert" data-auth-runtime-error>No se pudo iniciar la autenticación de Forge.</p>',
  );
}

async function loadAuthAuthorities() {
  ensureStylesheet({
    selector: "[data-forge-auth-entry-styles]",
    href: new URL("forge-alive-auth-entry-067g17b1.css", moduleBase).href,
    datasetKey: "forgeAuthEntryStyles",
  });

  try {
    const environmentLoaded = await environmentAuthority;
    if (!environmentLoaded) {
      throw new Error("MATERIAL3_PUBLIC_ENV_REQUIRED");
    }

    await startAuthority(
      moduleBase,
      "forge-alive-public-config-067g17a1.js",
      "public-config",
    );
    await startAuthority(
      advisorBase,
      "productive-prospect-bootstrap.js",
      "productive-bootstrap",
    );
    await startAuthority(
      moduleBase,
      "forge-alive-auth-entry-067g17b1.js",
      "auth-entry",
    );

    if (
      !globalThis.ForgeAlivePublicConfig067G17A1
      || !globalThis.ForgeProductiveProspectBootstrap067G17B
      || !globalThis.ForgeAliveAuthEntry067G17B1
    ) {
      throw new Error("MATERIAL3_AUTH_AUTHORITIES_REQUIRED");
    }

    document.documentElement.dataset.forgeAuthRuntime = "ready";
    shell.reconcile();
    alfred.syncSuggestions();
    refreshActivityIfActive();
  } catch (error) {
    markAuthority("auth-runtime", "failed", error);
    showAuthRuntimeError();
    refreshActivityIfActive();
  }
}

void loadQuoteAuthorities();
void loadAuthAuthorities();
