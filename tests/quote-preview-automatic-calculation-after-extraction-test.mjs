import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

const read = async (relative) =>
  readFile(new URL(relative, root), "utf8");

const bridge = await read(
  "docs/static-preview/quote-preview-live/" +
  "forge-accepted-quote-bridge.js",
);
const acceptance = await read(
  "docs/static-preview/forge-alive/" +
  "forge-quote-acceptance-entrypoint-r16j0a.js",
);
const intakeUi = await read(
  "docs/static-preview/quote-preview-live/" +
  "forge-quote-intake-ui-simplification-r16j1c1.js",
);
const lazy = await read(
  "docs/static-preview/forge-alive/" +
  "forge-alive-runtime-lazy-loader-r16j1c1.js",
);
const page = await read(
  "docs/static-preview/forge-alive/index.html",
);

function functionSource(source, name) {
  const token = `function ${name}`;
  let start = source.indexOf(token);

  assert.notEqual(
    start,
    -1,
    `missing function ${name}`,
  );

  const asyncStart = source.lastIndexOf(
    "async ",
    start,
  );

  if (
    asyncStart >= 0 &&
    source.slice(asyncStart, start).trim() === "async"
  ) {
    start = asyncStart;
  }

  const parameterStart = source.indexOf("(", start);
  assert.notEqual(
    parameterStart,
    -1,
    `missing parameter list for ${name}`,
  );

  let parameterDepth = 0;
  let parameterEnd = -1;
  let parameterQuote = null;
  let parameterEscape = false;

  for (
    let index = parameterStart;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (parameterQuote) {
      if (parameterEscape) {
        parameterEscape = false;
        continue;
      }

      if (char === "\\") {
        parameterEscape = true;
        continue;
      }

      if (char === parameterQuote) {
        parameterQuote = null;
      }

      continue;
    }

    if (
      char === '"' ||
      char === "'" ||
      char === "`"
    ) {
      parameterQuote = char;
      continue;
    }

    if (char === "(") parameterDepth += 1;
    if (char === ")") parameterDepth -= 1;

    if (parameterDepth === 0) {
      parameterEnd = index + 1;
      break;
    }
  }

  assert.notEqual(
    parameterEnd,
    -1,
    `unbalanced parameter list for ${name}`,
  );

  const bodyStart = source.indexOf(
    "{",
    parameterEnd,
  );
  assert.notEqual(bodyStart, -1);

  let depth = 0;
  let quote = null;
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1] || "";

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }

      if (char === "\\") {
        escape = true;
        continue;
      }

      if (char === quote) quote = null;
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`unbalanced function ${name}`);
}

const preview = functionSource(
  bridge,
  "calculateCurrentQuoteCandidatePreview",
);
const confirm = functionSource(
  bridge,
  "confirmCurrentQuoteCandidate",
);

for (const token of [
  "calculateCurrentQuoteCandidatePreview",
  "getCurrentQuotePreviewCalculation",
  "getCurrentQuotePreviewCalculationState",
  "forge:quote-preview-calculating",
  "forge:quote-preview-calculated",
  "forge:quote-preview-calculation-error",
  "automatic: true",
  "accepted: false",
  "humanConfirmationRequired: true",
]) {
  assert.ok(
    bridge.includes(token),
    `bridge missing ${token}`,
  );
}

assert.ok(
  preview.includes("calculateAcceptedQuote(candidate)"),
);
assert.ok(
  preview.includes("renderAcceptedQuote(calculation"),
);
assert.ok(
  !preview.includes(
    "acceptedQuoteReviewSnapshotBoundary.setSnapshot",
  ),
  "automatic preview must never create accepted snapshot",
);

assert.ok(
  confirm.includes(
    "acceptedQuoteReviewSnapshotBoundary.setSnapshot",
  ),
  "human confirmation must own accepted snapshot",
);
assert.ok(
  confirm.includes("cachedCalculation"),
  "confirmation must reuse automatic preview calculation",
);
assert.ok(
  confirm.includes("automatic: false"),
  "acceptance must remain non-automatic",
);

for (const token of [
  "CALCULATING_PREVIEW",
  "getCurrentQuotePreviewCalculation",
  "getCurrentQuotePreviewCalculationState",
  "automaticCalculation: true",
  "automaticAcceptance: false",
  "humanClickRequired: true",
]) {
  assert.ok(
    acceptance.includes(token),
    `acceptance missing ${token}`,
  );
}

assert.ok(
  intakeUi.includes('READY: "Revisar PDF"'),
);
assert.ok(
  intakeUi.includes("automaticCalculation: true"),
);
assert.ok(
  intakeUi.includes("automaticAcceptance: false"),
);
assert.ok(
  !intakeUi.includes(
    'CALCULATING_PREVIEW: "Revisar PDF"',
  ),
  "review action must remain hidden during calculation",
);

assert.ok(
  lazy.includes("automaticCalculation: true"),
);
assert.ok(
  lazy.includes("automaticAcceptance: false"),
);
assert.ok(
  lazy.includes(
    "forge-accepted-quote-bridge.js" +
      "?v=r16j1c1-auto-calculation-03b-20260715-1",
  ),
);
assert.ok(
  lazy.includes(
    "forge-quote-acceptance-entrypoint-r16j0a.js" +
      "?v=r16j1c1-auto-calculation-03b-20260715-1",
  ),
);
assert.match(
  page,
  /forge-alive-runtime-lazy-loader-r16j1c1\.js\?v=r16j1c1-parser-first-03c1-20260716-2/,
);
assert.match(
  [page, lazy].join("\n"),
  /forge-quote-intake-ui-simplification-r16j1c1\.js\?v=r16j1c1-auto-calculation-03b-20260715-1/,
);
assert.match(
  page,
  /forge-quote-intake-ui-simplification-r16j1c1\.css\?v=r16j1c1-intake-ui-03a2-20260715-1/,
);

for (const forbidden of [
  "approveCurrentSalesPresentationReview();",
  "authorizeCurrentSalesPresentationExport();",
  "exportCurrentSalesPresentationToPrintPdf();",
]) {
  assert.ok(
    !preview.includes(forbidden),
    `automatic preview must not call ${forbidden}`,
  );
}

console.log(
  "PASS R16J1C1 03B automatic preview calculation",
  {
    automaticAfterExtraction: true,
    rendersBeforeReview: true,
    reviewActionAfterCalculation: true,
    acceptedSnapshotOnlyOnHumanConfirmation: true,
    automaticAcceptance: false,
    automaticPresentation: false,
    automaticApproval: false,
    automaticExport: false,
  },
);
