const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_ENTRY_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 24 * 1024 * 1024;
const MAX_ENTRIES = 2048;
const MAX_SHEETS = 20;
const MAX_ROWS = 501;
const MAX_COLUMNS = 100;

function fail(message) {
  throw new Error(message);
}

function u16(view, offset) {
  return view.getUint16(offset, true);
}

function u32(view, offset) {
  return view.getUint32(offset, true);
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

function cleanPath(value) {
  const path = String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

function xml(text, label) {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.querySelector("parsererror")) fail(`El archivo Excel contiene XML inválido en ${label}.`);
  return document;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream !== "function") {
    fail("Este navegador no puede abrir Excel sin conexión. Puedes guardar el archivo como CSV.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function findEnd(view) {
  const floor = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= floor; offset -= 1) {
    if (u32(view, offset) === 0x06054b50) return offset;
  }
  fail("El archivo Excel está incompleto o dañado.");
}

async function unzip(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 22 || buffer.byteLength > MAX_FILE_BYTES) {
    fail(`El archivo Excel debe pesar menos de ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`);
  }
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const end = findEnd(view);
  const entryCount = u16(view, end + 10);
  const directorySize = u32(view, end + 12);
  const directoryOffset = u32(view, end + 16);
  if (!entryCount || entryCount > MAX_ENTRIES || directoryOffset + directorySize > bytes.length) {
    fail("El archivo Excel excede los límites de seguridad.");
  }
  const decoder = new TextDecoder();
  const entries = new Map();
  let offset = directoryOffset;
  let totalSize = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset < directoryOffset || offset + 46 > directoryOffset + directorySize) {
      fail("El directorio del archivo Excel está incompleto.");
    }
    if (u32(view, offset) !== 0x02014b50) fail("El directorio del archivo Excel es inválido.");
    const flags = u16(view, offset + 8);
    const compression = u16(view, offset + 10);
    const checksum = u32(view, offset + 16);
    const compressedSize = u32(view, offset + 20);
    const size = u32(view, offset + 24);
    const nameLength = u16(view, offset + 28);
    const extraLength = u16(view, offset + 30);
    const commentLength = u16(view, offset + 32);
    const localOffset = u32(view, offset + 42);
    const nextOffset = offset + 46 + nameLength + extraLength + commentLength;
    if (nextOffset > directoryOffset + directorySize) fail("El directorio del archivo Excel está incompleto.");
    if ((flags & 1) !== 0 || ![0, 8].includes(compression) || size > MAX_ENTRY_BYTES) {
      fail("El archivo Excel usa una característica no permitida.");
    }
    const name = cleanPath(decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength)));
    if (!name || entries.has(name)) fail("El archivo Excel contiene rutas duplicadas o inválidas.");
    totalSize += size;
    if (totalSize > MAX_TOTAL_BYTES) fail("El contenido expandido del Excel excede el límite permitido.");
    entries.set(name, { compression, checksum, compressedSize, size, localOffset });
    offset = nextOffset;
  }
  if (offset !== directoryOffset + directorySize) fail("El directorio del archivo Excel no coincide con su tamaño declarado.");

  const read = async name => {
    const entry = entries.get(cleanPath(name));
    if (!entry) return null;
    if (entry.localOffset + 30 > directoryOffset) fail("Una parte del archivo Excel apunta fuera de su contenido.");
    if (u32(view, entry.localOffset) !== 0x04034b50) fail("Una parte del archivo Excel es inválida.");
    const nameLength = u16(view, entry.localOffset + 26);
    const extraLength = u16(view, entry.localOffset + 28);
    const start = entry.localOffset + 30 + nameLength + extraLength;
    const localName = cleanPath(decoder.decode(bytes.slice(entry.localOffset + 30, entry.localOffset + 30 + nameLength)));
    if (localName !== cleanPath(name) || start + entry.compressedSize > directoryOffset) {
      fail("Una parte del archivo Excel no coincide con su directorio.");
    }
    const compressed = bytes.slice(start, start + entry.compressedSize);
    const content = entry.compression === 0 ? compressed : await inflateRaw(compressed);
    if (content.length !== entry.size) fail("Una parte del archivo Excel no coincide con su tamaño declarado.");
    if (crc32(content) !== entry.checksum) fail("Una parte del archivo Excel está dañada.");
    return content;
  };
  return { entries, read };
}

function relationTarget(workbookPath, target) {
  const base = workbookPath.split("/").slice(0, -1).join("/");
  return cleanPath(`${base}/${target}`);
}

