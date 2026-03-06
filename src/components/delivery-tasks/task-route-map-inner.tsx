'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, AttributionControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #3B82F6;
    width: 28px; height: 28px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
});

const deliveryIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #10B981;
    width: 24px; height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24],
});

const courierIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
    <svg width="12" height="24" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- silhouette: body with wheel arches as subtle corner bumps -->
      <path d="
        M7 2 Q12 0 17 2
        Q20 3 21 5
        Q23 7 23 10 Q23 13 21 14
        L21 34
        Q23 35 23 38 Q23 41 21 43
        Q20 45 17 46 Q12 48 7 46
        Q4 45 3 43 Q1 41 1 38 Q1 35 3 34
        L3 14
        Q1 13 1 10 Q1 7 3 5
        Q4 3 7 2 Z
      " fill="#1e3a8a"/>
      <!-- wheel arch shadows (darker inset at corners) -->
      <path d="M1 9 Q1 6 3.5 5 L3.5 14 Q1 13 1 10 Z" fill="#0f172a" opacity="0.4"/>
      <path d="M23 9 Q23 6 20.5 5 L20.5 14 Q23 13 23 10 Z" fill="#0f172a" opacity="0.4"/>
      <path d="M1 39 Q1 42 3.5 43 L3.5 34 Q1 35 1 38 Z" fill="#0f172a" opacity="0.4"/>
      <path d="M23 39 Q23 42 20.5 43 L20.5 34 Q23 35 23 38 Z" fill="#0f172a" opacity="0.4"/>
      <!-- rear windshield -->
      <path d="M6.5 36 Q12 38.5 17.5 36 L17.5 31 Q12 33 6.5 31 Z" fill="#3b82f6" opacity="0.7"/>
      <!-- roof -->
      <rect x="5.5" y="17" width="13" height="14" rx="2.5" fill="#2d50a0"/>
      <!-- front windshield -->
      <path d="M6.5 16 Q12 13.5 17.5 16 L17.5 21 Q12 19 6.5 21 Z" fill="#60a5fa" opacity="0.9"/>
      <!-- windshield glare -->
      <path d="M7.5 16.5 Q10 15.2 12 15.8 L12 17 Q10 16.3 7.5 17.5 Z" fill="white" opacity="0.45"/>
      <!-- headlights -->
      <path d="M7 3.5 Q12 2 17 3.5 L17 5.5 Q12 4.2 7 5.5 Z" fill="#fef08a" opacity="0.95"/>
      <!-- taillights -->
      <path d="M7 44.5 Q12 46 17 44.5 L17 42.5 Q12 43.8 7 42.5 Z" fill="#fca5a5" opacity="0.95"/>
    </svg>
  </div>`,
  iconSize: [12, 24], iconAnchor: [6, 12], popupAnchor: [0, -12],
});

interface MapPoint {
  lat: number;
  lon: number;
  label: string;
  type: 'pickup' | 'delivery';
}

function MapBounds({ points, courierPosition }: { points: MapPoint[]; courierPosition?: { lat: number; lon: number } }) {
  const map = useMap();
  useEffect(() => {
    const coords = points.map((p) => [p.lat, p.lon] as [number, number]);
    if (courierPosition) coords.push([courierPosition.lat, courierPosition.lon]);
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [30, 30], maxZoom: 14 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, points]);
  return null;
}

interface TaskRouteMapInnerProps {
  points: MapPoint[];
  courierPosition?: { lat: number; lon: number };
  courierLabel?: string;
}

export function TaskRouteMapInner({ points, courierPosition, courierLabel = 'Я' }: TaskRouteMapInnerProps) {
  if (points.length === 0) return null;

  return (
    <MapContainer center={[points[0].lat, points[0].lon]} zoom={11} className="h-full w-full" attributionControl={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AttributionControl position="bottomright" prefix="" />
      <MapBounds points={points} courierPosition={courierPosition} />

      {courierPosition && (
        <Marker position={[courierPosition.lat, courierPosition.lon]} icon={courierIcon}>
          <Popup>{courierLabel}</Popup>
        </Marker>
      )}

      {points.map((p, i) => (
        <Marker key={`${p.type}-${i}`} position={[p.lat, p.lon]} icon={p.type === 'pickup' ? pickupIcon : deliveryIcon}>
          <Tooltip permanent direction="top" offset={[0, -22]} opacity={1}>
            <span className="font-medium text-sm whitespace-nowrap">{p.label}</span>
          </Tooltip>
          <Popup>{p.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

