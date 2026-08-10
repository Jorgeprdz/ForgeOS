import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hydratePipelineContact010j } from '../docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v3.js';
import { suppressDuplicatePolicyRadar010j } from '../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js';
import { groupHomeCarteraFocusItems010j } from '../docs/static-preview/forge-aura/home/home-adapter-pages-v2.js';

const POLICY_REFERENCE = 'policy:cartera:' + 'a'.repeat(40);
const PERSON_REFERENCE = 'person:cartera:' + 'a'.repeat(40);

function productionRadarShape() {
  return {
    items: [
      {
        signalReference: `CARTERA050:DOCUMENT:${POLICY_REFERENCE}`,
        personReference: PERSON_REFERENCE,
        personDisplayName: 'PERSONA DEMO',
        policyReference: POLICY_REFERENCE,
        signalType: 'INCOMPLETE_POLICY_DATA',
        horizon: 'TODAY',
        truthClass: 'RECOMMENDATION',
        whyNow: 'La póliza está incompleta.',
        uncertainty: 'No prueba un problema contractual.',
        smallestUsefulAction: 'Abrir el documento fuente.',
      },
      {
        signalReference: `CARTERA050:REVIEW:${PERSON_REFERENCE}`,
        personReference: PERSON_REFERENCE,
        personDisplayName: 'PERSONA DEMO',
        policyReference: null,
        signalType: 'RELATIONSHIP_REVIEW_DUE',
        horizon: 'TODAY',
        truthClass: 'RECOMMENDATION',
        whyNow: 'No existe una revisión anual confirmada.',
        uncertainty: 'La memoria puede estar incompleta.',
        smallestUsefulAction: 'Revisar el brief relacional.',
      },
    ],
  };
}

test('010J uses prospects.phone_normalized after row camelization even when CommercialPerson phone is null', () => {
  const card = hydratePipelineContact010j({
    id: '11111111-1111-4111-8111-111111111111',
    phone: null,
    prospect: {
      phoneNormalized: '+525500001234',
      whatsappNormalized: null,
      confirmedCommercialPersonPhone: null,
    },
  });
  assert.equal(card.phone, '+525500001234');
  assert.equal(card.prospect.contactPhone, '+525500001234');
});

test('010J suppresses Radar INCOMPLETE_POLICY_DATA when canonical Policy already produces the same attention cause', () => {
  const home = suppressDuplicatePolicyRadar010j({
    policies: [{
      policy_reference: POLICY_REFERENCE,
      completeness_state: 'PARTIAL',
      freshness_state: 'CURRENT',
      conflict_state: 'CLEAR',
    }],
    radar: productionRadarShape(),
  });
  assert.equal(home.radar.items.length, 1);
  assert.equal(home.radar.items[0].signalType, 'RELATIONSHIP_REVIEW_DUE');
});

test('010J Home groups multiple Cartera contexts for the same confirmed person into one visible subject', () => {
  const grouped = groupHomeCarteraFocusItems010j(productionRadarShape());
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].personReference, PERSON_REFERENCE);
  assert.equal(grouped[0].relatedSignalCount, 2);
  assert.deepEqual([...grouped[0].relatedSignalTypes].sort(), ['INCOMPLETE_POLICY_DATA', 'RELATIONSHIP_REVIEW_DUE'].sort());
});

test('010J evidence renderer understands real field_claims confirmedValue/candidateValue and coverageCandidates', () => {
  const source = fs.readFileSync(new URL('../docs/static-preview/forge-aura/cartera/cartera-module-v7.js', import.meta.url), 'utf8');
  assert.match(source, /confirmedValue/);
  assert.match(source, /candidateValue/);
  assert.match(source, /coverageCandidates/);
  assert.match(source, /Candidato extraído · no confirmado como hecho canónico/);
  assert.match(source, /Evidencia ≠ verdad canónica/);
});

test('010J projects confirmed Pipeline identity continuity without name matching or identity writes', () => {
  const adapter = fs.readFileSync(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js', import.meta.url), 'utf8');
  const module = fs.readFileSync(new URL('../docs/static-preview/forge-aura/cartera/cartera-module-v7.js', import.meta.url), 'utf8');
  assert.match(adapter, /source_identity_type', 'PROSPECT'/);
  assert.match(adapter, /LINK_CONFIRMED/);
  assert.match(module, /Pipeline vinculado/);
  assert.doesNotMatch(adapter, /normalizedName|match.*name|\.insert\(|\.update\(|\.delete\(/i);
  assert.doesNotMatch(module, /\.insert\(|\.update\(|\.delete\(/i);
});

test('010J Aura cutover points to v3/v12/v7/Home v2 and mobile overflow hardening', () => {
  const index = fs.readFileSync(new URL('../docs/static-preview/forge-aura/index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../docs/static-preview/forge-aura/cartera/cartera-mobile-contract-010j.css', import.meta.url), 'utf8');
  assert.match(index, /pipeline-adapter-pages-v3\.js/);
  assert.match(index, /cartera-adapter-pages-v12\.js/);
  assert.match(index, /cartera-module-v7\.js/);
  assert.match(index, /home-adapter-pages-v2\.js/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
