-- STR Analyzer — Database Schema
-- Migration: 0001_init.sql
-- Idempotent: uses IF NOT EXISTS and ON CONFLICT

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  customer_id   TEXT PRIMARY KEY,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('INDIVIDUAL', 'CORPORATE')),
  full_name     TEXT NOT NULL,
  date_of_birth DATE,
  nationality   TEXT DEFAULT 'PH',
  occupation    TEXT,
  source_of_funds TEXT,
  risk_rating   TEXT DEFAULT 'NORMAL' CHECK (risk_rating IN ('LOW', 'NORMAL', 'HIGH', 'PEP')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  account_no              TEXT PRIMARY KEY,
  customer_id             TEXT NOT NULL REFERENCES customers(customer_id),
  account_type            TEXT NOT NULL DEFAULT 'CASA',
  status                  TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DORMANT', 'CLOSED')),
  opened_date             DATE NOT NULL,
  last_client_activity_date DATE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  txn_id              BIGSERIAL PRIMARY KEY,
  customer_id         TEXT NOT NULL REFERENCES customers(customer_id),
  account_no          TEXT NOT NULL REFERENCES accounts(account_no),
  txn_date            DATE NOT NULL,
  txn_type            TEXT NOT NULL,
  dr_cr_flg           CHAR(1) NOT NULL CHECK (dr_cr_flg IN ('D', 'C')),
  txn_amount          NUMERIC(14,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'PHP',
  branch_code         TEXT,
  channel             TEXT,
  sub_channel         TEXT,
  is_cash             BOOLEAN NOT NULL DEFAULT false,
  counterparty_id     TEXT,
  counterparty_account TEXT,
  remittance_direction TEXT CHECK (remittance_direction IN ('INWARD', 'OUTWARD'))
);

-- Rules
CREATE TABLE IF NOT EXISTS rules (
  rule_id        SERIAL PRIMARY KEY,
  rule_name      TEXT NOT NULL,
  description    TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  risk_level     TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  scenario_ref   TEXT,
  target_case    TEXT,
  rule_condition JSONB NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  alert_id    BIGSERIAL PRIMARY KEY,
  txn_id      BIGINT NOT NULL REFERENCES transactions(txn_id),
  rule_id     INT NOT NULL REFERENCES rules(rule_id),
  severity    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'OPEN'
              CHECK (status IN ('OPEN', 'APPROVED', 'DISAPPROVED', 'TAGGED_STR', 'DISMISSED')),
  explain     JSONB NOT NULL,
  llm_narrative TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  dedupe_key  TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cases
CREATE TABLE IF NOT EXISTS cases (
  case_id       BIGSERIAL PRIMARY KEY,
  case_ref      TEXT UNIQUE NOT NULL,
  customer_id   TEXT NOT NULL REFERENCES customers(customer_id),
  status        TEXT NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED_STR', 'CLOSED_NO_STR')),
  assigned_to   TEXT,
  priority      TEXT NOT NULL DEFAULT 'MEDIUM',
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at     TIMESTAMPTZ
);

-- Case-Alert junction
CREATE TABLE IF NOT EXISTS case_alerts (
  case_id   BIGINT NOT NULL REFERENCES cases(case_id),
  alert_id  BIGINT NOT NULL REFERENCES alerts(alert_id),
  added_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, alert_id)
);

-- STR Register
CREATE TABLE IF NOT EXISTS str_register (
  str_id            BIGSERIAL PRIMARY KEY,
  str_ref_no        TEXT UNIQUE NOT NULL,
  case_id           BIGINT REFERENCES cases(case_id),
  alert_id          BIGINT NOT NULL REFERENCES alerts(alert_id),
  suspicion_code    TEXT NOT NULL,
  narrative         TEXT NOT NULL,
  tagged_by         TEXT NOT NULL,
  tagged_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  log_id     BIGSERIAL PRIMARY KEY,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  detail     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookups
CREATE TABLE IF NOT EXISTS lib_suspicion_reason (
  id SERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lib_str_trigger (
  id SERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_no, txn_date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_dedupe ON alerts(dedupe_key);
CREATE INDEX IF NOT EXISTS idx_cases_customer ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
