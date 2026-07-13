import assert from "node:assert/strict";
import { File } from "node:buffer";
import { readFile } from "node:fs/promises";

import {
  isOrviSolucionlinePdfText,
  groupPdfItemsIntoRows107z15p2R11E,
  parseOrviPdfTextToAcceptedQuotePacket,
  parsePdfFileToAcceptedQuotePacket,
  parsePdfTextToAcceptedQuotePacket,
} from "../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js";
import {
  validateOrviPdfParserEnvelope,
} from "../product-intelligence/quotes/orvi-pdf-parser-contract.js";
import {
  parseOrviSolucionlinePdfText,
} from "../product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js";
import {
  mapOrviPdfEnvelopeToProductIntelligence,
} from "../product-intelligence/quotes/orvi-pdf-to-product-intelligence.js";
import {
  validateOrviProductIntelligence,
} from "../product-intelligence/knowledge/orvi-product-intelligence.js";

const fixture = await readFile(
  new URL("../fixtures/orvi-solucionline-synthetic-quote.txt", import.meta.url),
  "utf8",
);
const page = await readFile(
  new URL("../docs/static-preview/forge-alive/nueva-cotizacion/index.html", import.meta.url),
  "utf8",
);
const browserParserSource = await readFile(
  new URL("../docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js", import.meta.url),
  "utf8",
);

const spanishStructure = `
VALORES GARANTIZADOS
Suma asegurada Valor de rescate Valor en efectivo Recuperación total
`;

assert.equal(isOrviSolucionlinePdfText(`ORVI 99 ${spanishStructure}`), true);
assert.equal(isOrviSolucionlinePdfText(`Ordinario de Vida ${spanishStructure}`), true);
assert.equal(isOrviSolucionlinePdfText(fixture), true);
assert.equal(isOrviSolucionlinePdfText("Vida Mujer VALORES GARANTIZADOS Valor de rescate Valor en efectivo"), false);
assert.equal(isOrviSolucionlinePdfText("Imagina Ser VALORES GARANTIZADOS Valor de rescate Valor en efectivo"), false);
assert.equal(isOrviSolucionlinePdfText("SeguBeca VALORES GARANTIZADOS Valor de rescate Valor en efectivo"), false);
assert.equal(isOrviSolucionlinePdfText("Documento genérico con suma asegurada"), false);
assert.equal(isOrviSolucionlinePdfText("Nota: ORVI aparece como referencia aislada."), false);
assert.notEqual(
  parsePdfTextToAcceptedQuotePacket("Documento genérico sin estructura ORVI", {
    fileName: "ORVI-99.pdf",
  }).productFamily,
  "orvi",
  "filename must never authorize the ORVI route",
);

const canonicalEnvelope = parseOrviSolucionlinePdfText(fixture);
assert.equal(validateOrviPdfParserEnvelope(canonicalEnvelope).valid, true);
const canonicalModel = mapOrviPdfEnvelopeToProductIntelligence(canonicalEnvelope);
assert.equal(validateOrviProductIntelligence(canonicalModel).valid, true);
assert.equal(canonicalModel.schema.id, "forge.product_intelligence.orvi");
assert.equal(canonicalModel.ownership.canonical_owner, "product-intelligence");

function positionedPdfItems(pageText) {
  return pageText.split("\n").flatMap((line, lineIndex) => {
    if (!line.trim()) return [];
    const columns = line.trimEnd().split(/\s{2,}/).filter(Boolean);
    return columns.map((str, columnIndex) => ({
      str,
      transform: [1, 0, 0, 1, 20 + columnIndex * 240, 800 - lineIndex * 12],
      width: str.length * 5,
    }));
  });
}

const browserLayoutText = fixture
  .split("\f")
  .map((pageText) =>
    groupPdfItemsIntoRows107z15p2R11E(
      positionedPdfItems(pageText),
    ).join("\n"),
  )
  .join("\f");
const layoutCoverageLine = browserLayoutText
  .split("\n")
  .find((line) => line.startsWith("ORVI synthetic basic protection"));
assert.match(layoutCoverageLine, /protection\s{2,}58 years\s{2,}73,250\s{2,}1,387\.40/);
const browserLayoutEnvelope = parseOrviSolucionlinePdfText(browserLayoutText);
assert.ok(browserLayoutEnvelope.coverages.length >= 1);
assert.equal(browserLayoutEnvelope.coverages[0].label, "ORVI synthetic basic protection");
assert.equal(browserLayoutEnvelope.coverages[0].coverage_term.value, 58);
assert.equal(browserLayoutEnvelope.coverages[0].sum_assured.value, 73250);
assert.equal(browserLayoutEnvelope.coverages[0].annual_premium.value, 1387.4);
assert.equal(validateOrviPdfParserEnvelope(browserLayoutEnvelope).valid, true);

const noCoverageText = fixture.replace(
  /COVERAGES[\s\S]*?BASE TOTAL ANNUAL PREMIUM\s+1,481\.00/,
  "COVERAGES\nCOVERAGE TERM SUM ASSURED ANNUAL PREMIUM\nBASE TOTAL ANNUAL PREMIUM 1,481.00",
);
assert.throws(
  () => parseOrviSolucionlinePdfText(noCoverageText),
  /coverages:AT_LEAST_ONE_REQUIRED/,
);

