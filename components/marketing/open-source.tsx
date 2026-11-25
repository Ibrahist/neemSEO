"use client";

import Link from "next/link";
import { Github, Server } from "lucide-react";

export function OpenSource() {
  return (
    <section className="border-y border-[#ded9d2] bg-[#faf8f5] py-16">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F3D2E]">
            100% Open Source &amp; Self-Hostable
          </h2>
          <p className="mt-3 text-base text-[#57534e] leading-relaxed">
            Own your SEO infrastructure. Deploy on Cloudflare Workers using OpenNext with zero
            cold-starts, or spin up with Docker Compose on your own server. Full dual-dialect SQLite
            and Postgres support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F3D2E] text-sm font-semibold text-white hover:bg-[#0A291F] shadow-sm transition-all"
          >
            <Github className="h-4 w-4" />
            <span>Star on GitHub</span>
          </a>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#ded9d2] bg-white text-sm font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <Server className="h-4 w-4 text-emerald-700" />
            <span>Self-Hosting Guides</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
