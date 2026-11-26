"use client";

import { useRef } from "react";
import { Shield, Database, Lock, Gift } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ValueProp {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}

const valueProps: ValueProp[] = [
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

function ParallaxMobileCard({
  prop,
  index,
  total,
}: {
  prop: ValueProp;
  index: number;
  total: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth scroll parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.93, 1, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.75]);

  const Icon = prop.icon;

  return (
    <div ref={containerRef} className="relative py-2">
      <motion.div
        style={{ y, scale, opacity }}
        className="p-6 rounded-2xl bg-[#0A291F] border border-emerald-900/60 flex flex-col justify-between space-y-4 shadow-xl will-change-transform"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#8CC63F]/20 text-[#8CC63F] flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400/60 uppercase tracking-widest">
              0{index + 1} / 0{total}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{prop.title}</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">{prop.desc}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 my-14">
      <div className="rounded-3xl bg-[#0F3D2E] text-white p-8 md:p-14 shadow-2xl border border-emerald-950">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Full SEO power. Completely free, forever.
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-300 leading-relaxed">
            No paywalls, no monthly subscription fees, and no artificial feature limits. neemSEO
            gives you the full power of a modern SEO platform completely free, self-hostable, and
            fully open-source.
          </p>
        </div>

        {/* Desktop: Standard 2-Column Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {valueProps.map((prop, idx) => {
            const Icon = prop.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0A291F] border border-emerald-900/60 flex flex-col justify-between space-y-4 hover:border-emerald-700/60 transition-colors shadow-lg"
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

        {/* Mobile: Smooth Scroll Parallax Cards */}
        <div className="flex md:hidden flex-col gap-4">
          {valueProps.map((prop, idx) => (
            <ParallaxMobileCard key={idx} prop={prop} index={idx} total={valueProps.length} />
          ))}
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
