const CONTRACT_ID = "CARTERA_MATERIAL3_PRODUCTIVE_UI_MOUNT_V1";
const moduleStateKey = Symbol.for("forge.cartera.material3.productive.state");

const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const repositoryBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const moduleUrl = (path) => new URL(path, repositoryBase);

function ensureStylesheet() {
  if (document.querySelector("[data-cartera-material3-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "cartera-module.css?v=cartera-material3-productive-001",
    import.meta.url,
  ).href;
  link.dataset.carteraMaterial3Styles = "true";
  document.head.append(link);
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function waitForProductiveBootstrap() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (
      typeof bootstrap?.getClient === "function"
      && typeof bootstrap?.getUser === "function"
    ) {
      return bootstrap;
    }
    await wait(50);
  }
  throw Object.assign(
    new Error("CARTERA_MATERIAL3_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE"),
    { code: "BOOTSTRAP_UNAVAILABLE" },
  );
}

async function loadProductModules() {
  const [
    runtime,
    memory,
    cartera,
    paymentCalendar,
    relationshipMemory,
    futureRadar,
    relationshipGrowth,
    relationalActivation,
    economicConnection,
    relationshipCapital,
    productivityProof,
  ] = await Promise.all([
    import(moduleUrl("supabase-runtime.js")),
    import(moduleUrl("memory-manager.js")),
    import(moduleUrl("cartera.js")),
    import(moduleUrl("advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-040d-relationship-memory-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-050d-future-radar-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-060d-relationship-growth-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-070d-relational-activation-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-080d-economic-connection-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-090d-relationship-capital-enhancement.js")),
    import(moduleUrl("advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js")),
  ]);

  return Object.freeze({
    SupabaseRuntime: runtime.SupabaseRuntime,
    Memory: memory.Memory,
    renderCartera: cartera.renderCartera,
    bindCarteraEvents: cartera.bindCarteraEvents,
    binders: Object.freeze([
      paymentCalendar.bindCartera030dPolicyPaymentCalendar,
      relationshipMemory.bindCartera040RelationshipMemory,
      futureRadar.bindCartera050FutureRadar,
      relationshipGrowth.bindCartera060RelationshipGrowth,
      relationalActivation.bindCartera070RelationalActivation,
      economicConnection.bindCartera080EconomicConnection,
      relationshipCapital.bindCartera090RelationshipCapital,
      productivityProof.bindCartera100ProductivityProof,
    ]),
  });
}

function renderLoading(root) {
  root.dataset.carteraMaterial3State = "loading";
  root.innerHTML = `
    <section class="cartera-m3-state cartera-m3-state--loading" aria-live="polite">
      <span class="cartera-m3-spinner" aria-hidden="true"></span>
      <div>
        <p class="section-kicker accent">CARTERA</p>
        <h1>Abriendo tu cartera productiva</h1>
        <p>Validando sesión, directorio canónico y fuentes autorizadas.</p>
      </div>
    </section>
  `;
}

function renderAuthRequired(root) {
  root.dataset.carteraMaterial3State = "auth-required";
  root.innerHTML = `
    <section class="cartera-m3-state cartera-m3-state--auth" aria-live="polite">
      <span class="cartera-m3-state-icon" aria-hidden="true">◇</span>
      <div>
        <p class="section-kicker accent">CARTERA</p>
        <h1>Inicia sesión para ver tu cartera</h1>
        <p>Personas, cuentas, pólizas y señales relacionales sólo se muestran dentro de una sesión productiva.</p>
        <button
          type="button"
          class="cartera-m3-primary"
          data-forge-auth-open
          data-forge-auth-open-nav="cartera"
        >Iniciar sesión</button>
      </div>
    </section>
  `;
}

function renderFailure(root, error) {
  const code = error?.code || error?.message || "CARTERA_MATERIAL3_LOAD_FAILED";
  root.dataset.carteraMaterial3State = "error";
  root.innerHTML = `
    <section class="cartera-m3-state cartera-m3-state--error" aria-live="polite">
      <span class="cartera-m3-state-icon" aria-hidden="true">!</span>
      <div>
        <p class="section-kicker accent">CARTERA</p>
        <h1>No pudimos validar la fuente</h1>
        <p>No mostraremos datos locales o incompletos como si fueran tu cartera productiva.</p>
        <button type="button" class="cartera-m3-secondary" data-cartera-retry>Reintentar</button>
        <small>${String(code).replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</small>
      </div>
    </section>
  `;
}

function captureSessionCleaners(memory, startIndex) {
  if (!Array.isArray(memory?.cleaners)) return [];
  if (memory.cleaners.length <= startIndex) return [];
  return memory.cleaners.splice(startIndex);
}

function runCleaners(cleaners) {
  for (const cleaner of cleaners.splice(0)) {
    try {
      cleaner();
    } catch (error) {
      console.error("[CARTERA MATERIAL3 CLEANUP]", error);
    }
  }
}

