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

test("Pages runtime closure publishes demo, lifecycle and printable dependencies", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "forge-pages-runtime-"));
  const siteDir = join(temporaryRoot, "_site");

  try {
    await mkdir(join(siteDir, "static-preview/forge-alive"), { recursive: true });
    await mkdir(join(siteDir, "static-preview"), { recursive: true });
    await cp(
      join(root, "docs/static-preview/quote-printable-runtime"),
      join(siteDir, "static-preview/quote-printable-runtime"),
      { recursive: true },
    );

    const manifest = await prepareForgeAlivePagesRuntimeClosure({ siteDir });
    assert.equal(manifest.contractId, FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_ID);
    assert.ok(manifest.runtimeFiles.length >= 7);
    assert.ok(manifest.rewrittenProxies.length >= 3);

    const required = [
      "advisor-os/sales-pipeline/productive-prospect-bootstrap.js",
      "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
      "platform/event-evidence/quote-lifecycle-supabase-service.js",
      "platform/event-evidence/prospect-quote-detail-projection.js",
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
