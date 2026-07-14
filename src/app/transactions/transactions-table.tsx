"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/types";

export function TransactionsTable({ data }: { data: Transaction[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [sortField, setSortField] = useState<keyof Transaction>("txn_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    return data.filter((t) => {
      if (search && !t.customer_id.toLowerCase().includes(search.toLowerCase()) && !t.account_no.includes(search)) return false;
      if (filterType && t.txn_type !== filterType) return false;
      if (filterChannel && t.channel !== filterChannel) return false;
      return true;
    });
  }, [data, search, filterType, filterChannel]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const txnTypes = [...new Set(data.map((t) => t.txn_type))];
  const channels = [...new Set(data.map((t) => t.channel).filter(Boolean))];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search customer or account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 w-64"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="">All Types</option>
          {txnTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="">All Channels</option>
          {channels.map((c) => (
            <option key={c} value={c!}>{c}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 self-center ml-auto">
          {sorted.length} of {data.length} transactions
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {([
                ["txn_id", "ID"],
                ["customer_id", "Customer"],
                ["account_no", "Account"],
                ["txn_date", "Date"],
                ["txn_type", "Type"],
                ["dr_cr_flg", "D/C"],
                ["txn_amount", "Amount"],
                ["channel", "Channel"],
              ] as [keyof Transaction, string][]).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                >
                  {label}
                  {sortField === field && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sorted.slice(0, 200).map((t) => (
              <tr key={t.txn_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2.5 font-mono text-xs">{t.txn_id}</td>
                <td className="px-4 py-2.5">{t.customer_id}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{t.account_no}</td>
                <td className="px-4 py-2.5">{t.txn_date}</td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                    {t.txn_type}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`font-semibold ${t.dr_cr_flg === "C" ? "text-green-600" : "text-red-600"}`}>
                    {t.dr_cr_flg}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {t.txn_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5">{t.channel || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > 200 && (
        <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
          Showing first 200 of {sorted.length} results
        </div>
      )}
    </div>
  );
}
