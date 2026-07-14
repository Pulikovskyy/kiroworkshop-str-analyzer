// === Domain Types ===

export interface Customer {
  customer_id: string;
  customer_type: "INDIVIDUAL" | "CORPORATE";
  full_name: string;
  date_of_birth: string | null;
  nationality: string;
  occupation: string | null;
  source_of_funds: string | null;
  risk_rating: "LOW" | "NORMAL" | "HIGH" | "PEP";
  created_at: string;
}

export interface Account {
  account_no: string;
  customer_id: string;
  account_type: string;
  status: "ACTIVE" | "DORMANT" | "CLOSED";
  opened_date: string;
  last_client_activity_date: string | null;
}

export interface Transaction {
  txn_id: number;
  customer_id: string;
  account_no: string;
  txn_date: string;
  txn_type: string;
  dr_cr_flg: "D" | "C";
  txn_amount: number;
  currency: string;
  branch_code: string | null;
  channel: string | null;
  sub_channel: string | null;
  is_cash: boolean;
  counterparty_id: string | null;
  counterparty_account: string | null;
  remittance_direction: "INWARD" | "OUTWARD" | null;
}

export interface ConditionEntry {
  op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in";
  left: string;
  right: string;
}

export interface Rule {
  rule_id: number;
  rule_name: string;
  description: string | null;
  is_active: boolean;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scenario_ref: string | null;
  target_case: string | null;
  rule_condition: ConditionEntry[];
  created_at: string;
}

export type AlertStatus = "OPEN" | "APPROVED" | "DISAPPROVED" | "TAGGED_STR" | "DISMISSED";

export interface Alert {
  alert_id: number;
  txn_id: number;
  rule_id: number;
  severity: string;
  status: AlertStatus;
  explain: {
    rule_name: string;
    matched_values: Record<string, unknown>;
    window_facts?: Record<string, unknown>;
    condition: ConditionEntry[];
  };
  llm_narrative: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  dedupe_key: string;
  created_at: string;
}

export interface AlertDetail extends Alert {
  transaction: Transaction;
  rule: Rule;
  customer: Customer;
  // Joined fields from query
  rule_name?: string;
  rule_description?: string;
  risk_level?: string;
  scenario_ref?: string;
  target_case?: string;
  rule_condition?: any;
  full_name?: string;
  customer_type?: string;
  account_no?: string;
  txn_date?: string;
  txn_type?: string;
  txn_amount?: number;
  channel?: string | null;
  occupation?: string;
  source_of_funds?: string;
  risk_rating?: string;
}

export type CaseStatus = "OPEN" | "UNDER_REVIEW" | "ESCALATED" | "CLOSED_STR" | "CLOSED_NO_STR";

export interface Case {
  case_id: number;
  case_ref: string;
  customer_id: string;
  status: CaseStatus;
  assigned_to: string | null;
  priority: string;
  summary: string | null;
  created_at: string;
  closed_at: string | null;
}

export interface CaseDetail extends Case {
  customer: Customer;
  alerts: Alert[];
}

export interface StrEntry {
  str_id: number;
  str_ref_no: string;
  case_id: number | null;
  alert_id: number;
  suspicion_code: string;
  narrative: string;
  tagged_by: string;
  tagged_at: string;
}

export interface AuditEntry {
  log_id: number;
  actor: string;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface SuspicionReason {
  id: number;
  value: string;
  name: string;
}

export interface StrTrigger {
  id: number;
  value: string;
  name: string;
}

// === Input Types ===

export interface CreateRuleInput {
  rule_name: string;
  description?: string;
  risk_level: Rule["risk_level"];
  scenario_ref?: string;
  target_case?: string;
  rule_condition: ConditionEntry[];
}

export interface UpdateRuleInput extends Partial<CreateRuleInput> {
  is_active?: boolean;
}

export interface TagStrInput {
  suspicion_code: string;
  narrative: string;
  tagged_by: string;
}

// === Filter Types ===

export interface TxnFilters {
  customer_id?: string;
  txn_type?: string;
  date_from?: string;
  date_to?: string;
  channel?: string;
}

export interface AlertFilters {
  status?: AlertStatus;
  severity?: string;
  rule_id?: number;
}

export interface CaseFilters {
  status?: CaseStatus;
  customer_id?: string;
}

export interface AuditFilters {
  action?: string;
  date_from?: string;
  date_to?: string;
}

// === Result Types ===

export interface AnalyzerResult {
  rulesEvaluated: number;
  alertsCreated: number;
  casesCreated: number;
}
