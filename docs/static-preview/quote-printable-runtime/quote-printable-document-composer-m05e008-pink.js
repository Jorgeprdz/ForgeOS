import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument as buildM05e008Document,
} from "./quote-printable-document-composer-m05e008.js";
import { VIDA_MUJER_LAYOUT_ID } from "./quote-printable-product-profile-m05e008.js";

const CONTRACT_VERSION = "M05E008_VIDA_MUJER_PINK_PRESENTATION_V1";

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function applyPinkAuthority(html) {
  const replacements = [
    ["--navy: #07172d;", "--navy: #702447;"],
    ["--navy-2: #0d2543;", "--navy-2: #8d355b;"],
    ["--teal: #18b8b1;", "--teal: #c65383;"],
    ["--rose: #b85c82;", "--rose: #d982a7;"],
    ["--ink: #142033;", "--ink: #2b1830;"],
    ["--muted: #67758a;", "--muted: #756272;"],
    ["--line: #dfe6ef;", "--line: #ebd8e2;"],
    ["--surface: #f4f7fb;", "--surface: #fff5f9;"],
    ["color: #9ee8e4;", "color: #ffd9e8;"],
    ["background: #e8f7f5;", "background: #fbeaf2;"],
    ["color: #0a5f5b;", "color: #702447;"],
    ["body { background: #dbe3ec;", "body { background: #f2e7ed;"],
    ["rgba(7,23,45,.05)", "rgba(112,36,71,.08)"],
    ["rgba(7,23,45,.2)", "rgba(112,36,71,.22)"],
  ];

  return replacements.reduce(
    (output, [source, target]) => output.replaceAll(source, target),
    String(html || ""),
  );
}

function buildQuotePrintableDocument(options = {}) {
  const document = buildM05e008Document(options);
  const readModel = options.readModel;
  if (
    readModel?.productProfile?.id !== "VIDA_MUJER" ||
    readModel?.commercialSummary?.layoutId !== VIDA_MUJER_LAYOUT_ID
  ) {
    return document;
  }

  const html = applyPinkAuthority(document.html);
  return deepFreeze({
    ...document,
    contractVersion: CONTRACT_VERSION,
    html,
    presentationPalette: Object.freeze({
      dominant: "PINK_BERRY",
      primary: "#702447",
      secondary: "#C65383",
      soft: "#FBEAF2",
      accent: "#D9A842",
    }),
  });
}

export {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  applyPinkAuthority,
  buildQuotePrintableDocument,
};
