"use client";

import { Sparkles, Shield, Database, Lock, Gift } from "lucide-react";

export function ComparisonSection() {
  const valueProps = [
    {
      icon: Gift,
      title: "100% Free & Open Source",
      desc: "Zero software licenses, zero seat limits, and zero paywalled tools. Run it locally or deploy on your own servers with complete autonomy.",
    },
    {
      icon: Lock,
      title: "Strict Privacy & Data Ownership",
      desc: "Every keyword, audit, competitor benchmark, and GSC token belongs to you. Zero data selling, zero telemetry, and strict tenant isolation.",
    },
    {
      icon: Database,
      title: "Dual-Dialect Self-Hosting",
      desc: "Deploy for free on Cloudflare D1 with SQLite for zero-maintenance edge hosting, or scale to PostgreSQL with Docker. Dual schemas tested on both.",
    },
    {
      icon: Shield,
      title: "SSRF-Protected Security",
      desc: "Our site audit engine blocks private IPv4/IPv6 ranges, loopback, and cloud metadata endpoints (169.254.169.254) with automatic re-validation.",
    },
  ];

  return (
    <section className="max-w-[1120px] mx-auto px-6 my-14">
      <div className="rounded-3xl bg-[#0F3D2E] text-white p-8 md:p-14 shadow-2xl border border-emerald-950">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/30 text-[#8CC63F] text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free Forever · No Subscription · No Credit Card</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Full SEO power. Completely free, forever.
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
            No paywalls, no monthly subscription fees, and no artificial feature limits. neemSEO
            gives you the full power of a modern SEO platform completely free, self-hostable, and
            fully open-source.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0A291F] border border-emerald-900/60 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{prop.title}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-10 pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-neutral-300">
            <span className="font-semibold text-white">Instant Access:</span> No registration, no
            login, and no payment required.
          </div>
          <span className="text-xs font-semibold text-[#8CC63F]">100% Free Forever</span>
        </div>
      </div>
    </section>
  );
}
