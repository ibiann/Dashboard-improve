"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import {
  L1Project,
  L1Category,
  L1RAGStatus,
} from "@/lib/strategic-mock-data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type SortKey = "rag" | "name" | "progress";
type FilterRAG = "all" | "green" | "amber" | "red";
type FilterCat = "all" | L1Category;

function RAGBadge({ status }: { status: L1RAGStatus }) {
  const map: Record<L1RAGStatus, { label: string; cls: string }> = {
    green: { label: "On Track", cls: "bg-green-100 text-green-700" },
    amber: { label: "At Risk", cls: "bg-orange-100 text-orange-700" },
    red:   { label: "Delayed", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-green-500": status === "green",
        "bg-orange-500": status === "amber",
        "bg-red-500": status === "red",
      })} />
      {label}
    </span>
  );
}

function SPIBadge({ spi }: { spi: number }) {
  const cls =
    spi >= 1 ? "bg-green-100 text-green-700" :
    spi >= 0.85 ? "bg-orange-100 text-orange-700" :
    "bg-red-100 text-red-700";
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold", cls)}>
      {spi.toFixed(2)}
    </span>
  );
}

function PhaseBar({ phases }: { phases: L1Project["phases"] }) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px w-32">
      {phases.map((ph) => (
        <div key={ph.name} className="flex-1 bg-muted overflow-hidden rounded-sm">
          <div className="h-full rounded-sm" style={{ width: `${ph.progress}%`, backgroundColor: ph.color }} />
        </div>
      ))}
    </div>
  );
}

interface PortfolioTabProps {
  projects: L1Project[];
  role: "CEO" | "CTO";
}

export function PortfolioTab({ projects, role }: PortfolioTabProps) {
  const [search, setSearch] = useState("");
  const [ragFilter, setRagFilter] = useState<FilterRAG>("all");
  const [catFilter, setCatFilter] = useState<FilterCat>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rag");
  const [page, setPage] = useState(1);

  const active = projects.filter((p) => !p.closed);

  const filtered = useMemo(() => {
    let list = [...active];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.pm.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    if (ragFilter !== "all") list = list.filter((p) => p.ragStatus === ragFilter);
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);

    const ragOrder: Record<L1RAGStatus, number> = { red: 0, amber: 1, green: 2 };
    if (sortKey === "rag") list.sort((a, b) => ragOrder[a.ragStatus] - ragOrder[b.ragStatus]);
    else if (sortKey === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === "progress") list.sort((a, b) => b.progress - a.progress);
    return list;
  }, [active, search, ragFilter, catFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const RAG_PILL_OPTIONS: { label: string; value: FilterRAG }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Đúng tiến độ", value: "green" },
    { label: "Rủi ro", value: "amber" },
    { label: "Chậm", value: "red" },
  ];
  const CAT_OPTIONS: { label: string; value: FilterCat }[] = [
    { label: "Tất cả", value: "all" },
    { label: "SW", value: "SW" },
    { label: "HW", value: "HW" },
    { label: "FPGA", value: "FPGA" },
  ];
  const SORT_OPTIONS: { label: string; value: SortKey }[] = [
    { label: "RAG ưu tiên", value: "rag" },
    { label: "Tên", value: "name" },
    { label: "Tiến độ", value: "progress" },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm dự án, PM..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* RAG filter pills */}
        <div className="flex items-center gap-1">
          {RAG_PILL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRagFilter(opt.value); setPage(1); }}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                ragFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1">
          {CAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setCatFilter(opt.value); setPage(1); }}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                catFilter === opt.value
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
          <select
            value={sortKey}
            onChange={(e) => { setSortKey(e.target.value as SortKey); setPage(1); }}
            className="text-[11px] border border-border rounded-md px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-[11px] text-muted-foreground font-medium">
          {filtered.length} dự án
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-[220px]">Dự án / PM</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-20">RAG</th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Phase Progress</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-14">%</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-16">SPI</th>
              {role === "CEO" && (
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-20">Ngân sách</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((p) => {
              const budgetPct = Math.round((p.budget.spent / p.budget.total) * 100);
              return (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground leading-tight">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {p.id} · {p.pm} ·{" "}
                      <span className="font-medium text-secondary">
                        {p.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <RAGBadge status={p.ragStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <PhaseBar phases={p.phases} />
                      <div className="flex gap-1.5">
                        {p.phases.map((ph) => (
                          <span key={ph.name} className="text-[9px] text-muted-foreground">{ph.name}: {ph.progress}%</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-mono font-semibold text-foreground">{p.progress}%</span>
                    <div className="text-[9px] text-muted-foreground">/{p.plannedProgress}%</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <SPIBadge spi={p.spi} />
                  </td>
                  {role === "CEO" && (
                    <td className="px-3 py-3 text-center">
                      <div className="text-[10px] font-mono text-foreground">{budgetPct}%</div>
                      <div className="text-[9px] text-muted-foreground">
                        {(p.budget.spent / 1000).toFixed(0)}k / {(p.budget.total / 1000).toFixed(0)}k
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={role === "CEO" ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  Không tìm thấy dự án nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                "w-7 h-7 rounded-md text-xs font-medium transition-colors",
                page === n
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1 rounded-md disabled:opacity-40 hover:bg-muted transition-colors"
            aria-label="Trang sau"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
