import { execFileSync } from "node:child_process";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const root = process.cwd();
const pagesRuntime =
  process.env.FORGE_PAGES_RUNTIME_MODE === "pages"
  || process.env.GITHUB_PAGES === "true"
  || process.env.GITHUB_WORKFLOW === "Deploy ForgeOS to GitHub Pages";

if (!pagesRuntime) {
  console.log("MICK_GOAL_GAP_PAGES_RUNTIME=SKIPPED_NOT_PAGES");
} else {
  const providerSource = join(
    root,
    "advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
  );
  const providerTarget = join(
    root,
    "docs/advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
  );
  const coachSource = join(
    root,
    "advisor-os/forge-alive/forecast/mick-goal-gap-coach.mjs",
  );
  const coachTarget = join(
    root,
    "docs/advisor-os/forge-alive/forecast/mick-goal-gap-coach.js",
  );
  const incomeTarget = join(
    root,
    "docs/advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js",
  );
  const homeRuntime = join(
    root,
    "docs/static-preview/forge-alive-material3/home-mick-goal-coach.js",
  );

  await access(providerSource);
  await access(coachSource);
  await access(incomeTarget);
  await Promise.all([
    mkdir(dirname(providerTarget), { recursive: true }),
    mkdir(dirname(coachTarget), { recursive: true }),
  ]);
  await copyFile(providerSource, providerTarget);

  const coach = (await readFile(coachSource, "utf8"))
    .replace(/\.mjs(?=["'])/g, ".js");
  if (/(?:from\s+|import\(\s*)["'][^"']+\.mjs["']/.test(coach)) {
    throw new Error("MICK_GOAL_GAP_PAGES_COACH_MJS_SPECIFIER_LEAK");
  }
  await writeFile(coachTarget, coach);

  const sourceHome = await readFile(homeRuntime, "utf8");
  const replacements = Object.freeze([
    Object.freeze({
      source: "../../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
      deployed: "../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js",
    }),
    Object.freeze({
      source: "../../../advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.mjs",
      deployed: "../../advisor-os/forge-alive/smart-widgets/advisor-compensation-income-widget-source-080.js",
    }),
    Object.freeze({
      source: "../../../advisor-os/forge-alive/forecast/mick-goal-gap-coach.mjs",
      deployed: "../../advisor-os/forge-alive/forecast/mick-goal-gap-coach.js",
    }),
  ]);

  let deployedHome = sourceHome;
  for (const replacement of replacements) {
    if (!deployedHome.includes(replacement.source)) {
      throw new Error(`MICK_GOAL_GAP_SOURCE_SPECIFIER_MISSING=${replacement.source}`);
    }
    deployedHome = deployedHome.replaceAll(replacement.source, replacement.deployed);
  }
  if (
    deployedHome.includes("../../../advisor-os/")
    || /advisor-compensation-income-widget-source-080\.mjs|mick-goal-gap-coach\.mjs/.test(deployedHome)
  ) {
    throw new Error("MICK_GOAL_GAP_PAGES_SPECIFIER_INVALID");
  }
  await writeFile(homeRuntime, deployedHome);

  const generated = [providerTarget, coachTarget, homeRuntime].map((file) =>
    relative(root, file));
  execFileSync("git", ["add", "-f", "--", ...generated], {
    cwd: root,
    stdio: "inherit",
  });

  console.log("MICK_GOAL_GAP_PAGES_RUNTIME=PASS");
  console.log("MICK_GOAL_GAP_PAGES_SOURCE_PREFIX_LEAK=NONE");
  console.log("MICK_GOAL_GAP_PAGES_MJS_SPECIFIER_LEAK=NONE");
}
