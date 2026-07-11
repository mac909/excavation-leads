import Link from "next/link";
import { logout } from "../actions";
import LogoMark from "@/components/Logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-bold uppercase tracking-wide text-white">
              DigSite <span className="text-amber-400">Leads</span>{" "}
              <span className="ml-1.5 border border-amber-500/60 px-1.5 py-0.5 align-middle font-sans text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Admin
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-4 text-xs sm:gap-5 sm:text-sm">
            <Link href="/" className="whitespace-nowrap text-slate-400 transition hover:text-white">
              Public site
            </Link>
            <form action={logout}>
              <button className="whitespace-nowrap text-slate-400 transition hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="hazard h-1.5" aria-hidden />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
