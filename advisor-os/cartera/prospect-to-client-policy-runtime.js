const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = value => String(value || '').trim();

export class ProspectToClientPolicyError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'ProspectToClientPolicyError';
    this.code = code;
    this.details = details;
  }
}
const fail = (code, message, details = null) => {
  throw new ProspectToClientPolicyError(code, message, details);
};
const required = (value, code, label) => {
  const normalized = text(value);
  if (!normalized) fail(code, `${label} es obligatorio.`);
  return normalized;
};

export function normalizeConfirmedSale(input = {}) {
  const outcome = required(input.outcome, 'SALE_OUTCOME_REQUIRED', 'El resultado').toUpperCase();
  if (outcome !== 'ACCEPTED') fail('CONFIRMED_SALE_REQUIRED', 'La conversión requiere una venta aceptada.');
  return freeze({
    outcome,
    outcomeReceiptReference: required(input.outcomeReceiptReference, 'OUTCOME_RECEIPT_REQUIRED', 'El recibo de resultado'),
    personReference: required(input.personReference, 'PERSON_REFERENCE_REQUIRED', 'La persona'),
    prospectReference: required(input.prospectReference, 'PROSPECT_REFERENCE_REQUIRED', 'El prospecto'),
    quoteReference: required(input.quoteReference, 'QUOTE_REFERENCE_REQUIRED', 'La cotización'),
    quoteVersionReference: text(input.quoteVersionReference) || null,
    applicationReference: required(input.applicationReference, 'APPLICATION_REFERENCE_REQUIRED', 'La solicitud'),
    productReference: required(input.productReference, 'PRODUCT_REFERENCE_REQUIRED', 'El producto'),
    correlationId: required(input.correlationId, 'CORRELATION_ID_REQUIRED', 'La correlación'),
    requestedAccountReference: text(input.requestedAccountReference) || null,
  });
}

function assertReference(actual, expected, code, label) {
  if (actual && actual !== expected) fail(code, `${label} no coincide.`, { actual, expected });
}

function normalizeAccountPreview(value) {
  if (!value || !['EXISTING_ACCOUNT_LINKED', 'REVIEW_REQUIRED'].includes(value.status)) {
    fail('ACCOUNT_RECONCILIATION_PREVIEW_INVALID', 'La autoridad de Account no devolvió un preview válido.');
  }
  if (value.accountCreated === true || value.accountCreationAuthorized === true) {
    fail('ACCOUNT_CREATION_FORBIDDEN', 'Sprint 08 no autoriza creación automática de Account.');
  }
  return freeze(clone(value));
}

function hasVerifiedPolicy(lineage) {
  return Boolean(
    lineage?.policy?.policyReference &&
    lineage?.application?.applicationReference &&
    lineage?.application?.personReference &&
    lineage?.personRole?.confirmationState === 'CONFIRMED'
  );
}

function assertLineage(lineage, sale) {
  if (!hasVerifiedPolicy(lineage)) fail('VERIFIED_POLICY_LINEAGE_REQUIRED', 'Se requiere Policy verificada y PolicyRole confirmado.');
  assertReference(lineage.application.personReference, sale.personReference, 'POLICY_PERSON_MISMATCH', 'La persona de Policy');
  assertReference(lineage.application.applicationReference, sale.applicationReference, 'POLICY_APPLICATION_MISMATCH', 'La Application de Policy');
  assertReference(lineage.application.quoteReference, sale.quoteReference, 'POLICY_QUOTE_MISMATCH', 'La Quote de Policy');
  assertReference(lineage.application.productReference, sale.productReference, 'POLICY_PRODUCT_MISMATCH', 'El producto de Policy');
  return lineage;
}

