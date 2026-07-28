"use strict";

(function miDiaProjectionModule(root, factory) {
  const pipelineCardProjection =
    typeof module !== "undefined" && module.exports
      ? require("./pipeline-card-projection")
      : root.ForgePipelineCardProjectionFES03E;

  const api = factory(pipelineCardProjection);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeMiDiaProjectionFES03F = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function miDiaProjectionFactory(
    pipelineCardProjection,
  ) {
    if (!pipelineCardProjection) {
      throw new Error(
        "FES03E_PIPELINE_CARD_PROJECTION_REQUIRED",
      );
    }

    const PROJECTION_CONTRACT_VERSION = "FES-03F.1";
    const PROJECTION_VERSION =
      "forge.mi_dia_projection.v1";
    const WORK_ITEM_VERSION =
      "forge.mi_dia_work_item.v1";
    const MAX_TIMELINES = 500;
    const MAX_WORK_ITEMS = 1000;

    const ACTION_CODES = Object.freeze([
      "RESOLVE_CONFLICT",
      "CONFIRM_APPOINTMENT_OUTCOME",
      "PERFORM_DUE_FOLLOW_UP",
      "REVIEW_PENDING_CONFIRMATION",
      "ADD_OPTIONAL_CONTEXT",
    ]);

    const ACTION_PRESENTATION = Object.freeze({
      RESOLVE_CONFLICT: Object.freeze({
        label: "Resolver conflicto",
        required: true,
        priority: 0,
      }),
      CONFIRM_APPOINTMENT_OUTCOME: Object.freeze({
        label: "Confirmar resultado de cita",
        required: true,
        priority: 1,
      }),
      PERFORM_DUE_FOLLOW_UP: Object.freeze({
        label: "Realizar seguimiento",
        required: true,
        priority: 2,
      }),
      REVIEW_PENDING_CONFIRMATION: Object.freeze({
        label: "Revisar evidencia pendiente",
        required: true,
        priority: 3,
      }),
      ADD_OPTIONAL_CONTEXT: Object.freeze({
        label: "Añadir contexto opcional",
        required: false,
        priority: 4,
      }),
    });

    const UNSUPPORTED_SIGNALS = Object.freeze([
      "goal_probability",
      "expected_production",
      "monthly_gap",
      "rescue_probability",
      "close_probability",
      "recommended_product",
      "alfred_generated_recommendation",
      "neglect_age_from_wall_clock",
    ]);

    const PROJECTION_KEYS = Object.freeze([
      "projection_version",
      "projection_id",
      "plan_reference",
      "tenant_id",
      "source_card_version",
      "source_card_count",
      "source_card_digests",
      "ordering",
      "work_item_count",
      "required_count",
      "optional_count",
      "prospect_count",
      "counts_by_action",
      "unsupported_signals",
      "items",
      "projection_digest",
    ]);

    const WORK_ITEM_KEYS = Object.freeze([
      "work_item_version",
      "work_item_id",
      "position",
      "projection_id",
      "tenant_id",
      "prospect_id",
      "action_code",
      "label",
      "required",
      "priority",
      "reason_code",
      "reference",
      "due_at",
      "source_card_id",
      "source_card_digest",
      "source_event_id",
      "stage_code",
      "last_activity_at",
    ]);

    class MiDiaProjectionError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "MiDiaProjectionError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new MiDiaProjectionError(
        code,
        message,
        details,
      );
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
        pipelineCardProjection._private &&
        typeof pipelineCardProjection._private.stableDigest === "function"
      ) {
        return pipelineCardProjection._private.stableDigest(value);
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

    function normalizeTimelines(timelines) {
      if (!Array.isArray(timelines)) {
        error(
          "MI_DIA_TIMELINES_INVALID",
          "Mi Día requiere una lista de timelines.",
        );
      }

      if (timelines.length === 0) {
        error(
          "MI_DIA_TIMELINES_REQUIRED",
          "Mi Día requiere al menos una timeline.",
        );
      }

      if (timelines.length > MAX_TIMELINES) {
        error(
          "MI_DIA_TIMELINE_LIMIT_EXCEEDED",
          "Mi Día excede el límite de timelines.",
          { maximum: MAX_TIMELINES },
        );
      }

      const cards = timelines.map(timeline =>
        pipelineCardProjection.createPipelineCardProjection({
          timeline: clone(timeline),
        }),
      );

      const tenants = [...new Set(
        cards.map(card => card.tenant_id),
      )];

      if (tenants.length !== 1) {
        error(
          "MI_DIA_TENANT_MISMATCH",
          "Mi Día no puede mezclar tenants.",
          { tenant_ids: tenants.sort() },
        );
      }

      const byProspect = new Map();

      for (const card of cards) {
        const existing = byProspect.get(card.prospect_id);

        if (
          existing &&
          existing.source_timeline_digest !==
            card.source_timeline_digest
        ) {
          error(
            "MI_DIA_DUPLICATE_PROSPECT_CONFLICT",
            "El mismo prospecto tiene tarjetas incompatibles.",
            { prospect_id: card.prospect_id },
          );
        }

        byProspect.set(card.prospect_id, card);
      }

      return [...byProspect.values()].sort(
        (left, right) =>
          left.prospect_id.localeCompare(
            right.prospect_id,
          ),
      );
    }

    function deriveMiDiaProjectionId({
      tenant_id,
      plan_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "MI_DIA_TENANT_INVALID",
        "El tenant de Mi Día",
      );
      const planReference = requireOpaque(
        plan_reference,
        "MI_DIA_PLAN_REFERENCE_INVALID",
        "La referencia del plan",
      );

      return `md_${stableDigest({
        tenant_id: tenantId,
        plan_reference: planReference,
        projection_version: PROJECTION_VERSION,
      })}`;
    }

    function deriveWorkItemId({
      projection_id,
      prospect_id,
      action_code,
      reference,
    } = {}) {
      const projectionId = requireOpaque(
        projection_id,
        "MI_DIA_PROJECTION_ID_INVALID",
        "La proyección de Mi Día",
      );
      const prospectId = requireOpaque(
        prospect_id,
        "MI_DIA_PROSPECT_INVALID",
        "El prospecto de Mi Día",
      );
      const actionCode = requireOpaque(
        action_code,
        "MI_DIA_ACTION_INVALID",
        "La acción de Mi Día",
      );
      const normalizedReference = requireOpaque(
        reference,
        "MI_DIA_REFERENCE_INVALID",
        "La referencia de Mi Día",
      );

      return `work_${stableDigest({
        projection_id: projectionId,
        prospect_id: prospectId,
        action_code: actionCode,
        reference: normalizedReference,
      })}`;
    }

    function itemFrom({
      projectionId,
      card,
      actionCode,
      reasonCode,
      reference,
      dueAt = null,
      sourceEventId = null,
    }) {
      const presentation = ACTION_PRESENTATION[actionCode];

      if (!presentation) {
        error(
          "MI_DIA_ACTION_PRESENTATION_MISSING",
          "La acción no tiene presentación autorizada.",
          { action_code: actionCode },
        );
      }

      return {
        work_item_version: WORK_ITEM_VERSION,
        work_item_id: deriveWorkItemId({
          projection_id: projectionId,
          prospect_id: card.prospect_id,
          action_code: actionCode,
          reference,
        }),
        position: 0,
        projection_id: projectionId,
        tenant_id: card.tenant_id,
        prospect_id: card.prospect_id,
        action_code: actionCode,
        label: presentation.label,
        required: presentation.required,
        priority: presentation.priority,
        reason_code: reasonCode,
        reference,
        due_at: dueAt,
        source_card_id: card.projection_id,
        source_card_digest: card.projection_digest,
        source_event_id: sourceEventId,
        stage_code: card.stage.code,
        last_activity_at:
          card.last_activity.occurred_at,
      };
    }

    function itemsForCard(projectionId, card) {
      const items = [];

      if (
        card.conflict.state ===
        "CONFLICT_REVIEW_REQUIRED"
      ) {
        items.push(
          itemFrom({
            projectionId,
            card,
            actionCode: "RESOLVE_CONFLICT",
            reasonCode: "CARD_CONFLICT",
            reference: card.prospect_id,
            sourceEventId:
              card.last_activity.event_id,
          }),
        );

        return items;
      }

      if (
        card.pending_outcome.state ===
        "APPOINTMENT_OUTCOME_PENDING"
      ) {
        items.push(
          itemFrom({
            projectionId,
            card,
            actionCode:
              "CONFIRM_APPOINTMENT_OUTCOME",
            reasonCode:
              card.pending_outcome.reason,
            reference:
              card.pending_outcome
                .appointment_reference,
            sourceEventId:
              card.pending_outcome.event_id,
          }),
        );
      }

      if (card.due_follow_up) {
        items.push(
          itemFrom({
            projectionId,
            card,
            actionCode:
              "PERFORM_DUE_FOLLOW_UP",
            reasonCode:
              "OPEN_DUE_ACTION",
            reference:
              card.due_follow_up
                .due_action_reference,
            dueAt:
              card.due_follow_up.due_at,
            sourceEventId:
              card.due_follow_up
                .latest_event_id,
          }),
        );
      }

      if (
        card.attention_reasons.some(
          reason =>
            reason.code ===
            "PENDING_CONFIRMATION",
        )
      ) {
        items.push(
          itemFrom({
            projectionId,
            card,
            actionCode:
              "REVIEW_PENDING_CONFIRMATION",
            reasonCode:
              "SOURCE_EVIDENCE_REVIEWABLE",
            reference: card.prospect_id,
            sourceEventId:
              card.last_activity.event_id,
          }),
        );
      }

      if (
        card.stage.code ===
          "APPOINTMENT_HELD" &&
        card.last_activity.event_type ===
          "APPOINTMENT_HELD"
      ) {
        items.push(
          itemFrom({
            projectionId,
            card,
            actionCode:
              "ADD_OPTIONAL_CONTEXT",
            reasonCode:
              "HELD_APPOINTMENT_WITHOUT_LATER_CONTEXT",
            reference:
              card.appointment
                .appointment_reference,
            sourceEventId:
              card.appointment
                .latest_event_id,
          }),
        );
      }

      return items;
    }

    function compareItems(left, right) {
      const leftDue =
        left.due_at ||
        "9999-12-31T23:59:59.999Z";
      const rightDue =
        right.due_at ||
        "9999-12-31T23:59:59.999Z";

      return (
        left.priority - right.priority ||
        leftDue.localeCompare(rightDue) ||
        right.last_activity_at.localeCompare(
          left.last_activity_at,
        ) ||
        left.prospect_id.localeCompare(
          right.prospect_id,
        ) ||
        left.action_code.localeCompare(
          right.action_code,
        ) ||
        left.reference.localeCompare(
          right.reference,
        )
      );
    }

    function buildMiDiaProjection({
      plan_reference,
      timelines,
    } = {}) {
      const planReference = requireOpaque(
        plan_reference,
        "MI_DIA_PLAN_REFERENCE_INVALID",
        "La referencia del plan",
      );
      const cards = normalizeTimelines(timelines);
      const tenantId = cards[0].tenant_id;
      const projectionId =
        deriveMiDiaProjectionId({
          tenant_id: tenantId,
          plan_reference: planReference,
        });
      const rawItems = cards.flatMap(card =>
        itemsForCard(projectionId, card),
      );

      if (rawItems.length > MAX_WORK_ITEMS) {
        error(
          "MI_DIA_WORK_ITEM_LIMIT_EXCEEDED",
          "Mi Día excede el límite de trabajo proyectable.",
          { maximum: MAX_WORK_ITEMS },
        );
      }

      const items = rawItems
        .sort(compareItems)
        .map((item, index) => ({
          ...item,
          position: index + 1,
        }));

      const countsByAction = Object.fromEntries(
        ACTION_CODES.map(code => [code, 0]),
      );

      for (const item of items) {
        countsByAction[item.action_code] += 1;
      }

      const digestInput = {
        projection_version:
          PROJECTION_VERSION,
        projection_id: projectionId,
        plan_reference: planReference,
        tenant_id: tenantId,
        source_card_version:
          pipelineCardProjection
            .PROJECTION_VERSION,
        source_card_count: cards.length,
        source_card_digests: cards.map(card => ({
          prospect_id: card.prospect_id,
          projection_id: card.projection_id,
          projection_digest:
            card.projection_digest,
        })),
        ordering: {
          primary: "priority:ASC",
          secondary: "due_at:ASC_NULLS_LAST",
          tertiary:
            "last_activity_at:DESC",
          tie_breaker:
            "prospect_action_reference:ASC",
        },
        work_item_count: items.length,
        required_count: items.filter(
          item => item.required,
        ).length,
        optional_count: items.filter(
          item => !item.required,
        ).length,
        prospect_count: new Set(
          items.map(item => item.prospect_id),
        ).size,
        counts_by_action: countsByAction,
        unsupported_signals: [
          ...UNSUPPORTED_SIGNALS,
        ],
        items,
      };

      return {
        ...digestInput,
        projection_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeProjection(
      input,
      source,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        PROJECTION_KEYS,
        "MI_DIA_PROJECTION_FIELDS_INVALID",
        "La proyección de Mi Día",
      );
      assertRequiredKeys(
        input,
        PROJECTION_KEYS,
        "MI_DIA_PROJECTION_FIELDS_REQUIRED",
        "La proyección de Mi Día",
      );

      if (!Array.isArray(input.items)) {
        error(
          "MI_DIA_ITEMS_INVALID",
          "Los elementos de Mi Día deben ser una lista.",
        );
      }

      input.items.forEach((item, index) => {
        assertAllowedKeys(
          item,
          WORK_ITEM_KEYS,
          "MI_DIA_WORK_ITEM_FIELDS_INVALID",
          `El trabajo ${index + 1}`,
        );
        assertRequiredKeys(
          item,
          WORK_ITEM_KEYS,
          "MI_DIA_WORK_ITEM_FIELDS_REQUIRED",
          `El trabajo ${index + 1}`,
        );
      });

      const normalized =
        buildMiDiaProjection(source);

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "MI_DIA_PROJECTION_NOT_CANONICAL",
          "Mi Día no coincide con sus timelines fuente.",
        );
      }

      return normalized;
    }

    function createMiDiaProjection(source = {}) {
      return deepFreeze(
        buildMiDiaProjection(source),
      );
    }

    function assertMiDiaProjection(
      projection,
      source = {},
    ) {
      return deepFreeze(
        normalizeProjection(
          clone(projection),
          source,
          { requireCanonicalShape: true },
        ),
      );
    }

    function validateMiDiaProjection(
      projection,
      source = {},
    ) {
      try {
        assertMiDiaProjection(
          projection,
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
                  : "MI_DIA_PROJECTION_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La proyección de Mi Día no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildMiDiaProjection({
      projection,
      plan_reference,
      timelines,
    } = {}) {
      assertMiDiaProjection(
        projection,
        {
          plan_reference,
          timelines,
        },
      );

      return createMiDiaProjection({
        plan_reference,
        timelines,
      });
    }

    return deepFreeze({
      PROJECTION_CONTRACT_VERSION,
      PROJECTION_VERSION,
      WORK_ITEM_VERSION,
      MAX_TIMELINES,
      MAX_WORK_ITEMS,
      ACTION_CODES,
      ACTION_PRESENTATION,
      UNSUPPORTED_SIGNALS,
      MiDiaProjectionError,
      deriveMiDiaProjectionId,
      deriveWorkItemId,
      createMiDiaProjection,
      assertMiDiaProjection,
      validateMiDiaProjection,
      rebuildMiDiaProjection,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        normalizeTimelines,
        itemsForCard,
        compareItems,
        buildMiDiaProjection,
        deepFreeze,
      }),
    });
  },
);
