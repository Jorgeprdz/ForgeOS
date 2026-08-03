import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = "docs/static-preview/forge-alive-material3";
const appCss = readFileSync(`${base}/app.css`, "utf8");
const indexHtml = readFileSync(`${base}/index.html`, "utf8");
const homeRuntime = readFileSync(`${base}/home-live-dashboard-active-runtime.js`, "utf8");
const homeModule = readFileSync(`${base}/home-module.js`, "utf8");
const bulkImport = readFileSync(`${base}/pipeline-bulk-import-mount.js`, "utf8");
const compensationBootstrap = readFileSync(`${base}/compensation-route-bootstrap-100b.js`, "utf8");

assert.match(
  appCss,
  /\.forge-module-viewport\s*>\s*\[data-route-module\]:not\(\[hidden\]\)\s*\{[\s\S]*?grid-column:\s*1\s*\/\s*-1;[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/,
  "Every direct visible route root must span the canonical shell grid",
);
assert.match(appCss, /\.profile\[data-forge-auth-state="anonymous"\]\s*\{[\s\S]*?display:\s*none\s*!important;/);
assert.match(appCss, /\.forge-auth-floating-avatar-067g17b1\[data-forge-auth-state="anonymous"\][\s\S]*?min-width:\s*64px;/);
assert.match(appCss, /content:\s*"Entrar"/);

for (const marker of ["plan-card organic-card", "next-card organic-card", "summary-section", "opportunities organic-card"]) {
  const tag = indexHtml.match(new RegExp(`<section class="${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`))?.[0] || "";
  assert.match(tag, /data-home-static-placeholder/);
  assert.match(tag, /hidden/);
  assert.match(tag, /aria-hidden="true"/);
}
assert.doesNotMatch(indexHtml, /<h1>Buenos días, Jorge<\/h1>/);
assert.doesNotMatch(indexHtml, /<span>JP<\/span>/);
assert.match(homeRuntime, /heading\.textContent\s*=\s*authenticated[\s\S]*?inicia sesión/);
assert.match(homeRuntime, /profile\.hidden\s*=\s*!authenticated/);
assert.match(homeRuntime, /if\s*\(!authenticated\)\s*\{[\s\S]*?profile\.replaceChildren\(\);[\s\S]*?return;/);
assert.match(homeRuntime, /section\.removeAttribute\("data-home-static-placeholder"\)/);
assert.match(homeModule, /summary\.removeAttribute\("data-home-static-placeholder"\)/);

const authCheck = bulkImport.indexOf("if (!await requireAuthenticatedIdentity()) return false;");
const fileInputMarkup = bulkImport.indexOf("data-bulk-import-file");
assert.ok(authCheck >= 0 && authCheck < fileInputMarkup, "Auth must be checked before creating a file input");
assert.match(bulkImport, /forgeAuthBoundary\s*!==\s*"authenticated"/);
assert.match(bulkImport, /result\?\.data\?\.session\?\.user\?\.id/);
assert.match(bulkImport, /openAuthPanel\?\.\(\{ nav: "pipeline" \}\)/);
assert.match(bulkImport, /new CustomEvent\("forge:session-required"/);

assert.match(compensationBootstrap, /let recoveryController = null;/);
assert.match(compensationBootstrap, /let recoveryGeneration = 0;/);
assert.match(compensationBootstrap, /function cancelRecovery\(/);
assert.match(compensationBootstrap, /recoveryController\.abort\(reason\)/);
assert.match(compensationBootstrap, /generation === recoveryGeneration/);
assert.match(compensationBootstrap, /verified-session-required/);
assert.match(compensationBootstrap, /signal\?\.aborted \|\| !isCurrent\(\)/);
assert.match(compensationBootstrap, /!activeCompensationRoute\(\)/);
assert.match(compensationBootstrap, /forgeAuthBoundary !== "authenticated"/);
assert.match(compensationBootstrap, /cancelRecovery\("compensation-route-left"\)/);
assert.match(compensationBootstrap, /cancelRecovery\("private-runtime-scrub"\)/);
assert.match(compensationBootstrap, /--text:\s*var\(--forge-sys-color-on-surface/);
assert.match(compensationBootstrap, /--card-bg:\s*var\(--forge-sys-color-surface-container/);

console.log("BETA1_011_RESPONSIVE_SESSION_AUTHORITY_REPAIR=PASS");
