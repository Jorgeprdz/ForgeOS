#!/usr/bin/env bash
set -euo pipefail

PHASE="066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION"
DECISION="PASS_066B1_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION"
NEXT="066C_OPPORTUNITY_PIPELINE_READ_ONLY_ADAPTER_QA_LOCK_OR_REPAIR"

printf '%s\n' "FORGE:${PHASE}:START"
printf '%s\n' "Mode: read-only existing module reconciliation"
printf '%s\n' "No UI mutation, backend connection, provider execution, storage use, or real effects."

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  printf '%s\n' "FAIL:${PHASE}:not_inside_git_repo"
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

printf '%s\n' "Repository: $repo_root"
printf '%s\n' "Git status:"
git status --short --branch

printf '%s\n' "Existing opportunity/pipeline module candidates:"
rg --files \
  | rg -i '(pipeline|opportunit|oportunidad|forecast|stage|funnel)' \
  | sort

printf '%s\n' "Required 066B adapter artifacts:"
for path in \
  "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js" \
  "tests/opportunity-pipeline-read-only-adapter-066b-test.js" \
  "docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION_066B1.md" \
  "docs/evidence/forge-opportunity-pipeline-existing-module-reconciliation-audit-066b1.json"
do
  if [[ ! -f "$path" ]]; then
    printf '%s\n' "FAIL:${PHASE}:missing_required_file:$path"
    exit 1
  fi
  printf '%s\n' "OK:$path"
done

printf '%s\n' "Decision marker:"
printf '%s\n' "KEEP_066B_AS_TEMPORARY_LOCAL_STATIC_SHIM"
printf '%s\n' "DECISION=${DECISION}"
printf '%s\n' "NEXT=${NEXT}"
printf '%s\n' "FORGE:${PHASE}:END"
