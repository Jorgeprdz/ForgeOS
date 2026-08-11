import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [
  auraIndex,
  cartera014,
  income014,
  pipeline014,
  context014,
  humanGate014,
  coverageOwner,
  sharedPresentation,
  crsPresentation,
  crsAdapter,
  pipelineV4,
  pipelineV6,
  carteraV13,
  quoteState,
  quoteBridge,
  quotePopupHost,
  quotePage,
] = await Promise.all([
  read('docs/static-preview/forge-aura/index.html'),
  read('docs/static-preview/forge-aura/cartera/cartera-module-v11-014.js'),
  read('docs/static-preview/forge-aura/income/income-module-014.js'),
  read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-014.js'),
  read('docs/static-preview/forge-aura/recomposition/governed-context-presentation-014.js'),
  read('docs/static-preview/forge-aura/recomposition/human-language-gate-014.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-policy-evidence-presentation-013.js'),
  read('docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js'),
  read('docs/static-preview/forge-aura/recomposition/pipeline-crs10-context-presentation-013.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-crs10-context-adapter-013.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v6-013.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js'),
  read('docs/static-preview/quote-runtime/forge-quote-intake-state.js'),
  read('docs/static-preview/quote-runtime/forge-accepted-quote-bridge.js'),
  read('platform/ui/quote-preview/quote-preview-confirmation-popup-host.js'),
  read('docs/static-preview/quote-engine/nueva-cotizacion/index.html'),
]);

function forbiddenWriteCheck(source, label) {
  for (const token of ['.insert(', '.update(', '.delete(', '.rpc(', 'service_role', 'create table', 'create or replace function']) {
    assert.equal(source.toLowerCase().includes(token), false, `${label} must not add ${token}`);
  }
}

// BUG-01 — PDF lifecycle
for (const [name, fn] of [
  ['packet-ready opens existing human review without waiting for calculation', () => {
    assert.match(quoteState, /forge:accepted-quote-packet-ready/);
    assert.match(quoteState, /reviewButton\.click\(\)/);
    assert.match(quoteState, /opensReviewBeforeCalculationCompletes:\s*true/);
    assert.match(quoteState, /Datos encontrados\. Revisa la información antes de confirmarla\./);
  }],
  ['handoff retries until the existing acceptance bridge is actually ready', () => {
    assert.match(quoteState, /setTimeout\(\(\) => openExistingReview014\(packet\), 50\)/);
    assert.match(quoteState, /if \(!opened\) return false/);
    assert.ok(quoteState.indexOf('lastReviewPacket014 = packet;\n    return true;') > quoteState.indexOf('const opened = popupOpen014();'));
  }],
  ['review compatibility layer cannot calculate confirm or persist a quote', () => {
    assert.match(quoteState, /createsQuoteAuthority:\s*false/);
    assert.match(quoteState, /calculatesQuote:\s*false/);
    assert.match(quoteState, /confirmsAutomatically:\s*false/);
    assert.match(quoteState, /persistsAutomatically:\s*false/);
    assert.match(quoteBridge, /acceptedQuoteReviewSnapshotBoundary\.setSnapshot/);
  }],
]) test(`BUG01 ${name}`, fn);

