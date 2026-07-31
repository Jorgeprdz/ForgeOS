from pathlib import Path


def replace_once(text: str, old: str, new: str, code: str) -> str:
    if old not in text:
        raise SystemExit(code)
    return text.replace(old, new, 1)


hotfix_path = Path("docs/static-preview/forge-alive-material3/pipeline-public-acceptance-hotfix.js")
hotfix = hotfix_path.read_text()
hotfix = replace_once(
    hotfix,
    '''    .pipeline-module .pipeline-module__productive-identity {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-auto-flow: row !important;
      align-items: start !important;
      gap: 8px 10px !important;
    }

    .pipeline-module .pipeline-module__productive-name {
      grid-column: 1 !important;
      grid-row: 1 / span 2 !important;
      min-width: 0 !important;
    }
''',
    '''    .pipeline-module .pipeline-module__productive-identity {
      position: relative !important;
      display: block !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-name {
      width: 100% !important;
      min-width: 0 !important;
    }

    .pipeline-module .pipeline-module__productive-name > strong {
      box-sizing: border-box !important;
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      padding-right: 118px !important;
    }
''',
    "HOTFIX_IDENTITY_BLOCK_NOT_FOUND",
)
hotfix = replace_once(
    hotfix,
    '''    .pipeline-module .pipeline-module__stage-control--compact {
      grid-column: 2 !important;
      grid-row: 1 !important;
      align-self: start !important;
      justify-self: end !important;
      width: auto !important;
      min-width: 0 !important;
      margin: 0 !important;
    }
''',
    '''    .pipeline-module .pipeline-module__stage-control--compact {
      position: absolute !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2 !important;
      width: auto !important;
      min-width: 0 !important;
      margin: 0 !important;
    }
''',
    "HOTFIX_STAGE_BLOCK_NOT_FOUND",
)
hotfix = replace_once(
    hotfix,
    '''    @media (max-width: 560px) {
      .pipeline-module .pipeline-module__productive-identity {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .pipeline-module .pipeline-module__productive-name,
      .pipeline-module .pipeline-module__stage-control--compact {
        grid-column: 1 !important;
        grid-row: auto !important;
      }

      .pipeline-module .pipeline-module__stage-control--compact {
        justify-self: start !important;
      }
    }
''',
    '''    @media (max-width: 560px) {
      .pipeline-module .pipeline-module__productive-identity {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 8px !important;
      }

      .pipeline-module .pipeline-module__productive-name > strong {
        padding-right: 0 !important;
      }

      .pipeline-module .pipeline-module__stage-control--compact {
        position: static !important;
        justify-self: start !important;
      }
    }
''',
    "HOTFIX_MOBILE_BLOCK_NOT_FOUND",
)
hotfix_path.write_text(hotfix)


diagnostic_path = Path("tools/forge-ui-visual-diagnostic.mjs")
diagnostic = diagnostic_path.read_text()
diagnostic = replace_once(
    diagnostic,
    '''      await sampleCard.locator("[data-productive-stage-control]")
        .selectOption("decision");
      await page.locator("[data-productive-prospect-card]").filter({
        hasText: SAMPLE_REFERRAL.fullName,
      }).locator("[data-productive-stage-label]").filter({
        hasText: "En decisión",
      }).waitFor({ state: "visible", timeout: 10_000 });
''',
    '''      await sampleCard.locator("[data-productive-stage-control]")
        .selectOption("decision");
      await page.waitForFunction(({ name, status }) => {
        const card = [...document.querySelectorAll("[data-productive-prospect-card]")]
          .find(element => element.textContent.includes(name));
        return card?.querySelector("[data-productive-stage-control]")?.value === status;
      }, {
        name: SAMPLE_REFERRAL.fullName,
        status: "decision",
      }, { timeout: 10_000 });
''',
    "DIAGNOSTIC_STAGE_WAIT_NOT_FOUND",
)
diagnostic = replace_once(
    diagnostic,
    '''      productiveStageLabelVisible:
        visibleCount("[data-productive-stage-label]") > 0,
''',
    '''      productiveStageLabelVisible: (() => {
        const compactAuthority =
          document.documentElement.dataset.pipelineStageAuthority
            === "pipeline-public-acceptance-hotfix";
        if (compactAuthority) {
          return visibleCount("[data-productive-stage-control]") > 0
            && visibleCount("[data-productive-stage-label]") === 0;
        }
        return visibleCount("[data-productive-stage-label]") > 0;
      })(),
''',
    "DIAGNOSTIC_STAGE_FLAG_NOT_FOUND",
)
diagnostic_path.write_text(diagnostic)


test_path = Path("tests/pipeline-public-acceptance-hotfix-regression.mjs")
test = test_path.read_text()
test = replace_once(
    test,
    '''  const stageBox = await stageControl.boundingBox();
  assert.ok(stageBox && stageBox.height <= 36 && stageBox.width <= 160, "STAGE_CONTROL_NOT_COMPACT");
''',
    '''  const stageBox = await stageControl.boundingBox();
  assert.ok(stageBox && stageBox.height <= 36 && stageBox.width <= 160, "STAGE_CONTROL_NOT_COMPACT");
  const nameBox = await firstCard.locator("[data-productive-card-identity] strong").boundingBox();
  assert.ok(nameBox && nameBox.width >= 180, "PRODUCTIVE_NAME_WIDTH_REGRESSION");
''',
    "HOTFIX_TEST_STAGE_ASSERT_NOT_FOUND",
)
test_path.write_text(test)


Path(".github/workflows/pipeline-real-interaction.yml").write_text('''name: Pipeline Real Interaction Regression

on:
  pull_request:
    branches: [main]
    paths:
      - docs/static-preview/forge-alive-material3/**
      - advisor-os/sales-pipeline/**
      - supabase/migrations/20260731000100_pipeline_prospect_journal.sql
      - tests/pipeline-real-interaction-regression.mjs
      - tests/pipeline-prospect-admin-regression.mjs
      - tests/pipeline-action-identity-regression.mjs
      - tests/pipeline-context-journal-regression.mjs
      - tests/pipeline-public-acceptance-hotfix-regression.mjs
      - tests/prospect-journal-service-contract-test.mjs
      - tools/forge-ui-visual-diagnostic.mjs
      - .github/workflows/pipeline-real-interaction.yml
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - name: Verify journal persistence contract
        run: node --test tests/prospect-journal-service-contract-test.mjs
      - run: npx playwright install --with-deps chromium
      - name: Start Vite
        shell: bash
        run: |
          nohup npm run serve:e2e > /tmp/forge-pipeline-vite.log 2>&1 &
          ready=0
          for attempt in $(seq 1 60); do
            if curl --fail --silent http://127.0.0.1:4173/docs/static-preview/forge-alive-material3/ >/dev/null; then
              ready=1
              break
            fi
            sleep 1
          done
          if [ "$ready" -ne 1 ]; then
            cat /tmp/forge-pipeline-vite.log
            false
          fi
      - name: Verify stage persistence
        run: timeout 120s node tests/pipeline-real-interaction-regression.mjs
      - name: Verify prospect administration
        run: timeout 120s node tests/pipeline-prospect-admin-regression.mjs
      - name: Verify action identity
        run: timeout 120s node tests/pipeline-action-identity-regression.mjs
      - name: Verify context journal
        run: timeout 120s node tests/pipeline-context-journal-regression.mjs
      - name: Verify public acceptance hotfix
        run: timeout 120s node tests/pipeline-public-acceptance-hotfix-regression.mjs
''')
