import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 text-foreground">
      <div className="card w-full max-w-4xl p-10 sm:p-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              TrackMed Manufacturer Portal
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Operate your manufacturing workflow with real-time visibility.
            </h1>
            <p className="muted text-lg leading-relaxed">
              Register your organization, authenticate securely, and connect to the TrackMed network for inventory, batches, and logistics visibility.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="btn-primary inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
                href="/register"
              >
                Create manufacturer account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
                href="/login"
              >
                Log in
              </Link>
            </div>
          </div>
          <div className="card w-full max-w-sm space-y-4 p-6">
            <p className="text-sm font-semibold text-emerald-700">Quick links</p>
            <div className="space-y-3 text-sm">
              <Link className="block rounded-lg px-3 py-2 hover:bg-emerald-50" href="/register">
                Register your manufacturing org
              </Link>
              <Link className="block rounded-lg px-3 py-2 hover:bg-emerald-50" href="/login">
                Access dashboard
              </Link>
              <a
                className="block rounded-lg px-3 py-2 hover:bg-emerald-50"
                href="https://docs.razorpay.com/" target="_blank" rel="noreferrer"
              >
                Payments setup (Razorpay)
              </a>
              <a
                className="block rounded-lg px-3 py-2 hover:bg-emerald-50"
                href="https://documentation.onesignal.com/"
                target="_blank"
                rel="noreferrer"
              >
                Push notifications (OneSignal)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
