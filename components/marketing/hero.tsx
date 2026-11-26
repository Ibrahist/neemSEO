"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-14 md:pt-20 pb-16 text-center max-w-[1080px] mx-auto px-6 flex flex-col items-center">
      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.035em] text-[#0F3D2E] leading-[1.05] max-w-4xl text-balance">
        Professional SEO intelligence. Completely free, forever.
      </h1>

      {/* Subhead */}
      <p className="mt-6 text-lg sm:text-xl text-[#57534e] max-w-2xl font-normal leading-relaxed text-balance">
        neemSEO gives you full access to keyword discovery, daily rank tracking, technical site
        audits, backlink analysis, and autonomous AI agents. No subscriptions, no paywalls, and no
        credit card required.
      </p>

      {/* Primary CTA Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/projects"
          className="inline-flex h-12 md:h-14 items-center justify-center rounded-xl bg-[#0F3D2E] px-8 text-base font-semibold text-white shadow-md hover:bg-[#0A291F] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <a
          href="https://github.com/Ibrahist/neemSEO"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 md:h-14 items-center justify-center rounded-xl border border-[#ded9d2] bg-white px-7 text-base font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50 transition-all"
        >
          Explore Source Code
        </a>
      </div>

      {/* Trust & Spec Highlights */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#57534e]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#8CC63F]" />
          <span>100% Free &amp; Open Source</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#8CC63F]" />
          <span>No Credit Card or Login Required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#8CC63F]" />
          <span>AI SEO Agent &amp; MCP Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-[#8CC63F]" />
          <span>Self-Hostable Anywhere</span>
        </div>
      </div>
    </section>
  );
}
