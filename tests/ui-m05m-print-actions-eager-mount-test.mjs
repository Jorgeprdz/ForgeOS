import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/app.js",
  "utf8",
);
const identityPersistence = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/quote-runtime-client-identity-persistence-m05y001.js",
  "utf8",
);
const printable = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js",
  "utf8",
);
const vidaMujerVisual = fs.readFileSync(
  "docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.js",
  "utf8",
);

const shellInitialize = app.indexOf("shell.initialize();");
const printableBoot = app.indexOf("void startPrintableAuthority();");
const environmentWait = app.indexOf('await loadAuthority(envBase, "env.js")');
const rateBridgeWait = app.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js");
const identityPersistenceMount = app.indexOf(
  "quote-runtime-client-identity-persistence-m05y001.js",
);
const vidaMujerVisualMount = app.indexOf(
  "quote-runtime-vida-mujer-visual-m05e010.js",
);
const directM05zImports = app.match(
  /quote-runtime-printable-state-handoff-m05z001\.js/g,
) || [];
const transitiveM05zImports = identityPersistence.match(
  /quote-runtime-printable-state-handoff-m05z001\.js/g,
) || [];

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
  identityPersistenceMount >= 0,
  "client identity persistence authority must be mounted",
);
assert.match(
  app,
  /quote-runtime-client-identity-persistence-m05y001\.js\?v=m05y-002-single-m05z-instance/,
  "productive app must cache-bust the M05Y authority that owns the M05Z import",
);
assert.equal(
  directM05zImports.length,
  0,
  "app.js must not load a second M05Z module instance",
);
assert.equal(
  transitiveM05zImports.length,
  1,
  "M05Y must own exactly one M05Z import",
);
assert.match(
  identityPersistence,
  /quote-runtime-printable-state-handoff-m05z001\.js\?v=m05z-002-single-instance/,
  "the single M05Z instance must be cache-busted",
);
assert.ok(
  vidaMujerVisualMount > identityPersistenceMount,
  "Vida Mujer visual reconciliation must load after the single M05Y/M05Z chain",
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

assert.match(
  vidaMujerVisual,
  /ensureTotalContributedCard\(host, calculation\)/,
  "the established Vida Mujer calculation presentation must remain mounted",
);
assert.match(
  vidaMujerVisual,
  /data-quote-mandatory-metric=\"total-contributed\"/,
  "the total contributed metric must remain part of the existing visual authority",
);

console.log("PASS UI-M05M eager printable actions", {
  actions: ["printer", "pdf", "history"],
  independentFromRateAuthority: true,
  productiveM05zInstances: 1,
  calculationAuthorityMutated: false,
});
