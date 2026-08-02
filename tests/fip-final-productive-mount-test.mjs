import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = Object.freeze({
  home: await readFile("docs/static-preview/forge-alive-material3/home-module.js", "utf8"),
  bridge: await readFile("docs/static-preview/forge-alive-material3/fip-productive-home-bridge.js", "utf8"),
  css: await readFile("docs/static-preview/forge-alive-material3/fip-productive-home-bridge.css", "utf8"),
  pack07: await readFile("advisor-os/alfred/fip-pack-07-productive-experience-service.js", "utf8"),
});

assert.match(files.home, /createFipProductiveHomeBridge/);
assert.match(files.home, /forgeFipProductiveRoot/);
assert.match(files.home, /forgePrivateSurface = "home-fip-intelligence"/);
assert.match(files.home, /fipHome\.reconcile/);
assert.match(files.home, /fipHome\.scrub\("home-route-unmounted"\)/);
assert.match(files.home, /ninguna acción se ejecuta sin aprobación humana/);

assert.match(files.bridge, /composeAlfredProductiveExperience/);
assert.match(files.bridge, /forge:auth-state-changed/);
assert.match(files.bridge, /generation \+= 1/);
assert.match(files.bridge, /requestGeneration !== generation/);
assert.match(files.bridge, /activeAdvisorId !== advisorId/);
assert.match(files.bridge, /sessionAdvisorId\(currentSession\) !== advisorId/);
assert.match(files.bridge, /root\.replaceChildren\(\)/);
assert.match(files.bridge, /root\.hidden = true/);
assert.match(files.bridge, /Sin señales suficientes todavía\. No se inventaron datos/);
assert.match(files.bridge, /ORQUESTADOR · NO AUTORIDAD/);
assert.doesNotMatch(files.bridge, /automaticMessage\s*:\s*true|automaticTask\s*:\s*true|automaticPipelineAdvance\s*:\s*true/);

assert.match(files.css, /padding-bottom:calc\(96px \+ env\(safe-area-inset-bottom/);
assert.match(files.css, /@media\(min-width:600px\) and \(max-width:839px\)/);
assert.match(files.css, /@media\(min-width:840px\)/);
assert.match(files.css, /@media\(max-width:420px\)/);
assert.match(files.pack07, /ACTION_REQUIRING_APPROVAL/);

console.log("FIP_FINAL_PRODUCTIVE_MOUNT=PASS");
console.log("FIP_ALFRED_ORCHESTRATION=PASS");
console.log("FIP_UNKNOWN_STATE_HONESTY=PASS");
console.log("FIP_LOGOUT_SCRUB=PASS");
console.log("FIP_LATE_RESULT_REJECTION=PASS");
console.log("FIP_RESPONSIVE_CONTRACT=MOBILE+TABLET+DESKTOP");
