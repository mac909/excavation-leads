import { login } from "../actions";
import LogoMark from "@/components/Logo";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="blueprint relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50rem 25rem at 70% -10%, rgba(245,158,11,0.15), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-sm border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0_0_rgba(245,158,11,0.9)]">
        <div className="mb-7 text-center">
          <LogoMark className="mx-auto h-12 w-12" />
          <h1 className="font-display mt-3 text-2xl font-bold uppercase tracking-wide text-slate-900">
            DigSite Leads <span className="text-slate-400">/ Admin</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the demo password to continue
          </p>
        </div>
        <form action={login} className="space-y-4">
          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-none border-2 border-slate-300 px-3.5 py-2.5 text-sm transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          {error && (
            <p className="text-sm font-medium text-red-600">
              Incorrect password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-none bg-slate-900 px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-slate-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
