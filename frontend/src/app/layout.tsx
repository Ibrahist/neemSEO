import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "neemSEO - Open-Source SEO Suite & AI Agent Interface",
  description: "Simple, focused, pay-as-you-go alternative to Semrush and Ahrefs with native MCP server and agent skills.",
  icons: {
    icon: "/neemseo-mark-a.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B1226] text-slate-100 min-h-screen antialiased selection:bg-[#1D4ED8] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
