"use strict";

export const PRIORITY_VERSION = "NFAST-09.3E";

export const DUE_BUCKETS = Object.freeze({
  SYNC_CONFLICT: "SYNC_CONFLICT",
  OVERDUE: "OVERDUE",
  DUE_NOW: "DUE_NOW",
  DUE_TODAY: "DUE_TODAY",
  UPCOMING_24H: "UPCOMING_24H",
  NOT_DUE: "NOT_DUE",
  INVALID_OR_UNKNOWN: "INVALID_OR_UNKNOWN",
});

const BUCKET_RANK = Object.freeze({
  SYNC_CONFLICT: 0,
  OVERDUE: 1,
  DUE_NOW: 2,
  DUE_TODAY: 3,
  UPCOMING_24H: 4,
  NOT_DUE: 5,
  INVALID_OR_UNKNOWN: 6,
});

const ACK_RANK = Object.freeze({
  UNSEEN: 0,
  SNOOZED: 1,
  SEEN: 2,
  ACKNOWLEDGED: 3,
});

export class ProspectDueActionPriorityError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "ProspectDueActionPriorityError";
    this.code = code;
    this.details = details;
  }
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

function validIso(value) {
  return typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Date.parse(value));
}

function normalizeTimeZone(value) {
  const timeZone = String(value || "").trim();
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
  } catch {
    throw new ProspectDueActionPriorityError(
      "TIME_ZONE_INVALID",
      "La zona horaria no es válida.",
    );
  }
  return timeZone;
}

function localDay(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function classifyDueAction(
  record,
  {
    asOf,
    timeZone,
    dueNowWindowMinutes = 15,
  } = {},
) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new ProspectDueActionPriorityError(
      "DUE_ACTION_RECORD_INVALID",
      "La próxima acción no es válida.",
    );
  }

  if (!validIso(asOf)) {
    throw new ProspectDueActionPriorityError(
      "AS_OF_INVALID",
      "La fecha de evaluación no es válida.",
    );
  }

  const zone = normalizeTimeZone(timeZone);

  if (!Number.isInteger(dueNowWindowMinutes) ||
      dueNowWindowMinutes < 0 ||
      dueNowWindowMinutes > 180) {
    throw new ProspectDueActionPriorityError(
      "DUE_NOW_WINDOW_INVALID",
      "La ventana inmediata no es válida.",
    );
  }

  const acknowledgementState =
    String(record.acknowledgementState || "UNSEEN");

  if (record.dueActionState === "CONFLICT_REVIEW_REQUIRED" ||
      record.syncState === "CONFLICT_REVIEW_REQUIRED") {
    return deepFreeze({
      bucket: DUE_BUCKETS.SYNC_CONFLICT,
      actionable: true,
      deltaMs: null,
      acknowledgementState,
      acknowledgementRank: ACK_RANK[acknowledgementState] ?? 0,
      seenDoesNotHide: true,
    });
  }

  if (record.dueActionState !== "SCHEDULED" || record.tombstone === true) {
    return deepFreeze({
      bucket: DUE_BUCKETS.NOT_DUE,
      actionable: false,
      deltaMs: null,
      acknowledgementState,
      acknowledgementRank: ACK_RANK[acknowledgementState] ?? 0,
      seenDoesNotHide: true,
    });
  }

  if (!validIso(record.nextActionAt) ||
      !String(record.nextActionType || "").trim()) {
    return deepFreeze({
      bucket: DUE_BUCKETS.INVALID_OR_UNKNOWN,
      actionable: false,
      deltaMs: null,
      acknowledgementState,
      acknowledgementRank: ACK_RANK[acknowledgementState] ?? 0,
      seenDoesNotHide: true,
    });
  }

  const now = new Date(asOf);
  const due = new Date(record.nextActionAt);
  const deltaMs = due.getTime() - now.getTime();

  if (acknowledgementState === "SNOOZED" &&
      validIso(record.snoozedUntil) &&
      new Date(record.snoozedUntil) > now) {
    return deepFreeze({
      bucket: DUE_BUCKETS.NOT_DUE,
      actionable: false,
      deltaMs,
      acknowledgementState,
      acknowledgementRank: ACK_RANK[acknowledgementState],
      seenDoesNotHide: true,
    });
  }

  const windowMs = dueNowWindowMinutes * 60_000;
  let bucket = DUE_BUCKETS.NOT_DUE;

  if (Math.abs(deltaMs) <= windowMs) {
    bucket = DUE_BUCKETS.DUE_NOW;
  } else if (deltaMs < -windowMs) {
    bucket = DUE_BUCKETS.OVERDUE;
  } else if (localDay(due, zone) === localDay(now, zone)) {
    bucket = DUE_BUCKETS.DUE_TODAY;
  } else if (deltaMs <= 86_400_000) {
    bucket = DUE_BUCKETS.UPCOMING_24H;
  }

  return deepFreeze({
    bucket,
    actionable: [
      DUE_BUCKETS.OVERDUE,
      DUE_BUCKETS.DUE_NOW,
      DUE_BUCKETS.DUE_TODAY,
      DUE_BUCKETS.UPCOMING_24H,
    ].includes(bucket),
    deltaMs,
    acknowledgementState,
    acknowledgementRank: ACK_RANK[acknowledgementState] ?? 0,
    seenDoesNotHide: true,
  });
}

export function buildDueActionPriorityQueue(records, options = {}) {
  if (!Array.isArray(records)) {
    throw new ProspectDueActionPriorityError(
      "DUE_ACTION_RECORDS_INVALID",
      "La colección local no es válida.",
    );
  }

  const classified = records.map(record => ({
    record: clone(record),
    classification: classifyDueAction(record, options),
  }));

  const items = classified
    .filter(item => item.classification.actionable)
    .sort((left, right) => {
      const bucketDiff =
        BUCKET_RANK[left.classification.bucket] -
        BUCKET_RANK[right.classification.bucket];

      if (bucketDiff !== 0) return bucketDiff;

      if (left.classification.bucket !== DUE_BUCKETS.SYNC_CONFLICT) {
        const ackDiff =
          left.classification.acknowledgementRank -
          right.classification.acknowledgementRank;
        if (ackDiff !== 0) return ackDiff;
      }

      const leftTime = Date.parse(left.record.nextActionAt || "");
      const rightTime = Date.parse(right.record.nextActionAt || "");

      if (Number.isFinite(leftTime) &&
          Number.isFinite(rightTime) &&
          leftTime !== rightTime) {
        return leftTime - rightTime;
      }

      return String(left.record.prospectReference || "")
        .localeCompare(String(right.record.prospectReference || ""));
    });

  const counts = Object.fromEntries(
    Object.values(DUE_BUCKETS).map(bucket => [bucket, 0]),
  );

  classified.forEach(item => {
    counts[item.classification.bucket] += 1;
  });

  return deepFreeze({
    priorityVersion: PRIORITY_VERSION,
    items,
    counts,
    totalRecords: records.length,
    actionableCount: items.length,
    diagnostics: {
      deterministic: true,
      timeZoneRequired: true,
      conflictFirst: true,
      seenOverdueMayBeHidden: false,
      seenOverdueMayBeDeprioritized: true,
      silentLastWriteWinsAllowed: false,
    },
  });
}
