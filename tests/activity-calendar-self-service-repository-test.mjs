import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createOperationalCalendarRepository } = require("../platform/operational-calendar/operational-calendar-repository.js");

function memoryClient() {
  const rows = new Map([
    ["operational_calendar_profiles", []],
    ["operational_day_overrides", []],
    ["advisor_time_off_periods", []],
  ]);
  let sequence = 0;

  class Query {
    constructor(table) {
      this.table = table;
      this.filters = [];
      this.mode = "select";
      this.pendingRow = null;
    }
    select() { return this; }
    insert(row) { this.mode = "insert"; this.pendingRow = structuredClone(row); return this; }
    eq(key, value) { this.filters.push((row) => String(row[key]) === String(value)); return this; }
    or() { return this; }
    lte() { return this; }
    gte() { return this; }
    abortSignal() { return this; }
    filtered() { return rows.get(this.table).filter((row) => this.filters.every((filter) => filter(row))); }
    async single() {
      if (this.mode === "insert") {
        const tableRows = rows.get(this.table);
        const duplicate = tableRows.find((row) =>
          row.tenant_id === this.pendingRow.tenant_id &&
          row.idempotency_key === this.pendingRow.idempotency_key
        );
        if (duplicate) return { data: null, error: { code: "23505" } };
        const inserted = {
          id: `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`,
          ...this.pendingRow,
        };
        tableRows.push(inserted);
        return { data: structuredClone(inserted), error: null };
      }
      const selected = this.filtered()[0] || null;
      return selected
        ? { data: structuredClone(selected), error: null }
        : { data: null, error: { code: "PGRST116" } };
    }
    then(resolve, reject) {
      return Promise.resolve({ data: structuredClone(this.filtered()), error: null }).then(resolve, reject);
    }
  }

  return {
    from(table) {
      assert.ok(rows.has(table), `unexpected table ${table}`);
      return new Query(table);
    },
    rows,
  };
}

const fixedClock = () => new Date("2026-08-06T03:00:00.000Z");

test("advisor explicitly confirms timezone and working weekdays without defaults", async () => {
  const client = memoryClient();
  const repository = createOperationalCalendarRepository({
    client,
    getSessionAdvisorId: async () => "11111111-1111-4111-8111-111111111111",
    clock: fixedClock,
  });

  const first = await repository.appendAdvisorProfile({
    timezone: "America/Mexico_City",
    workingWeekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    effectiveFrom: "2026-08-06",
  });
  const repeated = await repository.appendAdvisorProfile({
    timezone: "America/Mexico_City",
    workingWeekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    effectiveFrom: "2026-08-06",
  });

  assert.equal(first.profileId, repeated.profileId);
  assert.equal(first.timezone, "America/Mexico_City");
  assert.deepEqual(first.workingWeekdays, ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
  assert.equal(first.source.evidenceState, "CONFIRMED");
  assert.equal(client.rows.get("operational_calendar_profiles").length, 1);
  assert.match(client.rows.get("operational_calendar_profiles")[0].command_digest, /^[a-f0-9]{64}$/);
});

test("vacation is appended as advisor-confirmed time off and stays idempotent", async () => {
  const client = memoryClient();
  const advisorId = "22222222-2222-4222-8222-222222222222";
  const repository = createOperationalCalendarRepository({
    client,
    getSessionAdvisorId: async () => advisorId,
    clock: fixedClock,
  });

  const first = await repository.appendTimeOff({
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    timezone: "America/Mexico_City",
    category: "VACATION",
  });
  const repeated = await repository.appendTimeOff({
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    timezone: "America/Mexico_City",
    category: "VACATION",
  });

  assert.equal(first.recordId, repeated.recordId);
  assert.equal(first.status, "CONFIRMED");
  assert.equal(first.confirmationState, "CONFIRMED");
  assert.equal(first.actor.id, advisorId);
  assert.equal(first.provenance.confirmation_state, "ADVISOR_CONFIRMED");
  assert.equal(client.rows.get("advisor_time_off_periods").length, 1);
});

test("invalid or missing operational choices are rejected instead of defaulted", async () => {
  const repository = createOperationalCalendarRepository({
    client: memoryClient(),
    getSessionAdvisorId: async () => "33333333-3333-4333-8333-333333333333",
    clock: fixedClock,
  });

  await assert.rejects(
    repository.appendAdvisorProfile({
      timezone: "",
      workingWeekdays: [],
      effectiveFrom: "2026-08-06",
    }),
    (error) => error.code === "OPCAL_TIMEZONE_INVALID",
  );

  await assert.rejects(
    repository.appendAdvisorProfile({
      timezone: "America/Mexico_City",
      workingWeekdays: [],
      effectiveFrom: "2026-08-06",
    }),
    (error) => error.code === "OPCAL_WORKING_WEEKDAYS_INVALID",
  );
});

console.log("OPERATIONAL_CALENDAR_SELF_SERVICE_PROFILE=PASS");
console.log("OPERATIONAL_CALENDAR_SELF_SERVICE_VACATION=PASS");
console.log("OPERATIONAL_CALENDAR_SILENT_DEFAULTS=ZERO");
