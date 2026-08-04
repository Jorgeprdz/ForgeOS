import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = new URL("../", import.meta.url);

async function loadBrowserContracts() {
  const directory = await mkdtemp(join(tmpdir(), "forge-alfred-contracts-"));
  const registrySource = await readFile(
    new URL("../platform/commands/alfred-action-registry.js", import.meta.url),
    "utf8",
  );
  const packetSource = (await readFile(
    new URL("../platform/commands/alfred-review-action-packet-browser.js", import.meta.url),
    "utf8",
  )).replace("./alfred-action-registry.js", "./alfred-action-registry.mjs");
  const registryPath = join(directory, "alfred-action-registry.mjs");
  const packetPath = join(directory, "alfred-review-action-packet-browser.mjs");
  await writeFile(registryPath, registrySource);
  await writeFile(packetPath, packetSource);
  const [registry, packet] = await Promise.all([
    import(`${pathToFileURL(registryPath).href}?v=${Date.now()}`),
    import(`${pathToFileURL(packetPath).href}?v=${Date.now()}`),
  ]);
  return {
    registry,
    packet,
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}

test("quick actions are contextual and Chatbot remains an explicit family", async (t) => {
  const contracts = await loadBrowserContracts();
  t.after(contracts.cleanup);
  const { registry } = contracts;

  const home = registry.getAvailableAlfredActions({ routeId: "inicio" });
  const quotes = registry.getAvailableAlfredActions({ routeId: "quotes" });
  const pipeline = registry.getAvailableAlfredActions({ routeId: "pipeline" });

  assert.ok(home.some((item) => item.actionId === "report.prepare_preview"));
  assert.ok(home.some((item) => item.actionId === "compensation.preview"));
  assert.equal(home.some((item) => item.actionId === "memory.prepare_review"), false);
  assert.ok(quotes.some((item) => item.actionId === "quote.prepare_preview"));
  assert.ok(quotes.some((item) => item.actionId === "product.presentation_review"));
  assert.ok(pipeline.some((item) => item.actionId === "client.follow_preview"));
  assert.ok(pipeline.some((item) => item.actionId === "referral.prepare_review"));

  const chatbot = registry.resolveAlfredAction("/Chatbot ayúdame", { routeId: "inicio" });
  assert.equal(chatbot.actionId, "chatbot.open");
  assert.equal(chatbot.kind, "CHATBOT");
  assert.equal(chatbot.routeFamily, "ALFRED_CHATBOT_ENTRY");
});

test("memory, agenda, quote and follow commands build the expected review packet", async (t) => {
  const contracts = await loadBrowserContracts();
  t.after(contracts.cleanup);
  const { packet } = contracts;

  const memory = packet.buildAlfredReviewPacket({
    input: "/Memoria Hoy vi a Juan. Le interesa retiro y quiere revisarlo con su esposa.",
    actionId: "memory.prepare_review",
    routeId: "pipeline",
  });
  assert.equal(memory.packetType, "MEMORY_REVIEW_PACKET");
  assert.ok(memory.productInterests.includes("Retiro"));
  assert.equal(memory.confirmationRequired, true);

  const agenda = packet.buildAlfredReviewPacket({
    input: "/Agenda Tengo cita con María el viernes a las 11.",
    actionId: "calendar.prepare_review",
    routeId: "inicio",
  });
  assert.equal(agenda.packetType, "CALENDAR_EVENT_DRAFT_REVIEW_PACKET");
  assert.match(agenda.calendarCandidate.day, /viernes/i);
  assert.equal(agenda.calendarCandidate.time, "11:00");
  assert.equal(agenda.calendarCandidate.createsCalendarEvent, false);

  const quote = packet.buildAlfredReviewPacket({
    input: "/Cotizar Lariza y su novio retiro y Vida Mujer.",
    actionId: "quote.prepare_preview",
    routeId: "quotes",
  });
  assert.equal(quote.packetType, "PRODUCT_INTELLIGENCE_REVIEW_PACKET");
  assert.ok(quote.productInterests.includes("Retiro"));
  assert.ok(quote.productInterests.includes("Vida Mujer"));

  const follow = packet.buildAlfredReviewPacket({
    input: "/Follow Juan la próxima semana.",
    actionId: "client.follow_preview",
    routeId: "pipeline",
  });
  assert.equal(follow.packetType, "FOLLOW_UP_REVIEW_PACKET");
  assert.equal(follow.followUpCandidate.reviewRequired, true);
  assert.equal(follow.followUpCandidate.createsTask, false);
});

test("every browser review packet preserves constitutional safety", async (t) => {
  const contracts = await loadBrowserContracts();
  t.after(contracts.cleanup);
  const { packet } = contracts;
  const result = packet.buildAlfredReviewPacket({
    input: "/Referido Luis Pérez es referido de Giovanni Islas, compañero del trabajo.",
    actionId: "referral.prepare_review",
    routeId: "pipeline",
  });

  assert.equal(result.packetType, "REFERRAL_CAPTURE_REVIEW_PACKET");
  assert.equal(result.finalAuthority, "HUMAN");
  assert.equal(result.safety.previewOnly, true);
  assert.equal(result.safety.reviewOnly, true);
  assert.equal(result.safety.notApproved, true);
  assert.equal(result.safety.notSendable, true);
  assert.equal(result.safety.executesRuntime, false);
  assert.equal(result.safety.writesCrm, false);
  assert.equal(result.safety.createsCalendarEvent, false);
  assert.equal(result.safety.createsTask, false);
  assert.equal(result.safety.sendsMessage, false);
  assert.ok(result.forbiddenActions.includes("CALL_PROVIDER_RUNTIME"));
  assert.equal(result.proposedActions[0].executionState, "NOT_EXECUTED");
});

test("Pages closure publishes and rewrites the full Alfred graph", async () => {
  const source = await readFile(
    new URL("../scripts/prepare-forge-alive-pages-runtime-closure.mjs", import.meta.url),
    "utf8",
  );
  for (const file of [
    "platform/commands/command-registry.js",
    "platform/commands/command-search-engine.js",
    "platform/commands/command-parser-engine.js",
    "platform/commands/entity-context-runtime.js",
    "platform/commands/entity-provider-adapter.js",
    "platform/commands/alfred-action-registry.js",
    "platform/commands/alfred-review-action-packet-browser.js",
  ]) {
    assert.match(source, new RegExp(file.replaceAll("/", "\\/").replaceAll(".", "\\.")));
  }
  assert.match(source, /rewriteAlfredCommandRuntime/);
  assert.match(source, /FORGE_ALIVE_PAGES_ALFRED_COMMAND_OS_REWRITE=PASS/);
  assert.match(source, /\.replaceAll\("\.\.\/\.\.\/\.\.\/platform\/", "\.\.\/\.\.\/platform\/"\)/);
});
