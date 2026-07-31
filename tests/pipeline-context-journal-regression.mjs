import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_PIPELINE_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.setDefaultTimeout(10000);
page.on("pageerror", error => console.error(`JOURNAL_PAGE_ERROR=${error.message}`));
page.on("console", message => {
  if (["error", "warning"].includes(message.type())) console.error(`JOURNAL_BROWSER_${message.type().toUpperCase()}=${message.text()}`);
});
const checkpoint = name => console.log(`PIPELINE_CONTEXT_JOURNAL_CHECKPOINT=${name}`);

try {
  await page.goto(new URL("manifest.json?pipeline-context-journal=1", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.setContent(`<!doctype html>
    <html lang="es-MX"><head><meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="${new URL("app.css?v=context-journal-regression", baseUrl).href}">
    </head><body>
      <main data-forge-pipeline-module>
        <article data-productive-prospect-card="prospect-1">
          <header data-productive-card-identity><strong>María López</strong></header>
          <div data-productive-card-status><p><span>Última actividad</span><strong data-latest-activity>Prospecto creado</strong></p></div>
          <div data-productive-card-actions><button type="button" data-view-productive-context="prospect-1">Ver contexto</button></div>
        </article>
      </main>
    </body></html>`);
  checkpoint("FIXTURE_READY");

  await page.evaluate(() => {
    const prospect = {
      id: "prospect-1",
      fullName: "María López",
      initialContext: "Busca proteger a su hija y revisar retiro.",
      status: "contacted",
    };
    const timeline = [{
      id: "timeline-1",
      eventType: "PROSPECT_CREATED",
      occurredAt: "2026-07-30T12:00:00.000Z",
      sourceRecordReference: "PIPELINE_PROSPECT:prospect-1",
      payload: {},
    }];
    const entries = [];
    const calls = [];
    const adapter = {
      service: { getProspect: async () => prospect },
      timelineService: { listProspectTimeline: async () => [...timeline] },
      async reload() { return this.cards; },
      get cards() {
        return [{ id: prospect.id, fullName: prospect.fullName, prospect, timeline: [...timeline] }];
      },
    };
    const journal = {
      async listEntries() { return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
      async appendEntry(prospectId, input) {
        calls.push({ prospectId, ...input });
        const entry = {
          id: `entry-${entries.length + 1}`,
          prospectId,
          content: input.content,
          captureMethod: input.captureMethod,
          createdAt: new Date(Date.UTC(2026, 6, 30, 18, entries.length)).toISOString(),
        };
        entries.push(entry);
        timeline.push({
          id: `timeline-journal-${entry.id}`,
          eventType: "CONVERSATION_RECORDED",
          occurredAt: entry.createdAt,
          sourceRecordReference: `JOURNAL:${entry.id}`,
          payload: { channel: input.captureMethod === "voice" ? "VOICE_NOTE" : "TEXT_NOTE", outcome: "CAPTURED", nextStepType: "JOURNAL_ENTRY" },
        });
        return entry;
      },
    };
    class FakeSpeechRecognition {
      start() {
        this.onstart?.();
        this.onresult?.({ results: [[{ transcript: "Nota dictada por voz" }]] });
        this.onend?.();
      }
      stop() { this.onend?.(); }
      abort() {}
    }
    window.__journalCalls = calls;
    window.__FORGE_PIPELINE_CONTEXT_JOURNAL_OPTIONS__ = {
      createAdapter: async () => adapter,
      createJournalService: async () => journal,
      SpeechRecognition: FakeSpeechRecognition,
      refresh: async detail => {
        document.querySelector("[data-latest-activity]").textContent = detail.latestActivity;
      },
    };
  });
  checkpoint("AUTHORITIES_INJECTED");

  await page.addScriptTag({
    type: "module",
    url: new URL(`pipeline-context-journal.js?v=${Date.now()}`, baseUrl).href,
  });
  checkpoint("MODULE_LOADED");
  await page.waitForFunction(
    () => document.documentElement.dataset.pipelineContextJournal === "ready",
    null,
    { timeout: 10000 },
  );
  checkpoint("MODULE_READY");

  const trigger = page.getByRole("button", { name: "Abrir bitácora de María López" });
  assert.equal(await trigger.textContent(), "Bitácora");
  await trigger.click();
  checkpoint("TRIGGER_CLICKED");

  const dialog = page.getByRole("dialog", { name: "Bitácora de María López" });
  await dialog.waitFor({ state: "visible" });
  await page.getByText("Busca proteger a su hija y revisar retiro.", { exact: true }).waitFor();
  await dialog.getByText("Prospecto creado", { exact: true }).waitFor();
  checkpoint("DIALOG_READY");

  const textarea = page.getByRole("textbox", { name: "Nueva nota" });
  await textarea.fill("Pidió revisar una propuesta la próxima semana.");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await page.getByText("Nota guardada y última actividad actualizada.", { exact: true }).waitFor();
  await dialog.getByText("Pidió revisar una propuesta la próxima semana.", { exact: true }).waitFor();
  assert.equal(await page.locator("[data-latest-activity]").textContent(), "Conversación registrada");
  checkpoint("TEXT_NOTE_SAVED");

  const dictate = page.getByRole("button", { name: /Dictar/ });
  const dictateBox = await dictate.boundingBox();
  assert.ok(dictateBox && dictateBox.width >= 44 && dictateBox.height >= 44, `dictation target ${dictateBox?.width}x${dictateBox?.height}`);
  await dictate.click();
  await page.waitForFunction(
    () => document.querySelector('textarea[name="content"]')?.value.includes("Nota dictada por voz"),
    null,
    { timeout: 10000 },
  );
  checkpoint("VOICE_TRANSCRIPT_READY");
  await page.getByRole("button", { name: "Guardar nota" }).click();
  await dialog.getByText("Nota dictada por voz", { exact: true }).waitFor();
  checkpoint("VOICE_NOTE_SAVED");

  const calls = await page.evaluate(() => window.__journalCalls);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].captureMethod, "text");
  assert.equal(calls[1].captureMethod, "voice");
  assert.equal(calls[1].content, "Nota dictada por voz");

  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await dialog.waitFor({ state: "detached" });
  assert.equal(await trigger.evaluate(node => document.activeElement === node), true);
  checkpoint("WORKSPACE_CLOSED");

  console.log("PIPELINE_CONTEXT_JOURNAL_HISTORY=PASS");
  console.log("PIPELINE_CONTEXT_JOURNAL_TEXT_CAPTURE=PASS");
  console.log("PIPELINE_CONTEXT_JOURNAL_VOICE_CAPTURE=PASS");
  console.log("PIPELINE_CONTEXT_JOURNAL_TIMELINE_LINK=PASS");
  console.log("PIPELINE_CONTEXT_JOURNAL_LATEST_ACTIVITY=PASS");
  console.log("PIPELINE_CONTEXT_JOURNAL_SINGLE_WORKSPACE=PASS");
} finally {
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
}
