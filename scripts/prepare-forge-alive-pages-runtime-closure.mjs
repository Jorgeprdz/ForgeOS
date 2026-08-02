import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

export const FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_ID =
  "FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_V1";

export const ROOT_RUNTIME_ENTRYPOINTS = Object.freeze([
  "advisor-os/sales-pipeline/productive-prospect-bootstrap.js",
  "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
  "advisor-os/quotes/printable/quote-printable-pdf-generator-m05e005.js",
  "advisor-os/quotes/printable/quote-printable-document-composer-m05e005.js",
]);

const QPD_CANONICAL_ASSETS = Object.freeze([
  "forge-quote-printable-entrypoint-qpd06.js",
  "forge-quote-printable-entrypoint-qpd06.css",
]);

const QUOTE_PRINTABLE_PROXY_REWRITES = Object.freeze([
  Object.freeze({
    from: "../../../advisor-os/quotes/printable/",
    to: "../../advisor-os/quotes/printable/",
  }),
  Object.freeze({
    from: "../../../platform/",
    to: "../../platform/",
  }),
]);

function toPosix(value) {
  return value.split(sep).join("/");
}

function stripSpecifierSuffix(specifier) {
  return String(specifier || "").split(/[?#]/, 1)[0];
}

function extractLocalModuleSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:[^;"']*?\s+from\s+)?["']([^"']+)["']/gs,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]?.startsWith(".")) specifiers.add(match[1]);
    }
  }
  return [...specifiers];
}

async function resolveRepositoryModule(importer, specifier) {
  const cleanSpecifier = stripSpecifierSuffix(specifier);
  const unresolved = resolve(dirname(join(root, importer)), cleanSpecifier);
  const extension = extname(unresolved);
  const candidates = extension
    ? [unresolved]
    : [unresolved, `${unresolved}.js`, `${unresolved}.mjs`, join(unresolved, "index.js")];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const repositoryPath = toPosix(relative(root, candidate));
      if (repositoryPath === ".." || repositoryPath.startsWith("../")) {
        throw new Error(
          `FORGE_ALIVE_PAGES_IMPORT_OUTSIDE_REPOSITORY=${importer}:${specifier}`,
        );
      }
      if (!/[.]m?js$/i.test(repositoryPath)) {
        throw new Error(
          `FORGE_ALIVE_PAGES_NON_BROWSER_IMPORT=${importer}:${specifier}`,
        );
      }
      return repositoryPath;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  throw new Error(
    `FORGE_ALIVE_PAGES_IMPORT_MISSING=${importer}:${specifier}`,
  );
}

async function collectRootRuntimeClosure() {
  const pending = [...ROOT_RUNTIME_ENTRYPOINTS];
  const collected = new Set();

  while (pending.length > 0) {
    const current = pending.pop();
    if (collected.has(current)) continue;
    const source = await readFile(join(root, current), "utf8");
    collected.add(current);
    for (const specifier of extractLocalModuleSpecifiers(source)) {
      const dependency = await resolveRepositoryModule(current, specifier);
      if (!collected.has(dependency)) pending.push(dependency);
    }
  }

  return [...collected].sort();
}

function publicPathForRepositoryFile(repositoryPath) {
  return repositoryPath.startsWith("docs/")
    ? repositoryPath.slice("docs/".length)
    : repositoryPath;
}

async function copyExact(source, target) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  const [expected, actual] = await Promise.all([
    readFile(source),
    readFile(target),
  ]);
  if (!expected.equals(actual)) {
    throw new Error(`FORGE_ALIVE_PAGES_COPY_MISMATCH=${target}`);
  }
}

async function listJavaScriptFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const relativePath = prefix ? join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      output.push(...await listJavaScriptFiles(join(directory, entry.name), relativePath));
    } else if (entry.name.endsWith(".js")) {
      output.push(relativePath);
    }
  }
  return output.sort();
}

