"use server";

import { withTransaction } from "@/app/lib/db";

export interface CtrResult {
  transactionsScanned: number;
  ctrsFiled: number;
}

export async function runCtrAutoTag(): Promise<CtrResult> {
  return withTransaction(async (client) => {
    // Find the first rule_id to use as a reference (or use 1 as default)
    const ruleRef = await client.query("SELECT rule_id FROM rules LIMIT 1");
    const ruleId = ruleRef.rows.length > 0 ? ruleRef.rows[0].rule_id : 1;

    // Insert alerts for credit transactions >= 500K that don't already have CTR alerts
    const result = await client.query(
      `INSERT INTO alerts (txn_id, rule_id, severity, status, explain, llm_narrative, reviewed_by, reviewed_at, dedupe_key)
       SELECT
         t.txn_id,
         $1,
         'HIGH',
         'TAGGED_STR',
         jsonb_build_object(
           'rule_name', 'Covered Transaction Report (Auto)',
           'matched_values', jsonb_build_object('txn.amount', t.txn_amount),
           'condition', '[{"op":"gte","left":"txn.amount","right":"500000"}]'::jsonb
         ),
         'This transaction of PHP ' || TRIM(to_char(t.txn_amount, '999,999,999,999.99')) || ' meets or exceeds the AMLC Covered Transaction Report threshold of PHP 500,000. Under AMLA, covered transactions must be reported to the AMLC within 5 banking days.',
         'system',
         now(),
         'CTR_' || t.txn_id::text
       FROM transactions t
       WHERE t.dr_cr_flg = 'C'
         AND t.txn_amount >= 500000
         AND NOT EXISTS (
           SELECT 1 FROM alerts a WHERE a.dedupe_key = 'CTR_' || t.txn_id::text
         )
       RETURNING alert_id, txn_id`,
      [ruleId]
    );

    const ctrsFiled = result.rowCount || 0;

    // Create STR register entries for each new CTR
    if (ctrsFiled > 0) {
      for (const row of result.rows) {
        const alertId = row.alert_id;

        const year = new Date().getFullYear();
        const countResult = await client.query("SELECT count(*) FROM str_register");
        const nextNum = parseInt(countResult.rows[0].count) + 1;
        const strRefNo = `CTR-${year}-${String(nextNum).padStart(6, "0")}`;

        const txnInfo = await client.query(
          "SELECT t.txn_amount FROM alerts a JOIN transactions t ON t.txn_id = a.txn_id WHERE a.alert_id = $1",
          [alertId]
        );
        const amount = parseFloat(txnInfo.rows[0].txn_amount);

        await client.query(
          `INSERT INTO str_register (str_ref_no, alert_id, suspicion_code, narrative, tagged_by)
           VALUES ($1, $2, 'SC1', $3, 'system')`,
          [
            strRefNo,
            alertId,
            `Covered Transaction Report: Credit of PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} exceeds the mandatory CTR threshold of PHP 500,000.`,
          ]
        );
      }

      await client.query(
        `INSERT INTO audit_log (actor, action, detail) VALUES ('system', 'CTR_AUTO_TAGGED', $1)`,
        [JSON.stringify({ ctrsFiled })]
      );
    }

    const totalEligible = await client.query(
      "SELECT count(*) FROM transactions WHERE dr_cr_flg = 'C' AND txn_amount >= 500000"
    );

    return {
      transactionsScanned: parseInt(totalEligible.rows[0].count),
      ctrsFiled,
    };
  });
}
