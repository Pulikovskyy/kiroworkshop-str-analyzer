import { withClient } from "@/app/lib/db";

async function getDashboardStats() {
  return withClient(async (client) => {
    const txnCount = await client.query("SELECT count(*) FROM transactions");
    const ruleCount = await client.query("SELECT count(*) FROM rules WHERE is_active = true");
    const alertCounts = await client.query(
      `SELECT status, count(*) FROM alerts GROUP BY status`
    );
    const customerCount = await client.query("SELECT count(*) FROM customers");

    const alertMap: Record<string, number> = {};
    for (const row of alertCounts.rows) {
      alertMap[row.status] = parseInt(row.count);
    }

    return {
      transactions: parseInt(txnCount.rows[0].count),
      activeRules: parseInt(ruleCount.rows[0].count),
      customers: parseInt(customerCount.rows[0].count),
      openAlerts: alertMap["OPEN"] || 0,
      approvedAlerts: alertMap["APPROVED"] || 0,
      taggedStr: alertMap["TAGGED_STR"] || 0,
      dismissed: alertMap["DISMISSED"] || 0,
    };
  });
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const tiles = [
    { label: "Transactions", value: stats.transactions, color: "bg-blue-500" },
    { label: "Active Rules", value: stats.activeRules, color: "bg-purple-500" },
    { label: "Customers", value: stats.customers, color: "bg-indigo-500" },
    { label: "Open Alerts", value: stats.openAlerts, color: "bg-orange-500" },
    { label: "Approved", value: stats.approvedAlerts, color: "bg-yellow-500" },
    { label: "STRs Filed", value: stats.taggedStr, color: "bg-green-500" },
    { label: "Dismissed", value: stats.dismissed, color: "bg-gray-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          STR Analyzer — AML Detection Platform Overview
        </p>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${tile.color}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tile.label}
              </span>
            </div>
            <div className="mt-2 text-3xl font-bold">{tile.value}</div>
          </div>
        ))}
      </div>

      {/* Placeholder for severity chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Run the analyzer from the Rules page to generate alerts. The dashboard will show alert distribution by severity once alerts exist.
        </p>
      </div>
    </div>
  );
}
