"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/transactions", label: "Transactions", icon: "💳" },
  { href: "/rules", label: "Rules", icon: "⚙️" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/suspicious", label: "Suspicious", icon: "⚠️" },
  { href: "/str-register", label: "STR Register", icon: "📋" },
  { href: "/cases", label: "Cases", icon: "📁" },
  { href: "/audit", label: "Audit Log", icon: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
          STR Analyzer
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          AML Detection Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role Picker */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
          Current Role
        </label>
        <select
          className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5"
          defaultValue="analyst"
        >
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </aside>
  );
}
