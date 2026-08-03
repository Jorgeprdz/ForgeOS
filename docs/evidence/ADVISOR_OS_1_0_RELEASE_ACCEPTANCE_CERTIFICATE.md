# Advisor OS 1.0 — Release Acceptance Certificate

```text
PRODUCT=ADVISOR_OS
VERSION=1.0.0
TAG=advisor-os-v1.0.0
STATUS=FINAL_AFTER_RELEASE_WORKFLOW
CANONICAL_URL=https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/
```

This certificate becomes final only when the release workflow proves all conditions against one immutable commit and creates the declared tag on that commit.

## Functional gate

```text
BENVENU=PASS
COMMAND_BAR=PASS
AGENDA=PASS
NOTIFICATIONS=PASS
CLIPPY=PASS
LOW_FRICTION_INPUT=PASS
BULK_INTAKE=PASS
BOOKS=PASS
PIPELINE=PASS
QUOTES=PASS
CONVERSION=PASS
PORTFOLIO=PASS
ACTIVITY=PASS
FORECAST=PASS
REPORTS=PASS
COMPENSATION=PASS
PUBLIC_ACCEPTANCE=PASS
```

## Stop conditions

```text
CRITICAL_DEFECTS=0
HIGH_DEFECTS=0
UNAPPROVED_MUTATIONS=0
UNKNOWN_AS_ZERO=0
PUBLIC_ACCEPTANCE_WITH_ASSET_OVERRIDES=NO
LOGOUT_PRIVATE_DATA_REMAINS=NO
NATURAL_LANGUAGE_PERSISTS_WITHOUT_REVIEW=NO
EXTERNAL_APP_OPENED_CLAIMED_AS_COMPLETION=NO
```

## Finalization authority

The GitHub Actions release workflow must:

1. validate the manifest and all release documents;
2. execute the release contract and inherited regressions;
3. verify there are no open `critical` or `high` defects;
4. wait until canonical Pages `build-info.json` equals the merged release SHA;
5. smoke the canonical public route without overrides;
6. create `advisor-os-v1.0.0` on that exact SHA;
7. publish a GitHub release with the generated machine receipt.

```text
ADVISOR_OS_1_0=COMPLETE
```
