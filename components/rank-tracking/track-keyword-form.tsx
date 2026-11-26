"use client";

import * as React from "react";
import { Plus, Coins, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackKeywordAction } from "@/features/rank-tracking/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TrackKeywordFormProps {
  projectId: string;
  defaultDomain: string;
}

export function TrackKeywordForm({ projectId, defaultDomain }: TrackKeywordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");
  const [tags, setTags] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await trackKeywordAction({
        projectId,
        keyword: keyword.trim(),
        targetDomain: defaultDomain,
        tags: tags.trim() || undefined,
      });

      if (res?.data?.trackedKeyword?.id) {
        toast.success(`Started tracking "${keyword.trim()}"`);
        setKeyword("");
        setTags("");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to track keyword";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#ded9d2] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Track Target Keyword</h2>
          <p className="text-xs text-neutral-500">
            Monitor Google organic position history and SERP movement for {defaultDomain}.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          <Coins className="h-3.5 w-3.5" />
          <span>Est. Cost: $0.002 USD/check</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword to track (e.g. open source seo tool)"
          className="flex-1 h-10"
          disabled={loading}
          required
        />

        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (optional, e.g. core, brand)"
          className="sm:w-56 h-10"
          disabled={loading}
        />

        <Button type="submit" disabled={loading} className="h-10 px-5 shrink-0">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Track Keyword
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
