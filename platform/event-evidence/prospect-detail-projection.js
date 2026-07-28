"use strict";

(function prospectDetailProjectionModule(root, factory) {
  const timelineContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-timeline-contract")
      : root.ForgeCanonicalActivityTimelineContractFES03B;
  const activityProjection =
    typeof module !== "undefined" && module.exports
      ? require("./activity-projection")
      : root.ForgeActivityProjectionFES03C;

  const api = factory(
    timelineContract,
    activityProjection,
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeProspectDetailProjectionFES03D = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function prospectDetailProjectionFactory(
    timelineContract,
    activityProjection,
  ) {
    if (!timelineContract || !activityProjection) {
      throw new Error(
        "FES03D_PROSPECT_DETAIL_DEPENDENCIES_REQUIRED",
      );
    }

    const PROJECTION_CONTRACT_VERSION = "FES-03D.1";
    const PROJECTION_VERSION =
      "forge.prospect_detail_projection.v1";

    const TRUTH_STATES = Object.freeze([
      "UNKNOWN",
      "PENDING_CONFIRMATION",
      "REPORTED_REVIEWABLE",
      "CONFIRMED",
      "CONFLICT_REVIEW_REQUIRED",
    ]);

    const APPOINTMENT_STATUSES = Object.freeze([
      "SCHEDULED",
      "HELD",
      "NOT_HELD",
      "RESCHEDULED",
      "NO_SHOW",
    ]);

    const DUE_ACTION_STATUSES = Object.freeze([
      "OPEN",
      "RESCHEDULED",
      "COMPLETED",
    ]);

    const UNSUPPORTED_SECTION_NAMES = Object.freeze([
      "relationships",
      "opportunities",
      "commitments",
      "notes",
      "model_interpretations",
      "objections",
      "messages",
      "quotes",
      "recommendations",
    ]);

    const PROJECTION_KEYS = Object.freeze([
      "projection_version",
      "projection_id",
      "source_timeline_version",
      "source_timeline_id",
      "source_timeline_reference",
      "source_timeline_digest",
      "source_activity_projection_version",
      "source_activity_projection_digest",
      "tenant_id",
      "correlation_id",
      "prospect_id",
      "identity",
      "profile",
      "contexts",
      "appointments",
      "due_actions",
      "unsupported_sections",
      "correction_conflicts",
      "history",
      "counters",
      "projection_digest",
    ]);

    class ProspectDetailProjectionError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ProspectDetailProjectionError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ProspectDetailProjectionError(
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
        timelineContract._private &&
        typeof timelineContract._private.stableDigest === "function"
      ) {
        return timelineContract._private.stableDigest(value);
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

    function truthStateFor(event) {
      const mapping = {
        UNCONFIRMED: "PENDING_CONFIRMATION",
        REPORTED: "REPORTED_REVIEWABLE",
        CONFIRMED: "CONFIRMED",
        DISPUTED: "CONFLICT_REVIEW_REQUIRED",
      };

      const state = mapping[event.confirmation_state];

      if (!state) {
        error(
          "PROSPECT_DETAIL_CONFIRMATION_STATE_INVALID",
          "El evento no tiene estado de verdad proyectable.",
          {
            event_id: event.event_id,
            confirmation_state: event.confirmation_state,
          },
        );
      }

      return state;
    }

    function deriveProspectDetailProjectionId({
      tenant_id,
      timeline_id,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PROSPECT_DETAIL_TENANT_INVALID",
        "El tenant del detalle",
      );
      const timelineId = requireOpaque(
        timeline_id,
        "PROSPECT_DETAIL_TIMELINE_INVALID",
        "La timeline del detalle",
      );

      return `pd_${stableDigest({
        tenant_id: tenantId,
        timeline_id: timelineId,
        projection_version: PROJECTION_VERSION,
      })}`;
    }

    function buildCorrectionChains(timeline) {
      const entriesById = new Map(
        timeline.entries.map(entry => [
          entry.event_id,
          entry,
        ]),
      );
      const groups = new Map();

      for (const entry of timeline.entries) {
        const rootId = entry.correction_root_event_id;
        const members = groups.get(rootId) || [];
        members.push(entry);
        groups.set(rootId, members);
      }

      const chains = [];

      for (const [rootEventId, members] of groups.entries()) {
        members.sort(
          (left, right) =>
            left.position - right.position,
        );

        const rootEntry = entriesById.get(rootEventId);
        const leaves = members.filter(
          member => !member.is_corrected,
        );

        if (!rootEntry || rootEntry.is_correction) {
          error(
            "PROSPECT_DETAIL_CORRECTION_ROOT_INVALID",
            "La cadena de corrección no tiene raíz válida.",
            { root_event_id: rootEventId },
          );
        }

        chains.push({
          root_event_id: rootEventId,
          root_event_type: rootEntry.event_type,
          root_entry: rootEntry,
          members,
          leaf_entries: leaves,
          conflict: leaves.length !== 1,
          effective_entry:
            leaves.length === 1
              ? leaves[0]
              : null,
        });
      }

      return chains.sort(
        (left, right) =>
          left.root_entry.position -
          right.root_entry.position,
      );
    }

    function validateProspectScope(
      timeline,
      chains,
    ) {
      const prospectCreatedChains = chains.filter(
        chain =>
          chain.root_event_type ===
          "PROSPECT_CREATED",
      );

      if (prospectCreatedChains.length !== 1) {
        error(
          "PROSPECT_DETAIL_IDENTITY_ROOT_INVALID",
          "El detalle requiere exactamente un PROSPECT_CREATED raíz.",
          {
            roots_found: prospectCreatedChains.length,
          },
        );
      }

      const identityChain = prospectCreatedChains[0];
      const rootEvent =
        identityChain.root_entry.ledger_record
          .canonical_event;
      const prospectId = requireOpaque(
        rootEvent.subject.id,
        "PROSPECT_DETAIL_PROSPECT_ID_INVALID",
        "El prospecto",
      );

      for (const entry of timeline.entries) {
        const event =
          entry.ledger_record.canonical_event;

        if (
          event.subject.type === "PROSPECT" &&
          event.subject.id !== prospectId
        ) {
          error(
            "PROSPECT_DETAIL_PROSPECT_SCOPE_MISMATCH",
            "El detalle no puede mezclar identidades de prospecto.",
            {
              expected_prospect_id: prospectId,
              actual_prospect_id: event.subject.id,
              event_id: event.event_id,
            },
          );
        }
      }

      return {
        prospectId,
        identityChain,
      };
    }

    function projectIdentity(
      prospectId,
      identityChain,
    ) {
      if (identityChain.conflict) {
        return {
          state: "CONFLICT_REVIEW_REQUIRED",
          prospect_id: prospectId,
          prospect_reference: null,
          source_category: null,
          effective_event_id: null,
          root_event_id:
            identityChain.root_event_id,
        };
      }

      const event =
        identityChain.effective_entry
          .ledger_record.canonical_event;

      return {
        state: truthStateFor(event),
        prospect_id: prospectId,
        prospect_reference:
          event.payload.prospect_reference,
        source_category:
          event.payload.source_category,
        effective_event_id: event.event_id,
        root_event_id:
          identityChain.root_event_id,
      };
    }

    function projectProfile(
      chains,
      prospectId,
    ) {
      const profileChains = chains.filter(
        chain =>
          chain.root_event_type ===
          "PROSPECT_PROFILE_CREATED",
      );

      if (profileChains.length === 0) {
        return {
          state: "UNKNOWN",
          prospect_id: prospectId,
          profile_reference: null,
          effective_event_id: null,
          root_event_id: null,
        };
      }

      if (profileChains.length > 1) {
        return {
          state: "CONFLICT_REVIEW_REQUIRED",
          prospect_id: prospectId,
          profile_reference: null,
          effective_event_id: null,
          root_event_id: null,
        };
      }

      const chain = profileChains[0];

      if (chain.conflict) {
        return {
          state: "CONFLICT_REVIEW_REQUIRED",
          prospect_id: prospectId,
          profile_reference: null,
          effective_event_id: null,
          root_event_id: chain.root_event_id,
        };
      }

      const event =
        chain.effective_entry
          .ledger_record.canonical_event;

      return {
        state: truthStateFor(event),
        prospect_id: prospectId,
        profile_reference:
          event.payload.profile_reference,
        effective_event_id: event.event_id,
        root_event_id: chain.root_event_id,
      };
    }

    function projectContexts(chains) {
      const allowed = new Set([
        "INITIAL_CONTEXT_CAPTURED",
        "ACTIVITY_CONTEXT_ADDED",
      ]);

      return chains
        .filter(chain =>
          allowed.has(chain.root_event_type),
        )
        .map(chain => {
          if (chain.conflict) {
            return {
              state: "CONFLICT_REVIEW_REQUIRED",
              context_kind:
                chain.root_event_type ===
                "INITIAL_CONTEXT_CAPTURED"
                  ? "INITIAL"
                  : "ACTIVITY",
              context_reference: null,
              activity_reference: null,
              capture_mode: null,
              occurred_at: null,
              effective_event_id: null,
              root_event_id: chain.root_event_id,
            };
          }

          const event =
            chain.effective_entry
              .ledger_record.canonical_event;

          return {
            state: truthStateFor(event),
            context_kind:
              chain.root_event_type ===
              "INITIAL_CONTEXT_CAPTURED"
                ? "INITIAL"
                : "ACTIVITY",
            context_reference:
              event.payload.context_reference,
            activity_reference:
              event.payload.activity_reference ||
              null,
            capture_mode:
              event.payload.capture_mode,
            occurred_at: event.occurred_at,
            effective_event_id: event.event_id,
            root_event_id: chain.root_event_id,
          };
        })
        .sort((left, right) =>
          String(left.occurred_at || "")
            .localeCompare(
              String(right.occurred_at || ""),
            ),
        );
    }

    function appointmentStatus(eventType) {
      const mapping = {
        APPOINTMENT_SCHEDULED: "SCHEDULED",
        APPOINTMENT_HELD: "HELD",
        APPOINTMENT_NOT_HELD: "NOT_HELD",
        APPOINTMENT_RESCHEDULED: "RESCHEDULED",
        APPOINTMENT_NO_SHOW: "NO_SHOW",
      };

      return mapping[eventType] || null;
    }

    function projectAppointments(chains) {
      const appointmentChains = chains.filter(
        chain =>
          appointmentStatus(
            chain.root_event_type,
          ),
      );
      const grouped = new Map();

      for (const chain of appointmentChains) {
        if (chain.conflict) {
          const rootEvent =
            chain.root_entry.ledger_record
              .canonical_event;
          const reference =
            rootEvent.payload
              .appointment_reference;
          const existing =
            grouped.get(reference) || [];
          existing.push({
            conflict: true,
            chain,
          });
          grouped.set(reference, existing);
          continue;
        }

        const event =
          chain.effective_entry
            .ledger_record.canonical_event;
        const reference =
          event.payload.appointment_reference;
        const existing =
          grouped.get(reference) || [];

        existing.push({
          conflict: false,
          chain,
          event,
          position:
            chain.effective_entry.position,
        });
        grouped.set(reference, existing);
      }

      return [...grouped.entries()]
        .map(([reference, values]) => {
          values.sort(
            (left, right) =>
              (
                left.position ||
                left.chain.root_entry.position
              ) -
              (
                right.position ||
                right.chain.root_entry.position
              ),
          );

          const conflicts = values.filter(
            value => value.conflict,
          );

          if (conflicts.length > 0) {
            return {
              appointment_reference: reference,
              state: "CONFLICT_REVIEW_REQUIRED",
              status: null,
              starts_at: null,
              ends_at: null,
              previous_starts_at: null,
              provider_event_reference: null,
              reason_code: null,
              party: null,
              outcome_confirmed_at: null,
              latest_event_id: null,
              event_ids: values
                .flatMap(value =>
                  value.chain.members.map(
                    member => member.event_id,
                  ),
                ),
            };
          }

          const latest = values[values.length - 1];
          const event = latest.event;
          const payload = event.payload;

          return {
            appointment_reference: reference,
            state: truthStateFor(event),
            status:
              appointmentStatus(
                event.event_type,
              ),
            starts_at:
              payload.starts_at || null,
            ends_at:
              payload.ends_at || null,
            previous_starts_at:
              payload.previous_starts_at || null,
            provider_event_reference:
              payload.provider_event_reference ||
              null,
            reason_code:
              payload.reason_code || null,
            party: payload.party || null,
            outcome_confirmed_at:
              payload.outcome_confirmed_at ||
              null,
            latest_event_id: event.event_id,
            event_ids: values.map(
              value => value.event.event_id,
            ),
          };
        })
        .sort((left, right) =>
          left.appointment_reference.localeCompare(
            right.appointment_reference,
          ),
        );
    }

    function dueActionStatus(eventType) {
      const mapping = {
        DUE_ACTION_CREATED: "OPEN",
        DUE_ACTION_RESCHEDULED: "RESCHEDULED",
        DUE_ACTION_COMPLETED: "COMPLETED",
      };

      return mapping[eventType] || null;
    }

    function projectDueActions(chains) {
      const dueChains = chains.filter(
        chain =>
          dueActionStatus(
            chain.root_event_type,
          ),
      );
      const grouped = new Map();

      for (const chain of dueChains) {
        if (chain.conflict) {
          const rootEvent =
            chain.root_entry.ledger_record
              .canonical_event;
          const reference =
            rootEvent.payload
              .due_action_reference;
          const existing =
            grouped.get(reference) || [];
          existing.push({
            conflict: true,
            chain,
          });
          grouped.set(reference, existing);
          continue;
        }

        const event =
          chain.effective_entry
            .ledger_record.canonical_event;
        const reference =
          event.payload.due_action_reference;
        const existing =
          grouped.get(reference) || [];

        existing.push({
          conflict: false,
          chain,
          event,
          position:
            chain.effective_entry.position,
        });
        grouped.set(reference, existing);
      }

      return [...grouped.entries()]
        .map(([reference, values]) => {
          values.sort(
            (left, right) =>
              (
                left.position ||
                left.chain.root_entry.position
              ) -
              (
                right.position ||
                right.chain.root_entry.position
              ),
          );

          const conflicts = values.filter(
            value => value.conflict,
          );

          if (conflicts.length > 0) {
            return {
              due_action_reference: reference,
              state: "CONFLICT_REVIEW_REQUIRED",
              status: null,
              action_type: null,
              due_at: null,
              previous_due_at: null,
              completed_at: null,
              latest_event_id: null,
              event_ids: values
                .flatMap(value =>
                  value.chain.members.map(
                    member => member.event_id,
                  ),
                ),
            };
          }

          const latest = values[values.length - 1];
          const event = latest.event;
          const payload = event.payload;

          return {
            due_action_reference: reference,
            state: truthStateFor(event),
            status:
              dueActionStatus(
                event.event_type,
              ),
            action_type:
              payload.action_type || null,
            due_at: payload.due_at || null,
            previous_due_at:
              payload.previous_due_at || null,
            completed_at:
              payload.completed_at || null,
            latest_event_id: event.event_id,
            event_ids: values.map(
              value => value.event.event_id,
            ),
          };
        })
        .sort((left, right) =>
          left.due_action_reference.localeCompare(
            right.due_action_reference,
          ),
        );
    }

    function unsupportedSections() {
      return Object.fromEntries(
        UNSUPPORTED_SECTION_NAMES.map(name => [
          name,
          {
            state:
              "NOT_AVAILABLE_IN_FIRST_VERTICAL",
            items: [],
            canonical_event_type_available:
              false,
          },
        ]),
      );
    }

    function correctionConflicts(chains) {
      return chains
        .filter(chain => chain.conflict)
        .map(chain => ({
          root_event_id:
            chain.root_event_id,
          root_event_type:
            chain.root_event_type,
          leaf_event_ids:
            chain.leaf_entries
              .map(entry => entry.event_id)
              .sort(),
          member_event_ids:
            chain.members
              .map(entry => entry.event_id),
          state:
            "CONFLICT_REVIEW_REQUIRED",
        }));
    }

    function buildProspectDetailProjection(
      timelineInput,
    ) {
      const timeline =
        timelineContract.assertCanonicalActivityTimeline(
          clone(timelineInput),
        );
      const activity =
        activityProjection.createActivityProjection({
          timeline,
        });
      const chains =
        buildCorrectionChains(timeline);
      const {
        prospectId,
        identityChain,
      } = validateProspectScope(
        timeline,
        chains,
      );
      const projectionId =
        deriveProspectDetailProjectionId({
          tenant_id: timeline.tenant_id,
          timeline_id: timeline.timeline_id,
        });
      const identity = projectIdentity(
        prospectId,
        identityChain,
      );
      const profile = projectProfile(
        chains,
        prospectId,
      );
      const contexts =
        projectContexts(chains);
      const appointments =
        projectAppointments(chains);
      const dueActions =
        projectDueActions(chains);
      const unsupported =
        unsupportedSections();
      const conflicts =
        correctionConflicts(chains);

      const counters = {
        history_count: activity.item_count,
        context_count: contexts.length,
        appointment_count:
          appointments.length,
        due_action_count:
          dueActions.length,
        open_due_action_count:
          dueActions.filter(item =>
            [
              "OPEN",
              "RESCHEDULED",
            ].includes(item.status),
          ).length,
        pending_count:
          activity.pending_count,
        correction_count:
          activity.correction_count,
        correction_conflict_count:
          conflicts.length,
        unsupported_section_count:
          UNSUPPORTED_SECTION_NAMES.length,
      };

      const digestInput = {
        projection_version:
          PROJECTION_VERSION,
        projection_id: projectionId,
        source_timeline_version:
          timeline.timeline_version,
        source_timeline_id:
          timeline.timeline_id,
        source_timeline_reference:
          timeline.timeline_reference,
        source_timeline_digest:
          timeline.timeline_digest,
        source_activity_projection_version:
          activity.projection_version,
        source_activity_projection_digest:
          activity.projection_digest,
        tenant_id: timeline.tenant_id,
        correlation_id:
          timeline.correlation_id,
        prospect_id: prospectId,
        identity,
        profile,
        contexts,
        appointments,
        due_actions: dueActions,
        unsupported_sections:
          unsupported,
        correction_conflicts:
          conflicts,
        history: clone(activity.items),
        counters,
      };

      return {
        ...digestInput,
        projection_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeProjection(
      input,
      timelineInput,
      { requireCanonicalShape = false } = {},
    ) {
      assertAllowedKeys(
        input,
        PROJECTION_KEYS,
        "PROSPECT_DETAIL_PROJECTION_FIELDS_INVALID",
        "La proyección de detalle",
      );
      assertRequiredKeys(
        input,
        PROJECTION_KEYS,
        "PROSPECT_DETAIL_PROJECTION_FIELDS_REQUIRED",
        "La proyección de detalle",
      );

      const normalized =
        buildProspectDetailProjection(
          timelineInput,
        );

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "PROSPECT_DETAIL_PROJECTION_NOT_CANONICAL",
          "El detalle no coincide con su timeline fuente.",
        );
      }

      return normalized;
    }

    function createProspectDetailProjection({
      timeline,
    } = {}) {
      return deepFreeze(
        buildProspectDetailProjection(
          timeline,
        ),
      );
    }

    function assertProspectDetailProjection(
      projection,
      { timeline } = {},
    ) {
      return deepFreeze(
        normalizeProjection(
          clone(projection),
          timeline,
          {
            requireCanonicalShape: true,
          },
        ),
      );
    }

    function validateProspectDetailProjection(
      projection,
      { timeline } = {},
    ) {
      try {
        assertProspectDetailProjection(
          projection,
          { timeline },
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
                  : "PROSPECT_DETAIL_PROJECTION_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La proyección de detalle no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildProspectDetailProjection({
      projection,
      timeline,
    } = {}) {
      assertProspectDetailProjection(
        projection,
        { timeline },
      );

      return createProspectDetailProjection({
        timeline,
      });
    }

    return deepFreeze({
      PROJECTION_CONTRACT_VERSION,
      PROJECTION_VERSION,
      TRUTH_STATES,
      APPOINTMENT_STATUSES,
      DUE_ACTION_STATUSES,
      UNSUPPORTED_SECTION_NAMES,
      ProspectDetailProjectionError,
      deriveProspectDetailProjectionId,
      createProspectDetailProjection,
      assertProspectDetailProjection,
      validateProspectDetailProjection,
      rebuildProspectDetailProjection,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        truthStateFor,
        buildCorrectionChains,
        projectAppointments,
        projectDueActions,
        buildProspectDetailProjection,
        deepFreeze,
      }),
    });
  },
);
