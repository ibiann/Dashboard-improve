"use client";

import { useState } from "react";
import { Activity, Layers, Gauge, Users, DollarSign, ShieldAlert, Construction } from "lucide-react";

import { StrategicSidebar, StrategicTab } from "@/components/strategic/strategic-sidebar";
import { StrategicTopNav, StrategicRole } from "@/components/strategic/strategic-top-nav";
import { StrategicKpiCard } from "@/components/strategic/strategic-kpi-card";
import { PortfolioTab } from "@/components/strategic/portfolio-tab";
import { PeopleTab } from "@/components/strategic/people-tab";
import { MeetingsTab } from "@/components/strategic/meetings-tab";
import { ArchiveTab } from "@/components/strategic/archive-tab";
import { PermissionsTab } from "@/components/strategic/permissions-tab";

import {
  L1_PROJECTS,
  l1GetPortfolioHealth,
  l1GetGlobalSPI,
  l1GetResourceEfficiency,
  l1GetTotalBudget,
} from "@/lib/strategic-mock-data";

const TAB_META: Record<StrategicTab, { title: string; subtitle: string }> = {
  portfolio:   { title: "Danh mục dự án", subtitle: "22 dự án · Cấp độ 1 — Strategic" },
  people:      { title: "Nhân sự", subtitle: "55 nhân viên · Tổ chức và KPI" },
  meetings:    { title: "Lịch họp", subtitle: "8 cuộc họp đã lên lịch" },
  archive:     { title: "Lưu trữ", subtitle: "3 dự án đã hoàn thành" },
  quality:     { title: "Chất lượng", subtitle: "Tích hợp ở bước tiếp" },
  risk:        { title: "Rủi ro", subtitle: "Tích hợp ở bước tiếp" },
  permissions: { title: "Phân quyền", subtitle: "Ma trận quyền — chỉ CTO" },
};

// Placeholder for tabs not yet built
function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Construction className="w-12 h-12 text-muted-foreground/40" />
      <h2 className="text-lg font-bold text-muted-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground/70">Tích hợp ở bước tiếp theo</p>
    </div>
  );
}

