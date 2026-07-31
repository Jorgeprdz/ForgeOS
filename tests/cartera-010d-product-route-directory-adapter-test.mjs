import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('productive Cartera route mounts the authenticated unified directory', async () => {
    const source = await read('cartera.js');

    assert.match(source, /createCanonicalDirectoryService/);
    assert.match(source, /directoryService\.loadDirectory\(\)/);
    assert.match(source, /authority: 'CANONICAL_DIRECTORY'/);
    assert.match(source, /AppState\.set\('cartera:directory'/);
    assert.match(source, /renderDirectoryCard/);
    assert.match(source, /data-directory-reference/);
    assert.match(source, /data-directory-kind/);
    assert.doesNotMatch(source, /directoryService\.loadPortfolio/);
});

test('route exposes separate Person, Account and Policy directory results', async () => {
    const source = await read('cartera.js');

    assert.match(source, /COMMERCIAL_PERSON: 'PERSONA'/);
    assert.match(source, /COMMERCIAL_ACCOUNT: 'CUENTA'/);
    assert.match(source, /POLICY: 'PÓLIZA'/);
    assert.match(source, /kpi-total-personas/);
    assert.match(source, /kpi-total-cuentas/);
    assert.match(source, /kpi-total-polizas/);
    assert.match(source, /BUSCAR PERSONA, CUENTA O PÓLIZA/);
    assert.match(source, /Nombre, teléfono, email, póliza, compañía, producto o relación/);
});

test('phone and email search reasons never echo contact values', async () => {
    const source = await read('cartera.js');

    assert.match(source, /VERIFIED_PHONE: 'Teléfono verificado'/);
    assert.match(source, /VERIFIED_EMAIL: 'Email verificado'/);
    assert.match(source, /sus valores no se muestran en este directorio/);
    assert.doesNotMatch(source, /entry\.verified_phone/);
    assert.doesNotMatch(source, /entry\.verified_email/);
    assert.doesNotMatch(source, /entry\.verifiedPhone/);
    assert.doesNotMatch(source, /entry\.verifiedEmail/);
});

test('existing canonical Policy detail and minimized Timeline remain reachable', async () => {
    const source = await read('cartera.js');

    assert.match(source, /createCanonicalPortfolioService/);
    assert.match(source, /data-policy-open/);
    assert.match(source, /Ver detalle canónico/);
    assert.match(source, /loadPolicyDetail/);
    assert.match(source, /Timeline canónico minimizado/);
    assert.match(source, /data-policy-timeline/);
    assert.match(source, /data-policy-event-type/);
});

test('route remains read-only, explicit and mobile-safe', async () => {
    const source = await read('cartera.js');

    assert.match(source, /SOLO LECTURA/);
    assert.match(source, /padding-bottom:calc\(112px \+ env\(safe-area-inset-bottom\)\)/);
    assert.match(source, /Cargando la cartera canónica y su directorio/);
    assert.match(source, /No se pudo cargar la cartera/);
    assert.match(source, /Aún no hay pólizas canónicas confirmadas/);
    assert.match(source, /Sin coincidencias en el directorio canónico/);
    assert.match(source, /La ruta falló cerrada y no recurrió a IndexedDB/);
    assert.doesNotMatch(source, /crmaddlife-indexeddb/);
    assert.doesNotMatch(source, /DB\.obtenerTodos/);
    assert.doesNotMatch(source, /btn-new-policy/);
    assert.doesNotMatch(source, /data-edit/);
    assert.doesNotMatch(source, /data-delete/);
    assert.doesNotMatch(source, /excel-input/);
});
