# Repository Migration Check Report

Status: PASS_WITH_WARNINGS_ALLOWED

Strict Links: true

This aggregate command runs migration validation, link validation, duplicate destination checks, inventory schema validation and protected-root regression checks. It does not move files.

## Hard Gates

| Gate | Status | Count |
| --- | --- | ---: |
| protected_root_violation | PASS | 0 |
| runtime_move_candidate | PASS | 0 |
| inventory_schema | PASS | 0 |
| destination_overwrite_risk | PASS | 0 |
| broken_markdown_links | PASS | 0 |

## Reports

| Report | Markdown | JSON |
| --- | --- | --- |
| inventory | `docs/06-repository-governance/reports/test-output/migration-inventory.md` | `docs/06-repository-governance/reports/test-output/migration-inventory.json` |
| validate | `docs/06-repository-governance/reports/test-output/migration-validation-report.md` | `docs/06-repository-governance/reports/test-output/migration-validation-report.json` |
| links | `docs/06-repository-governance/reports/test-output/broken-link-report.md` | `docs/06-repository-governance/reports/test-output/broken-link-report.json` |
| duplicates | `docs/06-repository-governance/reports/test-output/duplicate-destination-report.md` | `docs/06-repository-governance/reports/test-output/duplicate-destination-report.json` |
| validate-inventory | `docs/06-repository-governance/reports/test-output/inventory-schema-validation-report.md` | `docs/06-repository-governance/reports/test-output/inventory-schema-validation-report.json` |
