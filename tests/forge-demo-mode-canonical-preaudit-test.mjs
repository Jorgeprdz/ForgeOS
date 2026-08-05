import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(path, "utf8");

test("canonical entries never mount the retired mobile mockup", async () => {
  const [root, docsRoot, bridge] = await Promise.all([
    read("index.html"),
    read("docs/index.html"),
    read("docs/static-preview/forge-alive/index.html"),
  ]);
  assert.doesNotMatch(root, /10-gui\/mobile-daily/);
  assert.doesNotMatch(docsRoot, /10-gui\/mobile-daily/);
  assert.match(docsRoot, /static-preview\/forge-alive-material3/);
  assert.match(bridge, /forge-alive-material3/);
});

test("demo requires paired build flags and a local non-Supabase actor", async () => {
  const source = await read("docs/static-preview/forge-alive-material3/forge-demo-mode.js");
  assert.match(source, /FORGE_DEMO_MODE/);
  assert.match(source, /FORGE_DEMO_ALLOW_AUTH_BYPASS/);
  assert.match(source, /requestedMode !== requestedBypass/);
  assert.match(source, /FORGE_DEMO_MODE_CONFIG_INCONSISTENT/);
  assert.match(source, /FORGE_DEMO_MODE_FORBIDDEN_IN_PRODUCTION/);
  assert.match(source, /id: "forge-demo-user"/);
  assert.match(source, /supabaseSession: null/);
  assert.doesNotMatch(source, /localStorage|searchParams|document\.cookie|signIn/);
});

test("demo is fail-closed across auth, private reads, and mutations", async () => {
  const [demo, guard, login, pipeline, admin, activity, policy] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/forge-demo-mode.js"),
    read("docs/static-preview/forge-alive-material3/authenticated-route-guard.js"),
    read("docs/static-preview/forge-alive-material3/login-integrated-demo.js"),
    read("docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js"),
    read("docs/static-preview/forge-alive-material3/pipeline-prospect-admin.js"),
    read("docs/static-preview/forge-alive-material3/activity-manual-entry.js"),
    read("docs/static-preview/forge-alive-material3/cartera-document-intake.js"),
  ]);
  assert.match(demo, /FORGE_DEMO_PRIVATE_READ_BLOCKED/);
  assert.match(demo, /FORGE_DEMO_REAL_MUTATION_BLOCKED/);
  assert.match(demo, /FORGE_DEMO_REMOTE_NETWORK_BLOCKED/);
  assert.match(guard, /applyStatus\("demo"\)/);
  assert.match(login, /ForgeDemoMode\?\.active === true\) return/);
  assert.match(pipeline, /assertNoRealMutation/);
  assert.match(admin, /assertNoPrivateRead/);
  assert.match(activity, /forgeDemoSession/);
  assert.match(policy, /forgeDemoSession/);
});

test("production Pages rejects every demo configuration", async () => {
  const workflow = await read(".github/workflows/pages.yml");
  assert.match(workflow, /FORGE_DEMO_MODE/);
  assert.match(workflow, /FORGE_DEMO_ALLOW_AUTH_BYPASS/);
  assert.match(workflow, /FORGE_DEMO_MODE is forbidden in the production Pages deployment/);
  assert.match(workflow, /SUPABASE_URL_PROJECT_REF_MISMATCH/);
});
