"use server";

import { withClient } from "@/app/lib/db";
import { Transaction, TxnFilters } from "@/types";

export async function getTransactions(
  filters?: TxnFilters
): Promise<Transaction[]> {
  return withClient(async (client) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (filters?.customer_id) {
      conditions.push(`t.customer_id = $${paramIdx++}`);
      params.push(filters.customer_id);
    }
    if (filters?.txn_type) {
      conditions.push(`t.txn_type = $${paramIdx++}`);
      params.push(filters.txn_type);
    }
    if (filters?.date_from) {
      conditions.push(`t.txn_date >= $${paramIdx++}`);
      params.push(filters.date_from);
    }
    if (filters?.date_to) {
      conditions.push(`t.txn_date <= $${paramIdx++}`);
      params.push(filters.date_to);
    }
    if (filters?.channel) {
      conditions.push(`t.channel = $${paramIdx++}`);
      params.push(filters.channel);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await client.query(
      `SELECT t.*, c.customer_type
       FROM transactions t
       JOIN customers c ON c.customer_id = t.customer_id
       ${where}
       ORDER BY t.txn_date DESC, t.txn_id DESC
       LIMIT 1000`,
      params
    );

    return result.rows.map((row) => ({
      ...row,
      txn_amount: parseFloat(row.txn_amount),
      txn_date: row.txn_date instanceof Date
        ? row.txn_date.toISOString().split("T")[0]
        : row.txn_date,
    }));
  });
}

export async function getTransactionById(
  txnId: number
): Promise<Transaction | null> {
  return withClient(async (client) => {
    const result = await client.query(
      "SELECT * FROM transactions WHERE txn_id = $1",
      [txnId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      txn_amount: parseFloat(row.txn_amount),
      txn_date: row.txn_date instanceof Date
        ? row.txn_date.toISOString().split("T")[0]
        : row.txn_date,
    };
  });
}
