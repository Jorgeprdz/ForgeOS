"use strict";

export const SURFACE_ADAPTER_VERSION = "NFAST-09.3E";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function signal(code, label) {
  return { code, label };
}

export function createMiDiaDueActionSurfaceModel(viewModel = {}) {
  const items = Array.isArray(viewModel.items) ? viewModel.items : [];
  const primary = items[0] || null;
  const supportingQueue = items.slice(1);

  if (!primary) {
    return deepFreeze({
      surfaceAdapterVersion: SURFACE_ADAPTER_VERSION,
      sourceFingerprint: viewModel.fingerprint || null,
      primaryRecommendation: {
        recommendationAvailable: false,
        limitations: [
          viewModel.summary ||
            "No hay próximas acciones con evidencia suficiente en las siguientes 24 horas.",
        ],
      },
      supportingQueue,
      diagnostics: {
        existingPrimarySurfaceOnly: true,
        newPermanentDashboardSection: false,
        smartWidgetBinding: false,
        staticPreviewMutation: false,
        finalAuthority: "HUMAN",
      },
    });
  }

  const conflict = primary.conflict === true;
  const stale = primary.stale === true;

  const supportingSignals = [
    signal("due_bucket", `${primary.bucketLabel}: ${primary.dueText}`),
    signal(
      "replica_state",
      stale
        ? "Datos locales disponibles; sincronización pendiente o antigua."
        : "Réplica local sincronizada.",
    ),
  ];

  if (viewModel.hiddenActionableCount > 0) {
    supportingSignals.push(
      signal(
        "additional_due_actions",
        `${viewModel.hiddenActionableCount} acción(es) adicional(es) requieren revisión.`,
      ),
    );
  }

  const uncertainty = [];

  if (conflict) {
    uncertainty.push(
      "Existen cambios incompatibles entre dispositivos; Forge no eligió un ganador automáticamente.",
    );
  }

  if (stale) {
    uncertainty.push(
      "La réplica local puede no contener el último cambio remoto.",
    );
  }

  const primaryRecommendation = {
    recommendationAvailable: true,
    recommendationId: `nfast09:${primary.itemKey}`,
    recommendationSource: "NFAST09_DUE_ACTION",
    kicker: conflict
      ? "Conflicto de seguimiento"
      : "Siguiente mejor acción",
    recommendedAction: conflict
      ? "Revisar conflicto"
      : primary.actionLabel,
    subjectId: primary.prospectReference,
    subjectLabel: primary.approvedDisplayName,
    whyNow: conflict
      ? "La próxima acción tiene cambios incompatibles entre dispositivos y requiere una decisión humana."
      : primary.dueText,
    targetOutcome: conflict
      ? "Resolver el conflicto sin perder ninguna de las dos versiones."
      : "Completar, reprogramar o cerrar la próxima acción con confirmación humana.",
    suggestedChannel: primary.actionLabel,
    suggestedArgument:
      "Abre el prospecto y revisa el contexto confirmado antes de contactar.",
    supportingSignals,
    uncertainty,
    responseActionsAllowed: false,
    boundaryText:
      "El asesor decide. Forge no contactará automáticamente al prospecto.",
  };

  return deepFreeze({
    surfaceAdapterVersion: SURFACE_ADAPTER_VERSION,
    sourceFingerprint: viewModel.fingerprint || null,
    primaryRecommendation,
    supportingQueue,
    diagnostics: {
      existingPrimarySurfaceOnly: true,
      newPermanentDashboardSection: false,
      smartWidgetBinding: false,
      staticPreviewMutation: false,
      finalAuthority: "HUMAN",
    },
  });
}
