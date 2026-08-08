import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const authorityPath =
  "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const sourceAuthorityImport =
  "../../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const publicAuthorityImport =
  "../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const publicBindingUrl =
  "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/segubeca-productive-ui-binding.js";

const pagesWorkflow = await readFile(".github/workflows/pages.yml", "utf8");
const previewBuilder = await readFile(
  "scripts/build-quotes-preview-pages.mjs",
  "utf8",
);
const binding = await readFile(
  "docs/static-preview/forge-alive-material3/segubeca-productive-ui-binding.js",
  "utf8",
);
const authority = await readFile(authorityPath, "utf8");

test("the source-layout import requires a project-Pages artifact rewrite", () => {
  assert.ok(
    binding.includes(sourceAuthorityImport),
    "the local source-layout authority import must remain unchanged",
  );
  assert.equal(
    new URL(sourceAuthorityImport, publicBindingUrl).pathname,
    `/${authorityPath}`,
    "the source-layout import escapes the ForgeOS project path when copied verbatim",
  );
  assert.equal(
    new URL(publicAuthorityImport, publicBindingUrl).pathname,
    `/ForgeOS/${authorityPath}`,
    "the rewritten import must stay inside the ForgeOS project Pages root",
  );
});

test("canonical Pages publishes the asset and rewrites its browser import", () => {
  assert.ok(
    pagesWorkflow.includes(`const segubecaAuthorityAsset =`)
      && pagesWorkflow.includes(authorityPath),
    "canonical Pages must declare the accepted SeguBeca authority asset",
  );
  assert.match(
    pagesWorkflow,
    /const publicConversationRuntimeFiles = new Set\([\s\S]*segubecaAuthorityAsset,/,
    "the authority asset must be included in the canonical public file allow-set",
  );
  assert.match(
    pagesWorkflow,
    /for \(const file of trackedFiles\.filter\(isPublicFile\)\)[\s\S]*fs\.copyFileSync\(file, target\);/,
    "canonical Pages must copy allowed tracked assets into the public artifact",
  );
  assert.ok(pagesWorkflow.includes(sourceAuthorityImport));
  assert.ok(pagesWorkflow.includes(publicAuthorityImport));
  assert.match(
    pagesWorkflow,
    /segubecaPublicBindingSource\.replace\([\s\S]*segubecaSourceAuthorityImport,[\s\S]*segubecaPublicAuthorityImport/,
    "canonical Pages must rewrite the browser import to the project-safe path",
  );
  assert.match(
    pagesWorkflow,
    /if \(segubecaPublicBinding === segubecaPublicBindingSource\)[\s\S]*throw new Error\('SeguBeca public authority import was not rewritten'\)/,
    "the import rewrite must fail closed when no rewrite occurs",
  );
});

test("the alternate Quotes Pages builder applies the same asset and import contract", () => {
  assert.match(
    previewBuilder,
    /const segubecaAuthorityAsset\s*=\s*[\s\S]*segubeca-calculation-authority\.js/,
  );
  assert.ok(previewBuilder.includes(sourceAuthorityImport));
  assert.ok(previewBuilder.includes(publicAuthorityImport));
  assert.match(previewBuilder, /PAGES_PREVIEW_SEGUBECA_AUTHORITY=PASS/);
  assert.match(previewBuilder, /PAGES_PREVIEW_SEGUBECA_IMPORT=PASS/);
});

test("the published source remains the accepted authority, not a copied formula", () => {
  assert.match(authority, /SEGUBECA_ACCEPTED_PRODUCT_CALCULATION/);
  assert.match(authority, /SEGUBECA-CALCULATION-AUTHORITY-001\.1/);
  assert.match(authority, /calculateFromAcceptedPacket/);
  assert.match(authority, /productCalculationReimplemented:\s*false/);
  assert.match(authority, /flatTotalContributionConversionAuthorized:\s*false/);
});
