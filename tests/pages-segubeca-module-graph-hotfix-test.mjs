import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  SEGUBECA_PUBLIC_RUNTIME_PREFIX,
  SEGUBECA_SOURCE_RUNTIME_PREFIX,
  rewriteSegubecaAuthoritySource,
} from "../scripts/prepare-segubeca-pages-runtime.mjs";
import {
  validateCanonicalPagesStaticModuleGraph,
} from "../scripts/validate-pages-public-config.mjs";

const sourceAuthority = `
import { parse } from "${SEGUBECA_SOURCE_RUNTIME_PREFIX}forge-pdf-browser-parser.js";
import { adapt } from "${SEGUBECA_SOURCE_RUNTIME_PREFIX}forge-accepted-quote-adapter.js";
import { udi } from "${SEGUBECA_SOURCE_RUNTIME_PREFIX}forge-udi-mxn-runtime.js";
export { parse, adapt, udi };
`;

const rewritten = rewriteSegubecaAuthoritySource(sourceAuthority);
assert.equal(rewritten.replacements, 3);
assert.equal(rewritten.publicImports, 3);
assert.equal(rewritten.source.includes(SEGUBECA_SOURCE_RUNTIME_PREFIX), false);
assert.equal(
  rewritten.source.split(SEGUBECA_PUBLIC_RUNTIME_PREFIX).length - 1,
  3,
);

const idempotent = rewriteSegubecaAuthoritySource(rewritten.source);
assert.equal(idempotent.alreadyPrepared, true);
assert.equal(idempotent.replacements, 0);
assert.equal(idempotent.publicImports, 3);

const siteDir = await mkdtemp(
  path.join(os.tmpdir(), "forge-segubeca-pages-graph-"),
);

async function put(relativePath, source) {
  const target = path.join(siteDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, source);
}

try {
  await put(
    "static-preview/forge-alive/index.html",
    '<script type="module" src="./app.js?v=test-sha"></script>',
  );
  await put(
    "static-preview/forge-alive/app.js",
    'await import("./segubeca-productive-ui-binding.js?v=segubeca-test");',
  );

  assert.throws(
    () => validateCanonicalPagesStaticModuleGraph({ siteDir }),
    /PAGES_MODULE_IMPORT_MISSING=.*segubeca-productive-ui-binding[.]js/,
  );

  await put(
    "static-preview/forge-alive/segubeca-productive-ui-binding.js",
    'export * from "../../advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js?v=authority-test";',
  );
  await put(
    "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
    rewritten.source,
  );
  await put(
    "static-preview/quote-runtime/forge-pdf-browser-parser.js",
    "export const parse = true;",
  );
  await put(
    "static-preview/quote-runtime/forge-accepted-quote-adapter.js",
    "export const adapt = true;",
  );
  await put(
    "static-preview/quote-runtime/forge-udi-mxn-runtime.js",
    "export const udi = true;",
  );

  const graph = validateCanonicalPagesStaticModuleGraph({ siteDir });
  for (const required of [
    "static-preview/forge-alive/app.js",
    "static-preview/forge-alive/segubeca-productive-ui-binding.js",
    "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
    "static-preview/quote-runtime/forge-pdf-browser-parser.js",
    "static-preview/quote-runtime/forge-accepted-quote-adapter.js",
    "static-preview/quote-runtime/forge-udi-mxn-runtime.js",
  ]) {
    assert.ok(graph.files.includes(required), `SEGUBECA_GRAPH_FILE_MISSING=${required}`);
  }

  await put(
    "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
    sourceAuthority,
  );
  assert.throws(
    () => validateCanonicalPagesStaticModuleGraph({ siteDir }),
    /PAGES_MODULE_SOURCE_LAYOUT_LEAK=/,
  );

  await put(
    "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
    rewritten.source,
  );
  assert.equal(
    (await readFile(
      path.join(
        siteDir,
        "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
      ),
      "utf8",
    )).includes(SEGUBECA_SOURCE_RUNTIME_PREFIX),
    false,
  );

  console.log("SEGUBECA_PUBLIC_AUTHORITY_IMPORT_REWRITE=PASS");
  console.log("SEGUBECA_DYNAMIC_IMPORT_DISCOVERY=PASS");
  console.log("SEGUBECA_PUBLIC_ESM_GRAPH=PASS");
} finally {
  await rm(siteDir, { recursive: true, force: true });
}
