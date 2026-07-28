"use strict";

const fs = require("fs");
const path = require("path");
const { comparePair } = require("./ui-m03-image-comparator.cjs");

const [actualRoot, goldenRoot, outputRoot] = process.argv.slice(2);

if (!actualRoot || !goldenRoot || !outputRoot) {
  throw new Error(
    "Usage: node tools/ui-m03-compare-screenshot-set.cjs "
      + "<actual-root> <golden-root> <output-root>",
  );
}

const screenshots = [
  "mobile-390x844-viewport.png",
  "mobile-390x844-full.png",
  "mobile-390x844-alfred-open.png",
  "tablet-portrait-800x1280-viewport.png",
  "tablet-portrait-800x1280-full.png",
  "tablet-portrait-800x1280-alfred-open.png",
  "tablet-landscape-1100x800-viewport.png",
  "tablet-landscape-1100x800-full.png",
  "tablet-landscape-1100x800-alfred-open.png",
  "desktop-1440x900-viewport.png",
  "desktop-1440x900-full.png",
  "desktop-1440x900-alfred-open.png",
  "desktop-wide-1920x1080-viewport.png",
  "desktop-wide-1920x1080-full.png",
  "desktop-wide-1920x1080-alfred-open.png",
];

const diffsRoot = path.join(outputRoot, "diffs");
const copiedGoldenRoot = path.join(outputRoot, "golden");
const reportsRoot = path.join(outputRoot, "reports");
const scratchRoot = path.join(reportsRoot, "scratch");
for (const directory of [
  diffsRoot,
  copiedGoldenRoot,
  reportsRoot,
  scratchRoot,
]) {
  fs.mkdirSync(directory, { recursive: true });
}

const comparisons = screenshots.map((name) => {
  const actual = path.join(actualRoot, name);
  const golden = path.join(goldenRoot, name);
  const copiedGolden = path.join(copiedGoldenRoot, name);
  const diff = path.join(diffsRoot, name);
  if (!fs.existsSync(actual)) {
    throw new Error(`Missing actual screenshot: ${actual}`);
  }
  if (!fs.existsSync(golden)) {
    throw new Error(`Missing golden screenshot: ${golden}`);
  }
  fs.copyFileSync(golden, copiedGolden);
  return {
    name,
    actual,
    golden: copiedGolden,
    diff,
    missingComponents: 0,
    unexpectedComponents: 0,
    overflow: 0,
    ...comparePair({
      actual,
      golden,
      diff,
      scratchDirectory: scratchRoot,
    }),
  };
});

fs.rmSync(scratchRoot, { recursive: true, force: true });

const report = {
  generatedAt: new Date().toISOString(),
  actualRoot,
  goldenRoot,
  screenshotCount: comparisons.length,
  thresholds: {
    dimensionMatch: true,
    widthDelta: 0,
    heightDelta: 0,
    structuralDiff: 0,
    missingComponents: 0,
    unexpectedComponents: 0,
    overflow: 0,
    ssimMinimum: 0.995,
    differingPercentMaximum: 0.5,
  },
  comparisons,
  visualFailures: comparisons.filter((entry) => !entry.pass).length,
  pass: comparisons.every((entry) => entry.pass),
};

fs.writeFileSync(
  path.join(reportsRoot, "visual-comparison.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

const rows = comparisons.map((entry) => [
  entry.name,
  entry.dimensions.match ? "yes" : "no",
  entry.dimensions.widthDelta,
  entry.dimensions.heightDelta,
  `${entry.differingPercent.toFixed(4)}%`,
  entry.ssim.toFixed(6),
  entry.pass ? "PASS" : "FAIL",
]);
fs.writeFileSync(
  path.join(reportsRoot, "visual-comparison.md"),
  [
    "# UI-M03 authoritative visual comparison",
    "",
    `- Screenshot count: ${report.screenshotCount}`,
    `- Visual failures: ${report.visualFailures}`,
    `- Result: ${report.pass ? "PASS" : "FAIL"}`,
    "",
    "| Profile | Dimensions | Width delta | Height delta | Differing pixels | SSIM | Result |",
    "|---|---:|---:|---:|---:|---:|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
  ].join("\n"),
);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = report.pass ? 0 : 2;
