import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = new URL('../supabase/migrations/20260801000261_cartera030d_policy_payment_calendar_product_read.sql', import.meta.url);

test('030D SQL exposes owner-scoped sanitized 7/30/90 calendar projection', async () => {
    const sql = await readFile(path, 'utf8');
    assert.match(sql, /forge_cartera030d_list_policy_payment_calendar/i);
    assert.match(sql, /o\.advisor_id = advisor/i);
    assert.match(sql, /'NEXT_7_DAYS'/i);
    assert.match(sql, /'NEXT_30_DAYS'/i);
    assert.match(sql, /'NEXT_90_DAYS'/i);
    assert.match(sql, /'CONFIRMATION_REQUIRED'/i);
    assert.match(sql, /'paymentTruthAuthority', 'CONFIRMED_PAYMENT_EVENT_ONLYIËÚJNÂˆ\ÜÙ\›X]Ú
Ü[ÉÛ\ÙR[™™\™[˜ÙIË˜[ÙKÚJNÂˆ\ÜÙ\™Ù\Ó›İX]Ú
Ü[ÜÛİ\˜ÙWÙ]šY[˜ÙWÜ™Y™\™[˜Ù\ËÚJNÂˆ\ÜÙ\™Ù\Ó›İX]Ú
Ü[ÛX]ÚYÜ^[Y[Ù]™[Ü™Y™\™[˜Ù\É×ËÚJNÂŸJNÂ