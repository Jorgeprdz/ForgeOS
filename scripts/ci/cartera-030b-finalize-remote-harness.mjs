import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const targetBranch = process.env.CARTERA_030B_FINAL_ACCEPTANCE_BRANCH;
assert.equal(
  targetBranch,
  'run/cartera-030b-target-remote-launch-20260731-2120',
  'FINAL_ACCEPTANCE_BRANCH_MISMATCH',
);

function replaceExactly(source, before, after, label) {
  const count = source.split(before).length - 1;
  assert.equal(count, 1, `${label}_REPLACEMENT_COUNT_INVALID`);
  const result = source.replace(before, after);
  assert.ok(!result.includes(before), `${label}_OLD_VALUE_REMAINS`);
  assert.equal(
    result.split(after).length - 1,
    1,
    `${label}_NEW_VALUE_COUNT_INVALID`,
  );
  return result;
}

const oldBranch = 'run/cartera-030b-identity-collision-diagnostic-20260731-2035';

const runnerPath = 'scripts/ci/cartera-030b-remote-acceptance.mjs';
let runner = readFileSync(runnerPath, 'utf8');
runner = replaceExactly(runner, oldBranch, targetBranch, 'RUNNER_BRANCH');
writeFileSync(runnerPath, runner);

const contractPath = 'tests/cartera-030b-remote-acceptance-contract-test.mjs';
let contract = readFileSync(contractPath, 'utf8');
contract = replaceExactly(
  contract,
  "  assert.match(source, /run\\/cartera-030b-identity-collision-diagnostic-20260731-2035/);",
  "  assert.match(source, /run\\/cartera-030b-target-remote-launch-20260731-2120/);",
  'CONTRACT_BRANCH',
);
writeFileSync(contractPath, contract);

const sqlPath = 'scripts/ci/cartera-030b-remote-acceptance.sql';
let sql = readFileSync(sqlPath, 'utf8');
const startAnchor = `DO $$
begin
  if not exists (
    select 1
    from public.cartera030b_obligation_conflicts c
    join cartera030b_acceptance_ids ids on ids.forged_reference = (
      c.claims ->> 'obligationReference'
    )
    where c.conflict_type = 'OBLIGATION_IDENTITY_COLLISION'
  ) then
`;
const endAnchor = `

  if to_regprocedure('public.forge_cartera030b_reconcile_payment_event(jsonb)')`;
const start = sql.indexOf(startAnchor);
assert.ok(start >= 0, 'IDENTITY_ASSERTION_START_ANCHOR_MISSING');
assert.equal(
  sql.indexOf(startAnchor, start + startAnchor.length),
  -1,
  'IDENTITY_ASSERTION_START_ANCHOR_AMBIGUOUS',
);
const end = sql.indexOf(endAnchor, start);
assert.ok(end > start, 'IDENTITY_ASSERTION_END_ANCHOR_MISSING');

const replacement = `DO $$
declare
  identity_response jsonb;
begin
  select payload
  into identity_response
  from cartera030b_acceptance_results
  where name = 'identity-collision';

  if identity_response ->> 'generationState' <> 'CONFLICT'
    or identity_response ->> 'reason' <> 'OBLIGATION_IDENTITY_COLLISION'
    or nullif(identity_response ->> 'conflictReference', '') is null then
    raise exception 'CARTERA030B_IDENTITY_COLLISION_RESPONSE_INVALID:%', identity_response;
  end if;

  if not exists (
    select 1
    from public.cartera030b_obligation_conflicts c
    join public.cartera030b_expected_payment_obligations o
      on o.id = c.obligation_id
     and o.advisor_id = c.advisor_id
    join cartera030b_acceptance_ids ids
      on ids.forged_reference = o.obligation_reference
    where c.conflict_type = 'OBLIGATION_IDENTITY_COLLISION'
      and c.conflict_reference = identity_response ->> 'conflictReference'
      and c.claims ->> 'existingObligationReference' = ids.forged_reference
  ) then
    raise exception 'CARTERA030B_IDENTITY_COLLISION_CONFLICT_NOT_DURABLE';
  end if;`;

sql = `${sql.slice(0, start)}${replacement}${sql.slice(end)}`;
assert.ok(
  !sql.includes('IDENTITY_COLLISION_CONFLICT_NOT_DURABLE_DIAGNOSTIC'),
  'DIAGNOSTIC_ASSERTION_REMAINS',
);
assert.ok(
  !sql.includes("c.claims ->> 'obligationReference'"),
  'WRONG_IDENTITY_CLAIM_KEY_REMAINS',
);
assert.equal(
  sql.split("c.claims ->> 'existingObligationReference'").length - 1,
  1,
  'DURABLE_IDENTITY_CLAIM_ASSERTION_INVALID',
);
assert.equal(
  sql.split('o.id = c.obligation_id').length - 1,
  1,
  'RELATIONAL_OBLIGATION_ASSERTION_INVALID',
);
writeFileSync(sqlPath, sql);

console.log('FINAL_RELATIONAL_HARNESS=READY');
