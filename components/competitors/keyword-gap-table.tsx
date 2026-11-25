import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { KeywordGapItem } from "@/features/competitors/service";

interface KeywordGapTableProps {
  competitorDomain: string;
  items: KeywordGapItem[];
}

export function KeywordGapTable({ competitorDomain, items }: KeywordGapTableProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Keyword Gap Opportunities vs.{" "}
            <span className="text-emerald-600 font-bold">{competitorDomain}</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Keywords where competitor ranks in top 10, but your project is unranked or &gt; #20.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Search Volume</TableHead>
            <TableHead>KD %</TableHead>
            <TableHead>Competitor Position</TableHead>
            <TableHead>Your Rank</TableHead>
            <TableHead className="text-right">Opportunity Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.keyword}>
              <TableCell className="font-medium text-neutral-900 dark:text-neutral-100">
                {item.keyword}
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold">
                {formatNumber(item.searchVolume)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.keywordDifficulty}%
                </span>
              </TableCell>
              <TableCell>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  #{item.competitorPosition}
                </span>
              </TableCell>
              <TableCell>
                {item.targetPosition ? (
                  <span className="text-xs text-neutral-500">#{item.targetPosition}</span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Unranked</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  {item.opportunityScore}/100
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
