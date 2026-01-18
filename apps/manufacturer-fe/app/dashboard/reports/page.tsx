"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../../components/sidebar";
import { StatCard } from "../../../components/stat-card";
import { StatusBadge } from "../../../components/data-table";
import { FiFileText, FiClock, FiFile, FiDownload, FiRefreshCw, FiTrash2, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { HiOutlineDocumentReport, HiOutlineChartBar, HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineSearch, HiOutlineClock } from "react-icons/hi";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Report {
  id: string;
  reportNumber: string;
  name: string;
  type: string;
  status: string;
  format: string;
  fileUrl: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface ReportStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const reportTypes = [
  {
    id: "PRODUCTION",
    name: "Production Report",
    description: "Batch production summary and statistics",
    icon: <HiOutlineDocumentReport className="h-6 w-6 text-emerald-600" />,
  },
  {
    id: "INVENTORY",
    name: "Inventory Report",
    description: "Current stock levels and movements",
    icon: <HiOutlineChartBar className="h-6 w-6 text-blue-600" />,
  },
  {
    id: "SALES",
    name: "Sales Report",
    description: "Sales analytics and distributor performance",
    icon: <HiOutlineCurrencyDollar className="h-6 w-6 text-amber-600" />,
  },
  {
    id: "QUALITY",
    name: "Quality Report",
    description: "Quality control and compliance data",
    icon: <HiOutlineCheckCircle className="h-6 w-6 text-green-600" />,
  },
  {
    id: "VERIFICATION",
    name: "Verification Report",
    description: "QR scan analytics and counterfeit detection",
    icon: <HiOutlineSearch className="h-6 w-6 text-purple-600" />,
  },
  {
    id: "EXPIRY",
    name: "Expiry Report",
    description: "Products nearing expiration dates",
    icon: <HiOutlineClock className="h-6 w-6 text-red-600" />,
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<any | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/report/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      fetchReports();
      fetchStats();
    }
  }, [isLoading, fetchReports, fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleGenerateReport = async (type: string) => {
    setGenerating(type);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/report/quick/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewReport(data.data);
        fetchReports();
        fetchStats();
      } else {
        alert(data.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Network error. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/report/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/report/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchReports();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "GENERATING":
      case "PENDING":
        return "warning";
      case "FAILED":
        return "danger";
      default:
        return "neutral";
    }
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
              <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
              <p className="text-xs text-slate-500">Generate and download business reports</p>
            </div>
            <button
              onClick={() => { fetchReports(); fetchStats(); }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-5">
          {/* Stats */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Reports"
              value={stats?.total || 0}
              icon={<FiFileText className="h-5 w-5" />}
            />
            <StatCard
              title="Completed"
              value={stats?.completed || 0}
              change="Successfully generated"
              changeType="positive"
              icon={<FiCheck className="h-5 w-5" />}
            />
            <StatCard
              title="Pending"
              value={stats?.pending || 0}
              change="In progress"
              changeType="neutral"
              icon={<FiClock className="h-5 w-5" />}
            />
            <StatCard
              title="Failed"
              value={stats?.failed || 0}
              change={stats?.failed && stats.failed > 0 ? "Needs attention" : "All good"}
              changeType={stats?.failed && stats.failed > 0 ? "negative" : "positive"}
              icon={<FiAlertCircle className="h-5 w-5" />}
            />
          </div>

          {/* Report Types Grid */}
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Generate New Report</h2>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  {report.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{report.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{report.description}</p>
                <div className="mt-4">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generating === report.id}
                    className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {generating === report.id ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Reports */}
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Reports</h2>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {reports.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <FiFile className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-800">{report.name}</p>
                        <p className="text-xs text-slate-500">
                          {report.reportNumber} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} variant={getStatusVariant(report.status)} />
                      <div className="flex items-center gap-1">
                        {report.status === "COMPLETED" && (
                          <button
                            onClick={() => handleDownloadReport(report.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          >
                            <FiDownload className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FiFileText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">No reports generated yet</p>
                <p className="text-xs text-slate-400">Select a report type above to generate</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Report Generated Successfully
              </h3>
              <button
                onClick={() => setPreviewReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-800">
                  Report: {previewReport.report?.reportNumber}
                </p>
                <p className="text-xs text-emerald-600">
                  Type: {previewReport.report?.type?.replace(/_/g, " ")}
                </p>
              </div>

              {previewReport.reportData?.summary && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Summary</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(previewReport.reportData.summary).map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                        <p className="text-sm font-semibold text-slate-800">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    if (previewReport.report?.id) {
                      handleDownloadReport(previewReport.report.id);
                    }
                  }}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <FiDownload className="mr-1 inline h-4 w-4" />
                  Download Full Report
                </button>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
