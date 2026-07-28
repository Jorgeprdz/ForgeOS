"use strict";

(function forgePipelineCsvExportFES08(global) {
  const VERSION = "FES-08.PIPELINE-CSV.1";
  const COLUMNS = Object.freeze([
    ["id", "ID de prospecto"],
    ["fullName", "Nombre"],
    ["phone", "Teléfono"],
    ["whatsapp", "WhatsApp"],
    ["email", "Correo"],
    ["source", "Fuente"],
    ["referrerName", "Referido por"],
    ["referrerRelationship", "Relación con referente"],
    ["status", "Estado"],
    ["occupation", "Ocupación"],
    ["productsOfInterest", "Productos de interés"],
    ["nextActionType", "Próxima acción"],
    ["nextActionAt", "Fecha de próxima acción"],
    ["createdAt", "Fecha de creación"],
  ].map(([key, header]) => Object.freeze({ key, header })));

  function scalar(value) {
    if (value === null || value === undefined) return "";
    return Array.isArray(value) ? value.join("; ") : String(value);
  }

  function neutralize(value) {
    const text = scalar(value);
    return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  }

  function quote(value) {
    return `"${neutralize(value).replace(/"/g, '""')}"`;
  }

  function deterministicRows(prospects = []) {
    return [...prospects].sort((left, right) =>
      String(left?.id || "").localeCompare(String(right?.id || ""), "es-MX"));
  }

  function serialize(prospects = []) {
    if (!Array.isArray(prospects)) throw new TypeError("PIPELINE_PROSPECTS_REQUIRED");
    const rows = [
      COLUMNS.map(column => quote(column.header)).join(","),
      ...deterministicRows(prospects).map(prospect =>
        COLUMNS.map(column => quote(prospect?.[column.key])).join(",")),
    ];
    return `\uFEFF${rows.join("\r\n")}\r\n`;
  }

  function filename(now = new Date()) {
    if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError("PIPELINE_EXPORT_DATE_REQUIRED");
    return `forge-pipeline-${now.toISOString().slice(0, 10)}.csv`;
  }

  function download(prospects, { document = global.document, URL = global.URL, now = new Date() } = {}) {
    const blob = new Blob([serialize(prospects)], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename(now);
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    return Object.freeze({ filename: anchor.download, rowCount: prospects.length });
  }

  const api = Object.freeze({ VERSION, COLUMNS, serialize, filename, download, neutralize });
  global.ForgePipelineCsvExportFES08 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
