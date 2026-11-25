"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Download, ArrowUpDown, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { KeywordRecord } from "@/features/keywords/repository";
import { exportKeywordsCsvAction } from "@/features/keywords/actions";
import { toast } from "sonner";

interface KeywordTableProps {
  searchId: string;
  projectId: string;
  seedKeyword: string;
  keywords: KeywordRecord[];
}

export function KeywordTable({ searchId, projectId, seedKeyword, keywords }: KeywordTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "searchVolume", desc: true }]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  const columns = React.useMemo<ColumnDef<KeywordRecord>[]>(
    () => [
      {
        accessorKey: "keyword",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
          >
            Keyword <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {row.original.keyword}
          </div>
        ),
      },
      {
        accessorKey: "intent",
        header: "Intent",
        cell: ({ row }) => {
          const intent = row.original.intent;
          const badgeVariants: Record<string, { label: string; className: string }> = {
            informational: {
              label: "Informational",
              className:
                "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
            },
            commercial: {
              label: "Commercial",
              className:
                "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900",
            },
            transactional: {
              label: "Transactional",
              className:
                "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
            },
            navigational: {
              label: "Navigational",
              className:
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
            },
          };

          const config = badgeVariants[intent] || badgeVariants.informational;
          return (
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "searchVolume",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
          >
            Volume <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono font-medium">{formatNumber(row.original.searchVolume)}</span>
        ),
      },
      {
        accessorKey: "keywordDifficulty",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
          >
            KD % <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const kd = row.original.keywordDifficulty;
          let color = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60";
          if (kd >= 70) color = "text-red-600 bg-red-50 dark:bg-red-950/60";
          else if (kd >= 50) color = "text-amber-600 bg-amber-50 dark:bg-amber-950/60";
          else if (kd >= 30) color = "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/60";

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}
            >
              {kd}%
            </span>
          );
        },
      },
      {
        accessorKey: "cpc",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900"
          >
            CPC <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{formatCurrency(row.original.cpc)}</span>
        ),
      },
      {
        accessorKey: "competition",
        header: "Competition",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, Math.round(row.original.competition * 100))}%` }}
              />
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {row.original.competition.toFixed(2)}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: keywords,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  async function handleDownloadCsv() {
    setExporting(true);
    try {
      const csvString = await exportKeywordsCsvAction(searchId, projectId);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `keywords-${seedKeyword.replace(/\s+/g, "-")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter keywords..."
            className="pl-8 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-neutral-500">
            {table.getFilteredRowModel().rows.length} of {keywords.length} keywords
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            disabled={exporting || keywords.length === 0}
            className="h-9 gap-1 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-neutral-500"
              >
                No keywords found. Try searching for a different seed keyword.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
