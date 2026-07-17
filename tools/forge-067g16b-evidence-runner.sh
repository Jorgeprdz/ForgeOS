#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EVIDENCE_DIR="${FORGE_067G16B_EVIDENCE_DIR:-${TMPDIR:-/tmp}/forge-067g16b-evidence}"
LEDGER="$EVIDENCE_DIR/ledger.jsonl"
PUPPETEER_PACKAGE="/data/data/com.termux/files/home/.forge-tools/r14h-browser-harness/node_modules/puppeteer-core"
PUPPETEER_PATH="${FORGE_PUPPETEER_CORE_PATH:-$PUPPETEER_PACKAGE/lib/puppeteer/puppeteer-core.js}"
CHROMIUM_PATH="${FORGE_CHROMIUM_PATH:-/data/data/com.termux/files/usr/bin/chromium-browser}"
overall=0

mkdir -p "$EVIDENCE_DIR/stdout" "$EVIDENCE_DIR/stderr"
: > "$LEDGER"

record() {
  local name="$1" status="$2" code="$3" started="$4" ended="$5"
  printf '{"name":"%s","required":true,"status":"%s","exit_code":%s,"started_at":"%s","ended_at":"%s","stdout":"stdout/%s.log","stderr":"stderr/%s.log"}\n' \
    "$name" "$status" "$code" "$started" "$ended" "$name" "$name" >> "$LEDGER"
  if [[ "$status" == "FAIL" || "$status" == "BLOCKED" ]]; then overall=1; fi
}

run_case() {
  local name="$1" command="$2" started ended code status
  started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  set +e
  (cd "$ROOT_DIR" && bash -o pipefail -c "$command") >"$EVIDENCE_DIR/stdout/$name.log" 2>"$EVIDENCE_DIR/stderr/$name.log"
  code=$?
  set -e
  ended="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [[ $code -eq 0 ]]; then status=PASS; else status=FAIL; fi
  record "$name" "$status" "$code" "$started" "$ended"
}

block_case() {
  local name="$1" reason="$2" now
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '%s\n' "$reason" >"$EVIDENCE_DIR/stderr/$name.log"
  : >"$EVIDENCE_DIR/stdout/$name.log"
  record "$name" BLOCKED 127 "$now" "$now"
}

if [[ "${1:-}" == "--self-test" ]]; then
  run_case self_exit_0 "exit 0"
  run_case self_exit_1 "exit 1"
  run_case self_assertion_error "node -e \"const assert=require('node:assert/strict');assert.fail('intentional')\""
  block_case self_missing_browser "intentional missing browser dependency"
  grep -q '"name":"self_exit_0".*"status":"PASS"' "$LEDGER"
  grep -q '"name":"self_exit_1".*"status":"FAIL"' "$LEDGER"
  grep -q '"name":"self_assertion_error".*"status":"FAIL"' "$LEDGER"
  grep -q '"name":"self_missing_browser".*"status":"BLOCKED"' "$LEDGER"
  exit 0
fi

if [[ -f "$PUPPETEER_PATH" && -f "$PUPPETEER_PACKAGE/package.json" ]]; then
  run_case preflight_puppeteer "node -e \"const p=require('$PUPPETEER_PACKAGE/package.json'); console.log('$PUPPETEER_PATH', p.version)\""
else
  block_case preflight_puppeteer "Puppeteer missing: $PUPPETEER_PATH"
fi
if [[ -x "$CHROMIUM_PATH" ]]; then
  run_case preflight_chromium "'$CHROMIUM_PATH' --version"
else
  block_case preflight_chromium "Chromium missing: $CHROMIUM_PATH"
fi

run_case pipeline_renderer_067g10 "node tests/advisor-sales-pipeline-ui-067g10-test.js"
run_case pipeline_stage_registry_067g11 "node tests/sales-stage-registry-067g11-test.js"
run_case pipeline_stage_integration_067g12 "node tests/pipeline-ui-stage-integration-067g12-test.js"
run_case pipeline_dashboard_contract_067g15 "node tests/advisor-dashboard-nba-consumer-067g15-test.mjs"
run_case static_pipeline_contract_067g16b "node tests/forge-alive-static-pipeline-mount-067g16a-test.mjs"
run_case runner_integrity_067g16b "node tests/forge-067g16b-runner-integrity-test.mjs"
run_case quote_non_regression "node tests/quote-read-model-adapter-069c-test.js"
run_case pdf_non_regression "node tests/pdf-browser-parser-timeout-contract-test.mjs"
run_case relationship_timeline_non_regression "node relationship-timeline-master-test.js"
run_case route_performance_non_regression "node tests/forge-alive-constant-time-route-fastpath-test.mjs"
run_case forge_alive_home_non_regression "node tests/forge-alive-home-restoration-r16c-test.mjs"
run_case legacy_root_non_regression "node -e \"const fs=require('fs');const s=fs.readFileSync('index.html','utf8');if(!s.includes('app.js')||s.includes('forge-alive-pipeline-view-067g16a'))process.exit(1)\""
run_case pages_publication_contract "node tests/forge-067g16b-pages-publication-test.mjs"

if [[ -f "$PUPPETEER_PATH" && -x "$CHROMIUM_PATH" ]]; then
  run_case static_pipeline_chromium_067g16b "FORGE_PUPPETEER_CORE_PATH='$PUPPETEER_PATH' FORGE_CHROMIUM_PATH='$CHROMIUM_PATH' FORGE_067G16B_EVIDENCE_DIR='$EVIDENCE_DIR' node tests/forge-alive-static-pipeline-mount-067g16a-browser-test.mjs"
else
  block_case static_pipeline_chromium_067g16b "Browser preflight did not resolve both dependencies"
fi

exit "$overall"
