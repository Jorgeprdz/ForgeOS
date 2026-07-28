# UI-M04 — Canonical Forge Shell authority

```text
PHASE=UI-M04_CANONICAL_FORGE_SHELL_EXTRACTION_AND_NAVIGATION_CONTRACT
PHASE_STATUS=EXECUTION_AUTHORIZED
OWNER_APPROVAL=GRANTED
MIRANDA_APPROVAL=GRANTED
BOARD_APPROVAL=GRANTED
IMPLEMENTATION_READINESS=READY
SOURCE_COMMIT=f3c3d1dc6c65b6927c0ca7290d1ac90e138d4673
RUNTIME_BRANCH=feature/ui-m04-canonical-forge-shell
VISUAL_REDESIGN=FORBIDDEN
QUOTE_AND_PRODUCT_BOUNDARIES=PROTECTED
ROBOCOP_LOCK_001=RESOLVED_FOR_AUTHORIZED_UI_M04_SCOPE
```

UI-M04 is the explicit Board selection that resolves
`NEXT=BOARD_SCOPE_SELECTION_AFTER_R16C`.

The clean Material 3 entrypoint at
`docs/static-preview/forge-alive-material3/` is the extraction source. The
legacy Forge Alive tree remains frozen and separate.

ForgeShell owns the global background, responsive viewport, safe areas,
dynamic viewport, canonical Nav Pill, global Alfred command surface, module
viewport and idempotent lifecycle. HomeModule owns only Inicio content and
interactions.

This authority does not include Cotizaciones migration, quote behavior,
Product Intelligence, calculations, persistence, Supabase, deployment or
historical R16C/R16D mutation.
