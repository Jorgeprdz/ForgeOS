"use strict";

(function canonicalActivityTimelineContractModule(root, factory) {
  const canonical =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;
  const ledger =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;

  const api = factory(canonical, ledger);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeCanonicalActivityTimelineContractFES03B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function canonicalActivityTimelineContractFactory(canonical, ledger) {
    if (!canonical || !ledger) {
      throw new Error("FES03B_TIMELINE_DEPENDENCIES_REQUIRED");
    }

    const CONTRACT_VERSION = "FES-03B.1";
    const TIMELINE_VERSION = "forge.activity_timeline.v1";
    const ENTRY_VERSION = "forge.activity_timeline_entry.v1";
    const MAX_RECORDS = 10000;

    const ORDERING = Object.freeze({
      primary: "occurred_at:ASC",
      secondary: "recorded_at:ASC",
      tertiary: "appended_at:ASC",
      tie_breaker: "event_id:ASC",
    });

    const TIMELINE_KEYS = Object.freeze([
      "timeline_version",
      "timeline_id",
      "timeline_reference",
      "tenant_id",
      "correlation_id",
      "ordering",
      "entry_count",
      "built_through",
      "timeline_digest",
      "entries",
    ]);

    const ENTRY_KEYS = Object.freeze([
      "entry_version",
      "position",
      "timeline_id",
      "tenant_id",
      "correlation_id",
      "event_id",
      "event_type",
      "event_digest",
      "occurred_at",
      "recorded_at",
      "appended_at",
      "is_correction",
      "is_corrected",
      "correction_of",
      "correction_root_event_id",
      "correction_depth",
      "corrected_by_event_ids",
      "ledger_record",
    ]);

    class CanonicalActivityTimelineError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "CanonicalActivityTimelineError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new CanonicalActivityTimelineError(code, message, details);
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function clone(value) {
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
      if (Array.isArray(value)) {
        return value.map(stableValue);
      }

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
        typeof value === "string"
          ? value
          : stableStringify(value);
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

    function deriveTimelineId({
      tenant_id,
      correlation_id,
      timeline_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "TIMELINE_TENANT_ID_INVALID",
        "El tenant de la timeline",
      );
      const correlationId = requireOpaque(
        correlation_id,
        "TIMELINE_CORRELATION_ID_INVALID",
        "La correlación de la timeline",
      );
      const timelineReference = requireOpaque(
        timeline_reference,
        "TIMELINE_REFERENCE_INVALID",
        "La referencia de la timeline",
      );

      return `tl_${stableDigest({
        tenant_id: tenantId,
        correlation_id: correlationId,
        timeline_reference: timelineReference,
      })}`;
    }

    function compareLedgerRecords(left, right) {
      const leftEvent = left.canonical_event;
      const rightEvent = right.canonical_event;

      return (
        leftEvent.occurred_at.localeCompare(rightEvent.occurred_at) ||
        leftEvent.recorded_at.localeCompare(rightEvent.recorded_at) ||
        left.appended_at.localeCompare(right.appended_at) ||
        left.event_id.localeCompare(right.event_id)
      );
    }

    function normalizeRecords({
      tenant_id,
      correlation_id,
      ledger_records,
    }) {
      const tenantId = requireOpaque(
        tenant_id,
        "TIMELINE_TENANT_ID_INVALID",
        "El tenant de la timeline",
      );
      const correlationId = requireOpaque(
        correlation_id,
        "TIMELINE_CORRELATION_ID_INVALID",
        "La correlación de la timeline",
      );

      if (!Array.isArray(ledger_records)) {
        error(
          "TIMELINE_LEDGER_RECORDS_INVALID",
          "Los registros del ledger deben ser una lista.",
        );
      }

      if (ledger_records.length === 0) {
        error(
          "TIMELINE_LEDGER_RECORDS_REQUIRED",
          "La timeline requiere al menos un registro del ledger.",
        );
      }

      if (ledger_records.length > MAX_RECORDS) {
        error(
          "TIMELINE_LEDGER_RECORD_LIMIT_EXCEEDED",
          "La timeline excede el límite de registros permitido.",
          { maximum: MAX_RECORDS },
        );
      }

      const recordsByEventId = new Map();

      for (const rawRecord of ledger_records) {
        const record = ledger.assertLedgerRecord(clone(rawRecord));
        const event = record.canonical_event;

        if (record.tenant_id !== tenantId || event.tenant_id !== tenantId) {
          error(
            "TIMELINE_TENANT_MISMATCH",
            "La timeline no puede mezclar tenants.",
            {
              expected_tenant_id: tenantId,
              actual_tenant_id: record.tenant_id,
              event_id: record.event_id,
            },
          );
        }

        if (!event.correlation_id) {
          error(
            "TIMELINE_EVENT_CORRELATION_REQUIRED",
            "Cada evento de la timeline requiere una correlación.",
            { event_id: record.event_id },
          );
        }

        if (event.correlation_id !== correlationId) {
          error(
            "TIMELINE_CORRELATION_MISMATCH",
            "La timeline no puede mezclar correlaciones.",
            {
              expected_correlation_id: correlationId,
              actual_correlation_id: event.correlation_id,
              event_id: record.event_id,
            },
          );
        }

        const existing = recordsByEventId.get(record.event_id);
        if (existing) {
          if (stableStringify(existing) !== stableStringify(record)) {
            error(
              "TIMELINE_DUPLICATE_EVENT_CONFLICT",
              "El mismo evento tiene registros de ledger incompatibles.",
              { event_id: record.event_id },
            );
          }
          continue;
        }

        recordsByEventId.set(record.event_id, record);
      }

      const records = [...recordsByEventId.values()].sort(
        compareLedgerRecords,
      );

      const initializationRoots = records.filter(record => {
        const event = record.canonical_event;
        return (
          event.event_type === "TIMELINE_INITIALIZED" &&
          event.correction_of === null
        );
      });

      if (initializationRoots.length !== 1) {
        error(
          "TIMELINE_INITIALIZATION_ROOT_INVALID",
          "La timeline requiere exactamente un evento raíz TIMELINE_INITIALIZED.",
          { roots_found: initializationRoots.length },
        );
      }

      const timelineReference = requireOpaque(
        initializationRoots[0].canonical_event.payload.timeline_reference,
        "TIMELINE_REFERENCE_INVALID",
        "La referencia de la timeline",
      );

      for (const record of records) {
        const event = record.canonical_event;

        if (
          event.event_type === "TIMELINE_INITIALIZED" &&
          event.payload.timeline_reference !== timelineReference
        ) {
          error(
            "TIMELINE_REFERENCE_MISMATCH",
            "Una corrección de inicialización no puede cambiar la referencia de la timeline.",
            {
              expected_timeline_reference: timelineReference,
              actual_timeline_reference:
                event.payload.timeline_reference,
              event_id: event.event_id,
            },
          );
        }
      }

      return {
        tenantId,
        correlationId,
        timelineReference,
        records,
        recordsByEventId,
      };
    }

    function buildLineage(records, recordsByEventId) {
      const lineageByEventId = new Map();

      function resolve(eventId, trail = []) {
        if (lineageByEventId.has(eventId)) {
          return lineageByEventId.get(eventId);
        }

        if (trail.includes(eventId)) {
          error(
            "TIMELINE_CORRECTION_CYCLE",
            "La timeline contiene un ciclo de correcciones.",
            { event_ids: [...trail, eventId] },
          );
        }

        const record = recordsByEventId.get(eventId);
        const correctionOf = record.canonical_event.correction_of;

        if (!correctionOf) {
          const root = {
            root_event_id: eventId,
            depth: 0,
          };
          lineageByEventId.set(eventId, root);
          return root;
        }

        const target = recordsByEventId.get(correctionOf);

        if (!target) {
          error(
            "TIMELINE_CORRECTION_TARGET_MISSING",
            "Una corrección apunta a un evento ausente de la timeline.",
            {
              event_id: eventId,
              correction_of: correctionOf,
            },
          );
        }

        const parent = resolve(correctionOf, [...trail, eventId]);
        const event = record.canonical_event;
        const targetEvent = target.canonical_event;

        if (
          Date.parse(event.recorded_at) <
          Date.parse(targetEvent.recorded_at)
        ) {
          error(
            "TIMELINE_CORRECTION_RECORDED_BEFORE_TARGET",
            "Una corrección no puede registrarse antes que su objetivo.",
            {
              event_id: eventId,
              correction_of: correctionOf,
            },
          );
        }

        if (
          Date.parse(record.appended_at) <
          Date.parse(target.appended_at)
        ) {
          error(
            "TIMELINE_CORRECTION_APPENDED_BEFORE_TARGET",
            "Una corrección no puede incorporarse antes que su objetivo.",
            {
              event_id: eventId,
              correction_of: correctionOf,
            },
          );
        }
        const lineage = {
          root_event_id: parent.root_event_id,
          depth: parent.depth + 1,
        };
        lineageByEventId.set(eventId, lineage);
        return lineage;
      }

      for (const record of records) {
        resolve(record.event_id);
      }

      return lineageByEventId;
    }

    function buildCanonicalTimeline({
      tenant_id,
      correlation_id,
      ledger_records,
    }) {
      const {
        tenantId,
        correlationId,
        timelineReference,
        records,
        recordsByEventId,
      } = normalizeRecords({
        tenant_id,
        correlation_id,
        ledger_records,
      });

      const timelineId = deriveTimelineId({
        tenant_id: tenantId,
        correlation_id: correlationId,
        timeline_reference: timelineReference,
      });
      const lineageByEventId = buildLineage(
        records,
        recordsByEventId,
      );
      const positionByEventId = new Map(
        records.map((record, index) => [
          record.event_id,
          index + 1,
        ]),
      );
      const correctedBy = new Map();

      for (const record of records) {
        const correctionOf =
          record.canonical_event.correction_of;

        if (!correctionOf) continue;

        const existing = correctedBy.get(correctionOf) || [];
        existing.push(record.event_id);
        correctedBy.set(correctionOf, existing);
      }

      for (const values of correctedBy.values()) {
        values.sort(
          (left, right) =>
            positionByEventId.get(left) -
            positionByEventId.get(right),
        );
      }

      const entries = records.map((record, index) => {
        const event = record.canonical_event;
        const lineage = lineageByEventId.get(record.event_id);
        const correctedByEventIds = correctedBy.get(record.event_id) || [];

        return {
          entry_version: ENTRY_VERSION,
          position: index + 1,
          timeline_id: timelineId,
          tenant_id: tenantId,
          correlation_id: correlationId,
          event_id: record.event_id,
          event_type: event.event_type,
          event_digest: record.event_digest,
          occurred_at: event.occurred_at,
          recorded_at: event.recorded_at,
          appended_at: record.appended_at,
          is_correction: event.correction_of !== null,
          is_corrected: correctedByEventIds.length > 0,
          correction_of: event.correction_of,
          correction_root_event_id: lineage.root_event_id,
          correction_depth: lineage.depth,
          corrected_by_event_ids: [...correctedByEventIds],
          ledger_record: record,
        };
      });

      const builtThrough = records.reduce(
        (latest, record) =>
          record.appended_at > latest
            ? record.appended_at
            : latest,
        records[0].appended_at,
      );

      const digestInput = {
        timeline_version: TIMELINE_VERSION,
        timeline_id: timelineId,
        timeline_reference: timelineReference,
        tenant_id: tenantId,
        correlation_id: correlationId,
        ordering: ORDERING,
        entry_count: entries.length,
        built_through: builtThrough,
        entries,
      };

      return {
        ...digestInput,
        timeline_digest: stableDigest(digestInput),
      };
    }

    function normalizeTimeline(
      input,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        TIMELINE_KEYS,
        "TIMELINE_FIELDS_INVALID",
        "La timeline",
      );
      assertRequiredKeys(
        input,
        TIMELINE_KEYS,
        "TIMELINE_FIELDS_REQUIRED",
        "La timeline",
      );

      if (!Array.isArray(input.entries)) {
        error(
          "TIMELINE_ENTRIES_INVALID",
          "Las entradas de la timeline deben ser una lista.",
        );
      }

      const ledgerRecords = input.entries.map((entry, index) => {
        assertAllowedKeys(
          entry,
          ENTRY_KEYS,
          "TIMELINE_ENTRY_FIELDS_INVALID",
          `La entrada ${index + 1}`,
        );
        assertRequiredKeys(
          entry,
          ENTRY_KEYS,
          "TIMELINE_ENTRY_FIELDS_REQUIRED",
          `La entrada ${index + 1}`,
        );
        return entry.ledger_record;
      });

      const normalized = buildCanonicalTimeline({
        tenant_id: input.tenant_id,
        correlation_id: input.correlation_id,
        ledger_records: ledgerRecords,
      });

      if (
        requireCanonicalShape &&
        stableStringify(input) !== stableStringify(normalized)
      ) {
        error(
          "TIMELINE_NOT_CANONICAL",
          "La timeline es válida como fuente, pero no está en forma canónica.",
        );
      }

      return normalized;
    }

    function createCanonicalActivityTimeline({
      tenant_id,
      correlation_id,
      ledger_records,
    } = {}) {
      return deepFreeze(
        buildCanonicalTimeline({
          tenant_id,
          correlation_id,
          ledger_records,
        }),
      );
    }

    function assertCanonicalActivityTimeline(timeline) {
      return deepFreeze(
        normalizeTimeline(clone(timeline), {
          requireCanonicalShape: true,
        }),
      );
    }

    function validateCanonicalActivityTimeline(timeline) {
      try {
        assertCanonicalActivityTimeline(timeline);
        return deepFreeze({
          valid: true,
          errors: [],
        });
      } catch (caught) {
        return deepFreeze({
          valid: false,
          errors: [
            {
              code:
                caught && caught.code
                  ? caught.code
                  : "CANONICAL_TIMELINE_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La timeline no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildCanonicalActivityTimeline(timeline) {
      const canonicalTimeline =
        assertCanonicalActivityTimeline(timeline);

      return createCanonicalActivityTimeline({
        tenant_id: canonicalTimeline.tenant_id,
        correlation_id: canonicalTimeline.correlation_id,
        ledger_records: canonicalTimeline.entries.map(
          entry => clone(entry.ledger_record),
        ),
      });
    }

    function findTimelineEntry(timeline, eventId) {
      const canonicalTimeline =
        assertCanonicalActivityTimeline(timeline);
      const normalizedEventId = requireOpaque(
        eventId,
        "TIMELINE_EVENT_ID_INVALID",
        "El evento de la timeline",
      );

      return (
        canonicalTimeline.entries.find(
          entry => entry.event_id === normalizedEventId,
        ) || null
      );
    }

    return deepFreeze({
      CONTRACT_VERSION,
      TIMELINE_VERSION,
      ENTRY_VERSION,
      ORDERING,
      MAX_RECORDS,
      CanonicalActivityTimelineError,
      deriveTimelineId,
      createCanonicalActivityTimeline,
      assertCanonicalActivityTimeline,
      validateCanonicalActivityTimeline,
      rebuildCanonicalActivityTimeline,
      findTimelineEntry,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        compareLedgerRecords,
        buildCanonicalTimeline,
        deepFreeze,
      }),
    });
  },
);
