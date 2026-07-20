import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const Actions = require('../advisor-os/sales-pipeline/prospect-contact-actions.js');
globalThis.ForgeProspectContactActions067G17C2A = Actions;
const UI = require('../advisor-os/sales-pipeline/productive-prospect-ui.js');
const privateFields = ['estimatedIncome', 'initialContext', 'productsOfInterest', 'health', 'financialNeeds', 'privateNotes'];
const verifiedField = value => ({ value, evidence:['fixture:verified'], verificationStatus:'VERIFIED', freshness:'2026-07-20T00:00:00Z', privacyClassification:'FORGE_CONFIDENTIAL_PROSPECT' });
const messageContext = (name='Marlene Ruiz') => ({
  prospectIdentityReference:'prospect:fixture', advisorIdentityReference:'advisor:fixture',
  contextPurpose:'PROSPECT_INTRODUCTION', projectedAt:'2026-07-20T00:00:00Z',
  fields:{ prospectDisplayName:verifiedField(name), advisorDisplayName:verifiedField('Jorge Palacios') },
});

test('phone normalization and tel action use a canonical valid number', () => {
  assert.equal(Actions.normalizePhone('55 1234 5678'), '+525512345678');
  assert.equal(Actions.normalizePhone('+52 (55) 1234-5678'), '+525512345678');
  assert.equal(Actions.normalizePhone('123'), null);
  assert.deepEqual(Actions.buildCallAction({ phoneNormalized: '+525512345678' }), {
    enabled: true, phone: '+525512345678', href: 'tel:+525512345678',
  });
  assert.equal(Actions.buildCallAction({ phone: 'invalid' }).enabled, false);
});

test('WhatsApp destination is digits-only and draft is encoded, reviewable, and safe', () => {
  const prospect = {
    fullName: 'Marlene Ruiz', whatsappNormalized: '+525512345678', source: 'Referido',
    referrerName: 'Ana López', estimatedIncome: 90000, initialContext: 'Diagnóstico de salud',
    productsOfInterest: ['GMM'], financialNeeds: 'privado', privateNotes: 'no compartir',
    prospectMessageContextInput: messageContext(),
  };
  const action = Actions.buildWhatsAppAction(prospect, 'profesional');
  assert.equal(action.digits, '525512345678');
  assert.match(action.href, /^https:\/\/wa\.me\/525512345678\?text=/);
  assert.equal(new URL(action.href).searchParams.get('text'), action.draft);
  assert.match(action.draft, /^Hola, Marlene Ruiz\. Soy Jorge Palacios\./);
  assert.deepEqual(action.draftCandidate.usedFields, ['prospectDisplayName', 'advisorDisplayName']);
  assert.doesNotMatch(action.draft, /Soy tu asesor/i);
  for (const value of privateFields.map(key => prospect[key]).flat()) {
    if (value) assert.doesNotMatch(action.draft, new RegExp(String(value), 'i'));
  }
  const unverified = Actions.buildWhatsAppDraft({ fullName: 'Marlene', source: 'Evento', referrerName: 'Inventado' });
  assert.equal(unverified.status, 'NO_DRAFT');
});

test('Google Calendar composer validates local inputs and minimizes PII', () => {
  const prospect = { fullName: 'Marlene Ruiz', estimatedIncome: 90000, health: 'diagnóstico', privateNotes: 'privado' };
  assert.equal(Actions.buildCalendarAction(prospect, { date: '2026-02-30', time: '09:00' }).enabled, false);
  assert.equal(Actions.buildCalendarAction(prospect, { date: '2026-08-12', time: '25:00' }).enabled, false);
  assert.equal(Actions.buildCalendarAction(prospect, { date: '2026-08-12', time: '09:00', timezone: 'Invalid/Zone' }).enabled, false);
  const action = Actions.buildCalendarAction(prospect, { date: '2026-08-12', time: '09:30', durationMinutes: 45, timezone: 'America/Mexico_City' });
  const url = new URL(action.href);
  assert.equal(action.enabled, true);
  assert.equal(url.origin, 'https://calendar.google.com');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), 'Cita con Marlene Ruiz');
  assert.equal(url.searchParams.get('dates'), '20260812T093000/20260812T101500');
  assert.equal(url.searchParams.get('ctz'), 'America/Mexico_City');
  for (const value of privateFields.map(key => prospect[key]).filter(Boolean)) assert.doesNotMatch(action.href, new RegExp(String(value), 'i'));
});

