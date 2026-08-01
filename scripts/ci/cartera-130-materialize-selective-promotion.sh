#!/usr/bin/env bash
set -euo pipefail

CURRENT_MAIN_HEAD="${CARTERA_130_CURRENT_MAIN_HEAD:-9d014116f6b3f0a626d8848d680a5c607f924d99}"
ACCEPTED_PROGRAM_HEAD="${CARTERA_130_ACCEPTED_PROGRAM_HEAD:-b83a37abe3eb8b3a48c2fe89940b562e1367bfcc}"
AUTHORIZATION_RECEIPT='docs/evidence/FORGE_CARTERA_120_SELECTIVE_PROMOTION_AUTHORIZATION_RECEIPT_001.md'
MANIFEST='docs/evidence/FORGE_CARTERA_130_SELECTIVE_PROMOTION_MANIFEST_001.tsv'
LEGACY_BACKUP='legacy/quarantine/cartera-enterprise-main-pre-canonical-20260801.js'
MATERIAL3_APP='docs/static-preview/forge-alive-material3/app.js'

actual_main="$(git rev-parse origin/main)"
[[ "$actual_main" == "$CURRENT_MAIN_HEAD" ]] || {
  echo "CARTERA130_CURRENT_MAIN_HEAD_MOVED expected=$CURRENT_MAIN_HEAD actual=$actual_main" >&2
  exit 1
}

git cat-file -e "$ACCEPTED_PROGRAM_HEAD^{commit}"
git merge-base --is-ancestor "$CURRENT_MAIN_HEAD" HEAD

grep -qx 'EXACT_AUTHORIZATION_PHRASE=AUTHORIZE_CARTERA_120_SELECTIVE_PROMOTION' "$AUTHORIZATION_RECEIPT"
grep -qx 'BOARD_APPROVAL=GRANTED' "$AUTHORIZATION_RECEIPT"
grep -qx 'MERGE_AUTHORIZATION=GRANTED' "$AUTHORIZATION_RECEIPT"
grep -qx "CURRENT_MAIN_HEAD=$CURRENT_MAIN_HEAD" "$AUTHORIZATION_RECEIPT"
grep -qx "ACCEPTED_PROGRAM_HEAD=$ACCEPTED_PROGRAM_HEAD" "$AUTHORIZATION_RECEIPT"

mkdir -p "$(dirname "$LEGACY_BACKUP")" "$(dirname "$MANIFEST")"
if [[ ! -f "$LEGACY_BACKUP" ]]; then
  cp cartera.js "$LEGACY_BACKUP"
fi

promotion_pattern='^(advisor-os/cartera/|advisor-os/sales-pipeline/prospect-quote-detail-projection-ui\.js$|advisor-os/sales-pipeline/productive-prospect-bootstrap\.js$|cartera\.js$|platform/economic-connection/|platform/event-evidence/(cartera-vertical-continuity-contract|policy-domain-event-contract|prospect-quote-detail-projection|quote-lifecycle-event-bridge|quote-lifecycle-event-contract|quote-lifecycle-supabase-service)\.js$|platform/experience-engine/cartera-|platform/policy-intelligence/|platform/portfolio-intelligence/|platform/productivity/|platform/program-governance/cartera-110|platform/relationship-intelligence/|platform/shared-commercial-model/|policy-operations/calendar/cartera-|policy-operations/intake/cartera-|policy-operations/payments/cartera-|schemas/(cartera-|commercial-|policy-)|supabase/migrations/[0-9_]*cartera|tests/cartera-|docs/architecture/source-truth/FORGE_CARTERA_(001|010|020|030|040|050|060|070|080|090|100|110)|docs/evidence/FORGE_CARTERA_(001|010|020|030|040|050|060|070|080|090|100|110)|docs/static-preview/quote-preview-live/forge-quote-lifecycle-browser-bridge-cartera001b\.js$)'
excluded_historical_notes='^(docs/architecture/source-truth/FORGE_CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY_001\.md|docs/architecture/source-truth/FORGE_CARTERA_001B_REMOTE_ACCEPTANCE_STAGE_GATE_001\.md)$'

mapfile -t source_paths < <(
  git ls-tree -r --name-only "$ACCEPTED_PROGRAM_HEAD" |
  grep -E "$promotion_pattern" |
  grep -Ev "$excluded_historical_notes" |
  sed '/^[[:space:]]*$/d'
)

if [[ ${#source_paths[@]} -lt 40 ]]; then
  echo "CARTERA130_PROMOTION_PATH_SET_TOO_SMALL count=${#source_paths[@]}" >&2
  exit 1
fi

git checkout "$ACCEPTED_PROGRAM_HEAD" -- "${source_paths[@]}"
node scripts/ci/cartera-130-reconcile-runtime.mjs

{
  printf 'target_path\tmode\tsource_head\tsource_blob\ttarget_blob\n'
  for path in "${source_paths[@]}"; do
    source_blob="$(git rev-parse "$ACCEPTED_PROGRAM_HEAD:$path")"
    target_blob="$(git hash-object "$path")"
    mode='COPY_ACCEPTED_BLOB'
    [[ "$path" == 'cartera.js' ]] && mode='REPLACE_LEGACY_WITH_ACCEPTED_CANONICAL_ROUTE'
    printf '%s\t%s\t%s\t%s\t%s\n' "$path" "$mode" "$ACCEPTED_PROGRAM_HEAD" "$source_blob" "$target_blob"
  done
  printf '%s\t%s\t%s\t%s\t%s\n' \
    'app.js' \
    'RECONCILE_CURRENT_MAIN' \
    "$CURRENT_MAIN_HEAD" \
    "$(git rev-parse "$CURRENT_MAIN_HEAD:app.js")" \
    "$(git hash-object app.js)"
  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$MATERIAL3_APP" \
    'RECONCILE_BOUNDED_CARTERA_QUOTE_BRIDGE' \
    "$CURRENT_MAIN_HEAD" \
    "$(git rev-parse "$CURRENT_MAIN_HEAD:$MATERIAL3_APP")" \
    "$(git hash-object "$MATERIAL3_APP")"
  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$LEGACY_BACKUP" \
    'PRESERVE_PRE_PROMOTION_LEGACY' \
    "$CURRENT_MAIN_HEAD" \
    "$(git rev-parse "$CURRENT_MAIN_HEAD:cartera.js")" \
    "$(git hash-object "$LEGACY_BACKUP")"
} > "$MANIFEST"

copied_count="${#source_paths[@]}"
reconciled_count=3

echo "CARTERA_130_FILES_COPIED=$copied_count"
echo "CARTERA_130_FILES_RECONCILED=$reconciled_count"
echo 'CARTERA_130_CURRENT_MAIN_HEAD_LOCK=PASS'
echo 'CARTERA_130_ACCEPTED_PROGRAM_HEAD_LOCK=PASS'
echo 'CARTERA_130_AUTHORIZATION_RECEIPT=PASS'
echo 'CARTERA_130_SELECTIVE_MATERIALIZATION=PASS'