export function createProspectToClientPolicyRuntime({
  personAuthority,
  pipelineAuthority,
  applicationAuthority,
  accountReconciliationAuthority,
  policyLineageAuthority,
  portfolioAuthority,
  pipelineClosureAuthority,
  timelineAuthority,
} = {}) {
  async function prepare(input = {}) {
    const sale = normalizeConfirmedSale(input);
    if (!personAuthority?.resolveConfirmedPerson) fail('PERSON_AUTHORITY_REQUIRED', 'La autoridad de Persona no está conectada.');
    if (!pipelineAuthority?.resolveActiveProspect) fail('PIPELINE_AUTHORITY_REQUIRED', 'La autoridad de Pipeline no está conectada.');
    if (!applicationAuthority?.getApprovedApplication) fail('APPLICATION_AUTHORITY_REQUIRED', 'La autoridad de Application no está conectada.');
    if (!accountReconciliationAuthority?.prepareAccountReconciliation) fail('ACCOUNT_RECONCILIATION_AUTHORITY_REQUIRED', 'La autoridad de Account no está conectada.');
    if (!policyLineageAuthority?.getApplicationPolicyLineage) fail('POLICY_LINEAGE_AUTHORITY_REQUIRED', 'La autoridad CRS 07 no está conectada.');

    const [person, prospect, application, accountPreview, policyLineage] = await Promise.all([
      personAuthority.resolveConfirmedPerson({ personReference: sale.personReference }),
      pipelineAuthority.resolveActiveProspect({ prospectReference: sale.prospectReference }),
      applicationAuthority.getApprovedApplication({ applicationReference: sale.applicationReference }),
      accountReconciliationAuthority.prepareAccountReconciliation({
        personReference: sale.personReference,
        applicationReference: sale.applicationReference,
        requestedAccountReference: sale.requestedAccountReference,
        correlationId: sale.correlationId,
      }),
      policyLineageAuthority.getApplicationPolicyLineage({
        applicationReference: sale.applicationReference,
        correlationId: sale.correlationId,
      }),
    ]);

    assertReference(person?.personReference, sale.personReference, 'PERSON_IDENTITY_MISMATCH', 'La persona');
    assertReference(prospect?.personReference, sale.personReference, 'PROSPECT_PERSON_MISMATCH', 'El prospecto');
    assertReference(application?.personReference, sale.personReference, 'APPLICATION_PERSON_MISMATCH', 'La Application');
    assertReference(application?.prospectReference, sale.prospectReference, 'APPLICATION_PROSPECT_MISMATCH', 'El prospecto de Application');
    assertReference(application?.quoteReference, sale.quoteReference, 'APPLICATION_QUOTE_MISMATCH', 'La Quote de Application');
    assertReference(application?.productReference, sale.productReference, 'APPLICATION_PRODUCT_MISMATCH', 'El producto de Application');
    if (application?.lifecycleState !== 'APPROVED') fail('APPROVED_APPLICATION_REQUIRED', 'La Application debe estar aprobada.');

    return freeze({
      status: 'CONVERSION_PREVIEW_REQUIRED',
      sale,
      person: clone(person),
      prospect: clone(prospect),
      application: clone(application),
      accountPreview: normalizeAccountPreview(accountPreview),
      policyLineage: clone(policyLineage),
      policyAlreadyVerified: hasVerifiedPolicy(policyLineage),
      directWrite: false,
      clientProjectionOnly: true,
      accountCreationAuthorized: false,
      pipelineCloseAuthorized: false,
    });
  }

  async function confirm(preview, confirmation = {}) {
    if (preview?.status !== 'CONVERSION_PREVIEW_REQUIRED') fail('CONVERSION_PREVIEW_REQUIRED', 'La conversión requiere preview.');
    if (confirmation.confirmedByAdvisor !== true) fail('HUMAN_CONFIRMATION_REQUIRED', 'La conversión requiere confirmación humana.');
    const confirmationReference = required(confirmation.confirmationReference, 'CONFIRMATION_REFERENCE_REQUIRED', 'La confirmación');
    const idempotencyKey = required(confirmation.idempotencyKey, 'IDEMPOTENCY_KEY_REQUIRED', 'La idempotencia');
    const sale = normalizeConfirmedSale(preview.sale);

    let accountReceipt = preview.accountPreview;
    if (accountReceipt.status === 'REVIEW_REQUIRED') {
      if (!accountReconciliationAuthority?.confirmExistingAccountLink) {
        fail('ACCOUNT_LINK_CONFIRMATION_AUTHORITY_REQUIRED', 'La decisión de Account no está conectada.');
      }
      accountReceipt = await accountReconciliationAuthority.confirmExistingAccountLink({
        ...clone(accountReceipt),
        personReference: sale.personReference,
        applicationReference: sale.applicationReference,
        confirmedByAdvisor: true,
        confirmationReference,
        idempotencyKey: `${idempotencyKey}:account`,
      });
    }
    if (!accountReceipt?.accountReference) fail('ACCOUNT_LINK_RECEIPT_REQUIRED', 'La autoridad no confirmó el Account existente.');
    if (accountReceipt.accountCreated === true) fail('ACCOUNT_CREATION_FORBIDDEN', 'La autoridad intentó crear un Account.');
    assertReference(accountReceipt.personReference, sale.personReference, 'ACCOUNT_PERSON_MISMATCH', 'La persona de Account');

    let lineage = preview.policyLineage;
    if (!hasVerifiedPolicy(lineage)) {
      if (!policyLineageAuthority?.confirmIssuedPolicyFromApplication) {
        fail('POLICY_CONFIRMATION_AUTHORITY_REQUIRED', 'La confirmación de Policy CRS 07 no está conectada.');
      }
      const command = confirmation.issuedPolicyCommand;
      if (!command || typeof command !== 'object') fail('ISSUED_POLICY_COMMAND_REQUIRED', 'Se requiere el comando gobernado de Policy emitida.');
      const policyReceipt = await policyLineageAuthority.confirmIssuedPolicyFromApplication({
        applicationReference: sale.applicationReference,
        sourceAuthority: confirmation.sourceAuthority || 'CARTERA_020C',
        command: clone(command),
        confirmedByAdvisor: true,
        confirmationReference,
      });
      if (policyReceipt?.policyCreatedByApplication !== false) {
        fail('POLICY_AUTHORITY_BOUNDARY_VIOLATED', 'Application no puede crear Policy automáticamente.');
      }
      lineage = await policyLineageAuthority.getApplicationPolicyLineage({
        applicationReference: sale.applicationReference,
        correlationId: sale.correlationId,
      });
    }
    assertLineage(lineage, sale);

    if (!portfolioAuthority?.verifyPolicyVisible) fail('PORTFOLIO_AUTHORITY_REQUIRED', 'La autoridad de Cartera no está conectada.');
    const portfolioVisibility = await portfolioAuthority.verifyPolicyVisible({
      personReference: sale.personReference,
      policyReference: lineage.policy.policyReference,
      accountReference: accountReceipt.accountReference,
    });
    if (portfolioVisibility?.visible !== true) fail('POLICY_NOT_VISIBLE_IN_PORTFOLIO', 'La Policy no está visible en Cartera.');

    if (!pipelineClosureAuthority?.closeWon) fail('PIPELINE_CLOSURE_AUTHORITY_REQUIRED', 'La autoridad de cierre de Pipeline no está conectada.');
    const pipelineClosure = await pipelineClosureAuthority.closeWon({
      personReference: sale.personReference,
      prospectReference: sale.prospectReference,
      quoteReference: sale.quoteReference,
      applicationReference: sale.applicationReference,
      policyReference: lineage.policy.policyReference,
      correlationId: sale.correlationId,
      confirmedByAdvisor: true,
      confirmationReference,
      idempotencyKey: `${idempotencyKey}:pipeline`,
    });
    if (!pipelineClosure?.mutationId || pipelineClosure?.resolution !== 'CLOSED_WON') {
      fail('PIPELINE_CLOSURE_RECEIPT_INVALID', 'Pipeline no confirmó CLOSED_WON.');
    }

    const timelineContinuity = timelineAuthority?.composeContinuity
      ? await timelineAuthority.composeContinuity({
          personReference: sale.personReference,
          prospectReference: sale.prospectReference,
          quoteReference: sale.quoteReference,
          applicationReference: sale.applicationReference,
          policyReference: lineage.policy.policyReference,
          pipelineEventReference: pipelineClosure.eventReference || pipelineClosure.mutationId,
        })
      : freeze({
          personReference: sale.personReference,
          sourceReferences: freeze({
            quoteReference: sale.quoteReference,
            applicationReference: sale.applicationReference,
            policyReference: lineage.policy.policyReference,
            pipelineEventReference: pipelineClosure.eventReference || pipelineClosure.mutationId,
          }),
          timelineMutation: false,
        });

    return freeze({
      status: 'CONVERSION_CONFIRMED',
      sale,
      client: freeze({
        projectionType: 'COMMERCIAL_PERSON_WITH_CONFIRMED_POLICY_ROLE',
        personReference: sale.personReference,
        accountReference: accountReceipt.accountReference,
        policyReference: lineage.policy.policyReference,
        clientRowCreated: false,
      }),
      accountReceipt: clone(accountReceipt),
      policyLineage: clone(lineage),
      portfolioVisibility: clone(portfolioVisibility),
      pipelineClosure: clone(pipelineClosure),
      timelineContinuity: clone(timelineContinuity),
      confirmationReference,
      idempotencyKey,
    });
  }

  return freeze({
    prepare,
    confirm,
    diagnostics: () => freeze({
      directDatabaseWrite: false,
      duplicatePersonCreation: false,
      clientIsProjection: true,
      accountCreationAuthorized: false,
      automaticPolicyCreation: false,
      policyAuthorityReused: true,
      applicationAuthorityReused: true,
      pipelineCloseBeforePolicyVerification: false,
      humanConfirmationRequired: true,
      unknownAsZero: false,
    }),
  });
}
