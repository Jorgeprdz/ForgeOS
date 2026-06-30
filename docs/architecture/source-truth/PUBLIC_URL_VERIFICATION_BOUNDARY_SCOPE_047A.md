# 047A Public URL Verification Boundary Scope

## Phase

- Phase: `047A_PUBLIC_URL_VERIFICATION_BOUNDARY_SCOPE`
- Status: SCOPE CLOSED after validation.
- Previous: `046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION`
- Next: `047B_PUBLIC_URL_VERIFICATION_BOUNDARY_IMPLEMENTATION`

## Closure Visibility Rule

Módulo cerrado sin Unified Build Tree actualizado = NO CERRADO.

## Context

`046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION` created an owner public surface decision record boundary.

The owner decision is separate from deployment execution.

GitHub Pages availability is not deployment authorization.

The next safe layer is to verify evidence about whether an already-exposed URL, if one exists through external repository settings, points only to the safe static preview.


## Validation phrases

- No network call.
- No HTTP request.
- No DNS lookup.
- No public URL creation.
- No live URL direct verification.

## Scope decision

047A scopes a future Public URL Verification Boundary.

047A is docs-only.

047A does not perform a network call.

047A does not use curl, fetch, browser automation, HTTP client, or DNS query.

047A does not deploy.

047A does not publish.

047A does not mutate GitHub Pages settings.

047A does not create a public URL.

047A does not configure DNS or custom domains.

047A does not execute app runtime.

047A only defines the future boundary that can review owner-provided / GitHub-provided / manual-browser-provided evidence for an already-exposed URL.

## Important separation

The following are separate and must not collapse:

1. Static preview files exist.
2. Public surface candidate review passes.
3. Owner public surface decision is recorded.
4. A public URL exists through external repository settings.
5. URL verification evidence is reviewed.
6. GitHub Pages settings are mutated.
7. Production app deployment exists.

047A only scopes layer 5.

Layer 4 is not created by Forge.

Layer 6 and layer 7 remain forbidden.

## Public URL verification meaning

A URL verification decision may say:

- evidence claims a public URL exists
- evidence claims the URL resolves to the static preview path
- evidence claims the preview label is visible
- evidence claims sample data only is visible
- evidence claims no forms/API/tracking/storage/service worker were detected
- evidence is fresh and source-owned
- evidence is sufficient or insufficient for review

It must not:

- create a URL
- verify through a live network call
- mutate settings
- deploy
- publish
- configure DNS
- create a production app
- create business truth
- create metric/economic truth
- mutate CRM
- create tasks/calendar
- execute actions

## Future 047B possible output

047B may implement a boundary contract that returns:

- publicUrlVerificationStatus
- decision
- publicUrlVerificationRecord
- publicUrlEvidenceCandidate
- verifiedFromEvidence
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- warnings
- limitations
- rollbackNotes
- expirationNotes

047B must keep the following false:

- performsNetworkCall
- callsUrl
- performsHttpRequest
- performsDnsLookup
- createsPublicUrl
- verifiesLiveUrlDirectly
- approvedForDeploymentExecution
- approvedForGitHubPagesSettingsMutation
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

## Future input shape

The future 047B contract may consume:

- publicUrlVerificationRequestId
- ownerPublicSurfaceDecisionSnapshot
- publicUrlEvidenceSnapshot
- evidenceFreshnessSnapshot
- sourceOwnershipSnapshot
- staticPreviewLabelEvidenceSnapshot
- sampleDataEvidenceSnapshot
- noSecretsEvidenceSnapshot
- noApiEvidenceSnapshot
- noTrackingEvidenceSnapshot
- noStorageEvidenceSnapshot
- noFormsEvidenceSnapshot
- noServiceWorkerEvidenceSnapshot
- repositoryVisibilitySnapshot
- githubPagesConfigurationSnapshot
- rollbackPlanSnapshot
- expirationWindowSnapshot
- requestedUse
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- createdAt
- expiresAt
- now
- idempotencyKey

## Proposed statuses

