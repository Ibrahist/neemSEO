"use client";

import { useState } from "react";
import { PromptWithResults } from "@/features/ai-visibility/service";
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
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, ExternalLink, Bot } from "lucide-react";

interface PromptsHistoryTableProps {
  prompts: PromptWithResults[];
}

export function PromptsHistoryTable({ prompts }: PromptsHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Visibility Prompt Logs ({prompts.length})</CardTitle>
        </div>
        <CardDescription>
          Detailed inspection of AI responses, brand mentions, and extracted citation URLs across
          models.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Bot className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No prompts analyzed yet</p>
            <p className="text-xs">
              Run your first prompt citation test above to inspect AI engine results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Search Prompt</TableHead>
                  <TableHead className="w-32">Brand & Domain</TableHead>
                  <TableHead className="w-64">Engine Results</TableHead>
                  <TableHead className="w-28 text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map(({ prompt, results }) => {
                  const isExpanded = expandedId === prompt.id;
                  const dateStr = new Date(prompt.createdAt).toLocaleDateString();

                  return (
                    <div key={prompt.id} className="contents">
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(prompt.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{prompt.prompt}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="font-semibold text-foreground">{prompt.brandName}</div>
                          <div className="truncate">{prompt.targetDomain}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {results.map((res) => {
                              let colorClass = "border-muted-foreground/30 text-muted-foreground";

                              if (res.isBrandMentioned && res.isDomainCited) {
                                colorClass =
                                  "border-emerald-500/30 text-emerald-500 bg-emerald-500/10";
                              } else if (res.isBrandMentioned) {
                                colorClass = "border-amber-500/30 text-amber-500 bg-amber-500/10";
                              }

                              return (
                                <Badge
                                  key={res.id}
                                  variant="outline"
                                  className={`text-[10px] capitalize flex items-center gap-1 ${colorClass}`}
                                >
                                  {res.isBrandMentioned ? (
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                  ) : (
                                    <XCircle className="h-2.5 w-2.5 opacity-50" />
                                  )}
                                  {res.engine}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {dateStr}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={5} className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {results.map((res) => {
                                const citations: string[] = res.citationUrlsJson
                                  ? JSON.parse(res.citationUrlsJson)
                                  : [];

                                return (
                                  <div
                                    key={res.id}
                                    className="rounded-lg border border-border bg-background p-4 space-y-2"
                                  >
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                      <span className="font-bold text-xs uppercase tracking-wider text-primary">
                                        {res.engine}
                                      </span>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span>
                                          Brand: {res.isBrandMentioned ? "Mentioned" : "Omitted"}
                                        </span>
                                        <span>•</span>
                                        <span>Domain: {res.isDomainCited ? "Cited" : "None"}</span>
                                      </div>
                                    </div>
                                    <p className="whitespace-pre-line text-xs text-muted-foreground leading-relaxed">
                                      {res.responseText}
                                    </p>
                                    {citations.length > 0 && (
                                      <div className="pt-2 border-t border-border">
                                        <div className="text-[11px] font-semibold text-foreground mb-1">
                                          Extracted Citation URLs:
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          {citations.map((c, i) => (
                                            <a
                                              key={i}
                                              href={c}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="flex items-center gap-1 text-[11px] text-primary hover:underline truncate"
                                            >
                                              <ExternalLink className="h-3 w-3 shrink-0" />
                                              <span className="truncate">{c}</span>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </div>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
