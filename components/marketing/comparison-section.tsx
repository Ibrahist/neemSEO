"use client";

import { DollarSign, Shield, Database, Lock } from "lucide-react";

export function ComparisonSection() {
  const valueProps = [
    {
      icon: DollarSign,
      title: "Wholesale API Pricing",
      desc: "A keyword search costs $0.0075. Tracked rank checks cost $0.001. Pay pennies per month directly to DataForSEO instead of $130+/mo fixed subscription markups.",
    },
    {
      icon: Lock,
      title: "Strict Tenant Isolation",
      desc: "Every keyword, audit, competitor, and GSC token is scoped to your organizationId and projectId. Zero data leaking across teams or agency clients.",
    },
    {
      icon: Database,
      title: "Dual-Dialect Engine",
      desc: "Deploy on Cloudflare D1 with SQLite for zero-maintenance serverless edge hosting, or scale to PostgreSQL with Docker. Dual schemas tested on both dialects.",
    },
    {
      icon: Shield,
      title: "SSRF-Protected Crawler",
      desc: "Our site audit engine blocks private IPv4/IPv6 ranges, loopback, and cloud metadata endpoints (169.254.169.254) with automatic re-validation after redirects.",
    },
  ];

  return (
    <section className="max-w-[1120px] mx-auto px-6 my-14">
      <div className="rounded-3xl bg-[#0F3D2E] text-white p-8 md:p-14 shadow-2xl border border-emerald-950">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Why pay $130+/month for bloated suites?
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
            Traditional SEO suites lock you into expensive monthly plans with arbitrary keyword and
            seat limits. neemSEO gives you the exact same commercial data with 0% software markup.
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
      </div>
    </section>
  );
}