export function createCarteraModule({ root, shell } = {}) {
  if (!root) throw new Error("CARTERA_MATERIAL3_ROOT_REQUIRED");
  if (!shell) throw new Error("CARTERA_MATERIAL3_SHELL_REQUIRED");
  if (root[moduleStateKey]) return root[moduleStateKey].api;

  ensureStylesheet();
  const lifecycleController = new AbortController();
  const { signal } = lifecycleController;
  const sessionCleaners = [];
  let mounted = false;
  let generation = 0;
  let productModulesPromise = null;
  let activeAdvisorId = null;

  function clearProductSession(reason = "scrub") {
    generation += 1;
    runCleaners(sessionCleaners);
    activeAdvisorId = null;
    root.replaceChildren();
    root.dataset.carteraMaterial3State = reason;
    delete root.dataset.carteraAdvisorId;
    document.documentElement.dataset.carteraMaterial3Runtime = reason;
  }

  async function hydrate() {
    const requestGeneration = ++generation;
    runCleaners(sessionCleaners);
    renderLoading(root);
    document.documentElement.dataset.carteraMaterial3Runtime = "loading";

    try {
      const bootstrap = await waitForProductiveBootstrap();
      if (!mounted || requestGeneration !== generation) return;

      const userResult = await bootstrap.getUser();
      const user = userResult?.data?.user || null;
      if (!mounted || requestGeneration !== generation) return;
      if (!user?.id) {
        renderAuthRequired(root);
        document.documentElement.dataset.carteraMaterial3Runtime = "auth-required";
        return;
      }

      const client = await bootstrap.getClient();
      if (!mounted || requestGeneration !== generation) return;

      productModulesPromise ||= loadProductModules();
      const product = await productModulesPromise;
      if (!mounted || requestGeneration !== generation) return;

      product.SupabaseRuntime.init(client);
      activeAdvisorId = user.id;
      root.dataset.carteraAdvisorId = user.id;
      root.dataset.carteraMaterial3State = "binding";
      root.innerHTML = `
        <div
          class="cartera-material3-frame"
          data-cartera-material3-frame
          data-cartera-authority="CANONICAL_DIRECTORY"
        >${product.renderCartera()}</div>
      `;

      const cleanerStart = Array.isArray(product.Memory?.cleaners)
        ? product.Memory.cleaners.length
        : 0;
      for (const bind of product.binders) {
        if (typeof bind !== "function") {
          throw new Error("CARTERA_MATERIAL3_PRODUCT_BINDER_MISSING");
        }
        bind();
      }
      const baseBinding = product.bindCarteraEvents();
      sessionCleaners.push(
        ...captureSessionCleaners(product.Memory, cleanerStart),
      );
      await baseBinding;
      if (!mounted || requestGeneration !== generation) return;

      root.dataset.carteraMaterial3State = "ready";
      document.documentElement.dataset.carteraMaterial3Runtime = "ready";
      globalThis.dispatchEvent(new CustomEvent("forge:cartera-material3-mounted", {
        detail: Object.freeze({
          contractId: CONTRACT_ID,
          advisorId: user.id,
          routeId: "cartera",
          readOnlyDirectory: true,
          automaticPolicyCreation: false,
        }),
      }));
      shell.syncVisualViewport();
    } catch (error) {
      if (!mounted || requestGeneration !== generation) return;
      console.error("[CARTERA MATERIAL3 PRODUCTIVE MOUNT]", error);
      renderFailure(root, error);
      document.documentElement.dataset.carteraMaterial3Runtime = "error";
    }
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    root.hidden = false;
    root.dataset.moduleActive = "true";
    void hydrate();
  }

  function unmount() {
    if (!mounted) return;
    mounted = false;
    clearProductSession("route-unmounted");
    root.hidden = true;
    root.dataset.moduleActive = "false";
  }

  root.addEventListener("click", (event) => {
    if (!event.target.closest("[data-cartera-retry]")) return;
    if (mounted) void hydrate();
  }, { signal });

  globalThis.addEventListener("forge:auth-state-changed", (event) => {
    const status = event.detail?.status;
    if (status === "authenticated") {
      if (mounted) void hydrate();
      return;
    }
    if (status === "anonymous") {
      clearProductSession("signed-out");
      if (mounted) renderAuthRequired(root);
    }
  }, { signal });

  const api = Object.freeze({
    id: "cartera",
    contractId: CONTRACT_ID,
    root,
    mount,
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      shell.syncVisualViewport();
    },
    unmount,
    refresh() {
      if (!mounted) return Promise.resolve(false);
      return hydrate().then(() => true);
    },
    diagnostics() {
      return Object.freeze({
        contractId: CONTRACT_ID,
        mounted,
        state: root.dataset.carteraMaterial3State || "idle",
        advisorId: activeAdvisorId,
        capturedCleanerCount: sessionCleaners.length,
        productiveMutationAuthorized: false,
      });
    },
    destroy() {
      unmount();
      lifecycleController.abort();
      delete root[moduleStateKey];
    },
  });

  root[moduleStateKey] = { api };
  globalThis.ForgeCarteraMaterial3ProductiveMount = Object.freeze({
    contractId: CONTRACT_ID,
    diagnostics: api.diagnostics,
  });
  return api;
}
