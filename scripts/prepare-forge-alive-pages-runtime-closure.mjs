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
  "advisor-os/sales-pipeline/productive-prospect-service.js",
  "platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js",
  "platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js",
  "platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js",
  "advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js",
  "advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js",
  "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
  "advisor-os/quotes/printable/quote-printable-pdf-generator-m05e005.js",
  "advisor-os/quotes/printable/quote-printable-document-composer-m05e005.js",
  "platform/shared-commercial-model/crs-07-application-policy-lineage-contract.js",
  "advisor-os/cartera/crs-07-application-policy-lineage-service.js",
  "platform/shared-commercial-model/crs-08-unified-person-timeline-contract.js",
  "platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js",
  "advisor-os/timeline/crs-08-unified-person-timeline-service.js",
  "platform/shared-commercial-model/crs-09-person-workspace-contract.js",
  "advisor-os/person-workspace/crs-09-person-workspace-service.js",
  "platform/shared-commercial-model/crs-10-relationship-intelligence-contract.js",
  "advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js",
  "platform/commands/command-registry.js",
  "platform/commands/command-search-engine.js",
  "platform/commands/command-parser-engine.js",
  "platform/commands/entity-context-runtime.js",
  "platform/commands/entity-provider-adapter.js",
  "platform/commands/alfred-action-registry.js",
  "platform/commands/alfred-review-action-packet-browser.js",
  "platform/event-evidence/canonical-activity-event-contract.js",
  "platform/event-evidence/activity-ledger-contract.js",
  "platform/event-evidence/activity-ledger-local-store.js",
  "platform/event-evidence/activity-ledger-sync-service.js",
  "platform/event-evidence/activity-ledger-supabase-gateway.js",
  "platform/event-evidence/activity-ledger-browser-runtime.js",
  "platform/event-evidence/sales-nba-advisor-response-evidence.js",
]);

