"use client";

import { useState } from "react";
import { Folder, Layers, Clock, ChevronRight, ArrowRight, TrendingUp, TrendingDown, Minus, Search, SortAsc } from "lucide-react";
import {
  PM_PROJECTS,
  getProjectProgress,
  getRAGColor,
  getRAGLabel,
  getSPIBadge,
  getAllTasks,
  PMProject,
} from "@/lib/pm-mock-data";

interface PMHomeProps {
  onSelectProject: (projectId: string, tab?: string) => void;
}

function RAGBadge({ rag }: { rag: PMProject["ragStatus"] }) {
  const color = getRAGColor(rag);
  const label = getRAGLabel(rag);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: color }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
      {label}
    </span>
  );
}

function SPIBadge({ spi }: { spi: number }) {
  const { label, color } = getSPIBadge(spi);
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ color, borderColor: color + "44", backgroundColor: color + "11" }}
    >
      SPI {spi.toFixed(2)} — {label}
    </span>
  );
}

function ProjectCard({
  project,
  onSelectProject,
}: {
  project: PMProject;
  onSelectProject: (id: string, tab?: string) => void;
}) {
  const progress = getProjectProgress(project);
  const allTasks = getAllTasks(project);
  const reviewCount = allTasks.filter((t) => t.status === "Waiting for Review").length;

  return (
    <article className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 cursor-pointer"
        onClick={() => onSelectProject(project.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelectProject(project.id)}
        aria-label={`Open project ${project.name}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold text-muted-foreground">{project.id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {project.category}
            </span>
          </div>
          <RAGBadge rag={project.ragStatus} />
        </div>

        <h3 className="text-sm font-bold text-foreground leading-tight mb-3 text-balance">
          {project.name}
        </h3>

        {/* Progress bar */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">Overall progress</span>
            <span className="text-xs font-bold text-foreground font-mono">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: getRAGColor(project.ragStatus),
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground font-mono">{project.spi.toFixed(2)}</span>
            <span>SPI</span>
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground font-mono">{allTasks.length}</span>
            <span>tasks</span>
            {reviewCount > 0 && (
              <span className="ml-1 bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                {reviewCount} review
              </span>
            )}
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground font-mono">{project.teamSize}</span>
            <span>members</span>
          </span>
        </div>

        <div className="mt-1.5 text-[10px] text-muted-foreground font-mono">
          {project.totalLoggedHours.toLocaleString()}h / {project.totalPlannedHours.toLocaleString()}h
        </div>
      </div>

      {/* SPI badge */}
      <div className="px-4 pb-3">
        <SPIBadge spi={project.spi} />
      </div>

      {/* Quick action buttons */}
      <div className="flex border-t border-border">
        <button
          onClick={() => onSelectProject(project.id, "phases")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-primary hover:bg-muted transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          Phase Plan
          <ArrowRight className="w-3 h-3" />
        </button>
        <span className="w-px bg-border" />
        <button
          onClick={() => onSelectProject(project.id, "kanban")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-primary hover:bg-muted transition-colors"
        >
          <Folder className="w-3.5 h-3.5" />
          Kanban
          {reviewCount > 0 && (
            <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {reviewCount}
            </span>
          )}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </article>
  );
}

export function PMHome({ onSelectProject }: PMHomeProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"rag" | "name" | "progress">("rag");

  // Global stats
  const totalReview = PM_PROJECTS.reduce((s, p) => s + getAllTasks(p).filter((t) => t.status === "Waiting for Review").length, 0);
  const totalTimesheets = PM_PROJECTS.reduce((s, p) => s + p.pendingTimesheetCount, 0);
  const ragCounts = { green: 0, amber: 0, red: 0 };
  PM_PROJECTS.forEach((p) => ragCounts[p.ragStatus]++);

  // Filter + sort
  const filtered = PM_PROJECTS
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "progress") return getProjectProgress(b) - getProjectProgress(a);
      // rag: red first, then amber, then green
      const order = { red: 0, amber: 1, green: 2 };
      return order[a.ragStatus] - order[b.ragStatus];
    });

  return (
    <div className="space-y-5">
      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-3" aria-label="Quick stats">
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Folder className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Du an cua toi</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground font-mono">{PM_PROJECTS.length}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <span className="text-green-600 font-semibold">{ragCounts.green} on track</span>
            <span className="text-amber-500 font-semibold">{ragCounts.amber} at risk</span>
            <span className="text-red-500 font-semibold">{ragCounts.red} delayed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ChevronRight className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tasks can review</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-500 font-mono">{totalReview}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Tren toan bo du an</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Timesheet pending</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-500 font-mono">{totalTimesheets}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Cho duyet</p>
        </div>
      </section>

      {/* Filter / Sort bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tim du an..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <SortAsc className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            className="text-xs bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="rag">Theo RAG</option>
            <option value="name">Theo ten</option>
            <option value="progress">Theo tien do</option>
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Project list">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} onSelectProject={onSelectProject} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground text-center py-10">
            Khong tim thay du an nao
          </p>
        )}
      </section>
    </div>
  );
}
