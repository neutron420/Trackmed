"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "../utils/auth";

const MANUFACTURER_APP_URL = process.env.NEXT_PUBLIC_MANUFACTURER_APP_URL || "http://localhost:3006";

export default function Home() {
  const router = useRouter();
  const manufacturerLoginUrl = useMemo(
    () => `${MANUFACTURER_APP_URL.replace(/\/$/, "")}/login`,
    []
  );

  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(150deg,#f6fbf9_0%,#edf7f4_45%,#fdf4ea_100%)] px-5 py-10 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-float absolute -left-8 top-0 h-64 w-64 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="hero-float-delayed absolute right-0 top-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="hero-float absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_34px_90px_-34px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-emerald-700">
                <Image
                  src="/trackmed-logo.png"
                  alt="TrackMed logo"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
                TRACKMED PORTALS
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
                Secure access for every
                <span className="block bg-[linear-gradient(90deg,#047857_0%,#0d9488_55%,#d97706_100%)] bg-clip-text text-transparent">
                  supply-chain stakeholder
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
                Select your role to continue. Each option takes you to the correct login portal with role-based access.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">System status</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">All services active</p>
              <p className="mt-1 text-xs text-slate-500">Authentication and dashboard services are ready.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Link
              href="/login"
              className="group relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-[linear-gradient(160deg,#ffffff_0%,#eefbf6_100%)] p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-26px_rgba(5,150,105,0.65)]"
            >
              <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-emerald-200/65 blur-2xl transition duration-300 group-hover:scale-110" />
              <div className="relative">
                <div className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                  Admin Access
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">Admin Portal</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Governance controls, verification approvals, operational dashboards, and compliance oversight.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(5,150,105,0.85)] transition group-hover:bg-emerald-700">
                  Continue to Admin
                  <span aria-hidden="true">-&gt;</span>
                </div>
              </div>
            </Link>

            <a
              href={manufacturerLoginUrl}
              className="group relative overflow-hidden rounded-3xl border border-amber-200/80 bg-[linear-gradient(160deg,#ffffff_0%,#fff7ef_100%)] p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-26px_rgba(217,119,6,0.65)]"
            >
              <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-amber-200/65 blur-2xl transition duration-300 group-hover:scale-110" />
              <div className="relative">
                <div className="inline-flex items-center rounded-xl border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                  Manufacturer Access
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">Manufacturer Portal</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Manage products, batches, shipments, and audit-friendly records across the distribution chain.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(217,119,6,0.85)] transition group-hover:bg-amber-700">
                  Continue to Manufacturer
                  <span aria-hidden="true">-&gt;</span>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Role-based access</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Secure authentication</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Fast dashboard redirect</span>
          </div>
        </section>
      </div>

      <style jsx>{`
        .hero-float {
          animation: floatOne 8s ease-in-out infinite;
        }
        .hero-float-delayed {
          animation: floatTwo 10s ease-in-out infinite;
        }
        @keyframes floatOne {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }
        @keyframes floatTwo {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-10px) translateX(-8px);
          }
        }
      `}</style>
    </main>
  );
}
