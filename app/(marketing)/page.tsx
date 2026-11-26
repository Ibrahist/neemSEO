import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { McpSection } from "@/components/marketing/mcp-section";
import { ComparisonSection } from "@/components/marketing/comparison-section";
import { BeyondData } from "@/components/marketing/beyond-data";
import { OpenSource } from "@/components/marketing/open-source";
import { ToolkitDemo } from "@/components/marketing/toolkit-demo";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "neemSEO — 100% Free, Open-Source SEO Intelligence",
  description:
    "Professional SEO intelligence. Completely free, forever. Integrated with Claude, Cursor, and modern LLM coding agents via Model Context Protocol (MCP).",
  openGraph: {
    title: "neemSEO — 100% Free, Open-Source SEO Intelligence",
    description:
      "Professional SEO intelligence. Completely free, forever. Track rankings, analyze backlinks, audit technical SEO, and inspect competitors.",
    url: "https://neemseo.com",
    siteName: "neemSEO",
    images: [
      {
        url: "https://neemseo.com/og.png",
        width: 1200,
        height: 630,
        alt: "neemSEO Open-Source SEO Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "neemSEO — 100% Free, Open-Source SEO Intelligence",
    description:
      "Professional SEO intelligence. Completely free, forever. MCP server + self-hosted dashboard.",
    images: ["https://neemseo.com/og.png"],
  },
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] py-3 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 flex justify-center items-start font-sans selection:bg-[#8CC63F]/30 selection:text-[#0F3D2E]">
      {/* Boxed Homepage Container */}
      <div className="w-full max-w-[1240px] bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-900/5 overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Sections */}
        <main className="flex-1">
          {/* Hero Section */}
          <Hero />

          {/* Superpowers with neemSEO MCP Section */}
          <McpSection />

          {/* 100% Free SEO Intelligence Section */}
          <ComparisonSection />

          {/* Beyond Data Section */}
          <BeyondData />

          {/* 100% Open Source Section */}
          <OpenSource />

          {/* 6 Core Workflows Toolkit Demo */}
          <ToolkitDemo />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
