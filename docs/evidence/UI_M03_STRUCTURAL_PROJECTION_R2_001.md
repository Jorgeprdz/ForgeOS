# UI-M03 — Structural projection R2

```text
SOURCE_R1=cb0ffea2f45ebfae476bea52a0336a22bc9d01a8
OWNER_VISUAL_ACCEPTANCE_R1=REJECTED
R1_INERT_ONLY_VISUAL_SUPPRESSION=INSUFFICIENT
R1_DYNAMIC_CONTEXT_NAV_ESCAPED=YES
R1_DESKTOP_SIDEBAR_CHROME_DUPLICATED=YES
R2_STRATEGY=STRUCTURAL_PRODUCTIVE_NODE_PROJECTION
R2_PRODUCTIVE_NODE_CLONING=NO
R2_PRODUCTIVE_MARKUP_REPLACEMENT=NO
R2_LEGACY_TREE_VISIBLE_ON_HOME=NO
R2_ROUTE_RESTORATION=YES
HUMAN_VISUAL_ACCEPTANCE=PENDING
```

R2 stops relying on CSS selection across several complete historical layouts.
It moves the existing productive nodes into a dedicated Material 3 Home stage
and hides the remaining legacy tree while Home is active.

When another route becomes active, every moved node is restored to its original
anchor before the legacy product tree becomes visible again.
