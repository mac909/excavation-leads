"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  projectTypeLabel: string;
  statusLabel: string;
  color: string; // hex color for the pin, derived from status
};

const pinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function AdminMap({ pins }: { pins: MapPin[] }) {
  const bounds =
    pins.length > 1
      ? L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])).pad(0.15)
      : undefined;
  const center: [number, number] =
    pins.length === 1 ? [pins[0].lat, pins[0].lng] : [30.2672, -97.7431];

  return (
    <MapContainer
      bounds={bounds}
      center={bounds ? undefined : center}
      zoom={bounds ? undefined : 12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={pinIcon(pin.color)}>
          <Popup>
            <div className="text-sm">
              <a href={`/admin/leads/${pin.id}`} className="font-semibold underline">
                {pin.name}
              </a>
              <div>{pin.projectTypeLabel}</div>
              <div className="text-gray-500">{pin.statusLabel}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
