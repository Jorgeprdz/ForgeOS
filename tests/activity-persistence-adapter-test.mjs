import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createActivityRecord, createActivityTruthKey } from "../advisor-os/activity/domain/activity-record.mjs";
import { ActivityRepositoryConflictError, ActivityRepositoryReferenceError, assertActivityRepositoryPort } from "../advisor-os/activity/application/activity-repository-port.mjs";
import { ActivityPersistenceCodecError, activityPageFromPersistenceRows, activityRecordFromPersistenceRow, activityRecordToPersistenceRow } from "../advisor-os/activity/infrastructure/activity-persistence-codec.mjs";
import { ActivityPersistenceError, SupabaseActivityRepository } from "../advisor-os/activity/infrastructure/supabase-activity-repository.mjs";

const MIGRATION = "supabase/migrations/20260726000200_act04_activity_records.sql";

function record(id = "activity-001", overrides = {}) {
  return createActivityRecord({
    schemaVersion: "activity-record.v1", id, organizationId: "organization-001", advisorId: "advisor-001",
    managerId: "manager-001", prospectId: "prospect-001", opportunityId: "opportunity-001",
    appointmentId: `appointment-${id}`, policyId: null, type: "INITIAL_APPOINTMENT_COMPLETED",
    subtype: "FIRST_MEETING", lifecycle: "CONFIRMED",
    source: { system: "PIPELINE", eventId: `event-${id}`, recordedAt: "2026-07-26T15:10:00.000Z", producerVersion: "pipeline.v1", evidenceState: "VERIFIED" },
    occurredAt: "2026-07-26T15:00:00.000Z", evaluationDate: "2026-07-26", timeZone: "America/Mexico_City",
    confirmation: { method: "PIPELINE_STATE", confirmedAt: "2026-07-26T15:12:00.000Z", confirmedBy: "advisor-001" },
    correction: null, reversal: null, metadata: { channel: "IN_PERSON" }, revision: 1,
    createdAt: "2026-07-26T15:10:00.000Z", updatedAt: "2026-07-26T15:12:00.000Z", ...overrides,
  });
}

function row(id = "activity-001", overrides = {}) {
  return { ...activityRecordToPersistenceRow(record(id)), ...overrides };
}

class FakeClient {
  constructor(responses = []) { this.responses = [...responses]; this.calls = []; }
  async rpc(name, parameters) { this.calls.push({ name, parameters }); return this.responses.shift(); }
}

test("codec maps canonical record", () => {
  const value = activityRecordToPersistenceRow(record());
  assert.equal(value.organization_id, "organization-001");
  assert.equal(value.truth_key, createActivityTruthKey(record()));
});

test("codec round-trips", () => {
  const value = record();
  assert.deepEqual(activityRecordFromPersistenceRow(activityRecordToPersistenceRow(value)), value);
});

test("codec rejects indexed mismatch", () => {
  assert.throws(() => activityRecordFromPersistenceRow(row("activity-001", { organization_id: "organization-002" })), ActivityPersistenceCodecError);
});

test("codec rejects truth mismatch", () => {
  assert.throws(() => activityRecordFromPersistenceRow(row("activity-001", { truth_key: "activity:invalid" })), /truth_key does not match payload/);
});

test("page decoder applies limit", () => {
  const page = activityPageFromPersistenceRows([row("activity-001"), row("activity-002")], { limit: 1 });
  assert.equal(page.items.length, 1);
  assert.equal(page.nextCursor.id, "activity-001");
});

test("adapter requires rpc client", () => {
  assert.throws(() => new SupabaseActivityRepository({ client: {} }), /requires a client with rpc/);
});

test("adapter satisfies repository port", () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient() });
  assert.equal(assertActivityRepositoryPort(repository), repository);
});

test("append uses governed RPC", async () => {
  const client = new FakeClient([{ data: { row: row(), inserted: true }, error: null }]);
  const result = await new SupabaseActivityRepository({ client }).append(record());
  assert.equal(result.inserted, true);
  assert.equal(client.calls[0].name, "activity_records_append_v1");
});

