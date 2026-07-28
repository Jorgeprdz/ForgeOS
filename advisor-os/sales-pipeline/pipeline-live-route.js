import { Memory } from "../../memory-manager.js";
import { AppState } from "../../state-manager.js";
import {
  createPipelineDueActionRuntime,
} from "./pipeline-due-action-runtime.js";

await import('./sales-stage-registry.js');
await import('./pipeline-stage-read-model.js');
await import('./pipeline-ui.js');

const ROUTE_ID = "advisor-sales-pipeline";
let activeMount = null;
let mountSequence = 0;

const pipelineUI = globalThis.ForgePipelineUI;
const pipelineReadModel = globalThis.ForgePipelineStageReadModel;

function normalizeContext(params = {}) {
  const contextType = ["prospect", "opportunity"].includes(
    params.contextType,
  )
    ? params.contextType
    : null;
  const contextId =
    typeof params.contextId === "string" && params.contextId.trim()
      ? params.contextId.trim()
      : null;

  return { contextType, contextId };
}

function honestEmptyModel(context, dueActionEditor = null) {
  pipelineReadModel.buildPipelineStageReadModel({
    opportunities: [],
    prospects: [],
    writerAvailable: false,
    now: new Date().toISOString(),
  });

  if (context.contextType && context.contextId) {
    return {
      state: "partial",
      message:
        `Pipeline está disponible, pero ${
          context.contextType === "prospect"
            ? "el prospecto"
            : "la oportunidad"
        } ${context.contextId} no puede resolverse sin una fuente de persistencia canónica. La próxima acción local sí puede administrarse cuando existe identidad aprobada.`,
      dueActionEditor,
    };
  }

  return {
    state: "empty",
    message:
      "No hay oportunidades verificadas disponibles. La persistencia productiva continúa bloqueada hasta que exista una autoridad canónica.",
    dueActionEditor,
  };
}

