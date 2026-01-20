"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
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

  const filteredLogs = auditLogs.filter((log) => {
    const s = search.toLowerCase();
    const userName = (log.userName || "").toLowerCase();
    const entity = (log.entity || "").toLowerCase();
    const entityId = (log.entityId || "").toLowerCase();
    const action = (log.action || "").toLowerCase();

    return (
      userName.includes(s) ||
      entity.includes(s) ||
      entityId.includes(s) ||
      action.includes(s)
    );
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>

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
                        status={(item.action || "").replace("_", " ")}
                        variant={getActionVariant(item.action || "")}
                      />
                    ),
                  },
                  {
                    key: "entity",
                    label: "Entity",
                    render: (item) => (
                      <div>
                        <p className="text-xs font-medium text-slate-800">
                          {item.entity || "Unknown entity"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.entityId || "N/A"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "userName",
                    label: "User",
                    render: (item) => (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                          {(item.userName || "U").charAt(0)}
                        </span>
                        <span className="text-xs text-slate-700">
                          {item.userName || "Unknown user"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "details",
                    label: "Details",
                    render: (item) => {
                      const details = item.details;
                      if (!details || Object.keys(details).length === 0) {
                        return <span className="text-xs text-slate-400">—</span>;
                      }
                      
                      // Extract key info to display
                      const keyInfo: string[] = [];
                      if (details.batchNumber) keyInfo.push(`Batch: ${details.batchNumber}`);
                      if (details.quantity) keyInfo.push(`Qty: ${details.quantity}`);
                      if (details.qrCodeCount) keyInfo.push(`QR: ${details.qrCodeCount}`);
                      if (details.medicineName) keyInfo.push(details.medicineName);
                      if (details.distributorData?.name) keyInfo.push(`To: ${details.distributorData.name}`);
                      if (details.status) keyInfo.push(`Status: ${details.status}`);
                      if (details.name && !details.batchNumber) keyInfo.push(details.name);
                      
                      if (keyInfo.length === 0) {
                        // Fallback: show first few keys
                        const keys = Object.keys(details).slice(0, 2);
                        keys.forEach(k => {
                          const val = details[k];
                          if (typeof val === 'string' || typeof val === 'number') {
                            keyInfo.push(`${k}: ${String(val).slice(0, 20)}`);
                          }
                        });
                      }
                      
                      return (
                        <div className="max-w-[200px]">
                          {keyInfo.length > 0 ? (
                            <div className="space-y-0.5">
                              {keyInfo.slice(0, 2).map((info, i) => (
                                <p key={i} className="truncate text-xs text-slate-600">
                                  {info}
                                </p>
                              ))}
                              {keyInfo.length > 2 && (
                                <p className="text-xs text-slate-400">+{keyInfo.length - 2} more</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    key: "ipAddress",
                    label: "IP",
                    render: (item) => (
                      <span className="text-xs text-slate-500">
                        {item.ipAddress || "N/A"}
                      </span>
                    ),
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
      </>
  );
}

