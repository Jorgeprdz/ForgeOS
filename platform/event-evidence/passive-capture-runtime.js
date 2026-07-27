"use strict";

(function passiveCaptureRuntimeModule(root, factory) {
  const bridge =
    typeof module !== "undefined" && module.exports
      ? require("./passive-capture-bridge-contract")
      : root.ForgePassiveCaptureBridgeFES05A;
  const adapter =
    typeof module !== "undefined" && module.exports
      ? require("./bridge-to-canonical-event-adapter")
      : root.ForgeBridgeCanonicalEventAdapterFES05C;
  const ledger =
    typeof module !== "undefined" && module.exports
      ? require("./activity-ledger-contract")
      : root.ForgeActivityLedgerContractFES02A;
  const timelineContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-timeline-contract")
      : root.ForgeCanonicalActivityTimelineFES03B;
  const projectionRuntime =
    typeof module !== "undefined" && module.exports
      ? require("./projection-runtime")
      : root.ForgeProjectionRuntimeFES03G;

  const api = factory(
    bridge,
    adapter,
    ledger,
    timelineContract,
    projectionRuntime,
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgePassiveCaptureRuntimeFES05D = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function passiveCaptureRuntimeFactory(
    bridge,
    adapter,
    ledger,
    timelineContract,
    projectionRuntime,
  ) {
    if (!bridge) {
      throw new Error("FES05A_PASSIVE_CAPTURE_BRIDGE_REQUIRED");
    }
    if (!adapter) {
      throw new Error("FES05C_BRIDGE_ADAPTER_REQUIRED");
    }
    if (!ledger) {
      throw new Error("FES02A_LEDGER_CONTRACT_REQUIRED");
    }
    if (!timelineContract) {
      throw new Error("FES03B_TIMELINE_CONTRACT_REQUIRED");
    }
    if (!projectionRuntime) {
      throw new Error("FES03G_PROJECTION_RUNTIME_REQUIRED");
    }

    const RUNTIME_VERSION = "FES-05D.1";
    const ACCEPTANCE_VERSION =
      "forge.passive_capture_runtime_acceptance.v1";

    const ACCEPTANCE_KEYS = Object.freeze([
      "acceptance_version",
      "acceptance_id",
      "plan_reference",
      "tenant_id",
      "prospect_id",
      "flow_reference",
      "source_timeline_id",
      "source_timeline_digest",
      "source_sequence_id",
      "source_sequence_digest",
      "canonical_bundle_id",
      "canonical_bundle_digest",
      "observation_count",
      "canonical_event_count",
      "blocked_observation_count",
      "merged_timeline_entry_count",
      "blocked_observations",
      "merged_timeline",
      "projection_snapshot",
      "acceptance",
      "acceptance_digest",
    ]);

    class PassiveCaptureRuntimeError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "PassiveCaptureRuntimeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new PassiveCaptureRuntimeError(
        code,
        message,
        details,
      );
    }

    function isPlainObject(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return (
        prototype === Object.prototype ||
        prototype === null
      );
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Object.isFrozen(value)
      ) {
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
        projectionRuntime._private &&
        typeof projectionRuntime._private.stableDigest ===
          "function"
      ) {
        return projectionRuntime._private.stableDigest(value);
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
        error(
          code,
          `${label} contiene campos no autorizados.`,
          { unsupported_keys: unsupported },
        );
      }
    }

    function requireOpaque(value, code, label) {
      const normalized = String(value || "").trim();
      if (
        !normalized ||
        normalized.length > 240 ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/+ -]*$/.test(
          normalized,
        )
      ) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function effectiveProspectId(timeline) {
      const entries = timeline.entries.filter(
        entry =>
          entry.event_type === "PROSPECT_CREATED" &&
          !entry.is_corrected,
      );
      if (entries.length !== 1) {
        error(
          "PASSIVE_RUNTIME_PROSPECT_ROOT_INVALID",
          "La timeline requiere exactamente una identidad efectiva de prospecto.",
          { roots_found: entries.length },
        );
      }
      return entries[0]
        .ledger_record
        .canonical_event
        .subject
        .id;
    }

    function deriveAcceptanceId({
      tenant_id,
      prospect_id,
      flow_reference,
      plan_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PASSIVE_RUNTIME_TENANT_INVALID",
        "El tenant",
      );
      const prospectId = requireOpaque(
        prospect_id,
        "PASSIVE_RUNTIME_PROSPECT_INVALID",
        "El prospecto",
      );
      const flowReference = requireOpaque(
        flow_reference,
        "PASSIVE_RUNTIME_FLOW_INVALID",
        "El flujo",
      );
      const planReference = requireOpaque(
        plan_reference,
        "PASSIVE_RUNTIME_PLAN_INVALID",
        "El plan",
      );
      return `passive_runtime_${stableDigest({
        acceptance_version: ACCEPTANCE_VERSION,
        tenant_id: tenantId,
        prospect_id: prospectId,
        flow_reference: flowReference,
        plan_reference: planReference,
      })}`;
    }

    function buildAcceptance({
      plan_reference,
      base_timeline,
      sequence,
      sequence_source,
    } = {}) {
      const planReference = requireOpaque(
        plan_reference,
        "PASSIVE_RUNTIME_PLAN_INVALID",
        "El plan",
      );
      const timeline =
        timelineContract.assertCanonicalActivityTimeline(
          clone(base_timeline),
        );
      const source = clone(sequence_source);
      const canonicalSequence =
        bridge.assertPassiveCaptureSequence(
          clone(sequence),
          source,
        );

      if (canonicalSequence.tenant_id !== timeline.tenant_id) {
        error(
          "PASSIVE_RUNTIME_TENANT_MISMATCH",
          "La secuencia y la timeline no pertenecen al mismo tenant.",
        );
      }
      if (canonicalSequence.prospect_count !== 1) {
        error(
          "PASSIVE_RUNTIME_SINGLE_PROSPECT_REQUIRED",
          "La aceptación inicial requiere un solo prospecto.",
          { prospect_count: canonicalSequence.prospect_count },
        );
      }
      if (canonicalSequence.flow_count !== 1) {
        error(
          "PASSIVE_RUNTIME_SINGLE_FLOW_REQUIRED",
          "La aceptación inicial requiere un solo flujo correlacionado.",
          { flow_count: canonicalSequence.flow_count },
        );
      }

      const prospectId = effectiveProspectId(timeline);
      const prospectIds = [
        ...new Set(
          canonicalSequence.observations.map(
            observation => observation.prospect_id,
          ),
        ),
      ];
      if (
        prospectIds.length !== 1 ||
        prospectIds[0] !== prospectId
      ) {
        error(
          "PASSIVE_RUNTIME_PROSPECT_MISMATCH",
          "La secuencia no corresponde al prospecto de la timeline.",
          {
            expected_prospect_id: prospectId,
            actual_prospect_ids: prospectIds.sort(),
          },
        );
      }

      const flowReference =
        canonicalSequence
          .observations[0]
          .payload
          .flow_reference;
      if (flowReference !== timeline.correlation_id) {
        error(
          "PASSIVE_RUNTIME_CORRELATION_MISMATCH",
          "El flujo pasivo no coincide con la correlación de la timeline.",
          {
            expected_correlation_id: timeline.correlation_id,
            actual_flow_reference: flowReference,
          },
        );
      }

      const canonicalBundle =
        adapter.createCanonicalEventBundle({
          sequence: canonicalSequence,
          sequence_source: source,
        });

      if (
        canonicalBundle.event_count +
          canonicalBundle.blocked_count !==
        canonicalSequence.observation_count
      ) {
        error(
          "PASSIVE_RUNTIME_OBSERVATION_ACCOUNTING_MISMATCH",
          "Cada observación debe terminar como evento o bloqueo explícito.",
        );
      }

      for (const event of canonicalBundle.events) {
        if (event.correlation_id !== timeline.correlation_id) {
          error(
            "PASSIVE_RUNTIME_EVENT_CORRELATION_MISMATCH",
            "Un evento adaptado quedó fuera de la correlación canónica.",
            { event_id: event.event_id },
          );
        }
      }

      const passiveRecords =
        canonicalBundle.events.map(event =>
          ledger.createLedgerRecord({
            canonical_event: event,
            evidence_references: [],
            appended_at: event.recorded_at,
          }),
        );
      const existingRecords = timeline.entries.map(
        entry => clone(entry.ledger_record),
      );
      const mergedTimeline =
        timelineContract.createCanonicalActivityTimeline({
          tenant_id: timeline.tenant_id,
          correlation_id: timeline.correlation_id,
          ledger_records: [
            ...existingRecords,
            ...passiveRecords,
          ],
        });
      const projectionSnapshot =
        projectionRuntime.createProjectionRuntimeSnapshot({
          plan_reference: planReference,
          timelines: [mergedTimeline],
        });
      const acceptanceId = deriveAcceptanceId({
        tenant_id: timeline.tenant_id,
        prospect_id: prospectId,
        flow_reference: flowReference,
        plan_reference: planReference,
      });
      const acceptance = {
        source_observation_revalidation: true,
        canonical_event_validation: true,
        ledger_append_projection: true,
        canonical_timeline_rebuild: true,
        activity_projection: true,
        prospect_detail_projection: true,
        pipeline_card_projection: true,
        mi_dia_projection: true,
        blocked_observations_explicit: true,
        silent_observation_drop: false,
        handoff_promoted_to_result: false,
        pipeline_stage_promoted_to_truth: false,
        productive_ui_binding: false,
        external_execution: false,
        supabase_remote_mutation: false,
        database_migration: false,
        wall_clock_inference: false,
      };
      const digestInput = {
        acceptance_version: ACCEPTANCE_VERSION,
        acceptance_id: acceptanceId,
        plan_reference: planReference,
        tenant_id: timeline.tenant_id,
        prospect_id: prospectId,
        flow_reference: flowReference,
        source_timeline_id: timeline.timeline_id,
        source_timeline_digest: timeline.timeline_digest,
        source_sequence_id: canonicalSequence.sequence_id,
        source_sequence_digest: canonicalSequence.sequence_digest,
        canonical_bundle_id: canonicalBundle.bundle_id,
        canonical_bundle_digest: canonicalBundle.bundle_digest,
        observation_count: canonicalSequence.observation_count,
        canonical_event_count: canonicalBundle.event_count,
        blocked_observation_count: canonicalBundle.blocked_count,
        merged_timeline_entry_count: mergedTimeline.entry_count,
        blocked_observations: canonicalBundle.blocked,
        merged_timeline: mergedTimeline,
        projection_snapshot: projectionSnapshot,
        acceptance,
      };
      return {
        ...digestInput,
        acceptance_digest: stableDigest(digestInput),
      };
    }

    function createPassiveCaptureRuntimeAcceptance(input = {}) {
      return deepFreeze(buildAcceptance(clone(input)));
    }

    function assertPassiveCaptureRuntimeAcceptance(
      acceptance,
      source,
    ) {
      assertAllowedKeys(
        acceptance,
        ACCEPTANCE_KEYS,
        "PASSIVE_RUNTIME_OUTPUT_FIELDS_INVALID",
        "La aceptación del runtime",
      );
      const rebuilt = buildAcceptance(clone(source));
      if (
        stableStringify(acceptance) !==
        stableStringify(rebuilt)
      ) {
        error(
          "PASSIVE_RUNTIME_NOT_CANONICAL",
          "La aceptación no coincide con sus fuentes.",
        );
      }
      return deepFreeze(rebuilt);
    }

    function validatePassiveCaptureRuntimeAcceptance(
      acceptance,
      source,
    ) {
      try {
        assertPassiveCaptureRuntimeAcceptance(
          acceptance,
          source,
        );
        return deepFreeze({ valid: true, errors: [] });
      } catch (caught) {
        return deepFreeze({
          valid: false,
          errors: [
            {
              code:
                caught && caught.code
                  ? caught.code
                  : "PASSIVE_RUNTIME_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La aceptación del runtime no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildPassiveCaptureRuntimeAcceptance({
      acceptance,
      source,
    } = {}) {
      assertPassiveCaptureRuntimeAcceptance(
        acceptance,
        source,
      );
      return createPassiveCaptureRuntimeAcceptance(source);
    }

    return deepFreeze({
      RUNTIME_VERSION,
      ACCEPTANCE_VERSION,
      PassiveCaptureRuntimeError,
      deriveAcceptanceId,
      createPassiveCaptureRuntimeAcceptance,
      assertPassiveCaptureRuntimeAcceptance,
      validatePassiveCaptureRuntimeAcceptance,
      rebuildPassiveCaptureRuntimeAcceptance,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        effectiveProspectId,
        buildAcceptance,
        deepFreeze,
      }),
    });
  },
);
