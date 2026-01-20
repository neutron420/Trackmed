"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { DashboardHeader } from "../../../components/DashboardHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface NotificationSettings {
  batchCreated: boolean;
  batchStatusChanged: boolean;
  expiryWarnings: boolean;
  lowStockAlerts: boolean;
  shipmentUpdates: boolean;
  fraudAlerts: boolean;
  dailyReports: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    batchCreated: true,
    batchStatusChanged: true,
    expiryWarnings: true,
    lowStockAlerts: true,
    shipmentUpdates: true,
    fraudAlerts: true,
    dailyReports: false,
  });

  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showQRPreview: true,
    defaultBatchView: "list" as "list" | "grid",
    itemsPerPage: 20,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const savedNotifications = localStorage.getItem("notificationSettings");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      
      const savedDisplay = localStorage.getItem("displaySettings");
      if (savedDisplay) {
        setDisplaySettings(JSON.parse(savedDisplay));
      }
      
      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem("notificationSettings", JSON.stringify(notifications));
      localStorage.setItem("displaySettings", JSON.stringify(displaySettings));
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setNotifications({
      batchCreated: true,
      batchStatusChanged: true,
      expiryWarnings: true,
      lowStockAlerts: true,
      shipmentUpdates: true,
      fraudAlerts: true,
      dailyReports: false,
    });
    setDisplaySettings({
      compactMode: false,
      showQRPreview: true,
      defaultBatchView: "list",
      itemsPerPage: 20,
    });
    setMessage({ type: "success", text: "Settings reset to defaults" });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={user} onLogout={handleLogout} isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />

      <main className="min-h-screen transition-all duration-200" style={{ marginLeft: isCollapsed ? 72 : 260 }}>
        <DashboardHeader
          title="Settings"
          subtitle="Manage your preferences and notifications"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefaults}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          }
        />

        <div className="p-5 max-w-3xl">
          {/* Message Alert */}
          {message && (
            <div
              className={`mb-5 flex items-center gap-2 rounded-lg p-3 text-sm ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          {/* Notification Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Notifications</h2>
                <p className="text-sm text-slate-500">Choose what notifications you want to receive</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "batchCreated", label: "Batch Created", description: "Get notified when a new batch is registered" },
                { key: "batchStatusChanged", label: "Batch Status Changes", description: "Alerts for batch recalls, expirations, and status updates" },
                { key: "expiryWarnings", label: "Expiry Warnings", description: "Advance warnings for batches approaching expiry" },
                { key: "lowStockAlerts", label: "Low Stock Alerts", description: "Notifications when inventory runs low" },
                { key: "shipmentUpdates", label: "Shipment Updates", description: "Track shipment status changes in real-time" },
                { key: "fraudAlerts", label: "Fraud Alerts", description: "Immediate alerts for suspicious activity" },
                { key: "dailyReports", label: "Daily Reports", description: "Receive daily summary reports" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-700">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof NotificationSettings]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key as keyof NotificationSettings],
                        })
                      }
                      className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                        notifications[item.key as keyof NotificationSettings]
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notifications[item.key as keyof NotificationSettings]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Display Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Display</h2>
                <p className="text-sm text-slate-500">Customize your dashboard appearance</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-700">Compact Mode</p>
                  <p className="text-sm text-slate-500">Use smaller spacing and font sizes</p>
                </div>
                <div className="relative">
                  <div
                    onClick={() =>
                      setDisplaySettings({ ...displaySettings, compactMode: !displaySettings.compactMode })
                    }
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      displaySettings.compactMode ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        displaySettings.compactMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-700">Show QR Preview</p>
                  <p className="text-sm text-slate-500">Display QR code previews in batch lists</p>
                </div>
                <div className="relative">
                  <div
                    onClick={() =>
                      setDisplaySettings({ ...displaySettings, showQRPreview: !displaySettings.showQRPreview })
                    }
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      displaySettings.showQRPreview ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        displaySettings.showQRPreview ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label>

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-700">Default Batch View</p>
                    <p className="text-sm text-slate-500">Choose how batches are displayed by default</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDisplaySettings({ ...displaySettings, defaultBatchView: "list" })}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      displaySettings.defaultBatchView === "list"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                  <button
                    onClick={() => setDisplaySettings({ ...displaySettings, defaultBatchView: "grid" })}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      displaySettings.defaultBatchView === "grid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
                </div>
              </div>

              <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-700">Items per Page</p>
                    <p className="text-sm text-slate-500">Number of items to show in lists</p>
                  </div>
                </div>
                <select
                  value={displaySettings.itemsPerPage}
                  onChange={(e) =>
                    setDisplaySettings({ ...displaySettings, itemsPerPage: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value={10}>10 items</option>
                  <option value={20}>20 items</option>
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                </select>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Platform Information</h2>
                <p className="text-sm text-slate-500">Technical details about the application</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Platform Version</span>
                <span className="font-medium text-slate-900">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">API Endpoint</span>
                <span className="font-mono text-slate-600 text-xs">{API_BASE}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Environment</span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Development
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">User Role</span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
