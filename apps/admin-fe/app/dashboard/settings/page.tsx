"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { getToken, getUser, clearAuth, isAdmin } from "../../../utils/auth";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    fraudAlerts: true,
    dailyReports: false,
    adminCode: "TRACKMED-ADMIN-2024",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleSave = () => {
    // In real app, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              <h1 className="text-xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-500">Platform configuration and preferences</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {saved ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </header>

        <div className="p-6 max-w-3xl">
          {/* Notifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive email alerts for important events</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Fraud Alerts</p>
                  <p className="text-sm text-slate-500">Immediate alerts for suspicious activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.fraudAlerts}
                  onChange={(e) => setSettings({ ...settings, fraudAlerts: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Daily Reports</p>
                  <p className="text-sm text-slate-500">Receive daily summary reports via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dailyReports}
                  onChange={(e) => setSettings({ ...settings, dailyReports: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Registration Code
                </label>
                <input
                  type="text"
                  value={settings.adminCode}
                  onChange={(e) => setSettings({ ...settings, adminCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">
                  This code is required for new admin registrations
                </p>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Platform Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Version</span>
                <span className="font-medium text-slate-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">API Endpoint</span>
                <span className="font-mono text-slate-600">localhost:3000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Environment</span>
                <span className="font-medium text-amber-600">Development</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
