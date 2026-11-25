"use client";

import { useState } from "react";
import { AuditIssueRecord } from "@/features/audits/repository";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface AuditIssuesTableProps {
  issues: AuditIssueRecord[];
}

export function AuditIssuesTable({ issues }: AuditIssuesTableProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");

  const filteredIssues = issues.filter((issue) => {
    if (filter === "all") return true;
    return issue.severity === filter;
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Severity-Ranked Audit Issues</CardTitle>
            <CardDescription>
              Prioritized technical issues detected across the crawled site pages.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === "critical"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              }`}
            >
              Critical ({issues.filter((i) => i.severity === "critical").length})
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === "warning"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              }`}
            >
              Warnings ({issues.filter((i) => i.severity === "warning").length})
            </button>
            <button
              onClick={() => setFilter("info")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === "info"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              }`}
            >
              Notices ({issues.filter((i) => i.severity === "info").length})
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-base font-semibold text-foreground">No issues found</p>
            <p className="text-xs">No issues found matching the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Severity</TableHead>
                  <TableHead className="w-44">Issue Type</TableHead>
                  <TableHead>Problem Description</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      {issue.severity === "critical" && (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Critical
                        </Badge>
                      )}
                      {issue.severity === "warning" && (
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1 border-amber-500/40 text-amber-500 bg-amber-500/10"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Warning
                        </Badge>
                      )}
                      {issue.severity === "info" && (
                        <Badge
                          variant="outline"
                          className="flex w-fit items-center gap-1 border-blue-500/40 text-blue-500 bg-blue-500/10"
                        >
                          <Info className="h-3 w-3" />
                          Notice
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {issue.issueType}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{issue.message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {issue.recommendation || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
