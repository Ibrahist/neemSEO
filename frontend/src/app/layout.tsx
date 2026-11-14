import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "neemSEO - Open-Source SEO Suite & AI Agent Interface",
  description: "Simple, focused, pay-as-you-go alternative to Semrush and Ahrefs with native MCP server and agent skills.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
