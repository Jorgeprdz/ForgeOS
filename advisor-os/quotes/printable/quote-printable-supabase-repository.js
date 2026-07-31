import {
  QUOTE_PRINTABLE_VERSION_TYPE,
  assertVersionRecord,
} from "./quote-printable-version-repository.js";

const SERVICE_VERSION = "QPD05_SUPABASE_REPOSITORY_V1";
const APPEND_RPC = "forge_qpd05_append_printable_quote_version";
const HISTORY_VIEW = "quote_printable_document_history";

class QuotePrintableSupabaseError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "QuotePrintableSupabaseError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = null) {
  throw new QuotePrintableSupabaseError(code, message, details);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) deepFreeze(item, seen);
  return Object.freeze(value);
}

function opaque(value, code, label, maximum = 240) {
  const normalized = String(value || "").trim();
  if (
    !normalized ||
    normalized.length > maximum ||
    !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)
  ) fail(code, `${label} is invalid`);
  return normalized;
}

function mapRemoteError(error) {
  if (error instanceof QuotePrintableSupabaseError) throw error;
  const message = String(error?.message || error || "");
  const mappings = [
    ["QPD05_AUTH_REQUIRED", "AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente."],
    ["QPD05_CARTERA001B_REQUIRED", "CARTERA_DEPENDENCY_MISSING", "La identidad durable de la cotización aún no está disponible."],
    ["QPD05_QUOTE_NOT_OWNED", "QUOTE_NOT_OWNED", "La cotización no pertenece a tu sesión."],
    ["QPD05_QUOTE_VERSION_NOT_FOUND", "QUOTE_VERSION_NOT_FOUND", "No encontramos esa versión de cotización."],
    ["QPD05_QUOTE_IDENTITY_MISMATCH", "QUOTE_IDENTITY_MISMATCH", "La identidad del documento no coincide con la versión de cotización."],
    ["QPD05_RECORD_CONFLICT", "RECORD_CONFLICT", "La versión imprimible ya existe con contenido distinto."],
    ["QPD05_RECORD_INVALID", "RECORD_INVALID", "El registro imprimible no cumple el contrato."],
  ];
  for (const [needle, code, safeMessage] of mappings) {
    if (message.includes(needle)) fail(code, safeMessage, { remoteMessage: message });
  }
  fail("REMOTE_ERROR", "No pudimos guardar o recuperar la versión imprimible.", {
    remoteMessage: message,
  });
}

async function authenticatedUser(client) {
  const response = await client.auth.getUser();
  if (response?.error || !response?.data?.user?.id) {
    fail("AUTH_REQUIRED", "Tu sesión expiró. Inicia sesión nuevamente.");
  }
  return response.data.user;
}

function rowRecord(row) {
  const record = row?.record_payload ?? row?.recordPayload ?? null;
  return record ? assertVersionRecord(record) : null;
}

function createQuotePrintableSupabaseRepository(client) {
  if (!client?.auth?.getUser || !client?.rpc || !client?.from) {
    fail("CLIENT_REQUIRED", "Supabase autenticado es obligatorio.");
  }

  async function append(record, { idempotencyKey } = {}) {
    await authenticatedUser(client);
    const validated = assertVersionRecord(record);
    const key = opaque(
      idempotencyKey || `qpd05:${validated.printableVersionReference}`,
      "IDEMPOTENCY_KEY_INVALID",
      "Idempotency key",
    );
    const { data, error } = await client.rpc(APPEND_RPC, {
      p_quote_reference: validated.quoteIdentity.quoteReference,
      p_quote_version_reference: validated.quoteIdentity.quoteVersionReference,
      p_record: validated,
      p_idempotency_key: key,
    });
    if (error) mapRemoteError(error);
    if (!data?.printableVersionReference || !data?.recordDigest) {
      fail("PERSISTENCE_RECEIPT_INVALID", "La persistencia no devolvió una identidad imprimible durable.");
    }
    return deepFreeze({
      status: data.idempotentReplay ? "IDEMPOTENT_REPLAY" : "APPENDED",
      receipt: data,
      record: validated,
    });
  }

  async function get(printableVersionReference) {
    await authenticatedUser(client);
    const reference = opaque(
      printableVersionReference,
      "PRINTABLE_VERSION_REFERENCE_INVALID",
      "Printable version reference",
    );
    const { data, error } = await client
      .from(HISTORY_VIEW)
      .select("record_payload")
      .eq("printable_version_reference", reference)
      .maybeSingle();
    if (error) mapRemoteError(error);
    return rowRecord(data);
  }

  async function listByQuote(quoteReference, { limit = 50 } = {}) {
    await authenticatedUser(client);
    const reference = opaque(quoteReference, "QUOTE_REFERENCE_INVALID", "Quote reference");
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const { data, error } = await client
      .from(HISTORY_VIEW)
      .select("record_payload,persisted_at")
      .eq("quote_reference", reference)
      .order("persisted_at", { ascending: false })
      .limit(safeLimit);
    if (error) mapRemoteError(error);
    return deepFreeze((Array.isArray(data) ? data : []).map(rowRecord).filter(Boolean));
  }

  async function latestByQuote(quoteReference) {
    const records = await listByQuote(quoteReference, { limit: 1 });
    return records[0] || null;
  }

  return deepFreeze({
    serviceVersion: SERVICE_VERSION,
    append,
    get,
    listByQuote,
    latestByQuote,
    diagnostics: () => deepFreeze({
      serviceVersion: SERVICE_VERSION,
      appendRpc: APPEND_RPC,
      historyView: HISTORY_VIEW,
      packetType: QUOTE_PRINTABLE_VERSION_TYPE,
      directInsertAllowed: false,
      directUpdateAllowed: false,
      directDeleteAllowed: false,
      rawPdfPersisted: false,
      htmlPersisted: false,
      automaticExternalEffects: false,
      requiresCartera001B: true,
    }),
  });
}

export {
  APPEND_RPC,
  HISTORY_VIEW,
  SERVICE_VERSION,
  QuotePrintableSupabaseError,
  createQuotePrintableSupabaseRepository,
};
