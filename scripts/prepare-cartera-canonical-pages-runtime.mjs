import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const pagesRuntimeMode =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

if (!pagesRuntimeMode) {
  console.log("CARTERA_CANONICAL_PAGES_RUNTIME=SKIPPED_NON_PAGES_BUILD");
} else {
  const buildSha = String(
    process.env.FORGE_BUILD_SHA || process.env.GITHUB_SHA || "",
  ).trim();
  if (!/^[0-9a-f]{7,64}$/i.test(buildSha)) {
    throw new Error("CARTERA_CANONICAL_PAGES_RUNTIME_BUILD_SHA_INVALID");
  }

  const manifestPath = join(root, "docs/cartera-pages-runtime-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    manifest?.contractId !== "CARTERA_PAGES_RUNTIME_ASSET_CLOSURE_V1"
    || !Array.isArray(manifest.files)
    || manifest.files.length < 40
  ) {
    throw new Error("CARTERA_CANONICAL_PAGES_RUNTIME_MANIFEST_INVALID");
  }

  const shellRoot = join(root, "docs/static-preview/forge-alive-material3");
  const runtimeDirectoryName = `cartera-runtime-${buildSha}`;
  const runtimeRoot = join(shellRoot, runtimeDirectoryName);

  for (const entry of await readdir(shellRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("cartera-runtime-")) {
      await rm(join(shellRoot, entry.name), { recursive: true, force: true });
    }
  }
  await mkdir(runtimeRoot, { recursive: true });

  for (const file of manifest.files) {
    if (
      typeof file !== "string"
      || file.startsWith("/")
      || file.includes("..")
      || !file.endsWith(".js")
    ) {
      throw new Error(`CARTERA_CANONICAL_PAGES_RUNTIME_PATH_INVALID=${file}`);
    }
    const source = join(root, "docs", file);
    const target = join(runtimeRoot, file);
    await access(source);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  }

  const canonicalManifest = {
    contractId: "CARTERA_CANONICAL_PAGES_RUNTIME_V1",
    buildSha,
    runtimeDirectoryName,
    sourceContractId: manifest.contractId,
    entrypoints: manifest.entrypoints,
    files: manifest.files,
  };
  await writeFile(
    join(runtimeRoot, "manifest.json"),
    `${JSON.stringify(canonicalManifest, null, 2)}\n`,
  );

  for (const required of [
    "supabase-runtime.js",
    "memory-manager.js",
    "state-manager.js",
    "cartera.js",
    "advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js",
    "advisor-os/cartera/cartera-100d-productivity-proof-enhancement.js",
  ]) {
    await access(join(runtimeRoot, required));
  }

  const relativeRuntimeRoot = relative(root, runtimeRoot).replaceAll("\\", "/");
  console.log(`CARTERA_CANONICAL_PAGES_RUNTIME=PASS files=${manifest.files.length}`);
  console.log(`CARTERA_CANONICAL_PAGES_RUNTIME_DIR=${runtimeDirectoryName}`);
  console.log(`CARTERA_CANONICAL_PAGES_RUNTIME_PATH=${relativeRuntimeRoot}`);
}
