import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseCsv, mapRows } from "../docs/static-preview/forge-alive-material3/cartera-policy-bulk-import.js";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("policy CSV ingestion classifies valid, invalid and duplicate rows before persistence", () => {
  const rows = parseCsv([
    "Titular,Número de póliza,Producto,Aseguradora,Prima",
    "Ana,P-001,Vida,SMNYL,1200",
    "Luis,P-001,Vida,SMNYL,900",
    "Sin Poliza,,GMM,SMNYL,500",
  ].join("\n"));
  const records = mapRows(rows, "polizas.csv");
  assert.equal(records[0].state, "READY_TO_IMPORT");
  assert.equal(records[0].draft.premiumAmount, 1200);
  assert.equal(records[1].state, "DUPLICATE_SUSPECTED");
  assert.equal(records[2].state, "INVALID");
});

test("Cartera exposes governed manual, multi-PDF and CSV/XLSX flows", async () => {
  const [intake, bulk] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/cartera-document-intake.js"),
    read("docs/static-preview/forge-alive-material3/cartera-policy-bulk-import.js"),
  ]);
  assert.match(intake, /data-cartera-policy-pdf-input/);
  assert.match(intake, /CSV o XLSX/);
  assert.match(intake, /bulkImport\.processFile/);
  assert.match(intake, /forge_cartera010b_confirm_policy_with_parties/);
  assert.match(intake, /rejectKnownDuplicate/);
  assert.match(intake, /DUPLICATE_SUSPECTED/);
  assert.match(bulk, /DUPLICATE_SUSPECTED/);
  assert.match(bulk, /PARTIALLY_IMPORTED/);
  assert.match(bulk, /Reintentar fallidas/);
  assert.match(bulk, /xlsx@0\.18\.5/);
  assert.doesNotMatch(bulk, /\.from\(|\.insert\(|\.upsert\(/);
});

test("manual Activity is bounded by the canonical FES authority", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/activity-manual-entry.js");
  assert.match(source, /createFromForgeAlive/);
  assert.match(source, /createCanonicalActivityEvent/);
  assert.match(source, /USER_CONFIRMATION/);
  assert.match(source, /forgeDemoSession/);
  assert.match(source, /cuenta demo es de solo lectura/);
  assert.match(source, /commercial_people/);
  assert.match(source, /canonical_policies/);
  assert.match(source, /prospects/);
  assert.match(source, /syncOnce/);
  assert.match(source, /rawNotesAllowed: false/);
  assert.doesNotMatch(source, /name="notes"|name="note"|textarea/);
});

test("Commissions provides evidence search, attention queue and policy drill-down", async () => {
  const [view, module] = await Promise.all([
    read("platform/compensation/advisor-compensation-070-view.js"),
    read("docs/static-preview/forge-alive-material3/compensation-module.js"),
  ]);
  assert.match(view, /data-comp-attention-state/);
  assert.match(view, /data-comp-search-input/);
  assert.match(view, /data-comp-open-policy/);
  assert.match(module, /url\.searchParams\.set\("nav", "cartera"\)/);
  assert.match(module, /data-comp-search/);
});

test("Dashboard and mobile navigation expose productive adaptive contracts", async () => {
  const [adapter, adapterCss, appCss, shell] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.js"),
    read("docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.css"),
    read("docs/static-preview/forge-alive-material3/app.css"),
    read("docs/static-preview/forge-alive-material3/forge-shell.js"),
  ]);
  assert.match(adapter, /cards\.dataset\.workspaceGrid = "4-column"/);
  assert.match(adapter, /state === "EMPTY"/);
  assert.match(adapter, /smart-widget-source-timeout/);
  assert.match(adapter, /"DISCONNECTED"/);
  assert.match(adapterCss, /grid-template-columns: repeat\(4/);
  assert.match(appCss, /\.nav-pill \{[\s\S]*?flex-wrap: nowrap/);
  assert.match(appCss, /overflow-x: auto/);
  assert.match(shell, /scrollIntoView/);
});
