"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tagAsStr } from "@/app/actions/str-register";
import { SuspicionReason } from "@/types";

interface TagStrFormProps {
  alertId: number;
  reasons: SuspicionReason[];
  defaultNarrative: string;
}

export function TagStrForm({ alertId, reasons, defaultNarrative }: TagStrFormProps) {
  const [suspicionCode, setSuspicionCode] = useState("");
  const [narrative, setNarrative] = useState(defaultNarrative);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspicionCode) {
      setError("Please select a suspicion code");
      return;
    }
    if (!narrative.trim()) {
      setError("Narrative is required");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await tagAsStr(alertId, {
          suspicion_code: suspicionCode,
          narrative: narrative.trim(),
          tagged_by: "analyst",
        });
        router.push("/str-register");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to tag as STR");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">File Suspicious Transaction Report</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Suspicion Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5">Suspicion Code *</label>
        <select
          value={suspicionCode}
          onChange={(e) => setSuspicionCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">Select a suspicion code...</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.value}>
              {r.value} — {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Narrative */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1.5">
          Narrative * <span className="text-gray-400 font-normal">(pre-filled from AI analysis — edit as needed)</span>
        </label>
        <textarea
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm resize-y"
          placeholder="Describe the suspicious activity..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {isPending ? "Filing STR..." : "File STR"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
