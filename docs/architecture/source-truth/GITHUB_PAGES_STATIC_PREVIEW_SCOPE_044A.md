# 044A GitHub Pages Static Preview Scope

## Phase

- Phase: `044A_GITHUB_PAGES_STATIC_PREVIEW_SCOPE`
- Status: SCOPE CLOSED after validation.
- Next: `044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION`.

## Closure Visibility Rule

Modulo cerrado sin Unified Build Tree actualizado = NO CERRADO.

## Context

`043B_FORGE_ALIVE_SHELL_IMPLEMENTATION` closed the Forge Alive Shell Boundary.

Forge can now prepare a read-only shell candidate, but it still cannot render UI, deploy an app, publish GitHub Pages, call APIs, persist, create truth, mutate CRM, create tasks/calendar, or execute actions.

GitHub Pages is available as infrastructure, but availability is not deployment authorization.

## Scope decision

044A scopes a future GitHub Pages Static Preview Boundary.

044A does not implement the preview.

044A does not create HTML, CSS, JS, assets, routes, workflows, or deployment files.

044A does not publish to GitHub Pages.

044A does not deploy an app.

044A does not render UI.

044A only defines what a safe static preview may be allowed to prepare in 044B.

## Static preview definition

A GitHub Pages static preview candidate may be a safe, static, read-only representation of Forge Alive Shell using:

- safe sample data
- mocked redacted cards
- no production PII
- no secrets
- no tokens
- no provider credentials
- no CRM data
- no live APIs
- no analytics
- no tracking
- no authentication
- no forms
- no webhooks
- no service workers
- no storage writes
- no truth writes
- no action execution

A static preview candidate is not a live app.

A static preview candidate is not UI execution.

A static preview candidate is not business truth.

A static preview candidate is not CRM.

## Future 044B possible output

044B may prepare a static preview candidate package only if all safety checks pass.

Possible candidate package:

- `docs/static-preview/forge-alive/index.html`
- `docs/static-preview/forge-alive/styles.css`
- `docs/static-preview/forge-alive/sample-data.js`

Because GitHub Pages may auto-publish depending on repository settings, 044B must treat any committed static asset as a potential public preview.

Therefore, 044B must use safe sample data only.

## GitHub Pages constraints

GitHub Pages static preview must remain:

- static
- read-only
- sample-data only
- no secrets
- no APIs
- no provider connectors
- no auth
- no analytics/tracking
- no persistence
- no localStorage/sessionStorage/indexedDB writes
- no cookies
- no service worker
- no forms
- no CRM mutation
- no task/calendar creation
- no send message
- no action execution
- no canonical truth write
- no business/metric/economic truth

## Future input shape

The future 044B contract may consume:

- staticPreviewRequestId
- forgeAliveShellRequestId
- uiRenderingRequestId
- forgeAliveShellSnapshot
- forgeAliveShellCandidate
- githubPagesAvailabilitySnapshot
- staticPreviewPolicySnapshot
- sampleDataPolicySnapshot
- privacyPolicySnapshot
- hostingSafetyPolicySnapshot
- noSecretsPolicySnapshot
- noApiPolicySnapshot
- noTrackingPolicySnapshot
- noStoragePolicySnapshot
- viewerRole
- sampleCards
- sampleWarnings
- sampleLimitations
- sampleSourceTrace
- auditTrail
- idempotencyKey
- requestedUse
- createdAt
- expiresAt
- now

## Future output shape

The future 044B contract should output:

- staticPreviewStatus
- decision
- staticPreviewRequestId
- forgeAliveShellRequestId
- staticPreviewCandidate
- previewFilesCandidate
- safeSampleDataCandidate
- allowedForStaticPreviewCandidate
- approvedForGitHubPagesPublish
- publishesGitHubPages
- deploysApp
- rendersLiveUi
- callsApi
- callsProviderApi
- callsExternalApi
- enablesAuth
- enablesAnalytics
- enablesTracking
- writesStorage
- writesLocalStorage
- writesSessionStorage
- writesIndexedDb
- writesCookies
- registersServiceWorker
- createsFormSubmission
- writesCanonicalTruth
- createsBusinessTruth
- createsMetricTruth
- createsEconomicTruth
- mutatesCrm
- createsTask
- createsCalendarEvent
- executesAction
- sendsMessage
- blockedUses
- allowedUses
- missingSignals
- warnings
- limitations

## Proposed statuses

