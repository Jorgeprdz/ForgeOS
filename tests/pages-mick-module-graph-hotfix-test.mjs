import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  validateCanonicalPagesStaticModuleGraph,
} from "../scripts/validate-pages-public-config.mjs";

async function write(root, relative, source) {
  const target = join(root, relative);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, source);
}

const broken = await mkdtemp(join(tmpdir(), "forge-pages-broken-"));
try {
  await write(
    broken,
    "static-preview/forge-alive/index.html",
    '<script type="module" src="./app.js?v=broken"></script>',
  );
  await write(
    broken,
    "static-preview/forge-alive/app.js",
    'import "./home-module.js";',
  );
  await write(
    broken,
    "static-preview/forge-alive/home-module.js",
    'import "./home-mick-goal-coach.js";',
  );
  await write(
    broken,
    "static-preview/forge-alive/home-mick-goal-coach.js",
    'import "../../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js";',
  );
  assert.throws(
    () => validateCanonicalPagesStaticModuleGraph({ siteDir: broken }),
    /PAGES_MODULE_IMPORT_OUTSIDE_SITE/,
  );
} finally {
  await rm(broken, { recursive: true, force: true });
}

const complete = await mkdtemp(join(tmpdir(), "forge-pages-complete-"));
try {
  await write(
    complete,
    "static-preview/forge-alive/index.html",
    '<script type="module" src="./app.js?v=complete"></script>',
  );
  await write(
    complete,
    "static-preview/forge-alive/app.js",
    'import "./home-module.js";',
  );
  await write(
    complete,
    "static-preview/forge-alive/home-module.js",
    'import "./home-mick-goal-coach.js";',
  );
  await write(
    complete,
    "static-preview/forge-alive/home-mick-goal-coach.js",
    [
      'import "../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js";',
      'import "../../advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js";',
      'import "../../advisor-os/forge-alive/forecast/mick-goal-gap-coach.js";',
    ].join("\n"),
  );
  await write(
    complete,
    "advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
    "export const provider = true;",
  );
  await write(
    complete,
    "advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js",
    "export const source = true;",
  );
  await write(
    complete,
    "advisor-os/forge-alive/forecast/mick-goal-gap-coach.js",
    "export const coach = true;",
  );
  const graph = validateCanonicalPagesStaticModuleGraph({ siteDir: complete });
  assert.equal(graph.files.length, 6);
} finally {
  await rm(complete, { recursive: true, force: true });
}

const build = spawnSync(
  process.execPath,
  ["scripts/build-advisor-presentation-pages-runtime.mjs"],
  {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      FORGE_PAGES_RUNTIME_MODE: "pages",
      FORGE_CARTERA_PAGES_RUNTIME_MODE: "pages",
    },
  },
);
assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
assert.match(build.stdout, /MICK_GOAL_GAP_PAGES_RUNTIME=PASS/);
assert.match(build.stdout, /MATERIAL3_OLD_SKELETON_FAIL_CLOSED=PASS/);

const generatedHomePath = new URL(
  "../docs/static-preview/forge-alive-material3/home-mick-goal-coach.js",
  import.meta.url,
);
const generatedIndexPath = new URL(
  "../docs/static-preview/forge-alive-material3/index.html",
  import.meta.url,
);
const generatedHome = await readFile(generatedHomePath, "utf8");
const generatedIndex = await readFile(generatedIndexPath, "utf8");

assert.doesNotMatch(generatedHome, /\.\.\/\.\.\/\.\.\/advisor-os\//);
assert.doesNotMatch(generatedHome, /advisor-compensation-income-widget-source-080\.mjs/);
assert.doesNotMatch(generatedHome, /mick-goal-gap-coach\.mjs/);
assert.match(generatedHome, /\.\.\/\.\.\/advisor-os\/compensation\/advisor-compensation-supabase-provider-100\.js/);
assert.match(generatedHome, /\.\.\/\.\.\/advisor-os\/forge-alive\/forecast\/mick-goal-gap-coach\.js/);
assert.match(generatedIndex, /FORGE_RUNTIME_HYDRATION_FAIL_CLOSED_V1/);
assert.match(generatedIndex, /La interfaz anterior permanecerá bloqueada/);

for (const file of [
  "docs/advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
  "docs/advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js",
  "docs/advisor-os/forge-alive/forecast/mick-goal-gap-coach.js",
]) {
  assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `missing generated ${file}`);
}

console.log("PAGES_MICK_MODULE_GRAPH_HOTFIX=PASS");
