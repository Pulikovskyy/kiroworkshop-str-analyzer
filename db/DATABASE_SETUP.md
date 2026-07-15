# Database setup

Run the two scripts below **in order** in your hosted Postgres SQL console
(Vercel Postgres / Neon dashboard → SQL editor). Both were tested against a
clean Postgres database.

After running them, set `DATABASE_URL` in Vercel → Project → Settings →
Environment Variables to the connection string of this database.

## 1. Schema

```sql
CREATE TABLE customers (
  customer_id     TEXT PRIMARY KEY,
  customer_type   TEXT NOT NULL CHECK (customer_type IN ('INDIVIDUAL', 'CORPORATE')),
  full_name       TEXT NOT NULL,
  date_of_birth   DATE,
  nationality     TEXT NOT NULL,
  occupation      TEXT,
  source_of_funds TEXT,
  risk_rating     TEXT NOT NULL DEFAULT 'NORMAL' CHECK (risk_rating IN ('LOW', 'NORMAL', 'HIGH', 'PEP')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  account_no                TEXT PRIMARY KEY,
  customer_id               TEXT NOT NULL REFERENCES customers(customer_id),
  account_type              TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DORMANT', 'CLOSED')),
  opened_date               DATE NOT NULL,
  -- DATE (not timestamp): the rule engine compares (txn_date - last_client_activity_date)
  -- to an integer day count, which requires date - date arithmetic.
  last_client_activity_date DATE
);

CREATE TABLE transactions (
  txn_id                BIGSERIAL PRIMARY KEY,
  customer_id           TEXT NOT NULL REFERENCES customers(customer_id),
  account_no            TEXT NOT NULL REFERENCES accounts(account_no),
  txn_date              DATE NOT NULL,
  txn_type              TEXT NOT NULL,
  dr_cr_flg             TEXT NOT NULL CHECK (dr_cr_flg IN ('D', 'C')),
  txn_amount            NUMERIC(18, 2) NOT NULL,
  currency              TEXT NOT NULL,
  branch_code           TEXT,
  channel               TEXT,
  sub_channel           TEXT,
  is_cash               BOOLEAN NOT NULL DEFAULT false,
  counterparty_id       TEXT,
  counterparty_account  TEXT,
  remittance_direction  TEXT CHECK (remittance_direction IN ('INWARD', 'OUTWARD'))
);

-- The rule engine's window subqueries scan by account_no + txn_date range.
CREATE INDEX idx_transactions_account_date ON transactions (account_no, txn_date);
CREATE INDEX idx_transactions_customer ON transactions (customer_id);

CREATE TABLE rules (
  rule_id        SERIAL PRIMARY KEY,
  rule_name      TEXT NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  risk_level     TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  scenario_ref   TEXT,
  target_case    TEXT,
  rule_condition JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  alert_id      BIGSERIAL PRIMARY KEY,
  txn_id        BIGINT NOT NULL REFERENCES transactions(txn_id),
  -- CASCADE so the app's rule delete keeps working; alerts that have been
  -- tagged as STRs still block the delete via str_register.alert_id.
  rule_id       INT NOT NULL REFERENCES rules(rule_id) ON DELETE CASCADE,
  severity      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'APPROVED', 'DISAPPROVED', 'TAGGED_STR', 'DISMISSED')),
  explain       JSONB NOT NULL DEFAULT '{}'::jsonb,
  llm_narrative TEXT,
  reviewed_by   TEXT,
  reviewed_at   TIMESTAMPTZ,
  review_notes  TEXT,
  -- UNIQUE is required: the engine inserts with ON CONFLICT (dedupe_key) DO NOTHING.
  dedupe_key    TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_status ON alerts (status);
CREATE INDEX idx_alerts_rule ON alerts (rule_id);
CREATE INDEX idx_alerts_txn ON alerts (txn_id);
CREATE INDEX idx_alerts_narrative_pending ON alerts (alert_id) WHERE llm_narrative IS NULL;

CREATE TABLE cases (
  case_id     SERIAL PRIMARY KEY,
  case_ref    TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES customers(customer_id),
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED_STR', 'CLOSED_NO_STR')),
  assigned_to TEXT,
  priority    TEXT NOT NULL DEFAULT 'MEDIUM',
  summary     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ
);

CREATE INDEX idx_cases_customer_status ON cases (customer_id, status);

CREATE TABLE case_alerts (
  case_id  INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  alert_id BIGINT NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
  -- Composite PK doubles as the conflict target for ON CONFLICT DO NOTHING.
  PRIMARY KEY (case_id, alert_id)
);

CREATE INDEX idx_case_alerts_alert ON case_alerts (alert_id);

CREATE TABLE str_register (
  str_id         SERIAL PRIMARY KEY,
  str_ref_no     TEXT NOT NULL UNIQUE,
  case_id        INT REFERENCES cases(case_id),
  alert_id       BIGINT NOT NULL REFERENCES alerts(alert_id),
  suspicion_code TEXT NOT NULL,
  narrative      TEXT NOT NULL,
  tagged_by      TEXT NOT NULL,
  tagged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  log_id     BIGSERIAL PRIMARY KEY,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  detail     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);

CREATE TABLE lib_suspicion_reason (
  id    SERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);

CREATE TABLE lib_str_trigger (
  id    SERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);
```

## 2. Lookup seed data

Suspicion codes follow the AMLA (RA 9160) suspicious circumstances.

```sql
INSERT INTO lib_suspicion_reason (value, name) VALUES
  ('SC1', 'No underlying legal or trade obligation, purpose or economic justification'),
  ('SC2', 'Client is not properly identified'),
  ('SC3', 'Amount is not commensurate with the business or financial capacity of the client'),
  ('SC4', 'Transaction structured to avoid being the subject of reporting requirements'),
  ('SC5', 'Deviation from the client''s profile or past transaction pattern'),
  ('SC6', 'Transaction relates to an unlawful activity or offense'),
  ('SC7', 'Similar, analogous or identical transactions to the above')
ON CONFLICT (value) DO NOTHING;

INSERT INTO lib_str_trigger (value, name) VALUES
  ('RULE_MATCH', 'Automated rule match'),
  ('MANUAL_REVIEW', 'Manual analyst review'),
  ('REGULATOR_REQUEST', 'Regulator or law-enforcement request'),
  ('CUSTOMER_COMPLAINT', 'Customer complaint or referral')
ON CONFLICT (value) DO NOTHING;
```
