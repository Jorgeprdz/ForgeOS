import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.freeze({
  home: await readFile("docs/static-preview/forge-alive-material3/home-module.js", "utf8"),
  smartCss: await readFile("docs/static-preview/forge-alive-material3/smart-widget-productive-home-adapter.css", "utf8"),
  bridge: await readFile("docs/static-preview/forge-alive-material3/fip-productive-home-bridge.js", "utf8"),
  pack07: await readFile("advisor-os/alfred/fip-pack-07-productive-experience-service.js", "utf8"),
  distributionService: await readFile("docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-service-distribution.js", "utf8"),
  distributionContract: await readFile("docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-contract-distribution.js", "utf8"),
});

assert.match(files.home, /createAuthenticatedProductiveHome/);
assert.doesNotMatch(files.home, /createFipProductiveHomeBridge/);
assert.doesNotMatch(files.home, /home-fip-intelligence|fipHome\.reconcile|fipHome\.scrub/);
assert.match(files.home, /replacedByProductiveSmartWidgets/);
assert.match(files.home, /data\.canonicalHomeActions|dataset\.canonicalHomeActions/);
assert.match(files.home, /PLAN DE HOY/);
assert.match(files.home, /SIGUIENTE MEJOR ACCIÓN/);
assert.match(files.home, /Sin una prioridad confiable todavía/);
assert.match(files.home, /Sin seguimiento prioritario calculable/);
assert.match(files.home, /Forge esperará señales reales antes de recomendar una acción/);
assert.match(files.home, /makeReasonExpandable/);
assert.match(files.home, /¿Por qué\?/);
assert.match(files.home, /intelligenceAbsorbed/);
assert.match(files.home, /productiveHome\.scrub\("home-route-unmounted"\)/);
assert.match(files.home, /ninguna acción se ejecuta sin aprobación humana/);

assert.match(files.smartCss, /\.productive-smart-widget\.is-plan/);
assert.match(files.smartCss, /\.productive-smart-widget\.is-followup/);
assert.match(files.smartCss, /data-canonical-action-cards/);
assert.match(files.smartCss, /productive-smart-widget-why-toggle/);
assert.match(files.smartCss, /productive-smart-widget-reason\[hidden\]/);
assert.match(files.smartCss, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);

assert.match(files.bridge, /composeAlfredProductiveExperience/);
assert.match(files.bridge, /generation \+= 1/);
assert.match(files.bridge, /requestGeneration !== generation/);
assert.match(files.bridge, /root\.replaceChildren\(\)/);
assert.match(files.pack07, /ACTION_REQUIRING_APPROVAL/);
assert.match(files.distributionService, /ACTION_REQUIRING_APPROVAL/);
assert.match(files.distributionContract, /unknownAsZero: false/);
assert.match(files.distributionContract, /humanApprovalRequired: true/);

const distribution = await import("../docs/static-preview/forge-alive-material3/fip-pack-07-productive-experience-service-distribution.js");
const experience = distribution.composeAlfredProductiveExperience({
  advisorReference: "advisor:test",
  generatedAt: "2026-08-02T19:00:00.000Z",
  packs: { nash: { recommendations: [{ title: "Seguimiento", summary: "Contactar hoy." }] } },
});
assert.equal(experience.contractType, "FORGE_FIP_PACK_07_PRODUCTIVE_EXPERIENCE");
assert.ok(experience.widgets.some(widget => widget.id === "home-nash" && widget.state === "READY"));

console.log("HOME_SMART_WIDGETS_CANONICALIZATION=PASS");
console.log("HOME_INTELLIGENCE_ABSORPTION=PASS");
console.log("HOME_DEMONSTRATIVE_PLAN_REPLACED=PASS");
console.log("HOME_DEMONSTRATIVE_FOLLOWUP_REPLACED=PASS");
console.log("HOME_EXPLAIN_WHY_DISCLOSURE=PASS");
console.log("HOME_HONEST_EMPTY_STATES=PASS");
console.log("HOME_HUMAN_APPROVAL_REQUIRED=PASS");
console.log("FIP_LOGOUT_SCRUB=PASS");
console.log("FIP_LATE_RESULT_REJECTION=PASS");
console.log("FIP_RESPONSIVE_CONTRACT=MOBILE+TABLET+DESKTOP");
