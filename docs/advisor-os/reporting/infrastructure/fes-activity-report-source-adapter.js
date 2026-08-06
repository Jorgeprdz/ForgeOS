import {
  createActivityReportSourcePort,
} from "../application/activity-report-source-port.js";

import {
  FES_ACTIVITY_EVENT_SCHEMA_VERSION,
  REPORTABLE_ACTIVITY_TYPES,
  assertCanonicalFesActivityEvent,
  resolveCountableActivityFacts,
} from "../domain/activity-event-authority-mapping.js";

export const FES_ACTIVITY_REPORT_SOURCE_ADAPTER_SCHEMA_VERSION =
  "fes-activity-report-source-adapter.v1";

export const FES_ACTIVITY_EVENT_READ_QUERY_SCHEMA_VERSION =
  "fes-activity-event-read-query.v1";

export const FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION =
  "fes-activity-event-authority-snapshot.v1";

export const FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION =
  "fes-activity-period-aggregation.v1";

const INPUT_KEYS = new Set([
  "organizationId",
  "advisorId",
  "timeZone",
  "readEvents",
  "classifyAppointment",
]);

const AGGREGATION_QUERY_KEYS = new Set([
  "evaluationDateFrom",
  "evaluationDateTo",
  "asOf",
]);

const SNAPSHOT_KEYS = new Set([
  "schemaVersion",
  "authority",
  "source",
  "events",
]);

const AUTHORITY_KEYS = new Set([
  "organizationId",
  "advisorId",
]);

const SOURCE_KEYS = new Set([
  "sourceId",
  "sourceVersion",
  "authority",
]);

export class FesActivityReportSourceAdapterError extends TypeError {
  constructor(message) {
    super(`FesActivityReportSourceAdapter: ${message}`);
    this.name = "FesActivityReportSourceAdapterError";
  }
}

