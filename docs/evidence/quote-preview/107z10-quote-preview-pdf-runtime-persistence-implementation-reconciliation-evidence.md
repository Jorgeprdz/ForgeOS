# 107Z10 — Implementation reconciliation evidence

Status: **PASS**

## Resolved owners

```json
{
  "EXTRACTOR": {
    "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
    "score": 205,
    "reasons": [
      "preferred_previously_proven_path",
      "quote_pdf_preview_path",
      "product_intelligence_path",
      "extract_contract",
      "pdf_preview_content",
      "exported_module"
    ],
    "sha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014"
  },
  "EXTRACTOR_RESOLUTION_MODE": "UNIQUE_BY_SCORE_MARGIN",
  "INTEGRATION_ADAPTER": {
    "path": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
    "score": 195,
    "reasons": [
      "preferred_previously_proven_path",
      "quote_preview_adapter_path",
      "product_intelligence_integration",
      "known_adapter_phase",
      "adapter_path"
    ],
    "sha256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
  },
  "ADAPTER_RESOLUTION_MODE": "UNIQUE_BY_SCORE_MARGIN",
  "CONFIRMATION_MODAL": {
    "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js",
    "score": 200,
    "reasons": [
      "preferred_previously_proven_modal",
      "confirmation_modal_path",
      "modal_api",
      "extraction_ready_event"
    ],
    "sha256": "0d39d0ac1ecc823b1888d01c1386f58cbb6945544756aae27989bf62100749d4"
  },
  "MODAL_RESOLUTION_MODE": "UNIQUE_BY_SCORE_MARGIN",
  "EXISTING_STORE": null,
  "STORE_RESOLUTION_MODE": "TOP_SCORE_BELOW_THRESHOLD",
  "EXISTING_PERSISTENCE_BRIDGE": null,
  "BRIDGE_RESOLUTION_MODE": "NO_PROVEN_PERSISTENCE_BRIDGE"
}
```

## Candidate rankings

