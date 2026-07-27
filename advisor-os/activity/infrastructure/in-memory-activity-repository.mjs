import {
  assertActivityRecord,
  createActivityTruthKey,
} from "../domain/activity-record.mjs";

import {
  ActivityRepositoryConflictError,
  ActivityRepositoryReferenceError,
  createActivityIdentityQuery,
  createActivityRepositoryQuery,
  createActivityTruthQuery,
} from "../application/activity-repository-port.mjs";

function canonicalRecord(record) {
  return JSON.stringify(record);
}

function freezeResult(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    freezeResult(nested);
  }

  return Object.freeze(value);
}

function compareRecord(left, right, order) {
  const instant =
    left.occurredAt.localeCompare(
      right.occurredAt,
    );

  if (instant !== 0) {
    return order === "asc"
      ? instant
      : -instant;
  }

  const id = left.id.localeCompare(right.id);

  return order === "asc"
    ? id
    : -id;
}

function isAfterCursor(
  record,
  cursor,
  order,
) {
  if (!cursor) {
    return true;
  }

  const cursorRecord = {
    occurredAt: cursor.occurredAt,
    id: cursor.id,
  };

  return (
    compareRecord(
      record,
      cursorRecord,
      order,
    ) > 0
  );
}

function includesOrAll(values, candidate) {
  return (
    values === null ||
    values.includes(candidate)
  );
}

export class InMemoryActivityRepository {
  #recordsById = new Map();
  #recordsByTruth = new Map();

  async append(input) {
    const record =
      assertActivityRecord(input);
    const truthKey =
      createActivityTruthKey(record);

    const existingById =
      this.#recordsById.get(record.id);

    if (existingById) {
      if (
        canonicalRecord(existingById) ===
        canonicalRecord(record)
      ) {
        return freezeResult({
          record: existingById,
          inserted: false,
          truthKey,
        });
      }

      throw new ActivityRepositoryConflictError(
        `activity id ${record.id} already exists with different content`,
      );
    }

    const existingByTruth =
      this.#recordsByTruth.get(truthKey);

    if (existingByTruth) {
      if (
        canonicalRecord(existingByTruth) ===
        canonicalRecord(record)
      ) {
        return freezeResult({
          record: existingByTruth,
          inserted: false,
          truthKey,
        });
      }

      throw new ActivityRepositoryConflictError(
        `truth key ${truthKey} already exists with different content`,
      );
    }

    const relation =
      record.correction ??
      record.reversal;

    if (relation) {
      const target =
        this.#recordsById.get(
          relation.activityId,
        );

      if (!target) {
        throw new ActivityRepositoryReferenceError(
          `referenced activity ${relation.activityId} does not exist`,
        );
      }

      if (
        target.organizationId !==
        record.organizationId
      ) {
        throw new ActivityRepositoryReferenceError(
          "referenced activity belongs to another organization",
        );
      }

      if (
        target.advisorId !==
        record.advisorId
      ) {
        throw new ActivityRepositoryReferenceError(
          "referenced activity belongs to another advisor",
        );
      }
    }

    this.#recordsById.set(
      record.id,
      record,
    );
    this.#recordsByTruth.set(
      truthKey,
      record,
    );

    return freezeResult({
      record,
      inserted: true,
      truthKey,
    });
  }

  async getById(input) {
    const query =
      createActivityIdentityQuery(input);
    const record =
      this.#recordsById.get(query.id);

    if (
      !record ||
      record.organizationId !==
        query.organizationId
    ) {
      return null;
    }

    return record;
  }

  async getByTruthKey(input) {
    const query =
      createActivityTruthQuery(input);
    const record =
      this.#recordsByTruth.get(
        query.truthKey,
      );

    if (
      !record ||
      record.organizationId !==
        query.organizationId
    ) {
      return null;
    }

    return record;
  }

  async list(input) {
    const query =
      createActivityRepositoryQuery(input);

    const records = [];

    for (const record of this.#recordsById.values()) {
      if (
        record.organizationId !==
        query.organizationId
      ) {
        continue;
      }

      if (
        query.advisorId &&
        record.advisorId !==
          query.advisorId
      ) {
        continue;
      }

      if (
        !includesOrAll(
          query.types,
          record.type,
        ) ||
        !includesOrAll(
          query.lifecycles,
          record.lifecycle,
        ) ||
        !includesOrAll(
          query.sourceSystems,
          record.source.system,
        ) ||
        !includesOrAll(
          query.evidenceStates,
          record.source.evidenceState,
        )
      ) {
        continue;
      }

      if (
        query.prospectId &&
        record.prospectId !==
          query.prospectId
      ) {
        continue;
      }

      if (
        query.opportunityId &&
        record.opportunityId !==
          query.opportunityId
      ) {
        continue;
      }

      if (
        query.appointmentId &&
        record.appointmentId !==
          query.appointmentId
      ) {
        continue;
      }

      if (
        query.policyId &&
        record.policyId !==
          query.policyId
      ) {
        continue;
      }

      if (
        query.evaluationDateFrom &&
        record.evaluationDate <
          query.evaluationDateFrom
      ) {
        continue;
      }

      if (
        query.evaluationDateTo &&
        record.evaluationDate >
          query.evaluationDateTo
      ) {
        continue;
      }

      if (
        query.occurredAtFrom &&
        record.occurredAt <
          query.occurredAtFrom
      ) {
        continue;
      }

      if (
        query.occurredAtTo &&
        record.occurredAt >
          query.occurredAtTo
      ) {
        continue;
      }

      records.push(record);
    }

    records.sort(
      (left, right) => compareRecord(
        left,
        right,
        query.order,
      ),
    );

    const afterCursor =
      records.filter(
        (record) => isAfterCursor(
          record,
          query.cursor,
          query.order,
        ),
      );

    const items = afterCursor.slice(
      0,
      query.limit,
    );

    const hasMore =
      afterCursor.length > items.length;

    const last =
      items.at(-1);

    const nextCursor =
      hasMore && last
        ? Object.freeze({
            occurredAt: last.occurredAt,
            id: last.id,
          })
        : null;

    return freezeResult({
      items: Object.freeze([...items]),
      nextCursor,
    });
  }

  async size(input) {
    const query =
      createActivityRepositoryQuery({
        ...input,
        limit: 500,
      });

    let count = 0;

    for (const record of this.#recordsById.values()) {
      if (
        record.organizationId ===
          query.organizationId &&
        (
          query.advisorId === null ||
          record.advisorId ===
            query.advisorId
        )
      ) {
        count += 1;
      }
    }

    return count;
  }
}