function columnIndex(reference) {
  const letters = String(reference || "").match(/^[A-Z]+/i)?.[0]?.toUpperCase() || "";
  let index = 0;
  for (const letter of letters) index = index * 26 + letter.charCodeAt(0) - 64;
  return index - 1;
}

function textContent(node) {
  return [...node.querySelectorAll("t")].map(item => item.textContent || "").join("");
}

export async function readFirstSheetRows(buffer) {
  const archive = await unzip(buffer);
  const names = [...archive.entries.keys()];
  if (names.some(name => /(^|\/)vbaProject\.bin$/i.test(name) || /(^|\/)externalLinks\//i.test(name))) {
    fail("El archivo contiene macros o vínculos externos y no puede importarse.");
  }
  const contentTypesBytes = await archive.read("[Content_Types].xml");
  const contentTypes = contentTypesBytes ? new TextDecoder().decode(contentTypesBytes) : "";
  if (/macroEnabled|vbaProject/i.test(contentTypes)) fail("Los archivos con macros no están permitidos.");

  const workbookPath = "xl/workbook.xml";
  const workbookBytes = await archive.read(workbookPath);
  const relationshipsBytes = await archive.read("xl/_rels/workbook.xml.rels");
  if (!workbookBytes || !relationshipsBytes) fail("El archivo no contiene un libro Excel reconocible.");
  const workbook = xml(new TextDecoder().decode(workbookBytes), "el libro");
  const relationships = xml(new TextDecoder().decode(relationshipsBytes), "las relaciones");
  const workbookSheets = [...workbook.querySelectorAll("sheet")];
  if (!workbookSheets.length || workbookSheets.length > MAX_SHEETS) {
    fail(`El libro debe contener entre 1 y ${MAX_SHEETS} hojas.`);
  }
  const firstSheet = workbookSheets[0];
  const firstSheetName = firstSheet.getAttribute("name") || "Hoja 1";
  const relationId = firstSheet?.getAttribute("r:id") || firstSheet?.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
  if (!relationId) fail("El libro no contiene una primera hoja válida.");
  const relation = [...relationships.querySelectorAll("Relationship")]
    .find(item => item.getAttribute("Id") === relationId);
  if (!relation || /external/i.test(relation.getAttribute("TargetMode") || "")) {
    fail("La primera hoja depende de una fuente externa no permitida.");
  }
  const sheetPath = relationTarget(workbookPath, relation.getAttribute("Target"));
  const sheetBytes = await archive.read(sheetPath);
  if (!sheetBytes) fail("No pudimos leer la primera hoja del archivo.");

  const sharedBytes = await archive.read("xl/sharedStrings.xml");
  const shared = sharedBytes
    ? [...xml(new TextDecoder().decode(sharedBytes), "los textos compartidos").querySelectorAll("si")].map(textContent)
    : [];
  const sheet = xml(new TextDecoder().decode(sheetBytes), "la primera hoja");
  const rows = [];
  for (const rowNode of sheet.querySelectorAll("sheetData > row")) {
    if (rows.length >= MAX_ROWS) fail("El Excel contiene más de 500 filas de datos; ninguna fila fue importada.");
    const row = [];
    for (const cell of rowNode.querySelectorAll(":scope > c")) {
      const column = columnIndex(cell.getAttribute("r"));
      if (column < 0 || column >= MAX_COLUMNS) fail("El Excel contiene más columnas de las permitidas.");
      const type = cell.getAttribute("t");
      const raw = cell.querySelector("v")?.textContent || "";
      let value = "";
      if (cell.querySelector("f")) value = "";
      else if (type === "s") value = shared[Number(raw)] ?? "";
      else if (type === "inlineStr") value = textContent(cell);
      else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
      else if (!type || type === "n" || type === "d" || type === "str") value = raw;
      else fail(`La primera hoja contiene un tipo de celda no soportado (${type}).`);
      row[column] = value;
    }
    rows.push(row.map(value => value ?? ""));
  }
  if (rows.length < 2) fail("La primera hoja no contiene encabezados y datos.");
  Object.defineProperty(rows, "sourceSheet", { value: firstSheetName, enumerable: false });
  return rows;
}

export const SAFE_XLSX_LIMITS = Object.freeze({
  maxFileBytes: MAX_FILE_BYTES,
  maxEntryBytes: MAX_ENTRY_BYTES,
  maxSheets: MAX_SHEETS,
  maxRows: MAX_ROWS - 1,
  maxColumns: MAX_COLUMNS,
  macros: false,
  formulas: false,
  externalLinks: false,
});

globalThis.ForgeSafeWorkbookDecoder = Object.freeze({
  readFirstSheetRows,
  limits: SAFE_XLSX_LIMITS,
});
