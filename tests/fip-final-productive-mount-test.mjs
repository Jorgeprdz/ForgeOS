import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.freeze({
  home: await readFile("docs/static-preview/forge-alive-material3/home-module.js", "utf8"),
  bridge: await readFile("docs/static-preview/forge-alive-material3/fip-productive-home-bridge.js", "utf8"),
  css: await readFile("docs/static-preview/forge-alive-material3/fip-productive-home-bridge.css", "utf8"),
  pack07: await readFile("advisor-os/alfred/fip-pack-07-productive-experience-service.js", "utf8"),
  distributionService: await readFile("docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-service-distribution.js", "utf8"),
  distributionContract: await readFile("docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-contract-distribution.js", "utf8"),
});

assert.match(files.home, /createFipProductiveHomeBridge/);
assert.match(files.home, /forgeFipProductiveRoot/);
assert.match(files.home, /forgePrivateSurface = "home-fip-intelligence"/);
assert.match(files.home, /fipHome\.reconcile/);
assert.match(files.home, /fipHome\.scrub\("home-route-unmounted"\)/);
assert.match(files.home, /ninguna acción se ejecuta sin aprobación humana/);

assert.match(files.bridge, /fip-pack-07-productive-experience-service-distribution\.js\?v=fip-pages-runtime-001/);
assert.doesNotMatch(files.bridge, /moduleUrl\(|advisor-os\/alfred\/fip-pack-07/);
assert.match(files.bridge, /composeAlfredProductiveExperience/);
assert.match(files.bridge, /forge:auth-state-changed/);
assert.match(files.bridge, /generation \+= 1/);
assert.match(files.bridge, /requestGeneration !== generation/);
assert.match(files.bridge, /activeAdvisorId !== advisorId/);
assert.match(files.bridge, /sessionAdvisorId\(currentSession\) !== advisorId/);
assert.match(files.bridge, /root\.replaceChildren\(\)/);
assert.match(files.bridge, /root\.hidden = true/);
assert.match(files.bridge, /WIDGET_PRESENTATION/);
assert.match(files.bridge, /variant: "hero"/);
assert.match(files.bridge, /variant: "wide"/);
assert.match(files.bridge, /Mosaico de inteligencia/);
assert.match(files.bridge, /Alfred seguirá aprendiendo sin inventar datos/);
assert.match(files.bridge, /ORQUESTADOR · NO AUTORIDAD/);
assert.doesNotMatch(files.bridge, /automaticMessage\s*:\s*true|automaticTask\s*:\s*true|automaticPipelineAdvance\s*:\s*true/);

assert.match(files.distributionService, /fip-pack-07-productive-experience-contract-distribution\.js/);
assert.match(files.distributionService, /composeAlfredProductiveExperience/);
assert.match(files.distributionService, /ACTION_REQUIRING_APPROVAL/);
assert.match(files.distributionContract, /FORGE_FIP_PACK_07_PRODUCTIVE_EXPERIENCE/);
assert.match(files.distributionContract, /unknownAsZero: false/);
assert.match(files.distributionContract, /humanApprovalRequired: true/);

assert.match(files.css, /padding-bottom:calc\(188px \+ env\(safe-area-inset-bottom/);
assert.match(files.css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(files.css, /data-variant="hero"/);
assert.match(files.css, /data-variant="wide"/);
assert.match(files.css, /grid-column:1\/-1/);
assert.match(files.css, /min-height:140px/);
assert.match(files.css, /color:#f7f8ff/);
assert.match(files.css, /\.fip-source-strip\{[^}]*flex-wrap:wrap[^}]*overflow:visible/s);
assert.doesNotMatch(files.css, /var\(--md-sys-color-surface-container,#fff\)/);
assert.match(files.css, /@media\(min-width:600px\) and \(max-width:839px\)/);
assert.match(files.css, /@media\(min-width:840px\)/);
assert.match(files.css, /@media\(max-width:420px\)/);
assert.match(files.pack07, /ACTION_REQUIRING_APPROVAL/);

const distribution = await import("../docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-service-distribution.js");
const experience = distribution.composeAlfredProductiveExperience({
  advisorReference: "advisor:test",
  generatedAt: "2026-08-02T19:00:00.000Z",
  packs: { nash: { recommendations: [{ title: "Seguimiento", summary: "Contactar hoy." }] } },
});
assert.equal(experience.contractType, "FORGE_FIP_PACK_07_PRODUCTIVE_EXPERIENCE");
assert.ok(experience.widgets.some(widget => widget.id === "home-nash" && widget.state === "READY"));

console.log("FIP_FINAL_PRODUCTIVE_MOUNT=PASS");
console.log("FIP_PAGES_RUNTIME_ASSET_PUBLICATION=PASS");
console.log("FIP_HOME_INTELLIGENCE_MOSAIC=PASS");
console.log("FIP_MOBILE_VISUAL_CONTRAST=PASS");
console.log("FIP_MOBILE_SOURCE_WRAP=PASS");
console.log("FIP_MOBILE_SAFE_ZONE=PASS");
console.log("FIP_ALFRED_ORCHESTRATION=PASS");
console.log("FIP_UNKNOWN_STATE_HONESTY=PASS");
console.log("FIP_LOGOUT_SCRUB=PASS");
console.log("FIP_LATE_RESULT_REJECTION=PASS");
console.log("FIP_RESPONSIVE_CONTRACT=MOBILE+TABLET+DESKTOP");
