import { createProductiveActivityReportingBridge } from "./activity-ledger-reporting-bridge.js";
import { createProductiveSmartWidgetHomeAdapter } from "./smart-widget-productive-home-adapter.js";

const HOME_STATE = Symbol.for("forge.smart-widgets.authenticated-home.v1");
const TIME_ZONE = "America/Mexico_City";

function runtimeLayout() {
  const sourceTree = import.meta.url.includes("/docs/static-preview/");
  return Object.freeze({
    extension: sourceTree ? ".mjs" : ".js",
    smartWidgetBase: new URL(
      sourceTree
        ? "../../../advisor-os/forge-alive/smart-widgets/"
        : "../../advisor-os/forge-alive/smart-widgets/",
      import.meta.url,
    ),
  });
}

let productiveModulesPromise = null;
async function loadProductiveModules() {
  if (productiveModulesPromise) return productiveModulesPromise;
  const layout = runtimeLayout();
  productiveModulesPromise = Promise.all([
    import(new URL(`productive-smart-widget-orchestrator${layout.extension}`, layout.smartWidgetBase)),
    import(new URL(`advisor-monthly-policy-goal-repository${layout.extension}`, layout.smartWidgetBase)),
  ]).then(([orchestrator, goalAuthority]) => Object.freeze({
    buildProductiveSmartWidgetStack: orchestrator.buildProductiveSmartWidgetStack,
    createAdvisorMonthlyPolicyGoalRepository: goalAuthority.createAdvisorMonthlyPolicyGoalRepository,
  }));
  return productiveModulesPromise;
}

