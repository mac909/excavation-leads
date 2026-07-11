"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./AdminMap";

const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export default function AdminMapPanel({ pins }: { pins: MapPin[] }) {
  return <AdminMap pins={pins} />;
}
