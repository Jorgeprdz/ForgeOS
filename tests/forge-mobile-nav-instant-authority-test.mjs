import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, css, app, shell] = await Promise.all([
  readFile("docs/static-preview/forge-alive-material3/index.html", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/app.css", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/app.js", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/forge-shell.js", "utf8"),
]);

assert.match(html, /class="nav-pill" data-forge-nav-pill/);
assert.match(css, /\.nav-pill\s*\{/);
assert.match(css, /flex-wrap:\s*nowrap/);
assert.match(css, /overflow-x:\s*auto/);
assert.match(css, /white-space:\s*nowrap/);
assert.match(css, /font-size:\s*11px/);
assert.match(app, /createForgeShell/);
assert.match(shell, /data-route-id/);
assert.match(shell, /history\.pushState/);
assert.doesNotMatch(css, /\.nav-pill[^}]*flex-wrap:\s*wrap/s);

console.log("CANONICAL_MOBILE_NAV_SINGLE_ROW_CONTRACT=PASS");
