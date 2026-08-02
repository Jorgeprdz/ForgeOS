-- CRS 06E Application dependency compatibility
-- Adds the owner-first unique key required by the Application authority FK.

begin;

create unique index if not exists commercial_people_owner_id_uq
  on public.commercial_people(advisor_id, id);

commit;
