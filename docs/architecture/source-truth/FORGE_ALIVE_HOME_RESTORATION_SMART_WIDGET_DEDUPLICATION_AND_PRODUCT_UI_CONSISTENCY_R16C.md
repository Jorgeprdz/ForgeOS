# Forge Alive Home Restoration, Smart Widget Deduplication and Product UI Consistency — R16C

## Decision

R16C restores Inicio from the existing approved visual evidence. It does not redesign the route, alter decision data, or replace its floating interaction language. The canonical static Smart Widget 056U remains the only mobile and tablet Smart Widget. Obsolete mounts are removed from the DOM and lifecycle reconciliation is idempotent.

The shared home reconciler owns one floating navigation pill, one command orb and one canonical widget host. It reconciles initial load, navigation restoration, visibility, orientation and resize without duplicating listeners or instances. The desktop dynamic stack is allowed only on desktop and does not replace 056U on mobile.

The context carousel exposes one canonical card at a time, keeps adaptive height, accessible previous/next controls, keyboard and touch operation, and synchronized indicators. Seguimiento and Oportunidades remain independent in normal document flow.

## Responsive and iOS contract

Mobile and tablet retain the approved identity while adopting the spacing, border and responsive discipline established by R16A/R16B. The implementation uses safe-area environment variables, dynamic viewport units with fallbacks, dark color-scheme, WebKit backdrop-filter fallbacks, controlled word wrapping and at least 44 CSS px touch targets.

Playwright WebKit is the iOS engine used for this closure; Safari real was not claimed. Tests cover 375x667, 390x844, 430x932 and landscape, including lifecycle restoration and no horizontal overflow.

The repository owner accepts partial overlay by the floating pill and orb. Absolute geometric separation from underlying content is not a requirement; visibility, touch targets, scrolling, CTA presence and navigation remain required.

## Protected boundaries

R16A intake states, R16B dashboards, ORVI R15, Product Intelligence, parsers, mappers, rate cache and financial calculations are byte-preserved. Screenshots and client content remain outside Git.

```text
STATUS=PASS_FORGE_ALIVE_HOME_RESTORATION_SMART_WIDGET_DEDUPLICATION_AND_PRODUCT_UI_CONSISTENCY
EVIDENCE_FIRST_RESTORATION=PASS
HOME_VISUAL_AUTHORITY=EXISTING_DOCUMENTATION_AND_SCREENSHOTS
FLOATING_NAVIGATION_PILL=RESTORED
FLOATING_NAVIGATION_PILL_INSTANCE_COUNT=1
FLOATING_COMMAND_ORB=RESTORED
FLOATING_COMMAND_ORB_INSTANCE_COUNT=1
SMART_WIDGET_INSTANCE_COUNT=1
SMART_WIDGET_DUPLICATE_CARD_VISIBLE=NO
SMART_WIDGET_SECOND_CARD_REMOVED=YES
FOLLOWUP_OPPORTUNITY_OVERLAP=NO
CONTEXT_CAROUSEL=PASS
HOME_MOBILE_320_PASS=YES
HOME_MOBILE_360_PASS=YES
HOME_MOBILE_390_PASS=YES
HOME_TABLET_768_PASS=YES
HOME_TABLET_1024_PASS=YES
HOME_DESKTOP_1440_PASS=YES
HOME_CONSISTENT_WITH_R16A_R16B=YES
HOME_IDENTITY_PRESERVED=YES
R16A_INTAKE_REGRESSION=PASS
R16B_DASHBOARD_REGRESSION=PASS
ORVI_R15_RELEASE_STATUS=UNCHANGED_CLOSED
FINANCIAL_CALCULATIONS_CHANGED=NO
PRODUCT_INTELLIGENCE_CHANGED=NO
RATE_CACHE_CHANGED=NO
PARSER_CHANGED=NO
MAPPER_CHANGED=NO
PDF_COMMITTED=NO
SCREENSHOTS_COMMITTED=NO
CLIENT_CONTENT_COMMITTED=NO
IOS_VISUAL_CONSISTENCY=PASS
IOS_ENGINE=PLAYWRIGHT_WEBKIT
IOS_SAFE_AREA=PASS
IOS_DYNAMIC_VIEWPORT=PASS
IOS_NAVIGATION_PILL=PASS
IOS_COMMAND_ORB=PASS
IOS_SMART_WIDGET_INSTANCE_COUNT=1
IOS_BFCACHE_DUPLICATION=NO
IOS_FOLLOWUP_OPPORTUNITY_OVERLAP=NO
IOS_HORIZONTAL_OVERFLOW=NO
IOS_375_PASS=YES
IOS_390_PASS=YES
IOS_430_PASS=YES
IOS_LANDSCAPE_PASS=YES
MOBILE_SMART_WIDGET_REQUIRED=YES
MOBILE_SMART_WIDGET_AUTHORITY=STATIC_CANONICAL_056U
MOBILE_SMART_WIDGET_VISIBLE_INSTANCE_COUNT=1
MOBILE_DYNAMIC_STACK_VISIBLE=NO
MOBILE_SMART_WIDGET_REMOVED=NO
MOBILE_SMART_WIDGET_HIDDEN_BY_BREAKPOINT=NO
MOBILE_SMART_WIDGET_BFCACHE_PERSISTENCE=PASS
MOBILE_SMART_WIDGET_RESIZE_ROUNDTRIP=PASS
MOBILE_SMART_WIDGET_OVERFLOW=NO
MOBILE_SMART_WIDGET_OVERLAP=NO
REMOVE_DUPLICATES_NOT_THE_CANONICAL_WIDGET=YES
FLOATING_OVERLAY_EXPECTED=YES
FLOATING_OVERLAY_ACCEPTED_BY_OWNER=YES
ABSOLUTE_PHYSICAL_SEPARATION_REQUIRED=NO
FLOATING_NAVIGATION_PILL_VISIBLE=YES
FLOATING_COMMAND_ORB_VISIBLE=YES
FLOATING_CONTROLS_TOUCH_TARGET=PASS
CTA_REMAINS_PRESENT=YES
PAGE_SCROLL_AVAILABLE=YES
HORIZONTAL_OVERFLOW=NO
NAVIGATION_FUNCTIONAL=PASS
NEXT=BOARD_SCOPE_SELECTION_AFTER_R16C
```