function fail(message) {
  throw new FesActivityReportSourceAdapterError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function exactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${label} contains unknown field ${key}`);
    }
  }
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function calendarDate(value, label) {
  const normalized = requiredString(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    fail(`${label} must use YYYY-MM-DD`);
  }
  const [year, month, day] = normalized.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    fail(`${label} must be a real calendar date`);
  }
  return normalized;
}

function instant(value, label) {
  const normalized = requiredString(value, label);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    fail(`${label} must be an ISO instant`);
  }
  return parsed.toISOString();
}

function timeZone(value) {
  const normalized = requiredString(value, "timeZone");
  try {
    new Intl.DateTimeFormat("en", { timeZone: normalized }).format();
  } catch {
    fail("timeZone must be a valid IANA zone");
  }
  return normalized;
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function localCalendarDate(value, zone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const selected = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );

  return `${selected.year}-${selected.month}-${selected.day}`;
}

function inRange(value, from, to) {
  return value >= from && value <= to;
}

function emptyCounts() {
  return Object.fromEntries(
    REPORTABLE_ACTIVITY_TYPES.map((activityType) => [activityType, 0]),
  );
}

function increment(map, code) {
  map.set(code, (map.get(code) ?? 0) + 1);
}

function normalizeSnapshot(value, authority) {
  plain(value, "authority snapshot");
  exactKeys(value, SNAPSHOT_KEYS, "authority snapshot");

  if (
    value.schemaVersion !==
    FES_ACTIVITY_EVENT_AUTHORITY_SNAPSHOT_SCHEMA_VERSION
  ) {
    fail("authority snapshot schemaVersion is unsupported");
  }

  plain(value.authority, "authority snapshot.authority");
  exactKeys(value.authority, AUTHORITY_KEYS, "authority snapshot.authority");

  if (
    value.authority.organizationId !== authority.organizationId ||
    value.authority.advisorId !== authority.advisorId
  ) {
    fail("authority snapshot drifted from the bound Activity authority");
  }

  plain(value.source, "authority snapshot.source");
  exactKeys(value.source, SOURCE_KEYS, "authority snapshot.source");
  const source = {
    sourceId: requiredString(value.source.sourceId, "authority snapshot.source.sourceId"),
    sourceVersion: requiredString(
      value.source.sourceVersion,
      "authority snapshot.source.sourceVersion",
    ),
    authority: requiredString(
      value.source.authority,
      "authority snapshot.source.authority",
    ),
  };

  if (source.authority !== "FES_CANONICAL_ACTIVITY_EVENT") {
    fail("authority snapshot source is not the canonical FES event authority");
  }

  if (!Array.isArray(value.events)) {
    fail("authority snapshot.events must be an array");
  }

  return {
    source,
    events: value.events.map(assertCanonicalFesActivityEvent),
  };
}

function normalizeAggregationQuery(value) {
  plain(value, "aggregation query");
  exactKeys(value, AGGREGATION_QUERY_KEYS, "aggregation query");

  const evaluationDateFrom = calendarDate(
    value.evaluationDateFrom,
    "aggregation query.evaluationDateFrom",
  );
  const evaluationDateTo = calendarDate(
    value.evaluationDateTo,
    "aggregation query.evaluationDateTo",
  );

  if (evaluationDateFrom > evaluationDateTo) {
    fail("aggregation query date range is reversed");
  }

  return {
    evaluationDateFrom,
    evaluationDateTo,
    asOf: instant(value.asOf, "aggregation query.asOf"),
  };
}

export function createFesActivityReportSourceAdapter(input) {
  plain(input, "input");
  exactKeys(input, INPUT_KEYS, "input");

  const authority = Object.freeze({
    organizationId: requiredString(input.organizationId, "organizationId"),
    advisorId: requiredString(input.advisorId, "advisorId"),
  });
  const zone = timeZone(input.timeZone);

  if (typeof input.readEvents !== "function") {
    fail("readEvents must be a function");
  }
  if (
    input.classifyAppointment !== undefined &&
    typeof input.classifyAppointment !== "function"
  ) {
    fail("classifyAppointment must be a function when supplied");
  }

  const sourcePort = createActivityReportSourcePort({
    ...authority,
    activityTypes: REPORTABLE_ACTIVITY_TYPES,

    async aggregatePeriod(queryInput) {
      const query = normalizeAggregationQuery(queryInput);
      const readQuery = freeze({
        schemaVersion: FES_ACTIVITY_EVENT_READ_QUERY_SCHEMA_VERSION,
        authority,
        evaluationDateFrom: query.evaluationDateFrom,
        evaluationDateTo: query.evaluationDateTo,
        asOf: query.asOf,
        timeZone: zone,
        includeCorrectionLineage: true,
      });

      const snapshot = normalizeSnapshot(
        await input.readEvents(readQuery),
        authority,
      );
      const asOfMs = new Date(query.asOf).getTime();
      const exclusions = new Map();
      const visibleEvents = [];
      const eventDates = new Map();

      for (const event of snapshot.events) {
        if (event.schema_version !== FES_ACTIVITY_EVENT_SCHEMA_VERSION) {
          fail("event schema drifted after snapshot normalization");
        }
        if (event.tenant_id !== authority.organizationId) {
          fail(`event ${event.event_id} crossed the bound tenant authority`);
        }

        const eventDate = localCalendarDate(event.occurred_at, zone);
        eventDates.set(event.event_id, eventDate);

        if (new Date(event.recorded_at).getTime() > asOfMs) {
          if (inRange(eventDate, query.evaluationDateFrom, query.evaluationDateTo)) {
            increment(exclusions, "RECORDED_AFTER_AS_OF");
          }
          continue;
        }

        visibleEvents.push(event);
      }

      const resolved = resolveCountableActivityFacts(visibleEvents, {
        classifyAppointment: input.classifyAppointment,
      });
      const daily = new Map();

      for (const fact of resolved.facts) {
        const evaluationDate = localCalendarDate(fact.occurredAt, zone);
        if (!inRange(evaluationDate, query.evaluationDateFrom, query.evaluationDateTo)) {
          continue;
        }

        if (!daily.has(evaluationDate)) {
          daily.set(evaluationDate, emptyCounts());
        }
        daily.get(evaluationDate)[fact.activityType] += 1;
      }

      for (const excluded of resolved.exclusions) {
        const evaluationDate = eventDates.get(excluded.eventId);
        if (
          evaluationDate &&
          inRange(evaluationDate, query.evaluationDateFrom, query.evaluationDateTo)
        ) {
          increment(exclusions, excluded.reason);
        }
      }

      const days = [...daily.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([evaluationDate, countsByType]) => freeze({
          evaluationDate,
          countsByType,
          activityCount: Object.values(countsByType).reduce(
            (total, count) => total + count,
            0,
          ),
        }));
      const totalActivityCount = days.reduce(
        (total, day) => total + day.activityCount,
        0,
      );

      return freeze({
        schemaVersion: FES_ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
        authority,
        period: {
          evaluationDateFrom: query.evaluationDateFrom,
          evaluationDateTo: query.evaluationDateTo,
          asOf: query.asOf,
          timeZone: zone,
        },
        status: totalActivityCount === 0 ? "EMPTY" : "READY",
        activityTypes: REPORTABLE_ACTIVITY_TYPES,
        days,
        totalActivityCount,
        exclusions: [...exclusions.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([code, count]) => ({ code, count })),
        provenance: {
          sourceId: snapshot.source.sourceId,
          sourceVersion: snapshot.source.sourceVersion,
          authority: snapshot.source.authority,
        },
        boundary: {
          eventTruthAuthority: false,
          activityReadAuthority: true,
          activityWriteAuthority: false,
          advisorAttributionAuthority: false,
          appointmentClassificationAuthority: false,
          reportingAggregationAuthority: false,
          scoringAuthority: false,
          uiAuthority: false,
          persistenceMutationAuthority: false,
        },
      });
    },
  });

  return freeze({
    schemaVersion: FES_ACTIVITY_REPORT_SOURCE_ADAPTER_SCHEMA_VERSION,
    sourcePort,
    authority,
    timeZone: zone,
    boundary: {
      canonicalEventReadAuthority: false,
      eventTruthAuthority: false,
      activityMappingAuthority: false,
      activityReadAuthority: true,
      activityWriteAuthority: false,
      reportingAggregationAuthority: false,
      uiAuthority: false,
      persistenceMutationAuthority: false,
    },
  });
}
