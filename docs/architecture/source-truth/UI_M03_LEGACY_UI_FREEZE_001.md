# UI-M03 — Legacy UI freeze

```text
LEGACY_ENTRYPOINT=docs/static-preview/forge-alive/index.html
LEGACY_SOURCE_COMMIT=cb83b1a86cbf480a962d8f0b1744c0c55a9750a7
LEGACY_STATUS=FROZEN_FUNCTIONAL_REFERENCE
LEGACY_REDESIGN_MUTATION=FORBIDDEN
LEGACY_RUNTIME_RECONCILIATION=RETIRED
CLEAN_ENTRYPOINT=docs/static-preview/forge-alive-material3/index.html
NEW_BRANCH_CREATED=NO
MAIN_MUTATION=NO
```

The historical Forge Alive entrypoint remains available as a functional
reference, but it is no longer the redesign canvas.

No new Material 3 phase may stack styles, shells, navigation systems or
projection runtimes onto the legacy DOM. Productive capabilities will be
ported deliberately into the clean entrypoint after visual acceptance.