export function StrategicDashboard({ initialRole = "CTO" }: { initialRole?: StrategicRole } = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<StrategicRole>(initialRole);
  const [activeTab, setActiveTab] = useState<StrategicTab>("portfolio");

  // Redirect CEO away from CTO-only tabs
  function handleSetRole(r: StrategicRole) {
    setRole(r);
    if (r === "CEO" && (activeTab === "quality" || activeTab === "risk" || activeTab === "permissions")) {
      setActiveTab("portfolio");
    }
  }

  const activeProjects = L1_PROJECTS.filter((p) => !p.closed);
  const closedProjects = L1_PROJECTS.filter((p) => p.closed);

  const portfolioHealth = l1GetPortfolioHealth(L1_PROJECTS);
  const spi = l1GetGlobalSPI(L1_PROJECTS);
  const resourceEff = l1GetResourceEfficiency(L1_PROJECTS);
  const budget = l1GetTotalBudget(L1_PROJECTS);

  const greenCount = activeProjects.filter((p) => p.ragStatus === "green").length;
  const amberCount = activeProjects.filter((p) => p.ragStatus === "amber").length;
  const redCount   = activeProjects.filter((p) => p.ragStatus === "red").length;
  const overdueCount = activeProjects.reduce((acc, p) => acc + p.overdueTasks.length, 0);

  const budgetPct = Math.round((budget.spent / budget.total) * 100);

  const breadcrumbs = [
    { label: "Dashboard" },
    { label: TAB_META[activeTab].title },
  ];

  function renderKPIs() {
    if (role === "CEO") {
      return (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          aria-label="KPI Indicators"
        >
          <StrategicKpiCard
            title="Ngân sách"
            value={`${budgetPct}%`}
            subtitle={`Đã chi ${(budget.spent / 1000000).toFixed(1)}M / ${(budget.total / 1000000).toFixed(1)}M USD`}
            trend={budgetPct <= 80 ? "up" : budgetPct <= 95 ? "neutral" : "down"}
            trendLabel={budgetPct <= 80 ? "Trong ngưỡng" : budgetPct <= 95 ? "Theo dõi" : "Vượt ngân sách"}
            icon={<DollarSign className="w-4 h-4" />}
            highlight
          />
          <StrategicKpiCard
            title="Dự án"
            value={activeProjects.length}
            subtitle={`${greenCount} đúng tiến độ · ${amberCount} rủi ro · ${redCount} chậm`}
            trend={redCount === 0 ? "up" : redCount <= 2 ? "neutral" : "down"}
            trendLabel={`${closedProjects.length} đã hoàn thành`}
            icon={<Layers className="w-4 h-4" />}
          />
          <StrategicKpiCard
            title="SPI"
            value={spi.toFixed(2)}
            subtitle="Schedule Performance Index trung bình"
            trend={spi >= 1 ? "up" : spi >= 0.85 ? "neutral" : "down"}
            trendLabel={spi >= 1 ? "Đúng lịch" : spi >= 0.85 ? "Hơi chậm" : "Chậm tiến độ"}
            icon={<Gauge className="w-4 h-4" />}
          />
          <StrategicKpiCard
            title="Task quá hạn"
            value={overdueCount}
            subtitle="Tổng số task trễ hạn trên toàn danh mục"
            trend={overdueCount === 0 ? "up" : overdueCount <= 5 ? "neutral" : "down"}
            trendLabel={overdueCount === 0 ? "Tốt" : overdueCount <= 5 ? "Cần theo dõi" : "Cần xử lý ngay"}
            icon={<ShieldAlert className="w-4 h-4" />}
          />
        </section>
      );
    }

    // CTO KPIs
    return (
      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        aria-label="KPI Indicators"
      >
        <StrategicKpiCard
          title="Portfolio Health"
          value={`${portfolioHealth}%`}
          subtitle="Tiến độ thực tế / Kế hoạch trung bình"
          trend={portfolioHealth >= 90 ? "up" : portfolioHealth >= 75 ? "neutral" : "down"}
          trendLabel={portfolioHealth >= 90 ? "Lành mạnh" : portfolioHealth >= 75 ? "Trung bình" : "Cần cải thiện"}
          icon={<Activity className="w-4 h-4" />}
          highlight
        />
        <StrategicKpiCard
          title="Dự án"
          value={activeProjects.length}
          subtitle={`${greenCount} đúng tiến độ · ${amberCount} rủi ro · ${redCount} chậm`}
          trend={redCount === 0 ? "up" : redCount <= 2 ? "neutral" : "down"}
          trendLabel={`${closedProjects.length} đã hoàn thành`}
          icon={<Layers className="w-4 h-4" />}
        />
        <StrategicKpiCard
          title="SPI"
          value={spi.toFixed(2)}
          subtitle="Schedule Performance Index trung bình"
          trend={spi >= 1 ? "up" : spi >= 0.85 ? "neutral" : "down"}
          trendLabel={spi >= 1 ? "Đúng lịch" : spi >= 0.85 ? "Hơi chậm" : "Chậm tiến độ"}
          icon={<Gauge className="w-4 h-4" />}
        />
        <StrategicKpiCard
          title="Resource Efficiency"
          value={`${resourceEff}%`}
          subtitle="Hiệu suất nguồn lực tổng hợp"
          trend={resourceEff >= 85 ? "up" : resourceEff >= 70 ? "neutral" : "down"}
          trendLabel={resourceEff >= 85 ? "Hiệu quả" : "Cần xem xét"}
          icon={<Users className="w-4 h-4" />}
        />
      </section>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "portfolio":
        return (
          <div className="space-y-6">
            {renderKPIs()}
            <PortfolioTab projects={L1_PROJECTS} role={role} />
          </div>
        );
      case "people":
        return <PeopleTab />;
      case "meetings":
        return <MeetingsTab />;
      case "archive":
        return <ArchiveTab projects={L1_PROJECTS} />;
      case "quality":
        return <PlaceholderView title="Chất lượng" />;
      case "risk":
        return <PlaceholderView title="Rủi ro" />;
      case "permissions":
        return role === "CTO" ? <PermissionsTab /> : <PlaceholderView title="Phân quyền" />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StrategicSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role={role}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StrategicTopNav
          role={role}
          setRole={handleSetRole}
          breadcrumbs={breadcrumbs}
          onCreateMeeting={() => setActiveTab("meetings")}
        />

        <main className="flex-1 px-4 py-5 md:px-6 space-y-5">
          {/* Page heading */}
          <div>
            <h1 className="text-base font-extrabold text-foreground tracking-tight font-sans">
              {TAB_META[activeTab].title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {TAB_META[activeTab].subtitle}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
