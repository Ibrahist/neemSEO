"use client";

import * as React from "react";
import { Plus, Coins, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addCompetitorAction } from "@/features/competitors/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddCompetitorFormProps {
  projectId: string;
}

export function AddCompetitorForm({ projectId }: AddCompetitorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [domain, setDomain] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    try {
      await addCompetitorAction({
        projectId,
        competitorDomain: domain.trim(),
      });

      toast.success(`Added competitor "${domain.trim()}"`);
      setDomain("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add competitor";
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
            Monitor Competitor Domain
          </h2>
          <p className="text-xs text-neutral-500">
            Compare organic keyword overlap and reveal high-opportunity keyword gaps.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <Coins className="h-3.5 w-3.5" />
          <span>Est. Cost: $0.01 USD/check</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Competitor domain (e.g. competitor.com)"
          className="flex-1 h-10"
          disabled={loading}
          required
        />

        <Button type="submit" disabled={loading} className="h-10 px-5 shrink-0">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Add Competitor
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
