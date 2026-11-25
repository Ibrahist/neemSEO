"use client";

import { useTransition, useState } from "react";
import { startSiteAuditAction } from "@/features/audits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ScanSearch, Loader2, ShieldCheck } from "lucide-react";

interface StartAuditFormProps {
  projectId: string;
  defaultDomain?: string;
}

export function StartAuditForm({ projectId, defaultDomain }: StartAuditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState(
    defaultDomain
      ? defaultDomain.startsWith("http")
        ? defaultDomain
        : `https://${defaultDomain}`
      : ""
  );
  const [maxPages, setMaxPages] = useState("15");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please provide a starting website URL");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("startUrl", url.trim());
      formData.set("maxPages", maxPages);

      const res = await startSiteAuditAction(formData);
      if (res.success) {
        toast.success("Site crawl completed successfully!");
      } else {
        toast.error(res.error || "Failed to run site audit");
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Run Technical SEO Audit</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>SSRF-Safe & robots.txt compliant</span>
          </div>
        </div>
        <CardDescription>
          Crawl up to 50 pages to detect broken links, missing meta tags, canonical errors, and
          performance bottlenecks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <div className="w-36">
            <select
              value={maxPages}
              onChange={(e) => setMaxPages(e.target.value)}
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="10">Crawl 10 pages</option>
              <option value="15">Crawl 15 pages</option>
              <option value="25">Crawl 25 pages</option>
              <option value="50">Crawl 50 pages</option>
            </select>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Crawling...
              </>
            ) : (
              "Start Audit"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