- READY_FOR_PUBLIC_URL_VERIFICATION_REVIEW
- VERIFIED_FROM_EVIDENCE
- NOT_VERIFIED_FROM_EVIDENCE
- NEEDS_OWNER_PUBLIC_SURFACE_DECISION
- NEEDS_PUBLIC_URL_EVIDENCE
- NEEDS_EVIDENCE_FRESHNESS
- NEEDS_SOURCE_OWNERSHIP
- NEEDS_STATIC_PREVIEW_LABEL_EVIDENCE
- NEEDS_SAMPLE_DATA_EVIDENCE
- NEEDS_NO_SECRETS_EVIDENCE
- NEEDS_NO_API_EVIDENCE
- NEEDS_NO_TRACKING_EVIDENCE
- NEEDS_NO_STORAGE_EVIDENCE
- NEEDS_NO_FORMS_EVIDENCE
- NEEDS_NO_SERVICE_WORKER_EVIDENCE
- NEEDS_REPOSITORY_VISIBILITY_REVIEW
- NEEDS_GITHUB_PAGES_CONFIGURATION
- NEEDS_ROLLBACK_PLAN
- NEEDS_EXPIRATION_WINDOW
- NEEDS_EVIDENCE
- NEEDS_SOURCE_OWNER
- NEEDS_IDEMPOTENCY_KEY
- STALE_EVIDENCE
- UNSAFE_SAMPLE_DATA
- SECRET_DETECTED
- API_CALL_DETECTED
- TRACKING_DETECTED
- STORAGE_WRITE_DETECTED
- FORM_SUBMISSION_DETECTED
- SERVICE_WORKER_DETECTED
- NETWORK_CALL_NOT_AUTHORIZED
- HTTP_REQUEST_NOT_AUTHORIZED
- DNS_LOOKUP_NOT_AUTHORIZED
- PUBLIC_URL_CREATION_NOT_AUTHORIZED
- LIVE_URL_DIRECT_VERIFICATION_NOT_AUTHORIZED
- DEPLOYMENT_EXECUTION_NOT_AUTHORIZED
- GITHUB_PAGES_SETTINGS_MUTATION_NOT_AUTHORIZED
- DNS_MUTATION_NOT_AUTHORIZED
- CUSTOM_DOMAIN_NOT_AUTHORIZED
- EXPIRED_PUBLIC_URL_VERIFICATION_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_PUBLIC_URL_VERIFICATION_REVIEW
- VERIFY_FROM_EVIDENCE
- DO_NOT_VERIFY_FROM_EVIDENCE
- BLOCK_PUBLIC_URL_VERIFICATION
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- PUBLIC_URL_VERIFICATION_REVIEW
- OWNER_PROVIDED_URL_EVIDENCE_REVIEW
- GITHUB_PAGES_URL_EVIDENCE_REVIEW
- MANUAL_BROWSER_EVIDENCE_REVIEW
- ROLLBACK_PLAN_REVIEW

## Forbidden uses

- NETWORK_CALL
- HTTP_REQUEST
- DNS_LOOKUP
- LIVE_URL_DIRECT_VERIFICATION
- PUBLIC_URL_CREATION
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

## Required rules for 047B implementation

Tests must prove:

1. Missing owner public surface decision blocks.
2. Missing public URL evidence blocks.
3. Missing evidence freshness blocks.
4. Missing source ownership blocks.
5. Missing static preview label evidence blocks.
6. Missing sample data evidence blocks.
7. Missing no-secrets evidence blocks.
8. Missing no-API evidence blocks.
9. Missing no-tracking evidence blocks.
10. Missing no-storage evidence blocks.
11. Missing no-forms evidence blocks.
12. Missing no-service-worker evidence blocks.
13. Missing repository visibility review blocks.
14. Missing GitHub Pages configuration blocks.
15. Missing rollback plan blocks.
16. Missing expiration window blocks.
17. Missing evidence blocks.
18. Missing source owner blocks.
19. Missing idempotency key blocks.
20. Stale evidence blocks.
21. Unsafe sample data evidence blocks.
22. Secret evidence blocks.
23. API evidence blocks.
24. Tracking evidence blocks.
25. Storage write evidence blocks.
26. Form evidence blocks.
27. Service worker evidence blocks.
28. Network call remains false.
29. HTTP request remains false.
30. DNS lookup remains false.
31. Public URL creation remains false.
32. Live URL direct verification remains false.
33. Deployment execution remains false.
34. GitHub Pages settings mutation remains false.
35. DNS/custom domain remains false.
36. API/auth/analytics/storage remain false.
37. CRM/task/calendar/truth/action remain false.
38. URL verification record can be prepared from evidence only.
39. Warnings, limitations, rollback, expiration remain visible.
40. Evidence refs / source evidence IDs / source owners dedupe.
41. Inputs are not mutated.
42. Metric / Economic Truth remains separate.

## Open next phases

- `047B_PUBLIC_URL_VERIFICATION_BOUNDARY_IMPLEMENTATION`
- `048A_STATIC_PREVIEW_RELEASE_NOTE_SCOPE` if verified evidence needs a human-readable release note
- Metric / Economic Truth Scope

## Final decision

SEMAFORO=PASS
DECISION=PASS_047A_PUBLIC_URL_VERIFICATION_BOUNDARY_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=047B_PUBLIC_URL_VERIFICATION_BOUNDARY_IMPLEMENTATION
