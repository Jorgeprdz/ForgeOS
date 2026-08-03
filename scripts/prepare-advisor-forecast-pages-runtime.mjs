import { execFileSync } from "node:child_process";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const pagesRuntime =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_PAGES === "true"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

if (!pagesRuntime) {
  console.log("ADVISOR_FORECAST_PAGES_RUNTIME=SKIPPED_NOT_PAGES");
} else {
  const sourceRoots = Object.freeze([
    "advisor-os/forge-alive/activity",
    "advisor-os/forge-alive/navigation",
  ]);
  const generated = [];

  async function listModules(directory, prefix = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const relativePath = prefix ? join(prefix, entry.name) : entry.name;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await listModules(absolutePath, relativePath));
      else if (entry.name.endsWith(".mjs")) files.push(relativePath);
    }
    return files.sort();
  }

  function pagesPath(sourcePath) {
    return join("docs", sourcePath.replace(/\.mjs$/, ".js"));
  }

  function transformModule(source) {
    return source.replace(/\.mjs(?=["'])/g, ".js");
  }

  for (const sourceRoot of sourceRoots) {
    const targetRoot = join(root, "docs", sourceRoot);
    await rm(targetRoot, { recursive: true, force: true });
    const modules = await listModules(join(root, sourceRoot));
    if (!modules.length) throw new Error(`ADVISOR_FORECAST_PAGES_SOURCE_EMPTY=${sourceRoot}`);

    for (const modulePath of modules) {
      const sourcePath = join(root, sourceRoot, modulePath);
      const targetPath = join(root, pagesPath(join(sourceRoot, modulePath)));
      const transformed = transformModule(await readFile(sourcePath, "utf8"));
      if (/(?:from\s+|import\(\s*)["'][^"']+\.mjs["']/.test(transformed)) {
        throw new Error(`ADVISOR_FORECAST_PAGES_IMPORT_NOT_TRANSFORMED=${relative(root, sourcePath)}`);
      }
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, transformed);
      generated.push(relative(root, targetPath));
    }
  }

  const acceptancePath = join(
    root,
    "docs/static-preview/forge-alive-material3/advisor-forecast-runtime-acceptance.js",
  );
  let acceptance = await readFile(acceptancePath, "utf8");
  const runtimeSpecifiers = Object.freeze([
    "advisor-forecast-smart-widget",
    "productive-smart-widget-orchestrator",
    "productive-smart-widget-contract",
    "advisor-forecast-navigation",
    "advisor-forecast-activity-handoff",
  ]);

  for (const specifier of runtimeSpecifiers) {
    const sourceSpecifier = `${specifier}.mjs`;
    const pagesSpecifier = `${specifier}.js`;
    if (!acceptance.includes(sourceSpecifier) && !acceptance.includes(pagesSpecifier)) {
      throw new Error(`ADVISOR_FORECAST_ACCEPTANCE_SPECIFIER_MISSING=${sourceSpecifier}`);
    }
    acceptance = acceptance.replaceAll(sourceSpecifier, pagesSpecifier);
  }
  if (/advisor-forecast-[^"']+\.mjs|productive-smart-widget-[^"']+\.mjs/.test(acceptance)) {
    throw new Error("ADVISOR_FORECAST_PAGES_MJS_SPECIFIER_LEAK");
  }
  await writeFile(acceptancePath, acceptance);
  generated.push(relative(root, acceptancePath));

  const required = Object.freeze([
    "docs/advisor-os/forge-alive/activity/advisor-forecast-activity-handoff.js",
    "docs/advisor-os/forge-alive/navigation/advisor-forecast-navigation.js",
    "docs/advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.js",
    "docs/advisor-os/forge-alive/smart-widgets/productive-smart-widget-orchestrator.js",
    "docs/advisor-os/forge-alive/smart-widgets/productive-smart-widget-contract.js",
  ]);
  for (const path of required) await access(join(root, path));

  execFileSync("git", ["add", "-f", "--", ...generated], {
    cwd: root,
    stdio: "inherit",
  });

  console.log(`ADVISOR_FORECAST_PAGES_RUNTIME=PASS files=${generated.length}`);
  console.log("ADVISOR_FORECAST_PAGES_MJS_SPECIFIER_LEAK=NONE");
}
