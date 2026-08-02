import assert from "node:assert/strict";
import { mkdtemp, cp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_ID,
  prepareForgeAlivePagesRuntimeClosure,
} from "../scripts/prepare-forge-alive-pages-runtime-closure.mjs";

const root = process.cwd();

test("Pages runtime closure publishes demo, lifecycle, printable and CRS 09 dependencies", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "forge-pages-runtime-"));
  const siteDir = join(temporaryRoot, "_site");

  try {
    const canonicalRoot = join(siteDir, "static-preview/forge-alive");
    await mkdir(canonicalRoot, { recursive: true });
    await mkdir(join(siteDir, "static-preview"), { recursive: true });
    await cp(
      join(root, "docs/static-preview/quote-printable-runtime"),
      join(siteDir, "static-preview/quote-printable-runtime"),
      { recursive: true },
    );
    for (const file of [
      "person-workspace-module.js",
      "person-workspace-module.css",
      "person-workspace-entry-bridge.js",
      "person-workspace-entry-bridge.css",
    ]) {
      await cp(
        join(root, "docs/static-preview/forge-alive-material3", file),
        join(canonicalRoot, file),
      );
    }

    const manifest = await prepareForgeAlivePagesRuntimeClosure({ siteDir });
    assert.equal(manifest.contractId, FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_ID);
    assert.ok(manifest.runtimeFiles.length >= 16);
    assert.ok(manifest.rewrittenProxies.length >= 3);

    const required = [
      "advisor-os/sales-pipeline/productive-prospect-bootstrap.js",
      "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
      "platform/event-evidence/quote-lifecycle-supabase-service.js",
      "platform/event-evidence/prospect-quote-detail-projection.js",
      "platform/shared-commercial-model/crs-09-person-workspace-contract.js",
      "advisor-os/person-workspace/crs-09-person-workspace-service.js",
      "static-preview/forge-alive/person-workspace-module.js",
      "static-preview/forge-alive/person-workspace-module.css",
      "static-preview/forge-alive/person-workspace-entry-bridge.js",
      "static-preview/forge-alive/person-workspace-entry-bridge.css",
      "static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.js",
      "static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.css",
      "forge-alive-pages-runtime-closure.json",
    ];
    for (const path of required) {
      assert.ok((await readFile(join(siteDir, path))).length > 0, path);
    }

    const proxy = await readFile(
      join(
        siteDir,
        "static-preview/quote-printable-runtime/quote-printable-read-model-m05e005.js",
      ),
      "utf8",
    );
    assert.match(proxy, /\.\.\/\.\.\/advisor-os\/quotes\/printable\//);
    assert.doesNotMatch(proxy, /\.\.\/\.\.\/\.\.\/advisor-os\//);

    const qpd = await readFile(
      join(siteDir, "static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.js"),
      "utf8",
    );
    assert.match(qpd, /QPD06_PRODUCTIVE_ROUTE_BINDING_V1/);

    const lifecycle = await readFile(
      join(siteDir, "platform/event-evidence/quote-lifecycle-supabase-service.js"),
      "utf8",
    );
    assert.match(lifecycle, /ForgeQuoteLifecycleSupabaseServiceCartera001B/);

    const workspace = await readFile(
      join(siteDir, "static-preview/forge-alive/person-workspace-module.js"),
      "utf8",
    );
    assert.match(workspace, /CRS_09_PRODUCTIVE_PERSON_WORKSPACE_MATERIAL3_V1/);
    assert.match(workspace, /lateResultRejectCount/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("Pages validator activates closure only for the real _site artifact", async () => {
  const validator = await readFile(
    join(root, "scripts/validate-pages-public-config.mjs"),
    "utf8",
  );
  assert.match(validator, /path\.basename\(siteDir\) === '_site'/);
  assert.match(validator, /prepareForgeAlivePagesRuntimeClosure/);
  assert.match(validator, /FORGE_SKIP_PAGES_RUNTIME_PREPARATION/);
});

test("canonical verification rejects a false-green artifact with missing runtime assets", async () => {
  const workflow = await readFile(
    join(root, ".github/workflows/pages-canonical-verification.yml"),
    "utf8",
  );
  for (const required of [
    "QPD_JS_URL",
    "QPD_CSS_URL",
    "PRINTABLE_READ_MODEL_URL",
    "QUOTE_LIFECYCLE_URL",
    "CLOSURE_MANIFEST_URL",
    "FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_V1",
    "PAGES_CANONICAL=FAIL_STALE_OR_MISSING_RUNTIME",
  ]) {
    assert.match(workflow, new RegExp(required));
  }
});
