# 046A Static Preview Public Surface Decision Scope

## Phase

- Phase: `046A_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_SCOPE`
- Status: SCOPE CLOSED after validation.
- Previous: `045B_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_IMPLEMENTATION`
- Next: `046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION`

## Closure Visibility Rule

Módulo cerrado sin Unified Build Tree actualizado = NO CERRADO.

## Context

`045B_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY_IMPLEMENTATION` created a boundary that can prepare a public surface candidate for review.

The existing static preview remains:

- sample data only
- read-only
- not production
- no API calls
- no auth
- no analytics/tracking
- no storage writes
- no forms
- no service worker
- no CRM mutation
- no task/calendar creation
- no truth creation
- no action execution

GitHub Pages availability is not deployment authorization.

## Scope decision

046A scopes a future Static Preview Public Surface Decision Boundary.

046A is docs-only.

046A does not deploy.

046A does not publish.

046A does not mutate GitHub Pages settings.

046A does not create or verify a public URL.

046A does not configure DNS or custom domains.

046A does not execute app runtime.

046A only defines the future owner decision boundary that can decide whether a reviewed public surface candidate may be approved as a public surface decision record.

## Important separation

The following are separate and must not collapse:

1. Static preview files exist.
2. Public surface candidate review passes.
3. Owner public surface decision is recorded.
4. GitHub Pages settings are mutated.
5. A public URL is verified.
6. A production app is deployed.

046A only scopes layer 3.

Layer 4, layer 5, and layer 6 remain forbidden.

## Owner public surface decision meaning

A public surface decision is a human-approved, evidence-backed decision record that says the safe static preview may be considered acceptable for public surface exposure if external repository settings already expose it or if a later separate execution boundary is created.

It is not a deploy command.

It is not GitHub settings mutation.

It is not a publish action.

It is not a public URL verification.

It is not production.

It creates no business truth.

It creates no metric or economic truth.

It creates no CRM/task/calendar/action.

## Future 046B possible output

046B may implement a boundary contract that returns:

- publicSurfaceDecisionStatus
- decision
- ownerDecisionRecord
- approvedForPublicSurfaceDecision
- publicSurfaceDecisionCandidate
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- warnings
- limitations
- rollbackNotes
- expirationNotes

046B must keep the following false:

- approvedForDeploymentExecution
- approvedForGitHubPagesSettingsMutation
- createsPublicUrl
- verifiesPublicUrl
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

The future 046B contract may consume:

- publicSurfaceDecisionRequestId
- publicSurfaceCandidateSnapshot
- staticPreviewDeploymentBoundarySnapshot
- ownerApprovalSnapshot
- ownerIdentitySnapshot
- evidenceBundleSnapshot
- riskAcceptanceSnapshot
- rollbackPlanSnapshot
- expirationWindowSnapshot
- publicSurfaceLabelingSnapshot
- sampleDataAuditSnapshot
- secretsScanSnapshot
- apiScanSnapshot
- trackingScanSnapshot
- storageScanSnapshot
- formsScanSnapshot
- serviceWorkerScanSnapshot
- repositoryVisibilitySnapshot
- githubPagesConfigurationSnapshot
- decisionScopeSnapshot
- requestedUse
- evidenceRefs
- sourceEvidenceIds
- sourceOwners
- createdAt
- expiresAt
- now
- idempotencyKey

## Proposed statuses

- READY_FOR_PUBLIC_SURFACE_DECISION
- APPROVED_PUBLIC_SURFACE_DECISION
- REJECTED_PUBLIC_SURFACE_DECISION
- NEEDS_PUBLIC_SURFACE_CANDIDATE
- NEEDS_STATIC_PREVIEW_DEPLOYMENT_BOUNDARY
- NEEDS_OWNER_APPROVAL
- NEEDS_OWNER_IDENTITY
- NEEDS_EVIDENCE_BUNDLE
- NEEDS_RISK_ACCEPTANCE
- NEEDS_ROLLBACK_PLAN
- NEEDS_EXPIRATION_WINDOW
- NEEDS_PUBLIC_SURFACE_LABELING
- NEEDS_SAMPLE_DATA_AUDIT
- NEEDS_NO_SECRETS_SCAN
- NEEDS_NO_API_SCAN
- NEEDS_NO_TRACKING_SCAN
- NEEDS_NO_STORAGE_SCAN
- NEEDS_NO_FORMS_SCAN
- NEEDS_NO_SERVICE_WORKER_SCAN
- NEEDS_REPOSITORY_VISIBILITY_REVIEW
- NEEDS_GITHUB_PAGES_CONFIGURATION
- NEEDS_DECISION_SCOPE
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
- PUBLIC_URL_CREATION_NOT_AUTHORIZED
- PUBLIC_URL_VERIFICATION_NOT_AUTHORIZED
- DNS_MUTATION_NOT_AUTHORIZED
- CUSTOM_DOMAIN_NOT_AUTHORIZED
- EXPIRED_PUBLIC_SURFACE_DECISION_WINDOW
- BLOCKED
- UNKNOWN
- NOT_MODELED

