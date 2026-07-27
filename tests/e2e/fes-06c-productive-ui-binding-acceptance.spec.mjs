import {
  test,
  expect,
} from "@playwright/test";

const fixture =
  "/tests/e2e/fixtures/" +
  "fes06c-productive-ui-binding/index.html";

function snapshot() {
  return {
    snapshot_version:
      "forge.projection_runtime_snapshot.v1",
    snapshot_id:
      "fes06c-snapshot-001",
    snapshot_digest:
      "fes06c-digest-001",
    bundles: [
      {
        prospect_id:
          "prospect-001",
        activity: {
          items: [
            {
              activity_id:
                "activity-001",
              event_id:
                "event-001",
              category:
                "MESSAGE",
              title:
                "Mensaje aprobado",
              occurred_at:
                "2026-07-27T02:00:00.000Z",
              confirmation_state:
                "CONFIRMED",
              pending_state:
                "NONE",
              is_correction:
                false,
              is_corrected:
                false,
              payload: {
                private_text:
                  "FES06C_PRIVATE_ACTIVITY",
              },
            },
          ],
        },
        prospect_detail: {
          prospect_id:
            "prospect-001",
          identity: {
            display_name:
              "Prospecto verificado",
          },
          counters: {
            context_count: 2,
            appointment_count: 1,
            due_action_count: 1,
            conflict_count: 0,
          },
          projection_digest:
            "detail-digest-001",
          raw_note:
            "FES06C_PRIVATE_NOTE",
        },
        pipeline_card: {
          prospect_id:
            "prospect-001",
          stage: {
            code:
              "appointment_scheduled",
            label:
              "Cita",
          },
          last_activity: {
            title:
              "Mensaje aprobado",
            occurred_at:
              "2026-07-27T02:00:00.000Z",
          },
          primary_attention: {
            label:
              "Confirmar cita",
          },
          operational_status:
            "ACTIONABLE",
          conflict: false,
          projection_digest:
            "card-digest-001",
          raw_provenance:
            "FES06C_PRIVATE_PROVENANCE",
        },
      },
    ],
    mi_dia: {
      items: [
        {
          work_item_id:
            "work-001",
          prospect_id:
            "prospect-001",
          action_code:
            "CONFIRM_APPOINTMENT",
          label:
            "Confirmar cita",
          required: true,
          priority:
            "HIGH",
          due_at:
            "2026-07-27T16:00:00.000Z",
          reason_code:
            "DUE_SOON",
          stage_code:
            "appointment_scheduled",
          raw_source:
            "FES06C_PRIVATE_SOURCE",
        },
      ],
    },
  };
}

async function openReady(
  page,
  viewport,
) {
  await page.setViewportSize(
    viewport,
  );

  await page.addInitScript(
    value => {
      globalThis
        .__FES06C_INITIAL_SNAPSHOT__ =
        value;
    },
    snapshot(),
  );

  const errors = [];

  page.on(
    "pageerror",
    error => {
      errors.push(error.message);
    },
  );

  await page.goto(
    fixture,
    {
      waitUntil:
        "networkidle",
    },
  );

  await page.waitForFunction(
    () =>
      globalThis
        .__FES06C_BINDING__
        ?.current()
        ?.state === "READY",
  );

  return errors;
}

async function audit(page) {
  return page.evaluate(() => {
    const visible =
      node =>
        Boolean(
          node?.getClientRects()
            .length,
        ) &&
        getComputedStyle(node)
          .visibility !== "hidden";

    const hosts = [
      ...document
        .querySelectorAll(
          "[data-fes06b-home-binding]," +
          "[data-fes06b-pipeline-binding]," +
          "[data-fes06b-prospect-detail-binding]",
        ),
    ];

    const surfaceNodes = [
      ...document
        .querySelectorAll(
          "[data-fes06b-surface]",
        ),
    ];

    const viewportWidth =
      document.documentElement
        .clientWidth;

    const outside = hosts
      .filter(visible)
      .filter(node => {
        const rect =
          node.getBoundingClientRect();

        return (
          rect.left < -0.5 ||
          rect.right >
            viewportWidth + 0.5
        );
      })
      .map(node => ({
        selector:
          node.outerHTML.slice(
            0,
            120,
          ),
        rect:
          node.getBoundingClientRect()
            .toJSON(),
      }));

    return {
      state:
        globalThis
          .__FES06C_BINDING__
          .current()
          .state,
      diagnostics:
        globalThis
          .__FES06C_BINDING__
          .diagnostics(),
      homeHosts:
        document
          .querySelectorAll(
            "[data-fes06b-home-binding]",
          ).length,
      pipelineHosts:
        document
          .querySelectorAll(
            "[data-fes06b-pipeline-binding]",
          ).length,
      detailHosts:
        document
          .querySelectorAll(
            "[data-fes06b-prospect-detail-binding]",
          ).length,
      readySurfaces:
        surfaceNodes
          .filter(
            node =>
              node.dataset
                .fes06bState ===
              "READY",
          )
          .map(
            node =>
              node.dataset
                .fes06bSurface,
          ),
      actionControls:
        hosts.reduce(
          (
            count,
            host,
          ) =>
            count +
            host.querySelectorAll(
              "button,a,input,select,textarea",
            ).length,
          0,
        ),
      overflow:
        document.documentElement
          .scrollWidth -
        document.documentElement
          .clientWidth,
      outside,
      privateContent:
        [
          "FES06C_PRIVATE_ACTIVITY",
          "FES06C_PRIVATE_NOTE",
          "FES06C_PRIVATE_PROVENANCE",
          "FES06C_PRIVATE_SOURCE",
        ].filter(
          value =>
            document.body
              .textContent
              .includes(value),
        ),
      detailColumns:
        getComputedStyle(
          document.querySelector(
            ".forge-fes06b-detail dl",
          ),
        ).gridTemplateColumns
          .split(" ")
          .filter(Boolean)
          .length,
    };
  });
}

