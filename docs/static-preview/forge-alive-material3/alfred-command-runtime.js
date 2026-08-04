import { COMMANDS } from "../../../platform/commands/command-registry.js";
import { buscarComandos } from "../../../platform/commands/command-search-engine.js";
import { parsearComando } from "../../../platform/commands/command-parser-engine.js";
import {
  buildEntityNavigation,
  resolveEntities,
} from "../../../platform/commands/entity-context-runtime.js";
import { registerPersonEntityProvider } from "../../../platform/commands/entity-provider-adapter.js";
import {
  getAvailableAlfredActions,
  resolveAlfredAction,
  searchAlfredActions,
} from "../../../platform/commands/alfred-action-registry.js";
import { buildAlfredReviewPacket } from "../../../platform/commands/alfred-review-action-packet-browser.js";

const CONTRACT_ID = "FORGE_ALFRED_COMMAND_OS_RUNTIME_V2";
const FUNCTION_NAME = "alfred-command";
const REQUEST_TIMEOUT_MS = 24_000;
const MAX_CHAT_HISTORY_ITEMS = 6;
const PERSON_CACHE_TTL_MS = 30_000;
const stateKey = Symbol.for("forge.alfred.command.os.runtime.state");

function normalizeText(value, max = 1800) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeMultiline(value, max = 1600) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function normalizeRoute(routeId) {
  const value = normalizeText(routeId, 80).toLowerCase();
  if (value === "dashboard") return "inicio";
  if (value === "cotizaciones") return "quotes";
  if (value === "advisor-sales-pipeline") return "pipeline";
  return value || "inicio";
}

