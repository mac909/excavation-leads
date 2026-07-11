import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚜</span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              DigSite Leads
            </span>
          </div>
          <span className="text-xs text-gray-400">Serving Greater Austin, TX</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Get quotes from local excavation pros
          </h1>
          <p className="text-gray-600">
            Tell us about your dig — foundation, pool, trenching, grading, or
            demolition — drop a pin on the site, and we&apos;ll match you with a
            qualified contractor.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <LeadForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Proof-of-concept demo — submissions are stored for demonstration only.
        </p>
      </main>
    </div>
  );
}
