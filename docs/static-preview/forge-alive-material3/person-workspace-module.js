const CONTRACT_ID = "CRS_09_PRODUCTIVE_PERSON_WORKSPACE_MATERIAL3_V1";
const STATE = Symbol.for("forge.crs09.person-workspace.material3.state");
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const repositoryBase = new URL(sourceLayout ? "../../../" : "../../", import.meta.url);
const moduleUrl = (path) => new URL(path, repositoryBase);
const ALLOWED_ORIGINS = new Set(["inicio", "pipeline", "actividad", "quotes", "cartera"]);
const SECTION_ORDER = Object.freeze([
  "IDENTITY",
  "OPPORTUNITIES",
  "COMMITMENTS",
  "INTERACTIONS",
  "QUOTES",
  "APPLICATIONS",
  "POLICIES",
  "TIMELINE",
]);
const SECTION_LABELS = Object.freeze({
  IDENTITY: "Identidad",
  OPPORTUNITIES: "Oportunidades",
  COMMITMENTS: "Compromisos",
  INTERACTIONS: "Interacciones",
  QUOTES: "Cotizaciones",
  APPLICATIONS: "Solicitudes",
  POLICIES: "Pólizas",
  TIMELINE: "Timeline",
});
const SOURCE_STATUS_LABELS = Object.freeze({
  AVAILABLE: "Conectada",
  EMPTY: "Sin registros",
  DEGRADED: "Degradada",
  UNAVAILABLE: "No disponible",
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureStylesheet() {
  if (document.querySelector("[data-person-workspace-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "person-workspace-module.css?v=crs-09-001",
    import.meta.url,
  ).href;
  link.dataset.personWorkspaceStyles = "true";
  document.head.append(link);
}

function currentRoute() {
  return document.querySelector("[data-forge-application]")?.dataset.forgeRoute || "inicio";
}

function normalizeOrigin(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ALLOWED_ORIGINS.has(normalized) ? normalized : "inicio";
}

function buildWorkspaceUrl(detail = {}, location = window.location) {
  const url = new URL(location.href);
  const existingOrigin = url.searchParams.get("from");
  const origin = normalizeOrigin(
    detail.origin || (currentRoute() === "persona" ? existingOrigin : currentRoute()),
  );
  url.searchParams.set("nav", "persona");
  url.searchParams.set("from", origin);
  url.searchParams.delete("person");
  url.searchParams.delete("sourceType");
  url.searchParams.delete("sourceRef");
  url.searchParams.delete("section");
  url.searchParams.delete("event");
  url.searchParams.delete("record");

  if (detail.personReference) {
    url.searchParams.set("person", String(detail.personReference));
  } else if (detail.sourceIdentity?.type && detail.sourceIdentity?.reference) {
    url.searchParams.set("sourceType", String(detail.sourceIdentity.type).toUpperCase());
    url.searchParams.set("sourceRef", String(detail.sourceIdentity.reference));
  }
  if (detail.section) url.searchParams.set("section", String(detail.section).toUpperCase());
  if (detail.event) url.searchParams.set("event", String(detail.event));
  if (detail.record) url.searchParams.set("record", String(detail.record));
  return url;
}

function locatorFromLocation(location = window.location) {
  const url = new URL(location.href);
  const personReference = url.searchParams.get("person")?.trim();
  if (personReference) return Object.freeze({ personReference });
  const type = url.searchParams.get("sourceType")?.trim().toUpperCase();
  const reference = url.searchParams.get("sourceRef")?.trim();
  if (type && reference) {
    return Object.freeze({
      sourceIdentity: Object.freeze({ type, reference }),
    });
  }
  return null;
}

function locatorSignature(locator) {
  if (!locator) return "NONE";
  if (locator.personReference) return `PERSON:${locator.personReference}`;
  return `SOURCE:${locator.sourceIdentity.type}:${locator.sourceIdentity.reference}`;
}

function formatDateTime(value) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderLoading(root) {
  root.dataset.personWorkspaceState = "loading";
  root.innerHTML = `
    <section class="person-workspace-state" aria-live="polite">
      <span class="person-workspace-spinner" aria-hidden="true"></span>
      <div>
        <p class="section-kicker accent">PERSONA</p>
        <h1>Componiendo el espacio productivo</h1>
        <p>Validando identidad, relación y autoridades antes de mostrar información.</p>
      </div>
    </section>
  `;
}

function renderAuthRequired(root) {
  root.dataset.personWorkspaceState = "auth-required";
  root.innerHTML = `
    <section class="person-workspace-state" aria-live="polite">
      <span class="person-workspace-state-icon" aria-hidden="true">◇</span>
      <div>
        <p class="section-kicker accent">PERSONA</p>
        <h1>Inicia sesión para abrir este espacio</h1>
        <p>La identidad comercial, sus movimientos y su Timeline sólo se componen dentro de una sesión productiva.</p>
        <button type="button" class="person-workspace-primary" data-forge-auth-open data-forge-auth-open-nav="persona">Iniciar sesión</button>
      </div>
    </section>
  `;
}

function renderNoSelection(root) {
  root.dataset.personWorkspaceState = "selection-required";
  root.innerHTML = `
    <section class="person-workspace-state" aria-live="polite">
      <span class="person-workspace-state-icon" aria-hidden="true">◎</span>
      <div>
        <p class="section-kicker accent">PERSONA</p>
        <h1>Selecciona una persona desde su módulo</h1>
        <p>Abre este workspace desde Pipeline, Actividad, Cotizaciones o Cartera para conservar la identidad y el contexto de origen.</p>
        <button type="button" class="person-workspace-secondary" data-person-workspace-back>Volver</button>
      </div>
    </section>
  `;
}

function renderFailure(root, error) {
  const code = String(error?.code || error?.message || "CRS09_WORKSPACE_READ_FAILED");
  const unresolved = [
    "CRS09_PERSON_UNRESOLVED",
    "CRS09_PERSON_NOT_ACTIVE",
    "CRS09_MULTIPLE_ACTIVE_IDENTITY_LINKS",
  ].includes(code);
  root.dataset.personWorkspaceState = unresolved ? "unresolved" : "error";
  root.innerHTML = `
    <section class="person-workspace-state person-workspace-state--error" aria-live="polite">
      <span class="person-workspace-state-icon" aria-hidden="true">!</span>
      <div>
        <p class="section-kicker accent">PERSONA</p>
        <h1>${unresolved ? "La identidad todavía requiere resolución" : "No pudimos validar este espacio"}</h1>
        <p>${unresolved
          ? "No vincularemos automáticamente registros ni mezclaremos personas para completar la vista."
          : "La lectura falló cerrada. No mostraremos datos parciales o locales como si fueran completos."}</p>
        <div class="person-workspace-state-actions">
          <button type="button" class="person-workspace-primary" data-person-workspace-retry>Reintentar</button>
          <button type="button" class="person-workspace-secondary" data-person-workspace-back>Volver</button>
        </div>
        <small>${escapeHtml(code)}</small>
      </div>
    </section>
  `;
}

function renderSourceHealth(workspace) {
  return SECTION_ORDER.map((id) => {
    const source = workspace.sourceHealth[id];
    return `
      <div class="person-workspace-source" data-source-status="${escapeHtml(source.status)}">
        <span>${escapeHtml(SECTION_LABELS[id])}</span>
        <strong>${escapeHtml(SOURCE_STATUS_LABELS[source.status] || source.status)}</strong>
        <small>${escapeHtml(source.count)} registro(s)${source.reason ? ` · ${escapeHtml(source.reason)}` : ""}</small>
      </div>
    `;
  }).join("");
}

function renderItem(item, sectionId) {
  const date = formatDateTime(item.occurredAt || item.effectiveAt);
  return `
    <article
      class="person-workspace-item${item.attentionRequired ? " person-workspace-item--attention" : ""}"
      data-person-workspace-item="${escapeHtml(item.reference)}"
      data-person-workspace-section-item="${escapeHtml(sectionId)}"
      ${item.sourceEventReference ? `data-source-event-reference="${escapeHtml(item.sourceEventReference)}"` : ""}
    >
      <div class="person-workspace-item-copy">
        <div class="person-workspace-item-heading">
          <strong>${escapeHtml(item.label)}</strong>
          ${item.state ? `<span>${escapeHtml(item.state)}</span>` : ""}
        </div>
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
        <small>${escapeHtml(item.authority)}${date ? ` · ${escapeHtml(date)}` : ""}</small>
      </div>
      <a href="${escapeHtml(item.deepLink)}" data-person-workspace-deep-link>Ver en contexto</a>
    </article>
  `;
}

function renderSection(section) {
  const degraded = ["DEGRADED", "UNAVAILABLE"].includes(section.status);
  const content = section.items.length
    ? section.items.map((item) => renderItem(item, section.id)).join("")
    : `<div class="person-workspace-empty" data-empty-state="${escapeHtml(section.status)}">
        <strong>${degraded ? "Fuente no disponible" : "Sin registros autoritativos"}</strong>
        <p>${degraded
          ? `Esta sección permanece visible y no inventa información.${section.reason ? ` ${escapeHtml(section.reason)}` : ""}`
          : "La ausencia de registros se muestra como ausencia, no como cero confirmado."}</p>
      </div>`;
  return `
    <section
      class="person-workspace-section"
      id="person-workspace-${escapeHtml(section.id.toLowerCase())}"
      data-person-workspace-section="${escapeHtml(section.id)}"
      data-section-status="${escapeHtml(section.status)}"
      aria-labelledby="person-workspace-${escapeHtml(section.id.toLowerCase())}-title"
    >
      <header>
        <div>
          <p class="section-kicker accent">${escapeHtml(section.authority)}</p>
          <h2 id="person-workspace-${escapeHtml(section.id.toLowerCase())}-title">${escapeHtml(SECTION_LABELS[section.id])}</h2>
        </div>
        <span>${escapeHtml(section.count)}${section.attentionCount ? ` · ${escapeHtml(section.attentionCount)} atención` : ""}</span>
      </header>
      <div class="person-workspace-items">${content}</div>
    </section>
  `;
}

function renderReady(root, workspace) {
  root.dataset.personWorkspaceState = "ready";
  root.innerHTML = `
    <section class="person-workspace" data-person-workspace-ready data-person-reference="${escapeHtml(workspace.person.personReference)}">
      <header class="person-workspace-hero">
        <button type="button" class="person-workspace-back" data-person-workspace-back aria-label="Volver al módulo anterior">←</button>
        <div class="person-workspace-identity">
          <p class="section-kicker accent">PERSONA · ${escapeHtml(workspace.person.lifecycleState)}</p>
          <h1>${escapeHtml(workspace.person.displayName)}</h1>
          <p>${escapeHtml(workspace.person.personReference)} · ${escapeHtml(workspace.relationshipReference)}</p>
        </div>
        <div class="person-workspace-truth">
          <strong>${escapeHtml(workspace.itemCount)}</strong>
          <span>hechos compuestos</span>
          <small>${escapeHtml(workspace.attentionCount)} requieren atención</small>
        </div>
      </header>

      <nav class="person-workspace-section-nav" aria-label="Secciones de la persona">
        ${SECTION_ORDER.map((id) => `<a href="#person-workspace-${id.toLowerCase()}" data-person-workspace-section-link="${id}">${escapeHtml(SECTION_LABELS[id])}</a>`).join("")}
      </nav>

      <details class="person-workspace-health">
        <summary>Estado de fuentes</summary>
        <div>${renderSourceHealth(workspace)}</div>
      </details>

      <div class="person-workspace-grid">
        ${SECTION_ORDER.map((id) => renderSection(workspace.sections[id])).join("")}
      </div>

      <footer class="person-workspace-boundary">
        <strong>Composición de sólo lectura</strong>
        <span>Las acciones y mutaciones permanecen en Pipeline, Actividad, Cotizaciones, Solicitudes y Cartera.</span>
      </footer>
    </section>
  `;
}

async function waitForProductiveBootstrap() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getClient === "function" && typeof bootstrap?.getUser === "function") {
      return bootstrap;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  throw Object.assign(new Error("CRS09_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE"), {
    code: "CRS09_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE",
  });
}

let authoritiesPromise;
async function loadAuthorities() {
  authoritiesPromise ||= (async () => {
    const paths = [
      "platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js",
      "platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js",
      "platform/shared-commercial-model/crs-07-application-policy-lineage-contract.js",
      "advisor-os/cartera/crs-07-application-policy-lineage-service.js",
      "platform/shared-commercial-model/crs-08-unified-person-timeline-contract.js",
      "platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js",
      "advisor-os/timeline/crs-08-unified-person-timeline-service.js",
      "platform/shared-commercial-model/crs-09-person-workspace-contract.js",
      "advisor-os/person-workspace/crs-09-person-workspace-service.js",
    ];
    for (const path of paths) await import(moduleUrl(path));
    if (!globalThis.ForgeCrs09PersonWorkspaceService?.createService) {
      throw new Error("CRS09_PERSON_WORKSPACE_AUTHORITY_UNAVAILABLE");
    }
    return Object.freeze({
      workspace: globalThis.ForgeCrs09PersonWorkspaceService,
      timeline: globalThis.ForgeCrs08UnifiedPersonTimelineService,
      policy: globalThis.ForgeCrs07ApplicationPolicyLineageService,
    });
  })().catch((error) => {
    authoritiesPromise = null;
    throw error;
  });
  return authoritiesPromise;
}

function focusRequestedTarget(root) {
  const url = new URL(window.location.href);
  const eventReference = url.searchParams.get("event");
  const recordReference = url.searchParams.get("record");
  const section = url.searchParams.get("section")?.toUpperCase();
  let target = null;
  if (eventReference) {
    target = [...root.querySelectorAll("[data-source-event-reference]")].find(
      (node) => node.dataset.sourceEventReference === eventReference,
    );
  }
  if (!target && recordReference) {
    target = [...root.querySelectorAll("[data-person-workspace-item]")].find(
      (node) => node.dataset.personWorkspaceItem === recordReference,
    );
  }
  if (!target && SECTION_ORDER.includes(section)) {
    target = root.querySelector(`[data-person-workspace-section="${section}"]`);
  }
  target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

export function createPersonWorkspaceModule({ root, shell } = {}) {
  if (!root) throw new Error("CRS09_PERSON_WORKSPACE_ROOT_REQUIRED");
  if (!shell) throw new Error("CRS09_PERSON_WORKSPACE_SHELL_REQUIRED");
  if (root[STATE]) return root[STATE].api;

  ensureStylesheet();
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  let mounted = false;
  let generation = 0;
  let activeAdvisorId = null;
  let activeWorkspace = null;
  let activeLocatorSignature = "NONE";
  let lateResultRejectCount = 0;

  function scrub(reason = "scrubbed") {
    generation += 1;
    activeAdvisorId = null;
    activeWorkspace = null;
    activeLocatorSignature = "NONE";
    root.replaceChildren();
    root.dataset.personWorkspaceState = reason;
    document.documentElement.dataset.personWorkspaceRuntime = reason;
  }

  function canonicalizeResolvedPerson(workspace, locator) {
    if (!locator?.sourceIdentity || !workspace?.person?.personReference) return;
    const url = new URL(window.location.href);
    url.searchParams.set("person", workspace.person.personReference);
    url.searchParams.delete("sourceType");
    url.searchParams.delete("sourceRef");
    window.history.replaceState({ forgeRoute: "persona", personReference: workspace.person.personReference }, "", url);
  }

  async function hydrate({ force = false } = {}) {
    const locator = locatorFromLocation();
    const signature = locatorSignature(locator);
    if (!force && activeWorkspace && signature === activeLocatorSignature) {
      focusRequestedTarget(root);
      return activeWorkspace;
    }
    const selectedGeneration = ++generation;
    activeLocatorSignature = signature;
    if (!locator) {
      renderNoSelection(root);
      document.documentElement.dataset.personWorkspaceRuntime = "selection-required";
      return null;
    }
    renderLoading(root);
    document.documentElement.dataset.personWorkspaceRuntime = "loading";

    try {
      const bootstrap = await waitForProductiveBootstrap();
      if (!mounted || selectedGeneration !== generation) {
        lateResultRejectCount += 1;
        return null;
      }
      const userResult = await bootstrap.getUser();
      const user = userResult?.data?.user || null;
      if (!mounted || selectedGeneration !== generation) {
        lateResultRejectCount += 1;
        return null;
      }
      if (!user?.id) {
        renderAuthRequired(root);
        document.documentElement.dataset.personWorkspaceRuntime = "auth-required";
        return null;
      }
      const [client, authorities] = await Promise.all([
        bootstrap.getClient(),
        loadAuthorities(),
      ]);
      if (!mounted || selectedGeneration !== generation) {
        lateResultRejectCount += 1;
        return null;
      }
      const timelineService = authorities.timeline.createService({ client });
      const policyService = authorities.policy.createService({ client });
      const workspaceService = authorities.workspace.createService({
        client,
        timelineService,
        policyService,
      });
      const workspace = await workspaceService.getPersonWorkspace(locator);
      if (!mounted || selectedGeneration !== generation) {
        lateResultRejectCount += 1;
        return null;
      }
      activeAdvisorId = user.id;
      activeWorkspace = workspace;
      activeLocatorSignature = `PERSON:${workspace.person.personReference}`;
      canonicalizeResolvedPerson(workspace, locator);
      renderReady(root, workspace);
      root.dataset.personWorkspaceGeneration = String(selectedGeneration);
      document.documentElement.dataset.personWorkspaceRuntime = "ready";
      globalThis.dispatchEvent(new CustomEvent("forge:person-workspace-mounted", {
        detail: Object.freeze({
          contractId: CONTRACT_ID,
          personReference: workspace.person.personReference,
          workspaceReference: workspace.workspaceReference,
          readOnlyComposition: true,
          localMutationControls: false,
        }),
      }));
      requestAnimationFrame(() => focusRequestedTarget(root));
      shell.syncVisualViewport();
      return workspace;
    } catch (error) {
      if (!mounted || selectedGeneration !== generation) {
        lateResultRejectCount += 1;
        return null;
      }
      console.error("[CRS09 PERSON WORKSPACE]", error);
      activeWorkspace = null;
      renderFailure(root, error);
      document.documentElement.dataset.personWorkspaceRuntime = "error";
      return null;
    }
  }

  function navigateBack() {
    const url = new URL(window.location.href);
    const origin = normalizeOrigin(url.searchParams.get("from"));
    window.history.pushState({ forgeRoute: origin }, "", `?nav=${encodeURIComponent(origin)}`);
    shell.reconcile();
  }

  function openWorkspace(detail) {
    const url = buildWorkspaceUrl(detail);
    window.history.pushState({ forgeRoute: "persona" }, "", url);
    shell.reconcile();
  }

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-person-workspace-back]")) {
      event.preventDefault();
      navigateBack();
      return;
    }
    if (event.target.closest("[data-person-workspace-retry]")) {
      event.preventDefault();
      if (mounted) void hydrate({ force: true });
      return;
    }
    const deepLink = event.target.closest("[data-person-workspace-deep-link]");
    if (deepLink) {
      const href = deepLink.getAttribute("href");
      if (href?.startsWith("?")) {
        event.preventDefault();
        window.history.pushState({ forgeRoute: new URL(href, window.location.href).searchParams.get("nav") }, "", href);
        shell.reconcile();
      }
    }
  }, { signal });

  globalThis.addEventListener("forge:open-person-workspace", (event) => {
    openWorkspace(event.detail || {});
  }, { signal });

  globalThis.addEventListener("forge:auth-state-changed", (event) => {
    const status = String(event.detail?.status || "").toLowerCase();
    if (status === "authenticated") {
      if (mounted) void hydrate({ force: true });
      return;
    }
    if (["anonymous", "auth_error"].includes(status)) {
      scrub("signed-out");
      if (mounted) renderAuthRequired(root);
    }
  }, { signal });

  const api = Object.freeze({
    id: "persona",
    contractId: CONTRACT_ID,
    root,
    mount() {
      if (mounted) return;
      mounted = true;
      root.hidden = false;
      root.dataset.moduleActive = "true";
      void hydrate();
    },
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      const nextSignature = locatorSignature(locatorFromLocation());
      if (nextSignature !== activeLocatorSignature) void hydrate();
      else focusRequestedTarget(root);
      shell.syncVisualViewport();
    },
    unmount() {
      if (!mounted) return;
      mounted = false;
      scrub("route-unmounted");
      root.hidden = true;
      root.dataset.moduleActive = "false";
    },
    refresh() {
      if (!mounted) return Promise.resolve(false);
      return hydrate({ force: true }).then(() => true);
    },
    open: openWorkspace,
    diagnostics() {
      return Object.freeze({
        contractId: CONTRACT_ID,
        mounted,
        state: root.dataset.personWorkspaceState || "idle",
        authenticated: Boolean(activeAdvisorId),
        personReference: activeWorkspace?.person?.personReference || null,
        activeLocatorSignature,
        lateResultRejectCount,
        readOnlyComposition: true,
        localMutationControls: false,
      });
    },
    destroy() {
      api.unmount();
      lifecycle.abort();
      delete root[STATE];
    },
  });

  root[STATE] = { api };
  globalThis.ForgeCrs09ProductivePersonWorkspaceMaterial3 = Object.freeze({
    contractId: CONTRACT_ID,
    open: openWorkspace,
    diagnostics: api.diagnostics,
  });
  return api;
}

export {
  CONTRACT_ID,
  SECTION_ORDER,
  buildWorkspaceUrl,
  locatorFromLocation,
  locatorSignature,
  normalizeOrigin,
};
