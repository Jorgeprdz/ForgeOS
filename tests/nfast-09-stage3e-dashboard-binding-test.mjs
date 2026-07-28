import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../dashboard.js", import.meta.url),
  "utf8",
);

const consumer = fs.readFileSync(
  new URL(
    "../advisor-os/dashboard/advisor-sales-nba-consumer.js",
    import.meta.url,
  ),
  "utf8",
);

test("Stage 3E imports runtime and existing-surface adapter", () => {
  assert.match(source, /createMiDiaDueActionRuntime/);
  assert.match(source, /createMiDiaDueActionSurfaceModel/);
  assert.match(source, /hydrateAdvisorSalesNba/);
});

test("Stage 3E binds into the existing primary NBA host", () => {
  assert.match(source, /getElementById\('dash-sales-nba'\)/);
  assert.match(source, /renderDueActionPrimarySurface/);
});

test("Stage 3E does not add a duplicate follow-up section", () => {
  assert.equal(source.includes('id="dash-due-actions"'), false);
  assert.equal(source.includes("Seguimientos de hoy"), false);
});

test("Stage 3E mounts before legacy dashboard loading", () => {
  const mountIndex =
    source.indexOf("await this._mountDueActionRuntime");
  const legacyIndex =
    source.indexOf(
      "const [historial, cartera, referidos] = await Promise.all",
    );

  assert.ok(mountIndex >= 0);
  assert.ok(legacyIndex >= 0);
  assert.ok(mountIndex < legacyIndex);
});

test("Stage 3E registers runtime cleanup", () => {
  assert.match(
    source,
    /Memory\.add\(\(\) => mounted\.destroy\(\)\)/,
  );
});

test("Stage 3E preserves the queue in AppState", () => {
  assert.match(source, /AppState\.set\('miDiaDueActions'/);
  assert.match(source, /supportingQueue/);
});

test("Stage 3E does not read due actions from legacy DB", () => {
  assert.equal(
    /DB\.obtenerTodos\(['"]dueActions['"]\)/.test(source),
    false,
  );
  assert.equal(
    /DB\.obtenerTodos\(['"]prospect_due_actions['"]\)/.test(source),
    false,
  );
});

test("Stage 3E consumer separates route identity and display name", () => {
  assert.match(consumer, /subjectLabel/);
  assert.match(consumer, /data-forge-context-id/);
  assert.match(consumer, /responseActionsAllowed === false/);
});
