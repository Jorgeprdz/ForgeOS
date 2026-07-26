"use strict";

(function lightProspectIntakeModule(root, factory) {
  const canonicalEventContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;

  const api = factory(canonicalEventContract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeLightProspectIntakeFES04 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function lightProspectIntakeFactory(
    canonicalEventContract,
  ) {
    if (!canonicalEventContract) {
      throw new Error(
        "FES01_CANONICAL_EVENT_CONTRACT_REQUIRED",
      );
    }

    const CONTRACT_VERSION = "FES-04.1";
    const INTAKE_VERSION =
      "forge.light_prospect_intake.v1";
    const EVENT_ZERO_VERSION =
      "forge.prospect_event_zero.v1";

    const CAPTURE_MODES = Object.freeze([
      "VOICE",
      "TEXT",
    ]);

    const CANDIDATE_FIELDS = Object.freeze([
      "email",
      "date_of_birth",
      "occupation",
      "referred_by",
      "relationship_to_referrer",
    ]);

    const CANDIDATE_DECISIONS = Object.freeze([
      "ACCEPTED",
      "REJECTED",
    ]);

    const EVENT_ZERO_TYPES = Object.freeze([
      "TIMELINE_INITIALIZED",
      "PROSPECT_PROFILE_CREATED",
      "PROSPECT_CREATED",
      "INITIAL_CONTEXT_CAPTURED",
    ]);

    const FORBIDDEN_INTAKE_FIELDS = Object.freeze([
      "age",
      "marital_status",
      "dependents",
      "estimated_income",
      "product_interests",
      "due_action_type",
      "due_action_at",
      "next_action_type",
      "next_action_at",
    ]);

    const INTAKE_KEYS = Object.freeze([
      "intake_version",
      "intake_id",
      "submission_reference",
      "tenant_id",
      "advisor_id",
      "profile_draft",
      "context_draft",
      "candidate_review",
      "event_zero",
      "persistence_state",
      "productive_ui_binding",
      "intake_digest",
    ]);

    class LightProspectIntakeError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "LightProspectIntakeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new LightProspectIntakeError(
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

    function assertPlainObject(value, code, label) {
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

    function assertRequiredKeys(
      value,
      required,
      code,
      label,
    ) {
      const missing = required
        .filter(key => value[key] === undefined)
        .sort();

      if (missing.length > 0) {
        error(
          code,
          `${label} no contiene todos los campos obligatorios.`,
          {
            missing_keys: missing,
          },
        );
      }
    }

    function requireOpaque(
      value,
      code,
      label,
      maximum = 240,
    ) {
      const normalized = String(value || "").trim();

      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(
          normalized,
        )
      ) {
        error(code, `${label} no es válido.`);
      }

      return normalized;
    }

    function requireText(
      value,
      code,
      label,
      {
        minimum = 1,
        maximum = 4000,
      } = {},
    ) {
      const normalized = String(value || "")
        .replace(/\r\n/g, "\n")
        .trim();

      if (
        normalized.length < minimum ||
        normalized.length > maximum ||
        /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(
          normalized,
        )
      ) {
        error(code, `${label} no es válido.`);
      }

      return normalized;
    }

    function optionalText(
      value,
      code,
      label,
      options,
    ) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      return requireText(
        value,
        code,
        label,
        options,
      );
    }

    function requireIso(value, code, label) {
      if (
        typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value))
      ) {
        error(code, `${label} no es válido.`);
      }

      return new Date(value).toISOString();
    }

    function addMilliseconds(iso, milliseconds) {
      return new Date(
        Date.parse(iso) + milliseconds,
      ).toISOString();
    }

    function normalizeContactValue(
      value,
      code,
      label,
    ) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      const raw = String(value).trim();
      const normalized = raw
        .replace(/[()\s.-]/g, "")
        .replace(/^00/, "+");

      if (
        !/^\+?[0-9]{7,18}$/.test(normalized)
      ) {
        error(code, `${label} no es válido.`);
      }

      return normalized;
    }

    function normalizeEmail(value) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      const normalized = String(value)
        .trim()
        .toLowerCase();

      if (
        normalized.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalized,
        )
      ) {
        error(
          "LIGHT_INTAKE_EMAIL_INVALID",
          "El email no es válido.",
        );
      }

      return normalized;
    }

    function normalizeDateOfBirth(value) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      const normalized = String(value).trim();

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(normalized)
      ) {
        error(
          "LIGHT_INTAKE_DATE_OF_BIRTH_INVALID",
          "La fecha de nacimiento no es válida.",
        );
      }

      const parsed = new Date(
        `${normalized}T00:00:00.000Z`,
      );

      if (
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !==
          normalized
      ) {
        error(
          "LIGHT_INTAKE_DATE_OF_BIRTH_INVALID",
          "La fecha de nacimiento no es válida.",
        );
      }

      return normalized;
    }

    function normalizeCandidateValue(
      field,
      value,
    ) {
      switch (field) {
        case "email":
          return normalizeEmail(value);
        case "date_of_birth":
          return normalizeDateOfBirth(value);
        case "occupation":
          return requireText(
            value,
            "LIGHT_INTAKE_OCCUPATION_INVALID",
            "La ocupación candidata",
            {
              minimum: 2,
              maximum: 160,
            },
          );
        case "referred_by":
          return requireText(
            value,
            "LIGHT_INTAKE_REFERRER_INVALID",
            "La persona referidora candidata",
            {
              minimum: 2,
              maximum: 160,
            },
          );
        case "relationship_to_referrer":
          return requireText(
            value,
            "LIGHT_INTAKE_REFERRER_RELATIONSHIP_INVALID",
            "La relación candidata",
            {
              minimum: 2,
              maximum: 160,
            },
          );
        default:
          error(
            "LIGHT_INTAKE_CANDIDATE_FIELD_INVALID",
            "El campo candidato no es válido.",
            {
              field,
              allowed_fields: [
                ...CANDIDATE_FIELDS,
              ],
            },
          );
      }
    }

    function normalizeCandidates(
      candidatesInput,
      decisionsInput,
    ) {
      const candidates =
        candidatesInput === undefined ||
        candidatesInput === null
          ? []
          : candidatesInput;
      const decisions =
        decisionsInput === undefined ||
        decisionsInput === null
          ? []
          : decisionsInput;

      if (!Array.isArray(candidates)) {
        error(
          "LIGHT_INTAKE_CANDIDATES_INVALID",
          "Los candidatos deben ser una lista.",
        );
      }

      if (!Array.isArray(decisions)) {
        error(
          "LIGHT_INTAKE_CANDIDATE_DECISIONS_INVALID",
          "Las decisiones deben ser una lista.",
        );
      }

      const byId = new Map();

      for (const candidate of candidates) {
        assertAllowedKeys(
          candidate,
          [
            "candidate_id",
            "field",
            "value",
            "confidence",
            "source_reference",
          ],
          "LIGHT_INTAKE_CANDIDATE_FIELDS_INVALID",
          "El candidato",
        );

        assertRequiredKeys(
          candidate,
          [
            "candidate_id",
            "field",
            "value",
            "confidence",
            "source_reference",
          ],
          "LIGHT_INTAKE_CANDIDATE_FIELDS_REQUIRED",
          "El candidato",
        );

        const candidateId = requireOpaque(
          candidate.candidate_id,
          "LIGHT_INTAKE_CANDIDATE_ID_INVALID",
          "El identificador del candidato",
        );
        const field = String(
          candidate.field || "",
        ).trim();

        if (!CANDIDATE_FIELDS.includes(field)) {
          error(
            "LIGHT_INTAKE_CANDIDATE_FIELD_INVALID",
            "El campo candidato no es válido.",
            {
              field,
              allowed_fields: [
                ...CANDIDATE_FIELDS,
              ],
            },
          );
        }

        const confidence = Number(
          candidate.confidence,
        );

        if (
          !Number.isFinite(confidence) ||
          confidence < 0 ||
          confidence > 1
        ) {
          error(
            "LIGHT_INTAKE_CANDIDATE_CONFIDENCE_INVALID",
            "La confianza candidata no es válida.",
          );
        }

        if (byId.has(candidateId)) {
          error(
            "LIGHT_INTAKE_CANDIDATE_DUPLICATE",
            "El candidato está duplicado.",
            { candidate_id: candidateId },
          );
        }

        byId.set(candidateId, {
          candidate_id: candidateId,
          field,
          value: normalizeCandidateValue(
            field,
            candidate.value,
          ),
          confidence,
          source_reference: requireOpaque(
            candidate.source_reference,
            "LIGHT_INTAKE_CANDIDATE_SOURCE_INVALID",
            "La fuente del candidato",
          ),
          decision: "PENDING",
        });
      }

      const decided = new Set();

      for (const decision of decisions) {
        assertAllowedKeys(
          decision,
          [
            "candidate_id",
            "decision",
          ],
          "LIGHT_INTAKE_DECISION_FIELDS_INVALID",
          "La decisión candidata",
        );

        assertRequiredKeys(
          decision,
          [
            "candidate_id",
            "decision",
          ],
          "LIGHT_INTAKE_DECISION_FIELDS_REQUIRED",
          "La decisión candidata",
        );

        const candidateId = requireOpaque(
          decision.candidate_id,
          "LIGHT_INTAKE_CANDIDATE_ID_INVALID",
          "El identificador del candidato",
        );
        const selected = String(
          decision.decision || "",
        ).trim();

        if (
          !CANDIDATE_DECISIONS.includes(
            selected,
          )
        ) {
          error(
            "LIGHT_INTAKE_CANDIDATE_DECISION_INVALID",
            "La decisión candidata no es válida.",
          );
        }

        if (!byId.has(candidateId)) {
          error(
            "LIGHT_INTAKE_DECISION_ORPHAN",
            "La decisión no corresponde a un candidato.",
            { candidate_id: candidateId },
          );
        }

        if (decided.has(candidateId)) {
          error(
            "LIGHT_INTAKE_DECISION_DUPLICATE",
            "El candidato tiene decisiones duplicadas.",
            { candidate_id: candidateId },
          );
        }

        decided.add(candidateId);
        byId.get(candidateId).decision =
          selected;
      }

      return [...byId.values()].sort(
        (left, right) =>
          left.candidate_id.localeCompare(
            right.candidate_id,
          ),
      );
    }

    function applyCandidates({
      sourceCategory,
      optionalProfile,
      referral,
      candidates,
    }) {
      const promoted = {
        email: optionalProfile.email,
        date_of_birth:
          optionalProfile.date_of_birth,
        occupation:
          optionalProfile.occupation,
        referred_by:
          referral &&
          referral.referred_by,
        relationship_to_referrer:
          referral &&
          referral
            .relationship_to_referrer,
      };

      const acceptedByField = new Map();

      for (const candidate of candidates) {
        if (candidate.decision !== "ACCEPTED") {
          continue;
        }

        if (
          [
            "referred_by",
            "relationship_to_referrer",
          ].includes(candidate.field) &&
          sourceCategory !== "REFERRAL"
        ) {
          error(
            "LIGHT_INTAKE_NON_REFERRAL_CANDIDATE_CONFLICT",
            "Un prospecto no referido no puede promover relación de referido.",
            { field: candidate.field },
          );
        }

        const previous = acceptedByField.get(
          candidate.field,
        );

        if (
          previous !== undefined &&
          previous !== candidate.value
        ) {
          error(
            "LIGHT_INTAKE_CANDIDATE_CONFLICT",
            "Dos candidatos aceptados discrepan.",
            { field: candidate.field },
          );
        }

        acceptedByField.set(
          candidate.field,
          candidate.value,
        );

        if (
          promoted[candidate.field] !== null &&
          promoted[candidate.field] !==
            undefined &&
          promoted[candidate.field] !==
            candidate.value
        ) {
          error(
            "LIGHT_INTAKE_CANDIDATE_CONFLICT",
            "El candidato aceptado contradice un dato explícito.",
            { field: candidate.field },
          );
        }

        promoted[candidate.field] =
          candidate.value;
      }

      const review = candidates.map(
        candidate => ({
          ...candidate,
          promotion_state:
            candidate.decision === "ACCEPTED"
              ? "ACCEPTED_PROMOTED"
              : candidate.decision ===
                    "REJECTED"
                ? "REJECTED"
                : "PENDING_CONFIRMATION",
        }),
      );

      return {
        promoted,
        review,
      };
    }

    function deriveReferences({
      tenantId,
      submissionReference,
    }) {
      const root = stableDigest({
        tenant_id: tenantId,
        submission_reference:
          submissionReference,
        intake_version: INTAKE_VERSION,
      });

      return {
        intake_id: `intake_${root}`,
        prospect_reference:
          `prospect_${stableDigest({
            root,
            kind: "prospect",
          })}`,
        profile_reference:
          `profile_${stableDigest({
            root,
            kind: "profile",
          })}`,
        context_reference:
          `context_${stableDigest({
            root,
            kind: "context",
          })}`,
        timeline_reference:
          `timeline_${stableDigest({
            root,
            kind: "timeline",
          })}`,
        correlation_id:
          `corr_${stableDigest({
            root,
            kind: "correlation",
          })}`,
      };
    }

    function createEventZero({
      tenantId,
      advisorId,
      sourceCategory,
      captureMode,
      occurredAt,
      recordedAt,
      submissionReference,
      references,
    }) {
      const safetyFlags = {
        ...canonicalEventContract
          .DEFAULT_SAFETY_FLAGS,
      };

      const common = {
        tenant_id: tenantId,
        subject: {
          type: "PROSPECT",
          id: references
            .prospect_reference,
        },
        occurred_at: occurredAt,
        effective_period: null,
        correlation_id:
          references.correlation_id,
        privacy_class: "PRIVATE",
        learning_eligibility: false,
        correction_of: null,
        safety_flags: safetyFlags,
      };

      const timeline =
        canonicalEventContract
          .createCanonicalActivityEvent({
            ...common,
            event_type:
              "TIMELINE_INITIALIZED",
            actor: {
              type: "SYSTEM",
              id: "forge-system",
            },
            source: {
              type: "SYSTEM_OBSERVED",
              reference:
                `${references.intake_id}:timeline`,
              channel: "FORGE_SYSTEM",
            },
            evidence_strength:
              "SYSTEM_OBSERVED",
            recorded_at:
              addMilliseconds(recordedAt, 0),
            causation_id: null,
            idempotency_key:
              `${submissionReference}:timeline`,
            payload: {
              timeline_reference:
                references.timeline_reference,
            },
            provenance: {
              source_system:
                "fes-04-light-intake",
              source_record_id:
                `${references.intake_id}:timeline`,
              captured_via:
                "FORGE_SYSTEM",
              evidence_references: [
                `${references.intake_id}:timeline-evidence`,
              ],
            },
            confirmation_state:
              "CONFIRMED",
          });

      const profile =
        canonicalEventContract
          .createCanonicalActivityEvent({
            ...common,
            event_type:
              "PROSPECT_PROFILE_CREATED",
            actor: {
              type: "ADVISOR",
              id: advisorId,
            },
            source: {
              type: "ADVISOR_CONFIRMED",
              reference:
                `${references.intake_id}:profile`,
              channel: "FORGE_UI",
            },
            evidence_strength:
              "HUMAN_CONFIRMED",
            recorded_at:
              addMilliseconds(recordedAt, 1),
            causation_id:
              timeline.event_id,
            idempotency_key:
              `${submissionReference}:profile`,
            payload: {
              profile_reference:
                references.profile_reference,
            },
            provenance: {
              source_system:
                "fes-04-light-intake",
              source_record_id:
                `${references.intake_id}:profile`,
              captured_via: "FORGE_UI",
              evidence_references: [
                `${references.intake_id}:profile-evidence`,
              ],
            },
            confirmation_state:
              "CONFIRMED",
          });

      const prospect =
        canonicalEventContract
          .createCanonicalActivityEvent({
            ...common,
            event_type:
              "PROSPECT_CREATED",
            actor: {
              type: "ADVISOR",
              id: advisorId,
            },
            source: {
              type: "ADVISOR_CONFIRMED",
              reference:
                `${references.intake_id}:prospect`,
              channel: "FORGE_UI",
            },
            evidence_strength:
              "HUMAN_CONFIRMED",
            recorded_at:
              addMilliseconds(recordedAt, 2),
            causation_id:
              profile.event_id,
            idempotency_key:
              `${submissionReference}:prospect`,
            payload: {
              prospect_reference:
                references
                  .prospect_reference,
              source_category:
                sourceCategory,
            },
            provenance: {
              source_system:
                "fes-04-light-intake",
              source_record_id:
                `${references.intake_id}:prospect`,
              captured_via: "FORGE_UI",
              evidence_references: [
                `${references.intake_id}:prospect-evidence`,
              ],
            },
            confirmation_state:
              "CONFIRMED",
          });

      const context =
        canonicalEventContract
          .createCanonicalActivityEvent({
            ...common,
            event_type:
              "INITIAL_CONTEXT_CAPTURED",
            actor: {
              type: "ADVISOR",
              id: advisorId,
            },
            source: {
              type: "ADVISOR_REPORTED",
              reference:
                `${references.intake_id}:context`,
              channel: "FORGE_UI",
            },
            evidence_strength: "REPORTED",
            recorded_at:
              addMilliseconds(recordedAt, 3),
            causation_id:
              prospect.event_id,
            idempotency_key:
              `${submissionReference}:context`,
            payload: {
              context_reference:
                references
                  .context_reference,
              capture_mode: captureMode,
            },
            provenance: {
              source_system:
                "fes-04-light-intake",
              source_record_id:
                `${references.intake_id}:context`,
              captured_via: "FORGE_UI",
              evidence_references: [
                `${references.intake_id}:context-evidence`,
              ],
            },
            confirmation_state: "REPORTED",
          });

      return {
        event_zero_version:
          EVENT_ZERO_VERSION,
        atomic: true,
        event_types: [
          ...EVENT_ZERO_TYPES,
        ],
        events: [
          timeline,
          profile,
          prospect,
          context,
        ],
        persistence_state:
          "NOT_PERSISTED_BY_CONTRACT",
      };
    }

    function buildLightProspectIntake(
      input = {},
    ) {
      assertAllowedKeys(
        input,
        [
          "submission_reference",
          "tenant_id",
          "advisor_id",
          "source_category",
          "full_name",
          "contact",
          "initial_context",
          "referral",
          "optional_profile",
          "extracted_candidates",
          "candidate_decisions",
          "occurred_at",
          "recorded_at",
        ],
        "LIGHT_INTAKE_FIELDS_INVALID",
        "La captura ligera",
      );

      assertRequiredKeys(
        input,
        [
          "submission_reference",
          "tenant_id",
          "advisor_id",
          "source_category",
          "full_name",
          "contact",
          "initial_context",
          "occurred_at",
          "recorded_at",
        ],
        "LIGHT_INTAKE_FIELDS_REQUIRED",
        "La captura ligera",
      );

      const forbiddenPresent =
        FORBIDDEN_INTAKE_FIELDS.filter(
          field =>
            Object.prototype.hasOwnProperty.call(
              input,
              field,
            ),
        );

      if (forbiddenPresent.length > 0) {
        error(
          "LIGHT_INTAKE_FORBIDDEN_FIELDS",
          "La captura contiene campos retirados.",
          {
            forbidden_fields:
              forbiddenPresent,
          },
        );
      }

      const submissionReference =
        requireOpaque(
          input.submission_reference,
          "LIGHT_INTAKE_SUBMISSION_REFERENCE_INVALID",
          "La referencia de captura",
        );
      const tenantId = requireOpaque(
        input.tenant_id,
        "LIGHT_INTAKE_TENANT_INVALID",
        "El tenant",
      );
      const advisorId = requireOpaque(
        input.advisor_id,
        "LIGHT_INTAKE_ADVISOR_INVALID",
        "El asesor",
      );
      const sourceCategory =
        requireOpaque(
          input.source_category,
          "LIGHT_INTAKE_SOURCE_INVALID",
          "La fuente",
        ).toUpperCase();
      const fullName = requireText(
        input.full_name,
        "LIGHT_INTAKE_FULL_NAME_INVALID",
        "El nombre",
        {
          minimum: 2,
          maximum: 160,
        },
      );
      const occurredAt = requireIso(
        input.occurred_at,
        "LIGHT_INTAKE_OCCURRED_AT_INVALID",
        "La fecha de ocurrencia",
      );
      const recordedAt = requireIso(
        input.recorded_at,
        "LIGHT_INTAKE_RECORDED_AT_INVALID",
        "La fecha de registro",
      );

      assertAllowedKeys(
        input.contact,
        [
          "phone",
          "whatsapp",
        ],
        "LIGHT_INTAKE_CONTACT_FIELDS_INVALID",
        "El contacto",
      );

      const phone = normalizeContactValue(
        input.contact.phone,
        "LIGHT_INTAKE_PHONE_INVALID",
        "El teléfono",
      );
      const whatsapp =
        normalizeContactValue(
          input.contact.whatsapp,
          "LIGHT_INTAKE_WHATSAPP_INVALID",
          "El WhatsApp",
        );

      if (!phone && !whatsapp) {
        error(
          "LIGHT_INTAKE_CONTACT_REQUIRED",
          "Se requiere teléfono o WhatsApp.",
        );
      }

      assertAllowedKeys(
        input.initial_context,
        [
          "capture_mode",
          "content",
        ],
        "LIGHT_INTAKE_CONTEXT_FIELDS_INVALID",
        "El contexto inicial",
      );

      assertRequiredKeys(
        input.initial_context,
        [
          "capture_mode",
          "content",
        ],
        "LIGHT_INTAKE_CONTEXT_FIELDS_REQUIRED",
        "El contexto inicial",
      );

      const captureMode = String(
        input.initial_context.capture_mode ||
          "",
      ).trim();

      if (
        !CAPTURE_MODES.includes(captureMode)
      ) {
        error(
          "LIGHT_INTAKE_CAPTURE_MODE_INVALID",
          "El modo de captura no es válido.",
          {
            allowed_values: [
              ...CAPTURE_MODES,
            ],
          },
        );
      }

      const contextContent = requireText(
        input.initial_context.content,
        "LIGHT_INTAKE_CONTEXT_CONTENT_INVALID",
        "El contexto inicial",
        {
          minimum: 3,
          maximum: 4000,
        },
      );

      const optionalInput =
        input.optional_profile || {};

      assertAllowedKeys(
        optionalInput,
        [
          "email",
          "date_of_birth",
          "occupation",
        ],
        "LIGHT_INTAKE_OPTIONAL_FIELDS_INVALID",
        "Los datos opcionales",
      );

      const optionalProfile = {
        email: normalizeEmail(
          optionalInput.email,
        ),
        date_of_birth:
          normalizeDateOfBirth(
            optionalInput.date_of_birth,
          ),
        occupation: optionalText(
          optionalInput.occupation,
          "LIGHT_INTAKE_OCCUPATION_INVALID",
          "La ocupación",
          {
            minimum: 2,
            maximum: 160,
          },
        ),
      };

      let referral = null;

      if (
        input.referral !== undefined &&
        input.referral !== null
      ) {
        assertAllowedKeys(
          input.referral,
          [
            "referred_by",
            "relationship_to_referrer",
          ],
          "LIGHT_INTAKE_REFERRAL_FIELDS_INVALID",
          "Los datos del referido",
        );

        referral = {
          referred_by: optionalText(
            input.referral.referred_by,
            "LIGHT_INTAKE_REFERRER_INVALID",
            "La persona referidora",
            {
              minimum: 2,
              maximum: 160,
            },
          ),
          relationship_to_referrer:
            optionalText(
              input.referral
                .relationship_to_referrer,
              "LIGHT_INTAKE_REFERRER_RELATIONSHIP_INVALID",
              "La relación con quien refiere",
              {
                minimum: 2,
                maximum: 160,
              },
            ),
        };
      }

      if (
        sourceCategory !== "REFERRAL" &&
        referral &&
        (
          referral.referred_by ||
          referral
            .relationship_to_referrer
        )
      ) {
        error(
          "LIGHT_INTAKE_NON_REFERRAL_DATA_FORBIDDEN",
          "Los datos de referido requieren fuente REFERRAL.",
        );
      }

      const candidates = normalizeCandidates(
        input.extracted_candidates,
        input.candidate_decisions,
      );

      const applied = applyCandidates({
        sourceCategory,
        optionalProfile,
        referral,
        candidates,
      });

      if (sourceCategory === "REFERRAL") {
        if (
          !applied.promoted.referred_by ||
          !applied.promoted
            .relationship_to_referrer
        ) {
          error(
            "LIGHT_INTAKE_REFERRAL_REQUIRED",
            "Un referido requiere quién refiere y relación.",
          );
        }

        referral = {
          referred_by:
            applied.promoted.referred_by,
          relationship_to_referrer:
            applied.promoted
              .relationship_to_referrer,
        };
      } else {
        referral = null;
      }

      const references = deriveReferences({
        tenantId,
        submissionReference,
      });

      const eventZero = createEventZero({
        tenantId,
        advisorId,
        sourceCategory,
        captureMode,
        occurredAt,
        recordedAt,
        submissionReference,
        references,
      });

      const pendingCount =
        applied.review.filter(
          candidate =>
            candidate.decision === "PENDING",
        ).length;
      const acceptedCount =
        applied.review.filter(
          candidate =>
            candidate.decision === "ACCEPTED",
        ).length;
      const rejectedCount =
        applied.review.filter(
          candidate =>
            candidate.decision === "REJECTED",
        ).length;

      const digestInput = {
        intake_version: INTAKE_VERSION,
        intake_id: references.intake_id,
        submission_reference:
          submissionReference,
        tenant_id: tenantId,
        advisor_id: advisorId,
        profile_draft: {
          state: "CONFIRMED_INPUT",
          prospect_reference:
            references.prospect_reference,
          profile_reference:
            references.profile_reference,
          full_name: fullName,
          contact: {
            phone,
            whatsapp,
          },
          source_category:
            sourceCategory,
          referral,
          optional: {
            email:
              applied.promoted.email,
            date_of_birth:
              applied.promoted
                .date_of_birth,
            occupation:
              applied.promoted.occupation,
          },
          privacy_class: "SENSITIVE",
        },
        context_draft: {
          state: "REPORTED_REVIEWABLE",
          context_reference:
            references.context_reference,
          capture_mode: captureMode,
          content: contextContent,
          privacy_class: "PRIVATE",
        },
        candidate_review: {
          state:
            pendingCount > 0
              ? "PENDING_CONFIRMATION"
              : "RESOLVED",
          pending_count: pendingCount,
          accepted_count: acceptedCount,
          rejected_count: rejectedCount,
          candidates: applied.review,
        },
        event_zero: eventZero,
        persistence_state:
          "READY_FOR_ATOMIC_PERSISTENCE",
        productive_ui_binding: false,
      };

      return {
        ...digestInput,
        intake_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeIntake(
      input,
      source,
      {
        requireCanonicalShape = false,
      } = {},
    ) {
      assertAllowedKeys(
        input,
        INTAKE_KEYS,
        "LIGHT_INTAKE_OUTPUT_FIELDS_INVALID",
        "La captura ligera proyectada",
      );

      assertRequiredKeys(
        input,
        INTAKE_KEYS,
        "LIGHT_INTAKE_OUTPUT_FIELDS_REQUIRED",
        "La captura ligera proyectada",
      );

      const normalized =
        buildLightProspectIntake(source);

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "LIGHT_INTAKE_NOT_CANONICAL",
          "La captura no coincide con su fuente.",
        );
      }

      return normalized;
    }

    function createLightProspectIntake(
      input = {},
    ) {
      return deepFreeze(
        buildLightProspectIntake(
          clone(input),
        ),
      );
    }

    function assertLightProspectIntake(
      intake,
      source = {},
    ) {
      return deepFreeze(
        normalizeIntake(
          clone(intake),
          clone(source),
          {
            requireCanonicalShape: true,
          },
        ),
      );
    }

    function validateLightProspectIntake(
      intake,
      source = {},
    ) {
      try {
        assertLightProspectIntake(
          intake,
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
                  : "LIGHT_INTAKE_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La captura ligera no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildLightProspectIntake({
      intake,
      source,
    } = {}) {
      assertLightProspectIntake(
        intake,
        source,
      );

      return createLightProspectIntake(
        source,
      );
    }

    return deepFreeze({
      CONTRACT_VERSION,
      INTAKE_VERSION,
      EVENT_ZERO_VERSION,
      CAPTURE_MODES,
      CANDIDATE_FIELDS,
      CANDIDATE_DECISIONS,
      EVENT_ZERO_TYPES,
      FORBIDDEN_INTAKE_FIELDS,
      LightProspectIntakeError,
      createLightProspectIntake,
      assertLightProspectIntake,
      validateLightProspectIntake,
      rebuildLightProspectIntake,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        normalizeCandidates,
        applyCandidates,
        deriveReferences,
        createEventZero,
        buildLightProspectIntake,
        deepFreeze,
      }),
    });
  },
);
