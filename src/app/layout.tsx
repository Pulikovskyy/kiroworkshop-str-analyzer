import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every page reads live data from Postgres; there is no database available
// at build time, so nothing in the app can be statically prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "STR Analyzer",
  description: "Suspicious Transaction Report Analyzer — AML Detection Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
