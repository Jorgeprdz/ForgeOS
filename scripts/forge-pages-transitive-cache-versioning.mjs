import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const buildSha = String(
  process.env.FORGE_BUILD_SHA || process.env.GITHUB_SHA || "",
).trim();

if (!buildSha) {
  console.log("FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=SKIPPED_NO_GITHUB_SHA");
} else {
  const runtimeDir = join(root, "docs/static-preview/forge-alive-material3");
  const auraIndexPath = join(root, "docs/static-preview/forge-aura/index.html");
  const carteraRuntimeDirectory = `cartera-runtime-${buildSha}`;
  const dynamicModuleUrl = (name) =>
    `\`${name}\${layout.extension}?v=${buildSha}\``;
  const targets = [
    {
      file: "app.js",
      replacements: [
        [
          'from "./home-module.js"',
          `from "./home-module.js?v=${buildSha}"`,
        ],
      ],
    },
    {
      file: "home-module.js",
      replacements: [
        [
          'from "./home-productive-orchestrator.js"',
          `from "./home-productive-orchestrator.js?v=${buildSha}"`,
        ],
      ],
    },
    {
      file: "home-productive-orchestrator.js",
      replacements: [
        [
          'from "./activity-ledger-reporting-bridge.js"',
          `from "./activity-ledger-reporting-bridge.js?v=${buildSha}"`,
        ],
        [
          'from "./smart-widget-productive-home-adapter.js"',
          `from "./smart-widget-productive-home-adapter.js?v=${buildSha}"`,
        ],
        [
          '`productive-smart-widget-orchestrator${layout.extension}`',
          dynamicModuleUrl("productive-smart-widget-orchestrator"),
        ],
        [
          '`advisor-monthly-policy-goal-repository${layout.extension}`',
          dynamicModuleUrl("advisor-monthly-policy-goal-repository"),
        ],
        [
          '"./smart-widget-productive-home-adapter.css?v=home-productive-mount-001"',
          `"./smart-widget-productive-home-adapter.css?v=${buildSha}"`,
        ],
      ],
    },
    {
      file: "smart-widget-productive-home-adapter.js",
      replacements: [
        [
          'advisor-forecast-runtime-acceptance.js?v=af-runtime-acceptance-001',
          `advisor-forecast-runtime-acceptance.js?v=${buildSha}`,
        ],
      ],
    },
    {
      file: "forge-shell.js",
      replacements: [
        [
          './cartera-module.js?v=cartera-material3-productive-001',
          `./cartera-module.js?v=${buildSha}`,
        ],
      ],
    },
    {
      file: "cartera-module.js",
      replacements: [
        [
          './cartera-document-intake.js?v=03bca89dba800f7bd5052d6e67caa29241271be0',
          `./cartera-document-intake.js?v=${buildSha}`,
        ],
        [
          'const repositoryBase = new URL(sourceLayout ? "../../../" : "./cartera-runtime-03bca89dba800f7bd5052d6e67caa29241271be0/", import.meta.url);',
          `const repositoryBase = new URL(sourceLayout ? "../../../" : "./${carteraRuntimeDirectory}/", import.meta.url);`,
        ],
      ],
    },
  ];

  for (const target of targets) {
    const path = join(runtimeDir, target.file);
    let source = await readFile(path, "utf8");
    for (const [needle, replacement] of target.replacements) {
      if (source.includes(replacement)) continue;
      if (!source.includes(needle)) {
        throw new Error(`FORGE_PAGES_CACHE_VERSIONING_SOURCE_MISSING=${target.file}:${needle}`);
      }
      source = source.replace(needle, replacement);
    }
    await writeFile(path, source);
  }

  let auraIndex = await readFile(auraIndexPath, "utf8");
  const auraCarteraMappingPattern =
    /"\.\/cartera\/cartera-module\.js\?v[^"]+"\s*:\s*"(?<target>\.\/cartera\/cartera-module-[^"?]+\.js)\?v[^"\s]+"/;
  const auraCarteraMapping = auraIndex.match(auraCarteraMappingPattern);
  const auraCarteraEntrypoint = auraCarteraMapping?.groups?.target || "";
  const auraBootstrapPattern = /\.\/aura-bootstrap-v4-r1\.js\?v[^"\s]+/g;
  if (!auraCarteraEntrypoint) {
    throw new Error("FORGE_PAGES_AURA_CARTERA_VERSION_SOURCE_MISSING");
  }
  const escapedAuraCarteraEntrypoint = auraCarteraEntrypoint.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const auraCarteraPattern = new RegExp(
    `${escapedAuraCarteraEntrypoint}\\?v[^"\\s]+`,
    "g",
  );
  const auraCarteraMatches = auraIndex.match(auraCarteraPattern) || [];
  const auraBootstrapMatches = auraIndex.match(auraBootstrapPattern) || [];
  if (!auraCarteraMatches.length) {
    throw new Error("FORGE_PAGES_AURA_CARTERA_VERSION_SOURCE_MISSING");
  }
  if (!auraBootstrapMatches.length) {
    throw new Error("FORGE_PAGES_AURA_BOOTSTRAP_VERSION_SOURCE_MISSING");
  }
  auraIndex = auraIndex
    .replace(auraCarteraPattern, `${auraCarteraEntrypoint}?v=${buildSha}`)
    .replace(auraBootstrapPattern, `./aura-bootstrap-v4-r1.js?v=${buildSha}`);
  await writeFile(auraIndexPath, auraIndex);

  const [app, home, orchestrator, adapter, shell, cartera, versionedAuraIndex] = await Promise.all([
    readFile(join(runtimeDir, "app.js"), "utf8"),
    readFile(join(runtimeDir, "home-module.js"), "utf8"),
    readFile(join(runtimeDir, "home-productive-orchestrator.js"), "utf8"),
    readFile(join(runtimeDir, "smart-widget-productive-home-adapter.js"), "utf8"),
    readFile(join(runtimeDir, "forge-shell.js"), "utf8"),
    readFile(join(runtimeDir, "cartera-module.js"), "utf8"),
    readFile(auraIndexPath, "utf8"),
  ]);

  for (const [name, source] of Object.entries({ app, home, orchestrator, adapter, shell, cartera })) {
    if (!source.includes(`v=${buildSha}`)) {
      throw new Error(`FORGE_PAGES_CACHE_VERSIONING_VALIDATION_FAILED=${name}`);
    }
  }

  if (orchestrator.includes("?v=${buildSha}")) {
    throw new Error("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=home-productive-orchestrator.js");
  }
  if (shell.includes("cartera-module.js?v=cartera-material3-productive-001")) {
    throw new Error("FORGE_PAGES_STALE_CARTERA_MODULE_VERSION=forge-shell.js");
  }
  if (cartera.includes("cartera-document-intake.js?v=03bca89dba800f7bd5052d6e67caa29241271be0")) {
    throw new Error("FORGE_PAGES_STALE_CARTERA_INTAKE_VERSION=cartera-module.js");
  }
  if (!cartera.includes(`./${carteraRuntimeDirectory}/`)) {
    throw new Error("FORGE_PAGES_CARTERA_CANONICAL_RUNTIME_BINDING_MISSING");
  }
  if (cartera.includes('sourceLayout ? "../../../" : "./cartera-runtime-03bca89dba800f7bd5052d6e67caa29241271be0/"')) {
    throw new Error("FORGE_PAGES_CARTERA_ROOT_RUNTIME_BINDING_LEAK");
  }
  if (!versionedAuraIndex.includes(`${auraCarteraEntrypoint}?v=${buildSha}`)) {
    throw new Error("FORGE_PAGES_AURA_CARTERA_BUILD_VERSION_MISSING");
  }
  if (!versionedAuraIndex.includes(`./aura-bootstrap-v4-r1.js?v=${buildSha}`)) {
    throw new Error("FORGE_PAGES_AURA_BOOTSTRAP_BUILD_VERSION_MISSING");
  }
  if (
    versionedAuraIndex.includes(
      `${auraCarteraEntrypoint}?v=forge-beta2-013-policy-evidence-presentation`,
    )
  ) {
    throw new Error("FORGE_PAGES_AURA_STALE_CARTERA_CACHE_KEY");
  }

  console.log(`FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=PASS SHA=${buildSha}`);
  console.log("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE");
  console.log("FORGE_PAGES_CARTERA_TRANSITIVE_VERSIONING=PASS");
  console.log(`FORGE_PAGES_CARTERA_CANONICAL_RUNTIME=${carteraRuntimeDirectory}`);
  console.log("FORGE_PAGES_AURA_CARTERA_CACHE_CUTOVER=PASS");
}