// Independent lifecycle contract: state controller loads before parser/bridge; popup reuse is idempotent.
test('BUG01 route loads state lifecycle before parser and accepted-quote bridge', () => {
  const state = quotePage.indexOf('forge-quote-intake-state.js');
  const parser = quotePage.indexOf('forge-pdf-browser-parser.js');
  const bridge = quotePage.indexOf('forge-accepted-quote-bridge.js');
  assert.ok(state >= 0 && parser > state && bridge > parser, { state, parser, bridge });
});
test('BUG01 existing popup host updates an already-open review instead of duplicating it', () => {
  assert.match(quotePopupHost, /if \(open\) \{[\s\S]*pendingPreview = preview;[\s\S]*renderFields\(fields\);[\s\S]*return root;/);
});

// BUG-02 — canonical language leak
for (const [name, source, pattern] of [
  ['Cartera translates canonical-review jargon', cartera014, /Falta revisar información de esta póliza|Información encontrada en el documento|pendiente de revisión/],
  ['global gate rejects canonical vocabulary in visible DOM', humanGate014, /can\[oó\]nic/],
  ['Cartera keeps technical policy material hidden from ordinary experience', cartera014, /data\.internalOnly014 = 'true'|dataset\.internalOnly014 = 'true'/],
]) test(`BUG02 ${name}`, () => assert.match(source, pattern));

// BUG-03 — relationship language leak
for (const [name, source, pattern] of [
  ['relationship presentation is advisor-facing', crsPresentation, /Seguimiento con esta persona/],
  ['technical CRS disclosure is not rendered as ordinary relationship content', crsPresentation, /technicalDisclosureRendered:\s*false/],
  ['Pipeline translates relationship architecture terms instead of exposing them', pipeline014, /historial de seguimiento|resumen de la relación|seguimiento con cliente/],
]) test(`BUG03 ${name}`, () => assert.match(source, pattern));

// BUG-04 — coverage contradiction
for (const [name, source, pattern] of [
  ['document rows are stated as found, not absent', coverageOwner, /Encontramos \$\{evidenceCount\} \$\{coverageWord\(evidenceCount\)\} en tu póliza/],
  ['document-found coverage requires review before confirmation', coverageOwner, /Revísalas para confirmar que estén correctas/],
  ['presentation never promotes document evidence to policy truth', coverageOwner, /evidencePromotedToTruth:\s*false/],
]) test(`BUG04 ${name}`, () => assert.match(source, pattern));

test('BUG04 action becomes review rather than add-duplicate coverage', () => {
  assert.match(coverageOwner, /action\.textContent = 'Revisar coberturas'/);
});

// BUG-05 — context modal geometry
for (const [name, source, pattern] of [
  ['desktop context dialog uses the viewport instead of a narrow modal', context014, /width:min\(1080px,calc\(100vw/],
  ['context body forbids horizontal overflow and scrolls vertically', context014, /overflow-x:hidden;overflow-y:auto/],
  ['mobile context becomes full-width bounded sheet', context014, /max-height:94dvh;border-radius:24px 24px 0 0/],
]) test(`BUG05 ${name}`, () => assert.match(source, pattern));

// BUG-06 — semantic repetition
for (const [name, source, pattern] of [
  ['repeated outer summary is collapsed when richer context exists', context014, /collapseRepeatedSummary/],
  ['redundant summary is explicitly hidden', context014, /outer\.hidden = true/],
  ['relationship rendering uses one commercial heading instead of architecture narration', crsPresentation, /<h3>Seguimiento con esta persona<\/h3>/],
]) test(`BUG06 ${name}`, () => assert.match(source, pattern));

// BUG-07 — prepare-message UX
for (const [name, source, pattern] of [
  ['existing governed objective selector is surfaced as the primary control', pipeline014, /select\[data-message-goal\]/],
  ['oversized intent chips are hidden without creating a new message engine', pipeline014, /realUserHidden014/],
  ['AI-centric CTA is presented as a Forge commercial action', pipeline014, /Preparar mensaje/],
]) test(`BUG07 ${name}`, () => assert.match(source, pattern));

test('BUG07 requested commercial message types remain governed by the existing adapter', () => {
  for (const token of ['Cobranza', 'Firma de solicitud', 'Confirmar cita', 'Reprogramar', 'Después de llamada', 'Otro / Personalizado']) {
    assert.ok(pipelineV4.includes(token), token);
  }
});

// BUG-08 — AI authority boundary
for (const [name, fn] of [
  ['provider receives a governed conversation brief, not raw Pipeline', () => {
    assert.match(pipelineV4, /conversationBrief,/);
    assert.match(pipelineV4, /rawPipelineForwardedToProvider:\s*false/);
    assert.match(pipelineV4, /rawUniversalContextForwardedToProvider:\s*false/);
  }],
  ['provider failure falls back to deterministic Forge draft authority', () => {
    assert.match(pipelineV4, /ForgeDeterministicDraftRendererNFAST06/);
    assert.match(pipelineV4, /DETERMINISTIC_FALLBACK/);
  }],
  ['human remains final authority and send is never automatic', () => {
    assert.match(pipelineV6, /humanApprovalRequired:\s*true/);
    assert.match(pipelineV6, /sent:\s*false/);
    assert.match(pipelineV6, /finalAuthority:\s*'HUMAN'/);
  }],
]) test(`BUG08 ${name}`, fn);

// BUG-09 — useful Pipeline copy
for (const [name, source, pattern] of [
  ['no-commitment copy names the real business problem', pipeline014, /no tiene un siguiente paso agendado/],
  ['copy supplies a bounded useful action', pipeline014, /Agenda una fecha para retomarlo y evitar que el seguimiento pierda continuidad/],
  ['copy is tied to the governed no_commitment signal rather than guessed generically', pipeline014, /data-priority-kind="no_commitment"/],
]) test(`BUG09 ${name}`, () => assert.match(source, pattern));

// BUG-10 — Pipeline/Cartera convergence
for (const [name, fn] of [
  ['relationship context is loaded only after authoritative LINKED identity', () => {
    assert.match(crsAdapter, /base\.identityState !== 'LINKED' \|\| !base\.personReference/);
    assert.match(crsAdapter, /relationshipIntelligence:\s*null/);
  }],
  ['Pipeline reuses the existing CRS-10 relationship authority', () => {
    assert.match(crsAdapter, /crs-10-existing-relationship-intelligence-service\.js/);
    assert.match(crsAdapter, /existingCarteraIntelligenceReused:\s*true/);
    assert.match(crsAdapter, /secondRelationshipEngine:\s*false/);
  }],
  ['Cartera keeps automatic identity merge disabled', () => {
    assert.match(carteraV13, /autoIdentityMerge:\s*false/);
    assert.doesNotMatch(carteraV13, /fullName\s*===\s*.*fullName/);
  }],
]) test(`BUG10 ${name}`, fn);

test('BUG10 ambiguous identity cannot be mutated by the Pipeline context adapter', () => {
  assert.match(crsAdapter, /identityMutationAllowed:\s*false/);
  assert.match(crsAdapter, /relationshipMutationAllowed:\s*false/);
  assert.match(crsAdapter, /persistenceAllowed:\s*false/);
});

// BUG-11 — global human language gate
for (const [name, fn] of [
  ['Aura loads the visible-language auditor in the productive shell', () => {
    assert.match(auraIndex, /human-language-gate-014\.js/);
  }],
  ['gate audits visible text nodes and excludes hidden technical surfaces', () => {
    assert.match(humanGate014, /createTreeWalker/);
    assert.match(humanGate014, /\[data-internal-only-014="true"\]/);
    assert.match(humanGate014, /\.aura-technical-disclosure/);
  }],
  ['gate rejects known architecture tokens when they reach visible copy', () => {
    for (const token of ['source-owner', 'Policy Intelligence', 'Relationship Intelligence', 'CommercialPerson', 'HISTORY_LIMIT', 'CANONICAL_SOURCE_LIMIT', 'LLM']) {
      assert.ok(humanGate014.includes(token), token);
    }
  }],
]) test(`BUG11 ${name}`, fn);

// BUG-12 — Income diagnostics leak
for (const [name, source, pattern] of [
  ['Income maps limited annual history to human copy', income014, /Historial disponible: últimos \$\{count\} meses/],
  ['Income maps machine state labels to business language', income014, /ESPERADO · AÚN NO GENERADO|POSIBLE · NO GARANTIZADO/],
  ['Income removes internal diagnostic code nodes from ordinary rendering', income014, /HISTORY_LIMIT\|CANONICAL_SOURCE_LIMIT\|REASON=/],
]) test(`BUG12 ${name}`, () => assert.match(source, pattern));

test('BUG12 history is presented as income history, not canonical periods', () => {
  assert.match(income014, /Historial de ingresos/);
  assert.match(income014, /Generado/);
  assert.match(income014, /No disponible/);
});

// Transversal constitutional gates.
test('LAW ZERO unknown remains unknown in shared presentation', () => {
  assert.match(sharedPresentation, /UNKNOWN:\s*'Aún no sabemos'/);
  assert.match(sharedPresentation, /INSUFFICIENT_EVIDENCE:\s*'Falta información suficiente'/);
});

test('LAW ZERO document evidence remains separate from confirmed policy coverage', () => {
  assert.match(coverageOwner, /información encontrada en el documento, no como coberturas confirmadas/);
  assert.match(coverageOwner, /Esto no significa que la póliza no tenga coberturas/);
});

test('AI AUTHORITY gate preserves Forge-owned intent when AI cannot render', () => {
  assert.match(pipelineV6, /Forge conservó el objetivo/);
  assert.match(pipelineV6, /NO_SAFE_FALLBACK/);
  assert.match(pipelineV6, /intentFallbackApplied:\s*true/);
});

test('RELATIONSHIP CONVERGENCE gate cannot create a second relationship engine', () => {
  assert.match(pipelineV6, /secondRelationshipEngine:\s*false/);
  assert.match(crsAdapter, /createsTruth:\s*false/);
  assert.match(crsAdapter, /createsScore:\s*false/);
  assert.match(crsAdapter, /calculatesPriority:\s*false/);
});

test('SECURITY/RLS gate: new presentation wrappers do not add database or service-role writes', () => {
  for (const [label, source] of [
    ['cartera014', cartera014],
    ['income014', income014],
    ['pipeline014', pipeline014],
    ['context014', context014],
    ['humanGate014', humanGate014],
  ]) forbiddenWriteCheck(source, label);
});

test('AURA entrypoint accepts governed 015 successors while preserving 014 owner chains', () => {
  assert.match(auraIndex, /cartera-module-v12-015\.js\?v=forge-commercial-compass-015/);
  assert.match(auraIndex, /pipeline-consumer-bridge-015\.js\?v=forge-commercial-compass-015/);
  assert.match(auraIndex, /income-module-014\.js/);
  assert.match(cartera014, /cartera-module-v10-013\.js/);
  assert.match(pipeline014, /pipeline-consumer-bridge-011b\.js/);
  assert.match(income014, /income-module\.js/);
});