function abortError(message = "Home request aborted") {
  return new DOMException(message, "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function withAbortSignal(query, signal) {
  return signal && typeof query?.abortSignal === "function" ? query.abortSignal(signal) : query;
}

function unwrap(result, code) {
  if (result?.error) {
    const error = new Error(code, { cause: result.error });
    error.code = code;
    throw error;
  }
  return result?.data;
}

function dateParts(value, timeZone = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function yearMonth(value, timeZone = TIME_ZONE) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}`;
}

function dateOnly(value, timeZone = TIME_ZONE) {
  const parts = dateParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isoFromDate(value) {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T12:00:00.000Z`;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeSession(session) {
  const advisorId = session?.user?.id || null;
  return advisorId
    ? Object.freeze({ status: "AUTHENTICATED", advisorId })
    : Object.freeze({ status: "ANONYMOUS", advisorId: null });
}

function normalizeRadarSignal(item) {
  const mapping = Object.freeze({
    UNCONFIRMED_PAYMENT_EVIDENCE: "PAYMENT_CONFIRMATION_REQUIRED",
    EXPECTED_PAYMENT: "DUE_SOON",
    POSSIBLE_LATE_PAYMENT: "POSSIBLE_LATE_PAYMENT",
    POLICY_END_OR_RENEWAL_REVIEW: "POLICY_RENEWAL_DUE",
    POLICY_YEAR_TRANSITION: "POLICY_RENEWAL_DUE",
    INCOMPLETE_POLICY_DATA: "DUE_SOON",
  });
  const signalType = mapping[item?.signalType];
  if (!signalType) return null;
  return Object.freeze({
    ...item,
    originalSignalType: item.signalType,
    signalType,
    evidenceRefs: [item.sourceRecordReference, item.signalReference].filter(Boolean),
  });
}

async function loadConfirmedPolicyFacts({ client, advisorId, signal }) {
  throwIfAborted(signal);
  const authResult = await client.auth.getUser();
  const user = unwrap(authResult, "HOME_POLICY_FACT_AUTH_LOOKUP_FAILED")?.user;
  if (!user?.id || user.id !== advisorId) {
    const error = new Error("HOME_POLICY_FACT_SESSION_CHANGED");
    error.code = "SESSION_REQUIRED";
    throw error;
  }

  let policyQuery = client
    .from("canonical_policies")
    .select("id,policy_reference,issue_date,archived_at");
  if (typeof policyQuery.is === "function") policyQuery = policyQuery.is("archived_at", null);
  const policies = unwrap(
    await withAbortSignal(policyQuery, signal),
    "HOME_POLICY_FACT_POLICY_READ_FAILED",
  ) || [];
  throwIfAborted(signal);

  const activePolicies = policies.filter((policy) => !policy.archived_at && policy.id && policy.policy_reference);
  if (!activePolicies.length) {
    return Object.freeze({ policyFacts: [], sourceComplete: true });
  }

  const versionQuery = client
    .from("policy_versions")
    .select("policy_id,policy_version_reference,version_number,confirmed_at")
    .in("policy_id", activePolicies.map((policy) => policy.id))
    .order("version_number", { ascending: true });
  const versions = unwrap(
    await withAbortSignal(versionQuery, signal),
    "HOME_POLICY_FACT_VERSION_READ_FAILED",
  ) || [];
  throwIfAborted(signal);

  const firstConfirmedByPolicy = new Map();
  for (const version of versions) {
    if (!version?.policy_id || !version.confirmed_at || firstConfirmedByPolicy.has(version.policy_id)) continue;
    firstConfirmedByPolicy.set(version.policy_id, version);
  }

  const policyFacts = activePolicies.flatMap((policy) => {
    const confirmedVersion = firstConfirmedByPolicy.get(policy.id);
    if (!confirmedVersion) return [];
    const soldAt = isoFromDate(policy.issue_date) || isoFromDate(confirmedVersion.confirmed_at);
    if (!soldAt) return [];
    return [Object.freeze({
      eventType: "POLICY_SOLD_CONFIRMED",
      policyId: policy.policy_reference,
      soldAt,
      occurredAt: isoFromDate(confirmedVersion.confirmed_at),
      evidenceRef: confirmedVersion.policy_version_reference || policy.policy_reference,
      authority: "CANONICAL_POLICY_CONFIRMED_VERSION",
      dateAuthority: policy.issue_date ? "POLICY_ISSUE_DATE" : "CONFIRMED_AT_FALLBACK",
    })];
  });

  return Object.freeze({
    policyFacts,
    sourceComplete: policyFacts.length === firstConfirmedByPolicy.size,
  });
}

function ensureGoalDialog({ root, onSubmit }) {
  let dialog = root.querySelector("[data-forge-monthly-goal-dialog]");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.className = "productive-goal-dialog";
  dialog.dataset.forgeMonthlyGoalDialog = "true";
  dialog.innerHTML = `
    <form method="dialog" class="productive-goal-form" data-forge-monthly-goal-form>
      <div>
        <p class="productive-smart-widget-eyebrow">META MENSUAL</p>
        <h2>¿Cuántas familias quieres proteger?</h2>
        <p>Forge contará únicamente pólizas canónicas con una versión confirmada.</p>
      </div>
      <label>
        <span>Pólizas confirmadas objetivo</span>
        <input type="number" min="1" max="1000" step="1" inputmode="numeric" required data-forge-monthly-goal-input>
      </label>
      <p class="productive-goal-error" data-forge-monthly-goal-error hidden></p>
      <div class="productive-goal-actions">
        <button type="button" data-forge-monthly-goal-cancel>Cancelar</button>
        <button type="submit" class="productive-smart-widget-action" data-forge-monthly-goal-save>Guardar meta</button>
      </div>
    </form>
  `;
  const form = dialog.querySelector("[data-forge-monthly-goal-form]");
  const cancel = dialog.querySelector("[data-forge-monthly-goal-cancel]");
  cancel.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = dialog.querySelector("[data-forge-monthly-goal-input]");
    const errorNode = dialog.querySelector("[data-forge-monthly-goal-error]");
    const save = dialog.querySelector("[data-forge-monthly-goal-save]");
    const value = Number(input.value);
    errorNode.hidden = true;
    save.disabled = true;
    try {
      await onSubmit(value);
      dialog.close();
    } catch (error) {
      errorNode.textContent = error?.message === "MONTHLY_GOAL_SESSION_CHANGED"
        ? "La sesión cambió. Vuelve a iniciar sesión antes de guardar."
        : "No pudimos guardar la meta. La meta anterior permanece intacta.";
      errorNode.hidden = false;
    } finally {
      save.disabled = false;
    }
  });
  root.appendChild(dialog);
  return dialog;
}

