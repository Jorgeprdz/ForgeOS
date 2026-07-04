# Forge UI Action Packet Contract 059A

Status: CONTRACT LOCKED FOR NEXT BRIDGE

Decision token:
DECISION=FORGE_UI_ACTION_PACKET_CONTRACT_059A

Next:
NEXT=059B_STATIC_ACTION_PACKET_BRIDGE

## Packet Shape

```json
{
  "actionId": "client.follow.preview",
  "sourceSurface": "desktop.command_workspace",
  "sourcePlatform": "desktop",
  "sourceModule": "clientes",
  "humanLabel": "Follow Juan",
  "previewMode": true,
  "requiresHumanApproval": true,
  "createdAtLocal": "local-preview-only",
  "safeIntent": "Prepare a read-only follow-up preview.",
  "target": {
    "clientId": "sample-client-juan",
    "clientName": "Juan"
  },
  "context": {
    "riskLevel": "medium",
    "reason": "Seguimiento pendiente",
    "recommendedNextStep": "Revisar antes de enviar"
  },
  "previewPayload": {
    "title": "Preparar follow",
    "body": "Abrir preview con contexto listo.",
    "safety": "Sin envio, sin CRM, sin calendario."
  }
}
```

## Source Surface Values

| Value | Meaning |
| --- | --- |
| `desktop.command_workspace` | Desktop command entry and suggestion chips. |
| `desktop.table_row` | Desktop table row action. |
| `desktop.decision_strip` | Alfred decision strip action. |
| `desktop.right_rail` | Alfred rail recommendation action. |
| `mobile.command_card` | Mobile Alfred/command hero action. |
| `mobile.widget_grid` | Mobile widget card action. |
| `mobile.bottom_nav` | Mobile navigation action. |

## Platform Values

| Value | Meaning |
| --- | --- |
| `desktop` | Desktop/laptop view at 901px and above. |
| `mobile` | Phone/mobile view. |
| `tablet` | Reserved for future tablet split behavior. |

## Module Values

| Value | Meaning |
| --- | --- |
| `inicio` | Daily overview and review. |
| `pipeline` | Pipeline opportunities. |
| `clientes` | Client actions. |
| `cotizaciones` | Quote workflows. |
| `polizas` | Policy/document workflows. |
| `reportes` | Reports and analytics. |
| `alfred` | Alfred recommendation surface. |

## Safety Defaults

| Field | Required value in 059A |
| --- | --- |
| `previewMode` | `true` |
| `requiresHumanApproval` | `true` |
| write actions | forbidden |
| send actions | forbidden |
| calendar creation | forbidden |
| CRM mutation | forbidden |
| browser storage mutation | forbidden |

## Adapter Candidate Map

| Action id | Candidate adapter | 059A status |
| --- | --- | --- |
| `quote.create.preview` | static quote action packet | defined only |
| `policy.upload.preview` | static document action packet | defined only |
| `client.follow.preview` | static follow action packet | defined only |
| `client.call.preview` | static call-prep action packet | defined only |
| `client.message.preview` | static message-draft action packet | defined only |
| `client.search.preview` | static search/read action packet | defined only |
| `policy.open.preview` | static policy-read action packet | defined only |
| `report.open.preview` | static report-read action packet | defined only |
| `pipeline.review.preview` | static pipeline-review packet | defined only |
| `day.review.preview` | static daily-review packet | defined only |

## Final Decision

DECISION=FORGE_UI_ACTION_PACKET_CONTRACT_059A

NEXT=059B_STATIC_ACTION_PACKET_BRIDGE
