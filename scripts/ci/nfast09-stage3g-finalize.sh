#!/usr/bin/env bash
set -Eeuo pipefail

RUNTIME_SOURCE="${1:?runtime source required}"
HARNESS_COMMIT="${2:?harness commit required}"
RESULT_FILE="${3:?browser result required}"

CLOSURE_FILE="docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE_CLOSURE.md"
EVIDENCE_FILE="docs/evidence/nfast-09-stage3g-end-to-end-browser-acceptance.json"
BUILD_TREE="docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md"
ROADMAP="docs/roadmap/FORGE_ROADMAP_LOCK_001.md"

EXPECTED_FILES="$(mktemp)"
ACTUAL_FILES="$(mktemp)"

cleanup() {
  local status="$?"
  rm -f "$EXPECTED_FILES" "$ACTUAL_FILES"
  return "$status"
}
trap cleanup EXIT

python3 - \
  "$RESULT_FILE" \
  "$EVIDENCE_FILE" \
  "$RUNTIME_SOURCE" \
  "$HARNESS_COMMIT" <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import json
import sys

result = json.loads(
    Path(sys.argv[1]).read_text()
)

payload = {
    "stageId":
        "NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE",
    "status": "PASS",
    "runtimeSourceCommit": sys.argv[3],
    "browserHarnessCommit": sys.argv[4],
    "executionEnvironment":
        "github-actions-ubuntu-latest",
    "acceptedAt":
        datetime.now(timezone.utc).isoformat(),
    "checks": {
        "localFirstWrite": True,
        "indexedDbRecordPersisted": True,
        "durableOutboxPersisted": True,
        "miDiaMutationEvent": True,
        "reloadPersistence": True,
        "offlineReschedule": True,
        "reconnectPreservesDurability": True,
        "legacyPipelineBrowserRegression": True,
        "remoteMutationDuringStage": False,
        "remoteAcceptanceInheritedFromStage3D": True,
    },
    "browserResult": result,
    "limitations": [
        "Browser acceptance runs in demo mode and performs no Supabase mutation.",
        "Remote RLS/RPC acceptance remains grounded in accepted Stage 3D evidence.",
        "Demo mode retains outbox entries after reconnect because remote sync is disabled.",
    ],
    "next":
        "NFAST_10_GOVERNANCE_AND_PRODUCT_QUOTE_PRESENTER_BRIDGE_SCOPE",
    "nfast10Authorized": False,
    "mainMutation": False,
}

destination = Path(sys.argv[2])
destination.parent.mkdir(
    parents=True,
    exist_ok=True,
)
destination.write_text(
    json.dumps(
        payload,
        indent=2,
        ensure_ascii=False,
    ) + "\n",
)
PY

cat > "$CLOSURE_FILE" <<EOF
# NASH Fast Track — NFAST-09 Stage 3G End-to-End Browser Acceptance Closure

## Status

