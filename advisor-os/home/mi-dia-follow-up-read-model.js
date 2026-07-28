"use strict";

import {
  DUE_BUCKETS,
  buildDueActionPriorityQueue,
} from "../sales-pipeline/prospect-due-action-priority-contract.js";

export const READ_MODEL_VERSION = "NFAST-09.3E";

const LABELS = Object.freeze({
  SYNC_CONFLICT: "Revisar conflicto",
  OVERDUE: "Vencido",
  DUE_NOW: "Ahora",
  DUE_TODAY: "Hoy",
  UPCOMING_24H: "Próximas 24 h",
});

const TONES = Object.freeze({
  SYNC_CONFLICT: "danger",
  OVERDUE: "danger",
  DUE_NOW: "warning",
  DUE_TODAY: "primary",
  UPCOMING_24H: "neutral",
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  return `{${Object.keys(value).sort().map(
    key => `${JSON.stringify(key)}:${stableStringify(value[key])}`,
  ).join(",")}}`;
}

function hash(value) {
  const text = stableStringify(value);
  let result = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    result ^= text.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
}

function validIso(value) {
  return typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Date.parse(value));
}

function actionLabel(value) {
  const normalized = String(value || "").trim();
  return ({
    CALL: "Llamar",
    WHATSAPP: "WhatsApp",
    EMAIL: "Correo",
    ZOOM: "Videollamada",
    MEETING: "Reunión",
    FOLLOW_UP: "Seguimiento",
  })[normalized.toUpperCase()] || normalized || "Seguimiento";
}

function dueText(record, bucket, asOf, timeZone) {
  if (bucket === DUE_BUCKETS.SYNC_CONFLICT) {
    return "Elige qué cambio conservar";
  }

  const due = new Date(record.nextActionAt);
  const now = new Date(asOf);
  const deltaMinutes = Math.round((due - now) / 60_000);

  const time = new Intl.DateTimeFormat("es-MX", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(due);

  if (bucket === DUE_BUCKETS.OVERDUE) {
    const minutes = Math.abs(deltaMinutes);
    if (minutes < 60) return `Venció hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Venció hace ${hours} h`;
    return `Venció hace ${Math.floor(hours / 24)} d`;
  }

  if (bucket === DUE_BUCKETS.DUE_NOW) {
    return `Programado para ${time}`;
  }

  if (bucket === DUE_BUCKETS.DUE_TODAY) {
    return `Hoy, ${time}`;
  }

  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(due);
}

function freshness(record, asOf, staleAfterMinutes) {
  const source = record.lastSyncedAt || record.remoteUpdatedAt;
  if (!validIso(source)) {
    return { stale: true, ageMinutes: null };
  }

  const ageMinutes = Math.max(
    0,
    Math.floor((Date.parse(asOf) - Date.parse(source)) / 60_000),
  );

  return {
    stale: ageMinutes > staleAfterMinutes,
    ageMinutes,
  };
}

export function createMiDiaFollowUpReadModel({
  records,
  asOf,
  timeZone,
  maxItems = 5,
  staleAfterMinutes = 15,
} = {}) {
  if (!Array.isArray(records)) {
    throw new TypeError("LOCAL_RECORDS_INVALID");
  }
  if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > 20) {
    throw new TypeError("MAX_ITEMS_INVALID");
  }

  const queue = buildDueActionPriorityQueue(records, { asOf, timeZone });

  const items = queue.items.slice(0, maxItems).map(
    ({ record, classification }) => {
      const state = freshness(record, asOf, staleAfterMinutes);
      return {
        itemKey: `${record.prospectReference}:${record.dueActionVersion}`,
        prospectReference: record.prospectReference,
        approvedDisplayName:
          String(record.approvedDisplayName || "Prospecto"),
        nextActionType: record.nextActionType,
        actionLabel: actionLabel(record.nextActionType),
        nextActionAt: record.nextActionAt,
        dueActionState: record.dueActionState,
        dueActionVersion: record.dueActionVersion,
        bucket: classification.bucket,
        bucketLabel: LABELS[classification.bucket],
        tone: TONES[classification.bucket],
        dueText: dueText(record, classification.bucket, asOf, timeZone),
        acknowledgementState: record.acknowledgementState,
        syncState: record.syncState,
        stale: state.stale,
        ageMinutes: state.ageMinutes,
        conflict:
          classification.bucket === DUE_BUCKETS.SYNC_CONFLICT,
        seenDoesNotHide: true,
      };
    },
  );

  const view = {
    readModelVersion: READ_MODEL_VERSION,
    generatedAt: new Date(asOf).toISOString(),
    timeZone,
    totalLocalRecords: queue.totalRecords,
    actionableCount: queue.actionableCount,
    visibleCount: items.length,
    hiddenActionableCount:
      Math.max(0, queue.actionableCount - items.length),
    counts: queue.counts,
    items,
    empty: items.length === 0,
    summary: items.length === 0
      ? "No tienes seguimientos vencidos o programados para las próximas 24 horas."
      : `${items.length} seguimiento${items.length === 1 ? "" : "s"} requieren tu atención.`,
    diagnostics: {
      localReplicaOnly: true,
      remoteReadRequired: false,
      sensitiveContextIncluded: false,
      seenOverdueHidden: false,
    },
  };

  const fingerprintSource = {
    timeZone: view.timeZone,
    totalLocalRecords: view.totalLocalRecords,
    actionableCount: view.actionableCount,
    visibleCount: view.visibleCount,
    hiddenActionableCount: view.hiddenActionableCount,
    counts: view.counts,
    items: view.items,
    empty: view.empty,
    summary: view.summary,
  };

  return deepFreeze({
    ...view,
    fingerprint: `NFAST09-MIDIA-${hash(fingerprintSource)}`,
  });
}
