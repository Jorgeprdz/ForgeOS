import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const printable = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js",
  "utf8",
);

const shellInitialize = app.indexOf("shell.initialize();");
const printableBoot = app.indexOf("void startPrintableAuthority();");
const environmentWait = app.indexOf('await loadAuthority(envBase, "env.js")');
const rateBridgeWait = app.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js");
const identityPersistence = app.indexOf(
  "quote-runtime-client-identity-persistence-m05y001.js",
);
const printableStateHandoff = app.indexOf(
  "quote-runtime-printable-state-handoff-m05z001.js",
);
const vidaMujerVisual = app.indexOf(
  "quote-runtime-vida-mujer-visual-m05e010.js",
);

assert.ok(shellInitialize >= 0, "shell initialize is missing");
assert.ok(printableBoot > shellInitialize, "printable actions must start after shell init");
assert.ok(
  printableBoot < environmentWait,
  "printable actions must mount before environment network waits",
);
assert.ok(
  printableBoot < rateBridgeWait,
  "printable actions must mount before rate bridge waits",
);
assert.match(
  app,
  /quote-runtime-printable-closure-m05e006\.js\?v=m05e-011-eager-print-actions/,
);
assert.doesNotMatch(
  app.slice(app.indexOf("const optionalAuthorities")),
  /quote-runtime-printable-closure-m05e006\.js/,
  "printable runtime must not return to the rate-dependent optional queue",
);

assert.ok(
  identityPersistence >= 0,
  "client identity persistence authority must be mounted",
);
assert.ok(
  printableStateHandoff > identityPersistence,
  "M05Z productive handoff must load after client identity persistence",
);
assert.ok(
  vidaMujerVisual > printableStateHandoff,
  "M05Z productive handoff must load before Vida Mujer visual reconciliation",
);
assert.match(
  app,
  /quote-runtime-printable-state-handoff-m05z001\.js\?v=m05z-001-productive-mount/,
  "productive app must import the accepted-state handoff",
);
assert.match(
  app,
  /"quote-printable-state-handoff"/,
  "productive authority status must expose the M05Z mount",
);

for (const iconName of ["printer", "pdf", "history"]) {
  assert.match(printable, new RegExp(`${iconName}:\\s*'<svg`));
}
for (const action of ["preview", "download", "history"]) {
  assert.match(
    printable,
    new RegExp(`data-m05e005-action=\\"${action}\\"`),
  );
}

console.log("PASS UI-M05M eager printable actions", {
  actions: ["printer", "pdf", "history"],
  independentFromRateAuthority: true,
  productiveM05zMount: true,
});
