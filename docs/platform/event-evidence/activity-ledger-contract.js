"use strict";

(function activityLedgerContractModule(root, factory) {
  const canonical =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;

  const api = factory(canonical);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeActivityLedgerContractFES02A = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function activityLedgerContractFactory(canonical) {
    if (!canonical) {
      throw new Error("FES01_CANONICAL_EVENT_CONTRACT_REQUIRED");
    }

    const CONTRACT_VERSION = "FES-02A.1";
    const LEDGER_VERSION = "forge.activity_ledger.v1";
    const MUTATION_VERSION = "forge.activity_ledger_mutation.v1";
    const RECEIPT_VERSION = "forge.activity_ledger_receipt.v1";
    const CONFLICT_VERSION = "forge.activity_ledger_conflict.v1";

    const EVIDENCE_REFERENCE_TYPES = Object.freeze([
      "DOCUMENT",
      "EXTERNAL_PROVIDER_EVENT",
      "CALL_LOG",
      "MESSAGE_HANDOFF",
      "USER_CONFIRMATION",
      "SYSTEM_OBSERVATION",
    ]);

    const OUTBOX_STATES = Object.freeze([
      "PENDING",
      "RETRY",
      "CONFLICT_REVIEW_REQUIRED",
    ]);

    const RECEIPT_STATUSES = Object.freeze([
      "ACKNOWLEDGED",
      "IDEMPOTENT_REPLAY",
    ]);

    const CONFLICT_STATUSES = Object.freeze(["OPEN", "RESOLVED"]);

    const LEDGER_RECORD_KEYS = Object.freeze([
      "ledger_version",
      "record_key",
      "tenant_id",
      "event_id",
      "event_digest",
      "canonical_event",
      "evidence_references",
      "appended_at",
    ]);

    const EVIDENCE_REFERENCE_KEYS = Object.freeze([
      "reference_id",
      "reference_type",
      "source_system",
      "captured_at",
      "privacy_class",
      "checksum",
      "metadata",
    ]);

    const EVIDENCE_METADATA_KEYS = Object.freeze([
      "provider_reference",
      "document_type",
      "observation_code",
      "confirmation_actor_type",
    ]);

    const MUTATION_KEYS = Object.freeze([
      "mutation_version",
      "mutation_id",
      "operation",
      "tenant_id",
      "device_id",
      "event_id",
      "event_digest",
      "ledger_record",
      "base_cursor",
      "created_at",
      "attempt_count",
      "state",
      "last_error_code",
    ]);

    const RECEIPT_KEYS = Object.freeze([
      "receipt_version",
      "status",
      "tenant_id",
      "event_id",
      "mutation_id",
      "server_sequence",
      "server_recorded_at",
      "cursor",
    ]);

    const CONFLICT_KEYS = Object.freeze([
      "conflict_version",
      "conflict_id",
      "tenant_id",
      "event_id",
      "mutation_id",
      "reason_code",
      "local_record",
      "remote_record",
      "detected_at",
      "status",
    ]);

    const PROHIBITED_KEY_TOKENS = Object.freeze([
      "rawnotes",
      "rawnote",
      "rawmessage",
      "messagetext",
      "transcript",
      "prompt",
      "systemprompt",
      "draft",
      "phone",
      "phonenumber",
      "whatsapp",
      "email",
      "medical",
      "health",
      "income",
      "estimatedincome",
      "authtoken",
      "accesstoken",
      "refreshtoken",
      "providerpayload",
      "providerresponse",
      "password",
      "secret",
      "execute",
      "send",
    ]);

    class ActivityLedgerContractError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ActivityLedgerContractError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ActivityLedgerContractError(code, message, details);
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function clone(value) {
      if (value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
      }
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function stableValue(value) {
      if (Array.isArray(value)) return value.map(stableValue);
      if (isPlainObject(value)) {
        const result = {};
        for (const key of Object.keys(value).sort()) {
          result[key] = stableValue(value[key]);
        }
        return result;
      }
      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(stableValue(value));
    }

    function stableDigest(value) {
      if (
        canonical._private &&
        typeof canonical._private.stableDigest === "function"
      ) {
        return canonical._private.stableDigest(value);
      }

      const text =
        typeof value === "string" ? value : stableStringify(value);
      let hash = 2166136261;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function assertPlainObject(value, code, label) {
      if (!isPlainObject(value)) {
        error(code, `${label} debe ser un objeto.`);
      }
    }

    function assertAllowedKeys(value, allowed, code, label) {
      assertPlainObject(value, code, label);
      const unsupported = Object.keys(value)
        .filter(key => !allowed.includes(key))
        .sort();
      if (unsupported.length > 0) {
        error(code, `${label} contiene campos no autorizados.`, {
          unsupported_keys: unsupported,
        });
      }
    }

    function assertRequiredKeys(value, required, code, label) {
      const missing = required
        .filter(key => value[key] === undefined)
        .sort();
      if (missing.length > 0) {
        error(code, `${label} no contiene todos los campos obligatorios.`, {
          missing_keys: missing,
        });
      }
    }

    function normalizeTokenName(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }

    function findProhibitedKeys(value, path = "$") {
      const findings = [];
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          findings.push(...findProhibitedKeys(item, `${path}[${index}]`));
        });
        return findings;
      }
      if (!isPlainObject(value)) return findings;

      for (const [key, nested] of Object.entries(value)) {
        const nestedPath = `${path}.${key}`;
        if (PROHIBITED_KEY_TOKENS.includes(normalizeTokenName(key))) {
          findings.push(nestedPath);
        }
        findings.push(...findProhibitedKeys(nested, nestedPath));
      }

      return [...new Set(findings)].sort();
    }

    function assertNoProhibitedKeys(value, code, label) {
      const findings = findProhibitedKeys(value);
      if (findings.length > 0) {
        error(code, `${label} contiene información no autorizada.`, {
          prohibited_paths: findings,
        });
      }
    }

    function requireOpaque(value, code, label, maximum = 240) {
      const normalized = String(value || "").trim();
      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9._:@/-]+$/.test(normalized)
      ) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function normalizeRequiredIso(value, code, label) {
      if (
        typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value))
      ) {
        error(code, `${label} no es válido.`);
      }
      return new Date(value).toISOString();
    }

    function normalizeOptionalIso(value, code, label) {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return normalizeRequiredIso(value, code, label);
    }

    function requireInteger(value, code, label, minimum = 0) {
      if (!Number.isSafeInteger(value) || value < minimum) {
        error(code, `${label} no es válido.`);
      }
      return value;
    }

    function requireEnum(value, allowed, code, label) {
      const normalized = String(value || "").trim();
      if (!allowed.includes(normalized)) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function recordKeyFor(tenantId, eventId) {
      return `${requireOpaque(
        tenantId,
        "TENANT_ID_INVALID",
        "El tenant",
      )}:${requireOpaque(eventId, "EVENT_ID_INVALID", "El evento")}`;
    }

    function normalizeEvidenceMetadata(value = {}) {
      assertAllowedKeys(
        value,
        EVIDENCE_METADATA_KEYS,
        "EVIDENCE_METADATA_FIELDS_INVALID",
        "Los metadatos de evidencia",
      );
      assertNoProhibitedKeys(
        value,
        "EVIDENCE_METADATA_SENSITIVE_DATA_DENIED",
        "Los metadatos de evidencia",
      );

      const normalized = {};
      for (const key of EVIDENCE_METADATA_KEYS) {
        if (value[key] !== undefined && value[key] !== null && value[key] !== "") {
          normalized[key] = requireOpaque(
            value[key],
            "EVIDENCE_METADATA_VALUE_INVALID",
            `El metadato ${key}`,
            240,
          );
        }
      }
      return normalized;
    }

    function normalizeEvidenceReference(input = {}) {
      assertAllowedKeys(
        input,
        EVIDENCE_REFERENCE_KEYS,
        "EVIDENCE_REFERENCE_FIELDS_INVALID",
        "La referencia de evidencia",
      );
      assertRequiredKeys(
        input,
        [
          "reference_id",
          "reference_type",
          "source_system",
          "captured_at",
          "privacy_class",
          "checksum",
          "metadata",
        ],
        "EVIDENCE_REFERENCE_FIELDS_REQUIRED",
        "La referencia de evidencia",
      );
      assertNoProhibitedKeys(
        input,
        "EVIDENCE_REFERENCE_SENSITIVE_DATA_DENIED",
        "La referencia de evidencia",
      );

      return {
        reference_id: requireOpaque(
          input.reference_id,
          "EVIDENCE_REFERENCE_ID_INVALID",
          "La referencia de evidencia",
        ),
        reference_type: requireEnum(
          input.reference_type,
          EVIDENCE_REFERENCE_TYPES,
          "EVIDENCE_REFERENCE_TYPE_INVALID",
          "El tipo de evidencia",
        ),
        source_system: requireOpaque(
          input.source_system,
          "EVIDENCE_SOURCE_SYSTEM_INVALID",
          "El sistema fuente",
          120,
        ),
        captured_at: normalizeRequiredIso(
          input.captured_at,
          "EVIDENCE_CAPTURED_AT_INVALID",
          "La fecha de captura de evidencia",
        ),
        privacy_class: requireEnum(
          input.privacy_class,
          canonical.PRIVACY_CLASSES,
          "EVIDENCE_PRIVACY_CLASS_INVALID",
          "La privacidad de evidencia",
        ),
        checksum: requireOpaque(
          input.checksum,
          "EVIDENCE_CHECKSUM_INVALID",
          "La suma de evidencia",
          240,
        ),
        metadata: normalizeEvidenceMetadata(input.metadata),
      };
    }

    function normalizeEvidenceReferences(values = []) {
      if (!Array.isArray(values)) {
        error(
          "EVIDENCE_REFERENCES_INVALID",
          "Las referencias de evidencia deben ser una lista.",
        );
      }

      const normalized = values.map(normalizeEvidenceReference);
      const ids = normalized.map(item => item.reference_id);
      if (new Set(ids).size !== ids.length) {
        error(
          "EVIDENCE_REFERENCE_DUPLICATED",
          "Una referencia de evidencia está duplicada.",
        );
      }

      return normalized.sort((left, right) =>
        left.reference_id.localeCompare(right.reference_id),
      );
    }

    function normalizeLedgerRecord(input, { requireCanonicalShape = false } = {}) {
      assertAllowedKeys(
        input,
        LEDGER_RECORD_KEYS,
        "LEDGER_RECORD_FIELDS_INVALID",
        "El registro del ledger",
      );
      assertRequiredKeys(
        input,
        LEDGER_RECORD_KEYS,
        "LEDGER_RECORD_FIELDS_REQUIRED",
        "El registro del ledger",
      );

      const event = canonical.assertCanonicalActivityEvent(
        clone(input.canonical_event),
      );
      const tenantId = requireOpaque(
        input.tenant_id,
        "TENANT_ID_INVALID",
        "El tenant",
      );
      const eventId = requireOpaque(
        input.event_id,
        "EVENT_ID_INVALID",
        "El evento",
      );

      if (event.tenant_id !== tenantId || event.event_id !== eventId) {
        error(
          "LEDGER_EVENT_IDENTITY_MISMATCH",
          "La identidad del evento no coincide con el registro del ledger.",
        );
      }

      const eventDigest = stableDigest(event);
      if (String(input.event_digest || "") !== eventDigest) {
        error(
          "LEDGER_EVENT_DIGEST_MISMATCH",
          "La huella del evento no coincide.",
        );
      }

      const appendedAt = normalizeRequiredIso(
        input.appended_at,
        "LEDGER_APPENDED_AT_INVALID",
        "La fecha de incorporación al ledger",
      );

      if (new Date(appendedAt).getTime() < new Date(event.recorded_at).getTime()) {
        error(
          "LEDGER_APPEND_BEFORE_RECORD_DENIED",
          "El ledger no puede incorporar un evento antes de su registro.",
        );
      }

      const normalized = {
        ledger_version: requireEnum(
          input.ledger_version,
          [LEDGER_VERSION],
          "LEDGER_VERSION_INVALID",
          "La versión del ledger",
        ),
        record_key: recordKeyFor(tenantId, eventId),
        tenant_id: tenantId,
        event_id: eventId,
        event_digest: eventDigest,
        canonical_event: event,
        evidence_references: normalizeEvidenceReferences(
          input.evidence_references,
        ),
        appended_at: appendedAt,
      };

      if (
        requireCanonicalShape &&
        stableStringify(input) !== stableStringify(normalized)
      ) {
        error(
          "LEDGER_RECORD_NOT_CANONICAL",
          "El registro del ledger no está en forma canónica.",
        );
      }

      return normalized;
    }

    function createLedgerRecord({
      canonical_event,
      evidence_references = [],
      appended_at,
    } = {}) {
      const event = canonical.assertCanonicalActivityEvent(
        clone(canonical_event),
      );
      return deepFreeze(
        normalizeLedgerRecord({
          ledger_version: LEDGER_VERSION,
          record_key: recordKeyFor(event.tenant_id, event.event_id),
          tenant_id: event.tenant_id,
          event_id: event.event_id,
          event_digest: stableDigest(event),
          canonical_event: event,
          evidence_references,
          appended_at: appended_at || event.recorded_at,
        }),
      );
    }

    function assertLedgerRecord(record) {
      return deepFreeze(
        normalizeLedgerRecord(clone(record), {
          requireCanonicalShape: true,
        }),
      );
    }

    function mutationIdFor({
      tenant_id,
      device_id,
      event_id,
      event_digest,
    }) {
      const tenantId = requireOpaque(
        tenant_id,
        "TENANT_ID_INVALID",
        "El tenant",
      );
      const deviceId = requireOpaque(
        device_id,
        "DEVICE_ID_INVALID",
        "El dispositivo",
      );
      const eventId = requireOpaque(
        event_id,
        "EVENT_ID_INVALID",
        "El evento",
      );
      const digest = requireOpaque(
        event_digest,
        "EVENT_DIGEST_INVALID",
        "La huella del evento",
      );
      return `fes02-mut-${stableDigest({
        tenant_id: tenantId,
        device_id: deviceId,
        event_id: eventId,
        event_digest: digest,
      })}`;
    }

    function normalizeAppendMutation(
      input,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        MUTATION_KEYS,
        "LEDGER_MUTATION_FIELDS_INVALID",
        "La mutación del ledger",
      );
      assertRequiredKeys(
        input,
        [
          "mutation_version",
          "mutation_id",
          "operation",
          "tenant_id",
          "device_id",
          "event_id",
          "event_digest",
          "ledger_record",
          "base_cursor",
          "created_at",
          "attempt_count",
          "state",
          "last_error_code",
        ],
        "LEDGER_MUTATION_FIELDS_REQUIRED",
        "La mutación del ledger",
      );

      const record = assertLedgerRecord(input.ledger_record);
      const tenantId = requireOpaque(
        input.tenant_id,
        "TENANT_ID_INVALID",
        "El tenant",
      );
      const eventId = requireOpaque(
        input.event_id,
        "EVENT_ID_INVALID",
        "El evento",
      );
      const eventDigest = requireOpaque(
        input.event_digest,
        "EVENT_DIGEST_INVALID",
        "La huella del evento",
      );
      const deviceId = requireOpaque(
        input.device_id,
        "DEVICE_ID_INVALID",
        "El dispositivo",
      );

      if (
        record.tenant_id !== tenantId ||
        record.event_id !== eventId ||
        record.event_digest !== eventDigest
      ) {
        error(
          "LEDGER_MUTATION_RECORD_MISMATCH",
          "La mutación no coincide con el registro del ledger.",
        );
      }

      const expectedMutationId = mutationIdFor({
        tenant_id: tenantId,
        device_id: deviceId,
        event_id: eventId,
        event_digest: eventDigest,
      });

      if (String(input.mutation_id || "") !== expectedMutationId) {
        error(
          "LEDGER_MUTATION_ID_MISMATCH",
          "La identidad de la mutación no coincide.",
        );
      }

      const normalized = {
        mutation_version: requireEnum(
          input.mutation_version,
          [MUTATION_VERSION],
          "LEDGER_MUTATION_VERSION_INVALID",
          "La versión de mutación",
        ),
        mutation_id: expectedMutationId,
        operation: requireEnum(
          input.operation,
          ["APPEND_EVENT"],
          "LEDGER_MUTATION_OPERATION_INVALID",
          "La operación",
        ),
        tenant_id: tenantId,
        device_id: deviceId,
        event_id: eventId,
        event_digest: eventDigest,
        ledger_record: record,
        base_cursor:
          input.base_cursor === null ||
          input.base_cursor === undefined ||
          input.base_cursor === ""
            ? null
            : requireOpaque(
                input.base_cursor,
                "BASE_CURSOR_INVALID",
                "El cursor base",
              ),
        created_at: normalizeRequiredIso(
          input.created_at,
          "LEDGER_MUTATION_CREATED_AT_INVALID",
          "La fecha de mutación",
        ),
        attempt_count: requireInteger(
          input.attempt_count,
          "LEDGER_MUTATION_ATTEMPTS_INVALID",
          "Los intentos",
          0,
        ),
        state: requireEnum(
          input.state,
          OUTBOX_STATES,
          "LEDGER_MUTATION_STATE_INVALID",
          "El estado de outbox",
        ),
        last_error_code:
          input.last_error_code === null ||
          input.last_error_code === undefined ||
          input.last_error_code === ""
            ? null
            : requireOpaque(
                input.last_error_code,
                "LEDGER_MUTATION_ERROR_CODE_INVALID",
                "El código de error",
                120,
              ),
      };

      if (
        requireCanonicalShape &&
        stableStringify(input) !== stableStringify(normalized)
      ) {
        error(
          "LEDGER_MUTATION_NOT_CANONICAL",
          "La mutación del ledger no está en forma canónica.",
        );
      }

      return normalized;
    }

    function createAppendMutation({
      ledger_record,
      device_id,
      base_cursor = null,
      created_at,
    } = {}) {
      const record = assertLedgerRecord(ledger_record);
      const deviceId = requireOpaque(
        device_id,
        "DEVICE_ID_INVALID",
        "El dispositivo",
      );
      return deepFreeze(
        normalizeAppendMutation({
          mutation_version: MUTATION_VERSION,
          mutation_id: mutationIdFor({
            tenant_id: record.tenant_id,
            device_id: deviceId,
            event_id: record.event_id,
            event_digest: record.event_digest,
          }),
          operation: "APPEND_EVENT",
          tenant_id: record.tenant_id,
          device_id: deviceId,
          event_id: record.event_id,
          event_digest: record.event_digest,
          ledger_record: record,
          base_cursor,
          created_at: created_at || record.appended_at,
          attempt_count: 0,
          state: "PENDING",
          last_error_code: null,
        }),
      );
    }

    function assertAppendMutation(mutation) {
      return deepFreeze(
        normalizeAppendMutation(clone(mutation), {
          requireCanonicalShape: true,
        }),
      );
    }

    function normalizeReceipt(input, { requireCanonicalShape = false } = {}) {
      assertAllowedKeys(
        input,
        RECEIPT_KEYS,
        "LEDGER_RECEIPT_FIELDS_INVALID",
        "El recibo remoto",
      );
      assertRequiredKeys(
        input,
        RECEIPT_KEYS,
        "LEDGER_RECEIPT_FIELDS_REQUIRED",
        "El recibo remoto",
      );

      const normalized = {
        receipt_version: requireEnum(
          input.receipt_version,
          [RECEIPT_VERSION],
          "LEDGER_RECEIPT_VERSION_INVALID",
          "La versión del recibo",
        ),
        status: requireEnum(
          input.status,
          RECEIPT_STATUSES,
          "LEDGER_RECEIPT_STATUS_INVALID",
          "El estado del recibo",
        ),
        tenant_id: requireOpaque(
          input.tenant_id,
          "TENANT_ID_INVALID",
          "El tenant",
        ),
        event_id: requireOpaque(
          input.event_id,
          "EVENT_ID_INVALID",
          "El evento",
        ),
        mutation_id: requireOpaque(
          input.mutation_id,
          "LEDGER_MUTATION_ID_INVALID",
          "La mutación",
        ),
        server_sequence: requireInteger(
          input.server_sequence,
          "SERVER_SEQUENCE_INVALID",
          "La secuencia remota",
          1,
        ),
        server_recorded_at: normalizeRequiredIso(
          input.server_recorded_at,
          "SERVER_RECORDED_AT_INVALID",
          "La fecha remota",
        ),
        cursor: requireOpaque(
          input.cursor,
          "REMOTE_CURSOR_INVALID",
          "El cursor remoto",
        ),
      };

      if (
        requireCanonicalShape &&
        stableStringify(input) !== stableStringify(normalized)
      ) {
        error(
          "LEDGER_RECEIPT_NOT_CANONICAL",
          "El recibo remoto no está en forma canónica.",
        );
      }

      return normalized;
    }

    function createReceipt(input = {}) {
      return deepFreeze(
        normalizeReceipt({
          receipt_version: RECEIPT_VERSION,
          ...input,
        }),
      );
    }

    function assertReceipt(receipt) {
      return deepFreeze(
        normalizeReceipt(clone(receipt), {
          requireCanonicalShape: true,
        }),
      );
    }

    function normalizeConflict(input, { requireCanonicalShape = false } = {}) {
      assertAllowedKeys(
        input,
        CONFLICT_KEYS,
        "LEDGER_CONFLICT_FIELDS_INVALID",
        "El conflicto",
      );
      assertRequiredKeys(
        input,
        CONFLICT_KEYS,
        "LEDGER_CONFLICT_FIELDS_REQUIRED",
        "El conflicto",
      );

      const localRecord = assertLedgerRecord(input.local_record);
      const tenantId = requireOpaque(
        input.tenant_id,
        "TENANT_ID_INVALID",
        "El tenant",
      );
      const eventId = requireOpaque(
        input.event_id,
        "EVENT_ID_INVALID",
        "El evento",
      );

      if (
        localRecord.tenant_id !== tenantId ||
        localRecord.event_id !== eventId
      ) {
        error(
          "LEDGER_CONFLICT_LOCAL_RECORD_MISMATCH",
          "El conflicto no coincide con el registro local.",
        );
      }

      let remoteRecord = null;
      if (input.remote_record !== null) {
        remoteRecord = assertLedgerRecord(input.remote_record);
        if (
          remoteRecord.tenant_id !== tenantId ||
          remoteRecord.event_id !== eventId
        ) {
          error(
            "LEDGER_CONFLICT_REMOTE_RECORD_MISMATCH",
            "El conflicto no coincide con el registro remoto.",
          );
        }
      }

      const mutationId = requireOpaque(
        input.mutation_id,
        "LEDGER_MUTATION_ID_INVALID",
        "La mutación",
      );
      const reasonCode = requireOpaque(
        input.reason_code,
        "LEDGER_CONFLICT_REASON_INVALID",
        "La razón de conflicto",
        120,
      );
      const detectedAt = normalizeRequiredIso(
        input.detected_at,
        "LEDGER_CONFLICT_DETECTED_AT_INVALID",
        "La fecha de conflicto",
      );

      const expectedConflictId = `fes02-conf-${stableDigest({
        tenant_id: tenantId,
        event_id: eventId,
        mutation_id: mutationId,
        reason_code: reasonCode,
        local_digest: localRecord.event_digest,
        remote_digest: remoteRecord ? remoteRecord.event_digest : null,
      })}`;

      if (String(input.conflict_id || "") !== expectedConflictId) {
        error(
          "LEDGER_CONFLICT_ID_MISMATCH",
          "La identidad del conflicto no coincide.",
        );
      }

      const normalized = {
        conflict_version: requireEnum(
          input.conflict_version,
          [CONFLICT_VERSION],
          "LEDGER_CONFLICT_VERSION_INVALID",
          "La versión del conflicto",
        ),
        conflict_id: expectedConflictId,
        tenant_id: tenantId,
        event_id: eventId,
        mutation_id: mutationId,
        reason_code: reasonCode,
        local_record: localRecord,
        remote_record: remoteRecord,
        detected_at: detectedAt,
        status: requireEnum(
          input.status,
          CONFLICT_STATUSES,
          "LEDGER_CONFLICT_STATUS_INVALID",
          "El estado del conflicto",
        ),
      };

      if (
        requireCanonicalShape &&
        stableStringify(input) !== stableStringify(normalized)
      ) {
        error(
          "LEDGER_CONFLICT_NOT_CANONICAL",
          "El conflicto no está en forma canónica.",
        );
      }

      return normalized;
    }

    function createConflict({
      tenant_id,
      event_id,
      mutation_id,
      reason_code,
      local_record,
      remote_record = null,
      detected_at,
    } = {}) {
      const localRecord = assertLedgerRecord(local_record);
      const tenantId = tenant_id || localRecord.tenant_id;
      const eventId = event_id || localRecord.event_id;
      const mutationId = requireOpaque(
        mutation_id,
        "LEDGER_MUTATION_ID_INVALID",
        "La mutación",
      );
      const reasonCode = requireOpaque(
        reason_code,
        "LEDGER_CONFLICT_REASON_INVALID",
        "La razón de conflicto",
        120,
      );
      const remoteRecord = remote_record
        ? assertLedgerRecord(remote_record)
        : null;
      const conflictId = `fes02-conf-${stableDigest({
        tenant_id: tenantId,
        event_id: eventId,
        mutation_id: mutationId,
        reason_code: reasonCode,
        local_digest: localRecord.event_digest,
        remote_digest: remoteRecord ? remoteRecord.event_digest : null,
      })}`;

      return deepFreeze(
        normalizeConflict({
          conflict_version: CONFLICT_VERSION,
          conflict_id: conflictId,
          tenant_id: tenantId,
          event_id: eventId,
          mutation_id: mutationId,
          reason_code: reasonCode,
          local_record: localRecord,
          remote_record: remoteRecord,
          detected_at: detected_at || new Date().toISOString(),
          status: "OPEN",
        }),
      );
    }

    function assertConflict(conflict) {
      return deepFreeze(
        normalizeConflict(clone(conflict), {
          requireCanonicalShape: true,
        }),
      );
    }

    function createRetryMutation(mutation, errorCode) {
      const normalized = assertAppendMutation(mutation);
      return deepFreeze(
        normalizeAppendMutation({
          ...clone(normalized),
          attempt_count: normalized.attempt_count + 1,
          state: "RETRY",
          last_error_code: requireOpaque(
            errorCode,
            "LEDGER_MUTATION_ERROR_CODE_INVALID",
            "El código de error",
            120,
          ),
        }),
      );
    }

    function createConflictMutation(mutation, errorCode) {
      const normalized = assertAppendMutation(mutation);
      return deepFreeze(
        normalizeAppendMutation({
          ...clone(normalized),
          state: "CONFLICT_REVIEW_REQUIRED",
          last_error_code: requireOpaque(
            errorCode,
            "LEDGER_MUTATION_ERROR_CODE_INVALID",
            "El código de error",
            120,
          ),
        }),
      );
    }

    return deepFreeze({
      CONTRACT_VERSION,
      LEDGER_VERSION,
      MUTATION_VERSION,
      RECEIPT_VERSION,
      CONFLICT_VERSION,
      EVIDENCE_REFERENCE_TYPES,
      OUTBOX_STATES,
      RECEIPT_STATUSES,
      CONFLICT_STATUSES,
      ActivityLedgerContractError,
      recordKeyFor,
      mutationIdFor,
      createLedgerRecord,
      assertLedgerRecord,
      createAppendMutation,
      assertAppendMutation,
      createReceipt,
      assertReceipt,
      createConflict,
      assertConflict,
      createRetryMutation,
      createConflictMutation,
      _private: deepFreeze({
        stableValue,
        stableStringify,
        stableDigest,
        deepFreeze,
        normalizeEvidenceReference,
        normalizeLedgerRecord,
        normalizeAppendMutation,
        normalizeReceipt,
        normalizeConflict,
        findProhibitedKeys,
      }),
    });
  },
);
