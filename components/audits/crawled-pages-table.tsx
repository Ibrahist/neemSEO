import { CrawledPageRecord } from "@/features/audits/repository";
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
import { Globe, FileQuestion } from "lucide-react";

interface CrawledPagesTableProps {
  pages: CrawledPageRecord[];
}

export function CrawledPagesTable({ pages }: CrawledPagesTableProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Crawled Pages Inventory ({pages.length})</CardTitle>
        </div>
        <CardDescription>
          Detailed inspection of individual crawled pages, response statuses, titles, and latency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <FileQuestion className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No pages crawled yet</p>
            <p className="text-xs">Run a technical audit above to populate pages.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Page Title</TableHead>
                  <TableHead className="w-24">Indexable</TableHead>
                  <TableHead className="w-24 text-right">Load Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => {
                  const status = page.statusCode ?? 0;
                  let statusBadge = (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                    >
                      {status}
                    </Badge>
                  );

                  if (status >= 400) {
                    statusBadge = <Badge variant="destructive">{status}</Badge>;
                  } else if (status >= 300) {
                    statusBadge = (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 text-amber-500 bg-amber-500/10"
                      >
                        {status}
                      </Badge>
                    );
                  }

                  return (
                    <TableRow key={page.id}>
                      <TableCell>{statusBadge}</TableCell>
                      <TableCell className="max-w-[280px] truncate font-mono text-xs">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-primary"
                        >
                          {page.url}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs">
                        {page.title || <span className="text-muted-foreground italic">None</span>}
                      </TableCell>
                      <TableCell>
                        {page.isIndexable ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-500 border-emerald-500/30"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Noindex
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {page.loadTimeMs > 0 ? `${page.loadTimeMs}ms` : "—"}
                      </TableCell>
                    </TableRow>
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