function escapeSelector(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function ensureStylesheet() {
  const selector = "[data-alfred-command-runtime-styles]";
  if (document.querySelector(selector)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./alfred-command-runtime.css?v=alfred-command-runtime-002",
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

function currentRoute(root) {
  return normalizeRoute(
    root.dataset.forgeRoute
      || new URL(location.href).searchParams.get("nav")
      || "inicio",
  );
}

function routeLabel(root) {
  return normalizeText(
    root.querySelector("[data-forge-nav-pill] [aria-current='page'] span")?.textContent
      || currentRoute(root),
    120,
  );
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

function normalizeError(error) {
  const code = String(error?.code || error?.message || "");
  if (
    code.includes("AUTH")
    || code.includes("401")
    || code.includes("JWT")
    || code.includes("CONFIG_BLOCKED")
  ) {
    return {
      title: "Inicia sesión para continuar",
      answer: "Alfred necesita la sesión protegida para consultar el índice correcto. No se realizó ningún cambio.",
      authRequired: true,
    };
  }
  if (code.includes("TIMEOUT")) {
    return {
      title: "La consulta tardó demasiado",
      answer: "No hubo respuesta a tiempo. Nada fue guardado, enviado ni ejecutado.",
      authRequired: false,
    };
  }
  return {
    title: "No pudimos preparar esta acción",
    answer: "El fallo quedó contenido. Nada fue guardado, enviado, agendado ni ejecutado.",
    authRequired: false,
  };
}

function queryRemainder(input, action) {
  const raw = normalizeText(input);
  const terms = [action?.command, ...(action?.aliases || [])]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  const lower = raw.toLocaleLowerCase("es-MX");
  for (const term of terms) {
    const normalizedTerm = String(term).toLocaleLowerCase("es-MX");
    if (lower === normalizedTerm) return "";
    if (lower.startsWith(`${normalizedTerm} `)) {
      return raw.slice(term.length).trim();
    }
  }
  return raw.replace(/^[/@]/, "").trim();
}

function isEntityLikeInput(input, parsed, action) {
  if (action?.kind === "ENTITY_SEARCH") return true;
  if (parsed.type === "ENTITY_HINT") return true;
  if (parsed.type !== "EXPLICIT_COMMAND_HINT") return false;
  if (action) return false;
  return Boolean(normalizeText(parsed.value));
}

function commandMatches(query) {
  return buscarComandos({ query, commands: COMMANDS })
    .filter((command) => command.intent === "NAVIGATION")
    .slice(0, 6);
}

function routeFromCommand(command) {
  return normalizeRoute(command?.payload?.route || "inicio");
}

function publicRouteValue(route) {
  if (route === "quotes") return "cotizaciones";
  if (route === "dashboard") return "inicio";
  return route;
}

export function createAlfredCommandRuntime({
  root = document.querySelector("[data-forge-application]"),
  shell = null,
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
  input.placeholder = "Busca, prepara o escribe /Chatbot…";

  const response = responseSurface(panel, inputLabel);
  const abortController = new AbortController();
  const { signal } = abortController;
  const state = {
    initialized: false,
    busy: false,
    requestSequence: 0,
    chatHistory: [],
    activeUserId: null,
    entityProviderCleanup: null,
    personSnapshot: [],
    personSnapshotAt: 0,
    lastExecutionPath: "IDLE",
    lastPacket: null,
  };

  function setRuntimeState(value) {
    document.documentElement.dataset.alfredCommandRuntime = value;
    document.documentElement.dataset.alfredCommandContract = CONTRACT_ID;
    sheet.dataset.alfredCommandState = value;
    const orbitState = value === "loading" ? "thinking" : value === "ready" ? "action" : "idle";
    root.querySelectorAll("[data-alfred-state]").forEach((node) => {
      if (sheet.classList.contains("open") || value === "loading") {
        node.dataset.alfredState = orbitState;
      }
    });
  }

  function recordExecutionPath(path) {
    state.lastExecutionPath = path;
    document.documentElement.dataset.alfredExecutionPath = path;
    sheet.dataset.alfredExecutionPath = path;
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
    response.append(
      createElement("p", "alfred-command-response__meta", "ALFRED · COMMAND OS"),
      createElement("h3", "alfred-command-response__title", "Resolviendo contexto…"),
      createElement("div", "alfred-command-response__loading"),
    );
  }

  function renderBoundary(container, text = "Preparación local · autoridad final humana") {
    container.append(createElement("p", "alfred-command-response__boundary", text));
  }

  function actionButton({ label, command = "", actionId = "", className = "" }) {
    const button = createElement(
      "button",
      `alfred-command-response__action ${className}`.trim(),
      normalizeText(label, 100),
    );
    button.type = "button";
    if (command) button.dataset.alfredPreparedCommand = normalizeText(command, 600);
    if (actionId) button.dataset.alfredActionId = actionId;
    return button;
  }

  function renderActionCatalog(items, title = "Acciones disponibles") {
    response.hidden = false;
    response.dataset.state = "catalog";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", "COMMAND OS · REGISTRO DE ACCIONES"),
      createElement("h3", "alfred-command-response__title", title),
      createElement(
        "p",
        "alfred-command-response__answer",
        `Estas acciones corresponden a ${routeLabel(root)} y respetan los contratos disponibles.`,
      ),
    );
    const list = createElement("div", "alfred-command-results");
    for (const item of items) {
      const card = actionButton({
        label: item.label,
        command: item.command,
        actionId: item.actionId,
        className: "alfred-command-result",
      });
      const copy = createElement("span", "alfred-command-result__copy");
      copy.append(
        createElement("strong", "alfred-command-result__title", item.label),
        createElement("small", "alfred-command-result__subtitle", `${item.command} · ${item.previewOnly ? "preview" : "lectura"}`),
      );
      const status = createElement(
        "span",
        "alfred-command-result__status",
        item.kind === "CHATBOT" ? "CHAT" : "REVISAR",
      );
      card.replaceChildren(copy, status);
      list.append(card);
    }
    response.append(list);
    renderBoundary(response, "Las quick actions vienen del registro y del contexto; no de una respuesta generativa.");
    response.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderNavigationResults(commands) {
    response.hidden = false;
    response.dataset.state = "navigation";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", "COMMAND OS · NAVEGACIÓN"),
      createElement("h3", "alfred-command-response__title", "Abrir un módulo"),
    );
    const list = createElement("div", "alfred-command-results");
    for (const command of commands) {
      const button = actionButton({ label: command.label, className: "alfred-command-result" });
      button.dataset.alfredNavigationRoute = routeFromCommand(command);
      const copy = createElement("span", "alfred-command-result__copy");
      copy.append(
        createElement("strong", "alfred-command-result__title", command.label),
        createElement("small", "alfred-command-result__subtitle", command.command),
      );
      button.replaceChildren(copy, createElement("span", "alfred-command-result__status", "ABRIR"));
      list.append(button);
    }
    response.append(list);
    renderBoundary(response, "Lectura y navegación pueden ejecutarse sin convertir IA en autoridad.");
  }

  function renderEntities(resolution, rawInput) {
    response.hidden = false;
    response.dataset.state = "entities";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", "ALFRED INDEX · ENTIDADES"),
      createElement(
        "h3",
        "alfred-command-response__title",
        resolution.candidates.length ? "Selecciona la coincidencia correcta" : "No encontré una coincidencia",
      ),
    );

    if (!resolution.candidates.length) {
      response.append(createElement(
        "p",
        "alfred-command-response__answer",
        `No existe una coincidencia confirmada para “${normalizeText(rawInput, 160)}”. Prueba con @Nombre o escribe más contexto.`,
      ));
      renderBoundary(response, "No se inventó una persona ni se creó un registro.");
      return;
    }

    const list = createElement("div", "alfred-command-results");
    resolution.candidates.forEach((entity, index) => {
      const button = actionButton({ label: entity.label, className: "alfred-command-result" });
      button.dataset.alfredEntityIndex = String(index);
      const copy = createElement("span", "alfred-command-result__copy");
      copy.append(
        createElement("strong", "alfred-command-result__title", entity.label),
        createElement(
          "small",
          "alfred-command-result__subtitle",
          [entity.type, entity.secondaryLabel].filter(Boolean).join(" · "),
        ),
      );
      button.replaceChildren(copy, createElement("span", "alfred-command-result__status", "ABRIR"));
      list.append(button);
    });
    response.append(list);
    response.dataset.entityCandidates = JSON.stringify(resolution.candidates.map((entity) => entity.id));
    response._alfredEntityCandidates = resolution.candidates;
    renderBoundary(response, "El índice muestra candidatos; tú eliges la identidad correcta.");
  }

  function factLabel(fact) {
    return {
      person_candidate: "Persona",
      product_interest: "Producto",
      calendar_day_candidate: "Día",
      calendar_time_candidate: "Hora",
      referral_candidate: "Referido",
      referral_source: "Fuente",
      referral_relationship: "Relación",
      context_signal: "Señal",
      indexed_entity_candidate: "Índice",
      unstructured_query: "Contexto",
    }[fact?.factType] || "Dato";
  }

  function renderPacket(packet) {
    state.lastPacket = packet;
    globalThis.ForgeLastAlfredReviewPacket = packet;
    window.dispatchEvent(new CustomEvent("forge:alfred-review-packet", { detail: packet }));

    response.hidden = false;
    response.dataset.state = "packet";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", `${packet.packetType} · PREVIEW`),
      createElement("h3", "alfred-command-response__title", packet.title),
      createElement("p", "alfred-command-response__answer", packet.reviewSummary),
    );

    if (packet.extractedFacts.length) {
      const facts = createElement("dl", "alfred-packet-facts");
      for (const fact of packet.extractedFacts.slice(0, 10)) {
        facts.append(
          createElement("dt", "alfred-packet-facts__label", factLabel(fact)),
          createElement("dd", "alfred-packet-facts__value", normalizeText(fact.value, 220)),
        );
      }
      response.append(facts);
    }

    if (packet.uncertainty.length) {
      const uncertainty = createElement("section", "alfred-packet-uncertainty");
      uncertainty.append(createElement("strong", "", "Antes de continuar"));
      const list = createElement("ul", "");
      for (const item of packet.uncertainty) list.append(createElement("li", "", item));
      uncertainty.append(list);
      response.append(uncertainty);
    }

    const questions = createElement("section", "alfred-packet-questions");
    questions.append(createElement("strong", "", "Revisión humana"));
    const questionList = createElement("ul", "");
    for (const question of packet.humanReviewQuestions) {
      questionList.append(createElement("li", "", question));
    }
    questions.append(questionList);
    response.append(questions);

    const status = createElement("div", "alfred-packet-status");
    status.append(
      createElement("span", "alfred-packet-status__chip", "NO EJECUTADO"),
      createElement("span", "alfred-packet-status__chip", "CONFIRMACIÓN REQUERIDA"),
    );
    response.append(status);

    if (packet.packetType === "CHATBOT_CONTEXT_REVIEW_PACKET") {
      const actions = createElement("div", "alfred-command-response__actions");
      const openChat = actionButton({
        label: "Entrar al modo Chatbot",
        command: `/Chatbot ${packet.query}`.trim(),
        className: "alfred-command-response__action--primary",
      });
      openChat.dataset.alfredChatbotConfirm = "true";
      actions.append(openChat);
      response.append(actions);
    }

    renderBoundary(response, "Nada fue guardado, enviado, agendado ni aprobado.");
    response.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderChatbot(payload) {
    response.hidden = false;
    response.dataset.state = payload?.degraded ? "degraded" : "chatbot";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", payload?.degraded ? "ALFRED CHATBOT · RESPALDO" : "ALFRED CHATBOT · IA"),
      createElement("h3", "alfred-command-response__title", normalizeText(payload?.title, 120) || "Conversación"),
      createElement("p", "alfred-command-response__answer", normalizeMultiline(payload?.answer, 1600)),
    );
    const actions = createElement("div", "alfred-command-response__actions");
    for (const item of Array.isArray(payload?.suggestions) ? payload.suggestions.slice(0, 3) : []) {
      if (!item?.label || !item?.command) continue;
      actions.append(actionButton({ label: item.label, command: item.command }));
    }
    if (actions.childElementCount) response.append(actions);
    renderBoundary(response, "La IA interpreta en /Chatbot; Command OS conserva contratos, rutas y autoridad.");
  }

  function renderError(error) {
    const normalized = normalizeError(error);
    response.hidden = false;
    response.dataset.state = "error";
    response.replaceChildren();
    response.append(
      createElement("p", "alfred-command-response__meta", "ALFRED · FALLO SEGURO"),
      createElement("h3", "alfred-command-response__title", normalized.title),
      createElement("p", "alfred-command-response__answer", normalized.answer),
    );
    if (normalized.authRequired) {
      const action = actionButton({ label: "Iniciar sesión" });
      action.dataset.alfredAuthOpen = "true";
      response.append(action);
    }
    renderBoundary(response);
  }

  function syncSuggestions() {
    const items = getAvailableAlfredActions({ routeId: currentRoute(root) })
      .filter((item) => item.actionId !== "command.quick_actions")
      .slice(0, 4);
    suggestions.replaceChildren();
    for (const item of items) {
      const button = createElement("button", "", item.label);
      button.type = "button";
      button.dataset.alfredCommandSuggestion = item.command;
      button.dataset.alfredActionId = item.actionId;
      suggestions.append(button);
    }
    suggestions.dataset.alfredQuickActionsSource = "platform/commands/alfred-action-registry.js";
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

  async function readPeople() {
    const now = Date.now();
    if (state.personSnapshotAt && now - state.personSnapshotAt < PERSON_CACHE_TTL_MS) {
      return state.personSnapshot;
    }
    const { client, session } = await authenticatedClient();
    if (state.activeUserId && state.activeUserId !== session.user.id) {
      state.chatHistory = [];
      state.personSnapshot = [];
      state.personSnapshotAt = 0;
    }
    state.activeUserId = session.user.id;
    const { data, error } = await client
      .from("commercial_people")
      .select("id,person_reference,display_name,lifecycle_state,archived_at")
      .eq("advisor_id", session.user.id)
      .eq("lifecycle_state", "CONFIRMED")
      .is("archived_at", null)
      .order("display_name", { ascending: true })
      .limit(500);
    if (error) {
      const failure = new Error(error.message || "ALFRED_PERSON_INDEX_READ_FAILED");
      failure.code = error.code || "ALFRED_PERSON_INDEX_READ_FAILED";
      throw failure;
    }
    state.personSnapshot = Array.isArray(data) ? data : [];
    state.personSnapshotAt = now;
    return state.personSnapshot;
  }

  function ensureEntityProvider() {
    if (state.entityProviderCleanup) return;
    state.entityProviderCleanup = registerPersonEntityProvider({
      read: readPeople,
    });
  }

  function navigate(routeId, params = {}) {
    const route = normalizeRoute(routeId);
    const url = new URL(location.href);
    url.searchParams.set("nav", publicRouteValue(route));
    url.searchParams.delete("person");
    url.searchParams.delete("sourceType");
    url.searchParams.delete("sourceRef");
    url.searchParams.delete("section");
    if (params.personReference) url.searchParams.set("person", params.personReference);
    if (params.section) url.searchParams.set("section", params.section);
    if (params.sourceIdentity?.type) url.searchParams.set("sourceType", params.sourceIdentity.type);
    if (params.sourceIdentity?.reference) url.searchParams.set("sourceRef", params.sourceIdentity.reference);
    history.pushState({ forgeRoute: route, alfred: true }, "", url);
    shell?.reconcile?.();
    shell?.setAlfred?.(false);
    recordExecutionPath("COMMAND_OS_NAVIGATION");
    window.dispatchEvent(new CustomEvent("forge:alfred-navigation", {
      detail: { route, params, source: CONTRACT_ID },
    }));
  }

  async function resolveEntityQuery(query, rawInput) {
    ensureEntityProvider();
    setBusy(true);
    try {
      const resolution = await resolveEntities({
        query,
        types: ["PERSON"],
        context: { route: currentRoute(root) },
        limit: 12,
      });
      recordExecutionPath("COMMAND_OS_ENTITY_INDEX");
      renderEntities(resolution, rawInput);
      setRuntimeState("ready");
      return resolution;
    } catch (error) {
      renderError(error);
      recordExecutionPath("COMMAND_OS_ENTITY_INDEX_FAILED_SAFE");
      setRuntimeState("error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function addChatHistory(role, text) {
    state.chatHistory.push({ role, text: normalizeText(text, 900) });
    state.chatHistory = state.chatHistory.filter((item) => item.text).slice(-MAX_CHAT_HISTORY_ITEMS);
  }

  async function executeChatbot(command) {
    const normalizedCommand = /^\/chatbot(?:\s|$)/i.test(command)
      ? command
      : `/Chatbot ${command}`.trim();
    const sequence = ++state.requestSequence;
    setBusy(true);
    recordExecutionPath("ALFRED_CHATBOT_ENTRY");
    try {
      const { client, session } = await authenticatedClient();
      if (sequence !== state.requestSequence) return null;
      if (state.activeUserId && state.activeUserId !== session.user.id) state.chatHistory = [];
      state.activeUserId = session.user.id;
      const result = await withTimeout(client.functions.invoke(FUNCTION_NAME, {
        body: {
          mode: "chatbot",
          command: normalizedCommand,
          context: {
            routeId: currentRoute(root),
            routeLabel: routeLabel(root),
            timestamp: new Date().toISOString(),
          },
          history: state.chatHistory,
        },
      }));
      if (sequence !== state.requestSequence) return null;
      if (result?.error) {
        const failure = new Error(result.error.message || "ALFRED_CHATBOT_UNAVAILABLE");
        failure.code = String(result.error.context?.status || result.error.code || "ALFRED_CHATBOT_UNAVAILABLE");
        throw failure;
      }
      if (!result?.data?.ok || !result.data.answer) throw new Error("ALFRED_CHATBOT_RESPONSE_INVALID");
      addChatHistory("user", normalizedCommand);
      addChatHistory("assistant", result.data.answer);
      renderChatbot(result.data);
      setRuntimeState("ready");
      return result.data;
    } catch (error) {
      renderError(error);
      setRuntimeState("error");
      return null;
    } finally {
      if (sequence === state.requestSequence) setBusy(false);
    }
  }

  function preparePacket(inputValue, action, entityCandidates = []) {
    const packet = buildAlfredReviewPacket({
      input: inputValue,
      actionId: action?.actionId,
      routeId: currentRoute(root),
      routeLabel: routeLabel(root),
      entityCandidates,
    });
    recordExecutionPath("ALFRED_REVIEW_ACTION_PACKET");
    renderPacket(packet);
    setRuntimeState("ready");
    return packet;
  }

  async function execute(inputValue, options = {}) {
    const command = normalizeText(inputValue, 1800);
    if (!command || state.busy) return null;
    input.value = command;
    syncSuggestions();

    const routeId = currentRoute(root);
    const parsed = parsearComando({ input: command });
    const explicitAction = options.actionId
      ? getAvailableAlfredActions({ routeId }).find((item) => item.actionId === options.actionId)
      : null;
    const action = explicitAction || resolveAlfredAction(command, { routeId });

    if (action?.actionId === "command.quick_actions") {
      recordExecutionPath("COMMAND_OS_ACTION_REGISTRY");
      renderActionCatalog(getAvailableAlfredActions({ routeId }));
      setRuntimeState("ready");
      return { ok: true, executionPath: state.lastExecutionPath };
    }

    if (action?.kind === "CHATBOT") {
      const packet = preparePacket(command, action);
      if (options.confirmChatbot === true) return executeChatbot(command);
      return packet;
    }

    if (action?.kind === "ENTITY_SEARCH" || isEntityLikeInput(command, parsed, action)) {
      const query = queryRemainder(command, action) || parsed.value;
      return resolveEntityQuery(query, command);
    }

    if (action?.kind === "REVIEW_PACKET") {
      return preparePacket(command, action);
    }

    const navigation = commandMatches(parsed.value || command);
    if (navigation.length === 1) {
      navigate(routeFromCommand(navigation[0]));
      return { ok: true, executionPath: state.lastExecutionPath };
    }
    if (navigation.length > 1) {
      recordExecutionPath("COMMAND_OS_NAVIGATION_CATALOG");
      renderNavigationResults(navigation);
      setRuntimeState("ready");
      return { ok: true, executionPath: state.lastExecutionPath };
    }

    const actionMatches = searchAlfredActions(command, { routeId });
    if (actionMatches.length) {
      recordExecutionPath("COMMAND_OS_ACTION_REGISTRY_SEARCH");
      renderActionCatalog(actionMatches, "Coincidencias de Command OS");
      setRuntimeState("ready");
      return { ok: true, executionPath: state.lastExecutionPath };
    }

    return resolveEntityQuery(parsed.value || command, command);
  }

  function submitCurrent() {
    return execute(input.value);
  }

  function resetForSessionBoundary(status) {
    state.requestSequence += 1;
    state.chatHistory = [];
    state.activeUserId = null;
    state.personSnapshot = [];
    state.personSnapshotAt = 0;
    state.lastPacket = null;
    setBusy(false);
    input.value = "";
    clearResponse();
    recordExecutionPath("SESSION_BOUNDARY_RESET");
    setRuntimeState(status === "authenticated" ? "idle" : "auth-required");
  }

  function initialize() {
    if (state.initialized) return api;
    state.initialized = true;
    ensureEntityProvider();
    syncSuggestions();
    setRuntimeState("idle");
    recordExecutionPath("IDLE");

    submit.addEventListener("click", submitCurrent, { signal });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault();
      void submitCurrent();
    }, { signal });

    suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-alfred-command-suggestion]");
      if (!button) return;
      input.value = normalizeText(button.dataset.alfredCommandSuggestion || button.textContent, 600);
      void execute(input.value, { actionId: button.dataset.alfredActionId || "" });
    }, { signal });

    response.addEventListener("click", (event) => {
      const prepared = event.target.closest("[data-alfred-prepared-command]");
      if (prepared) {
        input.value = normalizeText(prepared.dataset.alfredPreparedCommand, 600);
        void execute(input.value, {
          actionId: prepared.dataset.alfredActionId || "",
          confirmChatbot: prepared.dataset.alfredChatbotConfirm === "true",
        });
        return;
      }
      const navigation = event.target.closest("[data-alfred-navigation-route]");
      if (navigation) {
        navigate(navigation.dataset.alfredNavigationRoute);
        return;
      }
      const entityButton = event.target.closest("[data-alfred-entity-index]");
      if (entityButton) {
        const entity = response._alfredEntityCandidates?.[Number(entityButton.dataset.alfredEntityIndex)];
        const target = buildEntityNavigation(entity, { route: currentRoute(root) });
        if (target.ok) navigate(target.route, target.params);
        return;
      }
      if (event.target.closest("[data-alfred-auth-open]")) {
        globalThis.ForgeAliveAuthEntry067G17B1?.openAuth?.();
      }
    }, { signal });

    window.addEventListener("popstate", syncSuggestions, { signal });
    window.addEventListener("pageshow", syncSuggestions, { signal });
    window.addEventListener("forge:route-change", syncSuggestions, { signal });
    window.addEventListener("forge:productive-prospect-auth-state", (event) => {
      resetForSessionBoundary(event.detail?.status || "anonymous");
    }, { signal });

    return api;
  }

  const api = Object.freeze({
    initialize,
    execute,
    syncSuggestions,
    resetForSessionBoundary,
    diagnostics() {
      return Object.freeze({
        contract: CONTRACT_ID,
        initialized: state.initialized,
        busy: state.busy,
        routeId: currentRoute(root),
        lastExecutionPath: state.lastExecutionPath,
        quickActionSource: suggestions.dataset.alfredQuickActionsSource || null,
        chatHistoryItems: state.chatHistory.length,
        lastPacketId: state.lastPacket?.packetId || null,
        productMutations: 0,
      });
    },
    destroy() {
      state.requestSequence += 1;
      state.chatHistory = [];
      state.personSnapshot = [];
      state.entityProviderCleanup?.();
      state.entityProviderCleanup = null;
      abortController.abort();
      clearResponse();
      delete root[stateKey];
    },
  });

  root[stateKey] = { api };
  return api;
}
