-- Secure provider connection state for Activity mail evidence.
-- OAuth secrets/tokens are service-side only. Authenticated clients receive no direct table grants.
begin;

create table if not exists public.activity_mail_provider_connections (
  advisor_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('GMAIL','MICROSOFT_GRAPH')),
  refresh_token_ciphertext text not null,
  refresh_token_iv text not null,
  scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(scopes) = 'array'),
  connection_state text not null default 'CONNECTED' check (connection_state = 'CONNECTED'),
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (advisor_id, provider),
  constraint activity_mail_refresh_ciphertext_ck check (length(refresh_token_ciphertext) between 24 and 16384),
  constraint activity_mail_refresh_iv_ck check (length(refresh_token_iv) between 12 and 256)
);

alter table public.activity_mail_provider_connections enable row level security;
alter table public.activity_mail_provider_connections force row level security;
revoke all on public.activity_mail_provider_connections from anon, authenticated;

create table if not exists public.activity_mail_oauth_states (
  state_digest text primary key check (state_digest ~ '^[a-f0-9]{64}$'),
  advisor_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('GMAIL','MICROSOFT_GRAPH')),
  code_verifier_ciphertext text not null,
  code_verifier_iv text not null,
  redirect_uri text not null check (redirect_uri ~ '^https://'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint activity_mail_oauth_state_expiry_ck check (expires_at > created_at),
  constraint activity_mail_oauth_state_consumed_ck check (consumed_at is null or consumed_at >= created_at),
  constraint activity_mail_oauth_verifier_ciphertext_ck check (length(code_verifier_ciphertext) between 24 and 16384),
  constraint activity_mail_oauth_verifier_iv_ck check (length(code_verifier_iv) between 12 and 256)
);

create index if not exists activity_mail_oauth_states_advisor_idx
  on public.activity_mail_oauth_states(advisor_id, provider, created_at desc);
create index if not exists activity_mail_oauth_states_expiry_idx
  on public.activity_mail_oauth_states(expires_at)
  where consumed_at is null;

alter table public.activity_mail_oauth_states enable row level security;
alter table public.activity_mail_oauth_states force row level security;
revoke all on public.activity_mail_oauth_states from anon, authenticated;

comment on table public.activity_mail_provider_connections is
  'Server-only encrypted OAuth refresh-token state for read-only mail evidence providers. Never a business-truth authority.';
comment on table public.activity_mail_oauth_states is
  'Short-lived PKCE/CSRF OAuth state. Server-only; never exposed through authenticated table grants.';

commit;
