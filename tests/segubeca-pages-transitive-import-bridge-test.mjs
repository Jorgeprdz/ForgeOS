import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const authorityPath =
  "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
const publicAuthorityUrl = new URL(
  `https://jorgeprdz.github.io/ForgeOS/${authorityPath}`,
);

const dependencies = Object.freeze([
  "forge-pdf-browser-parser.js",
  "forge-accepted-quote-adapter.js",
  "forge-udi-mxn-runtime.js",
]);

const authority = await readFile(authorityPath, "utf8");
const previewBuilder = await readFile(
  "scripts/build-quotes-preview-pages.mjs",
  "utf8",
);
const pagesWorkflow = await readFile(".github/workflows/pages.yml", "utf8");

for (const file of dependencies) {
  test(`public bridge preserves the canonical ${file} import`, async () => {
    const canonicalSpecifier =
      `../../../../docs/static-preview/quote-runtime/${file}`;
    assert.ok(
      authority.includes(canonicalSpecifier),
      `canonical authority import missing: ${canonicalSpecifier}`,
    );

    const compatibilitySource =
      `docs/docs/static-preview/quote-runtime/${file}`;
    const bridge = await readFile(compatibilitySource, "utf8");
    const reexportSpecifier =
      `../../../static-preview/quote-runtime/${file}`;
    assert.equal(
      bridge,
      `export * from "${reexportSpecifier}";\n`,
      "compatibility bridge must remain a logic-free re-export",
    );

    const canonicalPublicDependency = new URL(
      canonicalSpecifier,
      publicAuthorityUrl,
    );
    assert.equal(
      canonicalPublicDependency.pathname,
      `/ForgeOS/docs/static-preview/quote-runtime/${file}`,
    );

    const bridgePublicUrl = new URL(
      `https://jorgeprdz.github.io/ForgeOS/docs/static-preview/quote-runtime/${file}`,
    );
    const publicRuntime = new URL(reexportSpecifier, bridgePublicUrl);
    assert.equal(
      publicRuntime.pathname,
      `/ForgeOS/static-preview/quote-runtime/${file}`,
    );
  });
}

test("both Pages builders publish nested docs compatibility files", () => {
  assert.match(
    previewBuilder,
    /file\.startsWith\("docs\/"\)[\s\S]*file\.slice\("docs\/"\.length\)/,
  );
  assert.match(
    pagesWorkflow,
    /file\.startsWith\('docs\/'\)[\s\S]*file\.slice\('docs\/'\.length\)/,
  );
});

test("bridges do not modify accepted calculation authority", () => {
  assert.match(authority, /SEGUBECA_ACCEPTED_PRODUCT_CALCULATION/);
  assert.match(authority, /SEGUBECA-CALCULATION-AUTHORITY-001\.1/);
  assert.match(authority, /productCalculationReimplemented:\s*false/);
  assert.match(
    authority,
    /flatTotalContributionConversionAuthorized:\s*false/,
  );
});
