import { access, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareCarteraReviewPagesRuntime } from "./prepare-cartera-review-pages-runtime.mjs";

export const SEGUBECA_PAGES_RUNTIME_ID =
  "SEGUBECA_PAGES_RUNTIME_CLOSURE_V1";

export const SEGUBECA_SOURCE_RUNTIME_PREFIX =
  "../../../../docs/static-preview/quote-runtime/";
export const SEGUBECA_PUBLIC_RUNTIME_PREFIX =
  "../../../../static-preview/quote-runtime/";

export const SEGUBECA_REQUIRED_PUBLIC_FILES = Object.freeze([
  "static-preview/forge-alive/segubeca-productive-ui-binding.js",
  "static-preview/forge-alive/segubeca-productive-ui-entrypoint.js",
  "static-preview/forge-alive/segubeca-progressive-layout.js",
  "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js",
  "static-preview/quote-runtime/forge-pdf-browser-parser.js",
  "static-preview/quote-runtime/forge-accepted-quote-adapter.js",
  "static-preview/quote-runtime/forge-udi-mxn-runtime.js",
]);

function occurrenceCount(source, value) {
  return source.split(value).length - 1;
}

export function rewriteSegubecaAuthoritySource(source) {
  const sourceCount = occurrenceCount(source, SEGUBECA_SOURCE_RUNTIME_PREFIX);
  const existingPublicCount = occurrenceCount(
    source,
    SEGUBECA_PUBLIC_RUNTIME_PREFIX,
  );

  if (sourceCount === 0 && existingPublicCount < 3) {
    throw new Error(
      "SEGUBECA_PAGES_AUTHORITY_IMPORT_PREFIX_NOT_FOUND",
    );
  }

  const output = source.replaceAll(
    SEGUBECA_SOURCE_RUNTIME_PREFIX,
    SEGUBECA_PUBLIC_RUNTIME_PREFIX,
  );
  const publicCount = occurrenceCount(output, SEGUBECA_PUBLIC_RUNTIME_PREFIX);

  if (output.includes(SEGUBECA_SOURCE_RUNTIME_PREFIX)) {
    throw new Error("SEGUBECA_PAGES_SOURCE_RUNTIME_PREFIX_LEAK");
  }
  if (publicCount < 3) {
    throw new Error(
      `SEGUBECA_PAGES_PUBLIC_RUNTIME_IMPORTS=${publicCount}`,
    );
  }

  return Object.freeze({
    source: output,
    replacements: sourceCount,
    publicImports: publicCount,
    alreadyPrepared: sourceCount === 0,
  });
}

export async function prepareSegubecaPagesRuntime({ siteDir } = {}) {
  const root = resolve(siteDir || "_site");
  const authorityRelative =
    "advisor-os/quotes/products/segubeca/segubeca-calculation-authority.js";
  const authorityPath = join(root, authorityRelative);

  await access(authorityPath);
  const original = await readFile(authorityPath, "utf8");
  const rewritten = rewriteSegubecaAuthoritySource(original);
  if (rewritten.source !== original) {
    await writeFile(authorityPath, rewritten.source);
  }

  for (const file of SEGUBECA_REQUIRED_PUBLIC_FILES) {
    await access(join(root, file));
  }

  const persisted = await readFile(authorityPath, "utf8");
  if (persisted.includes(SEGUBECA_SOURCE_RUNTIME_PREFIX)) {
    throw new Error("SEGUBECA_PAGES_PERSISTED_SOURCE_PREFIX_LEAK");
  }
  const persistedPublicImports = occurrenceCount(
    persisted,
    SEGUBECA_PUBLIC_RUNTIME_PREFIX,
  );
  if (persistedPublicImports < 3) {
    throw new Error(
      `SEGUBECA_PAGES_PERSISTED_PUBLIC_IMPORTS=${persistedPublicImports}`,
    );
  }

  const manifest = Object.freeze({
    contractId: SEGUBECA_PAGES_RUNTIME_ID,
    authority: authorityRelative,
    replacements: rewritten.replacements,
    publicImports: persistedPublicImports,
    alreadyPrepared: rewritten.alreadyPrepared,
    requiredPublicFiles: SEGUBECA_REQUIRED_PUBLIC_FILES,
  });

  await writeFile(
    join(root, "segubeca-pages-runtime.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(
    `SEGUBECA_PUBLIC_AUTHORITY_IMPORT_REWRITE=PASS replacements=${rewritten.replacements}`,
  );
  console.log(
    `SEGUBECA_PUBLIC_RUNTIME_DEPENDENCIES=3/3 imports=${persistedPublicImports}`,
  );
  return manifest;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  const siteDir = process.argv[2] || "_site";
  await prepareSegubecaPagesRuntime({ siteDir });
  await prepareCarteraReviewPagesRuntime({ siteDir });
}
