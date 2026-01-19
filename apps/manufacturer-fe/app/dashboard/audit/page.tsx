"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DataTable, StatusBadge } from "../../../components/data-table";
import { FiDownload, FiSearch, FiFileText } from "react-icons/fi";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  details: any;
  ipAddress: string;
  createdAt: string;
}

export default function AuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchAuditLogs(token);
    } catch {
      router.push("/login");
    }
  }, [router, page, actionFilter]);

  const fetchAuditLogs = async (token: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/audit-trail?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      // Demo data
      setAuditLogs([
        {
          id: "1",
          action: "CREATE",
          entity: "Batch",
          entityId: "BCH-2024-001",
          userId: "usr-1",
          userName: "John Doe",
          details: { batchNumber: "BCH-2024-001", quantity: 1000 },
          ipAddress: "192.168.1.100",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          action: "UPDATE",
          entity: "Medicine",
          entityId: "MED-001",
          userId: "usr-2",
          userName: "Jane Smith",
          details: { field: "price", oldValue: 100, newValue: 120 },
          ipAddress: "192.168.1.101",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          action: "GENERATE_QR",
          entity: "QRCode",
          entityId: "QR-001",
          userId: "usr-1",
          userName: "John Doe",
          details: { batchId: "BCH-2024-001", count: 100 },
          ipAddress: "192.168.1.100",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          action: "VERIFY",
          entity: "QRCode",
          entityId: "QR-002",
          userId: "usr-3",
          userName: "Consumer App",
          details: { result: "authentic", location: "Mumbai" },
          ipAddress: "203.192.10.45",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          action: "DELETE",
          entity: "Distributor",
          entityId: "DIST-005",
          userId: "usr-2",
          userName: "Jane Smith",
          details: { reason: "Inactive account" },
          ipAddress: "192.168.1.101",
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "info";
      case "DELETE":
        return "danger";
      case "VERIFY":
        return "success";
      case "GENERATE_QR":
        return "info";
      default:
        return "neutral";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
  );

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
              <h1 className="text-lg font-semibold text-slate-900">Audit Trail</h1>
              <p className="text-xs text-slate-500">Track all system activities</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
              <FiDownload className="h-4 w-4" />
              Export Logs
            </button>
          </div>
        </header>

        <div className="p-5">
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VERIFY">Verify</option>
              <option value="GENERATE_QR">Generate QR</option>
            </select>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {filteredLogs.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: "createdAt",
                    label: "Time",
                    render: (item) => (
                      <div className="text-xs">
                        <p className="font-medium text-slate-700">{formatTimeAgo(item.createdAt)}</p>
                        <p className="text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</p>
                      </div>
                    ),
                  },
                  {
                    key: "action",
                    label: "Action",
                    render: (item) => (
                      <StatusBadge
                        status={item.action.replace("_", " ")}
                        variant={getActionVariant(item.action)}
                      />
                    ),
                  },
                  {
                    key: "entity",
                    label: "Entity",
                    render: (item) => (
                      <div>
                        <p className="text-xs font-medium text-slate-800">{item.entity}</p>
                        <p className="text-xs text-slate-500">{item.entityId}</p>
                      </div>
                    ),
                  },
                  {
                    key: "userName",
                    label: "User",
                    render: (item) => (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                          {item.userName.charAt(0)}
                        </span>
                        <span className="text-xs text-slate-700">{item.userName}</span>
                      </div>
                    ),
                  },
                  {
                    key: "details",
                    label: "Details",
                    render: (item) => (
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {JSON.stringify(item.details).slice(0, 50)}...
                      </code>
                    ),
                  },
                  {
                    key: "ipAddress",
                    label: "IP",
                    render: (item) => <span className="text-xs text-slate-500">{item.ipAddress}</span>,
                  },
                ]}
                data={filteredLogs}
              />
            ) : (
              <div className="py-12 text-center">
                <FiFileText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No audit logs found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredLogs.length} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