```json
{
  "extractor": [
    {
      "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
      "score": 205,
      "reasons": [
        "preferred_previously_proven_path",
        "quote_pdf_preview_path",
        "product_intelligence_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
      "score": 85,
      "reasons": [
        "quote_pdf_preview_path",
        "product_intelligence_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js",
      "score": 65,
      "reasons": [
        "quote_pdf_preview_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "ed1cc6632bcbfdaaa38e6400e2e307d523b3dfcd3ac53aac4721dc455471353f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js",
      "score": 65,
      "reasons": [
        "quote_pdf_preview_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "3672e0049a44992d6ee0168b11d2dd76b93ef77861f06cf6189b459a2c6c8e08"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js",
      "score": 65,
      "reasons": [
        "quote_pdf_preview_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "efd73bd8d6fc056b34048da0cd6586b0215a27012edf731e9981bd2b182768ce"
    },
    {
      "path": "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
      "score": 50,
      "reasons": [
        "product_intelligence_path",
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "44b44f3a284a1ec00e48f3a278dc6256038d3f984695af4d9424a6eca0ef5738"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "073951b0dba2b11c96445f03bd4c7196c248cb7f3b75b94a7d5eaf6eaad74670"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "ea071a57362f2c105332545c0c50715bc6c1d1a4496ac0de8be40fffc5f26462"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "55de29e93dc766c61790544663b6b4ba3b038f05892d5758bcc1e75a7bd513d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "28ebb55e65b766fc99c92f1eec7856eb20585eb9278d4f4ce2a1873338841818"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "3ce4edd0c289d3c9566c2ab4b9e979c243f16a0c4a24834fd7895674442102d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "d279bea1728557e628ebc1faeb800be1c2e9f3c17bf0b445096febcea740908f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js",
      "score": 50,
      "reasons": [
        "quote_pdf_preview_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "f72934ffbd187425a8de51753ae8c1cad980eeb1c67e5cdd23cabce99c33b2b5"
    },
    {
      "path": "product-intelligence/quotes/quotation-extraction-result.entity.js",
      "score": 40,
      "reasons": [
        "product_intelligence_path",
        "extract_contract",
        "exported_module"
      ],
      "sha256": "c19b213338a744c5287cb4ffbf1bb09833bf5716873a56ada227b3afcd9c7290"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
      "score": 35,
      "reasons": [
        "product_intelligence_path",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "91dd81c82799e03ff83522fd974ee19071048d529860fb2c0d21a545346f6bd7"
    },
    {
      "path": "product-intelligence/evidence/vida-mujer-knowledge-extractor-report.js",
      "score": 35,
      "reasons": [
        "product_intelligence_path",
        "extract_contract"
      ],
      "sha256": "ef9ece00d6b0726a34c7d2c63062a0c2059e1b2c1b42c7c0435a084a7eca85a8"
    },
    {
      "path": "product-intelligence/rules/vida-mujer-status.js",
      "score": 35,
      "reasons": [
        "product_intelligence_path",
        "extract_contract"
      ],
      "sha256": "4b4e5f2acfb548b2aeaa9ebb5844c3d235f6f0215b9bb266fcd417f90a1bb86d"
    },
    {
      "path": "imagina-ser-ocr-extractor.js",
      "score": 30,
      "reasons": [
        "extract_contract",
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "e6662d8fff0b2783470061e48039b1dc7c9af5db287f7059639e5252cf3ff123"
    },
    {
      "path": "docs/06-repository-governance/reports/migration-inventory.json",
      "score": 25,
      "reasons": [
        "extract_contract",
        "pdf_preview_content"
      ],
      "sha256": "79f7272027e35647342b3c0f4dc303f8dd2abeeac01dcd5acaf32517273eaeb5"
    },
    {
      "path": "docs/06-repository-governance/reports/test-output/migration-inventory.json",
      "score": 25,
      "reasons": [
        "extract_contract",
        "pdf_preview_content"
      ],
      "sha256": "0a0ac2ecf645d15b993090b5585f73be1184cd97775de9710e5471cc4f600ef6"
    },
    {
      "path": "imagina-ser-master-test.js",
      "score": 25,
      "reasons": [
        "extract_contract",
        "pdf_preview_content"
      ],
      "sha256": "0e77b49ef538aefa723ac995c1c39247b721c58faeb16c6370f719cf324f8b3c"
    },
    {
      "path": "migration-inventory.json",
      "score": 25,
      "reasons": [
        "extract_contract",
        "pdf_preview_content"
      ],
      "sha256": "45adf1f27c9d3d95eba66b1ee81ae977b2c2befebfd8c517d89d389fee67aa40"
    },
    {
      "path": "product-intelligence/evidence/gmm-quote-parser.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "c20a1d9ee10ef349a86db73bed1c28f1e2ba36534736058fda3e4f3e74161937"
    },
    {
      "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "03715ebbad73e261727a8b45239184ec7d95a69ebda551e908c086c35c50b7f3"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-confidence-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "c9c11a1e37f4bf5dc4c25c1588c692c8a86cb169dad323bebe4cd4758a6e3db4"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-death-benefit-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "e259ab5f68732a36d354d315825017bfb91ba5e04ff749e5626aaeb13290f6f1"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-eligibility-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "8b7ecf72f12c914368aa52f97b422c803d7d63f4f4f2b2b88e1122d3e74d254a"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-growth-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "2c1a08b3ec6f07db90d6ea52bcd6b2d809692053f9bf0df4e6ef8ee3a930dc5c"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "04d70a24ee62fae8db5986f7292adcfb65a0062732bba181840ee41eef2894cf"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-rescue-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "55652ac7246025a02691e42980aa88e21e3d452213fd9d3627c3fc949b5e3cb7"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-type-inference-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "6e6f3bf8f26c9e48cafb71fa0b391e906d281f07fb116728fe8ec226bc1e3b02"
    },
    {
      "path": "product-intelligence/knowledge/discovery-product-alignment-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "b73c02382f09be5c465982a2e813904f59e5719ae16bd4ef1c1c6fa639b0c7d5"
    },
    {
      "path": "product-intelligence/knowledge/imagina-ser-contribution-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "2c40b45a24d7cbfc0d0d05c09894868f45bd1d713dd1cb96fb8996f52649c9ee"
    },
    {
      "path": "product-intelligence/knowledge/imagina-ser-human-language-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "8df45ac1693d9639ca213ebb3851f811ae838443d9dc109749e90849e6f139b2"
    },
    {
      "path": "product-intelligence/knowledge/product-schema-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "075852ad4456e54c2546a7211cac4b5dedc679825b1936fcf8bab1405b2c7c76"
    },
    {
      "path": "product-intelligence/knowledge/shared-education-cost-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "c3a0410a7d22e9f4210c5f8d200a300c3433f99664f2f50d8ca9bcf5c45f0c26"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "0cac862db1344d5c97dbe5c60bfab07bf659bd7e95601044da0260203bb9ad19"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "cbb41b22e0cf559c8fa50bb2f19bf2d801c4a11c056477bce8e7ed99af1e9cb3"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-priority-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "a8b48c032175d6cb4c8205ec838c475673553fa1abdca5994677cd59d3f5a0e2"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-story-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "67787387d1d89f68a9b801a0ce42f63d3268fafc7963c9452c92f701c39c1407"
    },
    {
      "path": "product-intelligence/projections/financial-risk-score-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "5a3dd094c4f98fb339f0df54ee47bcb293c221aec61d6b550f9a6674504c26cc"
    },
    {
      "path": "product-intelligence/projections/life-expectancy-projection-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "68490992314aa4599cfa12f7634fa16d6078f773befc444918e5ff8dfe147b7c"
    },
    {
      "path": "product-intelligence/projections/projection-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "d1189846a2f1ee4c0cc1679522fea89b94afcfe4a229c9a8687d4bc44d500897"
    },
    {
      "path": "product-intelligence/projections/projection-milestone-engine.js",
      "score": 25,
      "reasons": [
        "product_intelligence_path",
        "exported_module"
      ],
      "sha256": "eb4a4e0059ab7d9bea3f901688ea4be8aaaab330ef930755e2476d4a5deb0eed"
    },
    {
      "path": "compensation/new-professional/new-professional-life-bonus-total-orchestrator.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "1972e67752f4af60aa8b207a52a28daca15e5ba9dd7876c34735c131d1fffc16"
    },
    {
      "path": "compensation/partner-manager/partner-official-evidence-status.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "eb15d920525dbcb583921795e0531b33877e817248f1da2edc6b4fc97ebb94cc"
    },
    {
      "path": "compensation/partner-manager/partner-official-evidence.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "936a28396798281512b130e12b27ff0c09a0114b7478432f38cf6af9bf194f5f"
    },
    {
      "path": "compensation/partner-manager/partner-payment-cadence-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "358b0a3fb58ce20c179babaf04248890afc0e20cc46d0904c9f928a03bdce7e4"
    },
    {
      "path": "compensation/partner-manager/partner-payout-truth-gate.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "539cf3f0d771e0def244b22bc768d6dcba7d3ad2bbd378e0af4f9fa3b9754393"
    },
    {
      "path": "dynamic-cash-value-projection-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "af1252e1c83229e3079b0e57165a7cab62c973b9cc93b3f8a728ca225c61a0e8"
    },
    {
      "path": "engagement/context-intake/engagement-manager-context-intake-orchestrator.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "9f5d8ce1c35f22dbf345f518730cd3a9d37d504f51f5bb0389e088fcb418870b"
    },
    {
      "path": "engagement/context-intake/engagement-manager-dignity-guardrail-intake.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "cf56633c1fc27e8c86acfe3f63a5ca5774cff26011583d078a8f974c1cfffcd1"
    },
    {
      "path": "forge-ai-guardrails-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "4e19c6b1429b546b528cfd47860a2569f8cb5e1bfbd90f430c864fed843133d0"
    },
    {
      "path": "gmm-policy-caratula-summary-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "34d6d43d6b7abc54afba84cb8cd52db0331218c458e58894e00aefa91fe4c934"
    },
    {
      "path": "gmm-quote-summary-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "3b31dd4ebd59133a4d02bb533c7c52b006aeba6a96f528909de2ac1a45d304a1"
    },
    {
      "path": "manager-os/alfred-review-action-packet-read-model.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "3d99f152f74cc96b69c321c053436e0bf9a0d7a26c76bfc66e1d8ce57acefe89"
    },
    {
      "path": "manager-os/alfred-review-action-packet-ui-view-model.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "5f802664e444e049a9ae47822903746d40624b3af6595d4a1d12813c18be793b"
    },
    {
      "path": "manager-os/alfred-universal-command-memory-read-model.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "e4f89af87453500ba41cd2a1ee114aba0c5a8ccf035ae8c5ab82db1d2e7c52e7"
    },
    {
      "path": "manager-os/forecast/manager-recruitment-forecast-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "32e07bcfa6d2e76d206f6acd0cc791df5115f944937d958e9f59f8f466de7fe5"
    },
    {
      "path": "mick/context-intake/mick-manager-context-intake-boundary-contract.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "e28a99c4b417042ac850930e056be1bc6d86754590b66adf7410e79be749f367"
    },
    {
      "path": "nash/context-intake/nash-manager-context-intake-boundary-contract.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "1c5d44bc50517605c65d390ddd430d1743e090d43e42b808ed990e5282da511a"
    },
    {
      "path": "nash/context-intake/nash-manager-context-intake-orchestrator.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "1fb4175bf029cbe5eeee087ed4cc5ff5a36d7688c8381c14d57ce1c4364bca1b"
    },
    {
      "path": "nash/context-intake/nash-manager-conversation-prep-packet-intake.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ad2e2751ea72f4797d8dba3032eef5106cbae2da22ec9d90642de2aa927c8366"
    },
    {
      "path": "orvi-ocr-extractor.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "261f4984d5e117b0c93f64c44a6bf60789c0ae315473c688874aab7079876cc6"
    },
    {
      "path": "platform/truth/contracts/evidence-states.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "336352ab3823304228cf153fb04d5ca7267cf7c321ec38199f7e8796d12852de"
    },
    {
      "path": "platform/truth/validators/evidence-state-compatibility-validator.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "9fb183fe0986c3c3275529735836c04dae4bda0756c8e750ea269d002ebd1969"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-extraction-candidate.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "1f0b061e3556672cf139274513a20dad8c2d6cc1a5f20c65e29597352ce53a6e"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-inbox-router-contract.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "833656e659909f7fb6b6b8b9ea46eddabd6aacc9b01d7b01ad4657dcffba9730"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-processing-status.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ec161abc9696bec7c78abf521bdd04d7d0adb08b2d89b4dac1aca4cc8f5dbf75"
    },
    {
      "path": "policy-operations/evidence/commission-statement-evidence-packet.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "d1eb6c43e79db6fadca006a0527ecf38765f91ff79bd5f0878e606681ddb5147"
    },
    {
      "path": "policy-operations/evidence/ocr-result-cache.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "e951170a4c575423f5756951e57107fb649fec4dfe257a544296fdfd0dd9ab0d"
    },
    {
      "path": "policy-operations/evidence/payment-evidence-packet.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "fdf4268dc168c1839eb08833fc12391b58081edf5ebac85625b4565d180a39d7"
    },
    {
      "path": "policy-operations/evidence/policy-document-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "37fa61cb877ad10a444f7d2e612555522cf8d7ec8203029e5fc7ab52930a82f9"
    },
    {
      "path": "policy-operations/evidence/policy-evidence-packet.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "98a8added5267fd2068e9f51cb95951097b9c2054dbf29a0988a5d0f3db453a1"
    },
    {
      "path": "policy-operations/evidence/policy-ingestion-orchestrator.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "830679cdb2cfad31d86398fa6825d6870faf224a1b83df46b8ca5da0c571fdd6"
    },
    {
      "path": "policy-operations/evidence/policy-ocr-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "bef03a5cf532e786b9b7ba760b1e091b86ebb2e8e2fb07056615ba248a16193d"
    },
    {
      "path": "policy-operations/policy-advisor-confirmation-gate.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "a3a1e814310d37b0f491e61027088457afb87ca7624b840b86d77d8d2cbc5e52"
    },
    {
      "path": "presentation-input-pipeline.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "5861500adac63c56389d8416603eeda9892689ae9fa4bd62e56fa4ed655fc9e1"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-confidence-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "186a87a3dfdef145aefc94d28d4f8d2925131af96af2d5f580c3ddb788716060"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-death-benefit-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "dca5f882af8608273cd790a4ca186622fc938d421f7400fee6fece817d0517de"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-growth-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "6d36055cda5def3a29cd5f8f51f22f9ebb7d138d60694d1ae6bee36123b300a2"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "0925fd31ab05a35d03dca24579f2add614901fdd964ab61271da73301dfad660"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-rescue-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "aa9c49ef0dec8bc9bc16b82f3ff304a2cd3c8ca29d096baa22e5516934da4966"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-type-inference-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "0966b5e96842e1f6cac6ca2aaaf6d8b529fe684143c4da6c01c15d554cc618eb"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-client-explanation-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "e7b306d2f17717ae1288f9950e258a6e4f6f08a14a165faf94973e12d334bfe5"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-pdf-intake-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "72354a396d80558941f4df2f8aee648957b41932972b61f694b58f959720cccb"
    },
    {
      "path": "product-intelligence/quotes/quotation-input.entity.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
      "path": "product-intelligence/rules/vida-mujer-rule-consistency-report.js",
      "score": 20,
      "reasons": [
        "product_intelligence_path"
      ],
      "sha256": "618566db7b24d7385e7b500e6e0a05f6980631260e8d78112eb8d4c633b6c3ad"
    },
    {
      "path": "retirement-presentation-scenario-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "7b9c8b66d3e28aadf30d102979e7474d819f464bdb0ca0092a5e27e7957fd215"
    },
    {
      "path": "revenue/economic-events/economic-event-status.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ab1591ad5802ab94ba0894ece0519ed3740324f8b624a8cec99f1eeddf4fff6f"
    },
    {
      "path": "scripts/repo-doc-migration-harness.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "d4c13bff3c40b376aa2ebf955757d3074b2a8c8c389e716d5d77fcc578edc41d"
    },
    {
      "path": "source-ownership-registry.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "135ebcdd47a033b33bb8b59e2076f77b9bcdb2d91377abddce0cbe805975af26"
    },
    {
      "path": "src/intelligence/alpha-runtime/event-extraction-engine.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "05928bea7d46a05bfeaaa7510ba7b33062af1e05971173c9aea8b2caee571bd1"
    },
    {
      "path": "src/intelligence/alpha-runtime/forge-alpha-runtime.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ee1b067e8c2937261d6b4a3b5458ac0f1c1600ee8f53098eef0d6b9bd65822ea"
    },
    {
      "path": "src/intelligence/hdl/discovery-signal-extractor.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "099f54cc420e132a8f34f0bff648e6e19e940665d814f470979dbf0f21769385"
    },
    {
      "path": "src/intelligence/hdl/index.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "9976ce271b583412e4839c2ca6104996f0a6f83e9151ef3d20937192a0a93e26"
    },
    {
      "path": "src/intelligence/hdl/semantic-frame-builder.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "a33bf50ac818b4a631be46810aee961630cab19ff116abe26cf6b5f6d839074c"
    },
    {
      "path": "src/intelligence/hdl/semantic-frame.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "1c5fb927b7ed991718d9d218a55e06c2cae4e54870da21797bc53aa9eb69cedd"
    },
    {
      "path": "src/intelligence/hdl/signal-types.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ce9168858575b4ab1d3799c948dfe6f29d666a7022914feb9f56c95a03928670"
    },
    {
      "path": "src/intelligence/semantic-guardrails/semantic-candidate-guardrail.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "3af5e6b6f7bd2e1f161e34f167fc94900bb2b2073ecb36670d6192a25df1f284"
    },
    {
      "path": "src/services/forge-alpha-service.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "8781292eead5e32470d997afe62fadc3605ec83576057d184ed6d7026cea48ce"
    },
    {
      "path": "vida-mujer-knowledge-extractor.js",
      "score": 20,
      "reasons": [
        "extract_contract",
        "exported_module"
      ],
      "sha256": "ae341a2c1ecbce9e29f984b6cd24740707a423bde817c6aa83497794c95d548a"
    },
    {
      "path": "compensation/partner-manager/rule-data/smnyl_partner_compensation_2026_rules_canonical_draft.json",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "fd416447333c0d48a3da3b16a1b3cb58288cfeeb6f194aad02b3319083185423"
    },
    {
      "path": "compensation/partner-manager/rule-data/smnyl_partner_compensation_2026_rules_official_v1.json",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "f89375306791366b9e7bd12c6e058b8a2e9fa527ec8fe6d365bcdc5ca38f4b5d"
    },
    {
      "path": "docs/10-gui/mobile-daily/app.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "80082e672eca2f430a4b072e7efec395997e5dfae7133545869c801f61e78597"
    },
    {
      "path": "docs/10-gui/mobile-daily/index.html",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "b3e87590c470e6909453bd596562fd3f1a068103864390da8dcb63a31706bce8"
    },
    {
      "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "0d39d0ac1ecc823b1888d01c1386f58cbb6945544756aae27989bf62100749d4"
    },
    {
      "path": "forge-build-tree-status.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "b5fcdf73d2068d14a293f88f2a0a0562c2d530cb0890943c2d43db0302e8bc87"
    },
    {
      "path": "forge-gmm-real-case-smoke-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "f554f1778ecd384fb37be28dfcdf4d4e53644b04a2f621bd63d98732df949e4e"
    },
    {
      "path": "forge-imagina-ser-client-presentation-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "fa56ed1f747f381ec2414a841a216a0714cbc952e2a98e0a1a5920eb8f18be69"
    },
    {
      "path": "forge-vida-mujer-advisor-report.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "db689b4618ae0a717cccf0dfbf4ad64934b9d40ba259447752987e743ef59e61"
    },
    {
      "path": "imagina-ser-banxico-integration-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "6e3bc681c0a8b7a37065687983e4f780f347564a2f578a2c3063299cb3d1d9cf"
    },
    {
      "path": "imagina-ser-real-quote-validation.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "f36462b9dd45be18bb7e810be5f311292e9a854d76dcf2aabb9aa6eba92174ef"
    },
    {
      "path": "orvi-client-report-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "90f06246522e26438d4c09b513b7d7aac7bf29d8845bc05266579299f4e70c68"
    },
    {
      "path": "orvi-master-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "8789c3f2a11d9ce6554519403e403b9eb457e91427ba69f5efb0a572d6baa935"
    },
    {
      "path": "orvi-mxn-master-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "60958f325065fe3d4dc6b67828e9c26789ffeee37fe550d382c53f37a6e36a34"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "9128bf5ddb4b80b9c7863a31f3af78e22f27d33c47a0d6f0311250fae8043c67"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "6e744762a2173754d81b4bf3a87074afda8ab1915e44cfae6ca5161dbd603f4c"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "b81886926505ee34b5ff3fd4d2b66fc054f65ef75d360db1b830f0a9d72bbba1"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "1e5465c7f4db866e0f57fd7fe4fd7e0bb1ac2ddbb425e616f15f048a8173a628"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "13060f39935b5677dda547934cf41cc7a276a4c8e33cebabb47b90aa0458dd06"
    },
    {
      "path": "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js",
      "score": 15,
      "reasons": [
        "pdf_preview_content",
        "exported_module"
      ],
      "sha256": "6f91db75c769208f33491579b37c83bfd1f114d2ab5442bc56df82b7d51110af"
    },
    {
      "path": "schemas/question-evidence.schema.json",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "9a6f51e41a5abe61afcbe58abfefef926a8070ed0da19ce73198af6c4c1d02cf"
    },
    {
      "path": "segu-beca-master-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "90c080b5247979748cd10e62fdf4ea947ac339b1d88556c714c036e8cee781bf"
    },
    {
      "path": "semantic-extract-acceptance-test.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "f162d2e000756693906be10ea9af8db55b1948603ca7ffd0c3f217bb572437b5"
    },
    {
      "path": "supabase/functions/semantic-extract/index.ts",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "b6465e0e171a3608666420c36828957d0dc236414f5dfd3c9fae01b184c765c4"
    },
    {
      "path": "vida-mujer-financial-correction-report.js",
      "score": 15,
      "reasons": [
        "extract_contract"
      ],
      "sha256": "b023c51f450e30e678b8b443ab412d099367ff05e3e7908e3f6b2f114fb22b51"
    },
    {
      "path": "docs/static-preview/forge-alive/nueva-cotizacion/index.html",
      "score": 10,
      "reasons": [
        "pdf_preview_content"
      ],
      "sha256": "a27e945371fb39ca5858c9dbdf6f50234f514ba294feba33179edcf61dd4d797"
    },
    {
      "path": "accessibility-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "507036c66dc90c17d3284c2ea91f9c52f5209a109b624f40f476622f7e43935f"
    },
    {
      "path": "action-resolver-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6c96495658479e16cbfc0c422dcfd3349a0a6dd4cf3e1711ec6ac93ac76ad956"
    },
    {
      "path": "actividad.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2c68d08c4c67384b37ad9c59c026a3f5a2369a4abdf7dd7918ad86573d2f9aee"
    },
    {
      "path": "activity-feed-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "639eb2859fd038fc1bce7624b9e230dbcb93612c532df667ef7ab19dc086a7cb"
    },
    {
      "path": "activity-feed.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "33de962b30a610f4ce5357b17ceb63f045f2b13a8cd749f306629c42cd56211a"
    },
    {
      "path": "activity-stream-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "75c1240e57a716cf710ccca963627c16ac0d17cd30f5e2bae1dd54a7fff7fa28"
    },
    {
      "path": "adaptive-message-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "91e8d1bf29023ac4f3eb164544a318df64fa9cb2f4eb9c7cff9b28118cf41f12"
    },
    {
      "path": "adaptive-outreach-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a9c5947cc6ae240f0685c7d2eb6395ccaade823049dddab2d603a30166387122"
    },
    {
      "path": "adaptive-question-bank.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "802b3fb14d1b537df30e315c5abf6337e21b3c6609a8554c05658665d2dcfad1"
    },
    {
      "path": "adaptive-question-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fb4ac5886bb9247b63c5b956535e75dd6654336d1565b15c53e4f58c9407afde"
    },
    {
      "path": "adaptive-script-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fb30c62a18af3c8c8b77b21470a7d8873ad7959d20349ea82062bbd19ef7399b"
    },
    {
      "path": "advisor-lifecycle/advisor-career-clock.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "59197ac5a7ea09711493a9efbfdb8b36dbac1687bae57e8286679a85a22f9291"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-career-chain-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0bd4de374b5fe370468008e3d1b4203f78ae1c604723cfc5e1588a5112c21dac"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-evidence.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3bf7b9488a128db92097a4d07555f0490a4c2f661e0bde0ded311e38f9e8c177"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-rda-reference-consumer.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5b05a71bbdd376672f07fae64c69a7af4788aac87db57c3fbc84cebeae333b23"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-status.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "abf78c271b4c0052cc84407a6eac6703021645722008dd26368c14ad25d3bd7b"
    },
    {
      "path": "advisor-lifecycle/advisor-stage-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2c1719b737b1a810266e275cd0b366294f6cc0a8b600566f63e2f628311148b0"
    },
    {
      "path": "advisor-lifecycle/lifecycle-to-compensation-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "db8ec753febae476fc4a5835407235b8477058608a534333b5bffe291d0b1efa"
    },
    {
      "path": "advisor-lifecycle/lifecycle-to-revenue-mapper.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "58a1574fdef60e4b6fa67fbc287a4e6a73691da741702878661b6e52fd3d89af"
    },
    {
      "path": "advisor-lifecycle/precontract-economic-status.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "212f794c8f0595400b7d37d88569fbd597d18350e4a26c45cf5171d67f5c2e30"
    },
    {
      "path": "advisor-lifecycle/precontract-revenue-classifier.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7fbb291dffdf2e09180041179b5e72791962ff7a73bb9def27c375892aedf99d"
    },
    {
      "path": "advisor-os/advisor-activity-timeline.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ba17239271e680b25911264607971ec7dbc5c205bd028cbc325027c1e2c4b166"
    },
    {
      "path": "advisor-os/advisor-alert-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "554c9b1ac7daf2b1d230c7a0019427dda7d64bbd8c7f749ec8c12691b827624b"
    },
    {
      "path": "advisor-os/advisor-monitor-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e04aed8d1b771456156f77c7d0e4b23c320836bcde6f80abb21a2b018564899a"
    },
    {
      "path": "advisor-os/advisor-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ea3b3aa50cc8d0d26c59dd42b60984f453b8d7095880bd24c64dd5b799f83db5"
    },
    {
      "path": "advisor-os/advisor-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bd7fbbda784895ba754f7caa7e00092555caa0e8fd82ba10491abbb01838aa4c"
    },
    {
      "path": "advisor-os/advisor-style-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "40be3bc52623e9910187060701393a79bd0fa95440b9acbb7c5fc5732c50339c"
    },
    {
      "path": "advisor-os/advisor-style.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d8ba2fb5d3af7397d62f0cd2cf41a4112a70f896ae2ddb6c0ef36e619427937e"
    },
    {
      "path": "advisor-os/commercial-intelligence/advisor-sales-dna.entity.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "dbb2b064e62bbba894c656d3a0fee0622da6de11bc214b8b1faf223aa521854a"
    },
    {
      "path": "advisor-os/commercial-intelligence/relationship-memory-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "080c3c43f72a03f22f87615ed6e80c6116168743e13e6529073a2658c102d635"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-evolution-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c3d23380513da176463a2f16453617ecb0e379c41b1f1b7408faacefb09cb211"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-insight-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78084853a3e3013c2fccae5cf66534ca118e636956ae428e16f7611bb522fa50"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-learning-event.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "da9265dcb56112740f48c06401fc7d1fbacaa2a6a43f75be81f19ce0998786f5"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-match-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5f5e45c008fcae77615bcd473c7e5ce69e803baeb8bd66efd396c6dcef3de622"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-profile-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7c85fe2a3a2916bdf0856f209fc2c39e90b9e125b9232987fd92bd7e58284103"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-recommendation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "24ff609d0746340556e2298c6fbe5d5d22203c4b016baad40dc3f96565f89c3d"
    },
    {
      "path": "advisor-os/commercial-intelligence/sales-dna-stage-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "864e92984badbafb293d56c040227cc0fb783bd402d18ecdc01dd25393ebdd28"
    },
    {
      "path": "advisor-os/concursos/concursos.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e543ed439f6adb6b67c19b7f7ca9e764e07bfde377987b1e75af1bb722ac9240"
    },
    {
      "path": "advisor-os/conversation/ai-first-contact-message-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "254257430204cf1768c9333da8c3a8d527976ae6c6b5f9b7a380d451c09aa414"
    },
    {
      "path": "advisor-os/conversation/first-contact-ai-suggestion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f769d324efac2eaa9f71e8d1cdf8a3aa73c0e829c7b05b2fe86068a496dfc808"
    },
    {
      "path": "advisor-os/conversation/first-contact-delivery-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f5609a4df1005393cfe175123a31e75c34c534f867caca46285eb1c2f75ccf46"
    },
    {
      "path": "advisor-os/conversation/first-contact-options-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "154736c0c889956e77f1595a7c91b1b198b68827d8645490bb899bd14ccb523b"
    },
    {
      "path": "advisor-os/conversation/first-contact-script-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8220bdd5dd6fa7e977ce5be502475b0825805a1a09618e7626df700355ba8fec"
    },
    {
      "path": "advisor-os/conversation/first-contact-tone-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0fc7ed2b917736dd4f5329414a3d3c745c90f6b30d36bca3fa3c8e067f7e0677"
    },
    {
      "path": "advisor-os/conversation/first-contact.entity.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f2dd034910dd953cb4605181401f227c2931ab3a66e27a77ddfb4cc187f734f8"
    },
    {
      "path": "advisor-os/conversation/objection-battle-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "094beebea5e1e81d43fda00e1ef033647fc7267a7d4ec88c223d3733da7809e4"
    },
    {
      "path": "advisor-os/conversation/objection-classifier-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "daf1ac391b854884e85ccd8f0352f6f7a4c85c8744d8135c41066f13b0d1e734"
    },
    {
      "path": "advisor-os/conversation/objection-intent-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "df3c3c5ce00c43ecdef5f173ebdf499caf956e964e2aa7f8c7e4a857ba712976"
    },
    {
      "path": "advisor-os/conversation/objection-memory-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "42e3c1a1a495a4114ed3f3fc9e715b494058a3e76a7c35b3ba1b7ca9f7e68469"
    },
    {
      "path": "advisor-os/conversation/objection-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "233187deac25a974b117093da336d2278e066cca54243f54c8ed29dd6ba548bd"
    },
    {
      "path": "advisor-os/conversation/objection-resolution-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "dcc1997e2e8c72e4e087d30285ca74397c9c834ad1749d1ef045be9bd28121f1"
    },
    {
      "path": "advisor-os/conversation/objection-response-strategy-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f3771190cf3f87d7e9eb0387cba1b3ed9e8fe77daadd1041cfff63a4694ef8dd"
    },
    {
      "path": "advisor-os/dashboard/dashboard-executive.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e70608a2af9cd19b8ec94c2987179d0cb8e57e027b46ae1fb10a222794ceb3e5"
    },
    {
      "path": "advisor-os/discovery/discovery-insights-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "50e602b62f4fd0e3daaddd6c6ad72078d3bf415e86f32b96466e91538f747a57"
    },
    {
      "path": "advisor-os/discovery/discovery-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ecd7c489be85c1092b47ca37c6025998a3fea69e721b4294b95c8d862fa5c12d"
    },
    {
      "path": "advisor-os/discovery/discovery-summary-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "360883e290da7cf005410fa2ba2f295c6bbafb41be42c0d13d604bc3005c2eb9"
    },
    {
      "path": "advisor-os/discovery/discovery-to-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b88cfad19a4ca626ab000f8404c92941fea2aab5aa89cbcab294ef92f9f2faa7"
    },
    {
      "path": "advisor-os/discovery/hot-market-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "40ca48ff9e8b667f6eeb6da63b3480e5b53e9ad3b88a372176cde08a6c4341c4"
    },
    {
      "path": "advisor-os/discovery/needs-discovery-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c24914f355fbfda7d3bdef31811557f90de1fe83a441a1f9ebb23fcde36cc375"
    },
    {
      "path": "advisor-os/discovery/opportunity-detector-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5dcd00933aeed5d2eb7a60568395df4ba7bec3da4ff5c8ba405a8a7b880b034c"
    },
    {
      "path": "advisor-os/first-contact-objections.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bf12f0f0baee0d805d1a7165b1add300024e5f1b887534fbe11484d192e9ccd7"
    },
    {
      "path": "advisor-os/followup-type.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2d07c21c0671ea8770d8377c7245cb7eaf484a89403b0777475e2cea62dc1e68"
    },
    {
      "path": "advisor-os/followup/appointment-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "02ec288049a46462348fe90337be588563e358007ad0a763be0a3a2453e57744"
    },
    {
      "path": "advisor-os/followup/followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1b303d496f26f557398d5ec0eeb0fa97f6ec6f31b577075886e42d80eef48d0c"
    },
    {
      "path": "advisor-os/followup/followup-message-context-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f468e43f92b65c3028cd815872c32f7d7f1f65fea452a023867f6f8826c88aca"
    },
    {
      "path": "advisor-os/followup/followup-next-date-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "48b434b06a2ed9ea12a1bc7d95440774f55e16054cacd6be33cfe2affa3dfb93"
    },
    {
      "path": "advisor-os/followup/followup-overdue-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "311d9b9764aea60632daab5e06b871122b351ea8d156145c4f25701b68e86f49"
    },
    {
      "path": "advisor-os/followup/followup-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b67ea73c4c34a29c051d32148150cfaf9e0cb303bd1e156c765466992400d0ea"
    },
    {
      "path": "advisor-os/followup/followup-recommendation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3236d96a4891901ed1f85e604f456b04f5571bb51293a35680d6368702fff7f1"
    },
    {
      "path": "advisor-os/followup/followup-reminder-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d7907897611b37006dc2d8d0205e4272dc0a8b85f580dfec385c94e70afd712f"
    },
    {
      "path": "advisor-os/followup/followup.entity.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "19d2fae7d55d3bf62fd30792bf18435fa5b6785757a0af592ec5ec387a2b15da"
    },
    {
      "path": "advisor-os/followup/smart-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "931616386a12e986f7fdd2b920268489ab07d9c4db18085da5247d8898c37998"
    },
    {
      "path": "advisor-os/followup/smart-followup-message-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "061c76eafa400aabf0cd16961a8958620b9a8f71d354e88dd91e3164a4503e63"
    },
    {
      "path": "advisor-os/outreach-channel.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a75112b163387a70868176d59b15f35f1e75b356bcab65670c3932f953fbce48"
    },
    {
      "path": "advisor-os/prospect-personality.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "86c1fd770d49dbb615cf780cd7fbb187ba701d536904e2ff7fdf54f1b04ae8da"
    },
    {
      "path": "advisor-os/prospect-status.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3fd038b3f88ee35419a785957e90348de0e9d67d1a002583900d7c3539208f0c"
    },
    {
      "path": "advisor-os/prospecting/appointment-calendar-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7ef330c6fc556639f496ceb34f674548a6a9915c2cfc89f9dc73b64fc54d6bb4"
    },
    {
      "path": "advisor-os/prospecting/appointment-opportunity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe584a31c96b467faa4555d84528f63ffba47d6290e445a1f8dd95de6f14848d"
    },
    {
      "path": "advisor-os/prospecting/center-of-influence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4da2452df693ffdd8fe66cedbd7d6ce3d7c929479aa95ac68818108fe06a0cac"
    },
    {
      "path": "advisor-os/prospecting/close-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1830b0fff1fc3f7c2f35cd88f902681b5c04e06f0be296177d55d4a3433b169d"
    },
    {
      "path": "advisor-os/prospecting/close-readiness-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7231c9f4641639575bb9e0eeb43b71d89373e9a1f41b719358e9c1bc1499767d"
    },
    {
      "path": "advisor-os/prospecting/close-strategy-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8896cd4a24775a7a400c2e6d708c49e372c41eab62b9fb25b192b1b8465219f3"
    },
    {
      "path": "advisor-os/prospecting/prospect-next-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "65d6dd2e57d1025e82c80502de7345a1dd3f08a7e7e264e658fcd5e933583333"
    },
    {
      "path": "advisor-os/prospecting/prospect-pipeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "89de1ef7ff725b3b27bb00dbd32702625d1933e8c4e6de4c4a7ea139b8248175"
    },
    {
      "path": "advisor-os/prospecting/prospect-profile-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b540cc49536fcbd734c3c7130cedc59cf465ab5e89a9b7333af923cbb22513a1"
    },
    {
      "path": "advisor-os/prospecting/prospect-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a49f4deb2061fa55fc65a3b83f67082cf10bea43a9b6daf5c21592b9950e2272"
    },
    {
      "path": "advisor-os/prospecting/prospect-segment-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2da0c2f99addc8d5970f564e02e4c071241ddff175e31f8e60f95b60f7d26d98"
    },
    {
      "path": "advisor-os/prospecting/prospect.entity.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ef3cd07dfb123541d0feab632149dd3339e0ac442037bb65599523ff8a617543"
    },
    {
      "path": "advisor-os/referral-source.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d6d2ce86c06a987789a46c61dd6b1c0a6083b926ec50317211f8b79404df54f1"
    },
    {
      "path": "advisor-os/referrals/referral-ai-followup.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "522d82f947110eb3098b33be7dda3af4b00d775463145449f526b38d723fde30"
    },
    {
      "path": "advisor-os/referrals/referral-color-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ecb5aa26bb32e131df8eac227e916e1f9922d47ae95cc661b5f151292e925563"
    },
    {
      "path": "advisor-os/referrals/referral-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "36a75a9eca533844b45f33bab4b3d6ee5fadb4114b350dfd7989e5cc6a2db3c1"
    },
    {
      "path": "advisor-os/referrals/referral-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "aa747d98b98179705f5969175609b593404d2e6069c625efce3264e18a7526b9"
    },
    {
      "path": "advisor-os/referrals/referral-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "066c82450c5881e5db67da1166a0945e2def18edb3eef4f4000fccc213f0ae4c"
    },
    {
      "path": "advisor-os/referrals/referral-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f388b22d37621c97ec365fbc2e8fb98382dfcd447dd78485029fbbcb72a4c637"
    },
    {
      "path": "advisor-os/referrals/referral-smart-actions.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0e48a68a39ce7e006b89b6942bbb5ba8216016702e965fb60cb6bcb284bea698"
    },
    {
      "path": "advisor-os/referrals/referral-temperature-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bbb66c7ebcb36298ede7a5616fc790b167a3f6418462ac943fd119cc5b204ca6"
    },
    {
      "path": "advisor-os/referrals/referral-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2a7a22149fcfdb11066a240343fbf11da9c1b525c2db4f30bce3d275a9bf3617"
    },
    {
      "path": "advisor-os/referrals/referrals-board-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1c15228d887e00c3e27773d128f8e555af83ad2e28aad93eac7528e7494ddaab"
    },
    {
      "path": "advisor-os/referrals/referrals-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c20e1a5313ce4fe68d87cc05205bcad1e4715a1b67e25a87935dc7f7e5715ccc"
    },
    {
      "path": "advisor-os/sales-dna.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c3b9fc2ccfc6c60ed525162efc453715399c2d7ce859e6b6f060633c614fdfc4"
    },
    {
      "path": "advisor-os/sales-script-types.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fbf715572d3c82baba346ba9f9d64dc8434ade96d28d7a89acb77193329e5564"
    },
    {
      "path": "advisor-os/sales-tone.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bdf348ef04e2bd1b2025e4a5d4ad9cba25a66a1c860715dc0bb4afc3cbf6c627"
    },
    {
      "path": "ai-context-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e40ef2019ce329e2d029abff3e075913ee6d727d3e9499e15d7e544efa88e22b"
    },
    {
      "path": "ai-orb-widget.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8a6f2843190a8fdeda81aa51a2ac6e2b3001aecf9b2801f01d59032c1ecd2b04"
    },
    {
      "path": "ai-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe4418d387529e79a5ba338fd2fda98ead5eb25e973eca7d7663de00e3e2322e"
    },
    {
      "path": "ai-sales-coach-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "77e5bc7e44705ead33e6b0d0b2a187db7a7228005e6fc51129a06c31c4af41bc"
    },
    {
      "path": "ai-service.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0b54ae4f53c91c48e453ba51f96a3d9960963db4c293dedcc0ec47403d9f2b3f"
    },
    {
      "path": "analytics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "de785b4a17e19c5667fc7039ae1789713b1b6bd8a02dad7b0d93577554a73769"
    },
    {
      "path": "app-shell-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ae7b8b76e71f72941960f087ef1eedceede2ecb11761cbe0da327ab79bcefc6f"
    },
    {
      "path": "app.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cca131c8950a6abd411497ece350771e6f6dc6399e0e420b18e07edeaee73048"
    },
    {
      "path": "assistant-memory-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c3bd5261ee9f2104eadf4b4fd00078bc7e8368906082634cf702bcad2ba08baf"
    },
    {
      "path": "auth-guard.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9ce488da10a2222f19161b11cd3a965ccdafa282ab488d02891c7de6337d2bba"
    },
    {
      "path": "base-repository.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c38283fa5dcd8b133c6158b095b8adb5cb199b98d401fc7055ba6b3017b6addc"
    },
    {
      "path": "buying-signals-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5ff71f9ddc691e2d6656172826295a42e5824d0bb957a74b4f157bd583603e60"
    },
    {
      "path": "cache-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c179a2308ef3c91cfc48094d8013dba51147a5703b9f48be25e5590230a692ba"
    },
    {
      "path": "cartera-events.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "81e3e4230883fd6035498be908070b92d4bf84f6d72ed9d809685148de82b72d"
    },
    {
      "path": "cartera-import-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "652e874936d1e1a8dbcc8eb8fb81672a96ac7de7aca393d55354ca554ba9125f"
    },
    {
      "path": "cartera-normalizer.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "eefb35718c01de9f290eabf95fa09b29f971fe1f9670ce67dcac91acb38811dd"
    },
    {
      "path": "cartera-repository.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d0fefb3a8b3e1ad800c33629a9543b1735d7d305b194d0dc062a8e3a9670a30a"
    },
    {
      "path": "cartera-service.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "37c104e6199b5dab97b4569c6c90f2056592b694e4fb0c97d9c856b24e3f91a1"
    },
    {
      "path": "cartera-state.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f94281ed6adf7ae6fd08c22c024b9a9980614b23e8a9f6b604a80ffd900d9966"
    },
    {
      "path": "cartera-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "26c214ef3bfe7d6931526b2fa99b81c6ca3e7773bd0681f652ce20c3aef6f86e"
    },
    {
      "path": "cartera-view.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c2a096a08006ffe78b0e12dc0e3224fa295d9fd889b962e572b708fd3a31182c"
    },
    {
      "path": "cartera.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5944eccf68c74294a6256b68ffb7afe4468eb2b92224a995a5dd1e7518745642"
    },
    {
      "path": "channel-adaptation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "be9d00de26e358875275d0813f0013387aff2613a23a91903172e6e3c7dc9a13"
    },
    {
      "path": "channel-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "56471d1d89363a610b5260f9c51f4056ae27c42516edf1a32280632c4b4b5501"
    },
    {
      "path": "client-engagement-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5b8542ada66fce52c7719e35c338cb777619da06c80c85818144dd4455d63bc7"
    },
    {
      "path": "clipboard-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "54edef39cc4ac019adc479168dc04b8cd885281137b4c62a118c27c2120fbd95"
    },
    {
      "path": "comisiones-utils.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9d2efb73511362c59605f6bdb56f36cf68ec102f7cf16e02a13c5d72b24acba0"
    },
    {
      "path": "comisiones.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e162a1116fc8adfd7ca65bccba5b00ce35e4668096d932650f197b830fd07204"
    },
    {
      "path": "commission-projection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "eb1bc628a24a16aac4266d7ead9d0b3126e91ec132829aa3fef4d8e927f78c38"
    },
    {
      "path": "commissionable-amount-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cc73777e81f3e7aca900e2c9d5ca027ae9a1ce576f127f9c5c55e5a95dda082c"
    },
    {
      "path": "communication-channel-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2ea5c4b6d408c1b4e907afd9a9bfa3ff0c64ab9074db83653781799742ad75c5"
    },
    {
      "path": "communication-mismatch-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "28a774444c32abc70ef0f829d9e45ffe5a5e85edd30049e89dfe9e3cf53881ee"
    },
    {
      "path": "communication-style-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6192417e8f2e6a7138baf65a6215e1498b26dbfcdf5da5ed100524a547006595"
    },
    {
      "path": "compensation/advisor-development/advisor-development-connection-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a122c3c8ca955eb916700c9ee393dc88613eb83c6563d032ced17f2a3f4680bd"
    },
    {
      "path": "compensation/advisor-development/advisor-development-counting-weighting-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "98dad5b16a0631e3a944be3d55fa49e315955963b0a56d7780a3797a32086d51"
    },
    {
      "path": "compensation/advisor-development/advisor-development-development-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9b613a0c24b5550178fede9afbabc60749a612e904d723dc776b3b47a5444067"
    },
    {
      "path": "compensation/advisor-development/advisor-development-monthly-income-candidate-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e99906c03cf75205455d9cde2b9f434e7f1c111fa86db249926b82adfbcdc812"
    },
    {
      "path": "compensation/advisor-development/advisor-development-rule-pack-loader.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8ec5fc3acfaf0d6d144f8880e018d1b9bda2bcbf29f7d852663fd9414dd560a5"
    },
    {
      "path": "compensation/advisor-development/advisor-development-rule-pack-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9d5c40f9882dd7183fe2e3b0835186ec55beeab714056b96705c9c0facad4308"
    },
    {
      "path": "compensation/advisor-development/advisor-development-training-allowance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "953e664352ab274abca7ee2a7b6ba5682d3e04ecf2916b619141bbc10599cb33"
    },
    {
      "path": "compensation/advisor-development/advisor-relationship-attribution-evaluator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ef8175137c2fd9c439dcffa70f8879854c731b4cac749bc2119098155a783367"
    },
    {
      "path": "compensation/advisor-development/advisor-relationship-bonus-readiness-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b63e711c841ce25d15a9105142deacdff21040d03402cbdea781863644a79ecc"
    },
    {
      "path": "compensation/contracts/advisor-compensation-stage.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "945131d84dcb5bbae43df61a28d951c3b5abbf5f89b6d2e7954307f7ba9d5af0"
    },
    {
      "path": "compensation/contracts/bonus-calculation-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6c9b4230cd4bb510252d9f6a1e430132ccc86b0f09dd91d127574369c373a1ab"
    },
    {
      "path": "compensation/contracts/bonus-carrier-calculated-state.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c988d023065239d90edf2384865614216d4245efa9d866ae5fc7774782b16c7d"
    },
    {
      "path": "compensation/contracts/bonus-eligibility-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d2ab218b234580061d1925076780655a403313aa554cfcb6e328eb4e378498f7"
    },
    {
      "path": "compensation/contracts/bonus-payout-truth-state.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b104c8c84370d88d98d9493d13d08a5330c06ac9f0618670b62ac736ccdd57ec"
    },
    {
      "path": "compensation/contracts/bonus-rule-pack-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4225aa6de2a89e0ae91644115dba34d94ee780ac2360537bfe782144330f4f22"
    },
    {
      "path": "compensation/contracts/career-month-resolver.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ab1934fbd5f60e4569da811fa893c4eaebc4de44c54503efac3d2c2b34ab456c"
    },
    {
      "path": "compensation/contracts/cuaderno-point-period.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "647a167e26929f5edafaacd7dd69d42c227e1946bc17adaa6457960d75026e03"
    },
    {
      "path": "compensation/new-professional/new-professional-connection-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bd3f7e73b251854c13c4a0962cea601e42a56f73253fa2759bafa9d09d69ab0e"
    },
    {
      "path": "compensation/new-professional/new-professional-development-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2f87ac524bf0eaa33edfcc908ee547494b62fad74e9faaaf90e3865e0d89c18f"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-initial-premium-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e6b22c1b3abfcd7b5f47ad230b66c2f85617d1875ea12e6c45f1999c5552b057"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-initial-premium-growth-annual-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d62f2e8aa8ea474149be1d8689cc6c3f5acc0219dd5829086ff19b694e961ac"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-renewal-premium-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ce0198d400427679ccac00277e426a390654fb6b6060e1b8c746fa2bf740d8c3"
    },
    {
      "path": "compensation/new-professional/new-professional-life-initial-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "699c6acbbde6cc4f865f6f92d377b513abc336dc6281c04851150c571bda9146"
    },
    {
      "path": "compensation/new-professional/new-professional-life-renewal-bonus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1017f4ad3ff83df1b0c7311607e01e90f93551fc9864d02a5b7135dde105ef96"
    },
    {
      "path": "compensation/new-professional/new-professional-rule-pack-loader.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8a1ca64c599c1cc8450f0bd3c07138c1e1ad6309a1673e0293bbfd44144d16a4"
    },
    {
      "path": "compensation/new-professional/new-professional-rule-pack-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2aae2d7ce6d709ae38a64b7cbfd21e6ec79aed17f8c775baaddbba38bfffb8ca"
    },
    {
      "path": "compensation/partner-manager/advisor-economic-output-period.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "14b4e5d7b45182cbc073440023f47ec2764e9f2b1774fe54b2ab41102222b012"
    },
    {
      "path": "compensation/partner-manager/advisor-economic-output.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "74306aade969f58cc9ca4d76a95fbefeee24d489d10a070e686fb5ff11acc5b2"
    },
    {
      "path": "compensation/partner-manager/manager-precontract-rda-attribution-intake.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0e712e05d05f6598e2812fda77048a0c63b176a3bef2ab901753ebe05a4e11de"
    },
    {
      "path": "compensation/partner-manager/partner-2026-rule-pack-loader.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b7a51301c41efff287558082b36cc6426bbb6a8a1afcedd3c62ea3481506bf09"
    },
    {
      "path": "compensation/partner-manager/partner-2026-rule-pack-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "af7521f8fd77731b03a054e70be71a13053bf9e5fa96b4e0dcece8e304fd1f36"
    },
    {
      "path": "compensation/partner-manager/partner-activity-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "aae590a5f312c6ac4a8bb7a9bca1216aa60b7fda52f885682c3fae16f921a7a8"
    },
    {
      "path": "compensation/partner-manager/partner-activity-bonus-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "08600eb234f3ffee4de9f66fd655bd2f24ca2c7477cf36e4e1a7115b917667d5"
    },
    {
      "path": "compensation/partner-manager/partner-advisor-qualification-explainability-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "66255badd12f96c41a7d62b9a43a095ffa685d5eb9cf6229b4e1e58a74b54072"
    },
    {
      "path": "compensation/partner-manager/partner-alta-partner-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1a05f7cddce0bab0f64aab5d9ddb0c286fb60c5b5d01b0d41d48af1905a18f4f"
    },
    {
      "path": "compensation/partner-manager/partner-alta-partner-bonus-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "717837ad615d2b652a3b831ff476337fa802412c6ec23fae28c50aa5920034d7"
    },
    {
      "path": "compensation/partner-manager/partner-alta-partner-bonus-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "baea49f24a0bdf14a65f26f8c57673f823197d6d8f695119fa6d67d715d10ce3"
    },
    {
      "path": "compensation/partner-manager/partner-annual-productivity-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e77c9da7ce7b7a4391631231ffda774e45bed3403ca7d622c91bc00c2f9c8c0d"
    },
    {
      "path": "compensation/partner-manager/partner-annual-productivity-bonus-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "64333980d395a301c8d903da47f90e6a1233934fb88b5de2ea33d595c99396d5"
    },
    {
      "path": "compensation/partner-manager/partner-annual-productivity-bonus-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7c0ca8799d0cd948abe5f6298a64b593f5527f70c6bb2ce3141ca32d3d3dbee8"
    },
    {
      "path": "compensation/partner-manager/partner-calculation-to-payout-mapper.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3e70893b9034bddf32fd1b39c1fd9f67dd20c6b005f760803b8d590e5268f2cf"
    },
    {
      "path": "compensation/partner-manager/partner-compensation-concept-registry.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c5c0ba8b14346322b6c2821a14482aa75520f39081fad356e39dc87e67ef3bab"
    },
    {
      "path": "compensation/partner-manager/partner-compensation-input-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f30c300d230fd645b31163861c48d30da99085d9f3a7c4db0b1dcda8367789c2"
    },
    {
      "path": "compensation/partner-manager/partner-compensation-statement-match.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "55ab030c7d992b06f2d1b9f788feabb14eb9cd78a313c4ca8bf0f2a7c94ce04c"
    },
    {
      "path": "compensation/partner-manager/partner-fixed-support-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f401dff03e985cd3f6b4f3e55d4de368cafb6e2a05fc379890c1208223aa65de"
    },
    {
      "path": "compensation/partner-manager/partner-fixed-support-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9f1a97d26df4aa33771421f52d8ce09b8f02b3ce96b74e274397a7a215463be5"
    },
    {
      "path": "compensation/partner-manager/partner-fixed-support-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "75eeb03100f993fdb96228dc9ca2e8fdd06c9eed13e2a252c54f8fcb754a7314"
    },
    {
      "path": "compensation/partner-manager/partner-monthly-cashflow-projection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b316ea56dd506d8b81217701cec9cb4183524fb6b8245c1d00eb5f5e561751eb"
    },
    {
      "path": "compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d004a5a8fb2eb6ba41f14ff0922e36bbffae903fca67df7320dbabd71b2d3c87"
    },
    {
      "path": "compensation/partner-manager/partner-ownership-source-truth-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "add47b338bf30240d3646659a39ee94c14f2042dfed038a00c5395100a3c4f67"
    },
    {
      "path": "compensation/partner-manager/partner-partial-bonus-calculation-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "32849c4131f3d201d2e23b780bb584886d1f1585a7e6f9e1359c5a4b5098026b"
    },
    {
      "path": "compensation/partner-manager/partner-partial-bonus-contracts.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d08679b91f5a58a4338b65c7aba96e34ffe98112a1386e1f1d8635d0bea9fea7"
    },
    {
      "path": "compensation/partner-manager/partner-payment-distribution-rule-pack-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "14981f7b84058eef616079bad2d989266a73adf77f953d8905f1fd77e94416fe"
    },
    {
      "path": "compensation/partner-manager/partner-payout-truth-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "50e66d8d5edf07b1237913c0f537aba140caa70261cc88042e245a3e9d4692df"
    },
    {
      "path": "compensation/partner-manager/partner-production-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "248db34bb48a74902a041688e2c7db0ca5dfcd65cbcd468ca200b717675a4451"
    },
    {
      "path": "compensation/partner-manager/partner-production-bonus-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e9ee0c89a9ccbd02d57b4d644730f4acd3ea502acf479a1a6ac261b90fb4bc43"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-base-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "808b7a2a7cfa495e64a9c314959d53ac9a728c6cd545dc1eae740ef3bd5b339d"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-base-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "928fd9f3cc78178036d95b2697026a8942bfa2d434c765dcc78032238a6513aa"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-multiplier-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4ff26fd439e8b86b3e7cefa1faf8fab348b985a859b66b82a29b690ea44793a6"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-multiplier-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "54542680749a3a8d29bb891bc99897a2d831cbff69a8382cab5ae33cf4e4fa30"
    },
    {
      "path": "compensation/partner-manager/partner-quarterly-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "91cdb630fecfc3e92f0d8dc05822005e584c235ef5dad45961dd3a8a939450ae"
    },
    {
      "path": "compensation/partner-manager/partner-safe-calculation-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "32c6438aea5cdaf2d86886cc456a1acf1de2ae676e83ce3db40651765ba6c8e5"
    },
    {
      "path": "compensation/partner-manager/partner-spreadsheet-monthly-fact-adapter.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe5e50182f46949f895fd71536c59ef17659814138c2d7948cd9f692e29c7a8c"
    },
    {
      "path": "compensation/partner-manager/partner-support-requirement-by-career-month.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c25d9a7c53289c5682a3094719aad72a3b30e451af8af970768d3c96361c10d0"
    },
    {
      "path": "compensation/partner-manager/partner-support-requirement-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a95c3e1b418bf67f006027dce8897415e843278101a4118c12eefdf387ec09bb"
    },
    {
      "path": "compensation/partner-manager/partner-transition-bonus-calculator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe94400c60e0e798c9ae23f1e26fb007d4f821d02633493d13b3d61fec49b867"
    },
    {
      "path": "compensation/partner-manager/partner-transition-bonus-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "05b12186acca1d9caf468dca8b3f68aa8fb5a323116678e80c32b917e3117e72"
    },
    {
      "path": "compensation/partner-manager/partner-transition-bonus-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d986c3a93e030d71181668f7f1aba521195b3b620c0989e4604cf2529d158997"
    },
    {
      "path": "compensation/partner-manager/qualified-advisor-economic-status.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1067acbeeb8d820e6ba1b9ab45fc6e3246420913e35c0dd1c353c854d8f08c90"
    },
    {
      "path": "compensation/partner-manager/rule-engine/partner-rule-pack-loader.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3e81d44abe00b77c9878d1e1ebc6c9a27ab24c365257e8517f1750a61ecfc7ba"
    },
    {
      "path": "compensation/partner-manager/rule-engine/partner-rule-pack-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e1af75f84b33df7481d0623104afdc68784ecd535a4b38ed8612313d0e4200ef"
    },
    {
      "path": "compensation/partner-manager/rule-engine/partner-rule-resolver.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9eb9f872384fef352100262573811c31db897f46ac257f907a24752e3ffb4a17"
    },
    {
      "path": "compensation/partner-manager/rule-pack-readiness.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "250f4815ab78e8b2945b0705f8bf40e997362372f1c70f01a346712612a043ce"
    },
    {
      "path": "compensation/partner-manager/team-economic-output.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "427ace6da26a4fb243c60cf04eee4c568bb736aa8bbdeeda1535d58ff4a494f8"
    },
    {
      "path": "contact-attempt-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "16de4d6ed89e9918a5543d364160fd5153513f60bbb003ab23d89cbbc291239a"
    },
    {
      "path": "contact-response-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "484763b03217ffa925beb4662e14b3c9e7eca7bc64b63f7f5679f1f5455e5db0"
    },
    {
      "path": "contextual-suggestion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e060fd7114a63d8e1c8c37db7567195165453a63a5da4315f97f615f4d3d6be5"
    },
    {
      "path": "conversion-metrics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "55bb78a2d1f815a0b18171d751c0ab492fdb08522f36b9c060e8f5a6b0318c7d"
    },
    {
      "path": "copilot-suggestion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d7b75f0d1d1628b3c9a3a9e825cddc9a46e33d91dfdf02a264324c3d6305052b"
    },
    {
      "path": "core-app-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "90bd9953e856e157f6a3e0708e321e7b375b2cab725cfab2aa2378f9c7f92cac"
    },
    {
      "path": "core-event-bus.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9bfff02fbcca2a5d6d0ab04f1cbc415998b975f98a1f484ddaf7195802380839"
    },
    {
      "path": "crash-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "46a669e0771496af7f11b02c14f86232f2462deb96a2a6522102368abaab9699"
    },
    {
      "path": "currency-normalization-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a2ff34ab2e4250e47ceb30ea220f5f33376065e603e773075fe96dde0dd65e9c"
    },
    {
      "path": "daily-points-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "81bf4ce1508e20c190c60b54bda4a51542e897487ca80d9a9eb1519e1c032a96"
    },
    {
      "path": "dashboard-widget-card.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6074cf7902500c4978cc935848cd89fe8939f13d6f19eaab1d3c8b8471235e2d"
    },
    {
      "path": "dashboard.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "abd0030f6664760fa315a4a4f4652047bdc015674d82c56dd79dbc500cf357f7"
    },
    {
      "path": "db.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a38f22e0c9fb0a7353b8295fe762bd11feed048905f877cb146c2ecbcfb5fc2c"
    },
    {
      "path": "dna-script-strategy-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3e66aea3ba43d6bc76ab45b8e03f5bb471acd4a59b68d91da4cf5f7cad8a26eb"
    },
    {
      "path": "docs/static-preview/forge-alive/genesis-beta-loop-card-data.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0ed0f60bc8b27df6be8e33460471aaa053043939003d048e72cb61a225fb5346"
    },
    {
      "path": "docs/static-preview/forge-alive/smart-widget-stack-data.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "592fef68b25e6531cb03920efce8ab94f1e80547f85c93380b021b571480330b"
    },
    {
      "path": "document-classification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "aed203d8e197aef140b19562792c344342fef8297bc0ca7e929117a693e0ab96"
    },
    {
      "path": "dom-sanitizer.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "73f937258e02f98e88d200d8ac1fed1565a307a09f903f16dc3b800c2147701e"
    },
    {
      "path": "domain-events.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6b10629c8132af85cbc689c0b46d8a84ae86bef073850d553e3bbb7d30e40c67"
    },
    {
      "path": "domain-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "82ea49b41768ef9cf31f7da64611eb6ec4d4c52eaa0c26325e70e74b7673f31a"
    },
    {
      "path": "domain-store.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b69eb8318f7f500a2c4bbf363930c3e23b05b53c336a35d50e860284744cb696"
    },
    {
      "path": "engagement/context-intake/engagement-manager-context-intake-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cbd214d2956d5e9ab1d51f5a0992de724062bbc1cf8e92a07de70222ebac7322"
    },
    {
      "path": "engagement/context-intake/engagement-manager-private-motivation-packet-intake.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "53bcf3cd0c54d3183e76fe1c86b03c74e2526f3ee40066baeebef927e95d33ce"
    },
    {
      "path": "entity-resolver-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "367bdfb2ca25b5cb5bb4814eed6ab7953a111b1e1e0606c16e80d18e406024e9"
    },
    {
      "path": "error-boundary.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "96d700b9beca71d3eaa36444f0c33069bdff725a095341efa47d9ffa5eba1b2c"
    },
    {
      "path": "event-advisor-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "88fc3e0a51613eb2da47fec3b30d7ef3f7ac09b385878b191807ad3babc77743"
    },
    {
      "path": "event-bus-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f9c6dfd1d3405c76e2c01335eeb8c7f4fa401ead3131b9de47fcc2a5b0690b1d"
    },
    {
      "path": "event-client-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3b6ee2f75006a9cc2385defd7771cf0aa324c2d2d662610133df3ede355ad37a"
    },
    {
      "path": "event-log-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c64bd48780aa22fa4b055cab88756773fe230d676a6ffba7b0a434e3b2d6e6b1"
    },
    {
      "path": "event-system.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9aeb1c249f15d23dd0daa2f206df3939d87a58e302531c7940a990958f4fbf90"
    },
    {
      "path": "excel-parser-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8ab83a4d8ce9ada46b4dc52ed054f91d842ba98b34713ba47de8cd0f835e6e90"
    },
    {
      "path": "exchange-rate-cache-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3d39d918cf09d945e20d1690103f310fb34cd175bfaeaa2ae48a8fcdd82faae5"
    },
    {
      "path": "feature-flags.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1bd3658ce9fece8342c107d50388e9548ea40218ea7c3220a3b43ab05186d6eb"
    },
    {
      "path": "field-confidence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9f214c1162615c610f743e9110b6c9dbecfdf2368ee0362bb34098fd5f2c2e68"
    },
    {
      "path": "financial-responsibility-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "adce8db4d23edcc69df398951bec154465ab9d9159b6bbf2c55ca289c5580499"
    },
    {
      "path": "financial-story-task-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d9a8b0a8fc35dc93421b0084000e17627caa8f4963776e32ca7f9a2db3532a56"
    },
    {
      "path": "financial-utils.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d30487a6ec52a216bec84315b119e56f285dc1c05a9c7beb941b12104c179a19"
    },
    {
      "path": "first-contact-dashboard.viewmodel.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0338c63f1cd655c71df9de17a18da3bd7f169b03ba5a7e06493998e13fd2673f"
    },
    {
      "path": "forge-ai-connector.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "46d97de64852b4b7bfad8a44472418d4b8e366e2685d81801bdb77acd98c2ce0"
    },
    {
      "path": "forge-ai-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9e601aa181a9130f299ea33fdffd1498aa3867f24e9badc2ca2ccda4e7dce4d6"
    },
    {
      "path": "forge-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "89ca162a09889200cfad7189eafa9929e470ec185cc6b4ab654821ea0a6f472d"
    },
    {
      "path": "future-currency-value-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f2fabac09dfd5bd8a0a078dd711f71b2d0aa6ebf1a692b00f14292f69794cdf5"
    },
    {
      "path": "ghosting-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a965f235263c6eafd0367527c4abfe8ab80e7cc029ce678a4d681337cc562bb3"
    },
    {
      "path": "ghosting-status-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "77b2ef38b2276f85e3a9fb1370f9cf64a39366bf83dad531d717c807a314e2ab"
    },
    {
      "path": "gmm-advisor-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "04f07ce584230cf3f7f6120899ea2517e5245f173d1caca59b255881a5f42954"
    },
    {
      "path": "gmm-client-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d90a5e610dc4bf3584410ce76e07053b9cc9a0970cd5208dee9d7f3986c31c6b"
    },
    {
      "path": "governance/rule-pack-identity-snapshot.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "95d2b66b26f5f5285736079335743649cf91d19abf4b4b936668faad8de41d9d"
    },
    {
      "path": "health-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5d847efbab5649ac63ee57d3e5022c1413a44e0dbb4f7222ea1de8d30309e314"
    },
    {
      "path": "idle-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d27837089384f0c152afcbbfd30668dee0e79c8f6b3ace24b0aa30d066f51cd0"
    },
    {
      "path": "imagina-ser-advisor-analysis-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d66e63a8d5fdf3b2a6377fc46988343c7945cea3882917bf5d66cd57fe448250"
    },
    {
      "path": "imagina-ser-article-151-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "83af84c857313a501dac84d8e527cd31b14e57b8237dded568976d19577ff5f8"
    },
    {
      "path": "imagina-ser-article-185-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8ac455596c7032e37c5d46e2e5c4f28d81cca51ce6932cdf3e001f2f2921fa59"
    },
    {
      "path": "imagina-ser-client-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0b131f6cdb4d214b7454f209221c6409320690cb9c706260f825f8853c339cac"
    },
    {
      "path": "imagina-ser-decision-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0652d7aa69097e2d098290e01b6de905bdbb0f862ac8b94b5e090e021146799f"
    },
    {
      "path": "imagina-ser-fiscal-bag-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b0599334428bf190e7351813372990bd364322436681d97c045417e06ca81022"
    },
    {
      "path": "imagina-ser-fiscal-router-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6f815ee870492ba9c1b870094280086e067fd009bb3c5ca1093b91d4229c75de"
    },
    {
      "path": "imagina-ser-fiscal-slide-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1adc7a6646a893430e8759e565fcc2b750cc1e2cd63eeb33c7a86866f5134b6f"
    },
    {
      "path": "imagina-ser-future-mxn-bridge.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "70b3f9b3624eb6f95fd020cb43f2aa53e44cfb6a6d4901a5c27ba0a0f907b93a"
    },
    {
      "path": "imagina-ser-happy-numbers-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e1bdc96658db33821725acbbed90cdb179a0f27f49261b1538e0f78bf0319974"
    },
    {
      "path": "imagina-ser-objection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7c33fc98f90904aacecff6c329ad37933f37d7babf9c259f7e201a21511acabd"
    },
    {
      "path": "imagina-ser-presentation-prompt-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6d2bdb62b3560a51fea3005eb77f0933e01177435e277db453a5d39608f5529d"
    },
    {
      "path": "imagina-ser-retirement-fund-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d9e6c86565549d9d0cfd9c422c1ea7738c4fa4293fc10f195396546a542a06e4"
    },
    {
      "path": "imagina-ser-scenario-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f661e3420015f78667a7cf53ec600c89c4a04d59db1e96ca306bd975c8b2352b"
    },
    {
      "path": "imagina-ser-variant-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "85b2d215254d4454217ddd8d8c254770be65fb935922b036e463e622347aed71"
    },
    {
      "path": "introduction-message-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f214b10ad6e51185d7249221e6cce11d9c23701a5f5455f24e62a519532a8003"
    },
    {
      "path": "lead-temperature-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a2fe6794fbaafeb0b8c4b305a681654c6f28673bf0c4e4453ba6c1dd11f699c6"
    },
    {
      "path": "legacy/comisiones-rules-gmm.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6d8f8ad1ff2e0a8aa756a0eef5edab2312f5902d617d440936ee1d27e5e7df70"
    },
    {
      "path": "legacy/crmaddlife/chat-shell.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1c8fd555a002c551fd997483825761c46e41d4f42632bc2b50f5410e5e222934"
    },
    {
      "path": "legacy/crmaddlife/comisiones-adapter.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4f0f1d7cb1164f67a419ed0d1febf4e277d7de0cf00f720b814b7aa23387e77a"
    },
    {
      "path": "legacy/crmaddlife/ui-listeners.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "47f49716a8878eae07105abe2b73ab30e1e50bf61945c2aa59988f35f7a1c82d"
    },
    {
      "path": "legacy/crmaddlife/ui-shell.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9aa36325eee3e40a4c27e60464231205c766e3228cfd37cae75220705d24fe04"
    },
    {
      "path": "legacy/dashboard-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6ad7201d13cac4b5a5ffaf470c5b09bb6830da4f96f33e28a4985cce0acc8da4"
    },
    {
      "path": "legacy/live-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "69292c005f2e6b95509d80d573d7d249c9c49207134cea8a96b992946d5ac88b"
    },
    {
      "path": "legacy/operational-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "df08c5d9a283da4b70c44f4e5fdc897951b9d546f1c1f240b2c261ef1a620e0e"
    },
    {
      "path": "legacy/semantic-navigation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "211fee14a491ca54f1c31374990e62a475a359f5a27833a476285874de3259a4"
    },
    {
      "path": "life-event-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1101b6a15fcd7232630e779a3c81c9c26faa32e41353b7ec32a30d45163f8bb8"
    },
    {
      "path": "line-of-business-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f8c87f42da8b9d7a3549c10959d80e443ae1ffe7587073ab73a8c107ba72ddc6"
    },
    {
      "path": "live-communication-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "54f6691100e41c76e24c659ec497599f5516ec6aed958fcb0cc07be3e23a3ed7"
    },
    {
      "path": "live-operational-state-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "165d76fc99accfeba4c5f783539b5afdbbf8cf3f91e2c770a5ad12e5c4ea3735"
    },
    {
      "path": "logger.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3076f8e014e5e4677febdbd3ccca5e688bc155fc8b5e0539b4ad8859c42c61aa"
    },
    {
      "path": "manager-os/advisor-signals/manager-advisor-signal-consumer-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d4bc16c25196350473b0502bdd0fa6353a87b306571f442388a4fff45f18d4b4"
    },
    {
      "path": "manager-os/advisor-snapshots/advisor-manager-snapshot-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "25b440668dea4c64a63e49210ea3f5e02c24bc7285e50c5bcfdb28b8cca420a0"
    },
    {
      "path": "manager-os/advisor-tracking/manager-advisor-tracking-boundary-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ca17502926a1547269e14f91807d89df230a7b869ff95aa9c29fc79871cae185"
    },
    {
      "path": "manager-os/alerts/manager-alert-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4d3435600cef0d9be371d5224182f0671e8b56fcc6e6341a030910f4ca5c2d59"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-binding.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8cd8b332142f2aec265a9152bbd1fcc0c4b3c1be9a48958033ca65631d9c6120"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-dom-renderer.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2882aa61b4e0c0cc012f0f542ce59ca1081f3e6c060a4f86ce68f5680486b3dc"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-dom-surface-binding.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b9dcd6bd5571954769d92dd2aa9f258c414d3fec18fd755e6499953818b22f2a"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-surface-binding.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "47ee4b2bac67b77cf1c65c3796287f876fb6270ebeb45ecb5c465acff7d432bf"
    },
    {
      "path": "manager-os/alfred-static-preview-dom-renderer-integration.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d54fc95cbd7238dec5b55ab265f48e1df5879344397308940f4a893f341106c1"
    },
    {
      "path": "manager-os/audit-persistence/audit-persistence-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e6422724df4e8e40cb70b5ed031cd2245a6d12d3c5693e7ba618eb7d12bdff8c"
    },
    {
      "path": "manager-os/canonical-truth-registry/canonical-truth-registry-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b3dbbad7016a78b2e7d0b8ac3b71f39d9eee0b43a96e09b10e50a395e9e2113e"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-advisor-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f7e4a0e8b2cc13549fe231620f88c0c451ae7b0b78ce6bcb3f2594c67d7ca2c1"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-coaching-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0999cc37e12df16147a8fe4f6a6e6c600c33f16c2f85d0cda1944de692e81fd4"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "72e011c9380daec0704c4bf9273993e6403c3ba6aa289ab84c0a421e51ea2342"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-recruitment-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "038b6085b8f500fb9aaec5c5d8b8323250f986a4f13d15c28735a0c9e33cadf2"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-team-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d93de13c538ac68341f436fe313a4447d6d581761d55413c3b3047d85b353192"
    },
    {
      "path": "manager-os/coaching/dna-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "983022cd041efef7ac6a280d1d2a4d1954a00aae9f928773d993d135361af5c2"
    },
    {
      "path": "manager-os/coaching/manager-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "487b6a7e394a727b8d04fef7f78932d5b069224d8ae39ed5e75f21a5906d07d8"
    },
    {
      "path": "manager-os/communication/manager-broadcast-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "848326210c3fc607ce58c70d35d4cb22e9be55a56a597bdb461064d62c03b7ea"
    },
    {
      "path": "manager-os/connector-execution/connector-execution-gate-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5366b7bc3e41746ab865659368f22196108add3e8ff0a8f476a4e96cc338f40f"
    },
    {
      "path": "manager-os/connector-executor/connector-executor-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ef6b078ff34c31fd00b5cf89879fabb9c71e2b2d76bcd8ad00eb2693770d3729"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-advisor-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bfedd7d8a7781442a8450517eb2ce307005def15ee5fe9ba9ae780afe00950fa"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-dashboard-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "020d26b2c838668e9e0e434283273a255811e66bf1b80a4310a2056a93b316b7"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-dashboard-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1446d5f9635a8f8072dffb60979efb54f8cd5041935be2bbb19757975984a7e7"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-recruitment-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "df22db42adcbb08c17c40412ff183c303def28f6419e07fb6a6712f3e44b112b"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-team-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5a90889aac5deb2734118078b68b0130a1c9425c96a90ac4943b39ff0b020cb0"
    },
    {
      "path": "manager-os/delivery/delivery-adapter-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0320d9edca5f2f6ce2e35b0ec48ec5da7b3724b8aaf593e62b97b4c0790cc4c6"
    },
    {
      "path": "manager-os/external-context-bridge/manager-engagement-context-bridge.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b3598ad90b2568a44c0e91a16f662c04d94dabe353036f61c1258ee844be7426"
    },
    {
      "path": "manager-os/external-context-bridge/manager-external-context-bridge-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e2f68ff333ff27f8016d017f5b39a79fda413e72536f00c8e855e754ec2d9550"
    },
    {
      "path": "manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5b50d62531eac21ba1c56bb028f73217ae0b96f1df27ea4c2d4d892692fb1abd"
    },
    {
      "path": "manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "113290347c246919171ce6cc9e119d22909e8fc81b3e3fbe209ce19c9a771fd3"
    },
    {
      "path": "manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "61214d1b59602f7a6816071b93840d87a777f7cd41154f36a60f192bac30a0f3"
    },
    {
      "path": "manager-os/external-dispatch/external-dispatch-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "69e0d99f8e5f908a119a247e51f9b865e413366dd3dcbcdbcddd9573afdef491"
    },
    {
      "path": "manager-os/feed/manager-feed-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "be1a56370ac90c36c4b9d237495c62766ec4030f009cfc40fc20e65665e031d5"
    },
    {
      "path": "manager-os/forecast/manager-advisor-forecast-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e3ba92adb06efbb15b12f999cec8b4eed9f464740451b5862c4309030a96ef66"
    },
    {
      "path": "manager-os/forecast/manager-forecast-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "03ed8289a51879a3af337cb099e8c20d864eb1bfc4982b365d89f83034c94ceb"
    },
    {
      "path": "manager-os/forecast/manager-forecast-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ea0c8337223334afe9324cfe432ec8a534b73f4007d472ce9f3c9567b7f0996f"
    },
    {
      "path": "manager-os/forecast/manager-team-forecast-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1dafe7431d387b43403875d48c5162f1bcd3146cea499e143658eeeec383842f"
    },
    {
      "path": "manager-os/forge-alive-shell/forge-alive-shell-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "81b26b3d0b8f6c23da4a9a202994de8ba095408ac494bd6efbf60508bd6f4747"
    },
    {
      "path": "manager-os/forge-alive-static-preview-milestone-closure/forge-alive-static-preview-milestone-closure-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "82e5a67d2a8de3b7c06660461035d9f854fb1b1effc886f1807f1f95457a0620"
    },
    {
      "path": "manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2fe5165ace67d640c8a0477f20d8dbacd71fbd280735c6096e4f2fd0ca8acea4"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-human-review-packet.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "31b834131b1f89f2c055fe815f29dc9adc08d3fbe8beac3b7790cb332755039b"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4bb8d48b4fa52baecbcb9881bc8e65354844bcbde637d40b951e441ee2fe3f17"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-real-adapter-wiring.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b267719f72b04e36f07f1261cedd09aa9f07ab65b29a1ebbe7034aca7da9b040"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-ui-read-model.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5aa9ccbf9b2b82390d7f026a4880f49a8109facd955733a96b7edd55f6ed7e20"
    },
    {
      "path": "manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "62c7cd1b03e187feb8856b56d98ef4a447ee84a6aa8395a9274207d59490787d"
    },
    {
      "path": "manager-os/historical-analytics/manager-advisor-historical-analytics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "66ea49eba07fc5144980b4f4def52ac3ea0e9d993c553199ab3b390599c7f8b7"
    },
    {
      "path": "manager-os/historical-analytics/manager-historical-analytics-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "756daedbd772fea95e65ee138730177ca58044941b5d6051d693ce261e80f97e"
    },
    {
      "path": "manager-os/historical-analytics/manager-historical-analytics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9e3c40f82a562d34d8c9abc12249bb48d6fc34f56c444f35741b4cf1c861a7ea"
    },
    {
      "path": "manager-os/historical-analytics/manager-recruitment-historical-analytics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c0249c338d03bfdfb36afec1d52e530e39a2a47ae38d171825285c8039f0d191"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-query-plan-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "001e431ba1e7e53373418c57930b0ec3ae30068735f950d9e2dca33f694f158c"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-rollup-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2e434912c473b4e3509740e84a7a9f46b3420cfd93976ff973a764ffa1286a4c"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-storage-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5decce8a507e3271d43a7e88ac826a83362daa4f9dde77f9e8815bb56d8bb3ef"
    },
    {
      "path": "manager-os/human-approval/human-approval-gate-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6c051d0501869bbb1787da61efc0de3c492421a1c6f9e4d58a9be60c23043c5a"
    },
    {
      "path": "manager-os/message-generation/llm-draft-intake-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c2722779b520e3ee620ba67b2600e3b4dfcbae597a34602427ea6fa400814041"
    },
    {
      "path": "manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "93984dc86492e63803b75fdca0c78e883dd03f829942f7c829cba6a014b6813c"
    },
    {
      "path": "manager-os/message-generation/manager-message-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "36633eba57e10d2d0fcc4edade31689c2f1d7d8495ee7eaeb188e60eae23027a"
    },
    {
      "path": "manager-os/message-generation/message-safety-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f67a026450f3e9589f28482bef3011b07963b566fb51a9bfbd1f8ec5a9fb8f09"
    },
    {
      "path": "manager-os/metrics/manager-advisor-metrics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "69e22585706237e58eb18a3a3caff2085ddf64f6bf2f2bc45fce62fd8b21f267"
    },
    {
      "path": "manager-os/metrics/manager-metrics-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "22864cecf921487b9ffd8ee72a0c1f4181aec28af6a04605e8e7c3c787f9bcdb"
    },
    {
      "path": "manager-os/metrics/manager-metrics-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "eca1ea13a6b1648bbdbb210edc2eaabdeee8bdabd70282ec6364f8eb9d428208"
    },
    {
      "path": "manager-os/metrics/manager-recruitment-metrics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "32a91bccd86555d00d8f2d1f4083c31e3c2654c591c305ddaa33c340cf275463"
    },
    {
      "path": "manager-os/nba/nash-mick-nba-reconnection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "96e5bb396f2acad6439924dc62a7c98b0aa411fc0bfaf34efcd086aeb3b1dc62"
    },
    {
      "path": "manager-os/nba/nba-reason-why-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2484ac2910ab913bc8c264c266e58217e6345e22eb81a0e1b8a94180ceb67675"
    },
    {
      "path": "manager-os/notifications/manager-notification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b3365ad9654f5f305e8911906cffff19c44be74eae519c100b25a8aabe9f692d"
    },
    {
      "path": "manager-os/provider-connector/provider-connector-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "305efa98da3b7c14d244bd93921cff0fcffba23c9e77ec742d61bdfba249c1ee"
    },
    {
      "path": "manager-os/provider-runtime/provider-runtime-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f3af26df46337c80af08677e6bf6e9882c949190147f6a2b426f271289c8a726"
    },
    {
      "path": "manager-os/provider-webhook/provider-webhook-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "534be3271e6d56f63b7449f104502c7216efb94e9e3badfd3544eea376a73a4f"
    },
    {
      "path": "manager-os/public-url-verification/public-url-verification-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b53e03f783cc554319e2c9e0c738b34039e5ac0c6b70f9756629e271fc309ba7"
    },
    {
      "path": "manager-os/rda-attribution/manager-rda-attribution-truth-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b0a4c84f5e54b4256945cf1ee11a8d729c10a48754ec689ff56aba23ae46041d"
    },
    {
      "path": "manager-os/rda-attribution/manager-rda-consumer-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ffac66f7d77aca9c361af1421c8a931ce1ca6430720bc40fc3760eef06c550c8"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-assessment-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d5176c1c58a324e9bd660892b88458e413dae2f817e31fc818a7756288588e2b"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-coachability-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe55d1a9143913732733f6b788bd2471f9fefe8000ca26e29dc631b238aea747"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-evidence-provenance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d38a8a7f1a479aa8bd851a2d28b3aa92e62c48dbc72e53889d74bb41c5662cc4"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-hard-factors-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8b3464273b3070531717de8594d945f61885021f0480e05b4c1a2fb11bc46ec6"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-market-quality-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c3c37198ed446d71753d4154658cdd2c960ee90a4818140c42a1373b96a093d2"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-vital-factors-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "04e7c4550810a043aaf8f758d8864d48179a3f403615cc32aaa2a6c0ea773303"
    },
    {
      "path": "manager-os/recruitment/events/manager-recruitment-event-capture-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e8f8ba8391535042011e2fd6b516d9b0bd7bdbd5a3b164bc32f4eca50658bc98"
    },
    {
      "path": "manager-os/recruitment/interview-flow/interview-flow-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "92ffed06898b9d9eaccedc46e3673b004abbac2824cca5b18eb13b7d608f9acf"
    },
    {
      "path": "manager-os/recruitment/pipeline/recruitment-pipeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1a7b795c0ec6ac77ef3d6cf2a6f6995bba967c8bb6fc17a603aa2361d9935073"
    },
    {
      "path": "manager-os/recruitment/precontract-gate/recruitment-to-precontract-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "429ade5a331f94b6f47cb23693c4e53a0298519291e55bb94c50518bd449dc14"
    },
    {
      "path": "manager-os/recruitment/rda-boundary/recruitment-rda-prerequisite-boundary.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7f39f2bf3bd0517d384a203ad4e474265132317bc96fa7e3c94c03b1d7901d92"
    },
    {
      "path": "manager-os/recruitment/snapshots/candidate-manager-snapshot-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9a2c723e4f8fec8ee0a8c04a965703338a5d0b82e5c07efe1cc485b0d0a2fdc3"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-advisor-review-plan-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1f481c600f792b8585b2692d2df3fef3d7480aff2fa4dd61965ada3739f18dd4"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-recruitment-review-plan-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "219c58e127f0010946e36e3b26855163b84d586288b1a214df6e5ee16e3c1ec2"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fb1ee57ba6c3ec6dcb7f39570b1f04abb985519a2e53bba5ea917fbf1bd4b94c"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9dfaf664ec52e3f60113f865e1517b4f130119239be268781248881855450340"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-team-review-plan-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "22306ddbb270551d0cc878190bf26e65c912bdec9e1ac4c5447ec88e5d8affc0"
    },
    {
      "path": "manager-os/roles/manager-role-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "475c76f3d918a079b9ee6bd1e0e683787bd8fb02a12eea2ceb7fcf22ccee4793"
    },
    {
      "path": "manager-os/send-execution/send-execution-gate-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f6c3ffd761a276e9e14a48ad9473ecf1a3d3277dcce4137f19df1a01f6557c07"
    },
    {
      "path": "manager-os/static-preview-deployment/static-preview-deployment-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d50e22031671997c6d07236cc5d674d8c9d12d927088bb8b729ee8dfa5928d7"
    },
    {
      "path": "manager-os/static-preview-public-surface-decision/static-preview-public-surface-decision-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "dc0f63daa2cd2f1d769f62d8c60e0f31f8bbfb6584a9d7f7bd97963c155de072"
    },
    {
      "path": "manager-os/static-preview-release-note/static-preview-release-note-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9626ea3197e56e54656cd3d201d882ca1647a55883c1f15277c6035230476f2f"
    },
    {
      "path": "manager-os/static-preview-review-packet/static-preview-review-packet-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a240fee2b1691ed2b43929f998f585e20d2f4abe76b272deae252e405919db67"
    },
    {
      "path": "manager-os/team-intelligence/activity/team-activity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "aa2c02867f2943ca5e9578720903a5c364dc5f75a6d680a254ebb78c999a773d"
    },
    {
      "path": "manager-os/team-intelligence/dashboard/team-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e809303e8ac0269f4b806dd706c186e0624b9b2dc11494c708699bf1f409403f"
    },
    {
      "path": "manager-os/team-intelligence/momentum/team-momentum-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e00196b98fec7ff48b77d2cdbd54ef5ba9c3cdd2964b058dcadf69e848dfd42a"
    },
    {
      "path": "manager-os/team-intelligence/structure/team-structure-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f2200b435609ef597cf93cc9e721777c15c20d5426c16c08a6abb5123c5906be"
    },
    {
      "path": "manager-os/truth-promotion/truth-promotion-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b14ba147afd5377b1a0b84ebd7466f61c584e4cd248ff95fe2456a44fadb363a"
    },
    {
      "path": "manager-os/ui-read-model/ui-read-model-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "22a1f61bcac02473911f848ee5da0c293c4ba3cf1def5fe253d776519fa585da"
    },
    {
      "path": "manager-os/ui-rendering/ui-rendering-boundary-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1fbd9174b9112493fc2520bd10ad82ccdc316c77dc3b6d3f0c4a5779ce2bac33"
    },
    {
      "path": "mass-import-mapping-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a7dd34557e0ec59482d14db204970eb77fe0ba84816e6cc654179363f44e1223"
    },
    {
      "path": "memory-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "87795463b92e98aadeffdc03bdefa49da05235e45ada84652c23fe4a2b37f0e3"
    },
    {
      "path": "mick/context-intake/mick-manager-behavior-review-packet-intake.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3c59d6211c5b621acd33daf0997a1bb68cb0d37d58e0122d292bc1384147077f"
    },
    {
      "path": "mick/context-intake/mick-manager-context-intake-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5bfb05bd06513c3d3c1b4755206e5482bb31de95ada05a1b9b3c8104d6bd6790"
    },
    {
      "path": "mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d9b07237e19780433601cab4d7c29cf209d2ac62924ebcf2ed6a1a5fc985489"
    },
    {
      "path": "module-lifecycle.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "785d7c62b3207bb5dd1392c8e507a163ee54508947f272572b2457ccb567bc29"
    },
    {
      "path": "momentum-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "afb07fd8338437f7c72bb5e84465082d0f39d0ac97f35d6ae69cf38656a6639e"
    },
    {
      "path": "monthly-revenue-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a2039c14f937474a9a543846c14079019e273715f20c585a0854278a46742f00"
    },
    {
      "path": "mutation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8a3d6d4dc6eca04d1d8a54a724f02e8d5a90e9ea5d3d58b917ab55ed6c013aed"
    },
    {
      "path": "nano-banana-icon-system-prompt.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ebc686788e5eb849255731122257c8a660f8a51acfd9e1096057f4c268a66aa5"
    },
    {
      "path": "nash-advisor-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6e8defc3b9659cd9517ed30318160439a2d371970d007975a35f3e7ac378cc60"
    },
    {
      "path": "nash-coaching-insight-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "97c2394574502fad2d97c82a0e7389301f02bef1604cc086778e4844d28d6440"
    },
    {
      "path": "nash-combat-intelligence-report-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "847544712d635beb257955b78e5a2e5ccba04183f6988e402c11687ba28e6216"
    },
    {
      "path": "nash-combat-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "43d8f2f12de78b7de434d7d8ef9b12d1b9d719563646a20a3edf4856acad075d"
    },
    {
      "path": "nash-core-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "87caf0635314df290833a8226f9ded521a4667f90118facc6e106a864dbdeaab"
    },
    {
      "path": "nash-council-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "686a1d45a9ab40eaccd637fc2d02cca3bf6c913103367e264f00fdf5165557d8"
    },
    {
      "path": "nash-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "20e51e6cf45cf1f663c186493400c2107222f349078d4fd6e10b8df477f5de0c"
    },
    {
      "path": "nash-intent-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8177b2481ab356b5f5e5fb605cc064adf529101cae16e349a15cbe6754b2ecb0"
    },
    {
      "path": "nash-learning-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "20965fb26e5339d1bf39c13d079c2ae6ebb9969709532832c6ed79be657c12ac"
    },
    {
      "path": "nash-manager-alert-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "afa82aafcb2087d7846b1c2d84aeebeb017ad3d6811769797b3e361f903ac97e"
    },
    {
      "path": "nash-master-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2ee8f1c5b49b819967af63c8aa9e2a617c3cdacbd036adf2e6aa14a7c7a04c8a"
    },
    {
      "path": "nash-memory-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ef000f6861de21aa528e569894e3ca9754e43acf4b2f188b9b3ae47f0707b305"
    },
    {
      "path": "nash-message-recommendation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c8801eae1f9b274ba7748b54fcbfe92f17eb30bf9d9bf8b3904a900a907f6fa4"
    },
    {
      "path": "nash-next-best-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "84d7133b2c06b5034fcb30ba40fd43e1c4353d459bc61260d75348bee6047464"
    },
    {
      "path": "nash-personality-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a65b86531a21071983da4bef8654ab4ec4168aa79796f1435740a7528fdb5b58"
    },
    {
      "path": "nash-prospect-context-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f04db56931a1917bbf6b5f2f0d796a592a25cd8b31e22999790d1b690bcffcf4"
    },
    {
      "path": "nash-team-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2b5f8c8513eeda184f3f167fc821f88776a23f55d71d0c6c0c0812137853dbe9"
    },
    {
      "path": "nash/context-intake/nash-manager-safe-language-guardrail-intake.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "83b1ab5e01c9afdb687ed78d4720e7f5a4e071c32553b3ffbcf88335d5110964"
    },
    {
      "path": "network-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9372471a79749bf1968bd4a0212bac3c8f99610c6be0a4178f82dbba3c060f90"
    },
    {
      "path": "next-best-question-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bdfeecd436c8ae80078d3978bc75ba610b915d715ba3c40525b3ef0ae2647452"
    },
    {
      "path": "operational-button.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4b593cd91656c41e61de78a11ebbe60bcf136e8e06a10ff5989ec59796928f9c"
    },
    {
      "path": "operational-card.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e13a2fcd5c8d156cda06103a993e0cea70d2b54ebe1a6acdfbc0c4411c01ac81"
    },
    {
      "path": "operational-feed-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fff6f594bbbd324dcc0c38d2f92632bdc27e62069bccd01ce16818f15ec3c131"
    },
    {
      "path": "operational-shell.store.ts",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "67a93b040570b9b21a2e4ec7feecc786cf500fd77a20764bbbe7cf8111e8255e"
    },
    {
      "path": "optimistic-mutation-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "01d65a2d6e93a00e8b6388bdce8e139a46580f6bc2e8e2697fc0d6cbd2687692"
    },
    {
      "path": "orvi-client-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "db820f3f8b373da722a9ddd56cb615dc28a4752cb7b2afcbb086fe31a10895db"
    },
    {
      "path": "orvi-decision-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2a694ce703c4c363ee92dfc210ef8a3715fb5a8c86985c2d41d53e2f54868798"
    },
    {
      "path": "orvi-event-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8942e436a09d80b35e34630d3da4d3d8377b09b88728bf832923413dd282759b"
    },
    {
      "path": "orvi-guaranteed-value-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "996dfb9498948d9e5b3c70684b599f2dba087b34fb4c51781c889e116cc610f7"
    },
    {
      "path": "orvi-mxn-conversion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7c2a1c8a4c0084c0c5f6400cec0e78fd7119e81c355a9458d9ea19e1ff064bf0"
    },
    {
      "path": "orvi-objection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e3408853f43eaecf976539bbe99c9cb1627e31cc05e2197849a4384c01f6e916"
    },
    {
      "path": "orvi-wait-vs-cancel-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6cfc2cc5319e81dff17d459dd6880d158072ff3df1c854bf05fe541e774870ef"
    },
    {
      "path": "outreach-prompt-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3b10da36568abdee8f693d2bcfe0c74d3c0ef9a38cd9bcc2f89dd436927b25df"
    },
    {
      "path": "ovelay-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ade5661ca3241db8d0515301279ca1450beb51c32af9e826647bbce47257db5d"
    },
    {
      "path": "overlay-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "65c713d2b0cb701e05848ca555ab7a11f325d95dc52e36bf4433d43446117226"
    },
    {
      "path": "payment-frequency-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7aaff02fae9a21fa0ed55501a9c36fecbdfa61b9f49931ad94943dbacd05568b"
    },
    {
      "path": "payment-mode-coaching-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "09fe4933b436cd9a109f9d2dad0a8d74075d2aa59d7f0a88671866a8c7e63140"
    },
    {
      "path": "performance-monitor.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a3b1ee588f427368276eebf5442736fccee63be08b30e8efc95f65f523279257"
    },
    {
      "path": "performance-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d2d479b947ae495899543e46fe8de31b39f9b992637b2ea0d168f0fce8ee227a"
    },
    {
      "path": "phone-call-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a80265275b9131897e2b3b0db8316e164a9c18e872674bd009da2770d0ce1fc8"
    },
    {
      "path": "pipeline-stage-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f503f8f1fe0e68394a44df415edee37b7792767195fecdb2aca6770bd99ef3c6"
    },
    {
      "path": "platform/action-contracts/action-contract-approval-gate-schema-070c.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9e57ef861874514e46c791f0d68296368ab20014bcdc6930b7fea25093274989"
    },
    {
      "path": "platform/action-contracts/quote-action-contract-071b.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8a9831e050343003a28ef0f720b9400f6f702296d47abcf99792aa2e2632cdfe"
    },
    {
      "path": "platform/action-contracts/quote-approval-gate-integration-072b.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "81494aad26a300ae10550a0c628be423d682edfd99366b72bdf4fbc0c15f6797"
    },
    {
      "path": "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0a265e954295afa5f34e72014df66453ffd0f9ca172cb0c128685ac0ec18891d"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-model-normalizer-067d.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b69e7948a66de99827a84be8994a753d83a66ab915b3fe469ba0dc97416b711e"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0659f1d84b3063b008847a62022b4b0d9d681cf8190e95fcc5f2bdc4439ad006"
    },
    {
      "path": "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c7fb86aa238830df11eecb840301b13360eee9451690852a88503ce7e869c929"
    },
    {
      "path": "platform/animation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "53dab1f79f44f8a8a17f9f1cdc1986e7374c524c5d05fee9b3d6f65622224e20"
    },
    {
      "path": "platform/app/bootstrap.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ca3650e3af40f4e64d45a637c9825244f657957a79265557d33abee273ef3fc1"
    },
    {
      "path": "platform/app/forge-app-shell.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0f1306e7b893258524232234871d65459ed0952140af8b9ccfab24d54e1ea62d"
    },
    {
      "path": "platform/app/runtime-listeners.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "16127f625c8e63c398612a15c10c11d2f9cdda8953363ad957a07f5c3283586f"
    },
    {
      "path": "platform/auth/auth-service.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "86103106d9563ce6a1cdad6bd2fed5edd4e2b2b9dd191c84463b861f6e373fbf"
    },
    {
      "path": "platform/commands/command-execution-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4c7d51e5e8f5b1a7937f1a4c3d1133eb1ab5c842846c4974940e1f3c27e77ec0"
    },
    {
      "path": "platform/commands/command-palette-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e2c9a562984cc1b550034b5703b3b2e709183e98505bbf53161cf81490fe71f7"
    },
    {
      "path": "platform/commands/command-palette-ui.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78fa3f371482025fb0846b93ce44da2b81b7c9a206a88b79c31cb24746de062e"
    },
    {
      "path": "platform/commands/command-palette.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8e0fd4969d25fba0b43f992b82e3e5186f19cead2536701121e354ac218c2989"
    },
    {
      "path": "platform/commands/command-palette.store.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fe7abcfc1abb099a2904053d39675304ee6ee842c828969a21b6b1a117a82257"
    },
    {
      "path": "platform/commands/command-palette.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c72636ff5c2687664eb30a2176101115a2558e6220c802c5b7bc2eb81ad87886"
    },
    {
      "path": "platform/commands/command-parser-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "37a0958085c2f83189e0c8ed15caf6b8dc306154df3f71d0a815b37f99a87574"
    },
    {
      "path": "platform/commands/command-registry.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "734088d7ffe907b5296af388a33cab3bb0cb9dfd91c04f0f38bd73512f4c0ca9"
    },
    {
      "path": "platform/commands/command-search-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6c27b35cec957a62b605c7b3c596d53096dfa80770701162fc8162f887defc08"
    },
    {
      "path": "platform/commands/command-shortcuts-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fca13643a0291a97a57c0fc02f1f40471f7e1d00acf745c9555fcd4cee6eea61"
    },
    {
      "path": "platform/commands/command-suggestion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b59d93b4177fb273a0f2c6539ef39114411c8993a410343bb07943033ffd11ab"
    },
    {
      "path": "platform/navigation-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78c8a5a540afd5459b17bfdc4f0cbf1a3e615345c8c404e0ba957ea41aafc320"
    },
    {
      "path": "platform/notifications/in-app-notification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5daec91b03c93f54c2ce574ff43fb855c749007fca6c130205120f49e3fa9300"
    },
    {
      "path": "platform/notifications/live-notification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "898eddc81c0cf628aa8a8bf5fdc1e9c83c0cbf09601b1ca8aab58ac5776af5df"
    },
    {
      "path": "platform/notifications/notification-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1dcc2c31d72d49e6b23c120a3bff70f4f6998418ceb946a53aed82224e7dd0e1"
    },
    {
      "path": "platform/notifications/notification-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "206bd739db3ccec885b4efac479dbcd101b55da5646062891efa7235e07319d4"
    },
    {
      "path": "platform/notifications/notification-queue-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8f6f30540b75703dc7357aa742ccc15d9859b10e210d99597b336a4916811474"
    },
    {
      "path": "platform/notifications/push-notification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "504bfe3b3aeb24d89ec774d757d766992ee8b6b7f04b5ec4c679a862b527bb70"
    },
    {
      "path": "platform/notifications/smart-notification-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "98e47cf619eb758a325b686faecd7e9bf23a07d571fd2c4e0ffb1e75e7eb1208"
    },
    {
      "path": "platform/routing/enterprise-router.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "37519a0c7899a841175424cc882f5d65cbd0d4f148ea72fe2a7bba3df508be56"
    },
    {
      "path": "platform/routing/route-registry.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9720f33a275e39c82ef1787516bf3ad14302c451ab9c7fef3abd79244410d70a"
    },
    {
      "path": "platform/sync/offline-sync.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "39ba1066e8edfeb5f38215cee85d2050fc061127d90158c76ea9543666c010ee"
    },
    {
      "path": "platform/sync/operational-sync-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "61882d2222b3a17ab2f8ee97f50b9095200a3cc6aaebf74b195943a04f81f65c"
    },
    {
      "path": "platform/sync/sync-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5d1dd225cff0ea7b7a62fc1081b2b3bccecb2802d96ce69bd6ad656e484aaaed"
    },
    {
      "path": "platform/sync/sync-orchestrator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a1d4434d24f68addfe67a874797cd8b0dffe1084c62f0ee69ec4dcbb9e4b3d67"
    },
    {
      "path": "platform/sync/sync-queue-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6750e7c4b940e7c5eb9e9cdb5132e8946e230e730e626d8318e83a169314e7ef"
    },
    {
      "path": "platform/truth/contracts/owner-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c888cffd425f472ae4933a551ee812685f47bf11de77d2f22ec45c43ffebc2b3"
    },
    {
      "path": "platform/truth/contracts/truth-envelope-required-fields.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0bf2219c022f94ee6cf4f946048dbf1e8a00949403453d782de7133fc43d5581"
    },
    {
      "path": "platform/truth/contracts/truth-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "71384ea1215446d3362a7662c689695a9cbc639efab7b60210607787bc33b591"
    },
    {
      "path": "platform/truth/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "511d63bfebb545894b8687abccbf3512bde514a2741ab827f4bdcc44d577625e"
    },
    {
      "path": "platform/truth/validators/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b569ad5e9816371b9d3faf59432a30781667816d585fd8453fa652ede78ad21e"
    },
    {
      "path": "platform/truth/validators/source-ownership-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9a7a82490240382791852c1dace83c83d12d72284256aa5275831e977bf6627d"
    },
    {
      "path": "platform/truth/validators/truth-envelope-required-fields-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "36c25b80133547f1bd94e9d18086e44c694ec3a3dc1ff238e77aaa28fb94bd22"
    },
    {
      "path": "platform/truth/validators/truth-type-compatibility-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78836b238913d18ed1515671380bf27da243ef8a5ada4c114850c08f1ba6522b"
    },
    {
      "path": "platform/truth/validators/validator-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5aa4eaa0e919e672f385520470a0b31ae7c3ca222aad1b6ef0fb02138a3665c0"
    },
    {
      "path": "policy-field-confidence-map.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "709fbe3b04698a858a41e1fa27f0218b6d77fd78dddfe44d648989da5f01f5bc"
    },
    {
      "path": "policy-operations/client-records/cartera-utils.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "637cf0ee777c3cbb34fdc710f3476dc81b4804f035fba8b15d90c466cfdcae78"
    },
    {
      "path": "policy-operations/client-records/policy-client-summary-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "00d61bd158a410b716f28f0c45c1ffa5e5a320f7095bbbbb4625204c2bc29431"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-confirmation-task.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "34dc18a78514fde4e61828f29bdbc68e9a992379d89771949619a8d356b3c1b9"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-inbox-item.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8de6d212508fddf86e012e8cff5ccb09409cd783db56fa35ec74a9a74732633e"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-inbox-scope-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c73800693a3461a07bd46becfb372d0776bcdcf4b36b3aad0e41673387b43c3c"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-source.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cdcd3ee973ed465f03cf1bd6a8618b1e1f7bc8e9e039aed8eec99c83c822a7aa"
    },
    {
      "path": "policy-operations/evidence/csv-parser-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "213c9bdfb7ce92e666eecbd3819439ef50312b5c3ea783794ddef2519b2f845b"
    },
    {
      "path": "policy-operations/evidence/import-progress-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2de6edb3d1b3da95ae1db563b0ef831ca57cd62a2a9c4f2b75f862493725cbcb"
    },
    {
      "path": "policy-operations/evidence/mass-import-preview-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "79b8c9241a56ec68e0bf9fc3e743b78c310b9b4761c1f1dcac149c6836ed93c1"
    },
    {
      "path": "policy-operations/evidence/mass-import-validation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "76416e15371eb2143fac88d9881b7f9c6ec7081e498d17348d74df4a50650712"
    },
    {
      "path": "policy-operations/evidence/policy-ai-parser.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9a836b43cb80b6702c9fd02787b4883aeef23a720db43fa14288643693e61c5f"
    },
    {
      "path": "policy-operations/evidence/policy-batch-processing-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bf34eeebdaf8b2ff5673b9ed8720e931a62b69653595597ae33bcce353716405"
    },
    {
      "path": "policy-operations/evidence/policy-document-classifier.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "aec7dd9dd09bba22200d123ce195069da811fa789670f3d5929a43a351889274"
    },
    {
      "path": "policy-operations/evidence/policy-human-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "38f8d01cdb0b943c91312e6055be19fec4564527158017e402b8e5d12f8d14b1"
    },
    {
      "path": "policy-operations/evidence/policy-import-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0e60125e08bc1d7398ec1dc1d5090a9b1fd1691912582fc2902453a3f390ef20"
    },
    {
      "path": "policy-operations/evidence/policy-import-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ed05d5e2a7c360c83137b642aaec7a8023e96f2fa40d2cb1cc26da685d6602dd"
    },
    {
      "path": "policy-operations/evidence/policy-import-errors-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "580b03c694dea780d97c5cc9e57b6788c206b9a3bad16b9bfb832d18cd48d666"
    },
    {
      "path": "policy-operations/evidence/policy-import-metrics-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "71c6da2991c946c7369c238ee6c3f7f7c1eeaffc0e610c9f0810ea1daa97a7ed"
    },
    {
      "path": "policy-operations/evidence/policy-import-queue.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78b85e0515061d90a655650490e8be33cf17e414f47008fb08582458ed212dd5"
    },
    {
      "path": "policy-operations/evidence/policy-import-summary.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "90f695eee0cfa4c20ef57c0f905b246d3f20975b193e7340ee65563613c68eb5"
    },
    {
      "path": "policy-operations/evidence/policy-schema-validator-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "31fc4ba0aaf9e0e0e2bdcfbd56fc16542a6e4c808edd8410771114e45e6ee678"
    },
    {
      "path": "policy-operations/evidence/policy-staging-cache.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "abfdf92a82e6fb6be6de114ff71cd1e770059f8de5d698377446a8263b2e631b"
    },
    {
      "path": "policy-operations/evidence/policy-staging-status-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fb82d2fcd5fe1abfb54f61ecee5478d5a0006dc23cd22ac47537f44055a94de7"
    },
    {
      "path": "policy-operations/initial-renewal-classifier.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "055892c96e24ad84753a64f77831aecc820daf45390bc21dfaa586cc0b8b086e"
    },
    {
      "path": "policy-operations/payment-event-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "194da9a3916a8432e76b5920f48ae4b7d3421f0485108d6493c8076233648b5e"
    },
    {
      "path": "policy-operations/policy-detail/drag-drop-policy-zone.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e63aaa5a16bbb2e05cc5f5d64b05d391eb534272f1957e41e3b7dd6b20cb38d6"
    },
    {
      "path": "policy-operations/policy-detail/policy-ai-insights-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0728ae6050a23fe60ac34e4ca3c242d29a6b95cfbea478126483d20994197dbf"
    },
    {
      "path": "policy-operations/policy-detail/policy-auto-approval-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f1a14df5c3907ce3a8086bacf6b633cc0c2d3f64480ee744b89503105d5704bb"
    },
    {
      "path": "policy-operations/policy-detail/policy-auto-save-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8960940f84bdb3377990683895cb93929371be3dbf93dee3c6319502576551ee"
    },
    {
      "path": "policy-operations/policy-detail/policy-context-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6485b43560076ea1e8742beb8d2af868351c68ba899ab62521b7eeb363f3ce7b"
    },
    {
      "path": "policy-operations/policy-detail/policy-core-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "19130c3f0efacdc910fe821d1e8833a68c0af70dc6b82953ba68c25027481d49"
    },
    {
      "path": "policy-operations/policy-detail/policy-detail-alert-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ceac871f533cad38c0aab77ba2b9fff3839a163abc2aeb3d2c4b490c7e641802"
    },
    {
      "path": "policy-operations/policy-detail/policy-detail-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "16be9b8b5ed65563b861bb61c016ad26f8af3b99e7120b024e1f603167e2aedf"
    },
    {
      "path": "policy-operations/policy-detail/policy-detail-view-model.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6641a146b1165f775aa9750b21bc233a8332170b7abf36c01e89c5f737550c69"
    },
    {
      "path": "policy-operations/policy-detail/policy-duplicate-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "153c70d96e54d71c56169a5a6f01ea13b22caca9242a498252c5f782f0de6ffa"
    },
    {
      "path": "policy-operations/policy-detail/policy-filter-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "941ca5103e415d84399603986ac1aedff02c238759b9f52430ba84c2426d7218"
    },
    {
      "path": "policy-operations/policy-detail/policy-financial-summary-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a94475a2a6ea1257eeebef6ccff9b4d95beebe97ebec4174a14be29f503a65f9"
    },
    {
      "path": "policy-operations/policy-detail/policy-indexing-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "740e08d4152eaf84b12b048592ae442754541522429f4115105ca24e0af42dfb"
    },
    {
      "path": "policy-operations/policy-detail/policy-last-contact-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "102350beeb5baae013c0c17fc2f83b462f68c17d2771897ffe5d637778844295"
    },
    {
      "path": "policy-operations/policy-detail/policy-live-state-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cf758011361bfbfa317fa018c7b5d570a6f5b7fca0ad410f0b8ca349d3bbd7b3"
    },
    {
      "path": "policy-operations/policy-detail/policy-metadata-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9b91f030bae82f28d099ddc7140aa5e06c5c2a5b549a4ce80c7ee92e27bacedd"
    },
    {
      "path": "policy-operations/policy-detail/policy-normalization-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a37a37735128802c6fad751533f8087abc923cae53a178475e61dcc3f5eb03d6"
    },
    {
      "path": "policy-operations/policy-detail/policy-operational-center-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "984550bbd2f861a629c01d5027f50ff6faac7e1c7083649cf5f22b92c98336ba"
    },
    {
      "path": "policy-operations/policy-detail/policy-quick-actions-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "96254b5109d6758438c95a61a85fd27a49c31b752c8d21151c8ffa46820c9455"
    },
    {
      "path": "policy-operations/policy-detail/policy-relationship-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "dd34dc7f4facfbadd9acb4ea5e3c8e1198450e23c583ba7eed3f7d5c374852fa"
    },
    {
      "path": "policy-operations/policy-detail/policy-review-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a4ebf7120295596fb8af53e2f1ecd607bcf0e58fb8bc61be042369fe89a7fe34"
    },
    {
      "path": "policy-operations/policy-detail/policy-review-ui-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ceba0c813592764dcf4ee270f054d803209fecf5cc77af11587f3c9b08085530"
    },
    {
      "path": "policy-operations/policy-detail/policy-risk-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ad5f92ddf46672ce7e3432ee1ba1514d78dd04ec05b93db884575cbebde48815"
    },
    {
      "path": "policy-operations/policy-detail/policy-search-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c42b18341bb56ebdae2406c93b23c012da4c622e279a5810fe017cd9127a3a2c"
    },
    {
      "path": "policy-operations/policy-detail/policy-side-by-side-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c4208d6ccd27b0ebf117fdc9d28618f527518dbb2aa68e140fb8b4c6a70b5db6"
    },
    {
      "path": "policy-operations/policy-detail/policy-smart-sort-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "949e0653632108e4df4a4418a560601d9ffdca3e3d9c04937ca6f9571c378bf8"
    },
    {
      "path": "policy-operations/policy-detail/policy-status-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cc3eb5c6ee8a15b3a9a65252f4c89f92dd10529ac9a5eb4cf8307f821c7a912f"
    },
    {
      "path": "policy-operations/policy-detail/policy-storage-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9631c7c2bb444d8bac86981f51bc0023769dfd0b090c59c66a35e6c8d76f6386"
    },
    {
      "path": "policy-operations/policy-detail/policy-summary-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "faf07ff858d6fa51e26598ddac24cbe742f193618f5f03f232997357965aabd0"
    },
    {
      "path": "policy-operations/policy-detail/policy-validation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1fbf2a217ee38882c218219aac0fdba799a4d52c0cf29fa13281ec3b61c60574"
    },
    {
      "path": "policy-operations/policy-detail/policy-workspace-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "73d36ad65c76841a096fb65247ba9f79fe81edba0b1bb45ddfb1e6bcf87da0ae"
    },
    {
      "path": "policy-operations/policy-timeline/policy-activity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6e9d4956040c8b643bec02eab628fd29dad197781fbcb9907c553714ee3668cb"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "21716c138c0f6feefb191131cf47cdb8445cd7078d46e4cde661bbc84ed61b3e"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline-event.factory.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d77993c6a34c361093db7bcd91def3c67cf29c3af28bedaf0ad268ab2836d84"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline-group-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "33357b0298ebcf39782d34023764f17747a43cea9d4f1ce334b4b8672c15c6d3"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline-query-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0553e63fb44952c0afedf66d391da50583ba4bf2b3c7ac00b4c21434a18770f0"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline-view-model.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "acbb9a02048451f249ea66b879e5e5f290bcb7d1efa14c35660af1422ff55d84"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline.repository.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "20029462e9e806eeefb8c63f070797865f71b426fc074a1bf65b2ca9e6ba5082"
    },
    {
      "path": "policy-operations/policy-timeline/policy-timeline.types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "206757f2955ac5507bcec318b3c1b3db370b57dfe1d8affc937c400b2096540b"
    },
    {
      "path": "policy-operations/renewals/policy-renewal-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "42df03d09271ae289e006f97d2fa36d0fb82cf1bfe743bb074b82e273d28d0ca"
    },
    {
      "path": "policy-operations/renewals/policy-renewal-status-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "74aa1477b6c36d4dfb6e595a5ba4aecb6a88681fda430f249a426542b2cfd0e1"
    },
    {
      "path": "policy-operations/renewals/renewal-intelligence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ec41f376e7383e68985f66426dd6f9ab18ae77e107243a3778d3dd6fa262e76d"
    },
    {
      "path": "policy-operations/tasks/ai-task-suggestion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f3750f267301db6ebe7d97e244e5aa2666bad9021ed75b60b379fc4a1b45f9c0"
    },
    {
      "path": "policy-operations/tasks/auto-task-generator-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e395627f4e35cd71ed0c9b2bd378a1bc538d8252de4f62db6469840ec5f1fc5e"
    },
    {
      "path": "policy-operations/tasks/google-calendar-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ea412979e922a194b43e9bb1ac64e95db1f6f3c6dbdc07c4ef98cc4741b317e2"
    },
    {
      "path": "policy-operations/tasks/overdue-task-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "43310af9cb39255bebb725302423adfcac109bd0722196c85b6dac2bc73ec8e4"
    },
    {
      "path": "policy-operations/tasks/policy-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e4b482abb2f01984ea2d1ab2f8e2c7ae9d1d30818a60e302bebc39fc1b85c01f"
    },
    {
      "path": "policy-operations/tasks/policy-task-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6e49673994c9e9cc3aa8866bc9d94df3e057ff965197bae6636e883d97452ce0"
    },
    {
      "path": "policy-operations/tasks/policy-task-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b2f2cb241bd8a6d015a78169f00511b519188e596ef213fa9ae1561c9651f5d8"
    },
    {
      "path": "policy-operations/tasks/realtime-task-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f4488b7f75ab8141742a1b14511924d8696719078e78361c2e94ebac97988c05"
    },
    {
      "path": "policy-operations/tasks/task-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "eecc7cc4bde7e367864d3e551231489ca47a6323a337f8f2b40ee51a9178c581"
    },
    {
      "path": "policy-operations/tasks/task-feed-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1b7d52f8f0a35610be415d96dbe52b9070c8ee1af342e200ae260be79587d127"
    },
    {
      "path": "policy-operations/tasks/task-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "820e0bdeb20864c71b09e1107b11753fa7d7e017399f5eecab35a7642ade9d81"
    },
    {
      "path": "policy-operations/tasks/task-quick-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b2845bf48f450c6f33ff44d3ee0e7ce861502391526a766d83c53542655a63d6"
    },
    {
      "path": "predictive-dashboard.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "626afb3370103720b9301522d87c4f3c3d680051741d89b3b9e3f5ebafd10687"
    },
    {
      "path": "presentation-input-context-builder.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b6a84a23636489c50b4d028d237279bd69f080c07b337cd234ea41433c27d725"
    },
    {
      "path": "primary-risk-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4d3983b8b753f95ffe5473c1f84fa11f0ac743aa14cdbc3601c76ee0f0169ad8"
    },
    {
      "path": "product-detection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bf690ef0dd12191ed2fe8ff7dbb5de9d85e0b4c7b6177800d84076799115c8a5"
    },
    {
      "path": "product-knowledge-link-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7f661e0ca6b455ea12d4e43ca1b250ba83c6937d12a404c3a0ab73e479ade391"
    },
    {
      "path": "proposal-family-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f3fee31263deb3f5213f0969e5e4cd9fb8a40dcb276d04dddc97496e512ab33a"
    },
    {
      "path": "prospeccion.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4cae2c44153225cbaca0d455d413d0f8b237cbe4309358d52ee747e309043db7"
    },
    {
      "path": "prospect-personality-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6cfba05aef7507d6ba57589f68de91cf7663805f81afd3dc55d3c202f3d7ecc5"
    },
    {
      "path": "prospecting-dashboard.viewmodel.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5da1b562e9b5e766307ca95f556b841967bb267404670e66dbf2067a144dfa9d"
    },
    {
      "path": "query-cache.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4c81eadc4efc1665fc80517c00b38c57ed6357018f06b827f6125084c9751218"
    },
    {
      "path": "query-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0a622743c93f925748dd736c74dbf3b28630e0f8f9d4f3e4f8123b271dcabc26"
    },
    {
      "path": "question-answer-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ec8eb96b6e67b5062f158e6d834df381bc9ebe2ef3c401b4dd53b3a4f4282cec"
    },
    {
      "path": "question-session-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b2dc0d10935e52a9582bc74ab51d8b5eb25cae59512f2ddc5542470e29d595fd"
    },
    {
      "path": "question-style-match-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6efbc48c61532e373b342c4663cb6e451693999bb4537ea5d9e656ca3b62cec7"
    },
    {
      "path": "quick-action-executor-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5ae6026bd8eea72d3674f176771d8334b88f38cac8c24129ed7956dbc0419b4b"
    },
    {
      "path": "quick-actions-bar.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "98849e119f3d52a2292ced584c1c0bce96bfc5a77395ff5716a9fe85c74e3d07"
    },
    {
      "path": "quick-actions-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1e01c5c0d86972e234792757270dccbdf10a639ba7969a423ed0095b9b85da98"
    },
    {
      "path": "quotation-currency-bridge.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "72d7a3907c3bb6a76a8ae4de63867c47741da1b6fd0d6e4060ccbabf484b9df5"
    },
    {
      "path": "quotation-field-normalizer.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "019c871a7ad9fcfb0734e28b8615212b2b8e47219b0c032ae59ebc7ca714a689"
    },
    {
      "path": "quote-to-policy-comparison-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cd1295347001785e7c477136224fd8d29882552fe804d14e00eb8105e9c61f5d"
    },
    {
      "path": "ranking-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "62cad4409e7d1385f9d72e9a711e4281e0fc1fa3c0ccfb3d6a30da8d3f294ece"
    },
    {
      "path": "reactivation-strategy-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6178a57e550e12695f3414cd9ee811ea0f33f4be694e0b7c51ff65e25da77181"
    },
    {
      "path": "realtime-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b1fe1571d1d38cd37a805ae317c9fe21f99a24fab3d283a57fbab4cb4658d2cc"
    },
    {
      "path": "referidos.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f018cdcfa4f647ae8a5bcc65c75e95b9974ec830809881ccd2c771a040fd371c"
    },
    {
      "path": "referral-card-ui.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "95b1dc5c0f07f2b36e73f7263c95e40f0f0b6743f21573ebf962821855e69487"
    },
    {
      "path": "referral-opportunity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8ecee398dfef48dc988684467cc9cc2ce8c686fd44331a22b298a1691b7d2208"
    },
    {
      "path": "relationship-health-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bdc7e9288a794ab98bca51cda2562ce00f0831e3004d34c626db22179ad2879a"
    },
    {
      "path": "relationship-master-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "04b4ab8d1abc0a1be72bdebf6998e1973003b46f38fa4a5a79a76741cce87449"
    },
    {
      "path": "relationship-next-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e77ec0c7d83b0444d8d7e566bda954c4399fb55af3d222f9803f4c9cf2969475"
    },
    {
      "path": "relationship-opportunity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9cb40d294ea40c52a6e0e0eb33615aea10de07849f832657274c78d1b2b6e8f2"
    },
    {
      "path": "relationship-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3a56d5af9b80b4c065cb364e239909ddd31467097a34a8d00ede1fd71abcc4ab"
    },
    {
      "path": "relationship-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2cab1e2cf79aa7ef8bbd7046390596741ff04a901d2dc626727b47503b246eab"
    },
    {
      "path": "render-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "61e94d7f9db50f349c0182c76e7330f8a34929f1188a51762cb8385bdf84eedf"
    },
    {
      "path": "responsive-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c7f6f1974156c0f20a7647fbdafbe4509d74229d607be468aa7607a5856867f9"
    },
    {
      "path": "retirement-future-udi-projection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "549aea616c585bc84be09c08ff9c77f500d5884458b154dffb9af3c72b8e686e"
    },
    {
      "path": "retry-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1da7194b4b0098ced81e5925d204db0d41dcef57144d27987f386327fbdba216"
    },
    {
      "path": "revenue-forecast-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a8a5d457a53801f7d5a75c9041a9d38b67500b9077bb8d04e877ac2684486dc7"
    },
    {
      "path": "revenue-optimization-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9754c08405ee48a514972d3e25e8ee9e1aa7cccd5f89047c9af86f93b78837ed"
    },
    {
      "path": "revenue/adapters/not-modeled-carrier-adapter.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d2d0cf2076e8f25689af38580e5f3c18622e3b98d9be39016fdf22d4a90e4a2"
    },
    {
      "path": "revenue/adapters/smnyl-revenue-adapter.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3cc352c3259ff409487497768cf4782ea584e02c3bd0630e3b7cc7b9a61b784a"
    },
    {
      "path": "revenue/carrier-revenue-adapter-contract.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "40f620388491e4915124908ddd64c730fdb2a79527de9a80e0aa4da0dc1e8da9"
    },
    {
      "path": "revenue/carrier-rule-router.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b3a71001678b781ba1197faaee0a1f763c5d1054754c677b86f25c8d5ca6642d"
    },
    {
      "path": "revenue/revenue-scope-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "304a14892f1b79cd2acf14b12d2bc2b31ebfeef80a8fdb7d5a22a55cbe31faa5"
    },
    {
      "path": "revenue/revenue-snapshot.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a37b83992fbb0c4763fe1984b6dc0b60770a00e96caeaa6554ca72ad7b9e5f33"
    },
    {
      "path": "revenue/revenue-value.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "64dee10b3f991a9da4919d0df1d4e9b32ec13ca17c4df026bb1e34153b9f4126"
    },
    {
      "path": "revenue/revenue-view-model-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0062f428550f52395b9f02312b13a34cfbf750cdd44bf900f212015d8afd628a"
    },
    {
      "path": "risk-story-context-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "fcfef45aa2262ea304e548af7beeb08e0f0637e260267e163f1fe37a623a9deb"
    },
    {
      "path": "route-transition-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "23f80c9301bf48ebe45e8bd97ef72e4d07237785db8a06c7cdfa1fc7bd0be69c"
    },
    {
      "path": "rule-packs/smnyl/db.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b8fb48288647f5b13ba1e18072407124ac5cdcf76c1e47d2315a317a5d6759bc"
    },
    {
      "path": "rule-packs/smnyl/smnyl-ai-coach-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8e569d5ba75214097434e0f06a02f90574315e5e2c1c67fd0c09bca049156040"
    },
    {
      "path": "rule-packs/smnyl/smnyl-ai-presence-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9ed03f47a228ecc1656b03f2c8263bee0abf2b0900443f7711e482f3b3d743bf"
    },
    {
      "path": "rule-packs/smnyl/smnyl-alerts-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3685c88032ffb2a1f2e67b3ecbff3b88b64d9920b9e32ee8843ea0b168aa76d0"
    },
    {
      "path": "rule-packs/smnyl/smnyl-anomaly-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4fd83178ac168b0a44328b901d7b954f12cbc44547007b4839a89305aa4bd7a6"
    },
    {
      "path": "rule-packs/smnyl/smnyl-automation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "81ddcc7bbdcd6d917370c52e3a34e1a1a82ac77ef3c50b3a6f2b0ffa168a60bf"
    },
    {
      "path": "rule-packs/smnyl/smnyl-bonos-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3dfaa53c025adabebd18dc12850e5abdd2d74b9cc4088dab3a5fa138fb966de6"
    },
    {
      "path": "rule-packs/smnyl/smnyl-cancelaciones-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3024a28b7365e7acf4d373ead20931922f2d377639009258054e7d7458ef159f"
    },
    {
      "path": "rule-packs/smnyl/smnyl-comisiones-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a7a78959896a578220ca15067b9db90f5eae3dac85d8718d8831148b33d7886f"
    },
    {
      "path": "rule-packs/smnyl/smnyl-comisiones-gmm.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6d8f8ad1ff2e0a8aa756a0eef5edab2312f5902d617d440936ee1d27e5e7df70"
    },
    {
      "path": "rule-packs/smnyl/smnyl-comisiones-vida.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1d10262bba2987c3c4c6d180cd61023e2da6ae765be63b7ca04a47b9520aeae1"
    },
    {
      "path": "rule-packs/smnyl/smnyl-command-center-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "078eedcbaa45222fcaa6bc9346db5990f9204b84ddacd0164a7ae94a9114e5ce"
    },
    {
      "path": "rule-packs/smnyl/smnyl-command-palette-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "65fabc3cfc5cc550111840e62bd1a85fa7ab9978bba148e48336f8f019cc0ad0"
    },
    {
      "path": "rule-packs/smnyl/smnyl-concursos-config.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2fe3f35fc133355d6b8e351cb9374d6b8aad8db7e97ec8c5f8a2d701fb02d108"
    },
    {
      "path": "rule-packs/smnyl/smnyl-concursos-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "04625914e3f46677c8567970ec08471d59d37112b6cf5db395259c774ec89aff"
    },
    {
      "path": "rule-packs/smnyl/smnyl-conteo-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a4f110164841890dfc9f00f130727b757c4e1660ec6198958718ebde43c65c37"
    },
    {
      "path": "rule-packs/smnyl/smnyl-cross-sell-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5e025deb545eb86a30d795e5be3deadbabe8b0ecd3a5b9a0e909b0e5889dc073"
    },
    {
      "path": "rule-packs/smnyl/smnyl-decision-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4e23a68ef5c6c29ffa302eddc000b9faffd511a0cd4b828003435f6eee59bc96"
    },
    {
      "path": "rule-packs/smnyl/smnyl-executive-dashboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4b64b42f1602826af040ec521d20af2aafc801e39d0f4ce5c5216960326f4992"
    },
    {
      "path": "rule-packs/smnyl/smnyl-followup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a2db89aaccbf6937300eefb67b9260c1ca5db9c230a79b54b004a49e6373de43"
    },
    {
      "path": "rule-packs/smnyl/smnyl-forecast-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "500d37beaef1226c1bb12ec6adb7ccb1bf4938f5b7ced2b42a64be704d7f1497"
    },
    {
      "path": "rule-packs/smnyl/smnyl-goals-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "df89c32165800109007fed1e57b79d8f1b49a255d4b5c5e657e4c332687acbfc"
    },
    {
      "path": "rule-packs/smnyl/smnyl-health-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4e395b248983be1e96ed3f2ce314e3d20f27df979c780a2c23cf08255ae5b976"
    },
    {
      "path": "rule-packs/smnyl/smnyl-insights-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a5cd20cd446cf717dff9533b7764874d3d46313b8cb005ee0e5b1a7f8dfa12f6"
    },
    {
      "path": "rule-packs/smnyl/smnyl-kpi-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "37e7f3c9445352a2215d125b21b7f237152670c71c242cda6880f825961051e9"
    },
    {
      "path": "rule-packs/smnyl/smnyl-leaderboard-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6f75c251043d66d4541f52d6a06da1d630ce78cd3c3f2d6a1e54b9ca072e19d3"
    },
    {
      "path": "rule-packs/smnyl/smnyl-neural-glow-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4099ec98bf2f118c8322452577c70167460894cfd6d1576a8906da429ffc077e"
    },
    {
      "path": "rule-packs/smnyl/smnyl-operating-system-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b494d1723841fadd41e917441fc3f5bb3bd25923a59e72eb4bcd7adcecb21b71"
    },
    {
      "path": "rule-packs/smnyl/smnyl-opportunity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "987cc6a5d56238742b9f014e8690fdc9b2ed3b15b4f143b1ede93ea94d144362"
    },
    {
      "path": "rule-packs/smnyl/smnyl-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f82975695204c7674a9579b9de00dbdadc6c20f2382edd1e267c53eb13c0eed0"
    },
    {
      "path": "rule-packs/smnyl/smnyl-persistencia-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3ebd70d8ca0e4ca7a22b655d842286bb6f8708a67cc8b41c9db10d3917fdb3fa"
    },
    {
      "path": "rule-packs/smnyl/smnyl-pipeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bb2f3aae0ffdccdbf02e21fd3f5687faea5579e48996160e1a0cfbcf7925df2b"
    },
    {
      "path": "rule-packs/smnyl/smnyl-prima-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e9aa953987b1da1c34ce8ac1d7633bf4228c40f2581158ba90ac1a409db4181c"
    },
    {
      "path": "rule-packs/smnyl/smnyl-produccion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1badbc9c07b35ad47e28e82b066be6fc17157c897831753c0c4a3f6bfd29f0bb"
    },
    {
      "path": "rule-packs/smnyl/smnyl-productividad-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0f5852a0f7c94010f2b9484d71b0fbce05dfaf62ebe8e7664026a034ab211336"
    },
    {
      "path": "rule-packs/smnyl/smnyl-productos-gmm.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "28a7b1855d5c3ebbd5a158a3f7c2cbe7d0a2a6fe197cdb8ea9d9d24f04869478"
    },
    {
      "path": "rule-packs/smnyl/smnyl-productos-vida.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "816b96c13d610099088faa93942bef07f81414c90d2a0b724c0229bfeecf1ef5"
    },
    {
      "path": "rule-packs/smnyl/smnyl-reminders-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ca41e9bd240823ba828c05faa10f28b0583fac7a9e4b1950db71bbcc704c8f8f"
    },
    {
      "path": "rule-packs/smnyl/smnyl-renovaciones-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1dc3ce2a93e046ecb16f9d6864f1c4d47862ccf9f428d461b4d6dcb8d26b45a0"
    },
    {
      "path": "rule-packs/smnyl/smnyl-retencion-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f1246b20ae8f9124c8f1ae44b9f007c9a828a59a9b5166c698fbc1b1b7ba8f2f"
    },
    {
      "path": "rule-packs/smnyl/smnyl-risk-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "24cf8e21235b550d5bcbe70565240cfa225ab10f188112be0a00d1b3169df488"
    },
    {
      "path": "rule-packs/smnyl/smnyl-streak-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8f34b3bfb622096e70e52761d4c290c97514d2fabf98d874f22d6bf5e2c8c476"
    },
    {
      "path": "rule-packs/smnyl/smnyl-time-block-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d4efdfe561ffa540b6df710732ba4114bcadbe75afb660ca32425a46754f9601"
    },
    {
      "path": "rule-packs/smnyl/smnyl-training-allowance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ed24ba37b6e366c914bd72fe34e9e9c189ca036a0e0127528c25916459e3fcb5"
    },
    {
      "path": "runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9230601442562ddc2e74a08f74a83eada2a4026856c6125f9caa8fd6a7278031"
    },
    {
      "path": "sales-coach-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e04272334d65a67edaeb1746685ce6ec2cda72316327a1ad8d500cbbcb307240"
    },
    {
      "path": "sales-context-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "917ec6c65d052186423e287664d9972a0787315e3a8be10024d60990e48f7923"
    },
    {
      "path": "sales-learning-event.entity.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c3c7401b7dd7a99ee0f11f38ad3789233b6d7479764dac9d5285123fb97b7919"
    },
    {
      "path": "schema-field-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5be0b60800a292978e922231eaa501cf12e7303b25e73536e56ca5f29a7c6a73"
    },
    {
      "path": "script-adaptation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c6bb0dd1487e6bf4c02fb7ff5614da2d11f15b2e3862aba1ecc6679709cc5986"
    },
    {
      "path": "scripts/runtime-module-graph-audit.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2d2e63968fdd003ce08cf9733fbc9f28816f48615b6a4550d75e9f983820925f"
    },
    {
      "path": "search-index-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d0f79a163d019b1b089d6ac71b99572a0b8e40c396ba09244c02ae68c47e47b2"
    },
    {
      "path": "search-quick-actions-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "37cd72e94a5b526475be67d752488fa550cfcbe38b818377d7408876e3229e27"
    },
    {
      "path": "search-ranking-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5a0ba5f1a271b304544cf6f3d272e5d849de24c9e6d950fd0eb0b63451fe0382"
    },
    {
      "path": "secure-storage.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5c0ff677a547a269711437536a8bcbb76943c8e7d167209746fd5d6726230639"
    },
    {
      "path": "seen-but-no-reply-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bee111137444e7df6f65c320259bc77a0d09be738f022bd8183d173aad8155b1"
    },
    {
      "path": "segu-beca-client-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "64903705a82adf8e456ec5bfde4f51a90a05900ac615f3687baabf937daa5a69"
    },
    {
      "path": "segu-beca-decision-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4a5ace9e1701b7542b33e7c2c2793cd0ea7a9611406e36c2f1fb7bb1bb52b3cd"
    },
    {
      "path": "segu-beca-education-comparison-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c6c44c83efca66b3251780e36586e55ad4182a96202cc58088c7caa477a40136"
    },
    {
      "path": "segu-beca-education-options-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ef91ffa8e2726db9296b8d6a46efc698f3c3f01ea88b930f0f7460a2343e4502"
    },
    {
      "path": "shared-banxico-edge-provider.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "97d26b9bc1db218531c1e105d558770414207a6bad8f556c6cd859200ef2d9e9"
    },
    {
      "path": "shared-banxico-rate-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cd89e984a70006ed63b2982baaec97679898b78be49b4f646714f7ab384b579e"
    },
    {
      "path": "shared-benefit-hierarchy-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e9cc16e66d201f4af8c86d178f7922ffcdd664a4295d79794b37d4b988cd45a5"
    },
    {
      "path": "shared-client-language-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "40fbc87db981e5dd7a775a6b4d1e001611b619671486c7fef4ce2484491e14a8"
    },
    {
      "path": "shared-clp-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f2e16f030c57bb95235eaf1ebf5aea8f975c6b2a9879de88b8b1ad3fb5dffca5"
    },
    {
      "path": "shared-currency-projection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "d5a5c49243deee71ef1432199ddd1ca6717a729f676779f33f82ecbcf7dda477"
    },
    {
      "path": "shared-decision-appendix-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "67d3541a1279a23c62eca87debb0de04235666376366b8a40694d21486153ca4"
    },
    {
      "path": "shared-decision-clarity-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "db5193d795e079315fe0abc03fa4a55c444f3c9f7f1f9585e84d97c9eeb49ba1"
    },
    {
      "path": "shared-decision-score-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "14b6231027af87de20293e7ee417668a51faba698a9f808ac7e2421ef739fe8b"
    },
    {
      "path": "shared-document-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1807f6c99bc9a416bdb4d9282c7c948de0785b6269160bc0eb4cde641377d77b"
    },
    {
      "path": "shared-education-paths-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e11842aed098db75dcf6abcfc9b5bbf33197e6f8af81cd83080fec2b0e8b5ae9"
    },
    {
      "path": "shared-financial-return-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4bd8a0bee7eb0a3cf6218124407188f7dc00527c14dd43f5a16cf5e64c344574"
    },
    {
      "path": "shared-human-financial-language-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0b065a587b876622a14e1f404c0ac146edd52ec76faa9dca5e0a68966a8fb5e1"
    },
    {
      "path": "shared-meaningful-numbers-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cd92f84324ecaddb713f64a2fd4529cd95ae7dc1f54d66b9d82e64d8989d2259"
    },
    {
      "path": "shared-mxn-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a3008f9b5d8f7dd227ec769283e542c61c683535d94537e4eb0701b2bab5bdc8"
    },
    {
      "path": "shared-objection-shield-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1106d54f56e8b94e4437afb57048ce79cb6d6b78d9538c63f3fadb8f628d3d39"
    },
    {
      "path": "shared-policy-currency-timeline-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0bc5f1ed47a0cfe4bdf5eae08bac84a446e2a8acbedc8e6eef545ca98f9761b8"
    },
    {
      "path": "shared-premium-growth-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a0035db99cf34f4e8c37e0b9787527d3b7aa850854f63c4dc47b84e86d43a01c"
    },
    {
      "path": "shared-price-placement-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "14c9adeb3789776456cad94b62a9a9c8bba3db35d9e37d9da29a5ffe931563cf"
    },
    {
      "path": "shared-projection-scenarios-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ae077732850742914d386b10cfbca36b4e1e676d99d4704236269dce24caee71"
    },
    {
      "path": "shared-protection-efficiency-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e9e446d79a368fdd777b413886d3b28ca0da5cb041505c76cfb7fb67c45a3c2b"
    },
    {
      "path": "shared-recovery-analysis-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "14afbe9e0a6f2fa6baef90eec2cf259c22e302bd22c69b5069b027ac17f92a4b"
    },
    {
      "path": "shared-tax-profile-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "a8cddb60af343957b4f8e30c6bf813756fcbfb66a46e2396b2a899b38ca361fd"
    },
    {
      "path": "shared/contact-channel.constants.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4e6e685f622ec7d05e16c07f3b3ac8ba47e517a78adf52566f95bcfc9aaa6052"
    },
    {
      "path": "shared/design-tokens.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "efdcb4d6973cb35d976d31fdfd57d131df0274366e86cbf4134be0ce865bc6c3"
    },
    {
      "path": "shared/motion-principles.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b9523048760d1ccbadf29b58d7d9337f5154992d4adc279dd185c1b75c405c66"
    },
    {
      "path": "shared/operational-colors.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "78bc126f29849c505856219ef29472e970428009e4ada5691ccba4b51be17039"
    },
    {
      "path": "smart-agenda-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "18e04807f90f2812aecb5dfa9b4e5f7159cfe84b0d2263ab21c0c4bdcd763cd0"
    },
    {
      "path": "smart-field-detection-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "cccfe17f8f751e20bf9bc33920966fd98d83240ae5d705bd64cef895ecae7193"
    },
    {
      "path": "smart-header.tsx",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "92acc557f8e36d0c209c469b00ccbf5b9a6a2e6e905d37a55ef2c75fd4de84ec"
    },
    {
      "path": "smart-outreach-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3c6ad9455b742c9811fa9dbc3b3086b0206b51f56db1b4e5cf526aee5db19312"
    },
    {
      "path": "smart-priority-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "49ea3b93dae9422b800db9d4deacde4931aadb60d5917369b115781335599e01"
    },
    {
      "path": "smart-referrals-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bfed633f1706d75ad09a5a5e0c00e623fd12cdc67d5c1b017dd0accc2daedce5"
    },
    {
      "path": "src/intelligence/alpha-runtime/action-ownership-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1266f85b481d1ee7e02c64ca85c61eb27196bbd1f4aee4961c4e4ce4ad703321"
    },
    {
      "path": "src/intelligence/alpha-runtime/event-ledger.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bd2ddb22c488a5256419730bfa22474d5a5d1441899ce6d133e0c3b143ca08c2"
    },
    {
      "path": "src/intelligence/alpha-runtime/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "047281b89015fa784b493fab4626f2cdda60ea3f9bb6a72986eef63e07556fcf"
    },
    {
      "path": "src/intelligence/alpha-runtime/process-advancement-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b9666ee85dcc5df2945c08fe57c25b25b456a0ae1f8a833201faeb9de7d46509"
    },
    {
      "path": "src/intelligence/alpha-runtime/waiting-state-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "956349069b1219aeb9722bdf0f0a973ed52d0611609dad6a45b8c8024121846f"
    },
    {
      "path": "src/intelligence/claimability/claim-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "4ca7929e1842bf1de55ab51876b9a86b8452722eb3c70b55746dbf4290c503d9"
    },
    {
      "path": "src/intelligence/claimability/claimability-filter.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8fbb6551b311d12cdeb59b46552f571980da18a69b43555bf447db189a14f25e"
    },
    {
      "path": "src/intelligence/claimability/claimability-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "418d7b0f13a086c95f3090e5729032432b8845aba76217ab5766584d6a619a04"
    },
    {
      "path": "src/intelligence/claimability/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "31b58b9371861de238d6383cdad9acbc89dd0244e632e29ad3577d4dafe29b6e"
    },
    {
      "path": "src/intelligence/hdl/interpretation-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "43bbff9006e5c95bbf2e3d2bed42274323141a6b6c15611148f9540bc0fa5d2e"
    },
    {
      "path": "src/intelligence/ledger/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b3af8187b6034d3842011796ab2e1ecacced185549abb07c7f4a2a74dc708c61"
    },
    {
      "path": "src/intelligence/ledger/ledger-entry.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7200b710d5f745bdb65f2f5bd216d6d8c6df0dbbca29806f0d089922332e35c6"
    },
    {
      "path": "src/intelligence/ledger/ledger-status.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "faea671c5c78e06b80b12d1bc31b6b72ee47eb9b67d8ea9daeb62546632ac269"
    },
    {
      "path": "src/intelligence/ledger/ledger-truth.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1a0828b06d2ff203f073503b2a3117ab0cb84eea98b7ac77766c138dcacae098"
    },
    {
      "path": "src/intelligence/ledger/truth-archive.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0c63ecb870383e44fbf7d4c84999bb91625016de9ba4beb6f0d657888cc82109"
    },
    {
      "path": "src/intelligence/phase-zero-blueprint-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "b35926c8e07a3def1f3eb1bf3401ee9814862a322b13c6cc7733957fa5cba305"
    },
    {
      "path": "src/intelligence/process/process-advancement-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2b93d3fc025a38021412543f5827bd87c56fdb0bba2f6e8758e2e432f5622856"
    },
    {
      "path": "src/intelligence/process/process-advancement-rules.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "7b5d0dae4fcae8a635bbad4b2c84d85e353a25263ad98b61e45980d6ba0276ce"
    },
    {
      "path": "src/intelligence/process/process-advancement-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "131528735bd8ca7f89a9873925c17a0cc44390eee0ed07da8434ec95cff79026"
    },
    {
      "path": "src/intelligence/semantic-guardrails/human-acceptance-gate.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "1297ccb9941b6aab8f1ba12ba066631ffe70d357a9ef940c040e65b36f2b3793"
    },
    {
      "path": "src/intelligence/truth-resolution/conflict-types.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "071f02c1bfb5142bcf689675cdd603fd8ed591fe6c95d960af4ae02342d1a240"
    },
    {
      "path": "src/intelligence/truth-resolution/index.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c52f623b33c80fd1a7b5b610b9fed18814a811b7ae9b24babfdfc7bef32cdd49"
    },
    {
      "path": "src/intelligence/truth-resolution/truth-candidate-resolver.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "500bc4ff410720ec26661664d1cf2e2ae017f7ba2c9abc42c962363de79b345e"
    },
    {
      "path": "src/intelligence/truth-resolution/truth-resolution-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "c1aea843df56d72340451fcf59b8d451c430cd192de6976d3b123046a35bf1f4"
    },
    {
      "path": "src/intelligence/truth-resolution/truth-resolution-result.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f6262dc0573592d78c89e716ce3393c40be5601eb80feb5655a3e2cca95bb4b5"
    },
    {
      "path": "src/intelligence/truth-resolution/truth-status.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "60a44dc7b1d3aa319110de08ab0eec2215db7cd77aeeffde4262e0ada36827fb"
    },
    {
      "path": "src/services/forge-alpha-repository.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "5b72476d8b0e3faa634c5064a3ebcd635cee6891249116810f75e598c4f29911"
    },
    {
      "path": "staging-cleanup-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "bb056bc8c2ecc108dd3c2aa126194f1bb2fffb1e71be5b36a1e454f458029a94"
    },
    {
      "path": "staging-review-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2c4946f8cc9c444cd7bdbb15258ebace4419420dad54bddcb2096a7028e40013"
    },
    {
      "path": "state-manager.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "097d9e7d4d2e0be42f251b636ac6aa0f79e467e6c9b406a2ddbdf74237786373"
    },
    {
      "path": "storage-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "6bf19015427085cd3d901126e4538e5e87dd356671c372b6ec5c9a3286dd8647"
    },
    {
      "path": "storage-queue.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "974f1781b0542ae7d1863e9e857fa1298045cc5d598a301504e29da1c4511be3"
    },
    {
      "path": "storage-validator.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9c0dfb622c7685b608c4c5401665f0a6ef259ba73d3d5c2145bbaf5e830a9656"
    },
    {
      "path": "store.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "ffc8f2870c344d77e46124c0b01a64d43ff266cae96d278db1639c5b1328c17f"
    },
    {
      "path": "supabase-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "9142f8dfbd6cb2bede2ef7d391fd5c7dc554c4716540b993b3f12d223c84a6c5"
    },
    {
      "path": "telemetry.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "75089ac1f42a15b9346df40d304d8f6d564fd6d963242656f700afb706384c0b"
    },
    {
      "path": "tone-performance-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "3e9938fa82014aa2632130b15f75548301f13aa9b6bf5968000ee735a077ab65"
    },
    {
      "path": "tone-profile-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "e4345bf1c20df4b7e1d37b0317547daaf503559881527875276c313ab61b5960"
    },
    {
      "path": "ui-render-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f4a9c19b341e9a756245f384bba38e00b36fbb86a45f041474e3493ba2cb00b9"
    },
    {
      "path": "universal-command-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "885d8fb1cea3ab5d42adc504c8a659dc2d1ccd878b0d3d86b1597fa0065c233c"
    },
    {
      "path": "universal-filters-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "629d02bdc31507c089438710b42612d2154ef6b03d5f1c244833f19413c1d909"
    },
    {
      "path": "universal-search-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "2eed114677f543769363f1c6df324ee2fb6d962bbf8e1deea3fc3af903b6db85"
    },
    {
      "path": "utils.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "96e453328e5603005f2f00e51d248cea9e5e34ef6f7a24df0c653d59abc35662"
    },
    {
      "path": "vida-mujer-client-presentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "10f0e70f639aba487d0b6e9a42f35c015e86a8fbcb170f8c7ea37de27625f913"
    },
    {
      "path": "vida-mujer-protected-diseases-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "66c3675820278510ef68a7073fbe3bb05381354c8791966557cd6c64492c8218"
    },
    {
      "path": "virtual-list-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "02ddccc0af39ac900e577aac87ccba5bf3a4e441a199c99f8881d4c690d21a4e"
    },
    {
      "path": "virtual-list.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "513653e4518bb0ad05c859c2a81640ab9ce778fac205fdd85b1aa6beeadb75d2"
    },
    {
      "path": "visibility-runtime.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "f6e683c97fc9babb733a610ed804240cf3569218ca25f794baceaa764d8c27a9"
    },
    {
      "path": "warm-market-segmentation-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "8528ec86b38ce2d6c7a97074b03d7784dc3e86bd127eb2a7eb90209a0a00ab47"
    },
    {
      "path": "whatsapp-action-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "841ed3db197d5ad60d3a8b4552c5e93e4a8216c2d7b1046475b4a226c09dc053"
    },
    {
      "path": "whatsapp-link-engine.js",
      "score": 5,
      "reasons": [
        "exported_module"
      ],
      "sha256": "0eb0e392a2247fcfbe4671dd66a3311e45f4af06e7fad5cb5794552a39117c4b"
    }
  ],
  "adapter": [
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
      "score": 195,
      "reasons": [
        "preferred_previously_proven_path",
        "quote_preview_adapter_path",
        "product_intelligence_integration",
        "known_adapter_phase",
        "adapter_path"
      ],
      "sha256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
      "score": 60,
      "reasons": [
        "quote_preview_adapter_path",
        "product_intelligence_integration",
        "adapter_path"
      ],
      "sha256": "91dd81c82799e03ff83522fd974ee19071048d529860fb2c0d21a545346f6bd7"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "073951b0dba2b11c96445f03bd4c7196c248cb7f3b75b94a7d5eaf6eaad74670"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "ed1cc6632bcbfdaaa38e6400e2e307d523b3dfcd3ac53aac4721dc455471353f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "3672e0049a44992d6ee0168b11d2dd76b93ef77861f06cf6189b459a2c6c8e08"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "ea071a57362f2c105332545c0c50715bc6c1d1a4496ac0de8be40fffc5f26462"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "efd73bd8d6fc056b34048da0cd6586b0215a27012edf731e9981bd2b182768ce"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "55de29e93dc766c61790544663b6b4ba3b038f05892d5758bcc1e75a7bd513d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "28ebb55e65b766fc99c92f1eec7856eb20585eb9278d4f4ce2a1873338841818"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "3ce4edd0c289d3c9566c2ab4b9e979c243f16a0c4a24834fd7895674442102d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "d279bea1728557e628ebc1faeb800be1c2e9f3c17bf0b445096febcea740908f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "f72934ffbd187425a8de51753ae8c1cad980eeb1c67e5cdd23cabce99c33b2b5"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "9128bf5ddb4b80b9c7863a31f3af78e22f27d33c47a0d6f0311250fae8043c67"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "6e744762a2173754d81b4bf3a87074afda8ab1915e44cfae6ca5161dbd603f4c"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "b81886926505ee34b5ff3fd4d2b66fc054f65ef75d360db1b830f0a9d72bbba1"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "1e5465c7f4db866e0f57fd7fe4fd7e0bb1ac2ddbb425e616f15f048a8173a628"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js",
      "score": 45,
      "reasons": [
        "quote_preview_adapter_path",
        "adapter_path"
      ],
      "sha256": "13060f39935b5677dda547934cf41cc7a276a4c8e33cebabb47b90aa0458dd06"
    },
    {
      "path": "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
      "score": 25,
      "reasons": [
        "product_intelligence_integration",
        "adapter_path"
      ],
      "sha256": "44b44f3a284a1ec00e48f3a278dc6256038d3f984695af4d9424a6eca0ef5738"
    },
    {
      "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014"
    },
    {
      "path": "product-intelligence/evidence/gmm-quote-parser.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "c20a1d9ee10ef349a86db73bed1c28f1e2ba36534736058fda3e4f3e74161937"
    },
    {
      "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "03715ebbad73e261727a8b45239184ec7d95a69ebda551e908c086c35c50b7f3"
    },
    {
      "path": "product-intelligence/evidence/vida-mujer-knowledge-extractor-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "ef9ece00d6b0726a34c7d2c63062a0c2059e1b2c1b42c7c0435a084a7eca85a8"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-confidence-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "c9c11a1e37f4bf5dc4c25c1588c692c8a86cb169dad323bebe4cd4758a6e3db4"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-confidence-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "186a87a3dfdef145aefc94d28d4f8d2925131af96af2d5f580c3ddb788716060"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-death-benefit-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "e259ab5f68732a36d354d315825017bfb91ba5e04ff749e5626aaeb13290f6f1"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-death-benefit-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "dca5f882af8608273cd790a4ca186622fc938d421f7400fee6fece817d0517de"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-eligibility-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "8b7ecf72f12c914368aa52f97b422c803d7d63f4f4f2b2b88e1122d3e74d254a"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-growth-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "2c1a08b3ec6f07db90d6ea52bcd6b2d809692053f9bf0df4e6ef8ee3a930dc5c"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-growth-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "6d36055cda5def3a29cd5f8f51f22f9ebb7d138d60694d1ae6bee36123b300a2"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "04d70a24ee62fae8db5986f7292adcfb65a0062732bba181840ee41eef2894cf"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "0925fd31ab05a35d03dca24579f2add614901fdd964ab61271da73301dfad660"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-rescue-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "55652ac7246025a02691e42980aa88e21e3d452213fd9d3627c3fc949b5e3cb7"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-rescue-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "aa9c49ef0dec8bc9bc16b82f3ff304a2cd3c8ca29d096baa22e5516934da4966"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-type-inference-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "6e6f3bf8f26c9e48cafb71fa0b391e906d281f07fb116728fe8ec226bc1e3b02"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-type-inference-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "0966b5e96842e1f6cac6ca2aaaf6d8b529fe684143c4da6c01c15d554cc618eb"
    },
    {
      "path": "product-intelligence/knowledge/discovery-product-alignment-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "b73c02382f09be5c465982a2e813904f59e5719ae16bd4ef1c1c6fa639b0c7d5"
    },
    {
      "path": "product-intelligence/knowledge/imagina-ser-contribution-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "2c40b45a24d7cbfc0d0d05c09894868f45bd1d713dd1cb96fb8996f52649c9ee"
    },
    {
      "path": "product-intelligence/knowledge/imagina-ser-human-language-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "8df45ac1693d9639ca213ebb3851f811ae838443d9dc109749e90849e6f139b2"
    },
    {
      "path": "product-intelligence/knowledge/product-schema-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "075852ad4456e54c2546a7211cac4b5dedc679825b1936fcf8bab1405b2c7c76"
    },
    {
      "path": "product-intelligence/knowledge/shared-education-cost-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "c3a0410a7d22e9f4210c5f8d200a300c3433f99664f2f50d8ca9bcf5c45f0c26"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-client-explanation-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "e7b306d2f17717ae1288f9950e258a6e4f6f08a14a165faf94973e12d334bfe5"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-pdf-intake-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "72354a396d80558941f4df2f8aee648957b41932972b61f694b58f959720cccb"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "0cac862db1344d5c97dbe5c60bfab07bf659bd7e95601044da0260203bb9ad19"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "cbb41b22e0cf559c8fa50bb2f19bf2d801c4a11c056477bce8e7ed99af1e9cb3"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-priority-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "a8b48c032175d6cb4c8205ec838c475673553fa1abdca5994677cd59d3f5a0e2"
    },
    {
      "path": "product-intelligence/projections/financial-pyramid-story-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "67787387d1d89f68a9b801a0ce42f63d3268fafc7963c9452c92f701c39c1407"
    },
    {
      "path": "product-intelligence/projections/financial-risk-score-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "5a3dd094c4f98fb339f0df54ee47bcb293c221aec61d6b550f9a6674504c26cc"
    },
    {
      "path": "product-intelligence/projections/life-expectancy-projection-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "68490992314aa4599cfa12f7634fa16d6078f773befc444918e5ff8dfe147b7c"
    },
    {
      "path": "product-intelligence/projections/projection-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "d1189846a2f1ee4c0cc1679522fea89b94afcfe4a229c9a8687d4bc44d500897"
    },
    {
      "path": "product-intelligence/projections/projection-milestone-engine.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "eb4a4e0059ab7d9bea3f901688ea4be8aaaab330ef930755e2476d4a5deb0eed"
    },
    {
      "path": "product-intelligence/quotes/quotation-extraction-result.entity.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "c19b213338a744c5287cb4ffbf1bb09833bf5716873a56ada227b3afcd9c7290"
    },
    {
      "path": "product-intelligence/quotes/quotation-input.entity.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
      "path": "product-intelligence/rules/vida-mujer-rule-consistency-report.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "618566db7b24d7385e7b500e6e0a05f6980631260e8d78112eb8d4c633b6c3ad"
    },
    {
      "path": "product-intelligence/rules/vida-mujer-status.js",
      "score": 15,
      "reasons": [
        "product_intelligence_integration"
      ],
      "sha256": "4b4e5f2acfb548b2aeaa9ebb5844c3d235f6f0215b9bb266fcd417f90a1bb86d"
    },
    {
      "path": "compensation/partner-manager/partner-spreadsheet-monthly-fact-adapter.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "fe5e50182f46949f895fd71536c59ef17659814138c2d7948cd9f692e29c7a8c"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-local-read-model-source-adapter-060i.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "4fcca229a0ab468f1a5c06854d2abf9bb7c5f7d0a7b0f926d5855c8461eec740"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "5b4cfa8c7ac63c507ffc843c3c42cf4a161a63c44e48ac873f395ec3af8ef26e"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "d11ad9f9e07100d068977ca687557ec03698ed5dcca7b12026a7810d3e9b0214"
    },
    {
      "path": "legacy/crmaddlife/comisiones-adapter.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "4f0f1d7cb1164f67a419ed0d1febf4e277d7de0cf00f720b814b7aa23387e77a"
    },
    {
      "path": "manager-os/delivery/delivery-adapter-boundary-contract.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "0320d9edca5f2f6ce2e35b0ec48ec5da7b3724b8aaf593e62b97b4c0790cc4c6"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-real-adapter-wiring.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "b267719f72b04e36f07f1261cedd09aa9f07ab65b29a1ebbe7034aca7da9b040"
    },
    {
      "path": "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "0a265e954295afa5f34e72014df66453ffd0f9ca172cb0c128685ac0ec18891d"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-model-normalizer-067d.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "b69e7948a66de99827a84be8994a753d83a66ab915b3fe469ba0dc97416b711e"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "0659f1d84b3063b008847a62022b4b0d9d681cf8190e95fcc5f2bdc4439ad006"
    },
    {
      "path": "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "c7fb86aa238830df11eecb840301b13360eee9451690852a88503ce7e869c929"
    },
    {
      "path": "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "6f91db75c769208f33491579b37c83bfd1f114d2ab5442bc56df82b7d51110af"
    },
    {
      "path": "revenue/adapters/not-modeled-carrier-adapter.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "1d2d0cf2076e8f25689af38580e5f3c18622e3b98d9be39016fdf22d4a90e4a2"
    },
    {
      "path": "revenue/adapters/smnyl-revenue-adapter.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "3cc352c3259ff409487497768cf4782ea584e02c3bd0630e3b7cc7b9a61b784a"
    },
    {
      "path": "revenue/carrier-revenue-adapter-contract.js",
      "score": 10,
      "reasons": [
        "adapter_path"
      ],
      "sha256": "40f620388491e4915124908ddd64c730fdb2a79527de9a80e0aa4da0dc1e8da9"
    }
  ],
  "modal": [
    {
      "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js",
      "score": 200,
      "reasons": [
        "preferred_previously_proven_modal",
        "confirmation_modal_path",
        "modal_api",
        "extraction_ready_event"
      ],
      "sha256": "0d39d0ac1ecc823b1888d01c1386f58cbb6945544756aae27989bf62100749d4"
    },
    {
      "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.css",
      "score": 35,
      "reasons": [
        "confirmation_modal_path"
      ],
      "sha256": "f3e0eb4683d5b1758b698dfbce18bb0ce14398604689c5e126477b643b12ede3"
    }
  ],
  "store": [
    {
      "path": "dashboard.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "abd0030f6664760fa315a4a4f4652047bdc015674d82c56dd79dbc500cf357f7"
    },
    {
      "path": "exchange-rate-cache-engine.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "3d39d918cf09d945e20d1690103f310fb34cd175bfaeaa2ae48a8fcdd82faae5"
    },
    {
      "path": "forge-schema-reporter.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "51992061bf2fe55559569141d668367b973784ef365f694f9c8eda95d2bce0ac"
    },
    {
      "path": "legacy/crmaddlife/ui-listeners.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "47f49716a8878eae07105abe2b73ab30e1e50bf61945c2aa59988f35f7a1c82d"
    },
    {
      "path": "manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "62c7cd1b03e187feb8856b56d98ef4a447ee84a6aa8395a9274207d59490787d"
    },
    {
      "path": "nash-memory-engine.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "ef000f6861de21aa528e569894e3ca9754e43acf4b2f188b9b3ae47f0707b305"
    },
    {
      "path": "policy-operations/policy-detail/policy-auto-save-engine.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "8960940f84bdb3377990683895cb93929371be3dbf93dee3c6319502576551ee"
    },
    {
      "path": "prospeccion.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "4cae2c44153225cbaca0d455d413d0f8b237cbe4309358d52ee747e309043db7"
    },
    {
      "path": "referidos.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "f018cdcfa4f647ae8a5bcc65c75e95b9974ec830809881ccd2c771a040fd371c"
    },
    {
      "path": "scripts/repo-doc-migration-harness.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "d4c13bff3c40b376aa2ebf955757d3074b2a8c8c389e716d5d77fcc578edc41d"
    },
    {
      "path": "scripts/runtime-module-graph-audit.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2d2e63968fdd003ce08cf9733fbc9f28816f48615b6a4550d75e9f983820925f"
    },
    {
      "path": "scripts/test-repo-migration-harness.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "ea12821747c2978fbca75ad3188c308e87f5def7cf1353a44304ce1c11f13dd4"
    },
    {
      "path": "secure-storage.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "5c0ff677a547a269711437536a8bcbb76943c8e7d167209746fd5d6726230639"
    },
    {
      "path": "storage-engine.js",
      "score": 40,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "6bf19015427085cd3d901126e4538e5e87dd356671c372b6ec5c9a3286dd8647"
    },
    {
      "path": "app.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "cca131c8950a6abd411497ece350771e6f6dc6399e0e420b18e07edeaee73048"
    },
    {
      "path": "fixture-validation-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "2a85754c3384c8dc2ac961e238dd913dadef05422036f82bc0077323f2a9d268"
    },
    {
      "path": "forge-master-acceptance-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "2cfecafbce61a58352d585bd25463152ec449eed158dc1ec4ad64e088e9a7101"
    },
    {
      "path": "forge-semantic-risk-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "fb5ecf6fdcbf6a1f74d5e975cd78ea275c09a07ba96d559bda51b49f80e71db1"
    },
    {
      "path": "imagina-ser-ocr-extractor.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "e6662d8fff0b2783470061e48039b1dc7c9af5db287f7059639e5252cf3ff123"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-query-plan-contract.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation"
      ],
      "sha256": "001e431ba1e7e53373418c57930b0ec3ae30068735f950d9e2dca33f694f158c"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-storage-boundary-contract.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "writer_operation"
      ],
      "sha256": "5decce8a507e3271d43a7e88ac826a83362daa4f9dde77f9e8815bb56d8bb3ef"
    },
    {
      "path": "market-evidence-fixture-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "ee69f5ee60539bcf3ba953461949f918abba9dbfd1e1e2ecf20dd6a84f97e75c"
    },
    {
      "path": "nash-learning-engine.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "20965fb26e5339d1bf39c13d079c2ae6ebb9969709532832c6ed79be657c12ac"
    },
    {
      "path": "nash-master-acceptance-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "16035fdfa857ff598fbe1ebb7aeab6b8b8ad2eb5c51df296c593dca82cfa882b"
    },
    {
      "path": "nash-memory-master-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "f8900c9563b59afcf63c22c2665c0affe8eb65fa2474032ac9d105ca0ea19b5d"
    },
    {
      "path": "orvi-ocr-extractor.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "261f4984d5e117b0c93f64c44a6bf60789c0ae315473c688874aab7079876cc6"
    },
    {
      "path": "precontract-activity-fixture-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "094de6a8445ee60958a519685d65ae9a66bae92d3c9ac4112db69746af8ab1b6"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-client-explanation-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "e7b306d2f17717ae1288f9950e258a6e4f6f08a14a165faf94973e12d334bfe5"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-pdf-intake-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "72354a396d80558941f4df2f8aee648957b41932972b61f694b58f959720cccb"
    },
    {
      "path": "product-intelligence/rules/vida-mujer-rule-consistency-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "618566db7b24d7385e7b500e6e0a05f6980631260e8d78112eb8d4c633b6c3ad"
    },
    {
      "path": "segu-beca-master-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "90c080b5247979748cd10e62fdf4ea947ac339b1d88556c714c036e8cee781bf"
    },
    {
      "path": "segu-beca-mxn-appendix-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "5a8cfc387680bbddebf76c58e57cbb9a3cbc8856f6caf37b4333b45c9fea9a9f"
    },
    {
      "path": "segu-beca-mxn-timeline-clean-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "73b59038f130598e92bc536f1bc091e96a642ca6f0dabca9145dbe0d218ce5ef"
    },
    {
      "path": "segu-beca-ocr-intake-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "7e1f3fa217bb0381d6dcd1c98ab5da44ca6f4ebc8e2e9deb4247044dd922c701"
    },
    {
      "path": "vida-mujer-knowledge-extractor.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "ae341a2c1ecbce9e29f984b6cd24740707a423bde817c6aa83497794c95d548a"
    },
    {
      "path": "vida-mujer-master-test.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "7454c4b1a6b606e55776ae1940ee0b47924835ba2b84946cc181e94db4a66036"
    },
    {
      "path": "vida-mujer-pdf-ave-integration-report.js",
      "score": 30,
      "reasons": [
        "local_persistence_primitive",
        "reader_operation"
      ],
      "sha256": "790685de4f8305f1aa1e4b299c0d629b90413db608bab1e06abaf3e290229c8b"
    },
    {
      "path": "actividad.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2c68d08c4c67384b37ad9c59c026a3f5a2369a4abdf7dd7918ad86573d2f9aee"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-career-chain-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0bd4de374b5fe370468008e3d1b4203f78ae1c604723cfc5e1588a5112c21dac"
    },
    {
      "path": "advisor-os/followup/followup-next-date-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "48b434b06a2ed9ea12a1bc7d95440774f55e16054cacd6be33cfe2affa3dfb93"
    },
    {
      "path": "ai-service.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0b54ae4f53c91c48e453ba51f96a3d9960963db4c293dedcc0ec47403d9f2b3f"
    },
    {
      "path": "base-repository.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "c38283fa5dcd8b133c6158b095b8adb5cb199b98d401fc7055ba6b3017b6addc"
    },
    {
      "path": "cache-runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "c179a2308ef3c91cfc48094d8013dba51147a5703b9f48be25e5590230a692ba"
    },
    {
      "path": "cartera-repository.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "d0fefb3a8b3e1ad800c33629a9543b1735d7d305b194d0dc062a8e3a9670a30a"
    },
    {
      "path": "cartera-service.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "37c104e6199b5dab97b4569c6c90f2056592b694e4fb0c97d9c856b24e3f91a1"
    },
    {
      "path": "cartera-view.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "c2a096a08006ffe78b0e12dc0e3224fa295d9fd889b962e572b708fd3a31182c"
    },
    {
      "path": "cartera.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "5944eccf68c74294a6256b68ffb7afe4468eb2b92224a995a5dd1e7518745642"
    },
    {
      "path": "client-engagement-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "5b8542ada66fce52c7719e35c338cb777619da06c80c85818144dd4455d63bc7"
    },
    {
      "path": "comisiones.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e162a1116fc8adfd7ca65bccba5b00ce35e4668096d932650f197b830fd07204"
    },
    {
      "path": "compensation/advisor-development/advisor-development-counting-weighting-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "98dad5b16a0631e3a944be3d55fa49e315955963b0a56d7780a3797a32086d51"
    },
    {
      "path": "compensation/advisor-development/advisor-development-rule-pack-validator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9d5c40f9882dd7183fe2e3b0835186ec55beeab714056b96705c9c0facad4308"
    },
    {
      "path": "compensation/new-professional/new-professional-development-bonus-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2f87ac524bf0eaa33edfcc908ee547494b62fad74e9faaaf90e3865e0d89c18f"
    },
    {
      "path": "compensation/partner-manager/advisor-economic-output-period.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "14b4e5d7b45182cbc073440023f47ec2764e9f2b1774fe54b2ab41102222b012"
    },
    {
      "path": "compensation/partner-manager/partner-2026-rule-pack-loader.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b7a51301c41efff287558082b36cc6426bbb6a8a1afcedd3c62ea3481506bf09"
    },
    {
      "path": "compensation/partner-manager/partner-advisor-qualification-explainability-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "66255badd12f96c41a7d62b9a43a095ffa685d5eb9cf6229b4e1e58a74b54072"
    },
    {
      "path": "compensation/partner-manager/partner-alta-partner-bonus-calculator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1a05f7cddce0bab0f64aab5d9ddb0c286fb60c5b5d01b0d41d48af1905a18f4f"
    },
    {
      "path": "compensation/partner-manager/partner-monthly-cashflow-projection-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b316ea56dd506d8b81217701cec9cb4183524fb6b8245c1d00eb5f5e561751eb"
    },
    {
      "path": "compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "d004a5a8fb2eb6ba41f14ff0922e36bbffae903fca67df7320dbabd71b2d3c87"
    },
    {
      "path": "compensation/partner-manager/partner-payment-cadence-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "358b0a3fb58ce20c179babaf04248890afc0e20cc46d0904c9f928a03bdce7e4"
    },
    {
      "path": "compensation/partner-manager/partner-payment-distribution-rule-pack-validator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "14981f7b84058eef616079bad2d989266a73adf77f953d8905f1fd77e94416fe"
    },
    {
      "path": "compensation/partner-manager/partner-quarterly-bonus-calculator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "91cdb630fecfc3e92f0d8dc05822005e584c235ef5dad45961dd3a8a939450ae"
    },
    {
      "path": "compensation/partner-manager/partner-support-requirement-gate.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "a95c3e1b418bf67f006027dce8897415e843278101a4118c12eefdf387ec09bb"
    },
    {
      "path": "compensation/partner-manager/qualified-advisor-economic-status.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1067acbeeb8d820e6ba1b9ab45fc6e3246420913e35c0dd1c353c854d8f08c90"
    },
    {
      "path": "core-event-bus.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9bfff02fbcca2a5d6d0ab04f1cbc415998b975f98a1f484ddaf7195802380839"
    },
    {
      "path": "db.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "a38f22e0c9fb0a7353b8295fe762bd11feed048905f877cb146c2ecbcfb5fc2c"
    },
    {
      "path": "design-system-preview.html",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "dd08737a2b27df586b75227750b91521bcd9923f38e2e00a577335be1b633717"
    },
    {
      "path": "domain-runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "82ea49b41768ef9cf31f7da64611eb6ec4d4c52eaa0c26325e70e74b7673f31a"
    },
    {
      "path": "domain-store.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b69eb8318f7f500a2c4bbf363930c3e23b05b53c336a35d50e860284744cb696"
    },
    {
      "path": "event-system.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9aeb1c249f15d23dd0daa2f206df3939d87a58e302531c7940a990958f4fbf90"
    },
    {
      "path": "legacy/crmaddlife/chat-shell.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1c8fd555a002c551fd997483825761c46e41d4f42632bc2b50f5410e5e222934"
    },
    {
      "path": "life-event-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1101b6a15fcd7232630e779a3c81c9c26faa32e41353b7ec32a30d45163f8bb8"
    },
    {
      "path": "manager-os/advisor-signals/manager-advisor-signal-consumer-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "d4bc16c25196350473b0502bdd0fa6353a87b306571f442388a4fff45f18d4b4"
    },
    {
      "path": "manager-os/advisor-snapshots/advisor-manager-snapshot-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "25b440668dea4c64a63e49210ea3f5e02c24bc7285e50c5bcfdb28b8cca420a0"
    },
    {
      "path": "manager-os/advisor-tracking/manager-advisor-tracking-boundary-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "ca17502926a1547269e14f91807d89df230a7b869ff95aa9c29fc79871cae185"
    },
    {
      "path": "manager-os/alfred-review-action-packet-read-model.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "3d99f152f74cc96b69c321c053436e0bf9a0d7a26c76bfc66e1d8ce57acefe89"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-dom-renderer.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2882aa61b4e0c0cc012f0f542ce59ca1081f3e6c060a4f86ce68f5680486b3dc"
    },
    {
      "path": "manager-os/alfred-universal-command-memory-read-model.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e4f89af87453500ba41cd2a1ee114aba0c5a8ccf035ae8c5ab82db1d2e7c52e7"
    },
    {
      "path": "manager-os/audit-persistence/audit-persistence-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e6422724df4e8e40cb70b5ed031cd2245a6d12d3c5693e7ba618eb7d12bdff8c"
    },
    {
      "path": "manager-os/canonical-truth-registry/canonical-truth-registry-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b3dbbad7016a78b2e7d0b8ac3b71f39d9eee0b43a96e09b10e50a395e9e2113e"
    },
    {
      "path": "manager-os/connector-execution/connector-execution-gate-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "5366b7bc3e41746ab865659368f22196108add3e8ff0a8f476a4e96cc338f40f"
    },
    {
      "path": "manager-os/connector-executor/connector-executor-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "ef6b078ff34c31fd00b5cf89879fabb9c71e2b2d76bcd8ad00eb2693770d3729"
    },
    {
      "path": "manager-os/delivery/delivery-adapter-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0320d9edca5f2f6ce2e35b0ec48ec5da7b3724b8aaf593e62b97b4c0790cc4c6"
    },
    {
      "path": "manager-os/external-dispatch/external-dispatch-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "69e0d99f8e5f908a119a247e51f9b865e413366dd3dcbcdbcddd9573afdef491"
    },
    {
      "path": "manager-os/forge-alive-shell/forge-alive-shell-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "81b26b3d0b8f6c23da4a9a202994de8ba095408ac494bd6efbf60508bd6f4747"
    },
    {
      "path": "manager-os/forge-alive-static-preview-milestone-closure/forge-alive-static-preview-milestone-closure-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "82e5a67d2a8de3b7c06660461035d9f854fb1b1effc886f1807f1f95457a0620"
    },
    {
      "path": "manager-os/forge-alive/forge-alive-smart-widget-stack-read-model.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2fe5165ace67d640c8a0477f20d8dbacd71fbd280735c6096e4f2fd0ca8acea4"
    },
    {
      "path": "manager-os/human-approval/human-approval-gate-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "6c051d0501869bbb1787da61efc0de3c492421a1c6f9e4d58a9be60c23043c5a"
    },
    {
      "path": "manager-os/nba/nash-mick-nba-reconnection-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "96e5bb396f2acad6439924dc62a7c98b0aa411fc0bfaf34efcd086aeb3b1dc62"
    },
    {
      "path": "manager-os/nba/nba-reason-why-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2484ac2910ab913bc8c264c266e58217e6345e22eb81a0e1b8a94180ceb67675"
    },
    {
      "path": "manager-os/provider-connector/provider-connector-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "305efa98da3b7c14d244bd93921cff0fcffba23c9e77ec742d61bdfba249c1ee"
    },
    {
      "path": "manager-os/provider-runtime/provider-runtime-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "f3af26df46337c80af08677e6bf6e9882c949190147f6a2b426f271289c8a726"
    },
    {
      "path": "manager-os/provider-webhook/provider-webhook-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "534be3271e6d56f63b7449f104502c7216efb94e9e3badfd3544eea376a73a4f"
    },
    {
      "path": "manager-os/public-url-verification/public-url-verification-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b53e03f783cc554319e2c9e0c738b34039e5ac0c6b70f9756629e271fc309ba7"
    },
    {
      "path": "manager-os/rda-attribution/manager-rda-attribution-truth-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b0a4c84f5e54b4256945cf1ee11a8d729c10a48754ec689ff56aba23ae46041d"
    },
    {
      "path": "manager-os/recruitment/snapshots/candidate-manager-snapshot-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9a2c723e4f8fec8ee0a8c04a965703338a5d0b82e5c07efe1cc485b0d0a2fdc3"
    },
    {
      "path": "manager-os/send-execution/send-execution-gate-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "f6c3ffd761a276e9e14a48ad9473ecf1a3d3277dcce4137f19df1a01f6557c07"
    },
    {
      "path": "manager-os/static-preview-deployment/static-preview-deployment-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1d50e22031671997c6d07236cc5d674d8c9d12d927088bb8b729ee8dfa5928d7"
    },
    {
      "path": "manager-os/static-preview-public-surface-decision/static-preview-public-surface-decision-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "dc0f63daa2cd2f1d769f62d8c60e0f31f8bbfb6584a9d7f7bd97963c155de072"
    },
    {
      "path": "manager-os/static-preview-release-note/static-preview-release-note-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9626ea3197e56e54656cd3d201d882ca1647a55883c1f15277c6035230476f2f"
    },
    {
      "path": "manager-os/static-preview-review-packet/static-preview-review-packet-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "a240fee2b1691ed2b43929f998f585e20d2f4abe76b272deae252e405919db67"
    },
    {
      "path": "manager-os/truth-promotion/truth-promotion-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b14ba147afd5377b1a0b84ebd7466f61c584e4cd248ff95fe2456a44fadb363a"
    },
    {
      "path": "manager-os/ui-read-model/ui-read-model-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "22a1f61bcac02473911f848ee5da0c293c4ba3cf1def5fe253d776519fa585da"
    },
    {
      "path": "manager-os/ui-rendering/ui-rendering-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1fbd9174b9112493fc2520bd10ad82ccdc316c77dc3b6d3f0c4a5779ce2bac33"
    },
    {
      "path": "mick/context-intake/mick-manager-context-intake-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e28a99c4b417042ac850930e056be1bc6d86754590b66adf7410e79be749f367"
    },
    {
      "path": "module-lifecycle.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "785d7c62b3207bb5dd1392c8e507a163ee54508947f272572b2457ccb567bc29"
    },
    {
      "path": "nash/context-intake/nash-manager-context-intake-boundary-contract.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "1c5d44bc50517605c65d390ddd430d1743e090d43e42b808ed990e5282da511a"
    },
    {
      "path": "next-best-question-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "bdfeecd436c8ae80078d3978bc75ba610b915d715ba3c40525b3ef0ae2647452"
    },
    {
      "path": "optimistic-mutation-runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "01d65a2d6e93a00e8b6388bdce8e139a46580f6bc2e8e2697fc0d6cbd2687692"
    },
    {
      "path": "performance-monitor.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "a3b1ee588f427368276eebf5442736fccee63be08b30e8efc95f65f523279257"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-model-normalizer-067d.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b69e7948a66de99827a84be8994a753d83a66ab915b3fe469ba0dc97416b711e"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "91dd81c82799e03ff83522fd974ee19071048d529860fb2c0d21a545346f6bd7"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-copy-badge-system-registry-adapter-090b.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9128bf5ddb4b80b9c7863a31f3af78e22f27d33c47a0d6f0311250fae8043c67"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-screen-composition-registry-adapter-088b.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "6e744762a2173754d81b4bf3a87074afda8ab1915e44cfae6ca5161dbd603f4c"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-visual-layout-spec-registry-adapter-089b.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "13060f39935b5677dda547934cf41cc7a276a4c8e33cebabb47b90aa0458dd06"
    },
    {
      "path": "platform/app/forge-app-shell.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0f1306e7b893258524232234871d65459ed0952140af8b9ccfab24d54e1ea62d"
    },
    {
      "path": "platform/auth/auth-service.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "86103106d9563ce6a1cdad6bd2fed5edd4e2b2b9dd191c84463b861f6e373fbf"
    },
    {
      "path": "platform/routing/enterprise-router.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "37519a0c7899a841175424cc882f5d65cbd0d4f148ea72fe2a7bba3df508be56"
    },
    {
      "path": "platform/truth/validators/source-ownership-validator.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9a7a82490240382791852c1dace83c83d12d72284256aa5275831e977bf6627d"
    },
    {
      "path": "policy-operations/client-records/cartera-utils.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "637cf0ee777c3cbb34fdc710f3476dc81b4804f035fba8b15d90c466cfdcae78"
    },
    {
      "path": "policy-operations/evidence/ocr-result-cache.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e951170a4c575423f5756951e57107fb649fec4dfe257a544296fdfd0dd9ab0d"
    },
    {
      "path": "policy-operations/initial-renewal-classifier.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "055892c96e24ad84753a64f77831aecc820daf45390bc21dfaa586cc0b8b086e"
    },
    {
      "path": "policy-operations/policy-detail/policy-indexing-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "740e08d4152eaf84b12b048592ae442754541522429f4115105ca24e0af42dfb"
    },
    {
      "path": "product-detection-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "bf690ef0dd12191ed2fe8ff7dbb5de9d85e0b4c7b6177800d84076799115c8a5"
    },
    {
      "path": "query-cache.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "4c81eadc4efc1665fc80517c00b38c57ed6357018f06b827f6125084c9751218"
    },
    {
      "path": "query-runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0a622743c93f925748dd736c74dbf3b28630e0f8f9d4f3e4f8123b271dcabc26"
    },
    {
      "path": "realtime-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b1fe1571d1d38cd37a805ae317c9fe21f99a24fab3d283a57fbab4cb4658d2cc"
    },
    {
      "path": "relationship-next-action-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "e77ec0c7d83b0444d8d7e566bda954c4399fb55af3d222f9803f4c9cf2969475"
    },
    {
      "path": "relationship-timeline-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "2cab1e2cf79aa7ef8bbd7046390596741ff04a901d2dc626727b47503b246eab"
    },
    {
      "path": "revenue/carrier-rule-router.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "b3a71001678b781ba1197faaee0a1f763c5d1054754c677b86f25c8d5ca6642d"
    },
    {
      "path": "revenue/revenue-scope-gate.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "304a14892f1b79cd2acf14b12d2bc2b31ebfeef80a8fdb7d5a22a55cbe31faa5"
    },
    {
      "path": "rule-packs/smnyl/smnyl-risk-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "24cf8e21235b550d5bcbe70565240cfa225ab10f188112be0a00d1b3169df488"
    },
    {
      "path": "runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "9230601442562ddc2e74a08f74a83eada2a4026856c6125f9caa8fd6a7278031"
    },
    {
      "path": "shared-policy-currency-timeline-engine.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "0bc5f1ed47a0cfe4bdf5eae08bac84a446e2a8acbedc8e6eef545ca98f9761b8"
    },
    {
      "path": "source-ownership-registry.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "135ebcdd47a033b33bb8b59e2076f77b9bcdb2d91377abddce0cbe805975af26"
    },
    {
      "path": "src/intelligence/hdl/semantic-frame-builder.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "a33bf50ac818b4a631be46810aee961630cab19ff116abe26cf6b5f6d839074c"
    },
    {
      "path": "src/services/forge-alpha-repository.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "5b72476d8b0e3faa634c5064a3ebcd635cee6891249116810f75e598c4f29911"
    },
    {
      "path": "state-manager.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "097d9e7d4d2e0be42f251b636ac6aa0f79e467e6c9b406a2ddbdf74237786373"
    },
    {
      "path": "store.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "ffc8f2870c344d77e46124c0b01a64d43ff266cae96d278db1639c5b1328c17f"
    },
    {
      "path": "utils.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "96e453328e5603005f2f00e51d248cea9e5e34ef6f7a24df0c653d59abc35662"
    },
    {
      "path": "visibility-runtime.js",
      "score": 20,
      "reasons": [
        "writer_operation",
        "reader_operation"
      ],
      "sha256": "f6e683c97fc9babb733a610ed804240cf3569218ca25f794baceaa764d8c27a9"
    },
    {
      "path": "accessibility-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "507036c66dc90c17d3284c2ea91f9c52f5209a109b624f40f476622f7e43935f"
    },
    {
      "path": "advisor-lifecycle/advisor-career-clock.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "59197ac5a7ea09711493a9efbfdb8b36dbac1687bae57e8286679a85a22f9291"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-evidence.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "3bf7b9488a128db92097a4d07555f0490a4c2f661e0bde0ded311e38f9e8c177"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-rda-reference-consumer.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5b05a71bbdd376672f07fae64c69a7af4788aac87db57c3fbc84cebeae333b23"
    },
    {
      "path": "advisor-lifecycle/advisor-lifecycle-status.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "abf78c271b4c0052cc84407a6eac6703021645722008dd26368c14ad25d3bd7b"
    },
    {
      "path": "advisor-lifecycle/precontract-economic-status.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "212f794c8f0595400b7d37d88569fbd597d18350e4a26c45cf5171d67f5c2e30"
    },
    {
      "path": "advisor-os/concursos/concursos.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e543ed439f6adb6b67c19b7f7ca9e764e07bfde377987b1e75af1bb722ac9240"
    },
    {
      "path": "advisor-os/discovery/discovery-insights-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "50e602b62f4fd0e3daaddd6c6ad72078d3bf415e86f32b96466e91538f747a57"
    },
    {
      "path": "advisor-os/prospecting/appointment-calendar-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "7ef330c6fc556639f496ceb34f674548a6a9915c2cfc89f9dc73b64fc54d6bb4"
    },
    {
      "path": "auth-guard.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "9ce488da10a2222f19161b11cd3a965ccdafa282ab488d02891c7de6337d2bba"
    },
    {
      "path": "cartera-state.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f94281ed6adf7ae6fd08c22c024b9a9980614b23e8a9f6b604a80ffd900d9966"
    },
    {
      "path": "comisiones-utils.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9d2efb73511362c59605f6bdb56f36cf68ec102f7cf16e02a13c5d72b24acba0"
    },
    {
      "path": "compensation/advisor-development/advisor-development-connection-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "a122c3c8ca955eb916700c9ee393dc88613eb83c6563d032ced17f2a3f4680bd"
    },
    {
      "path": "compensation/advisor-development/advisor-development-development-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9b613a0c24b5550178fede9afbabc60749a612e904d723dc776b3b47a5444067"
    },
    {
      "path": "compensation/advisor-development/advisor-development-monthly-income-candidate-orchestrator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e99906c03cf75205455d9cde2b9f434e7f1c111fa86db249926b82adfbcdc812"
    },
    {
      "path": "compensation/advisor-development/advisor-development-rule-pack-loader.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8ec5fc3acfaf0d6d144f8880e018d1b9bda2bcbf29f7d852663fd9414dd560a5"
    },
    {
      "path": "compensation/advisor-development/advisor-development-training-allowance-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "953e664352ab274abca7ee2a7b6ba5682d3e04ecf2916b619141bbc10599cb33"
    },
    {
      "path": "compensation/advisor-development/advisor-relationship-bonus-readiness-gate.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b63e711c841ce25d15a9105142deacdff21040d03402cbdea781863644a79ecc"
    },
    {
      "path": "compensation/contracts/career-month-resolver.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ab1934fbd5f60e4569da811fa893c4eaebc4de44c54503efac3d2c2b34ab456c"
    },
    {
      "path": "compensation/contracts/cuaderno-point-period.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "647a167e26929f5edafaacd7dd69d42c227e1946bc17adaa6457960d75026e03"
    },
    {
      "path": "compensation/new-professional/new-professional-connection-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "bd3f7e73b251854c13c4a0962cea601e42a56f73253fa2759bafa9d09d69ab0e"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-initial-premium-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e6b22c1b3abfcd7b5f47ad230b66c2f85617d1875ea12e6c45f1999c5552b057"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-initial-premium-growth-annual-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1d62f2e8aa8ea474149be1d8689cc6c3f5acc0219dd5829086ff19b694e961ac"
    },
    {
      "path": "compensation/new-professional/new-professional-gmmi-renewal-premium-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ce0198d400427679ccac00277e426a390654fb6b6060e1b8c746fa2bf740d8c3"
    },
    {
      "path": "compensation/new-professional/new-professional-life-initial-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "699c6acbbde6cc4f865f6f92d377b513abc336dc6281c04851150c571bda9146"
    },
    {
      "path": "compensation/new-professional/new-professional-life-renewal-bonus-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1017f4ad3ff83df1b0c7311607e01e90f93551fc9864d02a5b7135dde105ef96"
    },
    {
      "path": "compensation/new-professional/new-professional-rule-pack-loader.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8a1ca64c599c1cc8450f0bd3c07138c1e1ad6309a1673e0293bbfd44144d16a4"
    },
    {
      "path": "compensation/new-professional/new-professional-rule-pack-validator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "2aae2d7ce6d709ae38a64b7cbfd21e6ec79aed17f8c775baaddbba38bfffb8ca"
    },
    {
      "path": "compensation/partner-manager/advisor-economic-output.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "74306aade969f58cc9ca4d76a95fbefeee24d489d10a070e686fb5ff11acc5b2"
    },
    {
      "path": "compensation/partner-manager/manager-precontract-rda-attribution-intake.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "0e712e05d05f6598e2812fda77048a0c63b176a3bef2ab901753ebe05a4e11de"
    },
    {
      "path": "compensation/partner-manager/partner-activity-bonus-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "08600eb234f3ffee4de9f66fd655bd2f24ca2c7477cf36e4e1a7115b917667d5"
    },
    {
      "path": "compensation/partner-manager/partner-alta-partner-bonus-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "717837ad615d2b652a3b831ff476337fa802412c6ec23fae28c50aa5920034d7"
    },
    {
      "path": "compensation/partner-manager/partner-annual-productivity-bonus-calculator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e77c9da7ce7b7a4391631231ffda774e45bed3403ca7d622c91bc00c2f9c8c0d"
    },
    {
      "path": "compensation/partner-manager/partner-annual-productivity-bonus-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "64333980d395a301c8d903da47f90e6a1233934fb88b5de2ea33d595c99396d5"
    },
    {
      "path": "compensation/partner-manager/partner-compensation-concept-registry.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "c5c0ba8b14346322b6c2821a14482aa75520f39081fad356e39dc87e67ef3bab"
    },
    {
      "path": "compensation/partner-manager/partner-fixed-support-calculator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "f401dff03e985cd3f6b4f3e55d4de368cafb6e2a05fc379890c1208223aa65de"
    },
    {
      "path": "compensation/partner-manager/partner-fixed-support-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9f1a97d26df4aa33771421f52d8ce09b8f02b3ce96b74e274397a7a215463be5"
    },
    {
      "path": "compensation/partner-manager/partner-official-evidence-status.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "eb15d920525dbcb583921795e0531b33877e817248f1da2edc6b4fc97ebb94cc"
    },
    {
      "path": "compensation/partner-manager/partner-partial-bonus-calculation-gate.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "32849c4131f3d201d2e23b780bb584886d1f1585a7e6f9e1359c5a4b5098026b"
    },
    {
      "path": "compensation/partner-manager/partner-partial-bonus-contracts.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d08679b91f5a58a4338b65c7aba96e34ffe98112a1386e1f1d8635d0bea9fea7"
    },
    {
      "path": "compensation/partner-manager/partner-production-bonus-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e9ee0c89a9ccbd02d57b4d644730f4acd3ea502acf479a1a6ac261b90fb4bc43"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-base-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "928fd9f3cc78178036d95b2697026a8942bfa2d434c765dcc78032238a6513aa"
    },
    {
      "path": "compensation/partner-manager/partner-productivity-multiplier-contract.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "54542680749a3a8d29bb891bc99897a2d831cbff69a8382cab5ae33cf4e4fa30"
    },
    {
      "path": "compensation/partner-manager/partner-support-requirement-by-career-month.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "c25d9a7c53289c5682a3094719aad72a3b30e451af8af970768d3c96361c10d0"
    },
    {
      "path": "compensation/partner-manager/partner-transition-bonus-calculator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "fe94400c60e0e798c9ae23f1e26fb007d4f821d02633493d13b3d61fec49b867"
    },
    {
      "path": "compensation/partner-manager/partner-transition-bonus-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "05b12186acca1d9caf468dca8b3f68aa8fb5a323116678e80c32b917e3117e72"
    },
    {
      "path": "compensation/partner-manager/rule-engine/partner-rule-pack-loader.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3e81d44abe00b77c9878d1e1ebc6c9a27ab24c365257e8517f1750a61ecfc7ba"
    },
    {
      "path": "compensation/partner-manager/rule-engine/partner-rule-resolver.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9eb9f872384fef352100262573811c31db897f46ac257f907a24752e3ffb4a17"
    },
    {
      "path": "compensation/partner-manager/rule-pack-readiness.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "250f4815ab78e8b2945b0705f8bf40e997362372f1c70f01a346712612a043ce"
    },
    {
      "path": "compensation/partner-manager/team-economic-output.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "427ace6da26a4fb243c60cf04eee4c568bb736aa8bbdeeda1535d58ff4a494f8"
    },
    {
      "path": "decision-appendix-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d39f1ec1fc29dce9b8226802a10c68f2b2a8f75960bbe4ccd2c2612ffbcc37eb"
    },
    {
      "path": "engagement/context-intake/engagement-manager-context-intake-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "cbd214d2956d5e9ab1d51f5a0992de724062bbc1cf8e92a07de70222ebac7322"
    },
    {
      "path": "entity-resolver-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "367bdfb2ca25b5cb5bb4814eed6ab7953a111b1e1e0606c16e80d18e406024e9"
    },
    {
      "path": "event-advisor-review-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "88fc3e0a51613eb2da47fec3b30d7ef3f7ac09b385878b191807ad3babc77743"
    },
    {
      "path": "event-client-review-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3b6ee2f75006a9cc2385defd7771cf0aa324c2d2d662610133df3ede355ad37a"
    },
    {
      "path": "excel-parser-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8ab83a4d8ce9ada46b4dc52ed054f91d842ba98b34713ba47de8cd0f835e6e90"
    },
    {
      "path": "feature-flags.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1bd3658ce9fece8342c107d50388e9548ea40218ea7c3220a3b43ab05186d6eb"
    },
    {
      "path": "forge-ai-connector-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b56796772b42b79b82672d93f67a169712d5a87147752944cf8924abe4b59527"
    },
    {
      "path": "forge-ai-guardrails-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "4e19c6b1429b546b528cfd47860a2569f8cb5e1bfbd90f430c864fed843133d0"
    },
    {
      "path": "gmm-advisor-review-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "04f07ce584230cf3f7f6120899ea2517e5245f173d1caca59b255881a5f42954"
    },
    {
      "path": "gmm-client-review-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "d90a5e610dc4bf3584410ce76e07053b9cc9a0970cd5208dee9d7f3986c31c6b"
    },
    {
      "path": "gmm-policy-caratula-summary-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "34d6d43d6b7abc54afba84cb8cd52db0331218c458e58894e00aefa91fe4c934"
    },
    {
      "path": "gmm-quote-summary-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3b31dd4ebd59133a4d02bb533c7c52b006aeba6a96f528909de2ac1a45d304a1"
    },
    {
      "path": "health-runtime.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5d847efbab5649ac63ee57d3e5022c1413a44e0dbb4f7222ea1de8d30309e314"
    },
    {
      "path": "idle-runtime.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "d27837089384f0c152afcbbfd30668dee0e79c8f6b3ace24b0aa30d066f51cd0"
    },
    {
      "path": "imagina-ser-banxico-integration-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "6e3bc681c0a8b7a37065687983e4f780f347564a2f578a2c3063299cb3d1d9cf"
    },
    {
      "path": "imagina-ser-fiscal-bag-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b0599334428bf190e7351813372990bd364322436681d97c045417e06ca81022"
    },
    {
      "path": "imagina-ser-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0e77b49ef538aefa723ac995c1c39247b721c58faeb16c6370f719cf324f8b3c"
    },
    {
      "path": "legacy/crmaddlife/comisiones-adapter.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "4f0f1d7cb1164f67a419ed0d1febf4e277d7de0cf00f720b814b7aa23387e77a"
    },
    {
      "path": "legacy/crmaddlife/ui-shell.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9aa36325eee3e40a4c27e60464231205c766e3228cfd37cae75220705d24fe04"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-binding.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "8cd8b332142f2aec265a9152bbd1fcc0c4b3c1be9a48958033ca65631d9c6120"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-dom-surface-binding.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b9dcd6bd5571954769d92dd2aa9f258c414d3fec18fd755e6499953818b22f2a"
    },
    {
      "path": "manager-os/alfred-review-action-packet-static-preview-surface-binding.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "47ee4b2bac67b77cf1c65c3796287f876fb6270ebeb45ecb5c465acff7d432bf"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-advisor-coaching-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f7e4a0e8b2cc13549fe231620f88c0c451ae7b0b78ce6bcb3f2594c67d7ca2c1"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-coaching-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "0999cc37e12df16147a8fe4f6a6e6c600c33f16c2f85d0cda1944de692e81fd4"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-coaching-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "72e011c9380daec0704c4bf9273993e6403c3ba6aa289ab84c0a421e51ea2342"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-recruitment-coaching-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "038b6085b8f500fb9aaec5c5d8b8323250f986a4f13d15c28735a0c9e33cadf2"
    },
    {
      "path": "manager-os/coaching-intelligence/manager-team-coaching-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "d93de13c538ac68341f436fe313a4447d6d581761d55413c3b3047d85b353192"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-advisor-dashboard-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "bfedd7d8a7781442a8450517eb2ce307005def15ee5fe9ba9ae780afe00950fa"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-dashboard-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "020d26b2c838668e9e0e434283273a255811e66bf1b80a4310a2056a93b316b7"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-dashboard-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "1446d5f9635a8f8072dffb60979efb54f8cd5041935be2bbb19757975984a7e7"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-recruitment-dashboard-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "df22db42adcbb08c17c40412ff183c303def28f6419e07fb6a6712f3e44b112b"
    },
    {
      "path": "manager-os/dashboard-intelligence/manager-team-dashboard-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5a90889aac5deb2734118078b68b0130a1c9425c96a90ac4943b39ff0b020cb0"
    },
    {
      "path": "manager-os/external-context-bridge/manager-engagement-context-bridge.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "b3598ad90b2568a44c0e91a16f662c04d94dabe353036f61c1258ee844be7426"
    },
    {
      "path": "manager-os/external-context-bridge/manager-external-context-bridge-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "e2f68ff333ff27f8016d017f5b39a79fda413e72536f00c8e855e754ec2d9550"
    },
    {
      "path": "manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5b50d62531eac21ba1c56bb028f73217ae0b96f1df27ea4c2d4d892692fb1abd"
    },
    {
      "path": "manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "113290347c246919171ce6cc9e119d22909e8fc81b3e3fbe209ce19c9a771fd3"
    },
    {
      "path": "manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "61214d1b59602f7a6816071b93840d87a777f7cd41154f36a60f192bac30a0f3"
    },
    {
      "path": "manager-os/forecast/manager-forecast-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "03ed8289a51879a3af337cb099e8c20d864eb1bfc4982b365d89f83034c94ceb"
    },
    {
      "path": "manager-os/forecast/manager-forecast-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "ea0c8337223334afe9324cfe432ec8a534b73f4007d472ce9f3c9567b7f0996f"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-human-review-packet.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "31b834131b1f89f2c055fe815f29dc9adc08d3fbe8beac3b7790cb332755039b"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "4bb8d48b4fa52baecbcb9881bc8e65354844bcbde637d40b951e441ee2fe3f17"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-real-adapter-wiring.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "b267719f72b04e36f07f1261cedd09aa9f07ab65b29a1ebbe7034aca7da9b040"
    },
    {
      "path": "manager-os/genesis-beta-loop/genesis-beta-loop-ui-read-model.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5aa9ccbf9b2b82390d7f026a4880f49a8109facd955733a96b7edd55f6ed7e20"
    },
    {
      "path": "manager-os/historical-analytics/manager-advisor-historical-analytics-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "66ea49eba07fc5144980b4f4def52ac3ea0e9d993c553199ab3b390599c7f8b7"
    },
    {
      "path": "manager-os/historical-analytics/manager-historical-analytics-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "756daedbd772fea95e65ee138730177ca58044941b5d6051d693ce261e80f97e"
    },
    {
      "path": "manager-os/historical-analytics/manager-historical-analytics-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "9e3c40f82a562d34d8c9abc12249bb48d6fc34f56c444f35741b4cf1c861a7ea"
    },
    {
      "path": "manager-os/historical-analytics/manager-recruitment-historical-analytics-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "c0249c338d03bfdfb36afec1d52e530e39a2a47ae38d171825285c8039f0d191"
    },
    {
      "path": "manager-os/historical-analytics/storage/manager-historical-rollup-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "2e434912c473b4e3509740e84a7a9f46b3420cfd93976ff973a764ffa1286a4c"
    },
    {
      "path": "manager-os/message-generation/llm-draft-intake-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "c2722779b520e3ee620ba67b2600e3b4dfcbae597a34602427ea6fa400814041"
    },
    {
      "path": "manager-os/message-generation/manager-message-prompt-builder-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "93984dc86492e63803b75fdca0c78e883dd03f829942f7c829cba6a014b6813c"
    },
    {
      "path": "manager-os/message-generation/manager-message-prompt-builder.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "36633eba57e10d2d0fcc4edade31689c2f1d7d8495ee7eaeb188e60eae23027a"
    },
    {
      "path": "manager-os/message-generation/message-safety-validator.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f67a026450f3e9589f28482bef3011b07963b566fb51a9bfbd1f8ec5a9fb8f09"
    },
    {
      "path": "manager-os/metrics/manager-advisor-metrics-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "69e22585706237e58eb18a3a3caff2085ddf64f6bf2f2bc45fce62fd8b21f267"
    },
    {
      "path": "manager-os/metrics/manager-metrics-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "22864cecf921487b9ffd8ee72a0c1f4181aec28af6a04605e8e7c3c787f9bcdb"
    },
    {
      "path": "manager-os/metrics/manager-metrics-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "eca1ea13a6b1648bbdbb210edc2eaabdeee8bdabd70282ec6364f8eb9d428208"
    },
    {
      "path": "manager-os/metrics/manager-recruitment-metrics-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "32a91bccd86555d00d8f2d1f4083c31e3c2654c591c305ddaa33c340cf275463"
    },
    {
      "path": "manager-os/rda-attribution/manager-rda-consumer-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "ffac66f7d77aca9c361af1421c8a931ce1ca6430720bc40fc3760eef06c550c8"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-coachability-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "fe55d1a9143913732733f6b788bd2471f9fefe8000ca26e29dc631b238aea747"
    },
    {
      "path": "manager-os/recruitment/candidate-intelligence/candidate-evidence-provenance-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d38a8a7f1a479aa8bd851a2d28b3aa92e62c48dbc72e53889d74bb41c5662cc4"
    },
    {
      "path": "manager-os/recruitment/events/manager-recruitment-event-capture-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "e8f8ba8391535042011e2fd6b516d9b0bd7bdbd5a3b164bc32f4eca50658bc98"
    },
    {
      "path": "manager-os/recruitment/interview-flow/interview-flow-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "92ffed06898b9d9eaccedc46e3673b004abbac2824cca5b18eb13b7d608f9acf"
    },
    {
      "path": "manager-os/recruitment/pipeline/recruitment-pipeline-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "1a7b795c0ec6ac77ef3d6cf2a6f6995bba967c8bb6fc17a603aa2361d9935073"
    },
    {
      "path": "manager-os/recruitment/precontract-gate/recruitment-to-precontract-gate.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "429ade5a331f94b6f47cb23693c4e53a0298519291e55bb94c50518bd449dc14"
    },
    {
      "path": "manager-os/recruitment/rda-boundary/recruitment-rda-prerequisite-boundary.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "7f39f2bf3bd0517d384a203ad4e474265132317bc96fa7e3c94c03b1d7901d92"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-advisor-review-plan-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "1f481c600f792b8585b2692d2df3fef3d7480aff2fa4dd61965ada3739f18dd4"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-recruitment-review-plan-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "219c58e127f0010946e36e3b26855163b84d586288b1a214df6e5ee16e3c1ec2"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-review-plan-boundary-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "fb1ee57ba6c3ec6dcb7f39570b1f04abb985519a2e53bba5ea917fbf1bd4b94c"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-review-plan-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "9dfaf664ec52e3f60113f865e1517b4f130119239be268781248881855450340"
    },
    {
      "path": "manager-os/review-plan-intelligence/manager-team-review-plan-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "22306ddbb270551d0cc878190bf26e65c912bdec9e1ac4c5447ec88e5d8affc0"
    },
    {
      "path": "market-data-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "889bd9535ee915b4ec574b57f001f21e83b548dec5dfd7d1d17775662cff0806"
    },
    {
      "path": "mick/context-intake/mick-manager-behavior-review-packet-intake.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "3c59d6211c5b621acd33daf0997a1bb68cb0d37d58e0122d292bc1384147077f"
    },
    {
      "path": "mick/context-intake/mick-manager-context-intake-orchestrator.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "5bfb05bd06513c3d3c1b4755206e5482bb31de95ada05a1b9b3c8104d6bd6790"
    },
    {
      "path": "mick/context-intake/mick-manager-no-surveillance-guardrail-intake.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "1d9b07237e19780433601cab4d7c29cf209d2ac62924ebcf2ed6a1a5fc985489"
    },
    {
      "path": "mutation-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "8a3d6d4dc6eca04d1d8a54a724f02e8d5a90e9ea5d3d58b917ab55ed6c013aed"
    },
    {
      "path": "nash-advisor-performance-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "6e8defc3b9659cd9517ed30318160439a2d371970d007975a35f3e7ac378cc60"
    },
    {
      "path": "nash-coaching-insight-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "97c2394574502fad2d97c82a0e7389301f02bef1604cc086778e4844d28d6440"
    },
    {
      "path": "nash-manager-alert-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "afa82aafcb2087d7846b1c2d84aeebeb017ad3d6811769797b3e361f903ac97e"
    },
    {
      "path": "nash-master-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "2ee8f1c5b49b819967af63c8aa9e2a617c3cdacbd036adf2e6aa14a7c7a04c8a"
    },
    {
      "path": "nash-team-intelligence-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "2b5f8c8513eeda184f3f167fc821f88776a23f55d71d0c6c0c0812137853dbe9"
    },
    {
      "path": "nash/context-intake/nash-manager-context-intake-orchestrator.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1fb4175bf029cbe5eeee087ed4cc5ff5a36d7688c8381c14d57ce1c4364bca1b"
    },
    {
      "path": "nash/context-intake/nash-manager-conversation-prep-packet-intake.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ad2e2751ea72f4797d8dba3032eef5106cbae2da22ec9d90642de2aa927c8366"
    },
    {
      "path": "network-manager.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "9372471a79749bf1968bd4a0212bac3c8f99610c6be0a4178f82dbba3c060f90"
    },
    {
      "path": "next-best-question-smoke-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "edcc5834fe43c3e4aaa264c7801d6d34ac5075e3f3540387f28d1bbdbf689cb9"
    },
    {
      "path": "operational-shell.store.ts",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "67a93b040570b9b21a2e4ec7feecc786cf500fd77a20764bbbe7cf8111e8255e"
    },
    {
      "path": "orvi-client-report-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "90f06246522e26438d4c09b513b7d7aac7bf29d8845bc05266579299f4e70c68"
    },
    {
      "path": "orvi-guaranteed-value-timeline-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "996dfb9498948d9e5b3c70684b599f2dba087b34fb4c51781c889e116cc610f7"
    },
    {
      "path": "orvi-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8789c3f2a11d9ce6554519403e403b9eb457e91427ba69f5efb0a572d6baa935"
    },
    {
      "path": "orvi-mxn-master-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "60958f325065fe3d4dc6b67828e9c26789ffeee37fe550d382c53f37a6e36a34"
    },
    {
      "path": "orvi-wait-vs-cancel-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "6cfc2cc5319e81dff17d459dd6880d158072ff3df1c854bf05fe541e774870ef"
    },
    {
      "path": "ovelay-manager.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ade5661ca3241db8d0515301279ca1450beb51c32af9e826647bbce47257db5d"
    },
    {
      "path": "platform/action-contracts/action-contract-approval-gate-schema-070c.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9e57ef861874514e46c791f0d68296368ab20014bcdc6930b7fea25093274989"
    },
    {
      "path": "platform/adapters/client-crm/client-crm-read-only-adapter-065b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0a265e954295afa5f34e72014df66453ffd0f9ca172cb0c128685ac0ec18891d"
    },
    {
      "path": "platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0659f1d84b3063b008847a62022b4b0d9d681cf8190e95fcc5f2bdc4439ad006"
    },
    {
      "path": "platform/adapters/policy-read-model/policy-read-model-adapter-068b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "c7fb86aa238830df11eecb840301b13360eee9451690852a88503ce7e869c929"
    },
    {
      "path": "platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "44b44f3a284a1ec00e48f3a278dc6256038d3f984695af4d9424a6eca0ef5738"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-execution-readiness-review-matrix-adapter-080b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "073951b0dba2b11c96445f03bd4c7196c248cb7f3b75b94a7d5eaf6eaad74670"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-provenance-registry-adapter-079b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ed1cc6632bcbfdaaa38e6400e2e307d523b3dfcd3ac53aac4721dc455471353f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-canonical-test-evidence-registry-adapter-078b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3672e0049a44992d6ee0168b11d2dd76b93ef77861f06cf6189b459a2c6c8e08"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-deterministic-input-source-trace-registry-adapter-084b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ea071a57362f2c105332545c0c50715bc6c1d1a4496ac0de8be40fffc5f26462"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "efd73bd8d6fc056b34048da0cd6586b0215a27012edf731e9981bd2b182768ce"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-expected-value-source-trace-registry-adapter-082b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "55de29e93dc766c61790544663b6b4ba3b038f05892d5758bcc1e75a7bd513d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "28ebb55e65b766fc99c92f1eec7856eb20585eb9278d4f4ce2a1873338841818"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-preview-vs-quote-truth-boundary-registry-adapter-085b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3ce4edd0c289d3c9566c2ab4b9e979c243f16a0c4a24834fd7895674442102d2"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-real-pdf-file-hash-provenance-registry-adapter-081b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d279bea1728557e628ebc1faeb800be1c2e9f3c17bf0b445096febcea740908f"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "f72934ffbd187425a8de51753ae8c1cad980eeb1c67e5cdd23cabce99c33b2b5"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "10e23cda8585af3a6650f220c724a5c8ea9b9dc04e0ecebd5941e3391fed971d"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-component-contract-registry-adapter-087b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b81886926505ee34b5ff3fd4d2b66fc054f65ef75d360db1b830f0a9d72bbba1"
    },
    {
      "path": "platform/adapters/quote-preview/quote-preview-safe-ux-state-model-registry-adapter-086b.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1e5465c7f4db866e0f57fd7fe4fd7e0bb1ac2ddbb425e616f15f048a8173a628"
    },
    {
      "path": "platform/adapters/quote-read-model/quote-read-model-adapter-069c.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "6f91db75c769208f33491579b37c83bfd1f114d2ab5442bc56df82b7d51110af"
    },
    {
      "path": "platform/app/runtime-listeners.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "16127f625c8e63c398612a15c10c11d2f9cdda8953363ad957a07f5c3283586f"
    },
    {
      "path": "platform/commands/command-palette-ui.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "78fa3f371482025fb0846b93ce44da2b81b7c9a206a88b79c31cb24746de062e"
    },
    {
      "path": "platform/commands/command-palette.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8e0fd4969d25fba0b43f992b82e3e5186f19cead2536701121e354ac218c2989"
    },
    {
      "path": "platform/commands/command-palette.store.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "fe7abcfc1abb099a2904053d39675304ee6ee842c828969a21b6b1a117a82257"
    },
    {
      "path": "platform/commands/command-palette.tsx",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "c72636ff5c2687664eb30a2176101115a2558e6220c802c5b7bc2eb81ad87886"
    },
    {
      "path": "platform/navigation-runtime.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "78c8a5a540afd5459b17bfdc4f0cbf1a3e615345c8c404e0ba957ea41aafc320"
    },
    {
      "path": "platform/sync/offline-sync.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "39ba1066e8edfeb5f38215cee85d2050fc061127d90158c76ea9543666c010ee"
    },
    {
      "path": "platform/sync/sync-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "5d1dd225cff0ea7b7a62fc1081b2b3bccecb2802d96ce69bd6ad656e484aaaed"
    },
    {
      "path": "platform/sync/sync-orchestrator.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "a1d4434d24f68addfe67a874797cd8b0dffe1084c62f0ee69ec4dcbb9e4b3d67"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-inbox-router-contract.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "833656e659909f7fb6b6b8b9ea46eddabd6aacc9b01d7b01ad4657dcffba9730"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-processing-status.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "ec161abc9696bec7c78abf521bdd04d7d0adb08b2d89b4dac1aca4cc8f5dbf75"
    },
    {
      "path": "policy-operations/evidence-inbox/evidence-source.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "cdcd3ee973ed465f03cf1bd6a8618b1e1f7bc8e9e039aed8eec99c83c822a7aa"
    },
    {
      "path": "policy-operations/evidence/policy-ai-parser.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9a836b43cb80b6702c9fd02787b4883aeef23a720db43fa14288643693e61c5f"
    },
    {
      "path": "policy-operations/evidence/policy-import-queue.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "78b85e0515061d90a655650490e8be33cf17e414f47008fb08582458ed212dd5"
    },
    {
      "path": "policy-operations/evidence/policy-staging-cache.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "abfdf92a82e6fb6be6de114ff71cd1e770059f8de5d698377446a8263b2e631b"
    },
    {
      "path": "policy-operations/policy-detail/drag-drop-policy-zone.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e63aaa5a16bbb2e05cc5f5d64b05d391eb534272f1957e41e3b7dd6b20cb38d6"
    },
    {
      "path": "policy-operations/policy-detail/policy-duplicate-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "153c70d96e54d71c56169a5a6f01ea13b22caca9242a498252c5f782f0de6ffa"
    },
    {
      "path": "policy-operations/tasks/overdue-task-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "43310af9cb39255bebb725302423adfcac109bd0722196c85b6dac2bc73ec8e4"
    },
    {
      "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014"
    },
    {
      "path": "product-intelligence/evidence/gmm-quote-parser.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "c20a1d9ee10ef349a86db73bed1c28f1e2ba36534736058fda3e4f3e74161937"
    },
    {
      "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "03715ebbad73e261727a8b45239184ec7d95a69ebda551e908c086c35c50b7f3"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-report.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0925fd31ab05a35d03dca24579f2add614901fdd964ab61271da73301dfad660"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-rescue-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "55652ac7246025a02691e42980aa88e21e3d452213fd9d3627c3fc949b5e3cb7"
    },
    {
      "path": "product-intelligence/knowledge/ave/shared-ave-type-inference-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "6e6f3bf8f26c9e48cafb71fa0b391e906d281f07fb116728fe8ec226bc1e3b02"
    },
    {
      "path": "product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0cac862db1344d5c97dbe5c60bfab07bf659bd7e95601044da0260203bb9ad19"
    },
    {
      "path": "product-intelligence/projections/projection-milestone-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "eb4a4e0059ab7d9bea3f901688ea4be8aaaab330ef930755e2476d4a5deb0eed"
    },
    {
      "path": "proposal-family-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f3fee31263deb3f5213f0969e5e4cd9fb8a40dcb276d04dddc97496e512ab33a"
    },
    {
      "path": "quote-to-policy-comparison-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "cd1295347001785e7c477136224fd8d29882552fe804d14e00eb8105e9c61f5d"
    },
    {
      "path": "referral-opportunity-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "8ecee398dfef48dc988684467cc9cc2ce8c686fd44331a22b298a1691b7d2208"
    },
    {
      "path": "responsive-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "c7f6f1974156c0f20a7647fbdafbe4509d74229d607be468aa7607a5856867f9"
    },
    {
      "path": "retirement-future-udi-projection-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "549aea616c585bc84be09c08ff9c77f500d5884458b154dffb9af3c72b8e686e"
    },
    {
      "path": "retirement-presentation-scenario-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "7b9c8b66d3e28aadf30d102979e7474d819f464bdb0ca0092a5e27e7957fd215"
    },
    {
      "path": "retry-runtime.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "1da7194b4b0098ced81e5925d204db0d41dcef57144d27987f386327fbdba216"
    },
    {
      "path": "rule-packs/smnyl/smnyl-bonos-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3dfaa53c025adabebd18dc12850e5abdd2d74b9cc4088dab3a5fa138fb966de6"
    },
    {
      "path": "rule-packs/smnyl/smnyl-comisiones-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "a7a78959896a578220ca15067b9db90f5eae3dac85d8718d8831148b33d7886f"
    },
    {
      "path": "rule-packs/smnyl/smnyl-forecast-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "500d37beaef1226c1bb12ec6adb7ccb1bf4938f5b7ced2b42a64be704d7f1497"
    },
    {
      "path": "rule-packs/smnyl/smnyl-persistencia-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "3ebd70d8ca0e4ca7a22b655d842286bb6f8708a67cc8b41c9db10d3917fdb3fa"
    },
    {
      "path": "rule-packs/smnyl/smnyl-produccion-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1badbc9c07b35ad47e28e82b066be6fc17157c897831753c0c4a3f6bfd29f0bb"
    },
    {
      "path": "rule-packs/smnyl/smnyl-renovaciones-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1dc3ce2a93e046ecb16f9d6864f1c4d47862ccf9f428d461b4d6dcb8d26b45a0"
    },
    {
      "path": "scripts/process-note.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1f8a0be6630a383275018c7d60aac091dd806414efd3ad33d61e4842531f7fef"
    },
    {
      "path": "segu-beca-meaningful-numbers-report.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "d653f140d0f47d605eb4eeefa5d1493705850e748a771b95d13c455df7db985b"
    },
    {
      "path": "semantic-extract-acceptance-test.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f162d2e000756693906be10ea9af8db55b1948603ca7ffd0c3f217bb572437b5"
    },
    {
      "path": "service-worker.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "8e3bae5e2783a312699994bae077dce1b25cef72e78cf51b178a48e7444abe59"
    },
    {
      "path": "shared-banxico-edge-provider.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "97d26b9bc1db218531c1e105d558770414207a6bad8f556c6cd859200ef2d9e9"
    },
    {
      "path": "shared-banxico-rate-report.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "27a542588ba748dc510ffab3f5444f8e6be7610699b3c12900e9a8dd01a1b650"
    },
    {
      "path": "shared-benefit-hierarchy-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e9cc16e66d201f4af8c86d178f7922ffcdd664a4295d79794b37d4b988cd45a5"
    },
    {
      "path": "shared-price-placement-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "14c9adeb3789776456cad94b62a9a9c8bba3db35d9e37d9da29a5ffe931563cf"
    },
    {
      "path": "shared-projection-scenarios-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ae077732850742914d386b10cfbca36b4e1e676d99d4704236269dce24caee71"
    },
    {
      "path": "smart-agenda-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "18e04807f90f2812aecb5dfa9b4e5f7159cfe84b0d2263ab21c0c4bdcd763cd0"
    },
    {
      "path": "source-ownership-registry-validation-test.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "e0d14c37b935ebb86f429880c4b766d77b8d227e2084e19a09e2f8de2caeee7e"
    },
    {
      "path": "src/intelligence/alpha-runtime/action-ownership-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1266f85b481d1ee7e02c64ca85c61eb27196bbd1f4aee4961c4e4ce4ad703321"
    },
    {
      "path": "src/intelligence/alpha-runtime/event-extraction-engine.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "05928bea7d46a05bfeaaa7510ba7b33062af1e05971173c9aea8b2caee571bd1"
    },
    {
      "path": "src/intelligence/alpha-runtime/forge-alpha-runtime.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ee1b067e8c2937261d6b4a3b5458ac0f1c1600ee8f53098eef0d6b9bd65822ea"
    },
    {
      "path": "src/intelligence/hdl/discovery-signal-extractor.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "099f54cc420e132a8f34f0bff648e6e19e940665d814f470979dbf0f21769385"
    },
    {
      "path": "src/intelligence/ledger/ledger-truth.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1a0828b06d2ff203f073503b2a3117ab0cb84eea98b7ac77766c138dcacae098"
    },
    {
      "path": "src/intelligence/ledger/truth-archive.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "0c63ecb870383e44fbf7d4c84999bb91625016de9ba4beb6f0d657888cc82109"
    },
    {
      "path": "src/intelligence/semantic-guardrails/human-acceptance-gate.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "1297ccb9941b6aab8f1ba12ba066631ffe70d357a9ef940c040e65b36f2b3793"
    },
    {
      "path": "src/services/forge-alpha-service.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "8781292eead5e32470d997afe62fadc3605ec83576057d184ed6d7026cea48ce"
    },
    {
      "path": "supabase-runtime.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "9142f8dfbd6cb2bede2ef7d391fd5c7dc554c4716540b993b3f12d223c84a6c5"
    },
    {
      "path": "supabase/functions/semantic-extract/index.ts",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "b6465e0e171a3608666420c36828957d0dc236414f5dfd3c9fae01b184c765c4"
    },
    {
      "path": "telemetry.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "75089ac1f42a15b9346df40d304d8f6d564fd6d963242656f700afb706384c0b"
    },
    {
      "path": "ui-render-engine.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "f4a9c19b341e9a756245f384bba38e00b36fbb86a45f041474e3493ba2cb00b9"
    },
    {
      "path": "vida-mujer-financial-fixture-report.js",
      "score": 10,
      "reasons": [
        "reader_operation"
      ],
      "sha256": "ae62c44b09a6b0a95550e8e3998f448aa7d505ba1fc10b6b00d84d2661ef4657"
    },
    {
      "path": "virtual-list.js",
      "score": 10,
      "reasons": [
        "writer_operation"
      ],
      "sha256": "513653e4518bb0ad05c859c2a81640ab9ce778fac205fdd85b1aa6beeadb75d2"
    }
  ],
  "bridge": [
    {
      "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js",
      "score": 45,
      "reasons": [
        "extraction_ready_event",
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "0d39d0ac1ecc823b1888d01c1386f58cbb6945544756aae27989bf62100749d4"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-desktop-command-workspace-056y.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "2c46c87b5fda2d9eeeb9cbaf2fca2dd8eb74dfa63a578a1180c694d42f66b8d4"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-desktop-dashboard.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "710fdce40f40cb0480d3b6bf14c75f40341ad3b6032b7062b5a4edb427db1719"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-responsive-ui.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "3792e5e37c8328c56e7fce8d4e682fe1aa67c7f6b7c0af6211f0b1d269f6b798"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-smart-widget-stable-056t.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "bd24f0565ce3fc84f48d123f0765516d52b73612bde4c53a6cbd7d99a059b914"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-smart-widget-static-056u.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "09b2cb5513153aabc9e3a05232de5e23301efb739fd00332f82ab0ed64f274aa"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-ux92-cohesion-polish.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "f5a4255ad3c84eb7537d2f925de9c3fbb0f8b624125b0e05a4796d72be7daa8c"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-ux94-smart-widget-editorial.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "68252d920d7844ca5fbc8a68619243ada41f516a4649197e7083e1906b2a034e"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-ux99-hard-mount.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "c8e1b0733602a95bcc2f5b67d6b0215fff87284ac9dd8ff25ad16ac6770ee35c"
    },
    {
      "path": "docs/static-preview/forge-alive/command-bar-orb.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "bc6b49ea970633880d6290aff1af257340c91f88867f256ed0ba9bba4f078f68"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-command-workspace-upgrade-058e.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "183db5c1d5e1cc3b50bbe34dd9e481f57a8b57b1a6b080256aa7e74743706380"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-local-read-model-preview-ui-binding-060l.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "08e583a5ca85269174545ad4ecf0193b96f920d8dfff429245f278289f582ac8"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "164e82c5ea4e3ae6191221e648000c47e71070ff070a9c24510e66afffd3e25b"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-pattern-057d.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "b5c090bd8774655575b18ee03d3f5e41e4401813f9a9f4c6545891d56b46574c"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-top-nav-center-057g.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "3a1c457b87c8eff5e51a776c2c764fd1679871cb7c3b3d6215dcce7e43a471cf"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-visual-polish-057f.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "7c6881578ee7e730a5d5675f3e969d84001d6ab2688567999789a6ca83244ae0"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-visual-repair-057e.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "3dc8f6cfb8391092002dee7ec9aa5e1375098b12d1e1fb2528b3cb80c02d9d0d"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-057j.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "e950dd49f9f2fff7c45683153db3ae98ef9b07e1c6d4bfaeb064b05d9bba7338"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-dedup-057m.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "175c50b9f5ec582be79f6405f244120ff919bcb3ddf09aa70a9b047cdb28cea6"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-polish-057l.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "b8d2ea80d57aa557a68f0e36ee4ae35b5f505367f5aeffc5e0352e8a59712970"
    },
    {
      "path": "docs/static-preview/forge-alive/genesis-beta-loop-cards.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "2208f9cdd7251ae565c907aeff10c0fa0672174d045717c576568c8d4fd31ee7"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-local-read-model-source-adapter-060i.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "4fcca229a0ab468f1a5c06854d2abf9bb7c5f7d0a7b0f926d5855c8461eec740"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-report-read-model-dry-run-adapter-060d.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "5b4cfa8c7ac63c507ffc843c3c42cf4a161a63c44e48ac873f395ec3af8ef26e"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-static-action-packet-bridge-059b.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "39acc8ceea718625e9eb59f37248ac08325efe4b5acaedcc47beae2daaead2d1"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-static-engine-adapter-dry-run-059e.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "d11ad9f9e07100d068977ca687557ec03698ed5dcca7b12026a7810d3e9b0214"
    },
    {
      "path": "docs/static-preview/forge-alive/smart-widget-stack.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "86ed718dc6f8f0e7994162301ec5a1b03b684895423e890342658f6dc00d993a"
    },
    {
      "path": "docs/static-preview/templates/forge-mobile/forge-mobile-template.js",
      "score": 15,
      "reasons": [
        "event_bridge_behavior",
        "known_preview_runtime"
      ],
      "sha256": "2ef1d43782ee116547896df84484263bbd3754e6b18af7dc723bead667abeddf"
    },
    {
      "path": "accessibility-engine.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "507036c66dc90c17d3284c2ea91f9c52f5209a109b624f40f476622f7e43935f"
    },
    {
      "path": "actividad.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "2c68d08c4c67384b37ad9c59c026a3f5a2369a4abdf7dd7918ad86573d2f9aee"
    },
    {
      "path": "app.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "cca131c8950a6abd411497ece350771e6f6dc6399e0e420b18e07edeaee73048"
    },
    {
      "path": "auth-guard.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "9ce488da10a2222f19161b11cd3a965ccdafa282ab488d02891c7de6337d2bba"
    },
    {
      "path": "cartera-events.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "81e3e4230883fd6035498be908070b92d4bf84f6d72ed9d809685148de82b72d"
    },
    {
      "path": "cartera.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "5944eccf68c74294a6256b68ffb7afe4468eb2b92224a995a5dd1e7518745642"
    },
    {
      "path": "comisiones.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "e162a1116fc8adfd7ca65bccba5b00ce35e4668096d932650f197b830fd07204"
    },
    {
      "path": "crash-runtime.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "46a669e0771496af7f11b02c14f86232f2462deb96a2a6522102368abaab9699"
    },
    {
      "path": "dashboard.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "abd0030f6664760fa315a4a4f4652047bdc015674d82c56dd79dbc500cf357f7"
    },
    {
      "path": "design-system-preview.html",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "dd08737a2b27df586b75227750b91521bcd9923f38e2e00a577335be1b633717"
    },
    {
      "path": "docs/10-gui/mobile-daily/app.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "80082e672eca2f430a4b072e7efec395997e5dfae7133545869c801f61e78597"
    },
    {
      "path": "health-runtime.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "5d847efbab5649ac63ee57d3e5022c1413a44e0dbb4f7222ea1de8d30309e314"
    },
    {
      "path": "index.html",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "8c19eb1474786ff0c2b844bbb31b9c61c3689c1c9bcfe60a9abd20a20324314a"
    },
    {
      "path": "legacy/crmaddlife/chat-shell.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "1c8fd555a002c551fd997483825761c46e41d4f42632bc2b50f5410e5e222934"
    },
    {
      "path": "legacy/crmaddlife/ui-listeners.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "47f49716a8878eae07105abe2b73ab30e1e50bf61945c2aa59988f35f7a1c82d"
    },
    {
      "path": "legacy/crmaddlife/ui-shell.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "9aa36325eee3e40a4c27e60464231205c766e3228cfd37cae75220705d24fe04"
    },
    {
      "path": "manager-os/github-pages-static-preview/github-pages-static-preview-boundary-contract.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "62c7cd1b03e187feb8856b56d98ef4a447ee84a6aa8395a9274207d59490787d"
    },
    {
      "path": "network-manager.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "9372471a79749bf1968bd4a0212bac3c8f99610c6be0a4178f82dbba3c060f90"
    },
    {
      "path": "platform/app/bootstrap.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "ca3650e3af40f4e64d45a637c9825244f657957a79265557d33abee273ef3fc1"
    },
    {
      "path": "platform/app/runtime-listeners.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "16127f625c8e63c398612a15c10c11d2f9cdda8953363ad957a07f5c3283586f"
    },
    {
      "path": "platform/commands/command-palette.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "8e0fd4969d25fba0b43f992b82e3e5186f19cead2536701121e354ac218c2989"
    },
    {
      "path": "platform/commands/command-shortcuts-engine.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "fca13643a0291a97a57c0fc02f1f40471f7e1d00acf745c9555fcd4cee6eea61"
    },
    {
      "path": "platform/sync/sync-engine.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "5d1dd225cff0ea7b7a62fc1081b2b3bccecb2802d96ce69bd6ad656e484aaaed"
    },
    {
      "path": "policy-operations/policy-detail/drag-drop-policy-zone.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "e63aaa5a16bbb2e05cc5f5d64b05d391eb534272f1957e41e3b7dd6b20cb38d6"
    },
    {
      "path": "prospeccion.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "4cae2c44153225cbaca0d455d413d0f8b237cbe4309358d52ee747e309043db7"
    },
    {
      "path": "referidos.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "f018cdcfa4f647ae8a5bcc65c75e95b9974ec830809881ccd2c771a040fd371c"
    },
    {
      "path": "responsive-engine.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "c7f6f1974156c0f20a7647fbdafbe4509d74229d607be468aa7607a5856867f9"
    },
    {
      "path": "runtime.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "9230601442562ddc2e74a08f74a83eada2a4026856c6125f9caa8fd6a7278031"
    },
    {
      "path": "service-worker.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "8e3bae5e2783a312699994bae077dce1b25cef72e78cf51b178a48e7444abe59"
    },
    {
      "path": "telemetry.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "75089ac1f42a15b9346df40d304d8f6d564fd6d963242656f700afb706384c0b"
    },
    {
      "path": "utils.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "96e453328e5603005f2f00e51d248cea9e5e34ef6f7a24df0c653d59abc35662"
    },
    {
      "path": "virtual-list-engine.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "02ddccc0af39ac900e577aac87ccba5bf3a4e441a199c99f8881d4c690d21a4e"
    },
    {
      "path": "virtual-list.js",
      "score": 10,
      "reasons": [
        "event_bridge_behavior"
      ],
      "sha256": "513653e4518bb0ad05c859c2a81640ab9ce778fac205fdd85b1aa6beeadb75d2"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-desktop-command-workspace-056y.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "7a790ee9859be4b377645c79fa1ccfb4d46ffb094a130e17efe315d00f53c715"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-smart-widget-stable-056t.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "ac027c6c6ecebf3886c6dc373206b38fec21cd504a299c5a471697e7867f2a99"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-smart-widget-static-056u.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "95744e76c08cab07a24284d3807a71a249705955481abf3e0ea11411e7420a59"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-ux92-cohesion-polish.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "c34aa23c2b6034f5d2e840475c0cd8d08c58a4e0a24237430e7dea525c4ec034"
    },
    {
      "path": "docs/static-preview/forge-alive/alfred-ux99-hard-mount.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "db8fc214eb890e83efb661a6e69fb09bf070531eb8aea28ce6a93acd12a38bd0"
    },
    {
      "path": "docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "f3e0eb4683d5b1758b698dfbce18bb0ce14398604689c5e126477b643b12ede3"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-command-workspace-upgrade-058e.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "d3edd7843315f7d1cb156a234d159987f959f4b03f0bea2d9e722ae7166f518a"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-shell-grid-repair-058d.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "51d7a9ef2bd5ae30606a4bde8dfc906fb4b498497b89c11d861048519ef3c2ad"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-table-kpi-graph-density-058f.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "ac0f03943602d9bc40cae90eb80b4a8d471fda9cdb3b671936b9e00a4fd50518"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-visual-line-cleanup-058i.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "52ddba19f4eef2f27bfca3bd31df8f9d02c4449c6ff03aa0637040bf85212f81"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-desktop-visual-polish-alfred-mark-058g.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "4d21acd9648fb4de07d0891452b15f528d9038be09afe924225b02b98f004d62"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-local-read-model-preview-ui-binding-060l.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "d8ef5beea4fbf628546d83a86e9df3d5614e139d010aef1284cdeaf5e6f0ef71"
    },
    {
      "path": "docs/static-preview/forge-alive/desktop/forge-public-preview-interaction-visual-repair-060m.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "603fcccb3baa368ef41a9f17f07973a905f1615132dc9ae99fd383ce38a12b2c"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-pattern-057d.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "8f025ca7375155a9df103b4c6e166fb82120d09d5b6362cd426ebd4d63f7e5a2"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-top-nav-center-057g.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "6e905f668409479c5b965febe12d7c4e5095511a45a836d2110c659db73e1085"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-visual-polish-057f.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "7e10c6920ba95c65f6d21345b5982a093924d736dd3c414645a05419c0979fd1"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-visual-repair-057e.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "0aaa3ac1e5370933a93df02d7532f3336bf60581f39c144dc1f88ad4660817ab"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-057j.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "93851d53dbaf04faf3a593129027af8a1142e47c6c0859e969a338e5d89ce5ce"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-dedup-057m.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "5a4eb1c57be50f1cffa1da7a35afdd72223947a15535d6a196c7d7b68ee398e5"
    },
    {
      "path": "docs/static-preview/forge-alive/forge-mobile-widget-grid-polish-057l.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "15c6f79e736b07fc1ba148749c8c4ee21f6a8cf9132500cde91000e290d47824"
    },
    {
      "path": "docs/static-preview/forge-alive/genesis-beta-loop-card-data.js",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "0ed0f60bc8b27df6be8e33460471aaa053043939003d048e72cb61a225fb5346"
    },
    {
      "path": "docs/static-preview/forge-alive/index.html",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "d676906ab94bac5f03fd85f7354f3dae5718484cb7f578c2d85c23c4fdb75d3b"
    },
    {
      "path": "docs/static-preview/forge-alive/nueva-cotizacion/index.html",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "a27e945371fb39ca5858c9dbdf6f50234f514ba294feba33179edcf61dd4d797"
    },
    {
      "path": "docs/static-preview/forge-alive/sample-data.js",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "d909034f5ac400e515378987a0fad7817b4ff1139e911df63c951e1198442411"
    },
    {
      "path": "docs/static-preview/forge-alive/shared/forge-layer-boundary-058a.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "717d8dfb81197990cc6f1e136daf03610574972e8d13a7e6b922a42d12e85ec7"
    },
    {
      "path": "docs/static-preview/forge-alive/smart-widget-stack-data.js",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "592fef68b25e6531cb03920efce8ab94f1e80547f85c93380b021b571480330b"
    },
    {
      "path": "docs/static-preview/forge-alive/styles-desktop.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "ae0ac5491500e0e8508bfdf4607c8bebe0bef8db050613fbfdb1314dd8810001"
    },
    {
      "path": "docs/static-preview/forge-alive/styles-mobile.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "d97ddb499a583ea67a92d23ae61bcf19b672d91df8d68dd56dfb8d751dd950b9"
    },
    {
      "path": "docs/static-preview/forge-alive/styles.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "5b8531636c5a845661537c56700d2a9dace07602103575fdfafd22db3a9a6883"
    },
    {
      "path": "docs/static-preview/templates/forge-mobile/forge-mobile-components.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "0ee0d720337e9f8be931d7aca595eb0c8024a4822e0edf126f1b9eae9cef4a94"
    },
    {
      "path": "docs/static-preview/templates/forge-mobile/forge-mobile-shell.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "aad73e814caff2de2ab5d4c549ef0de70f64df0f8003037d5d498e34c3707b89"
    },
    {
      "path": "docs/static-preview/templates/forge-mobile/forge-mobile-tokens.css",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "3a2c9d1485321b17bd6f5487308ebfb4e885ce8b81d91999ace432f248257369"
    },
    {
      "path": "docs/static-preview/templates/forge-mobile/index.html",
      "score": 5,
      "reasons": [
        "known_preview_runtime"
      ],
      "sha256": "ba767f79617ee2f2c01f0a9a43a880f366be4a22296bcbe7f7bfc27b5fde9d56"
    }
  ]
}
```