const QPD_CANONICAL_ASSETS = Object.freeze([
  "forge-quote-printable-entrypoint-qpd06.js",
  "forge-quote-printable-entrypoint-qpd06.css",
]);
const QPD_SOURCE_ROOT = "docs/static-preview/quote-printable-entry";
const QPD_PUBLIC_ROOT = "static-preview/quote-printable-entry";
const ALFRED_SOURCE_ROOT = "docs/static-preview/forge-alive-material3";
const ALFRED_PUBLIC_ROOT = "static-preview/forge-alive";
const ALFRED_RUNTIME_FILE = "alfred-command-runtime.js";
const ALFRED_STYLE_FILE = "alfred-command-runtime.css";
const ALFRED_PUBLIC_RUNTIME = `${ALFRED_PUBLIC_ROOT}/${ALFRED_RUNTIME_FILE}`;
const AURA_ALFRED_CONSUMERS = Object.freeze([
  "static-preview/forge-aura/app-v4.js",
  "static-preview/forge-aura/app-v4-r1.js",
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

async function rewriteAlfredCommandRuntime(siteDir) {
  const sourceRoot = join(root, ALFRED_SOURCE_ROOT);
  const publicRoot = join(siteDir, ALFRED_PUBLIC_ROOT);
  await Promise.all([
    copyExact(
      join(sourceRoot, ALFRED_RUNTIME_FILE),
      join(publicRoot, ALFRED_RUNTIME_FILE),
    ),
    copyExact(
      join(sourceRoot, ALFRED_STYLE_FILE),
      join(publicRoot, ALFRED_STYLE_FILE),
    ),
  ]);

  const target = join(siteDir, ALFRED_PUBLIC_RUNTIME);
  const source = await readFile(target, "utf8");
  const output = source.replaceAll("../../../platform/", "../../platform/");
  if (output === source) {
    throw new Error("FORGE_ALIVE_PAGES_ALFRED_PLATFORM_REWRITE_MISSING");
  }
  if (output.includes("../../../platform/")) {
    throw new Error("FORGE_ALIVE_PAGES_ALFRED_SOURCE_LAYOUT_LEAK");
  }
  await writeFile(target, output);
  const requiredImports = [
    "../../platform/commands/command-registry.js",
    "../../platform/commands/command-search-engine.js",
    "../../platform/commands/command-parser-engine.js",
    "../../platform/commands/entity-context-runtime.js",
    "../../platform/commands/entity-provider-adapter.js",
    "../../platform/commands/alfred-action-registry.js",
    "../../platform/commands/alfred-review-action-packet-browser.js",
  ];
  const published = await readFile(target, "utf8");
  for (const specifier of requiredImports) {
    if (!published.includes(specifier)) {
      throw new Error(`FORGE_ALIVE_PAGES_ALFRED_IMPORT_MISSING=${specifier}`);
    }
  }
  return Object.freeze({
    file: ALFRED_PUBLIC_RUNTIME,
    style: `${ALFRED_PUBLIC_ROOT}/${ALFRED_STYLE_FILE}`,
    rewrite: "../../../platform/=>../../platform/",
    requiredImports,
  });
}

async function rewriteAuraAlfredConsumers(siteDir) {
  const rewritten = [];
  for (const relativePath of AURA_ALFRED_CONSUMERS) {
    const target = join(siteDir, relativePath);
    let source;
    try {
      source = await readFile(target, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const output = source.replaceAll(
      "../forge-alive-material3/alfred-command-runtime",
      "../forge-alive/alfred-command-runtime",
    );
    if (output === source) {
      throw new Error(`FORGE_ALIVE_PAGES_AURA_ALFRED_CONSUMER_REWRITE_MISSING=${relativePath}`);
    }
    if (output.includes("../forge-alive-material3/alfred-command-runtime")) {
      throw new Error(`FORGE_ALIVE_PAGES_AURA_ALFRED_SOURCE_NAMESPACE_LEAK=${relativePath}`);
    }
    await writeFile(target, output);
    rewritten.push(relativePath);
  }
  return Object.freeze(rewritten);
}

async function publishCanonicalQpdAssets(siteDir) {
  const sourceRoot = join(root, QPD_SOURCE_ROOT);
  const publicRoot = join(siteDir, QPD_PUBLIC_ROOT);
  await access(sourceRoot);

  for (const file of QPD_CANONICAL_ASSETS) {
    await copyExact(join(sourceRoot, file), join(publicRoot, file));
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
  const alfredRewrite = await rewriteAlfredCommandRuntime(resolvedSiteDir);
  const auraAlfredConsumers = await rewriteAuraAlfredConsumers(resolvedSiteDir);

  const requiredPublishedFiles = [
    "advisor-os/sales-pipeline/productive-prospect-service.js",
    "platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js",
    "platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js",
    "platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js",
    "advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js",
    "advisor-os/sales-pipeline/pipeline-domain-intelligence-consumer.js",
    "platform/decision-projection/forge-cross-domain-decision-projection.js",
    "advisor-os/quotes/printable/quote-printable-read-model-m05e005.js",
    "platform/event-evidence/quote-lifecycle-supabase-service.js",
    "platform/event-evidence/prospect-quote-detail-projection.js",
    "platform/event-evidence/sales-nba-advisor-response-evidence.js",
    "platform/shared-commercial-model/crs-09-person-workspace-contract.js",
    "advisor-os/person-workspace/crs-09-person-workspace-service.js",
    "platform/shared-commercial-model/crs-10-relationship-intelligence-contract.js",
    "advisor-os/person-workspace/crs-10-existing-relationship-intelligence-service.js",
    "platform/commands/command-registry.js",
    "platform/commands/command-search-engine.js",
    "platform/commands/command-parser-engine.js",
    "platform/commands/entity-context-runtime.js",
    "platform/commands/entity-provider-adapter.js",
    "platform/commands/alfred-action-registry.js",
    "platform/commands/alfred-review-action-packet-browser.js",
    "static-preview/forge-alive/alfred-command-runtime.js",
    "static-preview/forge-alive/alfred-command-runtime.css",
    "static-preview/forge-alive/person-workspace-module.js",
    "static-preview/forge-alive/person-workspace-module.css",
    "static-preview/forge-alive/person-workspace-entry-bridge.js",
    "static-preview/forge-alive/person-workspace-entry-bridge.css",
    "static-preview/forge-alive/person-intelligence-module.js",
    "static-preview/forge-alive/person-intelligence-module.css",
    "static-preview/quote-printable-entry/forge-quote-printable-entrypoint-qpd06.js",
    "static-preview/quote-printable-entry/forge-quote-printable-entrypoint-qpd06.css",
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
    alfredRewrite,
    auraAlfredConsumers,
    requiredPublishedFiles,
  });
  await writeFile(
    join(resolvedSiteDir, "forge-alive-pages-runtime-closure.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(`FORGE_ALIVE_PAGES_RUNTIME_CLOSURE=PASS files=${runtimeFiles.length}`);
  console.log(`FORGE_ALIVE_PAGES_QPD_ASSETS=${qpdAssets.length}`);
  console.log(`FORGE_ALIVE_PAGES_PROXY_REWRITES=${rewrittenProxies.length}`);
  console.log("FORGE_ALIVE_PAGES_ALFRED_COMMAND_OS_REWRITE=PASS");
  console.log(`FORGE_ALIVE_PAGES_AURA_ALFRED_CONSUMERS=${auraAlfredConsumers.length}`);
  return manifest;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  await prepareForgeAlivePagesRuntimeClosure({
    siteDir: process.argv[2] || join(root, "_site"),
  });
}
