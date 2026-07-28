"use strict";

(function bridgeCanonicalAdapterModule(root, factory) {
  const canonicalContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;
  const bridgeContract =
    typeof module !== "undefined" && module.exports
      ? require("./passive-capture-bridge-contract")
      : root.ForgePassiveCaptureBridgeFES05A;

  const api = factory(
    canonicalContract,
    bridgeContract,
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeBridgeCanonicalEventAdapterFES05C = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function bridgeCanonicalAdapterFactory(
    canonicalContract,
    bridgeContract,
  ) {
    if (!canonicalContract) {
      throw new Error(
        "FES05B_CANONICAL_EVENT_CONTRACT_REQUIRED",
      );
    }

    if (!bridgeContract) {
      throw new Error(
        "FES05A_PASSIVE_CAPTURE_BRIDGE_REQUIRED",
      );
    }

    const ADAPTER_VERSION = "FES-05C.1";
    const BUNDLE_VERSION =
      "forge.bridge_canonical_event_bundle.v1";

    const SOURCE_ACTOR_TYPES = Object.freeze({
      SYSTEM_GENERATED: "SYSTEM",
      SYSTEM_OBSERVED: "SYSTEM",
      ADVISOR_REPORTED: "ADVISOR",
      ADVISOR_CONFIRMED: "ADVISOR",
      EXTERNAL_PROVIDER_CONFIRMED:
        "EXTERNAL_PROVIDER",
    });

    const EVENT_SUBJECT_TYPES = Object.freeze({
      MESSAGE_DRAFT_GENERATED: "MESSAGE",
      MESSAGE_DRAFT_EDITED: "MESSAGE",
      MESSAGE_DRAFT_APPROVED: "MESSAGE",
      MESSAGE_SENT_CONFIRMED: "MESSAGE",
      PROSPECT_REPLIED_CONFIRMED: "MESSAGE",
      OBJECTION_CAPTURED: "OBJECTION",
      OBJECTION_ANALYSIS_GENERATED: "OBJECTION",
      OBJECTION_RESPONSE_GENERATED: "OBJECTION",
      OBJECTION_RESPONSE_EDITED: "OBJECTION",
      OBJECTION_RESPONSE_APPROVED: "OBJECTION",
      OBJECTION_RESPONSE_USED: "OBJECTION",
      OBJECTION_OUTCOME_CONFIRMED: "OBJECTION",
      CALL_CONNECTED_CONFIRMED: "CALL",
      CALL_NOT_ANSWERED_CONFIRMED: "CALL",
      CALL_CONTEXT_ADDED: "CALL",
      APPOINTMENT_SCHEDULED: "APPOINTMENT",
      APPOINTMENT_NOT_HELD: "APPOINTMENT",
      APPOINTMENT_RESCHEDULED: "APPOINTMENT",
      APPOINTMENT_NO_SHOW: "APPOINTMENT",
      APPOINTMENT_HELD: "APPOINTMENT",
      QUOTE_STARTED: "QUOTE",
      QUOTE_PREPARED: "QUOTE",
      QUOTE_REVIEWED: "QUOTE",
      PRESENTATION_HELD_CONFIRMED:
        "PRESENTATION",
      PRODUCT_QUESTION_CAPTURED:
        "PRODUCT_QUESTION",
      PROPOSAL_REQUESTED_CONFIRMED:
        "PROPOSAL",
    });

    const BLOCK_REASONS = Object.freeze({
      REQUIRES_FES05B_EVENT_EXTENSION:
        "CANONICAL_EVENT_NOT_AUTHORIZED",
      BRIDGE_EVIDENCE_ONLY:
        "BRIDGE_EVIDENCE_ONLY",
      SOURCE_TRUTH_REQUIRED:
        "SOURCE_TRUTH_REQUIRED",
    });

    const BUNDLE_KEYS = Object.freeze([
      "bundle_version",
      "bundle_id",
      "tenant_id",
      "source_sequence_id",
      "source_sequence_digest",
      "event_count",
      "blocked_count",
      "counts_by_event_type",
      "counts_by_block_reason",
      "events",
      "blocked",
      "bundle_digest",
    ]);

    class BridgeCanonicalAdapterError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "BridgeCanonicalAdapterError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new BridgeCanonicalAdapterError(
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

    function fnv1a32(text, seed) {
      let hash = seed >>> 0;

      for (
        let index = 0;
        index < text.length;
        index += 1
      ) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }

      return (hash >>> 0)
        .toString(16)
        .padStart(8, "0");
    }

    function stableDigest(value) {
      const text =
        typeof value === "string"
          ? value
          : stableStringify(value);
      const seeds = [
        2166136261,
        2166136261 ^ 0x9e3779b9,
        2166136261 ^ 0x85ebca6b,
        2166136261 ^ 0xc2b2ae35,
      ];

      return seeds
        .map(seed => fnv1a32(text, seed))
        .join("");
    }

    function assertPlainObject(
      value,
      code,
      label,
    ) {
      if (!isPlainObject(value)) {
        error(code, `${label} debe ser un objeto.`);
      }
    }

    function assertAllowedKeys(
      value,
      allowed,
      code,
      label,
    ) {
      assertPlainObject(value, code, label);

      const unsupported = Object.keys(value)
        .filter(key => !allowed.includes(key))
        .sort();

      if (unsupported.length > 0) {
        error(
          code,
          `${label} contiene campos no autorizados.`,
          {
            unsupported_keys: unsupported,
          },
        );
      }
    }

    function requireOpaque(
      value,
      code,
      label,
    ) {
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

    function sourceActorType(sourceType) {
      const actorType =
        SOURCE_ACTOR_TYPES[sourceType];

      if (!actorType) {
        error(
          "BRIDGE_CANONICAL_SOURCE_NOT_ADAPTABLE",
          "La fuente del bridge no puede convertirse en actor canónico.",
          { source_type: sourceType },
        );
      }

      return actorType;
    }

    function subjectIdFor(
      eventType,
      payload,
    ) {
      if (
        eventType.startsWith("MESSAGE_") ||
        eventType ===
          "PROSPECT_REPLIED_CONFIRMED"
      ) {
        return payload.flow_reference;
      }

      if (
        eventType.startsWith("OBJECTION_")
      ) {
        return payload.flow_reference;
      }

      if (
        eventType.startsWith("CALL_")
      ) {
        return payload.call_reference;
      }

      if (
        eventType.startsWith("APPOINTMENT_")
      ) {
        return payload.appointment_reference;
      }

      if (
        eventType.startsWith("QUOTE_")
      ) {
        return payload.quote_reference;
      }

      if (
        eventType ===
        "PRESENTATION_HELD_CONFIRMED"
      ) {
        return payload.presentation_reference;
      }

      if (
        eventType ===
        "PRODUCT_QUESTION_CAPTURED"
      ) {
        return payload.question_reference;
      }

      if (
        eventType ===
        "PROPOSAL_REQUESTED_CONFIRMED"
      ) {
        return payload.proposal_reference;
      }

      error(
        "BRIDGE_CANONICAL_SUBJECT_MAPPING_MISSING",
        "No existe un sujeto canónico para el evento.",
        { event_type: eventType },
      );
    }

    function canonicalPayloadFromObservation(
      eventType,
      observation,
    ) {
      const payload = observation.payload;
      const lineage = canonicalContract
        .PROSPECT_LINEAGE_EVENT_TYPES
        .includes(eventType)
        ? {
            prospect_reference:
              observation.prospect_id,
          }
        : {};

      if (eventType === "APPOINTMENT_SCHEDULED") {
        return {
          appointment_reference:
            payload.appointment_reference,
          starts_at: payload.starts_at,
          ends_at: payload.ends_at,
          provider_event_reference:
            payload.provider_reference,
          ...lineage,
        };
      }

      if (eventType === "APPOINTMENT_HELD") {
        return {
          appointment_reference:
            payload.appointment_reference,
          outcome_confirmed_at:
            payload.outcome_confirmed_at ||
            observation.occurred_at,
          ...lineage,
        };
      }

      if (eventType === "APPOINTMENT_NOT_HELD") {
        return {
          appointment_reference:
            payload.appointment_reference,
          reason_code: payload.reason_code,
          outcome_confirmed_at:
            payload.outcome_confirmed_at ||
            observation.occurred_at,
          ...lineage,
        };
      }

      if (eventType === "APPOINTMENT_RESCHEDULED") {
        return {
          appointment_reference:
            payload.appointment_reference,
          previous_starts_at:
            payload.previous_starts_at,
          starts_at: payload.starts_at,
          ends_at: payload.ends_at,
          ...lineage,
        };
      }

      if (eventType === "APPOINTMENT_NO_SHOW") {
        return {
          appointment_reference:
            payload.appointment_reference,
          party: payload.party,
          outcome_confirmed_at:
            payload.outcome_confirmed_at ||
            observation.occurred_at,
          ...lineage,
        };
      }

      return {
        ...clone(payload),
        ...lineage,
      };
    }

    function canonicalInputFromObservation(
      observation,
    ) {
      const eventType =
        observation
          .canonical_candidate
          .event_type;

      if (
        observation
          .canonical_candidate
          .state !== "SUPPORTED_BY_FES01"
      ) {
        error(
          "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
          "La observación no está autorizada como evento canónico.",
          {
            observation_id:
              observation.observation_id,
            action_code:
              observation.action_code,
            candidate_state:
              observation
                .canonical_candidate
                .state,
          },
        );
      }

      if (
        !canonicalContract
          .EVENT_TYPES
          .includes(eventType)
      ) {
        error(
          "BRIDGE_CANONICAL_EVENT_TYPE_NOT_AUTHORIZED",
          "El evento candidato no pertenece al contrato canónico.",
          {
            event_type: eventType,
          },
        );
      }

      const subjectType =
        EVENT_SUBJECT_TYPES[eventType];

      if (!subjectType) {
        error(
          "BRIDGE_CANONICAL_SUBJECT_MAPPING_MISSING",
          "No existe una regla de sujeto para el evento.",
          { event_type: eventType },
        );
      }

      const subjectId = requireOpaque(
        subjectIdFor(
          eventType,
          observation.payload,
        ),
        "BRIDGE_CANONICAL_SUBJECT_ID_INVALID",
        "El identificador de sujeto",
      );

      return {
        event_type: eventType,
        tenant_id: observation.tenant_id,
        actor: {
          type: sourceActorType(
            observation.source.type,
          ),
          id: observation.actor_id,
        },
        subject: {
          type: subjectType,
          id: subjectId,
        },
        source: {
          type: observation.source.type,
          reference:
            observation.source.reference,
          channel:
            observation.source.channel,
        },
        evidence_strength:
          observation.evidence_strength,
        occurred_at:
          observation.occurred_at,
        recorded_at:
          observation.recorded_at,
        effective_period: null,
        causation_id: null,
        correlation_id:
          observation.payload
            .flow_reference,
        idempotency_key:
          `bridge:${observation.observation_id}`,
        privacy_class: "PRIVATE",
        learning_eligibility: false,
        payload:
          canonicalPayloadFromObservation(
            eventType,
            observation,
          ),
        provenance: {
          source_system:
            "FES_05A_PASSIVE_CAPTURE_BRIDGE",
          source_record_id:
            observation.observation_id,
          captured_via:
            observation.source.channel,
          evidence_references: [
            ...observation
              .evidence_references,
          ],
        },
        confirmation_state:
          observation.confirmation_state,
        correction_of: null,
        safety_flags: {
          ...canonicalContract
            .DEFAULT_SAFETY_FLAGS,
        },
      };
    }

    function createCanonicalEventFromObservation(
      input = {},
    ) {
      assertAllowedKeys(
        input,
        [
          "observation",
          "observation_source",
        ],
        "BRIDGE_CANONICAL_ADAPTER_FIELDS_INVALID",
        "La solicitud del adaptador",
      );

      const observation =
        bridgeContract
          .assertPassiveCaptureObservation(
            clone(input.observation),
            clone(
              input.observation_source,
            ),
          );

      const event =
        canonicalContract
          .createCanonicalActivityEvent(
            canonicalInputFromObservation(
              observation,
            ),
          );

      return deepFreeze(event);
    }

    function blockedEntry(observation) {
      const candidateState =
        observation
          .canonical_candidate
          .state;
      const reasonCode =
        BLOCK_REASONS[candidateState];

      if (!reasonCode) {
        error(
          "BRIDGE_CANONICAL_BLOCK_REASON_UNKNOWN",
          "La observación bloqueada no tiene una razón autorizada.",
          {
            observation_id:
              observation.observation_id,
            candidate_state:
              candidateState,
          },
        );
      }

      return {
        observation_id:
          observation.observation_id,
        action_code:
          observation.action_code,
        domain: observation.domain,
        stage: observation.stage,
        candidate_event_type:
          observation
            .canonical_candidate
            .event_type,
        candidate_state:
          candidateState,
        reason_code: reasonCode,
      };
    }

    function deriveBundleId({
      tenant_id,
      source_sequence_id,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "BRIDGE_CANONICAL_TENANT_INVALID",
        "El tenant",
      );
      const sequenceId = requireOpaque(
        source_sequence_id,
        "BRIDGE_CANONICAL_SEQUENCE_ID_INVALID",
        "La secuencia fuente",
      );

      return `bridge_bundle_${stableDigest({
        bundle_version:
          BUNDLE_VERSION,
        tenant_id: tenantId,
        source_sequence_id:
          sequenceId,
      })}`;
    }

    function buildBundle(
      input = {},
    ) {
      assertAllowedKeys(
        input,
        [
          "sequence",
          "sequence_source",
        ],
        "BRIDGE_CANONICAL_BUNDLE_FIELDS_INVALID",
        "La solicitud de bundle",
      );

      const source =
        clone(input.sequence_source);
      const sequence =
        bridgeContract
          .assertPassiveCaptureSequence(
            clone(input.sequence),
            source,
          );

      const sourceByReference =
        new Map(
          source.observations.map(
            observationSource => [
              observationSource
                .observation_reference,
              observationSource,
            ],
          ),
        );

      const events = [];
      const blocked = [];

      for (
        const observation
        of sequence.observations
      ) {
        const observationSource =
          sourceByReference.get(
            observation
              .observation_reference,
          );

        if (!observationSource) {
          error(
            "BRIDGE_CANONICAL_SOURCE_OBSERVATION_MISSING",
            "No se encontró la fuente de la observación.",
            {
              observation_reference:
                observation
                  .observation_reference,
            },
          );
        }

        if (
          observation
            .canonical_candidate
            .state ===
              "SUPPORTED_BY_FES01"
        ) {
          events.push(
            createCanonicalEventFromObservation({
              observation,
              observation_source:
                observationSource,
            }),
          );
        } else {
          blocked.push(
            blockedEntry(observation),
          );
        }
      }

      const countsByEventType =
        Object.fromEntries(
          canonicalContract
            .PASSIVE_CAPTURE_EVENT_TYPES
            .map(eventType => [
              eventType,
              0,
            ]),
        );
      const countsByBlockReason =
        Object.fromEntries(
          [
            ...new Set(
              Object.values(
                BLOCK_REASONS,
              ),
            ),
          ]
            .sort()
            .map(reason => [
              reason,
              0,
            ]),
        );

      for (const event of events) {
        countsByEventType[
          event.event_type
        ] += 1;
      }

      for (
        const blockedItem of blocked
      ) {
        countsByBlockReason[
          blockedItem.reason_code
        ] += 1;
      }

      const bundleId =
        deriveBundleId({
          tenant_id:
            sequence.tenant_id,
          source_sequence_id:
            sequence.sequence_id,
        });

      const digestInput = {
        bundle_version:
          BUNDLE_VERSION,
        bundle_id: bundleId,
        tenant_id:
          sequence.tenant_id,
        source_sequence_id:
          sequence.sequence_id,
        source_sequence_digest:
          sequence.sequence_digest,
        event_count: events.length,
        blocked_count:
          blocked.length,
        counts_by_event_type:
          countsByEventType,
        counts_by_block_reason:
          countsByBlockReason,
        events,
        blocked,
      };

      return {
        ...digestInput,
        bundle_digest:
          stableDigest(digestInput),
      };
    }

    function createCanonicalEventBundle(
      input = {},
    ) {
      return deepFreeze(
        buildBundle(clone(input)),
      );
    }

    function assertCanonicalEventBundle(
      bundle,
      source,
    ) {
      assertAllowedKeys(
        bundle,
        BUNDLE_KEYS,
        "BRIDGE_CANONICAL_BUNDLE_OUTPUT_FIELDS_INVALID",
        "El bundle canónico",
      );

      const rebuilt =
        buildBundle(clone(source));

      if (
        stableStringify(bundle) !==
          stableStringify(rebuilt)
      ) {
        error(
          "BRIDGE_CANONICAL_BUNDLE_NOT_CANONICAL",
          "El bundle no coincide con su secuencia fuente.",
        );
      }

      return deepFreeze(rebuilt);
    }

    function validateCanonicalEventBundle(
      bundle,
      source,
    ) {
      try {
        assertCanonicalEventBundle(
          bundle,
          source,
        );

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
                  : "BRIDGE_CANONICAL_BUNDLE_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "El bundle no es válido.",
              details:
                caught && caught.details
                  ? stableValue(
                      caught.details,
                    )
                  : null,
            },
          ],
        });
      }
    }

    function rebuildCanonicalEventBundle({
      bundle,
      source,
    } = {}) {
      assertCanonicalEventBundle(
        bundle,
        source,
      );

      return createCanonicalEventBundle(
        source,
      );
    }

    return deepFreeze({
      ADAPTER_VERSION,
      BUNDLE_VERSION,
      SOURCE_ACTOR_TYPES,
      EVENT_SUBJECT_TYPES,
      BLOCK_REASONS,
      BridgeCanonicalAdapterError,
      deriveBundleId,
      createCanonicalEventFromObservation,
      createCanonicalEventBundle,
      assertCanonicalEventBundle,
      validateCanonicalEventBundle,
      rebuildCanonicalEventBundle,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        sourceActorType,
        subjectIdFor,
        canonicalInputFromObservation,
        blockedEntry,
        buildBundle,
        deepFreeze,
      }),
    });
  },
);
