-- 002_seed_lookups.sql — lookup values for STR tagging
-- Suspicion codes follow the AMLA (RA 9160) suspicious circumstances.

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
