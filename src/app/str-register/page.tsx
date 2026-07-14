import { withClient } from "@/app/lib/db";

export const dynamic = "force-dynamic";

async function getStrEntries() {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT s.*, c.full_name, t.txn_amount, t.txn_date, t.account_no, r.rule_name
       FROM str_register s
       JOIN alerts a ON a.alert_id = s.alert_id
       JOIN transactions t ON t.txn_id = a.txn_id
       JOIN customers c ON c.customer_id = t.customer_id
       JOIN rules r ON r.rule_id = a.rule_id
       ORDER BY s.tagged_at DESC`
    );
    return result.rows.map((row) => ({
      ...row,
      txn_amount: row.txn_amount ? parseFloat(row.txn_amount) : 0,
      txn_date: row.txn_date instanceof Date ? row.txn_date.toISOString().split("T")[0] : row.txn_date,
      tagged_at: row.tagged_at instanceof Date ? row.tagged_at.toISOString() : row.tagged_at,
    }));
  });
}

export default async function StrRegisterPage() {
  const entries = await getStrEntries();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">STR Register</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {entries.length} suspicious transaction report{entries.length !== 1 ? "s" : ""} filed
          </p>
        </div>
        {entries.length > 0 && (
          <a
            href="/api/export/str"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Export CSV
          </a>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500">No STRs filed yet. Tag approved alerts as STR from the Suspicious Transactions page.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">STR Ref</th>
                <th className="px-4 py-3 text-left font-medium">Tagged At</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Rule</th>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((entry: any) => (
                <tr key={entry.str_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{entry.str_ref_no}</td>
                  <td className="px-4 py-3 text-xs">{new Date(entry.tagged_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{entry.full_name}</td>
                  <td className="px-4 py-3 font-mono">
                    {entry.txn_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-xs">{entry.rule_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded text-xs font-medium">
                      {entry.suspicion_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-xs text-gray-600">{entry.narrative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
