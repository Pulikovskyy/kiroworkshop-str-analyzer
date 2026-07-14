import { withClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await withClient(async (client) => {
    const result = await client.query(
      `SELECT s.str_ref_no, s.tagged_at, t.customer_id, c.full_name, t.account_no,
              t.txn_date, t.txn_amount, r.rule_name, s.suspicion_code, s.narrative
       FROM str_register s
       JOIN alerts a ON a.alert_id = s.alert_id
       JOIN transactions t ON t.txn_id = a.txn_id
       JOIN customers c ON c.customer_id = t.customer_id
       JOIN rules r ON r.rule_id = a.rule_id
       ORDER BY s.tagged_at DESC`
    );
    return result.rows;
  });

  // Build CSV
  const headers = [
    "str_ref_no",
    "tagged_at",
    "customer_id",
    "full_name",
    "account_no",
    "txn_date",
    "txn_amount",
    "rule_name",
    "suspicion_code",
    "narrative",
  ];

  const csvLines = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((h) => {
      let val = row[h];
      if (val instanceof Date) val = val.toISOString();
      if (val == null) return "";
      const str = String(val);
      // Escape CSV: wrap in quotes if contains comma, newline, or quote
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvLines.push(values.join(","));
  }

  const csv = csvLines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="str-register-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