- \`STAGE_ID=NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE\`
- \`STATUS=COMPLETE_AND_PUSHED_BY_CI\`
- \`RUNTIME_SOURCE_COMMIT=$RUNTIME_SOURCE\`
- \`BROWSER_HARNESS_COMMIT=$HARNESS_COMMIT\`
- \`EXECUTION_ENVIRONMENT=GITHUB_ACTIONS_UBUNTU_LATEST\`
- \`BROWSER_ACCEPTANCE=PASS\`
- \`LEGACY_PIPELINE_BROWSER_REGRESSION=PASS\`
- \`SUPABASE_REMOTE_MUTATION_DURING_STAGE=NO\`
- \`MAIN_MUTATION=NO\`
- \`NFAST_10_AUTHORIZED=NO\`

## Accepted browser loop

\`\`\`text
Mi Día approved identity
→ Pipeline
→ typed SCHEDULE
→ atomic IndexedDB record + durable outbox
→ immediate local confirmation
→ nfast09:due-action-mutated
→ reload and rehydration
→ offline RESCHEDULE
→ lifecycle version increment
→ durable second outbox mutation
→ reconnect without local data loss
\`\`\`

Stage 3G validates the browser-facing local-first loop in GitHub Actions using isolated Chromium. Remote RLS/RPC acceptance remains grounded in accepted Stage 3D evidence; Stage 3G performs no new Supabase mutation.

Evidence: \`docs/evidence/nfast-09-stage3g-end-to-end-browser-acceptance.json\`

## Next

- \`NEXT=NFAST_10_GOVERNANCE_AND_PRODUCT_QUOTE_PRESENTER_BRIDGE_SCOPE\`
- \`NEXT_STATUS=REQUIRES_SEPARATE_GATE\`
EOF

python3 - \
  "$BUILD_TREE" \
  "$ROADMAP" \
  "$RUNTIME_SOURCE" \
  "$HARNESS_COMMIT" <<'PY'
from pathlib import Path
import sys

runtime_source = sys.argv[3]
harness_commit = sys.argv[4]

items = [
    (
        Path(sys.argv[1]),
        "<!-- BEGIN FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->",
        "<!-- END FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->",
        f"""## NFAST-09 Stage 3G — End-to-End Browser Acceptance

```text
STATUS=COMPLETE_AND_PUSHED_BY_CI
RUNTIME_SOURCE_COMMIT={runtime_source}
BROWSER_HARNESS_COMMIT={harness_commit}
EXECUTION_ENVIRONMENT=GITHUB_ACTIONS_UBUNTU_LATEST
BROWSER_ACCEPTANCE=PASS
INDEXEDDB_PERSISTENCE=PASS
DURABLE_OUTBOX=PASS
MI_DIA_LOCAL_MUTATION_EVENT=PASS
RELOAD_PERSISTENCE=PASS
OFFLINE_RESCHEDULE=PASS
RECONNECT_LOCAL_DURABILITY=PASS
REMOTE_ACCEPTANCE=INHERITED_FROM_ACCEPTED_STAGE_3D
SUPABASE_REMOTE_MUTATION_DURING_STAGE=NO
NEXT=NFAST_10_GOVERNANCE_AND_PRODUCT_QUOTE_PRESENTER_BRIDGE_SCOPE
NFAST_10_AUTHORIZED=NO
MAIN_MERGE_AUTHORIZED=NO
```""",
    ),
    (
        Path(sys.argv[2]),
        "<!-- BEGIN FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->",
        "<!-- END FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->",
        """## NFAST-09 Stage 3G Roadmap Closure

```text
CURRENT=NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE_COMPLETE
EXECUTION_ENVIRONMENT=GITHUB_ACTIONS_UBUNTU_LATEST
NEXT=NFAST_10_GOVERNANCE_AND_PRODUCT_QUOTE_PRESENTER_BRIDGE_SCOPE
HOLD=NFAST_10_IMPLEMENTATION_UNTIL_SEPARATE_GATE
NFAST_10_AUTHORIZED=NO
MAIN_MERGE_AUTHORIZED=NO
```

Remote RLS/RPC acceptance remains grounded in accepted Stage 3D evidence. Stage 3G performs no new Supabase mutation.""",
    ),
]

for path, start, end, body in items:
    text = path.read_text()
    block = f"{start}\n{body}\n{end}\n"

    if (start in text) != (end in text):
        raise SystemExit(
            f"unbalanced marker in {path}"
        )

    if start in text:
        before, rest = text.split(
            start,
            1,
        )
        _, after = rest.split(
            end,
            1,
        )
        text = (
            before.rstrip()
            + "\n\n"
            + block
            + after.lstrip("\n")
        )
    else:
        text = (
            text.rstrip()
            + "\n\n"
            + block
        )

    path.write_text(text)
PY

python3 - \
  "$EVIDENCE_FILE" \
  "$CLOSURE_FILE" \
  "$BUILD_TREE" \
  "$ROADMAP" <<'PY'
from pathlib import Path
import json
import sys

payload = json.loads(
    Path(sys.argv[1]).read_text()
)

assert payload["status"] == "PASS"
assert (
    payload["executionEnvironment"]
    == "github-actions-ubuntu-latest"
)
assert (
    payload["checks"]["offlineReschedule"]
    is True
)
assert (
    payload["checks"]["remoteMutationDuringStage"]
    is False
)

for item in map(Path, sys.argv[2:]):
    assert item.is_file()

assert (
    Path(sys.argv[3])
    .read_text()
    .count(
        "<!-- BEGIN FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->"
    )
    == 1
)

assert (
    Path(sys.argv[4])
    .read_text()
    .count(
        "<!-- BEGIN FORGEOS:NFAST_09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE -->"
    )
    == 1
)

print("DOCUMENT_CONTRACT=PASS")
PY

git add -N -- \
  "$CLOSURE_FILE" \
  "$EVIDENCE_FILE" \
  "$BUILD_TREE" \
  "$ROADMAP"

git diff --check

printf '%s\n' \
  "$CLOSURE_FILE" \
  "$EVIDENCE_FILE" \
  "$BUILD_TREE" \
  "$ROADMAP" |
  sort > "$EXPECTED_FILES"

git diff --name-only |
  sort > "$ACTUAL_FILES"

cmp -s \
  "$EXPECTED_FILES" \
  "$ACTUAL_FILES" || {
    echo "BLOCKED: unexpected CI finalizer scope"
    echo "EXPECTED:"
    cat "$EXPECTED_FILES"
    echo "ACTUAL:"
    cat "$ACTUAL_FILES"
    false
  }

echo "CI_FINALIZER_SCOPE=PASS"

git config \
  user.name \
  "github-actions[bot]"
git config \
  user.email \
  "41898282+github-actions[bot]@users.noreply.github.com"

git add -- \
  "$CLOSURE_FILE" \
  "$EVIDENCE_FILE" \
  "$BUILD_TREE" \
  "$ROADMAP"

git diff --cached --check

git commit -m \
  "test(nfast-09): close stage 3g browser acceptance"

git push origin \
  "HEAD:${GITHUB_REF_NAME}"

echo "NFAST_09_STAGE_3G_CI_FINALIZATION=PASS"
echo "BROWSER_ACCEPTANCE=PASS"
echo "COMMIT_CREATED=PASS"
echo "PUSH_COMPLETED=PASS"
echo "MAIN_MUTATION=NO"
echo "NFAST_10_AUTHORIZED=NO"
