import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const route = fs.readFileSync(
  new URL(
    "../advisor-os/sales-pipeline/pipeline-live-route.js",
    import.meta.url,
  ),
  "utf8",
);

const writer = fs.readFileSync(
  new URL(
    "../advisor-os/sales-pipeline/pipeline-due-action-writer.js",
    import.meta.url,
  ),
  "utf8",
);

const runtime = fs.readFileSync(
  new URL(
    "../advisor-os/sales-pipeline/pipeline-due-action-runtime.js",
    import.meta.url,
  ),
  "utf8",
);

const PipelineUI = require(
  "../advisor-os/sales-pipeline/pipeline-ui.js",
);

test("Stage 3F renders a local-first due-action editor", () => {
  const html = PipelineUI.renderPipelineUI({
    state: "partial",
    message: "Contexto parcial",
    dueActionEditor: {
      state: "ready",
      prospectReference: "prospect-001",
      approvedDisplayName: "Juan Pérez",
      writerAvailable: true,
      hasActiveAction: false,
      nextActionType: "CALL",
      nextActionLocalValue: "2026-07-26T10:00",
    },
  });

  assert.match(html, /data-due-action-editor/);
  assert.match(html, /data-due-action-form/);
  assert.match(html, /Agendar seguimiento/);
  assert.match(html, /Posponer 1 día/);
  assert.match(html, /localmente primero/i);
});

test("Stage 3F preserves card identity for future canonical cards", () => {
  const html = PipelineUI.card({
    prospectId: "prospect-001",
    name: "Juan Pérez",
    status: "NEW",
  });

  assert.match(
    html,
    /data-prospect-id="prospect-001"/,
  );
  assert.match(
    html,
    /data-prospect-name="Juan Pérez"/,
  );
  assert.match(
    html,
    /data-card-calendar="prospect-001"/,
  );
});

test("Stage 3F route derives advisor from AppState only", () => {
  assert.match(route, /AppState\.get\("user"\)/);
  assert.match(
    route,
    /advisorPartitionKey:\s*advisorPartitionKey/,
  );
  assert.equal(
    route.includes("dataset.advisorPartitionKey"),
    false,
  );
  assert.equal(
    route.includes("formData.get(\"advisor"),
    false,
  );
});

test("Stage 3F route binds all governed commands", () => {
  for (const command of [
    "SCHEDULE",
    "RESCHEDULE",
    "MARK_SEEN",
    "ACKNOWLEDGE",
    "SNOOZE",
    "COMPLETE",
    "CANCEL",
  ]) {
    assert.match(
      `${route}\n${writer}`,
      new RegExp(command),
    );
  }
});

test("Stage 3F updates local UI before awaiting sync", () => {
  const executeIndex = route.indexOf(
    "const result = await dueActionRuntime.execute",
  );
  const localMessageIndex = route.indexOf(
    "Guardado localmente. La sincronización continúa",
  );
  const syncAwaitIndex = route.indexOf(
    "result.syncPromise.then",
  );

  assert.ok(executeIndex >= 0);
  assert.ok(localMessageIndex > executeIndex);
  assert.ok(syncAwaitIndex > localMessageIndex);
});

test("Stage 3F dispatches Mi Día local mutation event", () => {
  assert.match(
    writer,
    /nfast09:due-action-mutated/,
  );
  assert.match(
    writer,
    /localCommitted: true/,
  );
});

test("Stage 3F has no direct table or message authority", () => {
  const production = `${writer}\n${runtime}\n${route}`;

  for (const forbidden of [
    /\.from\(/,
    /insert\(/,
    /update\(/,
    /delete\(/,
    /generarWhatsappLink/,
    /messageText/,
    /sendMessage/,
    /providerPayload/,
  ]) {
    assert.equal(
      forbidden.test(production),
      false,
      `forbidden production pattern: ${forbidden}`,
    );
  }
});
