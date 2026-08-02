import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const modulePath = new URL(
  "../docs/static-preview/forge-alive-material3/person-workspace-module.js",
  import.meta.url,
);
const cssPath = new URL(
  "../docs/static-preview/forge-alive-material3/person-workspace-module.css",
  import.meta.url,
);

globalThis.document = {
  querySelector(selector) {
    if (selector === "[data-forge-application]") {
      return { dataset: { forgeRoute: "pipeline" } };
    }
    return null;
  },
};

const ui = await import(`${pathToFileURL(modulePath.pathname).href}?test=${Date.now()}`);

test("builds a contextual person route without adding a navigation destination", () => {
  const url = ui.buildWorkspaceUrl(
    {
      sourceIdentity: { type: "PROSPECT", reference: "prospect-1" },
      origin: "pipeline",
    },
    { href: "https://example.test/ForgeOS/?nav=pipeline" },
  );
  assert.equal(url.searchParams.get("nav"), "persona");
  assert.equal(url.searchParams.get("from"), "pipeline");
  assert.equal(url.searchParams.get("sourceType"), "PROSPECT");
  assert.equal(url.searchParams.get("sourceRef"), "prospect-1");
  assert.equal(url.searchParams.has("person"), false);
});

test("prefers canonical person locators and normalizes unsupported origins", () => {
  const url = ui.buildWorkspaceUrl(
    { personReference: "person-1", origin: "unknown-module", section: "policies" },
    { href: "https://example.test/ForgeOS/?nav=cartera" },
  );
  assert.equal(url.searchParams.get("person"), "person-1");
  assert.equal(url.searchParams.get("from"), "inicio");
  assert.equal(url.searchParams.get("section"), "POLICIES");
  assert.deepEqual(
    ui.locatorFromLocation({ href: url.href }),
    { personReference: "person-1" },
  );
});

test("source locators remain explicit and deterministic", () => {
  const locator = ui.locatorFromLocation({
    href: "https://example.test/?nav=persona&sourceType=prospect&sourceRef=p-7",
  });
  assert.deepEqual(locator, {
    sourceIdentity: { type: "PROSPECT", reference: "p-7" },
  });
  assert.equal(ui.locatorSignature(locator), "SOURCE:PROSPECT:p-7");
  assert.equal(ui.locatorSignature(null), "NONE");
});

test("UI source enforces session scrub, generation rejection and no local mutation controls", async () => {
  const source = await readFile(modulePath, "utf8");
  assert.match(source, /forge:auth-state-changed/);
  assert.match(source, /selectedGeneration !== generation/);
  assert.match(source, /lateResultRejectCount \+= 1/);
  assert.match(source, /localMutationControls: false/);
  assert.match(source, /Composición de sólo lectura/);
  assert.doesNotMatch(source, /data-person-workspace-(?:save|delete|update|submit)/);
});

test("responsive CSS reserves mobile safe area and collapses to one column", async () => {
  const css = await readFile(cssPath, "utf8");
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 899px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /data-person-workspace-section="TIMELINE"/);
});
