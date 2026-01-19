"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { FiPackage, FiDatabase, FiAlertTriangle, FiClock } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchInventoryData(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchInventoryData = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const [summaryRes, lowStockRes, expiringRes] = await Promise.all([
        fetch(`${apiUrl}/api/inventory/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/inventory/low-stock?threshold=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/inventory/expiring?days=30`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [summaryData, lowStockData, expiringData] = await Promise.all([
        summaryRes.json(),
        lowStockRes.json(),
        expiringRes.json(),
      ]);

      if (summaryData.success) setSummary(summaryData.data);
      if (lowStockData.success) setLowStock(lowStockData.data || []);
      if (expiringData.success) setExpiring(expiringData.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
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

      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: isCollapsed ? 72 : 260 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Inventory</h1>
              <p className="text-xs text-slate-500">Monitor stock levels and expiry</p>
            </div>
          </div>
        </header>

        <div className="p-5">
          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Batches"
              value={summary?.totalBatches || 0}
              icon={<FiPackage className="h-5 w-5" />}
            />
            <StatCard
              title="Total Units"
              value={summary?.totalUnits?.toLocaleString() || 0}
              icon={<FiDatabase className="h-5 w-5" />}
            />
            <StatCard
              title="Low Stock"
              value={lowStock.length}
              change="Need attention"
              changeType="negative"
              icon={<FiAlertTriangle className="h-5 w-5" />}
            />
            <StatCard
              title="Expiring Soon"
              value={expiring.length}
              change="Within 30 days"
              changeType="negative"
              icon={<FiClock className="h-5 w-5" />}
            />
          </div>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800">Low Stock Alert</h3>
                  <p className="text-xs text-amber-700">{lowStock.length} batches are running low on stock</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Low Stock Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Low Stock Batches</h2>
              </div>
              {lowStock.length > 0 ? (
                <DataTable
                  columns={[
                    {
                      key: "batchNumber",
                      label: "Batch",
                      render: (item) => <span className="font-semibold text-emerald-700">{item.batchNumber}</span>,
                    },
                    {
                      key: "medicine",
                      label: "Medicine",
                      render: (item) => <span className="text-slate-800">{item.medicine?.name}</span>,
                    },
                    {
                      key: "remainingQuantity",
                      label: "Remaining",
                      render: (item) => (
                        <span className="font-medium text-red-600">{item.remainingQuantity}</span>
                      ),
                    },
                  ]}
                  data={lowStock}
                />
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No low stock items
                </div>
              )}
            </div>

            {/* Expiring Soon Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Expiring Soon (30 days)</h2>
              </div>
              {expiring.length > 0 ? (
                <DataTable
                  columns={[
                    {
                      key: "batchNumber",
                      label: "Batch",
                      render: (item) => <span className="font-semibold text-emerald-700">{item.batchNumber}</span>,
                    },
                    {
                      key: "medicine",
                      label: "Medicine",
                      render: (item) => <span className="text-slate-800">{item.medicine?.name}</span>,
                    },
                    {
                      key: "expiryDate",
                      label: "Expiry",
                      render: (item) => (
                        <span className="font-medium text-amber-600">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      ),
                    },
                  ]}
                  data={expiring}
                />
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No items expiring soon
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
