"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { getToken, getUser, clearAuth, isAuthenticated, isAdmin } from "../../../utils/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface ScanLog {
  id: string;
  qrCode?: { code: string; batch?: { batchNumber: string; medicine?: { name: string } } };
  scanType: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  createdAt: string;
}

export default function QRScansPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, verified: 0, failed: 0 });

  const fetchScans = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const [scansRes, qrRes] = await Promise.all([
        fetch(`${API_BASE}/api/scan-log?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/qr-code?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      const scansData = await scansRes.json();
      const qrData = await qrRes.json();
      
      if (scansData.success) {
        setScans(scansData.data || []);
      }
      if (qrData.success && qrData.stats) {
        setStats({
          total: qrData.stats.totalScans || 0,
          verified: qrData.stats.totalScans || 0,
          failed: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch scans:", error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      clearAuth();
      router.push("/login");
      return;
    }

    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      fetchScans().finally(() => setIsLoading(false));
    } else {
      router.push("/login");
    }
  }, [router, fetchScans]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredScans = scans.filter(s => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      s.qrCode?.code?.toLowerCase().includes(searchLower) ||
      s.qrCode?.batch?.batchNumber?.toLowerCase().includes(searchLower) ||
      s.locationAddress?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
        style={{ marginLeft: isCollapsed ? 72 : 280 }}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">QR Code Scans</h1>
              <p className="text-sm text-slate-500">Monitor all QR code verifications</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by QR code, batch, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => fetchScans()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Total Scans</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Verified</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Failed/Suspicious</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTable
              columns={[
                {
                  key: "time",
                  label: "Time",
                  render: (item) => (
                    <div>
                      <p className="text-sm font-medium text-slate-700">{formatTimeAgo(item.createdAt)}</p>
                      <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  ),
                },
                {
                  key: "qrCode",
                  label: "QR Code",
                  render: (item) => (
                    <span className="font-mono text-sm text-emerald-700">{item.qrCode?.code?.slice(0, 12) || item.id.slice(0, 12)}...</span>
                  ),
                },
                {
                  key: "batch",
                  label: "Batch / Medicine",
                  render: (item) => (
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.qrCode?.batch?.batchNumber || "—"}</p>
                      <p className="text-xs text-slate-500">{item.qrCode?.batch?.medicine?.name || "—"}</p>
                    </div>
                  ),
                },
                {
                  key: "type",
                  label: "Type",
                  render: (item) => (
                    <StatusBadge 
                      status={item.scanType?.replace(/_/g, " ") || "VERIFICATION"} 
                      variant={item.scanType === "VERIFICATION" ? "success" : "info"} 
                    />
                  ),
                },
                {
                  key: "location",
                  label: "Location",
                  render: (item) => (
                    <span className="text-sm text-slate-600 truncate max-w-[150px] block">
                      {item.locationAddress || (item.latitude ? `${item.latitude}, ${item.longitude}` : "—")}
                    </span>
                  ),
                },
              ]}
              data={filteredScans}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
