import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  authEntryUrl,
  normalizeRoute,
  oauthCallbackUrl,
  readExplicitRoute,
} from "../docs/static-preview/forge-aura/aura-router-v4.js";

const read = path => readFileSync(path, "utf8");
const auth = read("docs/static-preview/forge-aura/aura-auth-v4.js");
const css = read("docs/static-preview/forge-aura/aura-auth.css");
const callback = read("docs/static-preview/forge-aura/oauth-callback-v4.js");
const callbackHtml = read("docs/static-preview/forge-aura/oauth-callback-v4.html");
const authHtml = read("docs/static-preview/forge-aura/auth-v4.html");
const indexHtml = read("docs/static-preview/forge-aura/index.html");
const app = read("docs/static-preview/forge-aura/app-v4-r1.js");

test("constitutional and Aura authority declaration remains enforceable in implementation", () => {
  assert.match(css, /var\(--forge-canvas\)/);
  assert.match(css, /var\(--forge-brand-gradient\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.equal((css.match(/#[0-9a-f]{3,8}/gi) || []).length, 0);
  assert.doesNotMatch(css, /material/i);
});

test("Google is the primary login action and email password remains secondary", () => {
  const google = auth.indexOf('data-aura-google');
  const form = auth.indexOf('data-aura-login-form');
  assert.ok(google >= 0 && form > google, "Google action must precede the email/password form");
  assert.match(auth, />Continuar con Google</);
  assert.match(auth, />Bienvenido</);
  assert.match(auth, /Tu operación comercial/);
  assert.match(auth, /Clara y lista para avanzar/);
  assert.match(auth, /autocomplete="username"/);
  assert.match(auth, /autocomplete="current-password"/);
  assert.match(auth, /role="alert"/);
  assert.match(auth, /Forge no guarda tu contraseña/);
  assert.doesNotMatch(auth, /ACCESO PRODUCTIVO|CALLBACK V4|Pipeline protegido|Supabase Auth/);
});

test("auth runtime reuses Supabase productive session contract without creating a new engine", () => {
  assert.match(auth, /persistSession:\s*true/);
  assert.match(auth, /autoRefreshToken:\s*true/);
  assert.match(auth, /detectSessionInUrl:\s*false/);
  assert.match(auth, /flowType:\s*"implicit"/);
  assert.match(auth, /signInWithPassword/);
  assert.match(auth, /signInWithOAuth/);
  assert.match(auth, /getSession/);
  assert.match(auth, /onAuthStateChange/);
  assert.match(auth, /signOut/);
  assert.doesNotMatch(auth, /localStorage|sessionStorage/);
});

test("auth state contract is explicit and authenticated truth requires real user id", () => {
  for (const state of [
    "AUTH_LOADING",
    "AUTH_REQUIRED",
    "AUTHENTICATING_PASSWORD",
    "AUTHENTICATING_GOOGLE",
    "AUTHENTICATED",
    "AUTH_ERROR",
    "SIGNED_OUT",
  ]) assert.match(auth, new RegExp(state));
  assert.match(auth, /user\?\.id/);
});

test("Google default callback returns to Inicio and preserves only a valid explicit route", () => {
  const plain = new URL(oauthCallbackUrl("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/index.html"));
  assert.equal(plain.pathname.endsWith("/oauth-callback-v4.html"), true);
  assert.equal(plain.searchParams.has("return_route"), false);

  const cartera = new URL(oauthCallbackUrl("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/index.html?route=cartera"));
  assert.equal(cartera.searchParams.get("return_route"), "cartera");

  const alias = new URL(oauthCallbackUrl("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/index.html?route=home"));
  assert.equal(alias.searchParams.get("return_route"), "inicio");

  const invalid = new URL(oauthCallbackUrl("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/index.html?route=not-real"));
  assert.equal(invalid.searchParams.has("return_route"), false);

  const login = new URL(oauthCallbackUrl("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/index.html?route=login"));
  assert.equal(login.searchParams.has("return_route"), false);
});

test("router exposes safe transient route semantics without private persistence", () => {
  assert.equal(readExplicitRoute("https://x.test/index.html?route=cartera"), "cartera");
  assert.equal(readExplicitRoute("https://x.test/index.html?nav=quotes"), "cotizaciones");
  assert.equal(readExplicitRoute("https://x.test/index.html?route=login"), null);
  assert.equal(readExplicitRoute("https://x.test/index.html?route=nope"), null);
  assert.equal(normalizeRoute("dashboard"), "inicio");
  assert.equal(authEntryUrl("cartera", "https://x.test/ForgeOS/static-preview/forge-aura/oauth-callback-v4.html").searchParams.get("route"), "cartera");
});

test("OAuth callback validates session, scrubs sensitive URL state, and never hardcodes Pipeline", () => {
  assert.match(callback, /data\?\.session\?\.user\?\.id/);
  assert.match(callback, /setSession/);
  assert.match(callback, /getSession/);
  assert.match(callback, /return_route/);
  assert.match(callback, /"inicio"/);
  assert.match(callback, /Acceso confirmado\. Abriendo tu Inicio/);
  assert.match(callback, /clean\.hash = ""/);
  assert.doesNotMatch(callback, /route=pipeline|Abriendo Pipeline/);
  assert.doesNotMatch(callback, /\.stack|hash_keys|search_keys|diagnostic/i);
  assert.doesNotMatch(callback, /console\.(log|error)\([^)]*(accessToken|refreshToken|access_token|refresh_token)/);
});

test("OAuth callback failure presentation is human, actionable, and non-technical", () => {
  assert.match(callbackHtml, /Forge · Acceso/);
  assert.match(callbackHtml, /Validando tu acceso seguro/);
  assert.match(callbackHtml, /Volver a Forge/);
  assert.match(callbackHtml, /type="module" src="\.\/oauth-callback-v4\.js"/);
  assert.doesNotMatch(callbackHtml, /GOOGLE OAUTH|CALLBACK V4|<pre|data-oauth-diagnostic|style=/i);
  assert.doesNotMatch(callbackHtml, />[^<]*Supabase[^<]*</i);
});

test("Auth entry owns auth presentation and Pipeline CSS loads only on Pipeline route", () => {
  assert.doesNotMatch(authHtml, /pipeline\/pipeline\.css/);
  assert.doesNotMatch(indexHtml, /pipeline\/pipeline\.css/);
  assert.match(app, /route === "pipeline"\) ensureStylesheet\("\.\/pipeline\/pipeline\.css\?v=aura-pipeline-ux-reconciliation-001", "pipeline"\)/);
});

test("Auth entry metadata is product-facing and canonical", () => {
  assert.match(authHtml, /<title>Forge · Acceso<\/title>/);
  assert.match(indexHtml, /<title>Forge(?: · Aura)?<\/title>/);
  assert.doesNotMatch(authHtml, /Pipeline · Auth v4|Auth v\d/i);
  assert.doesNotMatch(indexHtml, /Pipeline · Auth v4|Auth v\d/i);
});

test("responsive hierarchy is explicit for desktop, tablet, mobile, and narrow phone", () => {
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*3fr\)\s+minmax\(0,\s*2fr\)/);
  assert.match(css, /@media \(max-width:\s*1100px\)/);
  assert.match(css, /@media \(max-width:\s*720px\)/);
  assert.match(css, /@media \(max-width:\s*430px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
});

test("no credentials or sensitive auth state are persisted by the new boundary", () => {
  const combined = [auth, callback, read("docs/static-preview/forge-aura/aura-router-v4.js")].join("\n");
  assert.doesNotMatch(combined, /localStorage|sessionStorage/);
  assert.doesNotMatch(combined, /console\.(log|info|warn)\([^)]*password/i);
});
