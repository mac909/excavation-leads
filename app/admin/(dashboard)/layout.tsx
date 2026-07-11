import Link from "next/link";
import { logout } from "../actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🚜</span>
            <span className="font-bold tracking-tight text-gray-900">
              DigSite Leads <span className="font-normal text-gray-400">/ Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-900">
              Public site
            </Link>
            <form action={logout}>
              <button className="text-gray-500 hover:text-gray-900">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
