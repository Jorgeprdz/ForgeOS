import { test, expect } from '@playwright/test';

const FIXTURE = 'http://127.0.0.1:4176/tests/fixtures/aura-cartera-020c-durable-confirmation-015.html';
const PROSPECT = 'pipeline-prospect:11111111-1111-4111-8111-111111111111';
const DURABLE_PERSON = 'person:cartera:durable-adrian';

function pdfBuffer() {
  return Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n', 'utf8');
}
const PDF = pdfBuffer();

async function open(page) {
  await page.goto(FIXTURE, { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-cartera015', 'READY');
  await page.locator('[data-add-policy]').first().click();
  await expect(page.locator('[data-pdf-input]')).toBeAttached();
  await expect(page.locator('[data-pdf-drop]')).toBeVisible();
}

async function selector(page) {
  await page.locator('[data-pdf-input]').setInputFiles({ name:'adrian-selector.pdf', type:'application/pdf', buffer:PDF });
  await expect(page.locator('[data-semantic-review="014"]')).toBeVisible({ timeout:10_000 });
}

async function drop(page) {
  const bytes=[...PDF];
  await page.locator('[data-pdf-drop]').evaluate((node,payload)=>{
    const file=new File([new Uint8Array(payload)],'adrian-drop.pdf',{type:'application/octet-stream'});
    const event=new Event('drop',{bubbles:true,cancelable:true});
    Object.defineProperty(event,'dataTransfer',{value:{files:[],items:[{kind:'file',getAsFile:()=>file}]}});
    node.dispatchEvent(event);
  },bytes);
  await expect(page.locator('[data-semantic-review="014"]')).toBeVisible({ timeout:10_000 });
}

async function choosePipeline(page) {
  await expect(page.locator(`option[value="${PROSPECT}"]`)).toHaveText(/Adrin Ortiz/);
  await expect(page.locator(`option[value="${PROSPECT}"]`)).toHaveText(/Pipeline · requiere vinculación explícita/);
  await page.locator('input[name="personMode"][value="existing"]').check();
  await page.locator('select[name="existingPersonReference"]').selectOption(PROSPECT);
  const same=page.locator('input[name="confirmSamePersonInsured"]');
  if(await same.count()) await same.check();
  for(const checkbox of await page.locator('[data-coverage-confirm]').all()) await checkbox.check();
  await expect(page.locator('[data-pdf-review] button[type="submit"]')).toBeEnabled();
}

async function confirm(page) {
  await choosePipeline(page);
  await page.locator('[data-pdf-review] button[type="submit"]').click();
  await expect(page.locator('[data-semantic-review="014"]')).toHaveCount(0, { timeout:10_000 });
}

async function trace(page) {
  return page.evaluate(()=>structuredClone(window.__CARTERA_015_TRACE__));
}

// SELECTOR 1/3 — exact production partial state: semantic refresh reopens, Pipeline prospect is visible, no automatic match.
test('selector confirmation check 1/3 — IDENTITY_CONFIRMED review exposes unresolved Pipeline prospect without auto-link', async ({page})=>{
  await open(page); await selector(page);
  await expect(page.getByText('ADRIAN ORTIZ GARCIA').first()).toBeVisible();
  await expect(page.getByText('UDI',{exact:true}).first()).toBeVisible();
  await expect(page.locator(`option[value="${PROSPECT}"]`)).toHaveCount(1);
  const value=await trace(page);
  expect(value.pipelineIdentityWrites).toHaveLength(0);
  expect(value.links).toHaveLength(0);
});

// SELECTOR 2/3 — explicit human selection links the Pipeline prospect to the already durable person, never creates another person.
test('selector confirmation check 2/3 — explicit Pipeline selection links to durable 020C person', async ({page})=>{
  await open(page); await selector(page); await confirm(page);
  const value=await trace(page);
  expect(value.pipelineIdentityWrites).toHaveLength(1);
  expect(value.pipelineIdentityWrites[0]).toMatchObject({outcome:'LINK_CONFIRMED',existingPersonReference:DURABLE_PERSON,sourceIdentity:{sourceDomain:'PIPELINE',sourceIdentityType:'PROSPECT',prospectReference:'11111111-1111-4111-8111-111111111111'}});
  expect(value.pipelineIdentityWrites[0].newPerson).toBeNull();
  expect(value.links).toEqual([{prospectReference:'11111111-1111-4111-8111-111111111111',personReference:DURABLE_PERSON}]);
});

// SELECTOR 3/3 — policy attach uses durable server boundary and does not replay Identity preparation or legacy attach.
test('selector confirmation check 3/3 — durable policy attach resumes without identity replay', async ({page})=>{
  await open(page); await selector(page); await confirm(page);
  const value=await trace(page);
  expect(value.durableAttach).toHaveLength(1);
  expect(value.execute).toHaveLength(1);
  expect(value.rpc).not.toContain('forge_cartera020c_prepare_identity_orchestration_canonical');
  expect(value.rpc).not.toContain('forge_cartera020c_attach_policy_confirmation');
  expect(value.globalStates.some(item=>String(item).includes('Póliza incorporada'))).toBeTruthy();
});

// DRAG/DROP 1/3 — octet-stream items-only drop reaches the exact same semantic review and Pipeline candidate surface.
test('drag drop confirmation check 1/3 — items-only octet-stream reopens durable review', async ({page})=>{
  await open(page); await drop(page);
  await expect(page.locator('[data-pdf-drop-error]')).toHaveCount(0);
  await expect(page.getByText('Mensual',{exact:true})).toBeVisible();
  await expect(page.locator(`option[value="${PROSPECT}"]`)).toHaveCount(1);
  const value=await trace(page);
  expect(value.rpc).not.toContain('EDGE_UNEXPECTED');
});

// DRAG/DROP 2/3 — the same explicit Pipeline decision resolves to the same durable CommercialPerson.
test('drag drop confirmation check 2/3 — Pipeline convergence is identical to selector path', async ({page})=>{
  await open(page); await drop(page); await confirm(page);
  const value=await trace(page);
  expect(value.pipelineIdentityWrites).toHaveLength(1);
  expect(value.pipelineIdentityWrites[0].existingPersonReference).toBe(DURABLE_PERSON);
  expect(value.pipelineIdentityWrites[0].outcome).toBe('LINK_CONFIRMED');
  expect(value.links).toHaveLength(1);
});

// DRAG/DROP 3/3 — final Policy execution also uses durable attach only and reaches CONFIRMED.
test('drag drop confirmation check 3/3 — durable attach confirms policy without duplicate truth writes', async ({page})=>{
  await open(page); await drop(page); await confirm(page);
  const value=await trace(page);
  expect(value.durableAttach).toHaveLength(1);
  expect(value.execute).toHaveLength(1);
  expect(value.pipelineIdentityWrites).toHaveLength(1);
  expect(value.rpc.filter(name=>name==='forge_cartera020c_attach_policy_confirmation_durable')).toHaveLength(1);
  expect(value.rpc.filter(name=>name==='forge_cartera010b_confirm_identity_resolution')).toHaveLength(1);
  await page.screenshot({path:'test-results/aura-cartera-020c-015/drop-confirmed.png',fullPage:true});
});
