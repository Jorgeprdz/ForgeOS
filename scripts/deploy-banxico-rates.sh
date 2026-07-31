#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-rmlxigxysujsuwzgoimv}"
FUNCTION_NAME="banxico-rates"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$REPO_ROOT"

if ! command -v supabase >/dev/null 2>&1; then
  echo "BLOCKED=SUPABASE_CLI_NOT_FOUND"
  exit 1
fi

node tests/banxico-rates-edge-function-test.mjs

if ! supabase projects list >/dev/null 2>&1; then
  echo "Supabase CLI requiere sesión. Iniciando login..."
  supabase login
fi

if ! supabase secrets list --project-ref "$PROJECT_REF" 2>/dev/null \
  | grep -Eq '(^|[[:space:]])BANXICO_TOKEN([[:space:]]|$)'; then
  printf "BANXICO_TOKEN no está configurado. Pégalo aquí (no se mostrará): " >&2
  IFS= read -r -s BANXICO_TOKEN
  printf "\n" >&2

  if [[ -z "$BANXICO_TOKEN" ]]; then
    echo "BLOCKED=BANXICO_TOKEN_EMPTY"
    exit 1
  fi

  supabase secrets set \
    "BANXICO_TOKEN=$BANXICO_TOKEN" \
    --project-ref "$PROJECT_REF"

  unset BANXICO_TOKEN
  echo "BANXICO_SECRET=CONFIGURED"
else
  echo "BANXICO_SECRET=ALREADY_CONFIGURED"
fi

supabase functions deploy "$FUNCTION_NAME" \
  --project-ref "$PROJECT_REF" \
  --no-verify-jwt

ENDPOINT="https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}"
RESPONSE_FILE="$(mktemp)"
trap 'rm -f "$RESPONSE_FILE"' EXIT

for attempt in {1..12}; do
  STATUS="$(curl -sS -o "$RESPONSE_FILE" -w '%{http_code}' \
    --max-time 30 \
    "$ENDPOINT" || true)"

  if [[ "$STATUS" == "200" ]]; then
    break
  fi

  sleep 5
done

node - "$RESPONSE_FILE" <<'NODE'
const fs = require("fs");
const file = process.argv[2];
const payload = JSON.parse(fs.readFileSync(file, "utf8"));

if (payload?.ok !== true) {
  throw new Error(`BANXICO_EDGE_SMOKE_FAILED: ${JSON.stringify(payload)}`);
}

for (const [key, expectedSeries] of Object.entries({
  UDI_MXN: "SP68257",
  USD_MXN_FIX: "SF43718",
})) {
  const rate = payload?.rates?.[key];
  if (!rate || rate.seriesId !== expectedSeries) {
    throw new Error(`BANXICO_EDGE_SERIES_INVALID_${key}`);
  }
  if (!Number.isFinite(rate.value) || !rate.date) {
    throw new Error(`BANXICO_EDGE_RATE_INVALID_${key}`);
  }
  if (rate.source !== "BANXICO_SIE_API" || rate.mode !== "LATEST_VERIFIED") {
    throw new Error(`BANXICO_EDGE_PROVENANCE_INVALID_${key}`);
  }
}

console.log("BANXICO_EDGE_SMOKE=PASS");
console.log(`UDI_MXN=${payload.rates.UDI_MXN.value}`);
console.log(`UDI_DATE=${payload.rates.UDI_MXN.date}`);
console.log(`USD_MXN_FIX=${payload.rates.USD_MXN_FIX.value}`);
console.log(`USD_DATE=${payload.rates.USD_MXN_FIX.date}`);
console.log(`FUNCTION_VERSION=${payload.functionVersion}`);
NODE

echo "BANXICO_RATES_DEPLOYMENT=PASS"
echo "ENDPOINT=$ENDPOINT"
