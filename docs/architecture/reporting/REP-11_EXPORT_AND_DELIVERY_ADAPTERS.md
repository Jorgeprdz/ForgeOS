# REP-11 — Export and Delivery Adapters

```text
REP_11_EXPORT_AND_DELIVERY_ADAPTERS=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=e018f05a5045fca3b8f51480281d0d7e2b5a3cc6
REPORT_EXPORT_REQUEST_SCHEMA=report-export-request.v1
REPORT_EXPORT_BUNDLE_SCHEMA=report-export-bundle.v1
REPORT_EXPORT_FILE_SCHEMA=report-export-file.v1
REPORT_EXPORT_MANIFEST_SCHEMA=report-export-manifest.v1
JSON_REPORT_EXPORT_ADAPTER_SCHEMA=json-report-export-adapter.v1
CSV_REPORT_EXPORT_ADAPTER_SCHEMA=csv-report-export-adapter.v1
DOWNLOAD_DESCRIPTOR_DELIVERY_ADAPTER_SCHEMA=download-descriptor-delivery-adapter.v1
REPORT_DELIVERY_RECEIPT_SCHEMA=report-delivery-receipt.v1
SUPPORTED_EXPORT_FORMATS=JSON,CSV
SOURCE_REPORT_MUTATION=NO
RECALCULATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
BROWSER_DOWNLOAD_SIDE_EFFECT=NO
FILE_SYSTEM_WRITE=NO
NETWORK_SEND=NO
EMAIL_SEND=NO
PERSISTENCE_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-11 turns an accepted `universal-report-model.v1` into deterministic export
bundles.

JSON preserves the complete universal report. CSV emits dimensions first and
measures second, in the order declared by the report. Every export includes a
canonical JSON manifest preserving report identity, totals, exclusions,
provenance, execution metadata and comparison results.

CSV spreadsheet safety guards formula-like string cells without recalculating
or changing numeric values. The manifest records whether this presentation
safety was enabled.

The download descriptor adapter returns client-ready immutable descriptors. It
does not initiate a browser download, write the filesystem, use the network,
send email or persist anything.

Same report plus same request produces the same `exportId`; delivery produces a
deterministic `deliveryId`.

Next: `REP-12_REPORTING_SURFACE_ADAPTER_CONTRACT`.
