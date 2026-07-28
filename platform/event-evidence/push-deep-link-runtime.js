"use strict";

(function pushDeepLinkRuntimeModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgePushDeepLinkRuntimeFES07B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function pushDeepLinkRuntimeFactory() {
    const RUNTIME_VERSION = "FES-07B.1";
    const INTENT_SCHEMA =
      "forge.notification_intent.v1";
    const TARGET_SCHEMA =
      "forge.internal_deep_link_target.v1";
    const QUEUE_SCHEMA =
      "forge.notification_intent_queue.v1";

    const TARGET_TYPES = Object.freeze([
      "ACTIVITY",
      "PROSPECT_DETAIL",
      "PIPELINE_CARD",
      "MI_DIA",
      "SEGUIMIENTO",
    ]);

    const PERMISSION_STATES = Object.freeze([
      "DEFAULT",
      "DENIED",
      "GRANTED",
      "UNAVAILABLE",
    ]);

    const SUBSCRIPTION_STATES = Object.freeze([
      "REGISTERED",
      "UNREGISTERED",
      "UNAVAILABLE",
    ]);

    const ATTEMPT_OUTCOMES = Object.freeze([
      "ADAPTER_UNAVAILABLE",
      "PERMISSION_UNAVAILABLE",
      "SUBSCRIPTION_UNAVAILABLE",
      "TARGET_UNRESOLVED",
    ]);

    const FORBIDDEN_RAW_KEYS = Object.freeze([
      "name",
      "full_name",
      "phone",
      "telephone",
      "whatsapp",
      "email",
      "note",
      "notes",
      "text",
      "body",
      "content",
      "message",
      "transcript",
      "token",
      "secret",
      "credential",
      "credentials",
      "endpoint",
      "provider_token",
    ]);

    const TARGET_KEYS = Object.freeze([
      "target_schema",
      "target_id",
      "tenant_id",
      "target_type",
      "resource_reference",
    ]);

    const INTENT_KEYS = Object.freeze([
      "intent_schema",
      "intent_id",
      "tenant_id",
      "actor_id",
      "created_at",
      "scheduled_for",
      "timezone",
      "deduplication_key",
      "cancellation_key",
      "target",
      "payload_references",
      "permission_state",
      "subscription_state",
      "max_attempts",
    ]);

    class PushDeepLinkRuntimeError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "PushDeepLinkRuntimeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new PushDeepLinkRuntimeError(
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

      const prototype =
        Object.getPrototypeOf(value);

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

        for (
          const key
          of Object.keys(value).sort()
        ) {
          result[key] =
            stableValue(value[key]);
        }

        return result;
      }

      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(
        stableValue(value),
      );
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

      return [
        2166136261,
        2166136261 ^ 0x9e3779b9,
        2166136261 ^ 0x85ebca6b,
        2166136261 ^ 0xc2b2ae35,
      ]
        .map(seed => fnv1a32(text, seed))
        .join("");
    }

    function assertPlainObject(
      value,
      code,
      label,
    ) {
      if (!isPlainObject(value)) {
        error(
          code,
          `${label} debe ser un objeto.`,
        );
      }
    }

    function scanForbiddenKeys(
      value,
      path = "$",
    ) {
      if (Array.isArray(value)) {
        value.forEach(
          (item, index) =>
            scanForbiddenKeys(
              item,
              `${path}[${index}]`,
            ),
        );
        return;
      }

      if (!isPlainObject(value)) {
        return;
      }

      for (
        const [key, nested]
        of Object.entries(value)
      ) {
        const normalized =
          key.trim().toLowerCase();

        if (
          FORBIDDEN_RAW_KEYS.includes(
            normalized,
          )
        ) {
          error(
            "FES07B_RAW_PRIVATE_CONTENT_FORBIDDEN",
            "El runtime no acepta contenido privado crudo.",
            {
              key,
              path: `${path}.${key}`,
            },
          );
        }

        scanForbiddenKeys(
          nested,
          `${path}.${key}`,
        );
      }
    }

    function assertAllowedKeys(
      value,
      allowed,
      code,
      label,
    ) {
      assertPlainObject(
        value,
        code,
        label,
      );

      const unsupported =
        Object.keys(value)
          .filter(
            key => !allowed.includes(key),
          )
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
      maximum = 240,
    ) {
      const normalized =
        String(value || "").trim();

      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/+ -]*$/
          .test(normalized)
      ) {
        error(
          code,
          `${label} no es válido.`,
        );
      }

      return normalized;
    }

    function requireIso(
      value,
      code,
      label,
    ) {
      if (
        typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value))
      ) {
        error(
          code,
          `${label} no es válido.`,
        );
      }

      return new Date(value)
        .toISOString();
    }

    function requireEnum(
      value,
      allowed,
      code,
      label,
    ) {
      const normalized =
        String(value || "")
          .trim()
          .toUpperCase();

      if (!allowed.includes(normalized)) {
        error(
          code,
          `${label} no está permitido.`,
          {
            allowed: [...allowed],
            received: normalized,
          },
        );
      }

      return normalized;
    }

    function requireTimezone(value) {
      const normalized =
        String(value || "").trim();

      if (
        normalized !== "UTC" &&
        !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)+$/
          .test(normalized)
      ) {
        error(
          "FES07B_TIMEZONE_INVALID",
          "La zona horaria no es válida.",
        );
      }

      return normalized;
    }

    function normalizeReferences(input) {
      if (
        !Array.isArray(input) ||
        input.length === 0 ||
        input.length > 12
      ) {
        error(
          "FES07B_PAYLOAD_REFERENCES_INVALID",
          "Las referencias deben contener entre 1 y 12 elementos.",
        );
      }

      const normalized =
        input.map((value, index) =>
          requireOpaque(
            value,
            "FES07B_PAYLOAD_REFERENCE_INVALID",
            `payload_references[${index}]`,
          ),
        );

      if (
        new Set(normalized).size !==
        normalized.length
      ) {
        error(
          "FES07B_PAYLOAD_REFERENCE_DUPLICATE",
          "Las referencias no pueden repetirse.",
        );
      }

      return normalized.sort();
    }

    function createPermissionExplanation(input) {
      scanForbiddenKeys(input);
      assertAllowedKeys(
        input,
        ["capability_reference"],
        "FES07B_PERMISSION_EXPLANATION_INVALID",
        "La explicación de permiso",
      );

      return deepFreeze({
        runtime_version: RUNTIME_VERSION,
        capability_reference:
          requireOpaque(
            input.capability_reference,
            "FES07B_CAPABILITY_REFERENCE_INVALID",
            "capability_reference",
          ),
        explanation_required: true,
        explicit_user_gesture_required: true,
        automatic_prompt: false,
        permission_prompt_executed: false,
        coercive_repeat_allowed: false,
      });
    }

    function createDeepLinkTarget(input) {
      scanForbiddenKeys(input);
      assertAllowedKeys(
        input,
        TARGET_KEYS,
        "FES07B_TARGET_FIELDS_INVALID",
        "El destino interno",
      );

      const target = {
        target_schema:
          input.target_schema === undefined
            ? TARGET_SCHEMA
            : requireOpaque(
                input.target_schema,
                "FES07B_TARGET_SCHEMA_INVALID",
                "target_schema",
              ),
        target_id:
          requireOpaque(
            input.target_id,
            "FES07B_TARGET_ID_INVALID",
            "target_id",
          ),
        tenant_id:
          requireOpaque(
            input.tenant_id,
            "FES07B_TARGET_TENANT_INVALID",
            "tenant_id",
          ),
        target_type:
          requireEnum(
            input.target_type,
            TARGET_TYPES,
            "FES07B_TARGET_TYPE_INVALID",
            "target_type",
          ),
        resource_reference:
          requireOpaque(
            input.resource_reference,
            "FES07B_RESOURCE_REFERENCE_INVALID",
            "resource_reference",
          ),
      };

      if (
        target.target_schema !==
        TARGET_SCHEMA
      ) {
        error(
          "FES07B_TARGET_SCHEMA_UNSUPPORTED",
          "El esquema del destino no está soportado.",
        );
      }

      return deepFreeze({
        ...target,
        target_digest:
          stableDigest(target),
      });
    }

    function resolveInternalTarget(input) {
      const target =
        createDeepLinkTarget(input);

      const navigationByType = {
        ACTIVITY: "ACTIVITY",
        PROSPECT_DETAIL:
          "PROSPECT_DETAIL",
        PIPELINE_CARD: "PIPELINE",
        MI_DIA: "MI_DIA",
        SEGUIMIENTO: "SEGUIMIENTO",
      };

      return deepFreeze({
        runtime_version: RUNTIME_VERSION,
        navigation_mode: "INTERNAL_ONLY",
        navigation_target:
          navigationByType[
            target.target_type
          ],
        tenant_id: target.tenant_id,
        resource_reference:
          target.resource_reference,
        target_digest:
          target.target_digest,
        arbitrary_external_url_allowed:
          false,
        browser_navigation_executed:
          false,
        canonical_truth_mutation:
          false,
      });
    }

    function createNotificationIntent(input) {
      scanForbiddenKeys(input);
      assertAllowedKeys(
        input,
        INTENT_KEYS,
        "FES07B_INTENT_FIELDS_INVALID",
        "La intención de notificación",
      );

      const createdAt =
        requireIso(
          input.created_at,
          "FES07B_CREATED_AT_INVALID",
          "created_at",
        );
      const scheduledFor =
        requireIso(
          input.scheduled_for,
          "FES07B_SCHEDULED_FOR_INVALID",
          "scheduled_for",
        );

      if (
        Date.parse(scheduledFor) <
        Date.parse(createdAt)
      ) {
        error(
          "FES07B_SCHEDULE_BEFORE_CREATION",
          "La ejecución no puede anteceder a la creación.",
        );
      }

      const tenantId =
        requireOpaque(
          input.tenant_id,
          "FES07B_TENANT_INVALID",
          "tenant_id",
        );
      const target =
        createDeepLinkTarget(
          input.target,
        );

      if (
        target.tenant_id !==
        tenantId
      ) {
        error(
          "FES07B_TARGET_TENANT_MISMATCH",
          "El destino pertenece a otro tenant.",
        );
      }

      const maxAttempts =
        Number(input.max_attempts);

      if (
        !Number.isInteger(maxAttempts) ||
        maxAttempts < 1 ||
        maxAttempts > 5
      ) {
        error(
          "FES07B_MAX_ATTEMPTS_INVALID",
          "max_attempts debe estar entre 1 y 5.",
        );
      }

      const permissionState =
        requireEnum(
          input.permission_state,
          PERMISSION_STATES,
          "FES07B_PERMISSION_STATE_INVALID",
          "permission_state",
        );
      const subscriptionState =
        requireEnum(
          input.subscription_state,
          SUBSCRIPTION_STATES,
          "FES07B_SUBSCRIPTION_STATE_INVALID",
          "subscription_state",
        );

      const ready =
        permissionState === "GRANTED" &&
        subscriptionState ===
          "REGISTERED";

      const base = {
        intent_schema:
          input.intent_schema === undefined
            ? INTENT_SCHEMA
            : requireOpaque(
                input.intent_schema,
                "FES07B_INTENT_SCHEMA_INVALID",
                "intent_schema",
              ),
        intent_id:
          requireOpaque(
            input.intent_id,
            "FES07B_INTENT_ID_INVALID",
            "intent_id",
          ),
        tenant_id: tenantId,
        actor_id:
          requireOpaque(
            input.actor_id,
            "FES07B_ACTOR_ID_INVALID",
            "actor_id",
          ),
        created_at: createdAt,
        scheduled_for: scheduledFor,
        timezone:
          requireTimezone(
            input.timezone,
          ),
        deduplication_key:
          requireOpaque(
            input.deduplication_key,
            "FES07B_DEDUPLICATION_KEY_INVALID",
            "deduplication_key",
          ),
        cancellation_key:
          requireOpaque(
            input.cancellation_key,
            "FES07B_CANCELLATION_KEY_INVALID",
            "cancellation_key",
          ),
        target,
        payload_references:
          normalizeReferences(
            input.payload_references,
          ),
        permission_state:
          permissionState,
        subscription_state:
          subscriptionState,
        max_attempts: maxAttempts,
        attempt_count: 0,
        attempts: [],
        state:
          ready
            ? "READY_FOR_PROVIDER_ADAPTER"
            : "INTERNAL_FALLBACK_PENDING",
        push_execution: false,
        permission_prompt_execution:
          false,
        subscription_registration:
          false,
        external_provider_call: false,
        delivery_claimed: false,
      };

      if (
        base.intent_schema !==
        INTENT_SCHEMA
      ) {
        error(
          "FES07B_INTENT_SCHEMA_UNSUPPORTED",
          "El esquema de intención no está soportado.",
        );
      }

      return deepFreeze({
        ...base,
        intent_digest:
          stableDigest(base),
      });
    }

    function assertIntent(value) {
      assertPlainObject(
        value,
        "FES07B_INTENT_INVALID",
        "La intención",
      );

      const suppliedDigest =
        requireOpaque(
          value.intent_digest,
          "FES07B_INTENT_DIGEST_INVALID",
          "intent_digest",
        );

      const digestSource =
        clone(value);

      delete digestSource.intent_digest;

      if (
        stableDigest(digestSource) !==
        suppliedDigest
      ) {
        error(
          "FES07B_INTENT_DIGEST_MISMATCH",
          "La intención fue alterada.",
        );
      }

      const rebuilt =
        createNotificationIntent({
          intent_schema:
            value.intent_schema,
          intent_id:
            value.intent_id,
          tenant_id:
            value.tenant_id,
          actor_id:
            value.actor_id,
          created_at:
            value.created_at,
          scheduled_for:
            value.scheduled_for,
          timezone:
            value.timezone,
          deduplication_key:
            value.deduplication_key,
          cancellation_key:
            value.cancellation_key,
          target: {
            target_schema:
              value.target
                ?.target_schema,
            target_id:
              value.target
                ?.target_id,
            tenant_id:
              value.target
                ?.tenant_id,
            target_type:
              value.target
                ?.target_type,
            resource_reference:
              value.target
                ?.resource_reference,
          },
          payload_references:
            value.payload_references,
          permission_state:
            value.permission_state,
          subscription_state:
            value.subscription_state,
          max_attempts:
            value.max_attempts,
        });

      const coreKeys = [
        "intent_schema",
        "intent_id",
        "tenant_id",
        "actor_id",
        "created_at",
        "scheduled_for",
        "timezone",
        "deduplication_key",
        "cancellation_key",
        "target",
        "payload_references",
        "permission_state",
        "subscription_state",
        "max_attempts",
        "push_execution",
        "permission_prompt_execution",
        "subscription_registration",
        "external_provider_call",
        "delivery_claimed",
      ];

      for (const key of coreKeys) {
        if (
          stableStringify(value[key]) !==
          stableStringify(rebuilt[key])
        ) {
          error(
            "FES07B_INTENT_CORE_MISMATCH",
            "La intención contiene un campo base inválido.",
            { key },
          );
        }
      }

      if (
        !Number.isInteger(
          value.attempt_count,
        ) ||
        value.attempt_count < 0 ||
        value.attempt_count >
          value.max_attempts
      ) {
        error(
          "FES07B_ATTEMPT_COUNT_INVALID",
          "El contador de intentos no es válido.",
        );
      }

      if (
        !Array.isArray(value.attempts) ||
        value.attempts.length !==
          value.attempt_count
      ) {
        error(
          "FES07B_ATTEMPTS_INVALID",
          "Los intentos no coinciden con el contador.",
        );
      }

      const allowedStates = [
        "READY_FOR_PROVIDER_ADAPTER",
        "INTERNAL_FALLBACK_PENDING",
        "RETRY_PENDING",
        "INTERNAL_FALLBACK_REQUIRED",
        "CANCELLED",
      ];

      if (!allowedStates.includes(value.state)) {
        error(
          "FES07B_INTENT_STATE_INVALID",
          "El estado de la intención no es válido.",
        );
      }

      for (const attempt of value.attempts) {
        assertAllowedKeys(
          attempt,
          [
            "attempt_id",
            "attempted_at",
            "outcome",
            "external_provider_call",
            "delivery_claimed",
          ],
          "FES07B_ATTEMPT_FIELDS_INVALID",
          "El intento local",
        );

        requireOpaque(
          attempt.attempt_id,
          "FES07B_ATTEMPT_ID_INVALID",
          "attempt_id",
        );

        requireIso(
          attempt.attempted_at,
          "FES07B_ATTEMPTED_AT_INVALID",
          "attempted_at",
        );

        requireEnum(
          attempt.outcome,
          ATTEMPT_OUTCOMES,
          "FES07B_ATTEMPT_OUTCOME_INVALID",
          "outcome",
        );

        if (
          attempt.external_provider_call !== false ||
          attempt.delivery_claimed !== false
        ) {
          error(
            "FES07B_ATTEMPT_EXTERNAL_CLAIM_FORBIDDEN",
            "Un intento local no puede afirmar entrega externa.",
          );
        }
      }

      if (value.state === "CANCELLED") {
        requireIso(
          value.cancelled_at,
          "FES07B_CANCELLED_AT_INVALID",
          "cancelled_at",
        );
      } else if (
        value.cancelled_at !== undefined
      ) {
        error(
          "FES07B_UNEXPECTED_CANCELLATION_TIMESTAMP",
          "Una intención activa no puede tener fecha de cancelación.",
        );
      }

      return value;
    }

    function compareIntents(left, right) {
      return (
        left.scheduled_for.localeCompare(
          right.scheduled_for,
        ) ||
        left.created_at.localeCompare(
          right.created_at,
        ) ||
        left.intent_id.localeCompare(
          right.intent_id,
        )
      );
    }

    function createIntentQueue(input) {
      if (!Array.isArray(input)) {
        error(
          "FES07B_QUEUE_INPUT_INVALID",
          "La cola requiere una lista.",
        );
      }

      const byKey =
        new Map();
      let replayCount = 0;

      for (const candidate of input) {
        const intent =
          assertIntent(candidate);
        const existing =
          byKey.get(
            intent.deduplication_key,
          );

        if (!existing) {
          byKey.set(
            intent.deduplication_key,
            intent,
          );
          continue;
        }

        if (
          existing.intent_digest ===
          intent.intent_digest
        ) {
          replayCount += 1;
          continue;
        }

        error(
          "FES07B_DEDUPLICATION_CONFLICT",
          "La misma identidad contiene información distinta.",
          {
            deduplication_key:
              intent.deduplication_key,
          },
        );
      }

      const intents =
        [...byKey.values()]
          .sort(compareIntents);

      const tenants =
        [...new Set(
          intents.map(
            intent => intent.tenant_id,
          ),
        )];

      if (tenants.length > 1) {
        error(
          "FES07B_QUEUE_TENANT_MIXED",
          "Una cola no puede mezclar tenants.",
        );
      }

      const base = {
        queue_schema: QUEUE_SCHEMA,
        tenant_id:
          tenants[0] || null,
        intent_count:
          intents.length,
        idempotent_replay_count:
          replayCount,
        intents,
        push_execution: false,
        external_provider_call: false,
        delivery_claimed: false,
      };

      return deepFreeze({
        ...base,
        queue_digest:
          stableDigest(base),
      });
    }

    function registerLocalAttempt(
      intentInput,
      attemptInput,
    ) {
      const intent =
        assertIntent(intentInput);

      scanForbiddenKeys(
        attemptInput,
      );
      assertAllowedKeys(
        attemptInput,
        [
          "attempt_id",
          "attempted_at",
          "outcome",
        ],
        "FES07B_ATTEMPT_FIELDS_INVALID",
        "El intento local",
      );

      if (
        intent.state === "CANCELLED"
      ) {
        error(
          "FES07B_CANCELLED_INTENT_ATTEMPT",
          "Una intención cancelada no admite intentos.",
        );
      }

      if (
        intent.attempt_count >=
        intent.max_attempts
      ) {
        error(
          "FES07B_RETRY_LIMIT_REACHED",
          "La intención alcanzó su límite de intentos.",
        );
      }

      const attempt = {
        attempt_id:
          requireOpaque(
            attemptInput.attempt_id,
            "FES07B_ATTEMPT_ID_INVALID",
            "attempt_id",
          ),
        attempted_at:
          requireIso(
            attemptInput.attempted_at,
            "FES07B_ATTEMPTED_AT_INVALID",
            "attempted_at",
          ),
        outcome:
          requireEnum(
            attemptInput.outcome,
            ATTEMPT_OUTCOMES,
            "FES07B_ATTEMPT_OUTCOME_INVALID",
            "outcome",
          ),
        external_provider_call:
          false,
        delivery_claimed: false,
      };

      const attemptCount =
        intent.attempt_count + 1;
      const state =
        attemptCount >=
        intent.max_attempts
          ? "INTERNAL_FALLBACK_REQUIRED"
          : "RETRY_PENDING";

      const updated = {
        ...clone(intent),
        attempt_count: attemptCount,
        attempts: [
          ...clone(intent.attempts),
          attempt,
        ],
        state,
        external_provider_call: false,
        delivery_claimed: false,
      };

      delete updated.intent_digest;

      return deepFreeze({
        ...updated,
        intent_digest:
          stableDigest(updated),
      });
    }

    function cancelIntent(
      intentInput,
      cancellationKey,
      cancelledAt,
    ) {
      const intent =
        assertIntent(intentInput);
      const normalizedKey =
        requireOpaque(
          cancellationKey,
          "FES07B_CANCELLATION_KEY_INVALID",
          "cancellation_key",
        );

      if (
        normalizedKey !==
        intent.cancellation_key
      ) {
        error(
          "FES07B_CANCELLATION_KEY_MISMATCH",
          "La clave de cancelación no coincide.",
        );
      }

      const updated = {
        ...clone(intent),
        state: "CANCELLED",
        cancelled_at:
          requireIso(
            cancelledAt,
            "FES07B_CANCELLED_AT_INVALID",
            "cancelled_at",
          ),
        external_provider_call: false,
        delivery_claimed: false,
      };

      delete updated.intent_digest;

      return deepFreeze({
        ...updated,
        intent_digest:
          stableDigest(updated),
      });
    }

    return deepFreeze({
      RUNTIME_VERSION,
      INTENT_SCHEMA,
      TARGET_SCHEMA,
      QUEUE_SCHEMA,
      TARGET_TYPES,
      PERMISSION_STATES,
      SUBSCRIPTION_STATES,
      ATTEMPT_OUTCOMES,
      PushDeepLinkRuntimeError,
      stableDigest,
      createPermissionExplanation,
      createDeepLinkTarget,
      resolveInternalTarget,
      createNotificationIntent,
      assertIntent,
      createIntentQueue,
      registerLocalAttempt,
      cancelIntent,
    });
  },
);
