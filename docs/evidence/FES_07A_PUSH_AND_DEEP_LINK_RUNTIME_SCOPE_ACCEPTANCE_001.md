# FES 07A Push and Deep Link Runtime Scope Acceptance 001

```text
SCOPE_COMMIT=4c9b93ba8c53ffde265336ad170646fedb0a0bc0
REMOTE_CI_RUN_ID=30380162530
REMOTE_CI_URL=
REMOTE_CI_CONCLUSION=success
DEDICATED_TESTS=36
DEDICATED_PASS=36
REGRESSION_TESTS=565
REGRESSION_PASS=565
```

FES 07A locks the permission, subscription, scheduler, push-payload,
deep-link, retry, deduplication and internal-fallback boundaries without
requesting permission, registering a subscription, installing a service
worker, calling an external provider or changing productive UI.

FES 07B must publish an exact implementation manifest before mutating any
runtime file.
