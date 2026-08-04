const CONTRACT_ID = "FORGE_ALFRED_COMMAND_RUNTIME_V1";
const FUNCTION_NAME = "alfred-command";
const MAX_HISTORY_ITEMS = 6;
const REQUEST_TIMEOUT_MS = 24_000;
const stateKey = Symbol.for("forge.alfred.command.runtime.state");

function normalizeText(value, max = 6000) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeMultiline(value, max = 1400) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function ensureStylesheet() {
  const selector = "[data-alfred-command-runtime-styles]";
  if (document.querySelector(selector)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./alfred-command-runtime.css?v=alfred-command-runtime-001",
    import.meta.url,
  ).href;
  link.dataset.alfredCommandRuntimeStyles = CONTRACT_ID;
  document.head.append(link);
}

function createElement(tag, className, text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function responseSurface(panel, inputLabel) {
  let surface = panel.querySelector("[data-alfred-command-response]");
  if (surface) return surface;
  surface = createElement("section", "alfred-command-response");
  surface.dataset.alfredCommandResponse = "true";
  surface.setAttribute("aria-live", "polite");
  surface.hidden = true;
  panel.insertBefore(surface, inputLabel);
  return surface;
}

function activeRouteRoot(root) {
  const route = root.dataset.forgeRoute || "";
  if (route) {
    const exact = root.querySelector(
      `[data-route-module="${CSS.escape(route)}"]:not([hidden])`,
    );
    if (exact) return exact;
  }
  return root.querySelector("[data-route-module]:not([hidden])");
}

function visibleSummary(root) {
  const active = activeRouteRoot(root);
  if (!active) return "";
  const clone = active.cloneNode(true);
  clone
    .querySelectorAll(
      "script,style,[hidden],[aria-hidden='true'],input,textarea,select,[data-forge-shell-controls],[data-forge-alfred-sheet]",
    )
    .forEach((node) => node.remove());
  return normalizeText(clone.textContent, 6000);
}

function routeLabel(root) {
  return normalizeText(
    root.querySelector("[data-forge-nav-pill] [aria-current='page'] span")?.textContent
      || root.dataset.forgeRoute
      || new URL(location.href).searchParams.get("nav")
      || "inicio",
    120,
  );
}

function uiState() {
  const source = document.documentElement.dataset;
  const keys = [
    "forgeAuthRuntime",
    "forgeAuthorityState",
    "forgeRoute",
    "forgeShellReady",
    "homeLiveDashboard",
    "activityLedgerRuntime",
    "quoteCalculatorRuntime",
    "mobileBottomNavResize",
  ];
  return Object.fromEntries(
    keys
      .map((key) => [key, normalizeText(source[key], 160)])
      .filter(([, value]) => value),
  );
}

async function waitForBootstrap() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (
      typeof bootstrap?.getClient === "function"
      && typeof bootstrap?.getSession === "function"
    ) {
      return bootstrap;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return globalThis.ForgeProductiveProspectBootstrap067G17B || null;
}

function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error("ALFRED_REQUEST_TIMEOUT");
      error.code = "ALFRED_REQUEST_TIMEOUT";
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function providerLabel(payload) {
  if (payload?.provider === "gemini" && payload?.degraded !== true) {
    return "Alfred conectado";
  }
  if (payload?.degraded === true) return "Alfred · modo de respaldo";
  return "Alfred · lectura local";
}

function errorMessage(error) {
  const code = String(error?.code || error?.message || "");
  if (
    code.includes("AUTH")
    || code.includes("401")
    || code.includes("JWT")
    || code.includes("CONFIG_BLOCKED")
  ) {
    return {
      title: "Inicia sesión para usar Alfred",
      answer: "Alfred necesita tu sesión protegida para leer el contexto correcto. No se realizó ningún cambio.",
      authRequired: true,
    };
  }
  if (code.includes("TIMEOUT")) {
    return {
      title: "Alfred tardó demasiado",
      answer: "La conexión no respondió a tiempo. Tu comando no se ejecutó ni modificó datos.",
      authRequired: false,
    };
  }
  return {
    title: "No pudimos conectar con Alfred",
    answer: "La sesión sigue segura y no se realizó ningún cambio. Reintenta en un momento.",
    authRequired: false,
  };
}

export function createAlfredCommandRuntime({
  root = document.querySelector("[data-forge-application]"),
} = {}) {
  if (!root) throw new Error("ALFRED_COMMAND_ROOT_REQUIRED");
  if (root[stateKey]) return root[stateKey].api;

  ensureStylesheet();

  const sheet = root.querySelector("[data-forge-alfred-sheet]");
  const panel = sheet?.querySelector(".sheet-panel");
  const inputLabel = sheet?.querySelector(".alfred-input");
  const input = inputLabel?.querySelector("input");
  const submit = inputLabel?.querySelector("button");
  const suggestions = sheet?.querySelector(".suggestions");

  if (!sheet || !panel || !inputLabel || !input || !submit || !suggestions) {
    throw new Error("ALFRED_COMMAND_SURFACE_INCOMPLETE");
  }

  input.dataset.alfredCommandInput = "true";
  submit.dataset.alfredCommandSubmit = "true";
  suggestions.dataset.alfredCommandSuggestions = "true";
  Array.from(suggestions.querySelectorAll("button")).forEach((button) => {
    button.dataset.alfredCommandSuggestion = normalizeText(button.textContent, 240);
  });

  const response = responseSurface(panel, inputLabel);
  const abortController = new AbortController();
  const { signal } = abortController;
  const state = {
    initialized: false,
    busy: false,
    requestSequence: 0,
    history: [],
    activeUserId: null,
    lastProvider: null,
  };

  function setRuntimeState(value) {
    document.documentElement.dataset.alfredCommandRuntime = value;
    sheet.dataset.alfredCommandState = value;
    const orbitState = value === "loading" ? "thinking" : value === "ready" ? "action" : "idle";
    root.querySelectorAll("[data-alfred-state]").forEach((node) => {
      if (sheet.classList.contains("open") || value === "loading") {
        node.dataset.alfredState = orbitState;
      }
    });
  }

  function setBusy(busy) {
    state.busy = busy;
    input.disabled = busy;
    submit.disabled = busy;
    inputLabel.setAttribute("aria-busy", String(busy));
    if (busy) {
      setRuntimeState("loading");
      renderLoading();
    }
  }

  function clearResponse() {
    response.replaceChildren();
    response.hidden = true;
    delete response.dataset.state;
  }

  function renderLoading() {
    response.hidden = false;
    response.dataset.state = "loading";
    response.replaceChildren();
    const meta = createElement("p", "alfred-command-response__meta", "ALFRED");
    const title = createElement("h3", "alfred-command-response__title", "Pensando con tu contexto…");
    const line = createElement("div", "alfred-command-response__loading");
    line.setAttribute("aria-hidden", "true");
    response.append(meta, title, line);
  }

  function appendActions(container, items = []) {
    const valid = Array.isArray(items)
      ? items.filter((item) => item?.label && item?.command).slice(0, 3)
      : [];
    if (!valid.length) return;
    const actions = createElement("div", "alfred-command-response__actions");
    for (const item of valid) {
      const button = createElement(
        "button",
        "alfred-command-response__action",
        normalizeText(item.label, 80),
      );
      button.type = "button";
      button.dataset.alfredFollowupCommand = normalizeText(item.command, 240);
      actions.append(button);
    }
    container.append(actions);
  }

  function renderPayload(payload) {
    response.hidden = false;
    response.dataset.state = payload?.degraded ? "degraded" : "ready";
    response.replaceChildren();

    const meta = createElement("p", "alfred-command-response__meta", providerLabel(payload));
    const title = createElement(
      "h3",
      "alfred-command-response__title",
      normalizeText(payload?.title, 100) || "Alfred",
    );
    const answer = createElement(
      "p",
      "alfred-command-response__answer",
      normalizeMultiline(payload?.answer, 1400),
    );
    answer.style.whiteSpace = "pre-line";
    const boundary = createElement(
      "p",
      "alfred-command-response__boundary",
      "Solo lectura · requiere tu aprobación",
    );

    response.append(meta, title, answer);
    appendActions(response, payload?.suggestions);
    response.append(boundary);
    response.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderError(error) {
    const normalized = errorMessage(error);
    response.hidden = false;
    response.dataset.state = "error";
    response.replaceChildren();

    const meta = createElement("p", "alfred-command-response__meta", "ALFRED");
    const title = createElement("h3", "alfred-command-response__title", normalized.title);
    const answer = createElement("p", "alfred-command-response__answer", normalized.answer);
    response.append(meta, title, answer);

    if (normalized.authRequired) {
      const action = createElement("button", "alfred-command-response__auth", "Iniciar sesión");
      action.type = "button";
      action.dataset.alfredAuthOpen = "true";
      response.append(action);
    }
  }

  function buildContext() {
    return {
      routeId: normalizeText(
        root.dataset.forgeRoute
          || new URL(location.href).searchParams.get("nav")
          || "inicio",
        80,
      ),
      routeLabel: routeLabel(root),
      pageTitle: normalizeText(document.title, 160),
      visibleSummary: visibleSummary(root),
      timestamp: new Date().toISOString(),
      uiState: uiState(),
    };
  }

  function addHistory(role, text) {
    state.history.push({ role, text: normalizeText(text, 900) });
    state.history = state.history.filter((item) => item.text).slice(-MAX_HISTORY_ITEMS);
  }

  async function authenticatedClient() {
    const bootstrap = await waitForBootstrap();
    if (
      typeof bootstrap?.getClient !== "function"
      || typeof bootstrap?.getSession !== "function"
    ) {
      const error = new Error("ALFRED_AUTH_BOOTSTRAP_UNAVAILABLE");
      error.code = "AUTH_REQUIRED";
      throw error;
    }
    const sessionResult = await bootstrap.getSession();
    const session = sessionResult?.data?.session || null;
    if (!session?.user?.id) {
      const error = new Error("ALFRED_AUTH_REQUIRED");
      error.code = "AUTH_REQUIRED";
      throw error;
    }
    const client = await bootstrap.getClient();
    return { client, session };
  }

  async function execute(commandValue) {
    const command = normalizeText(commandValue, 2000);
    if (!command || state.busy) return null;

    input.value = command;
    const sequence = ++state.requestSequence;
    setBusy(true);

    try {
      const { client, session } = await authenticatedClient();
      if (sequence !== state.requestSequence) return null;

      if (state.activeUserId && state.activeUserId !== session.user.id) {
        state.history = [];
      }
      state.activeUserId = session.user.id;

      const invocation = client.functions.invoke(FUNCTION_NAME, {
        body: {
          command,
          context: buildContext(),
          history: state.history,
        },
      });
      const result = await withTimeout(invocation);
      if (sequence !== state.requestSequence) return null;
      if (result?.error) {
        const error = new Error(
          result.error.message || result.error.name || "ALFRED_FUNCTION_UNAVAILABLE",
        );
        error.code = String(
          result.error.context?.status
            || result.error.code
            || result.error.name
            || "ALFRED_FUNCTION_UNAVAILABLE",
        );
        throw error;
      }
      const payload = result?.data;
      if (!payload?.ok || !payload?.answer) {
        throw new Error("ALFRED_RESPONSE_INVALID");
      }

      state.lastProvider = payload.provider || null;
      addHistory("user", command);
      addHistory("assistant", payload.answer);
      renderPayload(payload);
      setRuntimeState("ready");
      return payload;
    } catch (error) {
      if (sequence !== state.requestSequence) return null;
      renderError(error);
      setRuntimeState("error");
      return null;
    } finally {
      if (sequence === state.requestSequence) {
        setBusy(false);
        input.disabled = false;
        submit.disabled = false;
        inputLabel.setAttribute("aria-busy", "false");
      }
    }
  }

  function submitCurrent() {
    return execute(input.value);
  }

  function resetForSessionBoundary(status) {
    state.requestSequence += 1;
    state.history = [];
    state.activeUserId = null;
    state.lastProvider = null;
    setBusy(false);
    input.value = "";
    clearResponse();
    setRuntimeState(status === "authenticated" ? "idle" : "auth-required");
  }

  function initialize() {
    if (state.initialized) return api;
    state.initialized = true;
    setRuntimeState("idle");

    submit.addEventListener("click", submitCurrent, { signal });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault();
      void submitCurrent();
    }, { signal });

    suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-alfred-command-suggestion]");
      if (!button) return;
      const command = button.dataset.alfredCommandSuggestion || button.textContent;
      input.value = normalizeText(command, 240);
      void execute(input.value);
    }, { signal });

    response.addEventListener("click", (event) => {
      const followup = event.target.closest("[data-alfred-followup-command]");
      if (followup) {
        input.value = followup.dataset.alfredFollowupCommand || "";
        void execute(input.value);
        return;
      }
      if (event.target.closest("[data-alfred-auth-open]")) {
        globalThis.ForgeAliveAuthEntry067G17B1?.openAuthPanel?.();
      }
    }, { signal });

    globalThis.addEventListener("forge:auth-state-changed", (event) => {
      resetForSessionBoundary(String(event.detail?.status || ""));
    }, { signal });

    document.documentElement.dataset.alfredCommandConnection = CONTRACT_ID;
    return api;
  }

  const api = Object.freeze({
    contractId: CONTRACT_ID,
    functionName: FUNCTION_NAME,
    initialize,
    execute,
    reset: () => resetForSessionBoundary(""),
    diagnostics: () => Object.freeze({
      contractId: CONTRACT_ID,
      initialized: state.initialized,
      busy: state.busy,
      historySize: state.history.length,
      activeUserId: state.activeUserId,
      lastProvider: state.lastProvider,
      runtimeState: sheet.dataset.alfredCommandState || "",
    }),
    destroy() {
      state.requestSequence += 1;
      abortController.abort();
      clearResponse();
      delete root[stateKey];
    },
  });

  root[stateKey] = { api };
  return api;
}

function boot() {
  const root = document.querySelector("[data-forge-application]");
  if (!root) return;
  try {
    const runtime = createAlfredCommandRuntime({ root });
    runtime.initialize();
    globalThis.ForgeAlfredCommandRuntimeV1 = runtime;
  } catch (error) {
    document.documentElement.dataset.alfredCommandRuntime = "failed";
    console.error("[Forge] Alfred command runtime failed", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
