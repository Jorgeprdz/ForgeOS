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
const legacyBase = new URL(
  sourceLayout ? "../forge-alive/" : "../forge-alive-runtime/",
  import.meta.url,
);
const advisorBase = new URL(
  sourceLayout ? "../../../advisor-os/sales-pipeline/" : "../../advisor-os/sales-pipeline/",
  import.meta.url,
);
const loadAuthority = (base, path) => import(new URL(path, base));

const quoteAuthorityStages = Object.freeze([
  "core",
  "printable",
  "rate-bridge",
  "rate-runtime",
  "vida-handoff",
  "composition",
  "visual",
]);
const requestedIsolationStage = new URL(globalThis.location.href)
  .searchParams.get("m05s");
const quoteAuthorityStage = quoteAuthorityStages.includes(requestedIsolationStage)
  ? requestedIsolationStage
  : "visual";
const quoteAuthorityStageIndex = quoteAuthorityStages.indexOf(
  quoteAuthorityStage,
);
const allowsQuoteAuthorityStage = (stage) => (
  quoteAuthorityStageIndex >= quoteAuthorityStages.indexOf(stage)
);

function ensureStylesheet({ selector, href, datasetKey }) {
  if (document.querySelector(selector)) return;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  stylesheet.dataset[datasetKey] = "true";
  document.head.append(stylesheet);
}

ensureStylesheet({
  selector: "[data-pipeline-prospect-admin-styles]",
  href: new URL(
    "pipeline-prospect-admin.css?v=pipeline-prospect-admin-001",
    import.meta.url,
  ).href,
  datasetKey: "pipelineProspectAdminStyles",
});

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
document.documentElement.dataset.forgeShellBoot = "route-first";
document.documentElement.dataset.quoteCalculatorRuntime = "M05E-006";
document.documentElement.dataset.vidaMujerVisualClosure = "M05E-010";
document.documentElement.dataset.forgeM05sStage = quoteAuthorityStage;

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

function startPrintableAuthority() {
  return startAuthority(
    moduleBase,
    "quote-runtime-printable-closure-m05e006.js?v=m05e-011-eager-print-actions",
    "quote-printable",
  );
}

// Printing remains eager in normal execution. M05S can stop before this stage
// to prove whether the base PDF intake is responsive without enrichments.
if (allowsQuoteAuthorityStage("printable")) {
  void startPrintableAuthority();
} else {
  markAuthority("quote-printable", "isolated");
}
const environmentAuthority = loadEnvironmentAuthority();

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

async function startOptionalQuoteAuthority(path, name) {
  try {
    await startAuthority(moduleBase, path, name);
    return true;
  } catch {
    return false;
  }
}

async function loadQuoteAuthorities() {
  // Rate-dependent quote enhancements must wait for the same public environment.
  await environmentAuthority;

  if (!allowsQuoteAuthorityStage("rate-bridge")) {
    markAuthority("quote-rate-bridge", "isolated");
    return;
  }
  await startOptionalQuoteAuthority(
    "quote-runtime-pages-rate-fetch-bridge-m05e010.js?v=m05e-010",
    "quote-rate-bridge",
  );

  if (!allowsQuoteAuthorityStage("rate-runtime")) {
    markAuthority("quote-rate-runtime", "isolated");
    return;
  }
  // Wrapper order is contractual. Parallel imports previously allowed M05E-003
  // and Vida Mujer to wrap each other repeatedly until the browser stalled.
  await startOptionalQuoteAuthority(
    "quote-runtime-hotfix-m05e003.js?v=m05q-001-loop-closure",
    "quote-rate-runtime",
  );

  if (!allowsQuoteAuthorityStage("vida-handoff")) {
    markAuthority("vida-mujer-handoff", "isolated");
    return;
  }
  await startOptionalQuoteAuthority(
    "quote-runtime-vida-mujer-handoff-m05e009.js?v=m05r-001-bridge-composition",
    "vida-mujer-handoff",
  );

  if (!allowsQuoteAuthorityStage("composition")) {
    markAuthority("quote-bridge-composition", "isolated");
    return;
  }
  await startOptionalQuoteAuthority(
    "quote-runtime-bridge-composition-m05r001.js?v=m05r-001",
    "quote-bridge-composition",
  );

  if (!allowsQuoteAuthorityStage("visual")) {
    markAuthority("vida-mujer-visual", "isolated");
    return;
  }
  await startOptionalQuoteAuthority(
    "quote-runtime-vida-mujer-visual-m05e010.js?v=m05r-001",
    "vida-mujer-visual",
  );
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
    href: new URL("forge-alive-auth-entry-067g17b1.css", legacyBase).href,
    datasetKey: "forgeAuthEntryStyles",
  });

  try {
    const environmentLoaded = await environmentAuthority;
    if (!environmentLoaded) {
      throw new Error("MATERIAL3_PUBLIC_ENV_REQUIRED");
    }

    await startAuthority(
      legacyBase,
      "forge-alive-public-config-067g17a1.js",
      "public-config",
    );
    await startAuthority(
      advisorBase,
      "productive-prospect-bootstrap.js",
      "productive-bootstrap",
    );
    await startAuthority(
      legacyBase,
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
  } catch (error) {
    markAuthority("auth-runtime", "failed", error);
    showAuthRuntimeError();
  }
}

void loadQuoteAuthorities();
void loadAuthAuthorities();
