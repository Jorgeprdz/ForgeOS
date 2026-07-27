import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

import {
  ACTIVITY_READ_RUNTIME_CAPABILITIES,
  ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
  createSupabaseActivityReadRuntime,
} from "../../advisor-os/activity/runtime/activity-read-runtime.mjs";

function required(value, label) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${label} must be a non-empty string`,
    );
  }

  return value.trim();
}

function readJson(path, label) {
  const value = JSON.parse(
    fs.readFileSync(path, "utf8"),
  );

  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new TypeError(
      `${label} must contain a JSON object`,
    );
  }

  return value;
}

async function responsePayload(response) {
  const text = await response.text();

  if (text.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

async function authRequest(
  url,
  {
    method = "GET",
    apiKey,
    bearer,
    body,
  },
) {
  const response = await fetch(url, {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      ...(body === undefined
        ? {}
        : {
          "Content-Type": "application/json",
        }),
    },
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

  const payload =
    await responsePayload(response);

  if (!response.ok) {
    const message =
      payload?.msg ??
      payload?.message ??
      payload?.error_description ??
      payload?.error ??
      `HTTP ${response.status}`;

    throw new Error(
      `Supabase auth request failed: ${message}`,
    );
  }

  return payload;
}

function createRemoteRpcClient({
  supabaseUrl,
  apiKey,
  accessToken,
  calls,
}) {
  return Object.freeze({
    async rpc(name, parameters) {
      calls.push(name);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/${encodeURIComponent(name)}`,
        {
          method: "POST",
          headers: {
            apikey: apiKey,
            Authorization:
              `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(parameters),
        },
      );

      const payload =
        await responsePayload(response);

      if (!response.ok) {
        return {
          data: null,
          error: {
            code:
              payload?.code ??
              String(response.status),
            message:
              payload?.message ??
              payload?.msg ??
              payload?.error ??
              `HTTP ${response.status}`,
            details:
              payload?.details ??
              null,
            hint:
              payload?.hint ??
              null,
          },
        };
      }

      return {
        data: payload,
        error: null,
      };
    },
  });
}

const [
  keyFile,
  pendingUserFile,
  auditUserFile,
  resultFile,
] = process.argv.slice(2);

const keys = readJson(
  required(keyFile, "keyFile"),
  "keyFile",
);

const supabaseUrl = required(
  process.env.ACT09_SUPABASE_URL,
  "ACT09_SUPABASE_URL",
);
const anonKey = required(
  keys.anonKey,
  "anonKey",
);
const serviceRoleKey = required(
  keys.serviceRoleKey,
  "serviceRoleKey",
);

const suffix =
  crypto.randomUUID().replaceAll("-", "");
const email =
  `act09-${suffix}@forge.invalid`;
const password =
  `${crypto.randomBytes(24).toString("base64url")}Aa1!`;
const organizationId =
  `org-act09-${suffix}`;
const clockInstant =
  "2026-07-27T18:00:00.000Z";

let userId = "";
let completed = false;

try {
  const created = await authRequest(
    `${supabaseUrl}/auth/v1/admin/users`,
    {
      method: "POST",
      apiKey: serviceRoleKey,
      bearer: serviceRoleKey,
      body: {
        email,
        password,
        email_confirm: true,
        user_metadata: {
          acceptance: "ACT-09",
        },
      },
    },
  );

  userId = required(
    created?.id ??
      created?.user?.id,
    "created user id",
  );

  fs.writeFileSync(
    pendingUserFile,
    `${userId}\n`,
    {
      encoding: "utf8",
      mode: 0o600,
    },
  );
  fs.writeFileSync(
    auditUserFile,
    `${userId}\n`,
    {
      encoding: "utf8",
      mode: 0o600,
    },
  );

  const session = await authRequest(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      apiKey: anonKey,
      bearer: anonKey,
      body: {
        email,
        password,
      },
    },
  );

  const accessToken = required(
    session?.access_token,
    "access token",
  );

  assert.equal(
    session?.user?.id,
    userId,
  );

  const authenticatedCalls = [];
  const authenticatedClient =
    createRemoteRpcClient({
      supabaseUrl,
      apiKey: anonKey,
      accessToken,
      calls: authenticatedCalls,
    });

  const runtime =
    createSupabaseActivityReadRuntime({
      client: authenticatedClient,
      organizationId,
      advisorId: userId,
      clock: () => clockInstant,
    });

  assert.equal(
    runtime.schemaVersion,
    ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
  );
  assert.deepEqual(
    runtime.capabilities,
    ACTIVITY_READ_RUNTIME_CAPABILITIES,
  );
  assert.deepEqual(
    runtime.authority,
    {
      organizationId,
      advisorId: userId,
    },
  );

  const feed =
    await runtime.feed({
      limit: 25,
    });

  assert.equal(
    feed.schemaVersion,
    "activity-feed.v1",
  );
  assert.equal(
    feed.asOf,
    clockInstant,
  );
  assert.equal(
    feed.returnedCount,
    0,
  );
  assert.equal(
    feed.snapshotRecordCount,
    0,
  );
  assert.deepEqual(
    feed.items,
    [],
  );
  assert.equal(
    feed.hasMore,
    false,
  );
  assert.equal(
    feed.nextCursor,
    null,
  );

  const aggregation =
    await runtime.aggregatePeriod({
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    });

  assert.equal(
    aggregation.schemaVersion,
    "activity-period-aggregation.v1",
  );
  assert.equal(
    aggregation.period.asOf,
    clockInstant,
  );
  assert.equal(
    aggregation.sourceRecordCount,
    0,
  );
  assert.equal(
    aggregation.snapshotRecordCount,
    0,
  );
  assert.equal(
    aggregation.eligibleActivityCount,
    0,
  );

  const callsBeforeOverride =
    authenticatedCalls.length;

  await assert.rejects(
    () => runtime.feed({
      organizationId:
        "org-injected",
    }),
    /cannot override organizationId/,
  );

  await assert.rejects(
    () => runtime.aggregatePeriod({
      advisorId:
        crypto.randomUUID(),
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    }),
    /cannot override advisorId/,
  );

  assert.equal(
    authenticatedCalls.length,
    callsBeforeOverride,
  );

  assert.deepEqual(
    authenticatedCalls,
    [
      "activity_records_list_v1",
      "activity_records_list_v1",
    ],
  );
  assert.equal(
    authenticatedCalls.includes(
      "activity_records_append_v1",
    ),
    false,
  );

  const anonymousCalls = [];
  const anonymousClient =
    createRemoteRpcClient({
      supabaseUrl,
      apiKey: anonKey,
      accessToken: anonKey,
      calls: anonymousCalls,
    });

  const anonymousRuntime =
    createSupabaseActivityReadRuntime({
      client: anonymousClient,
      organizationId,
      advisorId: userId,
      clock: () => clockInstant,
    });

  await assert.rejects(
    () => anonymousRuntime.feed(),
    /authenticated advisor required|permission denied|insufficient privilege|JWT|401|42501/i,
  );

  assert.deepEqual(
    anonymousCalls,
    ["activity_records_list_v1"],
  );

  const result = {
    schemaVersion:
      "activity-remote-read-acceptance.v1",
    projectRef:
      process.env.ACT09_PROJECT_REF,
    runtimeSchema:
      runtime.schemaVersion,
    capabilities:
      [...runtime.capabilities],
    authenticatedUserCreated: true,
    passwordSessionCreated: true,
    authenticatedFeed: true,
    authenticatedAggregation: true,
    anonymousDenied: true,
    authorityOverrideBlocked: true,
    authenticatedRpcCalls:
      [...authenticatedCalls],
    anonymousRpcCalls:
      [...anonymousCalls],
    appendRpcCalls: 0,
    temporaryActivityRows: 0,
    remoteSchemaMutation: false,
    productiveUiMutation: false,
    completedAt:
      new Date().toISOString(),
  };

  fs.writeFileSync(
    resultFile,
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8",
  );

  completed = true;

  console.log(
    "ACT09_REMOTE_READ_ACCEPTANCE_PASS",
  );
  console.log(
    "REMOTE_AUTH_USER_CREATE=PASS",
  );
  console.log(
    "REMOTE_PASSWORD_SESSION=PASS",
  );
  console.log(
    "REMOTE_RUNTIME_FEED=PASS",
  );
  console.log(
    "REMOTE_RUNTIME_AGGREGATION=PASS",
  );
  console.log(
    "REMOTE_ANON_DENIAL=PASS",
  );
  console.log(
    "REMOTE_AUTHORITY_OVERRIDE_BLOCKED=PASS",
  );
  console.log(
    "REMOTE_AUTHENTICATED_RPC_CALLS=2",
  );
  console.log(
    "REMOTE_APPEND_RPC_CALLS=0",
  );
  console.log(
    "REMOTE_TEMP_ACTIVITY_ROWS=0",
  );
} finally {
  if (!completed && userId !== "") {
    console.error(
      "ACT09_REMOTE_IDENTITY_CLEANUP_REQUIRED",
    );
  }
}
