import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildDeterministicResponse,
  buildEnvelope,
  buildPrompt,
  isExplicitChatbotRequest,
  normalizeModelResponse,
  normalizeRequest,
} from "../supabase/functions/alfred-command/logic.mjs";

const user = {
  id: "user-secret-id",
  email: "jorge@example.test",
  user_metadata: { full_name: "Jorge Palacios" },
};

const context = {
  routeId: "inicio",
  routeLabel: "Inicio",
};

test("only mode chatbot plus /Chatbot is accepted by provider logic", () => {
  assert.equal(isExplicitChatbotRequest(normalizeRequest({
    mode: "chatbot",
    command: "/Chatbot ayúdame a pensar",
    context,
  })), true);
  assert.equal(isExplicitChatbotRequest(normalizeRequest({
    mode: "chatbot",
    command: "/Follow Juan",
    context,
  })), false);
  assert.equal(isExplicitChatbotRequest(normalizeRequest({
    command: "/Chatbot ayúdame",
    context,
  })), false);
});

test("/jorge is no longer a special AI identity command", () => {
  const result = buildDeterministicResponse({
    command: "/Chatbot /jorge",
    context,
    user,
  });
  assert.notEqual(result.title, "Tu sesión de Forge");
  assert.doesNotMatch(result.answer, /Jorge Palacios|jorge@example\.test|user-secret-id/);
});

test("request normalization removes DOM summaries and bounds history", () => {
  const request = normalizeRequest({
    mode: " CHATBOT ",
    command: " x ".repeat(1500),
    context: {
      visibleSummary: "should-not-cross-boundary",
      uiState: { secret: "blocked" },
      routeId: "inicio",
      routeLabel: "Inicio",
    },
    history: Array.from({ length: 12 }, (_, index) => ({ role: "user", text: `m${index}` })),
  });
  assert.equal(request.mode, "chatbot");
  assert.ok(request.command.length <= 2000);
  assert.equal(request.history.length, 6);
  assert.deepEqual(request.context, {
    routeId: "inicio",
    routeLabel: "Inicio",
    timestamp: "",
  });
  assert.equal("visibleSummary" in request.context, false);
  assert.equal("uiState" in request.context, false);
});

test("provider prompt declares AI interpretation and Command OS authority", () => {
  const request = normalizeRequest({
    mode: "chatbot",
    command: "/Chatbot ayúdame a pensar alternativas",
    context,
  });
  const prompt = buildPrompt({ request, user });
  assert.match(prompt, /ALFRED_CHATBOT_ENTRY/);
  assert.match(prompt, /no es Command OS/);
  assert.match(prompt, /La IA interpreta/);
  assert.match(prompt, /No inventes/);
  assert.match(prompt, /No conviertas lenguaje natural en un comando ejecutado/);
  assert.doesNotMatch(prompt, /jorge@example\.test|user-secret-id/);
});

test("model output forces follow-ups to stay inside /Chatbot", () => {
  const fallback = buildDeterministicResponse({
    command: "/Chatbot hola",
    context,
    user,
  });
  const normalized = normalizeModelResponse({
    title: "Respuesta",
    answer: "Primero\nSegundo",
    suggestions: [{ label: "Seguir", command: "continúa" }],
  }, fallback);
  assert.equal(normalized.answer, "Primero\nSegundo");
  assert.match(normalized.suggestions[0].command, /^\/Chatbot /);

  const envelope = buildEnvelope({
    response: normalized,
    provider: "gemini",
    functionVersion: "test",
    modelVersion: "test",
  });
  assert.equal(envelope.executionPath, "ALFRED_CHATBOT_ENTRY");
  assert.equal(envelope.commandAuthority, "COMMAND_OS");
  assert.equal(envelope.finalAuthority, "HUMAN");
  assert.equal(envelope.requiresHumanApproval, true);
  assert.equal(envelope.mutationsPerformed, false);
  assert.equal(envelope.executesRuntime, false);
  assert.equal(envelope.crmWritten, false);
});

test("edge function rejects non-chatbot commands and contains no database mutation path", async () => {
  const source = await readFile(
    new URL("../supabase/functions/alfred-command/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /client\.auth\.getUser\(\)/);
  assert.match(source, /isExplicitChatbotRequest/);
  assert.match(source, /command_os_required/);
  assert.match(source, /COMMAND_OS_REQUIRED/);
  assert.match(source, /alfred-chatbot-entry-v2/);
  assert.match(source, /GEMINI_API_KEY/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|\.from\s*\(/i);
});
