"use strict";

(function productiveUIProjectionBindingModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeProductiveUIProjectionBindingFES06B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function productiveUIProjectionBindingFactory() {
    const BINDING_VERSION = "FES-06B.1";
    const SNAPSHOT_VERSION =
      "forge.projection_runtime_snapshot.v1";
    const ACCEPTANCE_VERSION =
      "forge.passive_capture_runtime_acceptance.v1";

    const SURFACES = Object.freeze([
      "ACTIVITY",
      "PROSPECT_DETAIL",
      "PIPELINE_CARD",
      "MI_DIA",
    ]);

    const UI_STATES = Object.freeze([
      "LOADING",
      "READY",
      "EMPTY",
      "UNAVAILABLE",
      "INVALID",
    ]);

    const EVENT_NAME =
      "forge:event-evidence-projection-snapshot";

    const STATUS_COPY = Object.freeze({
      LOADING: Object.freeze({
        title: "Cargando actividad gobernada",
        message:
          "Forge está resolviendo el snapshot de evidencia.",
      }),
      EMPTY: Object.freeze({
        title: "Sin actividad verificable",
        message:
          "El snapshot es válido, pero no contiene registros presentables.",
      }),
      UNAVAILABLE: Object.freeze({
        title: "Actividad no disponible",
        message:
          "La fuente gobernada todavía no está conectada a esta sesión.",
      }),
      INVALID: Object.freeze({
        title: "Actividad no verificable",
        message:
          "El snapshot recibido no cumple el contrato de proyección.",
      }),
    });

    class ProductiveUIBindingError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "ProductiveUIBindingError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new ProductiveUIBindingError(
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
      return value === undefined
        ? undefined
        : JSON.parse(JSON.stringify(value));
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

    function safeText(value, fallback = "") {
      if (
        value === null ||
        value === undefined
      ) {
        return fallback;
      }

      const normalized =
        String(value).trim();

      return normalized || fallback;
    }

    function safeCount(value) {
      const number = Number(value);

      return Number.isFinite(number) &&
        number >= 0
        ? Math.floor(number)
        : 0;
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(
          /[&<>"']/g,
          character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[character],
        );
    }

    function statusModel(
      state,
      details = {},
    ) {
      const copy =
        STATUS_COPY[state] ||
        STATUS_COPY.INVALID;

      return {
        binding_version:
          BINDING_VERSION,
        state,
        title:
          safeText(
            details.title,
            copy.title,
          ),
        message:
          safeText(
            details.message,
            copy.message,
          ),
        snapshot_id:
          details.snapshot_id || null,
        snapshot_digest:
          details.snapshot_digest || null,
        surfaces: {
          ACTIVITY: [],
          PROSPECT_DETAIL: [],
          PIPELINE_CARD: [],
          MI_DIA: [],
        },
        diagnostics: {
          read_only: true,
          canonical_event_creation: false,
          ledger_mutation: false,
          timeline_mutation: false,
          projection_mutation: false,
          external_execution: false,
          business_truth_inference: false,
          raw_private_content_rendering: false,
          source_state:
            details.source_state || state,
          errors:
            Array.isArray(details.errors)
              ? clone(details.errors)
              : [],
        },
      };
    }

    function resolveProjectionSnapshot(input) {
      if (
        input === null ||
        input === undefined
      ) {
        return {
          state: "UNAVAILABLE",
          snapshot: null,
          errors: [],
        };
      }

      if (
        isPlainObject(input) &&
        UI_STATES.includes(input.state) &&
        input.state !== "READY"
      ) {
        return {
          state: input.state,
          snapshot: null,
          errors:
            Array.isArray(input.errors)
              ? clone(input.errors)
              : [],
        };
      }

      if (
        isPlainObject(input) &&
        input.acceptance_version ===
          ACCEPTANCE_VERSION
      ) {
        if (
          !isPlainObject(
            input.projection_snapshot,
          )
        ) {
          return {
            state: "INVALID",
            snapshot: null,
            errors: [
              {
                code:
                  "FES06B_PROJECTION_SNAPSHOT_REQUIRED",
              },
            ],
          };
        }

        return {
          state: "READY",
          snapshot:
            clone(
              input.projection_snapshot,
            ),
          errors: [],
        };
      }

      if (
        isPlainObject(input) &&
        input.snapshot_version ===
          SNAPSHOT_VERSION
      ) {
        return {
          state: "READY",
          snapshot: clone(input),
          errors: [],
        };
      }

      return {
        state: "INVALID",
        snapshot: null,
        errors: [
          {
            code:
              "FES06B_SOURCE_CONTRACT_INVALID",
          },
        ],
      };
    }

    function validateSnapshotShape(snapshot) {
      if (!isPlainObject(snapshot)) {
        error(
          "FES06B_SNAPSHOT_INVALID",
          "El snapshot debe ser un objeto.",
        );
      }

      if (
        snapshot.snapshot_version !==
          SNAPSHOT_VERSION
      ) {
        error(
          "FES06B_SNAPSHOT_VERSION_INVALID",
          "La versión del snapshot no está autorizada.",
        );
      }

      if (
        !safeText(snapshot.snapshot_id) ||
        !safeText(snapshot.snapshot_digest)
      ) {
        error(
          "FES06B_SNAPSHOT_IDENTITY_REQUIRED",
          "El snapshot requiere identidad y digest.",
        );
      }

      if (!Array.isArray(snapshot.bundles)) {
        error(
          "FES06B_BUNDLES_INVALID",
          "Los bundles deben ser una lista.",
        );
      }

      if (!isPlainObject(snapshot.mi_dia)) {
        error(
          "FES06B_MI_DIA_INVALID",
          "La proyección de Mi Día es obligatoria.",
        );
      }

      for (
        const [index, bundle]
        of snapshot.bundles.entries()
      ) {
        if (!isPlainObject(bundle)) {
          error(
            "FES06B_BUNDLE_INVALID",
            "Cada bundle debe ser un objeto.",
            { index },
          );
        }

        for (
          const key
          of [
            "prospect_id",
            "activity",
            "prospect_detail",
            "pipeline_card",
          ]
        ) {
          if (bundle[key] === undefined) {
            error(
              "FES06B_BUNDLE_FIELD_REQUIRED",
              "El bundle no contiene todas las proyecciones.",
              {
                index,
                field: key,
              },
            );
          }
        }

        if (
          !isPlainObject(bundle.activity) ||
          !Array.isArray(
            bundle.activity.items,
          ) ||
          !isPlainObject(
            bundle.prospect_detail,
          ) ||
          !isPlainObject(
            bundle.pipeline_card,
          )
        ) {
          error(
            "FES06B_BUNDLE_PROJECTION_INVALID",
            "Las proyecciones del bundle no son válidas.",
            { index },
          );
        }
      }

      if (
        !Array.isArray(
          snapshot.mi_dia.items,
        )
      ) {
        error(
          "FES06B_MI_DIA_ITEMS_INVALID",
          "Los elementos de Mi Día deben ser una lista.",
        );
      }

      return snapshot;
    }

    function activityItem(
      item,
      prospectId,
    ) {
      return {
        activity_id:
          safeText(
            item.activity_id,
            item.event_id,
          ),
        prospect_id:
          safeText(prospectId),
        category:
          safeText(
            item.category,
            "ACTIVITY",
          ),
        title:
          safeText(
            item.title,
            "Actividad registrada",
          ),
        occurred_at:
          safeText(item.occurred_at),
        confirmation_state:
          safeText(
            item.confirmation_state,
            "UNCONFIRMED",
          ),
        pending_state:
          safeText(
            item.pending_state,
            "NONE",
          ),
        is_correction:
          item.is_correction === true,
        is_corrected:
          item.is_corrected === true,
      };
    }

    function prospectDetailItem(
      detail,
      prospectId,
    ) {
      const identity =
        isPlainObject(detail.identity)
          ? detail.identity
          : {};
      const counters =
        isPlainObject(detail.counters)
          ? detail.counters
          : {};

      return {
        prospect_id:
          safeText(
            detail.prospect_id,
            prospectId,
          ),
        display_name:
          safeText(
            identity.display_name ||
              identity.displayName ||
              identity.label,
            "Prospecto",
          ),
        context_count:
          safeCount(
            counters.context_count ??
              detail.contexts?.length,
          ),
        appointment_count:
          safeCount(
            counters.appointment_count ??
              detail.appointments?.length,
          ),
        due_action_count:
          safeCount(
            counters.due_action_count ??
              detail.due_actions?.length,
          ),
        conflict_count:
          safeCount(
            counters.conflict_count ??
              detail.correction_conflicts?.length,
          ),
        projection_digest:
          safeText(
            detail.projection_digest,
          ),
      };
    }

    function pipelineCardItem(
      card,
      prospectId,
    ) {
      const stage =
        isPlainObject(card.stage)
          ? card.stage
          : {};
      const lastActivity =
        isPlainObject(card.last_activity)
          ? card.last_activity
          : {};
      const primaryAttention =
        isPlainObject(
          card.primary_attention,
        )
          ? card.primary_attention
          : {};

      return {
        prospect_id:
          safeText(
            card.prospect_id,
            prospectId,
          ),
        stage_code:
          safeText(
            stage.code ||
              stage.stage_code ||
              card.stage_code,
            "UNKNOWN",
          ),
        stage_label:
          safeText(
            stage.label ||
              card.stage_label,
            "Sin etapa verificable",
          ),
        last_activity_title:
          safeText(
            lastActivity.title,
            "Sin actividad verificable",
          ),
        last_activity_at:
          safeText(
            lastActivity.occurred_at ||
              card.last_activity_at,
          ),
        attention_label:
          safeText(
            primaryAttention.label ||
              primaryAttention.title,
          ),
        operational_status:
          safeText(
            card.operational_status,
            "UNAVAILABLE",
          ),
        conflict:
          card.conflict === true,
        projection_digest:
          safeText(
            card.projection_digest,
          ),
      };
    }

    function miDiaItem(item) {
      return {
        work_item_id:
          safeText(item.work_item_id),
        prospect_id:
          safeText(item.prospect_id),
        action_code:
          safeText(
            item.action_code,
            "REVIEW",
          ),
        label:
          safeText(
            item.label,
            "Revisar actividad",
          ),
        required:
          item.required === true,
        priority:
          safeText(
            item.priority,
            "NORMAL",
          ),
        due_at:
          safeText(item.due_at),
        reason_code:
          safeText(item.reason_code),
        stage_code:
          safeText(item.stage_code),
      };
    }

    function createSurfaceModel(input) {
      const resolved =
        resolveProjectionSnapshot(input);

      if (resolved.state !== "READY") {
        return deepFreeze(
          statusModel(
            resolved.state,
            {
              source_state:
                resolved.state,
              errors:
                resolved.errors,
            },
          ),
        );
      }

      try {
        const snapshot =
          validateSnapshotShape(
            resolved.snapshot,
          );
        const activity = [];
        const prospectDetail = [];
        const pipelineCard = [];

        for (
          const bundle
          of snapshot.bundles
        ) {
          const prospectId =
            safeText(bundle.prospect_id);

          activity.push(
            ...bundle.activity.items.map(
              item =>
                activityItem(
                  item,
                  prospectId,
                ),
            ),
          );
          prospectDetail.push(
            prospectDetailItem(
              bundle.prospect_detail,
              prospectId,
            ),
          );
          pipelineCard.push(
            pipelineCardItem(
              bundle.pipeline_card,
              prospectId,
            ),
          );
        }

        const miDia =
          snapshot.mi_dia.items.map(
            miDiaItem,
          );
        const empty =
          activity.length === 0 &&
          prospectDetail.length === 0 &&
          pipelineCard.length === 0 &&
          miDia.length === 0;

        if (empty) {
          return deepFreeze(
            statusModel(
              "EMPTY",
              {
                snapshot_id:
                  snapshot.snapshot_id,
                snapshot_digest:
                  snapshot.snapshot_digest,
                source_state:
                  "READY_EMPTY",
              },
            ),
          );
        }

        return deepFreeze({
          binding_version:
            BINDING_VERSION,
          state: "READY",
          title:
            "Actividad comercial gobernada",
          message:
            "Datos derivados del ledger y la timeline canónica.",
          snapshot_id:
            snapshot.snapshot_id,
          snapshot_digest:
            snapshot.snapshot_digest,
          surfaces: {
            ACTIVITY: activity,
            PROSPECT_DETAIL:
              prospectDetail,
            PIPELINE_CARD:
              pipelineCard,
            MI_DIA: miDia,
          },
          diagnostics: {
            read_only: true,
            canonical_event_creation:
              false,
            ledger_mutation: false,
            timeline_mutation: false,
            projection_mutation: false,
            external_execution: false,
            business_truth_inference:
              false,
            raw_private_content_rendering:
              false,
            source_state: "READY",
            errors: [],
          },
        });
      } catch (caught) {
        return deepFreeze(
          statusModel(
            "INVALID",
            {
              source_state:
                "VALIDATION_FAILED",
              errors: [
                {
                  code:
                    caught &&
                    caught.code
                      ? caught.code
                      : "FES06B_VALIDATION_FAILED",
                  message:
                    caught &&
                    caught.message
                      ? caught.message
                      : "Snapshot inválido.",
                },
              ],
            },
          ),
        );
      }
    }

    function stateMarkup(model, surface) {
      const copy =
        STATUS_COPY[model.state] ||
        STATUS_COPY.INVALID;

      return `
        <section
          class="forge-fes06b-state"
          data-fes06b-surface="${escapeHtml(surface)}"
          data-fes06b-state="${escapeHtml(model.state)}"
          role="status"
        >
          <strong>${escapeHtml(copy.title)}</strong>
          <span>${escapeHtml(copy.message)}</span>
        </section>
      `;
    }

    function renderActivityMarkup(model) {
      if (model.state !== "READY") {
        return stateMarkup(
          model,
          "ACTIVITY",
        );
      }

      const items =
        model.surfaces.ACTIVITY
          .slice(0, 6)
          .map(item => `
            <li>
              <span>${escapeHtml(item.category)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(
                item.confirmation_state,
              )}</small>
            </li>
          `)
          .join("");

      return `
        <section
          class="forge-fes06b-card"
          data-fes06b-surface="ACTIVITY"
          data-fes06b-state="READY"
        >
          <header>
            <span>Actividad</span>
            <strong>${model.surfaces.ACTIVITY.length}</strong>
          </header>
          <ul>${items}</ul>
        </section>
      `;
    }

    function renderMiDiaMarkup(model) {
      if (model.state !== "READY") {
        return stateMarkup(
          model,
          "MI_DIA",
        );
      }

      const items =
        model.surfaces.MI_DIA
          .slice(0, 5)
          .map(item => `
            <li>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.priority)}</span>
              <small>${escapeHtml(item.due_at)}</small>
            </li>
          `)
          .join("");

      return `
        <section
          class="forge-fes06b-card"
          data-fes06b-surface="MI_DIA"
          data-fes06b-state="READY"
        >
          <header>
            <span>Mi Día</span>
            <strong>${model.surfaces.MI_DIA.length}</strong>
          </header>
          <ul>${items}</ul>
        </section>
      `;
    }

    function renderPipelineMarkup(model) {
      if (model.state !== "READY") {
        return stateMarkup(
          model,
          "PIPELINE_CARD",
        );
      }

      const items =
        model.surfaces.PIPELINE_CARD
          .slice(0, 8)
          .map(item => `
            <article
              class="forge-fes06b-pipeline-row"
              data-fes06b-prospect-id="${escapeHtml(item.prospect_id)}"
            >
              <div>
                <strong>${escapeHtml(item.stage_label)}</strong>
                <span>${escapeHtml(item.last_activity_title)}</span>
              </div>
              <small>${escapeHtml(item.operational_status)}</small>
            </article>
          `)
          .join("");

      return `
        <section
          class="forge-fes06b-pipeline"
          data-fes06b-surface="PIPELINE_CARD"
          data-fes06b-state="READY"
        >
          <header>
            <div>
              <span>Evidencia y actividad</span>
              <strong>Lectura canónica</strong>
            </div>
            <small>${model.surfaces.PIPELINE_CARD.length} prospecto(s)</small>
          </header>
          <div>${items}</div>
        </section>
      `;
    }

    function renderProspectDetailMarkup(
      model,
      prospectId,
    ) {
      if (model.state !== "READY") {
        return stateMarkup(
          model,
          "PROSPECT_DETAIL",
        );
      }

      const item =
        model.surfaces
          .PROSPECT_DETAIL
          .find(
            candidate =>
              candidate.prospect_id ===
              prospectId,
          ) ||
        model.surfaces
          .PROSPECT_DETAIL[0];

      if (!item) {
        return stateMarkup(
          statusModel("EMPTY"),
          "PROSPECT_DETAIL",
        );
      }

      return `
        <section
          class="forge-fes06b-detail"
          data-fes06b-surface="PROSPECT_DETAIL"
          data-fes06b-state="READY"
          data-fes06b-prospect-id="${escapeHtml(item.prospect_id)}"
        >
          <header>
            <span>Historial gobernado</span>
            <strong>${escapeHtml(item.display_name)}</strong>
          </header>
          <dl>
            <div>
              <dt>Contextos</dt>
              <dd>${item.context_count}</dd>
            </div>
            <div>
              <dt>Citas</dt>
              <dd>${item.appointment_count}</dd>
            </div>
            <div>
              <dt>Acciones</dt>
              <dd>${item.due_action_count}</dd>
            </div>
            <div>
              <dt>Conflictos</dt>
              <dd>${item.conflict_count}</dd>
            </div>
          </dl>
        </section>
      `;
    }

    function styleText() {
      return `
        [data-fes06b-home-binding],
        [data-fes06b-pipeline-binding] {
          display: grid;
          gap: 12px;
          margin: 16px 0;
        }

        [data-fes06b-home-binding] {
          grid-template-columns:
            repeat(auto-fit, minmax(240px, 1fr));
        }

        .forge-fes06b-card,
        .forge-fes06b-pipeline,
        .forge-fes06b-detail,
        .forge-fes06b-state {
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.68);
          backdrop-filter: blur(18px);
          padding: 16px;
          color: inherit;
        }

        .forge-fes06b-card header,
        .forge-fes06b-pipeline > header,
        .forge-fes06b-detail header,
        .forge-fes06b-pipeline-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .forge-fes06b-card ul {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 14px 0 0;
          padding: 0;
        }

        .forge-fes06b-card li,
        .forge-fes06b-pipeline-row {
          border-top: 1px solid rgba(148, 163, 184, 0.16);
          padding-top: 10px;
        }

        .forge-fes06b-card li {
          display: grid;
          gap: 3px;
        }

        .forge-fes06b-card span,
        .forge-fes06b-card small,
        .forge-fes06b-pipeline span,
        .forge-fes06b-pipeline small,
        .forge-fes06b-detail span,
        .forge-fes06b-state span {
          color: var(--text-secondary, #94a3b8);
          font-size: 12px;
        }

        .forge-fes06b-pipeline > div {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .forge-fes06b-pipeline-row > div {
          display: grid;
          gap: 2px;
        }

        .forge-fes06b-detail {
          margin: 14px 0;
        }

        .forge-fes06b-detail dl {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(70px, 1fr));
          gap: 8px;
          margin: 14px 0 0;
        }

        .forge-fes06b-detail dl > div {
          border-radius: 12px;
          background: rgba(148, 163, 184, 0.08);
          padding: 10px;
        }

        .forge-fes06b-detail dt {
          color: var(--text-secondary, #94a3b8);
          font-size: 11px;
        }

        .forge-fes06b-detail dd {
          margin: 4px 0 0;
          font-weight: 800;
        }

        .forge-fes06b-state {
          display: grid;
          gap: 6px;
        }

        @media (max-width: 640px) {
          .forge-fes06b-detail dl {
            grid-template-columns:
              repeat(2, minmax(70px, 1fr));
          }
        }
      `;
    }

    function create({
      root = null,
      initialSnapshot = null,
    } = {}) {
      const documentRoot =
        root &&
        typeof root.querySelector ===
          "function"
          ? root
          : null;
      const windowRoot =
        documentRoot?.defaultView ||
        (
          typeof globalThis !==
          "undefined"
            ? globalThis
            : null
        );
      const controller =
        typeof AbortController !==
          "undefined"
          ? new AbortController()
          : null;

      let model =
        createSurfaceModel(
          initialSnapshot,
        );
      let homeHost = null;
      let pipelineHost = null;
      let pipelineOutlet = null;
      let detailObserver = null;

      function ensureStyles() {
        if (!documentRoot) {
          return;
        }

        if (
          documentRoot.querySelector(
            "[data-fes06b-binding-styles]",
          )
        ) {
          return;
        }

        const style =
          documentRoot.createElement(
            "style",
          );

        style.dataset
          .fes06bBindingStyles =
          BINDING_VERSION;
        style.textContent =
          styleText();
        documentRoot.head?.append(style);
      }

      function refreshHome() {
        if (!homeHost) {
          return;
        }

        homeHost.innerHTML =
          renderActivityMarkup(model) +
          renderMiDiaMarkup(model);
      }

      function refreshPipeline() {
        if (!pipelineHost) {
          return;
        }

        pipelineHost.innerHTML =
          renderPipelineMarkup(model);
        refreshDetails();
      }

      function detailProspectId(dialog) {
        return safeText(
          dialog?.dataset
            ?.prospectId ||
          dialog
            ?.querySelector(
              "[data-prospect-id]",
            )
            ?.dataset
            ?.prospectId ||
          "",
        );
      }

      function refreshDetails() {
        if (!pipelineOutlet) {
          return;
        }

        pipelineOutlet
          .querySelectorAll(
            "[data-prospect-detail-dialog]",
          )
          .forEach(dialog => {
            let host =
              dialog.querySelector(
                "[data-fes06b-prospect-detail-binding]",
              );

            if (!host) {
              host =
                documentRoot
                  .createElement(
                    "div",
                  );
              host.dataset
                .fes06bProspectDetailBinding =
                BINDING_VERSION;

              const article =
                dialog.querySelector(
                  "article",
                ) ||
                dialog;

              article.append(host);
            }

            const prospectId =
              detailProspectId(dialog);
            const renderKey = [
              model.state,
              model.snapshot_digest ||
                "NO_DIGEST",
              prospectId ||
                "NO_PROSPECT",
            ].join(":");

            if (
              host.dataset
                .fes06bRenderKey ===
              renderKey
            ) {
              return;
            }

            host.dataset
              .fes06bRenderKey =
              renderKey;
            host.innerHTML =
              renderProspectDetailMarkup(
                model,
                prospectId,
              );
          });
      }

      function mountHome(shell) {
        if (
          !documentRoot ||
          !shell ||
          typeof shell.querySelector !==
            "function"
        ) {
          return false;
        }

        ensureStyles();

        homeHost =
          shell.querySelector(
            "[data-fes06b-home-binding]",
          );

        if (!homeHost) {
          homeHost =
            documentRoot
              .createElement("section");
          homeHost.dataset
            .fes06bHomeBinding =
            BINDING_VERSION;
          homeHost.setAttribute(
            "aria-label",
            "Actividad comercial gobernada",
          );

          const anchor =
            shell.querySelector(
              ".primary-card",
            ) ||
            shell.querySelector(
              ".assistant-card",
            );

          if (
            anchor &&
            anchor.parentNode
          ) {
            anchor.parentNode.insertBefore(
              homeHost,
              anchor.nextSibling,
            );
          } else {
            shell.append(homeHost);
          }
        }

        refreshHome();
        return true;
      }

      function mountPipeline(outlet) {
        if (
          !documentRoot ||
          !outlet ||
          typeof outlet.querySelector !==
            "function"
        ) {
          return false;
        }

        ensureStyles();
        pipelineOutlet = outlet;
        pipelineHost =
          outlet.querySelector(
            "[data-fes06b-pipeline-binding]",
          );

        if (!pipelineHost) {
          pipelineHost =
            documentRoot
              .createElement("section");
          pipelineHost.dataset
            .fes06bPipelineBinding =
            BINDING_VERSION;
          pipelineHost.setAttribute(
            "aria-label",
            "Evidencia gobernada del Pipeline",
          );
          outlet.prepend(pipelineHost);
        }

        if (
          typeof MutationObserver !==
            "undefined" &&
          !detailObserver
        ) {
          detailObserver =
            new MutationObserver(
              refreshDetails,
            );
          detailObserver.observe(
            outlet,
            {
              childList: true,
              subtree: true,
            },
          );
        }

        refreshPipeline();
        return true;
      }

      function setSnapshot(snapshot) {
        model =
          createSurfaceModel(snapshot);
        refreshHome();
        refreshPipeline();
        return model;
      }

      function eventHandler(event) {
        setSnapshot(
          event?.detail?.snapshot ??
          event?.detail ??
          null,
        );
      }

      if (
        windowRoot &&
        typeof windowRoot
          .addEventListener ===
          "function"
      ) {
        windowRoot.addEventListener(
          EVENT_NAME,
          eventHandler,
          controller
            ? {
                signal:
                  controller.signal,
              }
            : undefined,
        );
      }

      function destroy() {
        controller?.abort();
        detailObserver?.disconnect();
        detailObserver = null;
        homeHost?.remove();
        pipelineHost?.remove();
        homeHost = null;
        pipelineHost = null;
        pipelineOutlet = null;
      }

      return deepFreeze({
        bindingVersion:
          BINDING_VERSION,
        eventName: EVENT_NAME,
        mountHome,
        mountPipeline,
        setSnapshot,
        current: () => model,
        destroy,
        diagnostics: () =>
          deepFreeze({
            binding_version:
              BINDING_VERSION,
            state: model.state,
            home_mounted:
              Boolean(homeHost),
            pipeline_mounted:
              Boolean(pipelineHost),
            detail_observer:
              Boolean(detailObserver),
            read_only: true,
            external_execution:
              false,
          }),
      });
    }

    return deepFreeze({
      BINDING_VERSION,
      SNAPSHOT_VERSION,
      ACCEPTANCE_VERSION,
      SURFACES,
      UI_STATES,
      EVENT_NAME,
      ProductiveUIBindingError,
      createSurfaceModel,
      renderActivityMarkup,
      renderMiDiaMarkup,
      renderPipelineMarkup,
      renderProspectDetailMarkup,
      styleText,
      create,
      _private: deepFreeze({
        isPlainObject,
        clone,
        deepFreeze,
        safeText,
        safeCount,
        escapeHtml,
        statusModel,
        resolveProjectionSnapshot,
        validateSnapshotShape,
        activityItem,
        prospectDetailItem,
        pipelineCardItem,
        miDiaItem,
      }),
    });
  },
);
