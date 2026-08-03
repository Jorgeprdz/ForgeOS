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

  const [app, home, orchestrator, adapter] = await Promise.all([
    readFile(join(runtimeDir, "app.js"), "utf8"),
    readFile(join(runtimeDir, "home-module.js"), "utf8"),
    readFile(join(runtimeDir, "home-productive-orchestrator.js"), "utf8"),
    readFile(join(runtimeDir, "smart-widget-productive-home-adapter.js"), "utf8"),
  ]);

  for (const [name, source] of Object.entries({ app, home, orchestrator, adapter })) {
    if (!source.includes(`v=${buildSha}`)) {
      throw new Error(`FORGE_PAGES_CACHE_VERSIONING_VALIDATION_FAILED=${name}`);
    }
  }

  if (orchestrator.includes("?v=${buildSha}")) {
    throw new Error("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=home-productive-orchestrator.js");
  }

  console.log(`FORGE_PAGES_TRANSITIVE_CACHE_VERSIONING=PASS SHA=${buildSha}`);
  console.log("FORGE_PAGES_RUNTIME_PLACEHOLDER_LEAK=NONE");
}