## Proposed decisions

- REQUEST_PUBLIC_SURFACE_DECISION
- APPROVE_PUBLIC_SURFACE_DECISION
- REJECT_PUBLIC_SURFACE_DECISION
- BLOCK_PUBLIC_SURFACE_DECISION
- NEEDS_MORE_CONTEXT
- EXPIRED
- NOT_MODELED

## Allowed uses

- PUBLIC_SURFACE_DECISION_REVIEW
- OWNER_PUBLIC_SURFACE_APPROVAL_REVIEW
- PUBLIC_SURFACE_DECISION_RECORD_PREP
- RISK_ACCEPTANCE_REVIEW
- ROLLBACK_PLAN_REVIEW

## Forbidden uses

- ACTUAL_DEPLOYMENT_EXECUTION
- GITHUB_PAGES_SETTINGS_MUTATION
- PUBLIC_URL_CREATION
- PUBLIC_URL_VERIFICATION
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

## Required rules for 046B implementation

Tests must prove:

1. Missing public surface candidate blocks.
2. Missing static preview deployment boundary blocks.
3. Missing owner approval blocks.
4. Missing owner identity blocks.
5. Missing evidence bundle blocks.
6. Missing risk acceptance blocks.
7. Missing rollback plan blocks.
8. Missing expiration window blocks.
9. Missing public surface labeling blocks.
10. Missing sample data audit blocks.
11. Missing no-secrets scan blocks.
12. Missing no-API scan blocks.
13. Missing no-tracking scan blocks.
14. Missing no-storage scan blocks.
15. Missing no-forms scan blocks.
16. Missing no-service-worker scan blocks.
17. Missing repository visibility review blocks.
18. Missing GitHub Pages configuration blocks.
19. Missing decision scope blocks.
20. Missing evidence blocks.
21. Missing source owner blocks.
22. Missing idempotency key blocks.
23. Public repository risk requires explicit review.
24. Unsafe sample data blocks.
25. Production data blocks.
26. Secret scan failure blocks.
27. API scan failure blocks.
28. Tracking scan failure blocks.
29. Storage scan failure blocks.
30. Form scan failure blocks.
31. Service worker scan failure blocks.
32. Owner rejection returns REJECTED_PUBLIC_SURFACE_DECISION.
33. Actual deployment execution remains false.
34. GitHub Pages settings mutation remains false.
35. Public URL creation / verification remains false.
36. DNS/custom domain remains false.
37. API/auth/analytics/storage remain false.
38. CRM/task/calendar/truth/action remain false.
39. Public surface decision record can be prepared only after all safety evidence passes.
40. Warnings, limitations, rollback, and expiration remain visible.
41. Inputs are not mutated.
42. Metric / Economic Truth remains separate.

## Open next phases

- `046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION`
- `047A_PUBLIC_URL_VERIFICATION_BOUNDARY_SCOPE` if an already-exposed URL must be verified without mutating settings
- `047B_PUBLIC_URL_VERIFICATION_BOUNDARY_IMPLEMENTATION`
- Metric / Economic Truth Scope

## Final decision

SEMAFORO=PASS
DECISION=PASS_046A_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_SCOPE_READY_FOR_IMPLEMENTATION
NEXT=046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION

<!-- BEGIN FORGEOS:STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION_APPENDIX_046B -->
## 046B Implementation Appendix

- `046B_STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION` implemented the Static Preview Public Surface Decision Boundary Contract.
- The boundary prepares owner public surface decision records only.
- GitHub Pages availability is not deployment authorization.
- Owner public surface decision is separate from deployment execution.
- No deploy, publish, GitHub Pages settings mutation, public URL creation, public URL verification, DNS/custom domain, API/auth/analytics/storage/forms/service worker/CRM/truth/action surfaces are authorized.
- Unified Build Tree updated.
- Next: `047A_PUBLIC_URL_VERIFICATION_BOUNDARY_SCOPE`
<!-- END FORGEOS:STATIC_PREVIEW_PUBLIC_SURFACE_DECISION_IMPLEMENTATION_APPENDIX_046B -->
