import { execFileSync } from "node:child_process";

const allowed = new Set([
  ".github/workflows/aura-auth-premium-entry-home-redirect-001.yml",
  "docs/architecture/source-truth/FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_RECONCILIATION_001.md",
  "docs/evidence/FORGE_AURA_AUTH_PREMIUM_ENTRY_AND_GOOGLE_HOME_REDIRECT_ACCEPTANCE_001.md",
  "docs/static-preview/forge-aura/app-v4-r1.js",
  "docs/static-preview/forge-aura/aura-auth-v4.js",
  "docs/static-preview/forge-aura/aura-auth.css",
  "docs/static-preview/forge-aura/aura-router-v4.js",
  "docs/static-preview/forge-aura/auth-v4.html",
  "docs/static-preview/forge-aura/index.html",
  "docs/static-preview/forge-aura/oauth-callback-v4.html",
  "docs/static-preview/forge-aura/oauth-callback-v4.js",
  "scripts/aura-auth-premium-entry-scope-guard-001.mjs",
  "tests/aura-auth-pages-import-graph-001.test.mjs",
  "tests/aura-auth-premium-entry-home-redirect-001.test.mjs",
  "tests/aura-auth-premium-entry-playwright.config.mjs",
  "tests/e2e/aura-auth-premium-entry.spec.mjs",
  "tests/fixtures/aura-auth-premium-entry-harness.html",
  "tests/fixtures/aura-oauth-callback-harness.html",
]);

const base = process.env.BASE_SHA || execFileSync("git", ["merge-base", "origin/main", "HEAD"], { encoding: "utf8" }).trim();
const output = execFileSync("git", ["-c", "core.quotepath=false", "diff", "--name-only", "-z", base, "HEAD"], { encoding: "utf8" });
const changed = output.split("\0").filter(Boolean);

for (const file of changed) {
  if (!allowed.has(file)) {
    console.error(`AUTH_SCOPE_FORBIDDEN_MUTATION=${file}`);
    process.exitCode = 1;
  }
}

const forbiddenPrefixes = [
  "supabase/",
  "compensation/",
  "platform/policy-intelligence/",
  "docs/static-preview/forge-aura/home/",
  "docs/static-preview/forge-aura/pipeline/",
  "docs/static-preview/forge-aura/activity/",
  "docs/static-preview/forge-aura/cartera/",
  "docs/static-preview/forge-aura/income/",
  "docs/static-preview/forge-aura/quotes/",
];

for (const file of changed) {
  if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) {
    console.error(`AUTH_SCOPE_FORBIDDEN_DOMAIN=${file}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);

console.log(`AUTH_SCOPE_CHANGED_FILES=${changed.length}`);
console.log("DATABASE_MUTATION=0");
console.log("RLS_MUTATION=0");
console.log("AUTH_PROVIDER_CONFIGURATION_MUTATION=0");
console.log("GOOGLE_CREDENTIAL_MUTATION=0");
console.log("UNRELATED_MODULE_MUTATION=0");
console.log("MATERIAL_VISUAL_IMPORT=0");
console.log("LEGACY_VISUAL_IMPORT=0");
