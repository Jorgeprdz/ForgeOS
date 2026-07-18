-- 067G17B security reconciliation after legacy foundation replay.
-- Product deletion is archive-only; authenticated clients never receive DELETE.
begin;
drop policy if exists "prospects_delete_own_rows" on public.prospects;
revoke delete on table public.prospects from authenticated;
revoke all on table public.prospects from anon;
commit;
