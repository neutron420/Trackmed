"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../components/sidebar";
import { StatCard } from "../../components/stat-card";
import { ChartCard, SimpleBarChart, SimpleDonutChart, SimpleAreaChart } from "../../components/charts";
import { DataTable, StatusBadge } from "../../components/data-table";
import { ActivityFeed } from "../../components/activity-feed";
import { QuickAction, ProgressCard, AlertCard } from "../../components/cards";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

// Demo data
const recentBatches = [
  { id: "BTH-2026-001", product: "Paracetamol 500mg", quantity: 10000, manufactured: "Jan 15, 2026", expiry: "Jan 15, 2028", status: "active" as const },
  { id: "BTH-2026-002", product: "Amoxicillin 250mg", quantity: 5000, manufactured: "Jan 14, 2026", expiry: "Jan 14, 2027", status: "shipped" as const },
  { id: "BTH-2026-003", product: "Ibuprofen 400mg", quantity: 8500, manufactured: "Jan 12, 2026", expiry: "Jan 12, 2028", status: "active" as const },
  { id: "BTH-2026-004", product: "Vitamin D3 1000IU", quantity: 15000, manufactured: "Jan 10, 2026", expiry: "Jan 10, 2028", status: "delivered" as const },
  { id: "BTH-2026-005", product: "Metformin 500mg", quantity: 12000, manufactured: "Jan 8, 2026", expiry: "Jan 8, 2028", status: "pending" as const },
];

const productionData = [
  { label: "Paracetamol", value: 45000, color: "#0ea371" },
  { label: "Amoxicillin", value: 32000, color: "#3b82f6" },
  { label: "Ibuprofen", value: 28000, color: "#8b5cf6" },
  { label: "Vitamin D3", value: 22000, color: "#f59e0b" },
  { label: "Metformin", value: 18000, color: "#ef4444" },
];

const statusDistribution = [
  { label: "Active", value: 156, color: "#0ea371" },
  { label: "In Transit", value: 42, color: "#3b82f6" },
  { label: "Delivered", value: 89, color: "#8b5cf6" },
  { label: "Pending", value: 23, color: "#f59e0b" },
];

const monthlyProduction = [4200, 5100, 4800, 6200, 5800, 7100, 6500, 7800, 8200, 7600, 8900, 9200];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const activities = [
  { id: "1", type: "batch" as const, title: "New batch created", description: "BTH-2026-006 - Aspirin 325mg", time: "2m ago" },
  { id: "2", type: "shipment" as const, title: "Shipment dispatched", description: "SHP-2026-089 to MedPharm Distributors", time: "15m ago" },
  { id: "3", type: "qr" as const, title: "QR codes generated", description: "500 codes for BTH-2026-005", time: "1h ago" },
  { id: "4", type: "alert" as const, title: "Low inventory alert", description: "Amoxicillin raw materials below threshold", time: "2h ago" },
  { id: "5", type: "user" as const, title: "New user added", description: "production@trackmed.com joined", time: "3h ago" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: isCollapsed ? 72 : 260 }}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Welcome back, {user?.name || "Manufacturer"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">3</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Stats Row */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Batches"
              value="248"
              change="+12%"
              changeType="positive"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <StatCard
              title="Active Products"
              value="156"
              change="+8"
              changeType="positive"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            />
            <StatCard
              title="QR Generated"
              value="12,847"
              change="+523"
              changeType="positive"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
            />
            <StatCard
              title="Pending Shipments"
              value="23"
              change="5 urgent"
              changeType="negative"
              icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
            />
          </div>

          {/* Alert + Quick Actions Row */}
          <div className="mb-5 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <AlertCard
                type="warning"
                title="Low Inventory Alert"
                message="Amoxicillin raw materials running low. Stock will last ~5 days."
                action={{ label: "View Inventory", onClick: () => router.push("/dashboard/inventory") }}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <QuickAction
                  variant="primary"
                  icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                  label="New Batch"
                  description="Create"
                  onClick={() => router.push("/dashboard/batches/new")}
                />
                <QuickAction
                  icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
                  label="QR Codes"
                  description="Generate"
                  onClick={() => router.push("/dashboard/qr-codes")}
                />
                <QuickAction
                  icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
                  label="Shipments"
                  description="Track"
                  onClick={() => router.push("/dashboard/shipments")}
                />
                <QuickAction
                  icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                  label="Reports"
                  description="View"
                  onClick={() => router.push("/dashboard/reports")}
                />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="mb-5 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="Production Overview"
                subtitle="Monthly production units (2026)"
                action={
                  <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                    <option>This Year</option>
                    <option>Last Year</option>
                  </select>
                }
              >
                <SimpleAreaChart data={monthlyProduction} labels={months} height={160} />
              </ChartCard>
            </div>
            <ChartCard title="Batch Status" subtitle="Distribution by status">
              <SimpleDonutChart data={statusDistribution} size={100} />
            </ChartCard>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent Batches Table */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent Batches</h3>
                    <p className="text-xs text-slate-500">Latest production batches</p>
                  </div>
                  <button 
                    onClick={() => router.push("/dashboard/batches")}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    View all →
                  </button>
                </div>
                <DataTable
                  columns={[
                    { key: "id", label: "Batch ID", render: (item) => <span className="font-semibold text-emerald-700">{item.id}</span> },
                    { key: "product", label: "Product", render: (item) => <span className="text-slate-800">{item.product}</span> },
                    { key: "quantity", label: "Quantity", render: (item) => <span className="text-slate-500">{item.quantity.toLocaleString()} units</span> },
                    { key: "status", label: "Status", render: (item) => <StatusBadge status={item.status} /> },
                  ]}
                  data={recentBatches}
                />
              </div>
            </div>

            {/* Activity Feed + Progress */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent Activity</h3>
                <ActivityFeed activities={activities} />
              </div>

              <ProgressCard title="Monthly Target" current={8200} target={10000} unit=" units" />
              
              <ChartCard title="Top Products" subtitle="By production volume">
                <SimpleBarChart data={productionData} />
              </ChartCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
