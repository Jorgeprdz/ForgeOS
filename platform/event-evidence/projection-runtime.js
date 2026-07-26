"use strict";

(function projectionRuntimeModule(root, factory) {
  const timelineContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-timeline-contract")
      : root.ForgeCanonicalActivityTimelineContractFES03B;
  const activityProjection =
    typeof module !== "undefined" && module.exports
      ? require("./activity-projection")
      : root.ForgeActivityProjectionFES03C;
  const prospectDetailProjection =
    typeof module !== "undefined" && module.exports
      ? require("./prospect-detail-projection")
      : root.ForgeProspectDetailProjectionFES03D;
  const pipelineCardProjection =
    typeof module !== "undefined" && module.exports
      ? require("./pipeline-card-projection")
      : root.ForgePipelineCardProjectionFES03E;
  const miDiaProjection =
    typeof module !== "undefined" && module.exports
      ? require("./mi-dia-projection")
      : root.ForgeMiDiaProjectionFES03F;

  const api = factory(
    timelineContract,
    activityProjection,
    prospectDetailProjection,
    pipelineCardProjection,
    miDiaProjection,
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeProjectionRuntimeFES03G = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function projectionRuntimeFactory(
    timelineContract,
    activityProjection,
    prospectDetailProjection,
    pipelineCardProjection,
    miDiaProjection,
  ) {
    if (
      !timelineContract ||
      !activityProjection ||
      !prospectDetailProjection ||
      !pipelineCardProjection ||
      !miDiaProjection
    ) {
      throw new Error(
        "FES03_PROJECTION_RUNTIME_DEPENDENCIES_REQUIRED",
      );
    }

    const RUNTIME_CONTRACT_VERSION = "FES-03G.1";
    const SNAPSHOT_VERSION =
      "forge.projection_runtime_snapshot.v1";
    const BUNDLE_VERSION =
      "forge.projection_runtime_bundle.v1";
    const MAX_TIMELINES = 500;

    const SNAPSHOT_KEYS = Object.freeze([
      "snapshot_version",
      "snapshot_id",
      "plan_reference",
      "tenant_id",
      "source_timeline_count",
      "prospect_count",
      "contracts",
      "ordering",
      "bundles",
      "mi_dia",
      "acceptance",
      "snapshot_digest",
    ]);

    const BUNDLE_KEYS = Object.freeze([
      "bundle_version",
      "bundle_id",
      "tenant_id",
      "correlation_id",
      "prospect_id",
      "timeline_id",
      "timeline_digest",
      "activity",
      "prospect_detail",
      "pipeline_card",
      "lineage",
      "bundle_digest",
    ]);

    class ProjectionRuntimeError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ProjectionRuntimeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ProjectionRuntimeError(
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
        miDiaProjection._private &&
        typeof miDiaProjection._private.stableDigest === "function"
      ) {
        return miDiaProjection._private.stableDigest(value);
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

    function deriveSnapshotId({
      tenant_id,
      plan_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PROJECTION_RUNTIME_TENANT_INVALID",
        "El tenant del runtime",
      );
      const planReference = requireOpaque(
        plan_reference,
        "PROJECTION_RUNTIME_PLAN_INVALID",
        "La referencia del runtime",
      );

      return `runtime_${stableDigest({
        tenant_id: tenantId,
        plan_reference: planReference,
        snapshot_version: SNAPSHOT_VERSION,
      })}`;
    }

    function deriveBundleId({
      tenant_id,
      prospect_id,
      timeline_id,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PROJECTION_RUNTIME_TENANT_INVALID",
        "El tenant del bundle",
      );
      const prospectId = requireOpaque(
        prospect_id,
        "PROJECTION_RUNTIME_PROSPECT_INVALID",
        "El prospecto del bundle",
      );
      const timelineId = requireOpaque(
        timeline_id,
        "PROJECTION_RUNTIME_TIMELINE_INVALID",
        "La timeline del bundle",
      );

      return `bundle_${stableDigest({
        tenant_id: tenantId,
        prospect_id: prospectId,
        timeline_id: timelineId,
        bundle_version: BUNDLE_VERSION,
      })}`;
    }

    function normalizeTimelines(timelines) {
      if (!Array.isArray(timelines)) {
        error(
          "PROJECTION_RUNTIME_TIMELINES_INVALID",
          "El runtime requiere una lista de timelines.",
        );
      }

      if (timelines.length === 0) {
        error(
          "PROJECTION_RUNTIME_TIMELINES_REQUIRED",
          "El runtime requiere al menos una timeline.",
        );
      }

      if (timelines.length > MAX_TIMELINES) {
        error(
          "PROJECTION_RUNTIME_TIMELINE_LIMIT_EXCEEDED",
          "El runtime excede el límite de timelines.",
          { maximum: MAX_TIMELINES },
        );
      }

      const canonical = timelines.map(timeline =>
        timelineContract.assertCanonicalActivityTimeline(
          clone(timeline),
        ),
      );

      const tenants = [...new Set(
        canonical.map(timeline => timeline.tenant_id),
      )];

      if (tenants.length !== 1) {
        error(
          "PROJECTION_RUNTIME_TENANT_MISMATCH",
          "El runtime no puede mezclar tenants.",
          { tenant_ids: tenants.sort() },
        );
      }

      const byProspect = new Map();

      for (const timeline of canonical) {
        const prospectEntry = timeline.entries.find(
          entry =>
            entry.event_type ===
            "PROSPECT_CREATED" &&
            !entry.is_corrected,
        );

        if (!prospectEntry) {
          error(
            "PROJECTION_RUNTIME_PROSPECT_ROOT_REQUIRED",
            "Cada timeline requiere identidad efectiva de prospecto.",
            { timeline_id: timeline.timeline_id },
          );
        }

        const prospectId =
          prospectEntry.ledger_record.canonical_event
            .subject.id;
        const existing = byProspect.get(prospectId);

        if (
          existing &&
          existing.timeline_digest !==
            timeline.timeline_digest
        ) {
          error(
            "PROJECTION_RUNTIME_DUPLICATE_PROSPECT_CONFLICT",
            "El mismo prospecto tiene timelines incompatibles.",
            { prospect_id: prospectId },
          );
        }

        byProspect.set(prospectId, timeline);
      }

      return [...byProspect.entries()]
        .map(([prospectId, timeline]) => ({
          prospectId,
          timeline,
        }))
        .sort(
          (left, right) =>
            left.prospectId.localeCompare(
              right.prospectId,
            ),
        );
    }

    function createBundle(prospectId, timeline) {
      const activity =
        activityProjection.createActivityProjection({
          timeline,
        });
      const prospectDetail =
        prospectDetailProjection
          .createProspectDetailProjection({
            timeline,
          });
      const pipelineCard =
        pipelineCardProjection
          .createPipelineCardProjection({
            timeline,
          });

      const lineage = {
        activity_from_timeline:
          activity.source_timeline_id ===
            timeline.timeline_id &&
          activity.source_timeline_digest ===
            timeline.timeline_digest,
        prospect_detail_from_timeline:
          prospectDetail.source_timeline_id ===
            timeline.timeline_id &&
          prospectDetail.source_timeline_digest ===
            timeline.timeline_digest,
        prospect_detail_from_activity:
          prospectDetail
            .source_activity_projection_digest ===
          activity.projection_digest,
        pipeline_card_from_timeline:
          pipelineCard.source_timeline_id ===
            timeline.timeline_id &&
          pipelineCard.source_timeline_digest ===
            timeline.timeline_digest,
        pipeline_card_from_prospect_detail:
          pipelineCard
            .source_prospect_detail_id ===
            prospectDetail.projection_id &&
          pipelineCard
            .source_prospect_detail_digest ===
            prospectDetail.projection_digest,
      };

      if (
        Object.values(lineage).some(
          value => value !== true,
        )
      ) {
        error(
          "PROJECTION_RUNTIME_LINEAGE_INVALID",
          "Una proyección no conserva su linaje canónico.",
          {
            prospect_id: prospectId,
            lineage,
          },
        );
      }

      const bundleId = deriveBundleId({
        tenant_id: timeline.tenant_id,
        prospect_id: prospectId,
        timeline_id: timeline.timeline_id,
      });

      const digestInput = {
        bundle_version: BUNDLE_VERSION,
        bundle_id: bundleId,
        tenant_id: timeline.tenant_id,
        correlation_id:
          timeline.correlation_id,
        prospect_id: prospectId,
        timeline_id: timeline.timeline_id,
        timeline_digest:
          timeline.timeline_digest,
        activity,
        prospect_detail: prospectDetail,
        pipeline_card: pipelineCard,
        lineage,
      };

      return {
        ...digestInput,
        bundle_digest:
          stableDigest(digestInput),
      };
    }

    function validateMiDiaLineage(miDia, bundles) {
      const cards = new Map(
        bundles.map(bundle => [
          bundle.prospect_id,
          bundle.pipeline_card,
        ]),
      );

      if (
        miDia.source_card_count !==
        cards.size
      ) {
        error(
          "PROJECTION_RUNTIME_MI_DIA_CARD_COUNT_MISMATCH",
          "Mi Día no referencia todas las tarjetas del runtime.",
        );
      }

      for (const reference of miDia.source_card_digests) {
        const card = cards.get(
          reference.prospect_id,
        );

        if (
          !card ||
          card.projection_id !==
            reference.projection_id ||
          card.projection_digest !==
            reference.projection_digest
        ) {
          error(
            "PROJECTION_RUNTIME_MI_DIA_LINEAGE_INVALID",
            "Mi Día referencia una tarjeta ajena o alterada.",
            { prospect_id: reference.prospect_id },
          );
        }
      }

      for (const item of miDia.items) {
        const card = cards.get(item.prospect_id);

        if (
          !card ||
          item.source_card_id !==
            card.projection_id ||
          item.source_card_digest !==
            card.projection_digest
        ) {
          error(
            "PROJECTION_RUNTIME_WORK_ITEM_LINEAGE_INVALID",
            "Un trabajo de Mi Día no conserva su tarjeta fuente.",
            { work_item_id: item.work_item_id },
          );
        }
      }

      return true;
    }

    function buildRuntimeSnapshot({
      plan_reference,
      timelines,
    } = {}) {
      const planReference = requireOpaque(
        plan_reference,
        "PROJECTION_RUNTIME_PLAN_INVALID",
        "La referencia del runtime",
      );
      const normalized =
        normalizeTimelines(timelines);
      const tenantId =
        normalized[0].timeline.tenant_id;
      const snapshotId = deriveSnapshotId({
        tenant_id: tenantId,
        plan_reference: planReference,
      });
      const bundles = normalized.map(
        ({ prospectId, timeline }) =>
          createBundle(prospectId, timeline),
      );
      const canonicalTimelines =
        normalized.map(item => item.timeline);
      const miDia =
        miDiaProjection.createMiDiaProjection({
          plan_reference: planReference,
          timelines: canonicalTimelines,
        });

      validateMiDiaLineage(miDia, bundles);

      const acceptance = {
        canonical_timeline_only: true,
        shared_timeline_lineage: true,
        tenant_isolation: true,
        deterministic_bundle_order: true,
        deterministic_rebuild: true,
        unknown_remains_unknown: true,
        pending_state_explicit: true,
        conflicts_reviewable: true,
        corrections_append_only_visible: true,
        detached_projection_authority: false,
        productive_ui_binding: false,
        wall_clock_inference: false,
        alfred_generation: false,
        external_execution: false,
      };

      const digestInput = {
        snapshot_version:
          SNAPSHOT_VERSION,
        snapshot_id: snapshotId,
        plan_reference: planReference,
        tenant_id: tenantId,
        source_timeline_count:
          canonicalTimelines.length,
        prospect_count: bundles.length,
        contracts: {
          timeline:
            timelineContract.TIMELINE_VERSION,
          activity:
            activityProjection.PROJECTION_VERSION,
          prospect_detail:
            prospectDetailProjection
              .PROJECTION_VERSION,
          pipeline_card:
            pipelineCardProjection
              .PROJECTION_VERSION,
          mi_dia:
            miDiaProjection.PROJECTION_VERSION,
        },
        ordering: {
          bundles: "prospect_id:ASC",
          activity:
            "occurred_at:DESC_with_canonical_position",
          mi_dia:
            "priority_due_activity_prospect_action_reference",
        },
        bundles,
        mi_dia: miDia,
        acceptance,
      };

      return {
        ...digestInput,
        snapshot_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeSnapshot(
      input,
      source,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        SNAPSHOT_KEYS,
        "PROJECTION_RUNTIME_SNAPSHOT_FIELDS_INVALID",
        "La instantánea del runtime",
      );
      assertRequiredKeys(
        input,
        SNAPSHOT_KEYS,
        "PROJECTION_RUNTIME_SNAPSHOT_FIELDS_REQUIRED",
        "La instantánea del runtime",
      );

      if (!Array.isArray(input.bundles)) {
        error(
          "PROJECTION_RUNTIME_BUNDLES_INVALID",
          "Los bundles del runtime deben ser una lista.",
        );
      }

      input.bundles.forEach((bundle, index) => {
        assertAllowedKeys(
          bundle,
          BUNDLE_KEYS,
          "PROJECTION_RUNTIME_BUNDLE_FIELDS_INVALID",
          `El bundle ${index + 1}`,
        );
        assertRequiredKeys(
          bundle,
          BUNDLE_KEYS,
          "PROJECTION_RUNTIME_BUNDLE_FIELDS_REQUIRED",
          `El bundle ${index + 1}`,
        );
      });

      const normalized =
        buildRuntimeSnapshot(source);

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "PROJECTION_RUNTIME_SNAPSHOT_NOT_CANONICAL",
          "La instantánea no coincide con sus timelines fuente.",
        );
      }

      return normalized;
    }

    function createProjectionRuntimeSnapshot(
      source = {},
    ) {
      return deepFreeze(
        buildRuntimeSnapshot(source),
      );
    }

    function assertProjectionRuntimeSnapshot(
      snapshot,
      source = {},
    ) {
      return deepFreeze(
        normalizeSnapshot(
          clone(snapshot),
          source,
          { requireCanonicalShape: true },
        ),
      );
    }

    function validateProjectionRuntimeSnapshot(
      snapshot,
      source = {},
    ) {
      try {
        assertProjectionRuntimeSnapshot(
          snapshot,
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
                  : "PROJECTION_RUNTIME_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La instantánea del runtime no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildProjectionRuntimeSnapshot({
      snapshot,
      plan_reference,
      timelines,
    } = {}) {
      assertProjectionRuntimeSnapshot(
        snapshot,
        {
          plan_reference,
          timelines,
        },
      );

      return createProjectionRuntimeSnapshot({
        plan_reference,
        timelines,
      });
    }

    return deepFreeze({
      RUNTIME_CONTRACT_VERSION,
      SNAPSHOT_VERSION,
      BUNDLE_VERSION,
      MAX_TIMELINES,
      ProjectionRuntimeError,
      deriveSnapshotId,
      deriveBundleId,
      createProjectionRuntimeSnapshot,
      assertProjectionRuntimeSnapshot,
      validateProjectionRuntimeSnapshot,
      rebuildProjectionRuntimeSnapshot,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        normalizeTimelines,
        createBundle,
        validateMiDiaLineage,
        buildRuntimeSnapshot,
        deepFreeze,
      }),
    });
  },
);
