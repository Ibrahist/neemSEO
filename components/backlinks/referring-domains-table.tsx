import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { ReferringDomainRecord } from "@/features/backlinks/repository";
import { Globe, ExternalLink } from "lucide-react";

interface ReferringDomainsTableProps {
  targetDomain: string;
  domains: ReferringDomainRecord[];
}

export function ReferringDomainsTable({ targetDomain, domains }: ReferringDomainsTableProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Top Referring Domains for{" "}
            <span className="text-emerald-600 font-bold">{targetDomain}</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Domains that link directly to your pages, ranked by authority score.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referring Domain</TableHead>
            <TableHead>Domain Authority Rank</TableHead>
            <TableHead>Total Links</TableHead>
            <TableHead>First Seen</TableHead>
            <TableHead className="text-right">Last Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>{d.referringDomain}</span>
                <a
                  href={`https://${d.referringDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-emerald-600"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  {d.rank}/100
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold">
                {formatNumber(d.backlinksCount)}
              </TableCell>
              <TableCell className="text-xs text-neutral-500 font-mono">
                {d.firstSeen || "—"}
              </TableCell>
              <TableCell className="text-right text-xs text-neutral-500 font-mono">
                {d.lastSeen || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
