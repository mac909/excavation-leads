import { login } from "../actions";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-1 text-3xl">🚜</div>
          <h1 className="text-lg font-bold text-gray-900">DigSite Leads Admin</h1>
          <p className="text-sm text-gray-500">Enter the demo password to continue</p>
        </div>
        <form action={login} className="space-y-4">
          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {error && (
            <p className="text-sm text-red-600">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
