# FES 06B Productive UI Binding Manifest 001

```text
FES_06B_PRODUCTIVE_UI_BINDING_MANIFEST=APPROVED
MANIFEST_VERSION=FES-06B.1
SOURCE_COMMIT=a7f636bf0b5fe56ee2752fc625161a646e9cbbb0
PRODUCTIVE_UI_FILES_CHANGED=1
PRODUCTIVE_UI_FILE_1=docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js
PRODUCTIVE_UI_FILE_1_BLOB_SHA=2f35cbecb55e7bdb649f524e2b8cec5892422af2
NEW_BINDING_FILES=1
NEW_BINDING_FILE_1=advisor-os/event-evidence/productive-ui-projection-binding.js
TEST_FILES=1
TEST_FILE_1=tests/fes-06b-productive-ui-binding-implementation-test.mjs
SURFACES=ACTIVITY,PROSPECT_DETAIL,PIPELINE_CARD,MI_DIA
BINDING_MODE=READ_ONLY_PROJECTION_CONSUMER
SNAPSHOT_EVENT=forge:event-evidence-projection-snapshot
FALLBACK_SYNTHETIC_DATA=FORBIDDEN
RAW_PRIVATE_CONTENT_RENDERING=NO
EXTERNAL_EXECUTION=NO
SUPABASE_REMOTE_MUTATION=NO
DATABASE_MIGRATION=NO
MAIN_MUTATION=NO
```

Only the listed productive UI file is authorized for mutation in FES 06B.
The binding module may create read-only presentation hosts and listen for a
validated projection snapshot. It may not create events, mutate source truth,
execute actions or fall back to fabricated data.
