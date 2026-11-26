"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { AnchorRecord } from "@/features/backlinks/service";
import { Hash } from "lucide-react";

interface AnchorTextTableProps {
  targetDomain: string;
  anchors: AnchorRecord[];
}

export function AnchorTextTable({ targetDomain, anchors }: AnchorTextTableProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Anchor Text Distribution for{" "}
            <span className="text-emerald-600 font-bold">{targetDomain}</span>
          </h3>
          <p className="text-xs text-neutral-500">
            Terms and phrases used in hyperlinks pointing to this domain.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Anchor Text</TableHead>
            <TableHead>Backlinks</TableHead>
            <TableHead>Referring Domains</TableHead>
            <TableHead className="w-48 text-right">Share of Links</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anchors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-sm text-neutral-500">
                No anchor text data recorded yet. Click Refresh above with a valid DataForSEO key to
                populate.
              </TableCell>
            </TableRow>
          ) : (
            anchors.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span className="font-mono text-xs font-semibold">{item.anchor}</span>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatNumber(item.backlinksCount)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {formatNumber(item.referringDomainsCount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 w-9 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