function toLocalDateTimeValue(iso) {
  if (!iso || Number.isNaN(Date.parse(iso))) return "";

  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function resolveDisplayName(prospectReference) {
  const state = AppState.get("miDiaDueActions");

  if (
    state?.primaryRecommendation?.subjectId === prospectReference &&
    state.primaryRecommendation.subjectLabel
  ) {
    return state.primaryRecommendation.subjectLabel;
  }

  const queued = Array.isArray(state?.supportingQueue)
    ? state.supportingQueue.find(
        item => item.prospectReference === prospectReference,
      )
    : null;

  return queued?.approvedDisplayName || null;
}

function editorModel({
  prospectReference,
  approvedDisplayName,
  record,
  writerAvailable,
  message = null,
  state = "ready",
}) {
  return {
    state,
    prospectReference,
    approvedDisplayName:
      record?.approvedDisplayName || approvedDisplayName || null,
    writerAvailable,
    hasActiveAction:
      record?.dueActionState === "SCHEDULED" &&
      record?.tombstone !== true,
    nextActionType: record?.nextActionType || "CALL",
    nextActionLocalValue: toLocalDateTimeValue(
      record?.nextActionAt,
    ),
    message,
  };
}

export function renderAdvisorSalesPipeline() {
  return pipelineUI.renderPipelineUI({
    state: "loading",
    message: "Preparando el read model gobernado…",
  });
}

export async function bindAdvisorSalesPipeline(params = {}) {
  await new Promise(resolve => requestAnimationFrame(resolve));

  const root = document.querySelector(".forge-pipeline");

  if (!root) {
    throw new Error("PIPELINE_LIVE_MOUNT_ROOT_MISSING");
  }

  if (activeMount?.root === root) return;

  const context = normalizeContext(params);
  const mountId = ++mountSequence;
  const user = AppState.get("user");
  const advisorPartitionKey = String(user?.id || "").trim();
  const remoteEnabled = user?.app_metadata?.demo !== true;

  let dueActionRuntime = null;
  let focusedProspectReference = context.contextId;
  let focusedDisplayName = focusedProspectReference
    ? resolveDisplayName(focusedProspectReference)
    : null;
  let currentRecord = null;

  if (advisorPartitionKey) {
    dueActionRuntime = createPipelineDueActionRuntime({
      advisorPartitionKey: advisorPartitionKey,
      remoteEnabled,
      authenticated: true,
      onStatus: status => {
        if (activeMount?.mountId !== mountId) return;

        const statusElement = activeMount.root.querySelector(
          "[data-due-action-status]",
        );

        if (
          statusElement &&
          ["SYNCED", "REMOTE_DISABLED", "OFFLINE"].includes(
            status.status,
          )
        ) {
          statusElement.textContent =
            status.status === "SYNCED"
              ? "Guardado localmente y sincronizado."
              : status.status === "OFFLINE"
                ? "Guardado localmente. Se sincronizará al recuperar conexión."
                : "Guardado en este dispositivo.";
        }
      },
    });
  }

  if (dueActionRuntime && focusedProspectReference) {
    currentRecord = await dueActionRuntime.load(
      focusedProspectReference,
    );
    focusedDisplayName =
      currentRecord?.approvedDisplayName || focusedDisplayName;
  }

  const initialEditor = focusedProspectReference
    ? editorModel({
        prospectReference: focusedProspectReference,
        approvedDisplayName: focusedDisplayName,
        record: currentRecord,
        writerAvailable: Boolean(
          dueActionRuntime && focusedDisplayName,
        ),
        message:
          dueActionRuntime && focusedDisplayName
            ? "La próxima acción se guarda primero en este dispositivo."
            : "No existe identidad aprobada suficiente para crear una nueva próxima acción.",
      })
    : null;

  root.outerHTML = pipelineUI.renderPipelineUI(
    honestEmptyModel(context, initialEditor),
  );

  const mountedRoot = document.querySelector(".forge-pipeline");
  mountedRoot.dataset.routeId = ROUTE_ID;
  mountedRoot.dataset.pipelineMountId = String(mountId);
  mountedRoot.dataset.pipelineMountState = "mounted";

  activeMount = {
    root: mountedRoot,
    mountId,
  };

  const editorHost = mountedRoot.querySelector(
    "[data-due-action-editor-host]",
  );

  async function showEditor({
    prospectReference,
    approvedDisplayName = null,
    message = null,
    state = "ready",
  }) {
    focusedProspectReference = prospectReference;
    focusedDisplayName =
      approvedDisplayName ||
      resolveDisplayName(prospectReference);

    currentRecord = dueActionRuntime
      ? await dueActionRuntime.load(prospectReference)
      : null;

    focusedDisplayName =
      currentRecord?.approvedDisplayName ||
      focusedDisplayName;

    pipelineUI.hydrateDueActionEditor(
      editorHost,
      editorModel({
        prospectReference,
        approvedDisplayName: focusedDisplayName,
        record: currentRecord,
        writerAvailable: Boolean(
          dueActionRuntime && focusedDisplayName,
        ),
        message,
        state,
      }),
    );
  }

  async function executeCommand(operation, form = null) {
    if (
      !dueActionRuntime ||
      !focusedProspectReference ||
      !focusedDisplayName
    ) {
      await showEditor({
        prospectReference: focusedProspectReference,
        approvedDisplayName: focusedDisplayName,
        state: "error",
        message:
          "No existe sesión o identidad aprobada suficiente para guardar.",
      });
      return;
    }

    const formData = form ? new FormData(form) : null;
    const nextActionType =
      formData?.get("nextActionType") || undefined;
    const localDateTime =
      formData?.get("nextActionAt") || undefined;
    const nextActionAt = localDateTime
      ? new Date(String(localDateTime)).toISOString()
      : undefined;

    await showEditor({
      prospectReference: focusedProspectReference,
      approvedDisplayName: focusedDisplayName,
      state: "saving",
      message: "Guardando primero en este dispositivo…",
    });

    try {
      const result = await dueActionRuntime.execute({
        operation,
        prospectReference: focusedProspectReference,
        approvedDisplayName: focusedDisplayName,
        nextActionType,
        nextActionAt,
      });

      currentRecord = result.record;

      await showEditor({
        prospectReference: focusedProspectReference,
        approvedDisplayName: focusedDisplayName,
        state: "saved",
        message:
          "Guardado localmente. La sincronización continúa sin bloquearte.",
      });

      void result.syncPromise.then(syncResult => {
        if (activeMount?.mountId !== mountId) return;

        const statusElement = mountedRoot.querySelector(
          "[data-due-action-status]",
        );

        if (!statusElement) return;

        statusElement.textContent =
          syncResult.status === "SYNCED"
            ? "Guardado localmente y sincronizado."
            : syncResult.status === "OFFLINE"
              ? "Guardado localmente. Se sincronizará al recuperar conexión."
              : syncResult.status === "CONFLICT_REVIEW_REQUIRED"
                ? "Guardado localmente. Existe un conflicto que requiere revisión."
                : "Guardado localmente. La sincronización quedó pendiente.";
      });
    } catch (error) {
      await showEditor({
        prospectReference: focusedProspectReference,
        approvedDisplayName: focusedDisplayName,
        state: "error",
        message:
          error?.code === "ACTIVE_DUE_ACTION_ALREADY_EXISTS"
            ? "Ya existe una próxima acción activa. Usa reprogramar."
            : "No fue posible guardar la próxima acción.",
      });
    }
  }

  const clickHandler = event => {
    const calendarButton = event.target.closest(
      "[data-card-calendar]",
    );

    if (calendarButton) {
      const card = calendarButton.closest(
        "[data-prospect-id]",
      );
      const prospectReference =
        calendarButton.dataset.cardCalendar;
      const approvedDisplayName =
        card?.dataset.prospectName || null;

      void showEditor({
        prospectReference,
        approvedDisplayName,
        message:
          "Define la próxima acción. Se guardará localmente primero.",
      });
      return;
    }

    const commandButton = event.target.closest(
      "[data-due-action-command]",
    );

    if (commandButton) {
      void executeCommand(
        commandButton.dataset.dueActionCommand,
      );
      return;
    }

    const prospectButton = event.target.closest(
      "[data-open-prospect]",
    );

    if (!prospectButton) return;

    const card = prospectButton.closest("[data-prospect-id]");

    void showEditor({
      prospectReference:
        prospectButton.dataset.openProspect,
      approvedDisplayName:
        card?.dataset.prospectName || null,
      message:
        "La ficha completa depende de persistencia canónica. La próxima acción local está disponible.",
    });
  };

  const submitHandler = event => {
    const form = event.target.closest(
      "[data-due-action-form]",
    );

    if (!form) return;

    event.preventDefault();

    void executeCommand(
      currentRecord?.dueActionState === "SCHEDULED" &&
        currentRecord?.tombstone !== true
        ? "RESCHEDULE"
        : "SCHEDULE",
      form,
    );
  };

  mountedRoot.addEventListener("click", clickHandler);
  mountedRoot.addEventListener("submit", submitHandler);

  Memory.add(() => {
    mountedRoot.removeEventListener(
      "click",
      clickHandler,
    );
    mountedRoot.removeEventListener(
      "submit",
      submitHandler,
    );

    void dueActionRuntime?.close();

    if (activeMount?.mountId === mountId) {
      activeMount = null;
    }
  });
}

export const PIPELINE_ROUTE_METADATA = Object.freeze({
  routeId: ROUTE_ID,
  domain: "ADVISOR_OS",
  moduleId:
    "advisor-os.sales-pipeline.live-route.067g16",
  title: "Pipeline",
  navigation: {
    mobile: true,
    desktop: true,
  },
  deepLink: {
    supported: true,
    contexts: ["prospect", "opportunity"],
  },
});
