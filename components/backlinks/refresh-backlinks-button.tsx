"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { refreshBacklinksAction } from "@/features/backlinks/actions";

interface RefreshBacklinksButtonProps {
  projectId: string;
  domain: string;
  label?: string;
}

export function RefreshBacklinksButton({
  projectId,
  domain,
  label = "Refresh Metrics (Est. $0.02)",
}: RefreshBacklinksButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBacklinksAction({ projectId, domain });
      toast.success("Metrics refreshed successfully from DataForSEO");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to refresh metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs h-9 self-start sm:self-auto border-border hover:bg-neutral-100 dark:hover:bg-neutral-800"
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : label}
    </Button>
  );
}
