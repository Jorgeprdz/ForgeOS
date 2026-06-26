-- Human Adjudication Log Schema
-- STRICTLY an audit log. Must not be used as canonical truth.

CREATE TABLE IF NOT EXISTS human_adjudication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL,
  prospect_alias text NOT NULL,
  candidate_type text NOT NULL,
  owner text NOT NULL,
  action text NOT NULL,
  due text,
  evidence_span text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  actor text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies (Draft)
ALTER TABLE human_adjudication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view their own adjudication logs"
ON human_adjudication_log FOR SELECT
USING (true); -- Placeholder: Restricted by auth in production

CREATE POLICY "Advisors can insert their own adjudication logs"
ON human_adjudication_log FOR INSERT
WITH CHECK (true); -- Placeholder: Restricted by auth in production
