"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { LatLng } from "./LocationPicker";
import {
  PROJECT_TYPE_LABELS,
  TIMELINE_LABELS,
  BUDGET_LABELS,
} from "@/lib/labels";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

const inputClass =
  "w-full rounded-none border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40";

const labelClass = "block text-sm font-medium text-slate-700";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display border-l-4 border-amber-500 pl-2 text-lg font-bold uppercase tracking-[0.15em] text-slate-900">
      {children}
    </p>
  );
}

export default function LeadForm() {
  const [pin, setPin] = useState<LatLng | null>(null);
  const [address, setAddress] = useState("");
  const [addressEdited, setAddressEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePin(pos: LatLng) {
    setPin(pos);
    if (addressEdited) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.lat}&lon=${pos.lng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) setAddress(data.display_name);
      }
    } catch {
      // reverse geocoding is best-effort; the pin alone is enough
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pin) return;
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: address || null,
      lat: pin.lat,
      lng: pin.lng,
      projectType: form.get("projectType"),
      description: form.get("description"),
      timeline: form.get("timeline"),
      budgetRange: form.get("budgetRange"),
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting your project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-none border-2 border-emerald-600 bg-emerald-50">
          <svg
            className="h-7 w-7 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="font-display mt-4 text-3xl font-bold uppercase tracking-wide text-slate-900">
          Thanks — we received your project
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          A local excavation pro will review the details and reach out shortly
          with a quote.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setPin(null);
            setAddress("");
            setAddressEdited(false);
          }}
          className="mt-8 rounded-none border-2 border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-slate-700"
        >
          Submit another project
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-8">
        <div id="tour-contact" className="space-y-4">
          <SectionTitle>Contact</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input name="name" required className={`mt-1.5 ${inputClass}`} placeholder="Jane Smith" />
            </label>
            <label className={labelClass}>
              Phone
              <input name="phone" type="tel" required className={`mt-1.5 ${inputClass}`} placeholder="512-555-0100" />
            </label>
          </div>
          <label className={labelClass}>
            Email
            <input name="email" type="email" required className={`mt-1.5 ${inputClass}`} placeholder="jane@example.com" />
          </label>
        </div>

        <div id="tour-project" className="space-y-4">
          <SectionTitle>Project</SectionTitle>
          <label className={labelClass}>
            Project type
            <select name="projectType" required defaultValue="" className={`mt-1.5 ${inputClass}`}>
              <option value="" disabled>Select a project type…</option>
              {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Project details
            <textarea
              name="description"
              required
              rows={4}
              className={`mt-1.5 ${inputClass}`}
              placeholder="Tell us about the site, access, soil, and what you need dug…"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Timeline
              <select name="timeline" required defaultValue="" className={`mt-1.5 ${inputClass}`}>
                <option value="" disabled>When do you need it?</option>
                {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Budget range
              <select name="budgetRange" required defaultValue="" className={`mt-1.5 ${inputClass}`}>
                <option value="" disabled>Estimated budget…</option>
                {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div id="tour-location" className="flex flex-col gap-4">
        <div className="space-y-4">
          <SectionTitle>Location</SectionTitle>
          <p className="-mt-2 text-sm text-slate-500">
            Click the map to drop a pin on the excavation site.
            {pin && (
              <span className="ml-1.5 inline-flex items-center gap-1 border border-amber-600 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  aria-hidden
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </span>
            )}
          </p>
        </div>
        <div className="h-72 overflow-hidden border-2 border-slate-900 lg:h-80">
          <LocationPicker value={pin} onChange={handlePin} />
        </div>
        <label className={labelClass}>
          Address <span className="font-normal text-slate-400">(optional — auto-filled from pin)</span>
          <input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressEdited(true);
            }}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Street address or parcel description"
          />
        </label>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button
          id="tour-submit"
          type="submit"
          disabled={!pin || submitting}
          className="mt-auto rounded-none border-2 border-slate-900 bg-amber-500 px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-900 shadow-[4px_4px_0_0_#0f172a] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0f172a] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {submitting ? "Submitting…" : pin ? "Get My Free Quote →" : "Drop a pin on the map to continue"}
        </button>
      </div>
    </form>
  );
}
