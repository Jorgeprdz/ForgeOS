begin;

alter table public.activity_event_ledger
  drop constraint activity_event_ledger_subject_type_ck;

alter table public.activity_event_ledger
  add constraint activity_event_ledger_subject_type_ck check (
    subject_type in (
      'PROSPECT',
      'APPOINTMENT',
      'ACTIVITY',
      'DUE_ACTION',
      'RECOMMENDATION'
    )
  );

commit;
