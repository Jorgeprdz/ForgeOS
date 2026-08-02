# FIP Mobile Visual Contrast and Layout Hotfix

Status: implementation branch only.

## Evidence source
Public mobile screenshots after PR #202 showed the FIP surface loading successfully but with unusable contrast, oversized empty cards, clipped source chips, and insufficient bottom clearance around the floating navigation.

## Correction
- Forge-native dark card surface with explicit readable foreground colors.
- Compact empty-state cards on mobile.
- Wrapping source-status chips instead of horizontal clipping.
- Increased mobile bottom safe zone for the deliberately floating navigation pill.
- Responsive tablet and desktop behavior preserved.

```text
MERGE_AUTHORIZATION=NOT_GRANTED
PUBLIC_ACCEPTANCE=NOT_YET_CLAIMED
```
