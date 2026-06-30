# 045A Static Preview Deployment Boundary Scope

## Phase

- Phase: `045A_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Previous: `044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION`
- Next: `045B_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_IMPLEMENTATION`

## Closure Visibility Rule

Módulo cerrado sin Unified Build Tree actualizado = NO CERRADO.

## Context

`044B_GITHUB_PAGES_STATIC_PREVIEW_IMPLEMENTATION` created a safe static preview candidate under:

- `docs/static-preview/forge-alive/index.html`
- `docs/static-preview/forge-alive/styles.css`
- `docs/static-preview/forge-alive/sample-data.js`

The preview is sample data only, read-only, and not production.

GitHub Pages availability is not deployment authorization.

Because repository settings may expose files under `docs/`, any committed static asset must be treated as a potential public surface.

## Scope decision

045A scopes the Static Preview Deployment Boundary.

045A does not deploy.

045A does not publish.

045A does not mutate GitHub Pages settings.

045A does not create a public URL.

045A does not configure DNS or custom domains.

045A does not execute any app runtime.

045A only defines the future boundary that may review whether a safe static preview can be publicly surfaced.

## Boundary distinction

The following are separate layers:

1. Static preview files exist.
2. Static preview public surface review.
3. GitHub Pages configuration review.
4. Explicit owner approval.
5. Public surface candidate decision.
6. Actual deployment or settings mutation.

045A only scopes layer 2 through layer 5.

Actual deployment execution or GitHub Pages settings mutation remains forbidden unless a later explicit deploy execution boundary is authorized.

## Public surface meaning

A public surface candidate means:

- safe sample data only
- read-only preview
- clear not-production label
- no secrets
- no production PII
- no provider credentials
- no APIs
- no auth
- no analytics/tracking
- no storage writes
- no forms
- no service worker
- no CRM mutation
- no task/calendar creation
- no truth creation
- no action execution
- rollback plan visible
- expiration / review window visible
- owner approval visible

## Future 045B possible output

045B may implement a boundary contract that returns a public surface candidate decision.

045B must not mutate GitHub settings.

045B must not deploy.

045B must not publish.

045B may only say whether the static preview is eligible for public surface review.

## Future input shape

The future 045B contract may consume:

- staticPreviewDeploymentRequestId
- staticPreviewBoundarySnapshot
- staticPreviewFilesSnapshot
- githubPagesConfigurationSnapshot
- repositoryVisibilitySnapshot
- branchSourceSnapshot
- ownerApprovalSnapshot
- publicSurfaceLabelingSnapshot
- sampleDataAuditSnapshot
- secretsScanSnapshot
- apiScanSnapshot
- trackingScanSnapshot
- storageScanSnapshot
- formsScanSnapshot
- serviceWorkerScanSnapshot
- cachePolicySnapshot
- rollbackPlanSnapshot
- expirationWindowSnapshot
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- requestedUse
- createdAt
- expiresAt
- now
- idempotencyKey

## Future output shape

The future 045B contract should output:

- deploymentBoundaryStatus
- decision
- staticPreviewDeploymentRequestId
- publicSurfaceCandidate
- eligibleForPublicSurfaceReview
- approvedForGitHubPagesSettingsMutation
- approvedForDeploymentExecution
- createsPublicUrl
- mutatesGitHubPagesSettings
- mutatesDns
- configuresCustomDomain
- deploysApp
- publishesGitHubPages
- callsApi
- enablesAuth
- enablesAnalytics
- enablesTracking
- writesStorage
- registersServiceWorker
- createsFormSubmission
- mutatesCrm
- createsTask
- createsCalendarEvent
- writesCanonicalTruth
- createsBusinessTruth
- createsMetricTruth
- createsEconomicTruth
- executesAction
- sendsMessage
- missingSignals
- blockedUses
- allowedUses
- warnings
- limitations
- rollbackNotes
- expirationNotes

## Proposed statuses

- READY_FOR_DEPLOYMENT_REVIEW
- APPROVED_FOR_PUBLIC_SURFACE_CANDIDATE
- NEEDS_STATIC_PREVIEW_BOUNDARY
- NEEDS_STATIC_PREVIEW_FILES
- NEEDS_GITHUB_PAGES_CONFIGURATION
- NEEDS_REPOSITORY_VISIBILITY_REVIEW
- NEEDS_BRANCH_SOURCE_REVIEW
- NEEDS_OWNER_APPROVAL
- NEEDS_PUBLIC_SURFACE_LABELING
- NEEDS_SAMPLE_DATA_AUDIT
- NEEDS_NO_SECRETS_SCAN
- NEEDS_NO_API_SCAN
- NEEDS_NO_TRACKING_SCAN
- NEEDS_NO_STORAGE_SCAN
- NEEDS_NO_FORMS_SCAN
- NEEDS_NO_SERVICE_WORKER_SCAN
- NEEDS_CACHE_POLICY
- NEEDS_ROLLBACK_PLAN
- NEEDS_EXPIRATION_WINDOW
- NEEDS_EVIDENCE
- NEEDS_SOURCE_OWNER
- NEEDS_IDEMPOTENCY_KEY
- PUBLIC_REPOSITORY_RISK_REVIEW
- UNSAFE_SAMPLE_DATA
- PRODUCTION_DATA_DETECTED
- SECRET_DETECTED
- API_CALL_DETECTED
- TRACKING_DETECTED
- STORAGE_WRITE_DETECTED
- FORM_SUBMISSION_DETECTED
- SERVICE_WORKER_DETECTED
- DEPLOYMENT_EXECUTION_NOT_AUTHORIZED
- GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED
- DNS_MUTATION_NOT_AUTHORIZED
- CUSTOM_DOMAIN_NOT_AUTHORIZED
- EXPIRED_DEPLOYMENT_REVIEW_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_DEPLOYMENT_REVIEW
- APPROVE_PUBLIC_SURFACE_CANDIDATE
- BLOCK_PUBLIC_SURFACE
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- STATIC_PREVIEW_DEPLOYMENT_REVIEW
- PUBLIC_SURFACE_CANDIDATE_REVIEW
- GITHUB_PAGES_CONFIGURATION_REVIEW
- SAFE_STATIC_PREVIEW_PUBLICATION_REVIEW
- ROLLBACK_PLAN_REVIEW

## Forbidden uses

- ACTUAL_DEPLOYMENT_EXECUTION
- GITHUB_PAGES_SETTINGS_MUTATION
- DNS_MUTATION
- CUSTOM_DOMAIN_SETUP
- FORCE_PUBLISH
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

## Required rules for 045B implementation

Tests must prove:

1. Missing static preview boundary snapshot blocks.
2. Missing static preview files snapshot blocks.
3. Missing GitHub Pages configuration blocks.
4. Missing repository visibility review blocks.
5. Missing branch source review blocks.
6. Missing owner approval blocks.
7. Missing public surface labeling blocks.
8. Missing sample data audit blocks.
9. Missing no-secrets scan blocks.
10. Missing no-API scan blocks.
11. Missing no-tracking scan blocks.
12. Missing no-storage scan blocks.
13. Missing no-forms scan blocks.
14. Missing no-service-worker scan blocks.
15. Missing cache policy blocks.
16. Missing rollback plan blocks.
17. Missing expiration window blocks.
18. Missing evidence blocks.
19. Missing source owner blocks.
20. Missing idempotency key blocks.
21. Public repository risk requires explicit review.
22. Unsafe sample data blocks.
23. Production data blocks.
24. Secret scan failure blocks.
25. API scan failure blocks.
26. Tracking scan failure blocks.
27. Storage scan failure blocks.
28. Form scan failure blocks.
29. Service worker scan failure blocks.
30. Actual deployment execution remains false.
31. GitHub Pages settings mutation remains false.
32. DNS mutation remains false.
33. Custom domain setup remains false.
34. API/auth/analytics/storage remain false.
35. CRM/task/calendar/truth/action remain false.
36. Public surface candidate can be prepared only after all safety snapshots pass.
37. GitHub Pages availability remains not deployment authorization.
38. Warnings and limitations remain visible.
39. Rollback plan remains visible.
40. Expiration / review window remains visible.
41. Inputs are not mutated.
42. Metric / Economic Truth remains separate.

## Open next phases

- `045B_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_IMPLEMENTATION`
- `046A_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_SCOPE` if actual public surfacing needs separate approval
- Metric / Economic Truth Scope

## Final decision

SEMAFORO=PASS
DECISION=PASS_045A_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=045B_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_IMPLEMENTATION
