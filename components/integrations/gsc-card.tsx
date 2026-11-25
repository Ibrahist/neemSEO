"use client";

import { useTransition, useState } from "react";
import { connectGscAction, disconnectGscAction } from "@/features/integrations/gsc/actions";
import { GscConnectionStatus } from "@/features/integrations/gsc/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Loader2, CheckCircle2, ShieldCheck, Unlink } from "lucide-react";

interface GscCardProps {
  projectId: string;
  defaultDomain: string;
  status: GscConnectionStatus;
}

export function GscCard({ projectId, defaultDomain, status }: GscCardProps) {
  const [isPending, startTransition] = useTransition();
  const [siteUrl, setSiteUrl] = useState(status.siteUrl || `https://${defaultDomain}`);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("siteUrl", siteUrl.trim());

      const res = await connectGscAction(formData);
      if (res.success) {
        toast.success("Google Search Console connected successfully!");
      } else {
        toast.error(res.error || "Failed to connect Google Search Console");
      }
    });
  }

  function handleDisconnect() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);

      const res = await disconnectGscAction(formData);
      if (res.success) {
        toast.success("Google Search Console disconnected.");
      } else {
        toast.error(res.error || "Failed to disconnect");
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Google Search Console Integration</CardTitle>
          </div>
          {status.isConnected ? (
            <Badge
              variant="outline"
              className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>
        <CardDescription>
          Import real organic search queries, clicks, impressions, and average position from Google
          Search Console. Tokens are securely encrypted with AES-256-GCM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.isConnected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">Active Property URL</div>
                <div className="font-mono text-xs text-muted-foreground">{status.siteUrl}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> OAuth credentials encrypted
                  at rest with AES-256-GCM
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://example.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                disabled={isPending}
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Search Console"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
