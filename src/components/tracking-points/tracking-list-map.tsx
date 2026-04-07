'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import type { RegionDeliveryPoint } from '@/lib/api/delivery-point';

export const TRACKING_LIST_MAP_HEIGHT_CLASS = 'h-[36rem]';

const Inner = dynamic(
  () => import('./tracking-list-map-inner').then((m) => m.TrackingListMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        className={`${TRACKING_LIST_MAP_HEIGHT_CLASS} w-full rounded-lg border bg-muted/30 animate-pulse`}
      />
    ),
  }
);

export interface TrackingListMapProps {
  regionId: number;
  selectedIds: number[];
  onAddPoint: (point: RegionDeliveryPoint) => void | Promise<void>;
  onRemovePoint: (pointId: number) => void | Promise<void>;
  searchCenter?: { lat: number; lon: number } | null;
}

function TrackingListMapComponent(props: TrackingListMapProps) {
  return <Inner {...props} heightClassName={TRACKING_LIST_MAP_HEIGHT_CLASS} />;
}

export const TrackingListMap = memo(TrackingListMapComponent);
