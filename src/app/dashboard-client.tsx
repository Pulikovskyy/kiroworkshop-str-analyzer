"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetAlertsAndCases } from "@/app/actions/reset";

export function ResetButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    if (!confirm("This will delete ALL alerts, cases, STR entries, and audit log.\n\nTransactions, customers, and rules will be kept.\n\nContinue?")) return;
    startTransition(async () => {
      await resetAlertsAndCases();
      router.refresh();
    });
  };

  return (
    <button onClick={handleReset} disabled={isPending}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors">
      {isPending ? "Resetting..." : "Reset Alerts & Cases"}
    </button>
  );
}
