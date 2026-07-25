"use strict";

(function timelineBriefProjectionServiceModule(root, factory) {
  const projectionContract =
    typeof module !== "undefined" &&
    module.exports
      ? require(
          "./nash-timeline-to-conversation-brief-projection-contract",
        )
      : root
          .ForgeNashTimelineToConversationBriefProjectionContractNFAST09;

  const api = factory(projectionContract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeNashTimelineToConversationBriefProjectionServiceNFAST09 =
      api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function timelineBriefProjectionServiceFactory(
    projectionContract,
  ) {
    if (!projectionContract) {
      throw new Error(
        "NFAST_09_PROJECTION_CONTRACT_REQUIRED",
      );
    }

    const PROJECTION_SERVICE_VERSION = "NFAST-09.2";

    const ALLOWED_OPTION_KEYS = Object.freeze([
      "asOf",
      "freshnessRules",
      "requiredEventTypes",
      "maxEvents",
      "before",
    ]);

    class TimelineBriefProjectionServiceError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name =
          "TimelineBriefProjectionServiceError";
        this.code = code;
        this.details = details;
      }
    }

    function isObject(value) {
      return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value),
      );
    }

    function clone(value) {
      if (value === undefined) return undefined;
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

      for (const nested of Object.values(value)) {
        deepFreeze(nested);
      }

      return value;
    }

    function isIsoDate(value) {
      return Boolean(
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Date.parse(value)),
      );
    }

    function isOpaqueReference(value) {
      return Boolean(
        typeof value === "string" &&
        /^[A-Za-z0-9._:-]{1,160}$/.test(
          value.trim(),
        ),
      );
    }

    function normalizeOptions(options = {}) {
      if (!isObject(options)) {
        throw new TimelineBriefProjectionServiceError(
          "OPTIONS_INVALID",
          "Las opciones de proyección no son válidas.",
        );
      }

      const unsupportedKeys = Object.keys(options)
        .filter(
          key => !ALLOWED_OPTION_KEYS.includes(key),
        );

      if (unsupportedKeys.length > 0) {
        throw new TimelineBriefProjectionServiceError(
          "OPTIONS_INVALID",
          "Las opciones de proyección contienen campos no autorizados.",
          {
            unsupportedKeys,
          },
        );
      }

      if (!isIsoDate(options.asOf)) {
        throw new TimelineBriefProjectionServiceError(
          "AS_OF_REQUIRED",
          "La fecha determinista de proyección es obligatoria.",
        );
      }

      const maxEvents =
        options.maxEvents === undefined
          ? 100
          : Number(options.maxEvents);

      if (
        !Number.isInteger(maxEvents) ||
        maxEvents < 1 ||
        maxEvents > 100
      ) {
        throw new TimelineBriefProjectionServiceError(
          "MAX_EVENTS_INVALID",
          "El límite de eventos debe estar entre 1 y 100.",
        );
      }

      const freshnessRules =
        options.freshnessRules === undefined
          ? {}
          : options.freshnessRules;

      if (!isObject(freshnessRules)) {
        throw new TimelineBriefProjectionServiceError(
          "FRESHNESS_RULES_INVALID",
          "Las reglas de vigencia no son válidas.",
        );
      }

      const requiredEventTypes =
        options.requiredEventTypes === undefined
          ? []
          : options.requiredEventTypes;

      if (!Array.isArray(requiredEventTypes)) {
        throw new TimelineBriefProjectionServiceError(
          "REQUIRED_EVENT_TYPES_INVALID",
          "Los tipos de evento requeridos no son válidos.",
        );
      }

      const before =
        options.before === undefined ||
        options.before === null ||
        options.before === ""
          ? null
          : options.before;

      if (before !== null && !isIsoDate(before)) {
        throw new TimelineBriefProjectionServiceError(
          "BEFORE_CURSOR_INVALID",
          "El cursor temporal del Timeline no es válido.",
        );
      }

      const asOf = new Date(
        options.asOf,
      ).toISOString();

      const normalizedBefore =
        before === null
          ? null
          : new Date(before).toISOString();

      if (
        normalizedBefore !== null &&
        normalizedBefore > asOf
      ) {
        throw new TimelineBriefProjectionServiceError(
          "BEFORE_AFTER_AS_OF",
          "El cursor del Timeline no puede ser posterior a la proyección.",
        );
      }

      return deepFreeze({
        asOf,
        freshnessRules: clone(freshnessRules),
        requiredEventTypes:
          clone(requiredEventTypes),
        maxEvents,
        before: normalizedBefore,
      });
    }

    function mapTimelineReadError(error) {
      if (
        error instanceof
        TimelineBriefProjectionServiceError
      ) {
        throw error;
      }

      const sourceCode = String(
        error?.code || "",
      );

      const mappings = {
        AUTH_REQUIRED: {
          code: "AUTH_REQUIRED",
          message:
            "Tu sesión expiró. Inicia sesión nuevamente.",
        },
        PROSPECT_NOT_FOUND: {
          code: "PROSPECT_NOT_FOUND",
          message:
            "No encontramos el prospecto.",
        },
        VALIDATION_ERROR: {
          code: "TIMELINE_VALIDATION_ERROR",
          message:
            "El Timeline no cumple el contrato gobernado.",
        },
        NETWORK_ERROR: {
          code: "TIMELINE_READ_FAILED",
          message:
            "No pudimos consultar el Timeline.",
        },
      };

      const mapped =
        mappings[sourceCode] ||
        mappings.NETWORK_ERROR;

      throw new TimelineBriefProjectionServiceError(
        mapped.code,
        mapped.message,
        {
          sourceCode:
            sourceCode || "UNKNOWN",
        },
      );
    }

    function create(timelineService) {
      if (
        !timelineService ||
        typeof timelineService
          .listProspectTimeline !== "function"
      ) {
        throw new TimelineBriefProjectionServiceError(
          "TIMELINE_SERVICE_REQUIRED",
          "El servicio gobernado del Timeline es obligatorio.",
        );
      }

      async function projectProspectTimeline(
        prospectReference,
        options = {},
      ) {
        const normalizedProspectReference =
          String(
            prospectReference || "",
          ).trim();

        if (
          !isOpaqueReference(
            normalizedProspectReference,
          )
        ) {
          throw new TimelineBriefProjectionServiceError(
            "PROSPECT_REFERENCE_INVALID",
            "El prospecto es obligatorio.",
          );
        }

        const normalizedOptions =
          normalizeOptions(options);

        let timelineEvents;

        try {
          const readOptions = {
            limit:
              normalizedOptions.maxEvents,
          };

          if (
            normalizedOptions.before !== null
          ) {
            readOptions.before =
              normalizedOptions.before;
          }

          timelineEvents =
            await timelineService
              .listProspectTimeline(
                normalizedProspectReference,
                readOptions,
              );
        } catch (error) {
          mapTimelineReadError(error);
        }

        if (!Array.isArray(timelineEvents)) {
          throw new TimelineBriefProjectionServiceError(
            "TIMELINE_RESPONSE_INVALID",
            "El Timeline devolvió una respuesta no válida.",
          );
        }

        const projectionResult =
          projectionContract
            .projectTimelineToConversationContext({
              prospectReference:
                normalizedProspectReference,
              timelineEvents,
              projectionMetadata: {
                asOf:
                  normalizedOptions.asOf,
                freshnessRules:
                  normalizedOptions
                    .freshnessRules,
                requiredEventTypes:
                  normalizedOptions
                    .requiredEventTypes,
                maxEvents:
                  normalizedOptions.maxEvents,
              },
            });

        return deepFreeze(
          clone(projectionResult),
        );
      }

      return deepFreeze({
        serviceVersion:
          PROJECTION_SERVICE_VERSION,
        projectionContractVersion:
          projectionContract
            .PROJECTION_CONTRACT_VERSION,
        projectionMode:
          projectionContract.PROJECTION_MODE,
        projectProspectTimeline,
        diagnostics: () =>
          deepFreeze({
            governedTimelineReadAllowed: true,
            directDatabaseAccessAllowed: false,
            directNetworkAccessAllowed: false,
            networkAccessDelegatedToTimelineService:
              true,
            persistentProjectionTable: false,
            persistenceAllowed: false,
            providerInvocationAllowed: false,
            draftGenerationAllowed: false,
            messageGenerationAllowed: false,
            timelineAppendAllowed: false,
            timelineUpdateAllowed: false,
            timelineDeleteAllowed: false,
            pipelineMutationAllowed: false,
            productiveRuntimeIntegrated: false,
          }),
      });
    }

    return deepFreeze({
      PROJECTION_SERVICE_VERSION,
      TimelineBriefProjectionServiceError,
      create,
      _private: {
        isObject,
        clone,
        deepFreeze,
        isIsoDate,
        isOpaqueReference,
        normalizeOptions,
        mapTimelineReadError,
      },
    });
  },
);