for (
  const profile
  of [
    {
      name:
        "mobile-390x844",
      viewport: {
        width: 390,
        height: 844,
      },
      expectedColumns: 2,
    },
    {
      name:
        "tablet-768x1024",
      viewport: {
        width: 768,
        height: 1024,
      },
      expectedColumns: 4,
    },
    {
      name:
        "desktop-1440x900",
      viewport: {
        width: 1440,
        height: 900,
      },
      expectedColumns: 4,
    },
  ]
) {
  test(
    `${profile.name} renders governed surfaces without geometry regressions`,
    async ({
      page,
    }, testInfo) => {
      const errors =
        await openReady(
          page,
          profile.viewport,
        );
      const result =
        await audit(page);

      await page.screenshot({
        path:
          testInfo.outputPath(
            `${profile.name}-ready.png`,
          ),
        fullPage: true,
      });

      expect(errors).toEqual([]);
      expect(result.state)
        .toBe("READY");
      expect(result.homeHosts)
        .toBe(1);
      expect(result.pipelineHosts)
        .toBe(1);
      expect(result.detailHosts)
        .toBe(1);
      expect(
        new Set(
          result.readySurfaces,
        ),
      ).toEqual(
        new Set([
          "ACTIVITY",
          "MI_DIA",
          "PIPELINE_CARD",
          "PROSPECT_DETAIL",
        ]),
      );
      expect(result.actionControls)
        .toBe(0);
      expect(result.overflow)
        .toBe(0);
      expect(result.outside)
        .toEqual([]);
      expect(result.privateContent)
        .toEqual([]);
      expect(result.detailColumns)
        .toBe(
          profile.expectedColumns,
        );
      expect(
        result.diagnostics
          .read_only,
      ).toBe(true);
      expect(
        result.diagnostics
          .external_execution,
      ).toBe(false);
    },
  );
}

test(
  "all explicit states render without duplicate hosts",
  async ({
    page,
  }, testInfo) => {
    await openReady(
      page,
      {
        width: 390,
        height: 844,
      },
    );

    for (
      const state
      of [
        "LOADING",
        "EMPTY",
        "UNAVAILABLE",
        "INVALID",
      ]
    ) {
      const payload =
        state === "EMPTY"
          ? {
              ...snapshot(),
              bundles: [],
              mi_dia: {
                items: [],
              },
            }
          : state === "INVALID"
            ? {
                invalid: true,
              }
            : {
                state,
              };

      await page.evaluate(
        value => {
          globalThis.dispatchEvent(
            new CustomEvent(
              "forge:event-evidence-projection-snapshot",
              {
                detail: value,
              },
            ),
          );
        },
        payload,
      );

      await page.waitForFunction(
        expected =>
          globalThis
            .__FES06C_BINDING__
            .current()
            .state === expected,
        state,
      );

      const result =
        await audit(page);

      expect(result.homeHosts)
        .toBe(1);
      expect(result.pipelineHosts)
        .toBe(1);
      expect(result.detailHosts)
        .toBe(1);
      expect(result.actionControls)
        .toBe(0);
      expect(result.overflow)
        .toBe(0);
      expect(result.outside)
        .toEqual([]);
    }

    await page.screenshot({
      path:
        testInfo.outputPath(
          "mobile-explicit-states.png",
        ),
      fullPage: true,
    });
  },
);

test(
  "ready replay is idempotent",
  async ({
    page,
  }) => {
    await openReady(
      page,
      {
        width: 1440,
        height: 900,
      },
    );

    for (
      let index = 0;
      index < 4;
      index += 1
    ) {
      await page.evaluate(
        value => {
          globalThis.dispatchEvent(
            new CustomEvent(
              "forge:event-evidence-projection-snapshot",
              {
                detail: {
                  snapshot: value,
                },
              },
            ),
          );
        },
        snapshot(),
      );
    }

    const result =
      await audit(page);

    expect(result.homeHosts)
      .toBe(1);
    expect(result.pipelineHosts)
      .toBe(1);
    expect(result.detailHosts)
      .toBe(1);
    expect(result.readySurfaces)
      .toHaveLength(4);
    expect(result.actionControls)
      .toBe(0);
  },
);
