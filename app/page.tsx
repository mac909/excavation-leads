import LeadForm from "@/components/LeadForm";
import LogoMark from "@/components/Logo";
import PublicTour from "@/components/tour/PublicTour";

const STEPS = [
  {
    n: "01",
    title: "Pin the site",
    body: "Drop a pin on the exact spot — no address hunting, no site-visit guesswork.",
  },
  {
    n: "02",
    title: "Describe the dig",
    body: "Project type, scope, timeline, and budget. Two minutes, tops.",
  },
  {
    n: "03",
    title: "Get matched",
    body: "A vetted local excavation pro reviews the details and reaches out with a quote.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Safety stripe */}
      <div className="hazard h-2" aria-hidden />

      {/* Hero */}
      <div className="blueprint relative bg-slate-950">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              DigSite <span className="text-amber-400">Leads</span>
            </span>
          </div>
          <span className="hidden border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300 sm:inline-block">
            Greater Austin, TX
          </span>
        </header>

        <div id="hero-pitch" className="mx-auto max-w-6xl px-6 pt-10 pb-32 sm:pt-16">
          <p className="mb-4 inline-block border-l-4 border-amber-500 pl-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Free quotes · Vetted local pros
          </p>
          <h1 className="font-display max-w-3xl text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl">
            Break ground <span className="text-amber-400">faster.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            Foundations, pools, trenching, grading, demolition — tell us about
            your dig, drop a pin on the site, and we&apos;ll match you with the
            right excavation contractor.
          </p>
        </div>
      </div>

      {/* Form card overlapping the hero */}
      <main className="relative z-10 mx-auto -mt-20 max-w-6xl px-6">
        <div className="border-2 border-slate-900 bg-white shadow-[8px_8px_0_0_#0f172a]">
          <div className="hazard h-1.5" aria-hidden />
          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-slate-900">
                Tell us about your dig
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Takes about two minutes. The pin is the only thing we can&apos;t
                do without.
              </p>
            </div>
            <LeadForm />
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-4xl py-16">
          <h2 className="font-display mb-10 text-center text-2xl font-bold uppercase tracking-[0.2em] text-slate-400">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0_0_#0f172a]"
              >
                <span className="font-display text-4xl font-bold text-amber-500">
                  {step.n}
                </span>
                <h3 className="font-display mt-2 text-xl font-bold uppercase tracking-wide text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicTour />

      <footer className="border-t-2 border-slate-900 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-center text-xs font-medium uppercase tracking-wider text-slate-400 sm:flex-row sm:text-left">
          <span>© 2026 DigSite Leads</span>
          <span>POC demo — submissions stored for demonstration only</span>
        </div>
      </footer>
    </div>
  );
}
