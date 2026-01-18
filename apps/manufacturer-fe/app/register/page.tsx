"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.password !== form.confirm) {
      setMessage("Passwords must match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.contactName,
          email: form.email,
          password: form.password,
          role: "MANUFACTURER",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errorMsg = data?.error || "Registration failed. Please try again.";
        throw new Error(errorMsg);
      }

      setMessage("Registered successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 text-foreground">
      <div className="card w-full max-w-2xl p-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Manufacturer</p>
          <h1 className="text-3xl font-semibold">Register your organization</h1>
          <p className="muted">Create credentials to access the TrackMed manufacturer dashboard.</p>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Company name</label>
            <input
              className="input w-full px-4 py-3 text-sm"
              placeholder="GreenLeaf Pharma Pvt Ltd"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Primary contact</label>
            <input
              className="input w-full px-4 py-3 text-sm"
              placeholder="Ananya Sen"
              value={form.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Work email</label>
            <input
              className="input w-full px-4 py-3 text-sm"
              type="email"
              placeholder="ops@factory.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="input w-full px-4 py-3 text-sm"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirm password</label>
            <input
              className="input w-full px-4 py-3 text-sm"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => handleChange("confirm", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="md:col-span-2">
            <button
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </div>

          {message ? (
            <p className="md:col-span-2 text-center text-sm text-emerald-700">{message}</p>
          ) : null}
        </form>

        <div className="mt-8 text-center text-sm muted">
          Already registered? <Link className="text-emerald-700 font-semibold" href="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
}
