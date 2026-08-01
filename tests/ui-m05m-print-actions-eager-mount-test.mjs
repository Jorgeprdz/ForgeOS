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
});
