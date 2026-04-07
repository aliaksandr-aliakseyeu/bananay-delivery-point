'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequirePointAuth } from '@/components/auth/require-point-auth';
import { BackButton } from '@/components/ui/back-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/page-loading';
import {
  deliveryPointApi,
  type DeliveryPointInRadiusItem,
  type DeliveryPointMeResponse,
  type RegionDeliveryPoint,
} from '@/lib/api/delivery-point';
import { DEFAULT_REGION_ID } from '@/lib/constants';
import { TrackingListMap } from '@/components/tracking-points/tracking-list-map';
import { TrackingAddressSearchSection } from '@/components/tracking-points/tracking-address-search-section';
import { TrackingSelectedPointsSidebar } from '@/components/tracking-points/tracking-selected-points-sidebar';
import { toast } from 'sonner';

type PointMeta = { name: string; address: string | null };

export default function PointsManagementPage() {
  const t = useTranslations('DeliveryPointDashboard');
  const tOnboarding = useTranslations('TrackingOnboarding');
  const [me, setMe] = useState<DeliveryPointMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trackingListName, setTrackingListName] = useState('');
  const [trackingListDescription, setTrackingListDescription] = useState('');
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);
  const [selectedPointsMeta, setSelectedPointsMeta] = useState<Record<number, PointMeta>>({});
  const [mapSearchCenter, setMapSearchCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await deliveryPointApi.getMe();
      setMe(profile);
      setTrackingListName(profile.tracking_list_name || '');
      setTrackingListDescription(profile.tracking_list_description || '');
      const sourcePoints =
        profile.status === 'active' && profile.requested_points.length === 0
          ? profile.points
          : profile.requested_points;
      const ids = sourcePoints.map((item) => item.id);
      setSelectedPointIds(ids);
      const meta: Record<number, PointMeta> = {};
      for (const p of sourcePoints) {
        meta[p.id] = { name: p.name, address: p.address };
      }
      setSelectedPointsMeta(meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const addPointWithMeta = useCallback((id: number, name: string, address: string | null) => {
    setSelectedPointIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelectedPointsMeta((prev) => ({
      ...prev,
      [id]: { name, address },
    }));
  }, []);

  const handleAddFromMap = useCallback((point: RegionDeliveryPoint) => {
    addPointWithMeta(point.id, point.name, point.address);
  }, [addPointWithMeta]);

  const handleAddFromRadius = useCallback((dp: DeliveryPointInRadiusItem['delivery_point']) => {
    addPointWithMeta(dp.id, dp.name, dp.address);
  }, [addPointWithMeta]);

  const removePoint = useCallback((id: number) => {
    setSelectedPointIds((prev) => prev.filter((x) => x !== id));
    setSelectedPointsMeta((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const existingPointIds = useMemo(() => new Set(selectedPointIds), [selectedPointIds]);
  const handleSearchLocation = useCallback((lat: number, lon: number) => {
    setMapSearchCenter({ lat, lon });
  }, []);

  const sidebarRows = useMemo(
    () =>
      selectedPointIds.map((id) => {
        const m = selectedPointsMeta[id];
        return {
          id,
          name: m?.name ?? `${tOnboarding('sidebarFallbackName')} ${id}`,
          address: m?.address ?? null,
        };
      }),
    [selectedPointIds, selectedPointsMeta, tOnboarding]
  );

  const submitListUpdate = async () => {
    if (selectedPointIds.length === 0) {
      setError(t('activeListRequirePoints'));
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await deliveryPointApi.upsertTrackingList({
        name: (trackingListName || t('defaultTrackingListName')).trim(),
        description: trackingListDescription.trim() || null,
        delivery_point_ids: selectedPointIds,
      });
      toast.success(t('activeListSaved'));
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('activeListSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <RequirePointAuth>
        <PageLoading fullPage />
      </RequirePointAuth>
    );
  }

  return (
    <RequirePointAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 mb-6">
          <BackButton href="/dashboard">{t('backToDashboard')}</BackButton>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('activeListTitle')}</h1>
            <p className="text-sm text-gray-600 mt-1">{t('activeListDescription')}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('activeListTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-300 bg-amber-50">
              <AlertTitle>{t('activeListModerationTitle')}</AlertTitle>
              <AlertDescription>{t('activeListModerationDescription')}</AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={trackingListName}
                onChange={(e) => setTrackingListName(e.target.value)}
                placeholder={t('trackingListNamePlaceholder')}
              />
              <Input
                value={trackingListDescription}
                onChange={(e) => setTrackingListDescription(e.target.value)}
                placeholder={t('trackingListDescriptionPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-0">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-border">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{tOnboarding('mapTitle')}</h2>
                  <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{tOnboarding('mapLegend')}</p>
                  <TrackingListMap
                    regionId={DEFAULT_REGION_ID}
                    selectedIds={selectedPointIds}
                    onAddPoint={handleAddFromMap}
                    onRemovePoint={removePoint}
                    searchCenter={mapSearchCenter}
                  />
                </div>
                <TrackingAddressSearchSection
                  existingPointIds={existingPointIds}
                  onPointAdded={handleAddFromRadius}
                  onSearchLocation={handleSearchLocation}
                />
              </div>
              <div className="lg:col-span-1">
                <TrackingSelectedPointsSidebar points={sidebarRows} onRemove={removePoint} />
              </div>
            </div>

            <Button type="button" onClick={submitListUpdate} disabled={isSaving || selectedPointIds.length === 0}>
              {isSaving ? t('submitting') : t('activeListSubmit')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </RequirePointAuth>
  );
}
