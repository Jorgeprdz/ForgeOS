# Repository Migration Check Report

Status: PASS_WITH_WARNINGS_ALLOWED

Strict Links: false

This aggregate command runs migration validation, link validation, duplicate destination checks, inventory schema validation and protected-root regression checks. It does not move files.

## Hard Gates

| Gate | Status | Count |
| --- | --- | ---: |
| protected_root_violation | PASS | 0 |
| runtime_move_candidate | PASS | 0 |
| inventory_schema | PASS | 0 |
| destination_overwrite_risk | PASS | 0 |
| broken_markdown_links | WARN | 7 |

## Reports

| Report | Markdown | JSON |
| --- | --- | --- |
| inventory | `docs/architecture/repository/reports/migration-inventory.md` | `docs/architecture/repository/reports/migration-inventory.json` |
| validate | `docs/architecture/repository/reports/migration-validation-report.md` | `docs/architecture/repository/reports/migration-validation-report.json` |
| links | `docs/architecture/repository/reports/broken-link-report.md` | `docs/architecture/repository/reports/broken-link-report.json` |
| duplicates | `docs/architecture/repository/reports/duplicate-destination-report.md` | `docs/architecture/repository/reports/duplicate-destination-report.json` |
| validate-inventory | `docs/architecture/repository/reports/inventory-schema-validation-report.md` | `docs/architecture/repository/reports/inventory-schema-validation-report.json` |
