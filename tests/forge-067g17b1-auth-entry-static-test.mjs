import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [entry, guard, authEntry, touchGate] = await Promise.all([
  readFile("docs/static-preview/forge-alive/index.html", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/rep-17-session-transition-guard.js", "utf8"),
  readFile("docs/static-preview/forge-alive/forge-alive-auth-entry-067g17b1.js", "utf8"),
  readFile("docs/static-preview/forge-alive-material3/public-auth-touch-gate.js", "utf8"),
]);

assert.match(entry, /FORGE_CANONICAL_ENTRY_BRIDGE_V2/);
assert.match(entry, /\.\.\/forge-alive-material3\//);
assert.match(entry, /current\.searchParams\.entries\(\)/);
assert.match(entry, /target\.hash = current\.hash/);
assert.match(guard, /CANONICAL_ENTRY_PATH = "\/ForgeOS\/static-preview\/forge-alive\/"/);
assert.match(guard, /auth_return/);
assert.match(authEntry, /new URL\('\/ForgeOS\/static-preview\/forge-alive\/'/);
assert.match(touchGate, /new URL\("\/ForgeOS\/static-preview\/forge-alive\/"/);
for (const source of [entry, guard, authEntry, touchGate]) {
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|DATABASE_PASSWORD|refresh_token|access_token\s*[:=]/i);
}
assert.doesNotMatch(entry, /sample-data\.js|Acceso de prueba|Asesor A|Asesor B/);

console.log("CANONICAL_AUTH_ENTRY_STATIC=PASS");