export function createAuthenticatedProductiveHome({
  root,
  shell,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  timeZone = TIME_ZONE,
  clock = () => new Date(),
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Authenticated productive Home root is required");
  if (root[HOME_STATE]) return root[HOME_STATE];

  let mounted = false;
  let generation = 0;
  let controller = null;
  let adapter = null;
  let client = null;
  let goalRepository = null;
  let activityRuntime = null;
  let activityAdvisorId = null;
  let activeAdvisorId = null;
  let scheduled = null;
  let dialog = null;

  function injectStyles() {
    if (document.querySelector("[data-productive-smart-widget-styles]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("./smart-widget-productive-home-adapter.css?v=home-productive-mount-001", import.meta.url);
    link.dataset.productiveSmartWidgetStyles = "true";
    document.head.appendChild(link);
  }

  async function closeActivityRuntime() {
    const runtime = activityRuntime;
    activityRuntime = null;
    activityAdvisorId = null;
    await runtime?.close?.();
  }

  function abortCurrent(reason) {
    generation += 1;
    if (!controller?.signal.aborted) controller?.abort(reason);
    controller = null;
  }

  async function scrub(reason = "session-scrub") {
    abortCurrent(reason);
    activeAdvisorId = null;
    goalRepository = null;
    client = null;
    dialog?.close?.();
    adapter?.scrub?.(reason);
    await closeActivityRuntime();
    root.dataset.productiveHomeState = "scrubbed";
  }

  async function productiveClient() {
    const selectedBootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap;
    if (typeof selectedBootstrap?.getClient !== "function") {
      throw new Error("PRODUCTIVE_HOME_AUTH_BOOTSTRAP_UNAVAILABLE");
    }
    if (!client) client = await selectedBootstrap.getClient();
    return client;
  }

  async function sessionSnapshot() {
    const selectedBootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap;
    if (typeof selectedBootstrap?.getSession !== "function") return normalizeSession(null);
    const result = await selectedBootstrap.getSession();
    if (result?.error) throw result.error;
    return normalizeSession(result?.data?.session);
  }

  async function ensureGoalRepository(advisorId) {
    if (goalRepository) return goalRepository;
    const [{ createAdvisorMonthlyPolicyGoalRepository }, selectedClient] = await Promise.all([
      loadProductiveModules(),
      productiveClient(),
    ]);
    goalRepository = createAdvisorMonthlyPolicyGoalRepository({
      client: selectedClient,
      getSessionAdvisorId: async () => {
        const session = await sessionSnapshot();
        return session.status === "AUTHENTICATED" ? session.advisorId : null;
      },
    });
    activeAdvisorId = advisorId;
    return goalRepository;
  }

  async function ensureActivityRuntime(advisorId) {
    if (activityRuntime && activityAdvisorId === advisorId) return activityRuntime;
    await closeActivityRuntime();
    activityRuntime = await createProductiveActivityReportingBridge({
      bootstrap: globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap,
      timeZone,
      clock,
    });
    if (activityRuntime.authority?.advisorId !== advisorId) {
      await closeActivityRuntime();
      throw new Error("PRODUCTIVE_HOME_ACTIVITY_AUTHORITY_MISMATCH");
    }
    activityAdvisorId = advisorId;
    return activityRuntime;
  }

  function sourcesFor({ advisorId, signal }) {
    return Object.freeze({
      activity: Object.freeze({
        sourceConnected: true,
        async load(context) {
          throwIfAborted(context.signal || signal);
          const runtime = await ensureActivityRuntime(advisorId);
          const reportResult = await runtime.runChartReady({
            period: { kind: "WEEK_TO_DATE", parameters: {} },
            timeZone,
            asOf: context.now,
          });
          throwIfAborted(context.signal || signal);
          return Object.freeze({
            sourceConnected: true,
            sourceComplete: true,
            reportResult,
            freshness: { asOf: context.now, period: "WEEK_TO_DATE" },
          });
        },
      }),
      monthlyGoal: Object.freeze({
        sourceConnected: true,
        async load(context) {
          const selectedClient = await productiveClient();
          const repository = await ensureGoalRepository(advisorId);
          const month = yearMonth(context.now, timeZone);
          const [goalSnapshot, facts] = await Promise.all([
            repository.readCurrent({ advisorId, yearMonth: month, signal: context.signal }),
            loadConfirmedPolicyFacts({ client: selectedClient, advisorId, signal: context.signal }),
          ]);
          return Object.freeze({
            sourceConnected: true,
            sourceComplete: facts.sourceComplete,
            goalSnapshot,
            policyFacts: facts.policyFacts,
            freshness: { asOf: context.now, definition: "POLICY_SOLD_CONFIRMED" },
          });
        },
      }),
      policyService: Object.freeze({
        sourceConnected: true,
        async load(context) {
          const selectedClient = await productiveClient();
          throwIfAborted(context.signal);
          const result = await selectedClient.rpc("forge_cartera050_list_future_radar", {
            p_payload: {
              asOfDate: dateOnly(context.now, timeZone),
              timezone: timeZone,
            },
          });
          const radar = unwrap(result, "PRODUCTIVE_HOME_CARTERA_050_READ_FAILED") || {};
          throwIfAborted(context.signal);
          const items = Array.isArray(radar.items) ? radar.items : [];
          const signals = items.map(normalizeRadarSignal).filter(Boolean);
          return Object.freeze({
            sourceConnected: true,
            sourceComplete: true,
            radarSnapshot: Object.freeze({ ...radar, signals }),
            freshness: { asOf: context.now, authority: "CARTERA_050_FUTURE_RADAR" },
          });
        },
      }),
      opportunities: Object.freeze({
        sourceConnected: false,
        sourceComplete: false,
        blockedReason: "PIPELINE_BITACORA_SIGNAL_MAPPING_NOT_CONNECTED",
      }),
      income: Object.freeze({
        sourceConnected: false,
        sourceComplete: false,
        blockedReason: "COMPENSATION_INCOME_TRUTH_NOT_CONNECTED",
      }),
    });
  }

  async function saveGoal(targetPolicyCount) {
    if (!Number.isInteger(targetPolicyCount) || targetPolicyCount < 1 || targetPolicyCount > 1000) {
      throw new TypeError("La meta debe ser un número entero entre 1 y 1000.");
    }
    const expectedAdvisor = activeAdvisorId;
    const session = await sessionSnapshot();
    if (!expectedAdvisor || session.advisorId !== expectedAdvisor) {
      throw new Error("MONTHLY_GOAL_SESSION_CHANGED");
    }
    const repository = await ensureGoalRepository(expectedAdvisor);
    await repository.append({
      advisorId: expectedAdvisor,
      yearMonth: yearMonth(clock(), timeZone),
      targetPolicyCount,
      reason: "HOME_PRODUCTIVE_MONTHLY_GOAL_EDITOR",
      evidenceReference: `HOME:${yearMonth(clock(), timeZone)}`,
    });
    scheduleReconcile("monthly-goal-saved");
  }

  function openGoalEditor(widget) {
    if (!dialog) dialog = ensureGoalDialog({ root, onSubmit: saveGoal });
    const input = dialog.querySelector("[data-forge-monthly-goal-input]");
    input.value = Number.isFinite(widget?.payload?.target) ? String(widget.payload.target) : "10";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    input.focus({ preventScroll: true });
  }

  function handleWidgetAction(widget) {
    if (widget?.reviewAction?.type === "OPEN_GOAL_EDITOR") {
      openGoalEditor(widget);
      return;
    }
    if (widget?.deepLink) {
      const url = new URL(widget.deepLink, window.location.href);
      const nav = url.searchParams.get("nav");
      if (nav && typeof shell?.navigate === "function") shell.navigate(nav);
      else window.location.href = url.href;
    }
  }

  async function reconcile(reason = "home-reconcile") {
    if (!mounted) return null;
    abortCurrent(reason);
    controller = new AbortController();
    const runGeneration = generation;
    const signal = controller.signal;
    root.dataset.productiveHomeState = "loading";

    try {
      const [{ buildProductiveSmartWidgetStack }, session] = await Promise.all([
        loadProductiveModules(),
        sessionSnapshot(),
      ]);
      throwIfAborted(signal);
      if (runGeneration !== generation) return null;
      if (session.status !== "AUTHENTICATED") {
        await scrub("anonymous-home");
        return null;
      }
      if (activeAdvisorId && activeAdvisorId !== session.advisorId) {
        await scrub("advisor-switch");
        if (mounted) scheduleReconcile("advisor-switch");
        return null;
      }
      activeAdvisorId = session.advisorId;
      const selectedSignal = controller.signal;
      const stack = await adapter.reconcile({
        session,
        sources: sourcesFor({ advisorId: session.advisorId, signal: selectedSignal }),
      });
      if (selectedSignal.aborted || runGeneration !== generation || activeAdvisorId !== session.advisorId) return null;
      root.dataset.productiveHomeState = stack ? "ready" : "unavailable";
      return stack;
    } catch (error) {
      if (error?.name === "AbortError" || signal.aborted || runGeneration !== generation) return null;
      console.error("Forge authenticated productive Home failed", error);
      if (!activeAdvisorId) {
        await scrub("home-error-without-session");
        return null;
      }
      root.dataset.productiveHomeState = "source-unavailable";
      return adapter.reconcile({
        session: { status: "AUTHENTICATED", advisorId: activeAdvisorId },
        sources: {
          activity: { sourceConnected: true, sourceUnavailable: true },
          monthlyGoal: { sourceConnected: true, sourceUnavailable: true },
          policyService: { sourceConnected: true, sourceUnavailable: true },
          opportunities: { sourceConnected: false },
          income: { sourceConnected: false },
        },
      });
    }
  }

  function scheduleReconcile(reason) {
    if (!mounted) return;
    if (scheduled) window.clearTimeout(scheduled);
    scheduled = window.setTimeout(() => {
      scheduled = null;
      reconcile(reason);
    }, 60);
  }

  function handleAuthState(event) {
    const detail = event?.detail || {};
    if (detail.status !== "authenticated" || !detail.advisorId) {
      scrub(`auth:${detail.event || detail.status || "unknown"}`);
      return;
    }
    if (activeAdvisorId && activeAdvisorId !== detail.advisorId) {
      scrub("auth-advisor-switch").finally(() => scheduleReconcile("auth-advisor-switch"));
      return;
    }
    scheduleReconcile(`auth:${detail.event || "authenticated"}`);
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    injectStyles();
    adapter = createProductiveSmartWidgetHomeAdapter({
      root,
      buildStack: (...args) => loadProductiveModules().then((modules) => modules.buildProductiveSmartWidgetStack(...args)),
      onAction: handleWidgetAction,
      timeZone,
      now: () => clock().toISOString(),
    });
    adapter.mount();
    window.addEventListener("forge:auth-state-changed", handleAuthState);
    root.dataset.productiveHomeOrchestrator = "mounted";
    scheduleReconcile("mount");
  }

  async function unmount() {
    if (!mounted) return;
    mounted = false;
    if (scheduled) window.clearTimeout(scheduled);
    scheduled = null;
    window.removeEventListener("forge:auth-state-changed", handleAuthState);
    await scrub("home-unmount");
    adapter?.unmount();
    root.dataset.productiveHomeOrchestrator = "unmounted";
  }

  const api = Object.freeze({
    mount,
    unmount,
    reconcile: () => scheduleReconcile("shell-reconcile"),
    refresh: () => reconcile("explicit-refresh"),
    scrub,
    diagnostics: () => Object.freeze({
      mounted,
      generation,
      advisorId: activeAdvisorId,
      activityAdvisorId,
      state: root.dataset.productiveHomeState || null,
      stack: adapter?.getStack?.() || null,
    }),
  });
  root[HOME_STATE] = api;
  return api;
}
