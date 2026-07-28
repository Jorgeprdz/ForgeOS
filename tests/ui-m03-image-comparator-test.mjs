import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import comparator from "../tools/ui-m03-image-comparator.cjs";

const { comparePair } = comparator;

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "ui-m03-comparator-"),
);

function image(name, width, height, color = "#06101f") {
  const file = path.join(directory, name);
  execFileSync("magick", [
    "-size",
    `${width}x${height}`,
    `xc:${color}`,
    file,
  ]);
  return file;
}

function dimensions(file) {
  return execFileSync(
    "identify",
    ["-format", "%w %h", file],
    { encoding: "utf8" },
  ).trim().split(/\s+/).map(Number);
}

function commonCanvas(source, width, height, name) {
  const destination = path.join(directory, name);
  execFileSync("magick", [
    "-size",
    `${width}x${height}`,
    "xc:#ff00ff",
    source,
    "-geometry",
    "+0+0",
    "-composite",
    destination,
  ]);
  return destination;
}

test.after(() => fs.rmSync(directory, { recursive: true }));

test("identical images retain identical dimensions", () => {
  const current = image("identical.png", 8, 6);
  assert.deepEqual(dimensions(current), [8, 6]);
});

test("one-pixel difference remains measurable", () => {
  const first = image("pixel-a.png", 8, 6);
  const second = image("pixel-b.png", 8, 6);
  execFileSync("magick", [
    second,
    "-fill",
    "white",
    "-draw",
    "point 0,0",
    second,
  ]);
  const metric = execFileSync(
    "magick",
    [
      first,
      second,
      "-compose",
      "difference",
      "-composite",
      "-threshold",
      "2%",
      "-format",
      "%[fx:mean]",
      "info:",
    ],
    { encoding: "utf8" },
  );
  assert.ok(Number(metric) > 0);
});

test("different heights use maximum-height common canvas", () => {
  const short = image("short.png", 8, 5);
  const canvas = commonCanvas(short, 8, 7, "short-common.png");
  assert.deepEqual(dimensions(canvas), [8, 7]);
});

test("different widths use maximum-width common canvas", () => {
  const narrow = image("narrow.png", 6, 7);
  const canvas = commonCanvas(narrow, 9, 7, "narrow-common.png");
  assert.deepEqual(dimensions(canvas), [9, 7]);
});

test("common canvas preserves top-left source pixels", () => {
  const source = image("source.png", 4, 3, "#52e6df");
  const canvas = commonCanvas(source, 7, 6, "source-common.png");
  const pixel = execFileSync(
    "magick",
    [canvas, "-format", "%[pixel:p{0,0}]", "info:"],
    { encoding: "utf8" },
  );
  assert.match(pixel, /(?:52e6df|82,230,223)/i);
});

test("common canvas neither rescales nor crops source", () => {
  const source = image("geometry.png", 5, 4);
  const canvas = commonCanvas(source, 8, 9, "geometry-common.png");
  assert.deepEqual(dimensions(source), [5, 4]);
  assert.deepEqual(dimensions(canvas), [8, 9]);
});

test("real comparator passes identical images", () => {
  const golden = image("real-identical-golden.png", 12, 9);
  const actual = image("real-identical-actual.png", 12, 9);
  const result = comparePair({
    actual,
    golden,
    diff: path.join(directory, "real-identical-diff.png"),
    scratchDirectory: directory,
  });
  assert.equal(result.dimensions.match, true);
  assert.equal(result.dimensions.widthDelta, 0);
  assert.equal(result.dimensions.heightDelta, 0);
  assert.equal(result.differingPixels, 0);
  assert.equal(result.differingPercent, 0);
  assert.equal(result.ssim, 1);
  assert.equal(result.pass, true);
});

test("dimension mismatch fails with real metrics on a common canvas", () => {
  const golden = image("real-mismatch-golden.png", 12, 9, "#52e6df");
  const actual = image("real-mismatch-actual.png", 10, 7, "#52e6df");
  const result = comparePair({
    actual,
    golden,
    diff: path.join(directory, "real-mismatch-diff.png"),
    scratchDirectory: directory,
  });
  assert.equal(result.dimensions.match, false);
  assert.equal(result.dimensions.widthDelta, -2);
  assert.equal(result.dimensions.heightDelta, -2);
  assert.deepEqual(result.dimensions.commonCanvas, [12, 9]);
  assert.ok(result.differingPercent > 0);
  assert.ok(result.differingPercent < 100);
  assert.ok(result.ssim > 0);
  assert.ok(result.ssim < 1);
  assert.equal(result.visualResult, "FAIL");
  assert.equal(result.pass, false);
});
