import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const canonicalParser = new URL(
  "../product-intelligence/evidence/gmm-quote-parser.js",
  import.meta.url,
);
const quoteRuntimeDir = new URL(
  "../docs/static-preview/quote-runtime/",
  import.meta.url,
);
const publicParser = new URL(
  "../docs/static-preview/quote-runtime/gmm-quote-parser-authority.js",
  import.meta.url,
);
const gmmAdapter = new URL(
  "../docs/static-preview/quote-runtime/forge-gmm-product-decision-adapter.js",
  import.meta.url,
);
const browserParser = new URL(
  "../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js",
  import.meta.url,
);
const auraQuotesAdapter = new URL(
  "../docs/static-preview/forge-aura/quotes/quotes-adapter.js",
  import.meta.url,
);

await mkdir(quoteRuntimeDir, { recursive: true });
await copyFile(canonicalParser, publicParser);

async function transform(url, transformFn) {
  const before = await readFile(url, "utf8");
  const after = transformFn(before);
  if (after === before) return false;
  await writeFile(url, after, "utf8");
  return true;
}

await transform(gmmAdapter, (source) => {
  const repoImport =
    'import { parseGMMQuote } from "../../../product-intelligence/evidence/gmm-quote-parser.js";';
  const publicImport =
    'import { parseGMMQuote } from "./gmm-quote-parser-authority.js";';
  if (source.includes(publicImport)) return source;
  if (!source.includes(repoImport)) {
    throw new Error("GMM adapter canonical parser import boundary is missing");
  }
  return source.replace(repoImport, publicImport);
});

await transform(browserParser, (source) => {
  const anchor =
    'import { parseSolucionlineSegubecaQuote } from "./forge-segubeca-solucionline-parser.js";';
  const gmmImport = [
    'import {',
    '  isGmmQuoteText,',
    '  parseGmmQuoteTextToAcceptedQuotePacket,',
    '} from "./forge-gmm-product-decision-adapter.js";',
  ].join("\n");

  let next = source;
  if (!next.includes(gmmImport)) {
    if (!next.includes(anchor)) {
      throw new Error("Quote PDF parser import anchor is missing");
    }
    next = next.replace(anchor, `${anchor}\n${gmmImport}`);
  }

  const routeAnchor = [
    'export function parsePdfTextToAcceptedQuotePacket(text, options = {}) {',
    '  const source = compactText107z15p2R11E(text);',
    '  if (isOrviSolucionlinePdfText(source)) {',
  ].join("\n");
  const routed = [
    'export function parsePdfTextToAcceptedQuotePacket(text, options = {}) {',
    '  const source = compactText107z15p2R11E(text);',
    '  if (isGmmQuoteText(source)) {',
    '    return parseGmmQuoteTextToAcceptedQuotePacket(text, options);',
    '  }',
    '  if (isOrviSolucionlinePdfText(source)) {',
  ].join("\n");

  if (!next.includes("parseGmmQuoteTextToAcceptedQuotePacket(text, options);")) {
    if (!next.includes(routeAnchor)) {
      throw new Error("Quote PDF product routing anchor is missing");
    }
    next = next.replace(routeAnchor, routed);
  }
  return next;
});

await transform(auraQuotesAdapter, (source) => {
  const acceptedImport = [
    'import {',
    '  calculateAcceptedQuote,',
    '  validatePacket,',
    '} from "../../quote-runtime/forge-accepted-quote-adapter.js";',
  ].join("\n");
  const acceptedImport006 = acceptedImport.replace(
    "forge-accepted-quote-adapter.js",
    "forge-accepted-quote-adapter-006.js",
  );
  const decisionImport =
    'import { buildProductSpecificDecisionReadModel } from "../../quote-runtime/forge-product-specific-decision-read-model.js";';
  const decisionImport006 = decisionImport.replace(
    "forge-product-specific-decision-read-model.js",
    "forge-product-specific-decision-read-model-006.js",
  );

  let next = source;
  if (!next.includes(acceptedImport006)) {
    if (!next.includes(acceptedImport)) {
      throw new Error("Aura Quotes accepted-quote adapter import boundary is missing");
    }
    next = next.replace(acceptedImport, acceptedImport006);
  }
  if (!next.includes(decisionImport006)) {
    if (!next.includes(decisionImport)) {
      throw new Error("Aura Quotes product decision read-model import boundary is missing");
    }
    next = next.replace(decisionImport, decisionImport006);
  }
  return next;
});

console.log("PHASE_006_GMM_PAGES_RUNTIME_PREPARED=PASS");
console.log("GMM_CANONICAL_PARSER_MIRRORED_FOR_PAGES=PASS");
console.log("GMM_PDF_ROUTE_WIRED=PASS");
console.log("GMM_RETIREMENT_FALLTHROUGH_BLOCKED=PASS");
console.log("GMM_AURA_DECISION_PROJECTION_WIRED=PASS");
