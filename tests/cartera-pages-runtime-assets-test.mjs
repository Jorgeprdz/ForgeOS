import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function toPosix(value) {
  return value.split(sep).join("/");
}

function extractLocalSpecifiers(source) {
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

function resolveGeneratedDependency(importer, specifier) {
  const unresolved = resolve(dirname(importer), specifier);
  const candidates = specifier.endsWith(".js")
    ? [unresolved]
    : [unresolved, `${unresolved}.js`, join(unresolved, "index.js")];
  return candidates.find(existsSync) ?? null;
}

execFileSync(
  process.execPath,
  ["scripts/build-advisor-presentation-pages-runtime.mjs"],
  {
    cwd: root,
    env: {
      ...process.env,
      FORGE_PAGES_RUNTIME_MODE: "pages",
      FORGE_CARTERA_PAGES_RUNTIME_MODE: "pages",
    },
    stdio: "inherit",
  },
);

const manifestPath = join(root, "docs/cartera-pages-runtime-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

test("Cartera Pages runtime publishes an explicit dependency closure", () => {
  assert.equal(
    manifest.contractId,
    "CARTERA_PAGES_RUNTIME_ASSET_CLOSURE_V1",
  );
  assert.ok(manifest.files.length > manifest.entrypoints.length);

  for (const required of [
    "supabase-runtime.js",
    "state-manager.js",
    "memory-manager.js",
    "event-system.js",
    "logger.js",
    "cartera.js",
    "advisor-os/cartera/canonical-directory-service.js",
    "advisor-os/cartera/canonical-portfolio-service.js",
  ]) {
    assert.ok(manifest.files.includes(required), `missing ${required}`);
  }
});

test("generated runtime is byte-identical, dependency-complete and staged", () => {
  const fileSet = new Set(manifest.files);

  for (const file of manifest.files) {
    const sourcePath = join(root, file);
    const generatedPath = join(root, "docs", file);
    assert.ok(existsSync(sourcePath), `source missing: ${file}`);
    assert.ok(existsSync(generatedPath), `generated missing: ${file}`);
    assert.deepEqual(
      readFileSync(generatedPath),
      readFileSync(sourcePath),
      `generated drift: ${file}`,
    );

    execFileSync("git", ["ls-files", "--error-unmatch", `docs/${file}`], {
      cwd: root,
      stdio: "ignore",
    });

    const source = readFileSync(generatedPath, "utf8");
    for (const specifier of extractLocalSpecifiers(source)) {
      const dependencyPath = resolveGeneratedDependency(generatedPath, specifier);
      assert.ok(
        dependencyPath,
        `unpublished dependency ${specifier} from ${file}`,
      );
      const dependency = toPosix(relative(join(root, "docs"), dependencyPath));
      assert.ok(
        fileSet.has(dependency),
        `dependency absent from manifest: ${file} -> ${dependency}`,
      );
    }
  }
});

test("Material 3 Cartera resolves published modules from the Pages project root", () => {
  const moduleSource = readFileSync(
    join(root, "docs/static-preview/forge-alive-material3/cartera-module.js"),
    "utf8",
  );
  assert.match(moduleSource, /moduleUrl\("supabase-runtime\.js"\)/);
  assert.match(moduleSource, /moduleUrl\("cartera\.js"\)/);
  assert.ok(
    moduleSource.includes(`new URL(sourceLayout ? "../../../" : "./cartera-runtime-${process.env.FORGE_BUILD_SHA}/", import.meta.url)`),
    "versioned Cartera Pages runtime binding missing",
  );
  assert.doesNotMatch(moduleSource, /sourceLayout \? "\.\.\/\.\.\/\.\.\/" : "\.\.\/\.\.\/"/);

  for (const entrypoint of manifest.entrypoints) {
    assert.ok(
      existsSync(join(root, "docs", entrypoint)),
      `entrypoint not publishable: ${entrypoint}`,
    );
  }
});