- READY_FOR_STATIC_PREVIEW_REVIEW
- APPROVED_FOR_STATIC_PREVIEW_CANDIDATE
- NEEDS_FORGE_ALIVE_SHELL
- NEEDS_FORGE_ALIVE_SHELL_CANDIDATE
- NEEDS_GITHUB_PAGES_REVIEW
- NEEDS_STATIC_PREVIEW_POLICY
- NEEDS_SAMPLE_DATA_POLICY
- NEEDS_PRIVACY_POLICY
- NEEDS_HOSTING_SAFETY_POLICY
- NEEDS_NO_SECRETS_POLICY
- NEEDS_NO_API_POLICY
- NEEDS_NO_TRACKING_POLICY
- NEEDS_NO_STORAGE_POLICY
- NEEDS_VIEWER_ROLE
- NEEDS_IDEMPOTENCY_KEY
- NEEDS_AUDIT_TRAIL
- UNSUPPORTED_VIEWER_ROLE
- UNSAFE_SAMPLE_DATA
- SECRET_DETECTED
- API_CALL_DETECTED
- TRACKING_DETECTED
- STORAGE_WRITE_DETECTED
- SERVICE_WORKER_DETECTED
- FORM_SUBMISSION_DETECTED
- GITHUB_PAGES_PUBLISH_NOT_AUTHORIZED
- LIVE_APP_NOT_AUTHORIZED
- EXPIRED_STATIC_PREVIEW_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_STATIC_PREVIEW_REVIEW
- APPROVE_STATIC_PREVIEW_CANDIDATE
- BLOCK_STATIC_PREVIEW
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- STATIC_PREVIEW_REVIEW
- STATIC_PREVIEW_CANDIDATE_PREP
- SAFE_SAMPLE_DATA_PREP
- READ_ONLY_FORGE_ALIVE_PREVIEW_PREP
- GITHUB_PAGES_SAFETY_REVIEW

## Forbidden uses

- GITHUB_PAGES_PUBLISH
- APP_DEPLOYMENT
- LIVE_APP_EXECUTION
- API_CALL
- PROVIDER_API_CALL
- EXTERNAL_API_CALL
- AUTHENTICATION
- ANALYTICS_TRACKING
- COOKIE_WRITE
- LOCAL_STORAGE_WRITE
- SESSION_STORAGE_WRITE
- INDEXED_DB_WRITE
- SERVICE_WORKER_REGISTRATION
- FORM_SUBMISSION
- PERSISTENCE_WRITE
- CANONICAL_TRUTH_WRITE
- BUSINESS_TRUTH_CREATION
- METRIC_TRUTH_CREATION
- ECONOMIC_TRUTH_CREATION
- COMPENSATION_TRUTH
- PAYOUT_TRUTH
- REVENUE_TRUTH
- HUMAN_RANKING
- HR_DECISION
- PROMOTION_DECISION
- TERMINATION
- PERSONALITY_TRUTH
- ADVISOR_LIFECYCLE_TRUTH
- TASK_CREATION
- CALENDAR_CREATION
- CRM_MUTATION
- SEND_MESSAGE
- ACTION_EXECUTION
- MANIPULATION
- SURVEILLANCE

## Required rules for 044B implementation

Tests must prove:

1. Missing Forge Alive Shell snapshot blocks.
2. Missing Forge Alive Shell candidate blocks.
3. Missing GitHub Pages review blocks.
4. Missing static preview policy blocks.
5. Missing sample data policy blocks.
6. Missing privacy policy blocks.
7. Missing hosting safety policy blocks.
8. Missing no-secrets policy blocks.
9. Missing no-API policy blocks.
10. Missing no-tracking policy blocks.
11. Missing no-storage policy blocks.
12. Missing viewer role blocks.
13. Missing idempotency key blocks.
14. Missing audit trail blocks.
15. Unsupported viewer role blocks.
16. Unsafe sample data blocks.
17. Secret-like values block.
18. API calls block.
19. Tracking scripts block.
20. Storage writes block.
21. Service workers block.
22. Form submission blocks.
23. GitHub Pages publish remains false unless a later deploy boundary exists.
24. Live app execution remains false.
25. Static preview candidate can be prepared.
26. Preview files candidate uses safe sample data only.
27. No production PII appears.
28. No tokens/secrets appear.
29. No fetch/XMLHttpRequest/WebSocket/EventSource appears.
30. No cookies/localStorage/sessionStorage/indexedDB writes appear.
31. No service worker registration appears.
32. No form action or submit handler appears.
33. No analytics/tracking appears.
34. No CRM mutation appears.
35. No task/calendar creation appears.
36. No truth creation appears.
37. No action/send execution appears.
38. Inputs are not mutated.
39. Warnings and limitations remain visible.
40. Static preview is explicitly labeled sample / read-only / not production.
41. GitHub Pages availability remains infrastructure note only.
42. Metric / Economic Truth remains separate.

## Open next phases

- `044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION`
- `045A_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_SCOPE` if public publish must be explicitly authorized
- Metric / Economic Truth Scope

## Final decision

SEMAFORO=PASS
DECISION=PASS_044A_GITHUB_PAGES_STATIC_PREVIEW_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION

## Explicit Deployment Boundary

GitHub Pages availability is not deployment authorization.

Static preview candidate is not a live app.

No GitHub Pages publish is authorized in 044A.

<!-- BEGIN FORGEOS:GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION_APPENDIX_044B -->
## 044B Implementation Appendix

- `044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION` implemented GitHub Pages Static Preview Boundary Contract.
- Static preview candidate files created under `docs/static-preview/forge-alive/`.
- Visual direction follows the uploaded Forge Alive render: mobile-first, dark navy, glassmorphism, gold accents, Alfred / Forge assistant.
- Sample data only.
- Read-only.
- Not production.
- No deploy command.
- No GitHub Pages publish authorization.
- No APIs, auth, analytics/tracking, storage writes, forms, service worker, CRM, truth, or actions.
- Unified Build Tree updated.
- Next: `045A_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_SCOPE`
<!-- END FORGEOS:GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION_APPENDIX_044B -->
