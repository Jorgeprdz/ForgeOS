import { assertActivityRecord, createActivityTruthKey } from "../domain/activity-record.mjs";
import {
  ActivityRepositoryConflictError,
  ActivityRepositoryReferenceError,
  assertActivityRepositoryPort,
  createActivityIdentityQuery,
  createActivityRepositoryQuery,
  createActivityTruthQuery,
} from "../application/activity-repository-port.mjs";
import {
  activityPageFromPersistenceRows,
  activityRecordFromPersistenceRow,
} from "./activity-persistence-codec.mjs";

export class ActivityPersistenceError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "ActivityPersistenceError";
  }
}

function persistenceError(error, operation) {
  const code = error?.code ?? error?.details?.code ?? "";
  const message = error?.message ?? `${operation} failed`;
  if (code === "23505") return new ActivityRepositoryConflictError(message);
  if (code === "23503" || code === "P0002") return new ActivityRepositoryReferenceError(message);
  return new ActivityPersistenceError(`${operation}: ${message}`, { cause: error });
}

export class SupabaseActivityRepository {
  #client;
  constructor({ client }) {
    if (!client || typeof client.rpc !== "function") throw new TypeError("SupabaseActivityRepository requires a client with rpc()");
    this.#client = client;
    assertActivityRepositoryPort(this);
  }

  async #rpc(
    name,
    parameters,
    { preserveArray = false } = {},
  ) {
    const response =
      await this.#client.rpc(
        name,
        parameters,
      );

    if (
      !response ||
      typeof response !== "object"
    ) {
      throw new ActivityPersistenceError(
        `${name}: invalid Supabase response`,
      );
    }

    if (response.error) {
      throw persistenceError(
        response.error,
        name,
      );
    }

    if (preserveArray) {
      return response.data;
    }

    return (
      Array.isArray(response.data) &&
      response.data.length === 1
    )
      ? response.data[0]
      : response.data;
  }

  async append(input) {
    const record = assertActivityRecord(input);
    const truthKey = createActivityTruthKey(record);
    const data = await this.#rpc("activity_records_append_v1", { p_record: record, p_truth_key: truthKey });
    if (!data || typeof data !== "object" || !data.row) throw new ActivityPersistenceError("append RPC returned invalid data");
    return Object.freeze({ record: activityRecordFromPersistenceRow(data.row), inserted: data.inserted === true, truthKey });
  }

  async getById(input) {
    const query = createActivityIdentityQuery(input);
    const data = await this.#rpc("activity_records_get_by_id_v1", { p_organization_id: query.organizationId, p_id: query.id });
    return data === null ? null : activityRecordFromPersistenceRow(data);
  }

  async getByTruthKey(input) {
    const query = createActivityTruthQuery(input);
    const data = await this.#rpc("activity_records_get_by_truth_v1", { p_organization_id: query.organizationId, p_truth_key: query.truthKey });
    return data === null ? null : activityRecordFromPersistenceRow(data);
  }

  async list(input) {
    const query = createActivityRepositoryQuery(input);
    const data = await this.#rpc(
      "activity_records_list_v1",
      {
        p_query: {
          ...query,
          limit: query.limit + 1,
        },
      },
      { preserveArray: true },
    );

    return activityPageFromPersistenceRows(
      data ?? [],
      query,
    );
  }

  async size(input) {
    const query = createActivityRepositoryQuery({ ...input, limit: 1 });
    const data = await this.#rpc("activity_records_count_v1", { p_query: query });
    const count = typeof data === "string" ? Number(data) : data;
    if (!Number.isSafeInteger(count) || count < 0) throw new ActivityPersistenceError("count RPC returned invalid data");
    return count;
  }
}
