# UI-M03 — Owner visual review rejection

```text
REVIEWED_CANDIDATE=632b5861d37f8251d206adfdba78238e56fa8de8
OWNER_VISUAL_ACCEPTANCE=REJECTED
MOBILE_NEW_HEADER=VISIBLE
MOBILE_LEGACY_PAGE_UNRECONCILED=YES
MOBILE_DUPLICATE_NAVIGATION=YES
TABLET_PRODUCTIVE_WORKSPACE_COMPRESSED_RIGHT=YES
TABLET_EXCESS_EMPTY_CANVAS=YES
FUNCTIONAL_REPLACEMENT_ALLOWED=NO
CORRECTION=FULL_PRODUCT_RESPONSIVE_RECONCILIATION
```

The initial UI-M03 candidate applied a Material 3 skin but did not reconcile the
multiple historical product layouts mounted inside the real entrypoint.

The correction keeps productive nodes and handlers intact while selecting one
canonical layout per responsive mode and preventing duplicate headers,
navigation systems and Alfred launchers.
