# REP-10 — Pipeline Report Provider

```text
REP_10_PIPELINE_REPORT_PROVIDER=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=5f5d1df5e5d9eb83fc783907c10aec7c8a873f57
PIPELINE_TRANSITION_SCHEMA=pipeline-transition.v1
PIPELINE_TRANSITION_PERIOD_MODEL_SCHEMA=pipeline-transition-period-read-model.v1
PIPELINE_TRANSITION_EXCLUSIONS_SCHEMA=pipeline-transition-exclusions.v1
PIPELINE_REPORT_PROVIDER_SCHEMA=pipeline-report-provider.v1
REPORT_DEFINITION_ID=pipeline-transitions
REPORT_DEFINITION_VERSION=pipeline-transitions.v1
PIPELINE_TRANSITION_READ_AUTHORITY=YES
PIPELINE_STAGE_MUTATION_AUTHORITY=NO
CURRENT_STAGE_SNAPSHOT_AUTHORITY=NO
CONVERSION_RATE_AUTHORITY=NO
FORECAST_AUTHORITY=NO
SCORING_AUTHORITY=NO
ACTIVITY_PROJECTION_AUTHORITY=NO
CRM_MUTATION_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-10 projects accepted `pipeline-transition.v1` facts into the universal
reporting kernel. The canonical Pipeline vocabulary contains thirteen stages.

This provider reports movements that occurred during a period. It does not
reconstruct current stage occupancy, historical funnel snapshots, conversion
rates, velocity, probability, expected value or forecasts. Those require a
separate accepted snapshot authority.

## Dimensions

- `transitionDate`
- `fromStage`
- `toStage`
- `hasAppointment`
- `hasPolicy`

## Measures

- `transitionCount`
- `evidenceTokenCount`
- `appointmentLinkedTransitionCount`
- `policyLinkedTransitionCount`

All measures use `SUM`.

The provider consumes either `pipeline-transition-read-runtime.v1` or
`pipeline-timeline-read-composition.v1`. It never mutates Pipeline, CRM,
Activity, scoring, UI or persistence.

Next: `REP-11_EXPORT_AND_DELIVERY_ADAPTERS`.
