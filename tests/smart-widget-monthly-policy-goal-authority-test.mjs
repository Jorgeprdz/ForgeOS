import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createAdvisorMonthlyPolicyGoalRepository,
} from "../advisor-os/forge-alive/smart-widgets/advisor-monthly-policy-goal-repository.mjs";

const row = {
  advisor_id: "advisor-1",
  year_month: "2026-08-01",
  target_policy_count: 10,
  revision: 2,
  reason: "stretch",
  evidence_reference: "manual",
  effective_from: "2026-08-01T00:00:00Z",
  supersedes_goal_id: "goal-1",
  created_at: "2026-08-01T00:00:00Z",
};

const chain = {
  select() { return this; },
  eq() { return this; },
  order() { return this; },
  limit() { return this; },
  async maybeSingle() { return { data: row, error: null }; },
};

const client = {
  from() { return chain; },
  async rpc(name, args) {
    assert.equal(name, "forge_set_monthly_policy_goal");
    assert.equal(args.p_target_policy_count, 12);
    return { data: { ...row, target_policy_count: 12, revision: 3 }, error: null };
  },
};

const repository = createAdvisorMonthlyPolicyGoalRepository({
  client,
  getSessionAdvisorId: async () => "advisor-1",
});

const current = await repository.readCurrent({ advisorId: "advisor-1", yearMonth: "2026-08" });
assert.equal(current.targetPolicyCount, 10);

const appended = await repository.append({ advisorId: "advisor-1", yearMonth: "2026-08", targetPolicyCount: 12 });
assert.equal(appended.revision, 3);

await assert.rejects(
  () => repository.readCurrent({ advisorId: "advisor-2", yearMonth: "2026-08" }),
  /CROSS_ADVISOR/,
);
await assert.rejects(
  () => repository.append({ advisorId: "advisor-1", yearMonth: "bad", targetPolicyCount: 1 }),
  /YYYY-MM/,
);
await assert.rejects(
  () => repository.append({ advisorId: "advisor-1", yearMonth: "2026-08", targetPolicyCount: 0 }),
  /between 1 and 1000/,
);

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = fs.readFileSync(
  path.join(here, "../supabase/migrations/20260801000400_smart_widget_monthly_policy_goals.sql"),
  "utf8",
);
assert.match(migration, /enable row level security/i);
assert.match(migration, /using \(advisor_id = auth\.uid\(\)\)/i);
assert.match(migration, /ADVISOR_MONTHLY_POLICY_GOAL_APPEND_ONLY/i);
assert.match(migration, /grant execute on function public\.forge_set_monthly_policy_goal/i);
assert.doesNotMatch(migration, /grant (insert|update|delete).*authenticated/i);

console.log("Smart Widget Monthly Policy Goal Authority PASS 10/10");
