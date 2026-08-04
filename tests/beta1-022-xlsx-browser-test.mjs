import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { chromium } from "@playwright/test";

const baseUrl = process.env.FORGE_BETA1022_BASE_URL
  || "http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/";

function concat(parts) {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function archive(entries, { deflate = true } = {}) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let localOffset = 0;
  for (const [name, value] of Object.entries(entries)) {
    const nameBytes = encoder.encode(name);
    const source = encoder.encode(value);
    const payload = deflate ? new Uint8Array(deflateRawSync(source)) : source;
    const checksum = crc32(source);
    const local = new Uint8Array(30);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, deflate ? 8 : 0, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, payload.length, true);
    localView.setUint32(22, source.length, true);
    localView.setUint16(26, nameBytes.length, true);
    locals.push(local, nameBytes, payload);

    const central = new Uint8Array(46);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(10, deflate ? 8 : 0, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, payload.length, true);
    centralView.setUint32(24, source.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, localOffset, true);
    centrals.push(central, nameBytes);
    localOffset += local.length + nameBytes.length + payload.length;
  }
  const directory = concat(centrals);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, Object.keys(entries).length, true);
  endView.setUint16(10, Object.keys(entries).length, true);
  endView.setUint32(12, directory.length, true);
  endView.setUint32(16, localOffset, true);
  return concat([...locals, directory, end]);
}

const contentTypes = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>`;
const workbook = `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Polizas" sheetId="1" r:id="rId1"/></sheets></workbook>`;
const relationships = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
const sheet = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>titular</t></is></c><c r="B1" t="inlineStr"><is><t>poliza</t></is></c><c r="C1" t="inlineStr"><is><t>producto</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Ana Prueba</t></is></c><c r="B2" t="inlineStr"><is><t>P-1</t></is></c><c r="C2" t="inlineStr"><is><t>Vida</t></is></c><c r="D2"><f>1+1</f><v>2</v></c></row></sheetData></worksheet>`;
const entries = {
  "[Content_Types].xml": contentTypes,
  "xl/workbook.xml": workbook,
  "xl/_rels/workbook.xml.rels": relationships,
  "xl/worksheets/sheet1.xml": sheet,
};

const browser = process.env.FORGE_CDP_ENDPOINT
  ? await chromium.connectOverCDP(process.env.FORGE_CDP_ENDPOINT)
  : await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto(new URL("manifest.json?beta1022-xlsx=1", baseUrl).href, { waitUntil: "domcontentloaded" });
  const decoderUrl = new URL("safe-xlsx-decoder.js?beta1022-browser=1", baseUrl).href;
  const validBytes = [...archive(entries)];
  const decoded = await page.evaluate(async ({ decoderUrl, validBytes }) => {
    const { readFirstSheetRows } = await import(decoderUrl);
    const rows = await readFirstSheetRows(new Uint8Array(validBytes).buffer);
    return { rows, sourceSheet: rows.sourceSheet };
  }, { decoderUrl, validBytes });
  const { rows } = decoded;
  assert.deepEqual(rows[0].slice(0, 3), ["titular", "poliza", "producto"]);
  assert.deepEqual(rows[1].slice(0, 3), ["Ana Prueba", "P-1", "Vida"]);
  assert.equal(decoded.sourceSheet, "Polizas");
  assert.equal(rows[1][3], "", "FORMULA_CACHE_MUST_NOT_BECOME_IMPORT_TRUTH");

  const macroBytes = [...archive({ ...entries, "xl/vbaProject.bin": "not-executed" })];
  const macroError = await page.evaluate(async ({ decoderUrl, macroBytes }) => {
    const { readFirstSheetRows } = await import(decoderUrl);
    return readFirstSheetRows(new Uint8Array(macroBytes).buffer).then(() => "", error => error.message);
  }, { decoderUrl, macroBytes });
  assert.match(macroError, /macros|vínculos externos/i);

  const corruptError = await page.evaluate(async decoderUrl => {
    const { readFirstSheetRows } = await import(decoderUrl);
    return readFirstSheetRows(new Uint8Array([1, 2, 3, 4]).buffer).then(() => "", error => error.message);
  }, decoderUrl);
  assert.match(corruptError, /menos de 12 MB|incompleto|dañado/i);

  const checksumBytes = archive(entries, { deflate: false });
  checksumBytes[30 + new TextEncoder().encode("[Content_Types].xml").length] ^= 0xff;
  const checksumError = await page.evaluate(async ({ decoderUrl, checksumBytes }) => {
    const { readFirstSheetRows } = await import(decoderUrl);
    return readFirstSheetRows(new Uint8Array(checksumBytes).buffer).then(() => "", error => error.message);
  }, { decoderUrl, checksumBytes: [...checksumBytes] });
  assert.match(checksumError, /dañada/i);

  console.log("BETA1022_XLSX_DEFLATE_OFFLINE=PASS");
  console.log("BETA1022_XLSX_FORMULA_EXECUTION=ABSENT");
  console.log("BETA1022_XLSX_MACRO_EXECUTION=ABSENT");
  console.log("BETA1022_XLSX_CORRUPT_FILE=REJECTED");
  console.log("BETA1022_XLSX_CHECKSUM=VERIFIED");
} finally {
  await context.close();
  await browser.close();
}
