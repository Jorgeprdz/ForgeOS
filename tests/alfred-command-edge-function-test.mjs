import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildDeterministicResponse,
  buildEnvelope,
  buildPrompt,
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
  visibleSummary: "Te faltan 6 pólizas para alcanzar tu meta. Hay 3 seguimientos pendientes.",
};

test("/jorge resolves the authenticated display name without leaking auth data", () => {
  const result = buildDeterministicResponse({ command: "/jorge", context, user });
  assert.equal(result.title, "Tu sesión de Forge");
  assert.match(result.answer, /Jorge Palacios/);
  assert.doesNotMatch(result.answer, /jorge@example\.test|user-secret-id/);
});

test("follow-up prioritization uses only visible evidence", () => {
  const result = buildDeterministicResponse({
    command: "Prioriza mis seguimientos",
    context,
    user,
  });
  assert.match(result.answer, /3 seguimientos pendientes|6 pólizas/);
  assert.ok(result.suggestions.length > 0);
});

test("request normalization bounds browser context and history", () => {
  const request = normalizeRequest({
    command: " x ".repeat(1500),
    context: { visibleSummary: "y".repeat(10000), routeId: "inicio" },
    history: Array.from({ length: 12 }, (_, index) => ({ role: "user", text: `m${index}` })),
  });
  assert.ok(request.command.length <= 2000);
  assert.ok(request.context.visibleSummary.length <= 6000);
  assert.equal(request.history.length, 6);
});

test("provider prompt forbids invention, mutation and identity leakage", () => {
  const prompt = buildPrompt({ request: normalizeRequest({ command: "/jorge", context }), user });
  assert.match(prompt, /No inventes/);
  assert.match(prompt, /No muestres correo/);
  assert.match(prompt, /requiere aprobación humana/);
  assert.doesNotMatch(prompt, /jorge@example\.test|user-secret-id/);
});

test("model output and envelope remain review-only", () => {
  const fallback = buildDeterministicResponse({ command: "hola", context, user });
  const normalized = normalizeModelResponse({
    title: "Respuesta",
    answer: "Primero\nSegundo",
    suggestions: [{ label: "Seguir", command: "continúa" }],
  }, fallback);
  assert.equal(normalized.answer, "Primero\nSegundo");

  const envelope = buildEnvelope({
    response: normalized,
    provider: "gemini",
    functionVersion: "test",
    modelVersion: "test",
  });
  assert.equal(envelope.requiresHumanApproval, true);
  assert.equal(envelope.mutationsPerformed, false);
  assert.equal(envelope.messageSent, false);
  assert.equal(envelope.calendarEventCreated, false);
  assert.equal(envelope.taskCreated, false);
  assert.equal(envelope.crmWritten, false);
});

test("edge function requires auth and contains no database mutation path", async () => {
  const source = await readFile(
    new URL("../supabase/functions/alfred-command/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /client\.auth\.getUser\(\)/);
  assert.match(source, /GEMINI_API_KEY/);
  assert.match(source, /auth_required/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|\.from\s*\(/i);
});
