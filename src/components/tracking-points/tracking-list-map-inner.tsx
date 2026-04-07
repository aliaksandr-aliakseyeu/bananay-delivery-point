'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AttributionControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { deliveryPointApi, type RegionDeliveryPoint } from '@/lib/api/delivery-point';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const inListIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #10B981;
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 12px; height: 12px;" viewBox="0 0 24 24" fill="white">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const notInListIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #F59E0B;
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 12px; height: 12px;" viewBox="0 0 24 24" fill="white">
      <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 19H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm2-5H5V5h14v5z"/>
    </svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

function RecenterMap({ center }: { center?: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lon], 15, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, map]);
  return null;
}

function MapInvalidateSize({
  pointsLength,
  centerLat,
  centerLon,
  heightClassName,
}: {
  pointsLength: number;
  centerLat?: number;
  centerLon?: number;
  heightClassName: string;
}) {
  const map = useMap();
  useEffect(() => {
    const run = () => {
      map.invalidateSize({ animate: false });
    };
    const id = requestAnimationFrame(run);
    const t = window.setTimeout(run, 100);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [map, pointsLength, centerLat, centerLon, heightClassName]);

  useEffect(() => {
    const onResize = () => map.invalidateSize({ animate: false });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);

  return null;
}

function MapContent({
  allPoints,
  selectedIds,
  onAddPoint,
  onRemovePoint,
  showInList,
  showAvailable,
}: {
  allPoints: RegionDeliveryPoint[];
  selectedIds: number[];
  onAddPoint: (point: RegionDeliveryPoint) => void | Promise<void>;
  onRemovePoint: (pointId: number) => void | Promise<void>;
  showInList: boolean;
  showAvailable: boolean;
}) {
  const t = useTranslations('TrackingOnboarding');
  const map = useMap();
  const [processingPoints, setProcessingPoints] = useState<Set<number>>(new Set());
  const pointIdsInList = useMemo(() => new Set(selectedIds), [selectedIds]);

  const getClusterColor = () => {
    if (showInList && !showAvailable) {
      return '#10B981';
    }
    if (!showInList && showAvailable) {
      return '#F59E0B';
    }
    return '#F59E0B';
  };

  const createClusterIcon = (cluster: { getChildCount: () => number }) => {
    const count = cluster.getChildCount();
    let diameter = 30;
    if (count >= 100) diameter = 50;
    else if (count >= 10) diameter = 40;

    return L.divIcon({
      html: `<div style="
        background-color: ${getClusterColor()};
        width: ${diameter}px;
        height: ${diameter}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${diameter > 40 ? '14px' : diameter > 30 ? '12px' : '11px'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(diameter, diameter),
    });
  };

  const handleAddPointAndClosePopup = async (point: RegionDeliveryPoint) => {
    if (processingPoints.has(point.id)) return;
    setProcessingPoints((prev) => new Set(prev).add(point.id));
    try {
      await Promise.resolve(onAddPoint(point));
      map.closePopup();
    } finally {
      setProcessingPoints((prev) => {
        const next = new Set(prev);
        next.delete(point.id);
        return next;
      });
    }
  };

  const handleRemovePoint = async (pointId: number) => {
    if (processingPoints.has(pointId)) return;
    setProcessingPoints((prev) => new Set(prev).add(pointId));
    try {
      await Promise.resolve(onRemovePoint(pointId));
    } finally {
      setProcessingPoints((prev) => {
        const next = new Set(prev);
        next.delete(pointId);
        return next;
      });
    }
  };

  return (
    <MarkerClusterGroup
      key={`${showInList}-${showAvailable}`}
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      zoomToBoundsOnClick
      disableClusteringAtZoom={16}
    >
      {allPoints
        .filter((point) => {
          const isInList = pointIdsInList.has(point.id);
          if (isInList && !showInList) return false;
          if (!isInList && !showAvailable) return false;
          return true;
        })
        .map((point) => {
          const [lon, lat] = point.location.coordinates;
          const isInList = pointIdsInList.has(point.id);
          const isProcessing = processingPoints.has(point.id);

          return (
            <Marker key={point.id} position={[lat, lon]} icon={isInList ? inListIcon : notInListIcon}>
              <Popup>
                <div className="min-w-[250px] max-w-[300px]">
                  <h3 className="font-semibold text-sm mb-1">{point.name}</h3>
                  {point.title && <p className="text-xs text-gray-600 mb-2">{point.title}</p>}
                  {point.address && (
                    <p className="text-xs text-gray-700 mb-1">📍 {point.address}</p>
                  )}
                  {point.phone && (
                    <p className="text-xs text-gray-700 mb-1">📞 {point.phone}</p>
                  )}
                  {point.schedule && (
                    <p className="text-xs text-gray-700">🕐 {point.schedule}</p>
                  )}
                  <Button
                    size="sm"
                    type="button"
                    onClick={() =>
                      isInList ? handleRemovePoint(point.id) : handleAddPointAndClosePopup(point)
                    }
                    disabled={isProcessing}
                    className={`w-full mt-2 ${isInList ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                  >
                    {isProcessing
                      ? t('popupProcessing')
                      : isInList
                        ? t('popupRemoveFromList')
                        : t('popupAddToList')}
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MarkerClusterGroup>
  );
}

const DEFAULT_HEIGHT = 'h-[36rem]';

export function TrackingListMapInner({
  regionId,
  selectedIds,
  onAddPoint,
  onRemovePoint,
  searchCenter,
  heightClassName = DEFAULT_HEIGHT,
}: {
  regionId: number;
  selectedIds: number[];
  onAddPoint: (point: RegionDeliveryPoint) => void | Promise<void>;
  onRemovePoint: (pointId: number) => void | Promise<void>;
  searchCenter?: { lat: number; lon: number } | null;
  heightClassName?: string;
}) {
  const t = useTranslations('TrackingOnboarding');
  const [allPoints, setAllPoints] = useState<RegionDeliveryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInList, setShowInList] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPoints = async () => {
      setIsLoading(true);
      try {
        const res = await deliveryPointApi.searchRegionPoints(regionId);
        if (cancelled) return;
        const active = res.items.filter((p) => p.is_active && p.location?.coordinates);
        setAllPoints(active);
      } catch {
        if (!cancelled) setAllPoints([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchPoints();
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg border ${heightClassName}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border min-h-0 ${heightClassName}`}>
      <MapContainer
        center={[43.585472, 39.723098]}
        zoom={12}
        className="size-full z-0"
        style={{ height: '100%', width: '100%', minHeight: '100%' }}
        scrollWheelZoom
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <AttributionControl position="bottomright" prefix="" />
        <MapInvalidateSize
          pointsLength={allPoints.length}
          centerLat={searchCenter?.lat}
          centerLon={searchCenter?.lon}
          heightClassName={heightClassName}
        />
        <RecenterMap center={searchCenter} />
        <MapContent
          allPoints={allPoints}
          selectedIds={selectedIds}
          onAddPoint={onAddPoint}
          onRemovePoint={onRemovePoint}
          showInList={showInList}
          showAvailable={showAvailable}
        />
      </MapContainer>

      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-xs font-semibold text-gray-900 mb-2">{t('legendTitle')}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">
              {t('legendInList', { count: selectedIds.length })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">{t('legendAvailable')}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] min-w-[220px]">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-900">{t('filtersTitle')}</span>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('filtersLayers')}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">{t('filterInList')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInList(!showInList)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                showInList ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showInList ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-700">{t('filterAvailable')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAvailable(!showAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                showAvailable ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
