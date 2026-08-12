import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const home = await read("docs/static-preview/forge-aura/home/home-module.js");
const core = await read("docs/static-preview/forge-aura/home/home-core.js");
const adapter = await read("docs/static-preview/forge-aura/home/home-adapter-pages-v1.js");
const css = await read("docs/static-preview/forge-aura/home/home.css");

for (const surface of ["agenda", "rhythm", "cartera", "mick"]) {
  assert.match(home, new RegExp(`id: ["']${surface}["']`));
}
assert.match(home, /renderBriefing\(snapshot, decisions\)[\s\S]*renderOperatingDashboard\(snapshot, timeZone\)[\s\S]*renderSupportingAttention\(snapshot, decisions\)/);
assert.match(home, /body: renderAgenda\(snapshot, timeZone\)/);
assert.match(home, /body: renderRhythm\(snapshot\)/);
assert.match(home, /body: renderCartera\(snapshot\)/);
assert.match(home, /body: renderMick\(snapshot\)/);
assert.match(home, /snapshot\.attention\.value\.items\.slice\(1, 3\)/);

assert.match(adapter, /buildAgendaReadModel/);
assert.match(adapter, /buildProductiveSmartWidgetStack/);
assert.match(adapter, /forge_cartera050_list_future_radar/);
assert.match(adapter, /MICK_OBSERVATION_SOURCE_NOT_CONNECTED_TO_AURA_HOME/);
assert.doesNotMatch(adapter, /\.insert\s*\(|\.update\s*\(|\.upsert\s*\(|\.delete\s*\(/);
assert.match(core, /Forge conserva lo desconocido como desconocido|missing_or_incomplete_operational_evidence/);
assert.match(core, /sin inferir disciplina, motivación ni carácter/);

assert.match(home, /data-home-decision="ACCEPT"/);
assert.match(home, /data-home-decision="MODIFY"/);
assert.match(home, /data-home-decision="DEFER"/);
assert.match(home, /data-home-decision="DISMISS"/);
assert.match(home, /createAuraDecisionControl/);
assert.match(home, /No pudimos guardar tu decisión/);
assert.doesNotMatch(home, /activityExecuted\s*:\s*true|outcomeCreated\s*:\s*true/);

assert.match(css, /home-operating-grid/);
assert.match(css, /grid-template-columns:minmax\(0,1\.08fr\) minmax\(320px,\.92fr\)/);
assert.match(css, /@media\(max-width:960px\)\{\.home-operating-grid\{grid-template-columns:1fr\}/);
assert.match(css, /@media\(max-width:720px\)/);
assert.match(css, /home-section-heading\{align-items:flex-start;flex-direction:column\}/);

console.log("PHASE_017D_HOME_PRODUCTIVE_DASHBOARD_CONTRACT=PASS");
