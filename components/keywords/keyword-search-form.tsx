"use client";

import * as React from "react";
import { Search, Coins, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchKeywordsAction } from "@/features/keywords/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface KeywordSearchFormProps {
  projectId: string;
}

export function KeywordSearchForm({ projectId }: KeywordSearchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [seed, setSeed] = React.useState("");
  const [locationCode, setLocationCode] = React.useState("2840"); // Default US

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) return;

    setLoading(true);
    try {
      const res = await searchKeywordsAction({
        projectId,
        seedKeyword: seed.trim(),
        locationCode: Number(locationCode),
        languageCode: "en",
      });

      if (res?.data?.search?.id) {
        toast.success(`Generated ${res.data.keywords.length} keyword variations`);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Search failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Keyword Research & Discovery
          </h2>
          <p className="text-xs text-neutral-500">
            Enter a seed keyword to retrieve search volumes, keyword difficulty, CPC, and intent.
          </p>
        </div>

        {/* Cost Transparency Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <Coins className="h-3.5 w-3.5" />
          <span>Est. Cost: $0.01 USD</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
            (or cached)
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="e.g. seo audit, headless cms, cold email"
            className="pl-9 h-10"
            disabled={loading}
            required
          />
        </div>

        <select
          value={locationCode}
          onChange={(e) => setLocationCode(e.target.value)}
          disabled={loading}
          className="h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm font-medium focus:outline-none cursor-pointer"
        >
          <option value="2840">United States (2840)</option>
          <option value="2826">United Kingdom (2826)</option>
          <option value="2124">Canada (2124)</option>
          <option value="2036">Australia (2036)</option>
          <option value="2276">Germany (2276)</option>
        </select>

        <Button type="submit" disabled={loading} className="h-10 px-6 font-semibold shrink-0">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...
            </>
          ) : (
            "Explore Keywords"
          )}
        </Button>
      </form>
    </div>
  );
}
