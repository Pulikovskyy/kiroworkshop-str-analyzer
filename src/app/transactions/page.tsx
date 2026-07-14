import { getTransactions } from "@/app/actions/transactions";
import { TransactionsTable } from "./transactions-table";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Browse all {transactions.length} seeded transactions
        </p>
      </div>
      <TransactionsTable data={transactions} />
    </div>
  );
}
