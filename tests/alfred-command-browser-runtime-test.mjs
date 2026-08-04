import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("canonical shell mounts Alfred V2 and legacy side effects are removed", async () => {
  const [app, legacy] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/app.js"),
    read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
  ]);
  assert.match(
    app,
    /import \{ createAlfredCommandRuntime \} from "\.\/alfred-command-runtime\.js\?v=alfred-command-runtime-002"/,
  );
  assert.match(app, /createAlfredCommandRuntime\(\{[\s\S]*root: application,[\s\S]*shell,/);
  assert.match(app, /alfred\.initialize\(\)/);
  assert.doesNotMatch(legacy, /alfred-command-runtime/);
});

test("runtime imports canonical parser, search, registry, entity and review packet contracts", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  for (const path of [
    "command-registry.js",
    "command-search-engine.js",
    "command-parser-engine.js",
    "entity-context-runtime.js",
    "entity-provider-adapter.js",
    "alfred-action-registry.js",
    "alfred-review-action-packet-browser.js",
  ]) {
    assert.match(runtime, new RegExp(path.replaceAll(".", "\\.")));
  }
  assert.match(runtime, /FORGE_ALFRED_COMMAND_OS_RUNTIME_V2/);
  assert.match(runtime, /buildAlfredReviewPacket/);
  assert.match(runtime, /resolveEntities/);
  assert.match(runtime, /buildEntityNavigation/);
  assert.match(runtime, /registerPersonEntityProvider/);
});

test("quick actions come from contextual registry rather than hardcoded AI prompts", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  assert.match(runtime, /getAvailableAlfredActions\(\{ routeId: currentRoute\(root\) \}\)/);
  assert.match(runtime, /suggestions\.replaceChildren\(\)/);
  assert.match(runtime, /alfredQuickActionsSource/);
  assert.match(runtime, /COMMAND_OS_ACTION_REGISTRY/);
  assert.doesNotMatch(runtime, /visibleSummary|activeRouteRoot|cloneNode\(true\)/);
});

test("only explicit Chatbot entry invokes the protected AI function", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  assert.match(runtime, /action\?\.kind === "CHATBOT"/);
  assert.match(runtime, /mode: "chatbot"/);
  assert.match(runtime, /client\.functions\.invoke\(FUNCTION_NAME/);
  assert.match(runtime, /ALFRED_CHATBOT_ENTRY/);
  assert.equal((runtime.match(/functions\.invoke\(FUNCTION_NAME/g) || []).length, 1);
  assert.doesNotMatch(runtime, /providerLabel|Prioriza mis seguimientos|Explícame el riesgo de hoy/);
});

test("write-like commands stop at review packets with explicit safety states", async () => {
  const [runtime, packet, css] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/alfred-command-runtime.js"),
    read("platform/commands/alfred-review-action-packet-browser.js"),
    read("docs/static-preview/forge-alive-material3/alfred-command-runtime.css"),
  ]);
  assert.match(runtime, /ALFRED_REVIEW_ACTION_PACKET/);
  assert.match(runtime, /Nada fue guardado, enviado, agendado ni aprobado/);
  assert.match(packet, /previewOnly: true/);
  assert.match(packet, /writesCrm: false/);
  assert.match(packet, /createsCalendarEvent: false/);
  assert.match(packet, /sendsMessage: false/);
  assert.match(packet, /finalAuthority: 'HUMAN'/);
  assert.match(css, /\.alfred-packet-facts/);
  assert.match(css, /\.alfred-packet-uncertainty/);
  assert.match(css, /\.alfred-command-result/);
});

test("session boundaries scrub ephemeral chat and person cache", async () => {
  const runtime = await read(
    "docs/static-preview/forge-alive-material3/alfred-command-runtime.js",
  );
  assert.match(runtime, /state\.chatHistory = \[\]/);
  assert.match(runtime, /state\.personSnapshot = \[\]/);
  assert.match(runtime, /forge:productive-prospect-auth-state/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB/);
});
