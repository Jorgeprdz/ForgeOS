"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

function imageMagickCommand() {
  const result = spawnSync("magick", ["-version"], {
    encoding: "utf8",
  });
  return result.error ? "convert" : "magick";
}

const imageCommand = imageMagickCommand();

function dimensions(file) {
  return execFileSync(
    "identify",
    ["-format", "%w %h", file],
    { encoding: "utf8" },
  ).trim().split(/\s+/).map(Number);
}

function imageMetric(argumentsList, normalized = false) {
  const result = spawnSync("compare", argumentsList, {
    encoding: "utf8",
  });
  const output = `${result.stderr || ""}${result.stdout || ""}`.trim();
  if (!output) {
    throw new Error(
      `ImageMagick emitted no metric: ${argumentsList.join(" ")}`,
    );
  }
  const match = normalized
    ? output.match(/\(([0-9.]+(?:e[+-]?\d+)?)\)/i)
    : output.match(/[0-9.]+(?:e[+-]?\d+)?/i);
  return Number(match?.[1] ?? match?.[0]);
}

function placeOnCommonCanvas(source, destination, width, height) {
  execFileSync(imageCommand, [
    "-size", `${width}x${height}`,
    "xc:#ff00ff",
    source,
    "-geometry", "+0+0",
    "-composite",
    destination,
  ]);
}

function comparePair({
  actual,
  golden,
  diff,
  scratchDirectory,
  differingPercentLimit = 0.5,
  ssimMinimum = 0.995,
}) {
  const [actualWidth, actualHeight] = dimensions(actual);
  const [goldenWidth, goldenHeight] = dimensions(golden);
  const widthDelta = actualWidth - goldenWidth;
  const heightDelta = actualHeight - goldenHeight;
  const sameDimensions =
    actualWidth === goldenWidth && actualHeight === goldenHeight;
  const commonWidth = Math.max(actualWidth, goldenWidth);
  const commonHeight = Math.max(actualHeight, goldenHeight);
  const commonArea = commonWidth * commonHeight;
  const sharedContentArea =
    Math.min(actualWidth, goldenWidth)
    * Math.min(actualHeight, goldenHeight);
  const additionalArea = commonArea - sharedContentArea;
  const safeName = path.basename(actual).replace(/\.png$/i, "");
  const commonGolden = path.join(
    scratchDirectory,
    `${safeName}-common-golden.png`,
  );
  const commonActual = path.join(
    scratchDirectory,
    `${safeName}-common-actual.png`,
  );

  fs.mkdirSync(scratchDirectory, { recursive: true });
  fs.mkdirSync(path.dirname(diff), { recursive: true });
  placeOnCommonCanvas(golden, commonGolden, commonWidth, commonHeight);
  placeOnCommonCanvas(actual, commonActual, commonWidth, commonHeight);

  try {
    const differingRatio = Number(execFileSync(
      imageCommand,
      [
        commonGolden,
        commonActual,
        "-compose", "difference",
        "-composite",
        "-threshold", "2%",
        "-format", "%[fx:mean]",
        "info:",
      ],
      { encoding: "utf8" },
    ));
    const differingPixels = Math.round(differingRatio * commonArea);
    const differingPercent = differingRatio * 100;
    const ssimDistortion = imageMetric([
      "-metric", "SSIM",
      commonGolden,
      commonActual,
      "null:",
    ], true);
    const ssim = 1 - ssimDistortion;

    spawnSync("compare", [
      "-metric", "AE",
      "-fuzz", "2%",
      "-highlight-color", "#ff00d4",
      "-lowlight-color", "#07111f",
      commonGolden,
      commonActual,
      diff,
    ], { encoding: "utf8" });

    const dimensionResult = sameDimensions ? "PASS" : "FAIL";
    const structuralResult = sameDimensions ? "PASS" : "FAIL";
    const perceptualResult =
      differingPercent <= differingPercentLimit
      && ssim >= ssimMinimum
        ? "PASS"
        : "FAIL";
    const visualResult =
      dimensionResult === "PASS"
      && structuralResult === "PASS"
      && perceptualResult === "PASS"
        ? "PASS"
        : "FAIL";

    return {
      dimensions: {
        actual: [actualWidth, actualHeight],
        golden: [goldenWidth, goldenHeight],
        match: sameDimensions,
        goldenWidth,
        goldenHeight,
        actualWidth,
        actualHeight,
        widthDelta,
        heightDelta,
        commonCanvas: [commonWidth, commonHeight],
        sharedContentArea,
        additionalArea,
      },
      differingPixels,
      differingPercent,
      ssim,
      dimensionResult,
      structuralResult,
      perceptualResult,
      visualResult,
      structuralDiff: sameDimensions ? 0 : 1,
      pass: visualResult === "PASS",
    };
  } finally {
    fs.rmSync(commonGolden, { force: true });
    fs.rmSync(commonActual, { force: true });
  }
}

module.exports = {
  comparePair,
  dimensions,
  imageMagickCommand,
  placeOnCommonCanvas,
};