const packet = parseOrviPdfTextToAcceptedQuotePacket(fixture, {
  fileName: "documento.pdf",
});
assert.equal(packet.family, "ORVI");
assert.equal(packet.productFamily, "orvi");
assert.equal(packet.product_family, "orvi");
assert.equal(packet.fileName, "documento.pdf");
assert.equal(packet.product, canonicalModel.identity.detected_product_name);
assert.equal(packet.currency, canonicalModel.identity.currency);
assert.equal(packet.sumAssured, canonicalModel.protection_summary.basic_sum_assured.value);
assert.equal(packet.paymentYears, canonicalModel.premium_structure.payment_term_years);
assert.equal(packet.productIntelligence.schema.id, "forge.product_intelligence.orvi");
assert.equal(packet.productIntelligence, packet.product_intelligence);
assert.equal(packet.nativeResult.productIntelligence, packet.productIntelligence);
assert.equal(packet.nativeResult.product_intelligence, packet.productIntelligence);
assert.equal(packet.recommendation, null);
assert.equal(packet.humanDecisionRequired, true);
assert.equal(packet.human_decision_required, true);
assert.equal(packet.nativeResult.recommendation, null);
assert.equal(packet.nativeResult.humanDecisionRequired, true);
assert.equal(packet.source, "browser_pdf_parser");
assert.equal(packet.extractionVersion, "R15M2B_orvi_real_pdf_layout_aware");
assert.equal(Object.hasOwn(packet, "rawText"), false);
assert.equal(Object.hasOwn(packet.nativeResult, "rawText"), false);
assert.equal(
  globalThis.ForgePdfBrowserParser.parseOrviPdfTextToAcceptedQuotePacket,
  parseOrviPdfTextToAcceptedQuotePacket,
);
assert.equal(
  globalThis.ForgePdfBrowserParser.isOrviSolucionlinePdfText,
  isOrviSolucionlinePdfText,
);

const collisionPacket = parsePdfTextToAcceptedQuotePacket(
  `${fixture}\nSeguBeca Imagina Ser Vida Mujer`,
  { fileName: "documento.pdf" },
);
assert.equal(collisionPacket.family, "ORVI", "ORVI must win router precedence");
assert.equal(collisionPacket.productIntelligence.schema.id, "forge.product_intelligence.orvi");

const orviRouteIndex = browserParserSource.indexOf("if (isOrviSolucionlinePdfText(source))");
const segubecaRouteIndex = browserParserSource.indexOf("if (/segu\\s*beca|segubeca/i.test(source))");
const imaginaRouteIndex = browserParserSource.indexOf("if (/imagina\\s+ser|imagina\\s*ser/i.test(source))");
const vidaFallbackIndex = browserParserSource.indexOf("return parseVidaMujerPdfTextToAcceptedQuotePacket(text, options);");
assert.ok(orviRouteIndex >= 0 && orviRouteIndex < segubecaRouteIndex);
assert.ok(segubecaRouteIndex < imaginaRouteIndex);
assert.ok(imaginaRouteIndex < vidaFallbackIndex);

let extractedFile = null;
const selectedPdf = new File(["synthetic-pdf-byte-placeholder"], "documento.pdf", {
  type: "application/pdf",
});
const selectedPacket = await parsePdfFileToAcceptedQuotePacket(selectedPdf, {
  extractTextFromPdfFile: async (file) => {
    extractedFile = file;
    return fixture;
  },
});
assert.equal(selectedPdf.type, "application/pdf");
assert.equal(extractedFile, selectedPdf, "the selected PDF must enter the existing extraction path");
assert.equal(selectedPacket.fileName, "documento.pdf");
assert.equal(selectedPacket.family, "ORVI");
assert.equal(selectedPacket.productIntelligence.schema.id, "forge.product_intelligence.orvi");

assert.match(page, /accept="\.json,application\/json,\.pdf,application\/pdf"/);
assert.match(page, /forge-pdf-browser-parser\.js\?v=r15m2c_orvi_responsive_copy_20260713_1/);
assert.match(browserParserSource, /installPdfInputInterceptor107z15p2R11E\(\)/);
assert.match(browserParserSource, /convertPdfInputToJsonChange107z15p2R11E\(input, file\)/);
assert.match(browserParserSource, /new File\([\s\S]*application\/json/);
assert.equal(/filename.*isOrviSolucionlinePdfText/i.test(browserParserSource), false);

console.log("PASS R15M2A ORVI direct PDF browser routing", {
  contentDetection: true,
  genericFilenameStillDetected: true,
  routePrecedence: "ORVI_SEGUBECA_IMAGINA_SER_VIDA_MUJER",
  canonicalParserUsed: true,
  canonicalMapperUsed: true,
  positionedPdfJsItemsPreserveColumns: true,
  coverageContractStillRequired: true,
  productIntelligenceAttached: true,
  jsonRequiredForUserFlow: false,
  recommendation: packet.recommendation,
  humanDecisionRequired: packet.humanDecisionRequired,
});