test("append exact replay", async () => {
  const client = new FakeClient([{ data: { row: row(), inserted: false }, error: null }]);
  assert.equal((await new SupabaseActivityRepository({ client }).append(record())).inserted, false);
});

test("append maps conflict", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: null, error: { code: "23505", message: "conflict" } }]) });
  await assert.rejects(repository.append(record()), ActivityRepositoryConflictError);
});

test("append maps reference failure", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: null, error: { code: "P0002", message: "missing" } }]) });
  await assert.rejects(repository.append(record()), ActivityRepositoryReferenceError);
});

test("append maps generic persistence failure", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: null, error: { code: "XX000", message: "offline" } }]) });
  await assert.rejects(repository.append(record()), ActivityPersistenceError);
});

test("getById decodes row", async () => {
  const client = new FakeClient([{ data: row(), error: null }]);
  const result = await new SupabaseActivityRepository({ client }).getById({ organizationId: "organization-001", id: "activity-001" });
  assert.equal(result.id, "activity-001");
  assert.equal(client.calls[0].name, "activity_records_get_by_id_v1");
});

test("getById returns null", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: null, error: null }]) });
  assert.equal(await repository.getById({ organizationId: "organization-001", id: "missing" }), null);
});

test("getByTruthKey scopes organization", async () => {
  const truthKey = createActivityTruthKey(record());
  const client = new FakeClient([{ data: row(), error: null }]);
  await new SupabaseActivityRepository({ client }).getByTruthKey({ organizationId: "organization-001", truthKey });
  assert.deepEqual(client.calls[0].parameters, { p_organization_id: "organization-001", p_truth_key: truthKey });
});

test("list preserves a singleton row array", async () => {
  const client = new FakeClient([
    {
      data: [row()],
      error: null,
    },
  ]);

  const page =
    await new SupabaseActivityRepository({
      client,
    }).list({
      organizationId:
        "organization-001",
      limit: 5,
    });

  assert.equal(page.items.length, 1);
  assert.equal(
    page.items[0].id,
    "activity-001",
  );
  assert.equal(
    client.calls[0].parameters
      .p_query.limit,
    6,
  );
});

test("list preserves filters", async () => {
  const client = new FakeClient([{ data: [], error: null }]);
  await new SupabaseActivityRepository({ client }).list({ organizationId: "organization-001", advisorId: "advisor-001", types: ["POLICY_PAID"], order: "asc" });
  assert.deepEqual(client.calls[0].parameters.p_query.types, ["POLICY_PAID"]);
});

test("size accepts bigint string", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: "7", error: null }]) });
  assert.equal(await repository.size({ organizationId: "organization-001" }), 7);
});

test("size rejects invalid result", async () => {
  const repository = new SupabaseActivityRepository({ client: new FakeClient([{ data: "nope", error: null }]) });
  await assert.rejects(repository.size({ organizationId: "organization-001" }), ActivityPersistenceError);
});

test("migration creates append-only table", () => {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  assert.match(sql, /create table if not exists public\.activity_records/i);
  assert.match(sql, /activity_records is append-only/i);
});

test("migration enables RLS", () => {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /activity_records_select_own/i);
  assert.match(sql, /activity_records_insert_own/i);
});

test("migration exposes five governed RPCs", () => {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  for (const name of ["activity_records_append_v1", "activity_records_get_by_id_v1", "activity_records_get_by_truth_v1", "activity_records_list_v1", "activity_records_count_v1"]) {
    assert.match(sql, new RegExp(`create or replace function\\s+public\\.${name}`, "i"));
  }
});

test("migration has no update or delete policy", () => {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  assert.doesNotMatch(sql, /create policy .*update/i);
  assert.doesNotMatch(sql, /create policy .*delete/i);
});

test("migration checks payload indexes", () => {
  const sql = fs.readFileSync(MIGRATION, "utf8");
  assert.match(sql, /payload ->> 'id' = id/i);
  assert.match(sql, /payload ->> 'organizationId'/i);
  assert.match(sql, /payload ->> 'advisorId'/i);
});
