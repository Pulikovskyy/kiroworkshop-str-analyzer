import { withClient } from "@/app/lib/db";

export const dynamic = "force-dynamic";

async function getCtrEntries() {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT s.*, c.full_name, t.txn_amount, t.txn_date, t.account_no, t.customer_id
       FROM str_register s
       JOIN alerts a ON a.alert_id = s.alert_id
       JOIN transactions t ON t.txn_id = a.txn_id
       JOIN customers c ON c.customer_id = t.customer_id
       WHERE s.str_ref_no LIKE 'CTR-%'
       ORDER BY s.tagged_at DESC`
    );
    return result.rows.map((row: any) => ({
      ...row,
      txn_amount: row.txn_amount ? parseFloat(row.txn_amount) : 0,
      txn_date: row.txn_date instanceof Date ? row.txn_date.toISOString().split("T")[0] : row.txn_date,
      tagged_at: row.tagged_at instanceof Date ? row.tagged_at.toISOString() : row.tagged_at,
    }));
  });
}

export default async function CtrRegisterPage() {
  const entries = await getCtrEntries();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CTR Register</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {entries.length} covered transaction report{entries.length !== 1 ? "s" : ""} auto-filed (transactions ≥ PHP 500,000)
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-500">No CTRs filed yet. Run the analyzer — credit transactions ≥ PHP 500,000 are automatically tagged as covered transactions.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">CTR Ref</th>
                <th className="px-4 py-3 text-left font-medium">Filed At</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Account</th>
                <th className="px-4 py-3 text-left font-medium">Txn Date</th>
                <th className="px-4 py-3 text-left font-medium">Amount (PHP)</th>
                <th className="px-4 py-3 text-left font-medium">Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((entry: any) => (
                <tr key={entry.str_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700 dark:text-purple-400">{entry.str_ref_no}</td>
                  <td className="px-4 py-3 text-xs">{new Date(entry.tagged_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div>{entry.full_name}</div>
                    <div className="text-xs text-gray-500">{entry.customer_id}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{entry.account_no}</td>
                  <td className="px-4 py-3 text-xs">{entry.txn_date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-right">
                    {entry.txn_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-xs text-gray-600 dark:text-gray-400">{entry.narrative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