async function rewriteQuotePrintableProxies(siteDir) {
  const proxyRoot = join(siteDir, "static-preview/quote-printable-runtime");
  await access(proxyRoot);
  const files = await listJavaScriptFiles(proxyRoot);
  const rewritten = [];

  for (const file of files) {
    const target = join(proxyRoot, file);
    const source = await readFile(target, "utf8");
    let output = source;
    for (const replacement of QUOTE_PRINTABLE_PROXY_REWRITES) {
      output = output.replaceAll(replacement.from, replacement.to);
    }
    if (output !== source) {
      await writeFile(target, output);
      rewritten.push(toPosix(file));
    }
  }

  if (rewritten.length < 3) {
    throw new Error(
      `FORGE_ALIVE_PAGES_PRINTABLE_PROXY_REWRITES=${rewritten.length}`,
    );
  }

  for (const file of rewritten) {
    const output = await readFile(join(proxyRoot, file), "utf8");
    if (output.includes("../../../advisor-os/") || output.includes("../../../platform/")) {
      throw new Error(`FORGE_ALIVE_PAGES_PROXY_STILL_SOURCE_RELATIVE=${file}`);
    }
  }

  return rewritten;
}

async function publishCanonicalQpdAssets(siteDir) {
  const sourceRoot = join(root, "docs/static-preview/forge-alive");
  const canonicalRoot = join(siteDir, "static-preview/forge-alive");
  await access(canonicalRoot);

  for (const file of QPD_CANONICAL_ASSETS) {
    await copyExact(join(sourceRoot, file), join(canonicalRoot, file));
  }

  await access(join(siteDir, "static-preview/quote-printable-runtime/forge-quote-printable-route-controller.js"));
  return [...QPD_CANONICAL_ASSETS];
}

async function publishRootRuntimeClosure(siteDir) {
  const files = await collectRootRuntimeClosure();
  for (const repositoryPath of files) {
    await copyExact(
      join(root, repositoryPath),
      join(siteDir, publicPathForRepositoryFile(repositoryPath)),
    );
  }
  return files;
}

export async function prepareForgeAlivePagesRuntimeClosure({
  siteDir = join(root, "_site"),
} = {}) {
  const resolvedSiteDir = resolve(siteDir);
  await access(resolvedSiteDir);

  const [runtimeFiles, qpdAssets] = await Promise.all([
    publishRootRuntimeClosure(resolvedSiteDir),
    publishCanonicalQpdAssets(resolvedSiteDir),
  ]);
  const rewrittenProxies = await rewriteQuotePrintableProxies(resolvedSiteDir);

  const requiredPublishedFiles = [
    "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
    "platform/event-evidence/quote-lifecycle-supabase-service.js",
    "platform/event-evidence/prospect-quote-detail-projection.js",
    "static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.js",
    "static-preview/forge-alive/forge-quote-printable-entrypoint-qpd06.css",
  ];
  for (const file of requiredPublishedFiles) {
    await access(join(resolvedSiteDir, file));
  }

  const manifest = Object.freeze({
    contractId: FORGE_ALIVE_PAGES_RUNTIME_CLOSURE_ID,
    generatedAt: new Date().toISOString(),
    entrypoints: ROOT_RUNTIME_ENTRYPOINTS,
    runtimeFiles,
    qpdAssets,
    rewrittenProxies,
    requiredPublishedFiles,
  });
  await writeFile(
    join(resolvedSiteDir, "forge-alive-pages-runtime-closure.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`FORGE_ALIVE_PAGES_RUNTIME_CLOSURE=PASS files=${runtimeFiles.length}`);
  console.log(`FORGE_ALIVE_PAGES_QPD_ASSETS=${qpdAssets.length}`);
  console.log(`FORGE_ALIVE_PAGES_PROXY_REWRITES=${rewrittenProxies.length}`);
  return manifest;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  await prepareForgeAlivePagesRuntimeClosure({
    siteDir: process.argv[2] || join(root, "_site"),
  });
}