test('detail renders three explicit semantic controls and understandable disabled states', () => {
  const valid = UI.detailTemplate({ fullName: 'Marlene', status: 'referred_new', phoneNormalized: '+525512345678', prospectMessageContextInput:messageContext('Marlene') });
  assert.match(valid, />Llamar<\/a>/);
  assert.match(valid, />WhatsApp<\/a>/);
  assert.match(valid, />Agendar<\/a>/);
  assert.match(valid, /target="_blank" rel="noopener noreferrer"/);
  assert.match(valid, /Mensaje para revisar/);
  assert.match(valid, /America\/Mexico_City/);
  const invalid = UI.detailTemplate({ fullName: 'Marlene', status: 'referred_new', phone: '123' });
  assert.match(invalid, /aria-disabled="true" title="No hay un número válido"[^>]*data-call-action>Llamar<\/span>/);
  assert.match(invalid, /data-whatsapp-action>WhatsApp<\/span>/);
});

test('builders are pure and contain no external execution or status mutation', () => {
  const prospect = Object.freeze({ fullName: 'Marlene', phoneNormalized: '+525512345678', status: 'referred_new' });
  const before = JSON.stringify(prospect);
  Actions.buildCallAction(prospect);
  Actions.buildWhatsAppAction(prospect, 'cercano');
  Actions.buildCalendarAction(prospect, { date: '2026-08-12', time: '09:30' });
  assert.equal(JSON.stringify(prospect), before);
  const source = readFileSync('advisor-os/sales-pipeline/prospect-contact-actions.js', 'utf8');
  assert.doesNotMatch(source, /window\.open|\.click\s*\(|location\.(?:assign|replace)|\bfetch\s*\(|setTimeout|setInterval|MutationObserver|PerformanceObserver|status\s*=(?!=)|updateProspect|archiveProspect/);
});

test('existing bootstrap chain loads context, draft, and contact authorities without route changes', async () => {
  const source = readFileSync('advisor-os/sales-pipeline/productive-prospect-bootstrap.js', 'utf8');
  const appended = [];
  const sandbox = {
    URL, Error, Object, Promise,
    document: {
      currentScript: { src:'https://forge.test/advisor-os/sales-pipeline/productive-prospect-bootstrap.js' },
      baseURI: 'https://forge.test/docs/static-preview/forge-alive/index.html',
      createElement: () => ({ dataset:{} }),
      head: { append(script) {
        appended.push(script);
        if (script.src.endsWith('prospect-message-context-adapter.js')) sandbox.ForgeProspectMessageContextAdapter067G17N6 = {};
        else if (script.src.endsWith('nash-prospect-deterministic-draft-adapter.js')) sandbox.ForgeNashProspectDeterministicDraftAdapter067G17N7 = {};
        else sandbox.ForgeProspectContactActions067G17C2A = {};
        script.onload();
      } },
    },
    ForgeAlivePublicConfig067G17A1: { current:() => ({ state:'BLOCKED' }), allowsProductiveProspectCrud:() => false },
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox);
  await assert.rejects(sandbox.ForgeProductiveProspectBootstrap067G17B.getClient(), error => error.code === 'CONFIG_BLOCKED');
  assert.deepEqual(appended.map(script => script.src), [
    'https://forge.test/advisor-os/sales-pipeline/prospect-message-context-adapter.js',
    'https://forge.test/manager-os/message-generation/nash-prospect-deterministic-draft-adapter.js',
    'https://forge.test/advisor-os/sales-pipeline/prospect-contact-actions.js',
  ]);
});