## Repository conventions

```json
{
  "RUNTIME_DIRECTORIES": [
    "platform",
    "platform/action-contracts",
    "platform/adapters/client-crm",
    "platform/adapters/opportunity-pipeline",
    "platform/adapters/policy-read-model",
    "platform/adapters/product-intelligence",
    "platform/adapters/quote-preview",
    "platform/adapters/quote-read-model",
    "platform/app",
    "platform/auth",
    "platform/commands",
    "platform/notifications",
    "platform/routing",
    "platform/sync",
    "platform/truth",
    "platform/truth/contracts",
    "platform/truth/validators"
  ],
  "QUOTE_PREVIEW_DIRECTORIES": [
    "docs/static-preview/forge-alive/assets",
    "platform/adapters/quote-preview"
  ],
  "PLATFORM_RUNTIME_EXISTS": false
}
```

## Test matrix

```json
[
  {
    "id": "WRITE_RETURNS_EXACT_IDENTITY",
    "expected": "writer returns previewResultId plus schemaVersion"
  },
  {
    "id": "READ_REQUIRES_EXACT_IDENTITY",
    "expected": "reader rejects missing identity and never selects latest"
  },
  {
    "id": "EVENT_REFERENCE_ONLY",
    "expected": "event carries identity/reference, not raw PDF or quote truth"
  },
  {
    "id": "EIGHT_FIELDS_ROUND_TRIP",
    "expected": "all eight authorized fields survive write/read unchanged"
  },
  {
    "id": "AMBIGUOUS_FIELD_PRESERVED",
    "expected": "ambiguity metadata remains visible for confirmation"
  },
  {
    "id": "NO_RAW_PDF_OR_SECRETS",
    "expected": "rawPdfBytes, providerSecrets and backendCredentials absent"
  },
  {
    "id": "RETENTION_BOUNDARY",
    "expected": "expired preview result cannot be silently selected"
  },
  {
    "id": "NO_QUOTE_TRUTH",
    "expected": "confirmation does not authorize official quote writes"
  }
]
```

## Authorization

```json
{
  "IMPLEMENTATION_PLAN_COMPLETE": true,
  "IMPLEMENTATION_AUTHORIZATION_GATE_AUTHORIZED": true,
  "ADR_APPROVED": true,
  "IMPLEMENTATION_PLANNING_AUTHORIZED": true,
  "IMPLEMENTATION_AUTHORIZED": false,
  "CACHE_CREATION_AUTHORIZED": false,
  "BRIDGE_CREATION_AUTHORIZED": false,
  "UI_INTEGRATION_AUTHORIZED": false,
  "RUNTIME_WRITE_AUTHORIZED": false,
  "REAL_EFFECTS_AUTHORIZED": false
}
```

## Safety receipt

```json
{
  "NEW_ENGINE_CREATED": false,
  "NEW_CACHE_CREATED": false,
  "DUPLICATE_BRIDGE_CREATED": false,
  "PDF_READ_EXECUTED": false,
  "PARSER_EXECUTED": false,
  "OCR_EXECUTED": false,
  "SOURCE_UI_CHANGED": false,
  "QUOTE_TRUTH_ALLOWED": false,
  "REAL_ENGINE_EXECUTION": false,
  "BACKEND_CONNECTION": false,
  "TEST_EXECUTION": false
}
```
