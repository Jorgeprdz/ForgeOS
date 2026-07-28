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

function rgbaPixels(file, width, height) {
  const pixels = execFileSync(
    imageCommand,
    [file, "-alpha", "on", "-depth", "8", "rgba:-"],
    { maxBuffer: Math.max(128 * 1024 * 1024, width * height * 4 + 1024) },
  );
  const expectedLength = width * height * 4;
  if (pixels.length !== expectedLength) {
    throw new Error(
      `Unexpected RGBA byte count for ${file}: ${pixels.length} != ${expectedLength}`,
    );
  }
  return pixels;
}

function structuralSimilarity(firstFile, secondFile, width, height) {
  const first = rgbaPixels(firstFile, width, height);
  const second = rgbaPixels(secondFile, width, height);
  if (first.equals(second)) return 1;

  const pixelCount = width * height;
  const channelScores = [];
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;

  for (let channel = 0; channel < 3; channel += 1) {
    let firstSum = 0;
    let secondSum = 0;
    for (let offset = channel; offset < first.length; offset += 4) {
      firstSum += first[offset];
      secondSum += second[offset];
    }
    const firstMean = firstSum / pixelCount;
    const secondMean = secondSum / pixelCount;
    let firstVariance = 0;
    let secondVariance = 0;
    let covariance = 0;
    for (let offset = channel; offset < first.length; offset += 4) {
      const firstDelta = first[offset] - firstMean;
      const secondDelta = second[offset] - secondMean;
      firstVariance += firstDelta * firstDelta;
      secondVariance += secondDelta * secondDelta;
      covariance += firstDelta * secondDelta;
    }
    firstVariance /= pixelCount;
    secondVariance /= pixelCount;
    covariance /= pixelCount;
    channelScores.push(
      ((2 * firstMean * secondMean + c1) * (2 * covariance + c2))
      / (
        (firstMean ** 2 + secondMean ** 2 + c1)
        * (firstVariance + secondVariance + c2)
      ),
    );
  }

  return channelScores.reduce((sum, score) => sum + score, 0)
    / channelScores.length;
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
    const ssim = structuralSimilarity(
      commonGolden,
      commonActual,
      commonWidth,
      commonHeight,
    );

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
  structuralSimilarity,
};
