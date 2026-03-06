'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CourierDeliveryTask } from '@/lib/api/delivery-tasks';

const MapWithNoSSR = dynamic(
  () => import('./task-route-map-inner').then((m) => m.TaskRouteMapInner),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />,
  }
);

interface MapPoint {
  lat: number;
  lon: number;
  label: string;
  type: 'pickup' | 'delivery';
}

function buildGoogleMapsUrl(points: MapPoint[]): string {
  if (points.length === 0) return 'https://www.google.com/maps';
  if (points.length === 1) return `https://www.google.com/maps/dir/?api=1&destination=${points[0].lat},${points[0].lon}`;
  const dest = points[points.length - 1];
  const origin = points[0];
  const waypoints = points.slice(1, -1);
  const params = new URLSearchParams({ api: '1', origin: `${origin.lat},${origin.lon}`, destination: `${dest.lat},${dest.lon}` });
  if (waypoints.length > 0) params.set('waypoints', waypoints.map((p) => `${p.lat},${p.lon}`).join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildYandexMapsUrl(points: MapPoint[]): string {
  if (points.length === 0) return 'https://yandex.ru/maps';
  const rtext = points.length === 1 ? `~${points[0].lat},${points[0].lon}` : points.map((p) => `${p.lat},${p.lon}`).join('~');
  return `https://yandex.ru/maps/?rtext=${encodeURIComponent(rtext)}&rtt=auto`;
}

interface TaskRouteMapProps {
  task: CourierDeliveryTask;
  pickupLabel?: string;
  deliveryLabel?: string;
  openInGoogleLabel: string;
  openInYandexLabel: string;
  courierPosition?: { lat: number; lon: number };
  courierLabel?: string;
}

export function TaskRouteMap({
  task,
  pickupLabel = 'Получить',
  deliveryLabel = 'Доставить',
  openInGoogleLabel,
  openInYandexLabel,
  courierPosition,
  courierLabel,
}: TaskRouteMapProps) {
  const { allPoints, navPoints } = useMemo(() => {
    const points: MapPoint[] = [
      { lat: task.from_lat, lon: task.from_lon, label: pickupLabel, type: 'pickup' },
      { lat: task.to_lat, lon: task.to_lon, label: deliveryLabel, type: 'delivery' },
    ];
    const inTransit = task.status?.toLowerCase() === 'in_transit';
    const nav = inTransit ? [points[1]] : points;
    return { allPoints: points, navPoints: nav };
  }, [task, pickupLabel, deliveryLabel]);

  const navWithCourier = courierPosition
    ? [{ lat: courierPosition.lat, lon: courierPosition.lon, label: courierLabel ?? 'Я', type: 'pickup' as const }, ...navPoints]
    : navPoints;

  const googleUrl = buildGoogleMapsUrl(navWithCourier);
  const yandexUrl = buildYandexMapsUrl(navWithCourier);

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border border-gray-200 h-64 bg-gray-100">
        <MapWithNoSSR points={allPoints} courierPosition={courierPosition} courierLabel={courierLabel} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {openInGoogleLabel}
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={yandexUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {openInYandexLabel}
          </a>
        </Button>
      </div>
    </div>
  );
}
