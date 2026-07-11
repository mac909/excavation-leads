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
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

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
      <div className="rounded-lg border border-green-200 bg-green-50 p-10 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h2 className="mb-2 text-xl font-semibold text-green-900">
          Thanks — we received your project
        </h2>
        <p className="mb-6 text-sm text-green-800">
          A local excavation pro will review the details and reach out shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setPin(null);
            setAddress("");
            setAddressEdited(false);
          }}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Submit another project
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Name
            <input name="name" required className={`mt-1 ${inputClass}`} placeholder="Jane Smith" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Phone
            <input name="phone" type="tel" required className={`mt-1 ${inputClass}`} placeholder="512-555-0100" />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input name="email" type="email" required className={`mt-1 ${inputClass}`} placeholder="jane@example.com" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Project type
          <select name="projectType" required defaultValue="" className={`mt-1 ${inputClass}`}>
            <option value="" disabled>Select a project type…</option>
            {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Project details
          <textarea
            name="description"
            required
            rows={4}
            className={`mt-1 ${inputClass}`}
            placeholder="Tell us about the site, access, soil, and what you need dug…"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Timeline
            <select name="timeline" required defaultValue="" className={`mt-1 ${inputClass}`}>
              <option value="" disabled>When do you need it?</option>
              {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Budget range
            <select name="budgetRange" required defaultValue="" className={`mt-1 ${inputClass}`}>
              <option value="" disabled>Estimated budget…</option>
              {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Project location</span>
          <p className="text-xs text-gray-500">
            Click the map to drop a pin on the excavation site.
            {pin && (
              <span className="ml-1 font-medium text-amber-700">
                Pin: {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
              </span>
            )}
          </p>
        </div>
        <div className="h-72 overflow-hidden rounded-lg border border-gray-300 lg:h-80">
          <LocationPicker value={pin} onChange={handlePin} />
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Address <span className="font-normal text-gray-400">(optional — auto-filled from pin)</span>
          <input
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressEdited(true);
            }}
            className={`mt-1 ${inputClass}`}
            placeholder="Street address or parcel description"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!pin || submitting}
          className="mt-auto rounded-md bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? "Submitting…" : pin ? "Get My Free Quote" : "Drop a pin on the map to continue"}
        </button>
      </div>
    </form>
  );
}
