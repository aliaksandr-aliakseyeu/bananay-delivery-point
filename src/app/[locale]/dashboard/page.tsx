'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { RequirePointAuth } from '@/components/auth/require-point-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/page-loading';
import { deliveryTasksApi } from '@/lib/api/delivery-tasks';
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
import { Clock3, History, MapPin, Package, TrendingUp, UserCircle2, XCircle } from 'lucide-react';

type PointMeta = { name: string; address: string | null };

export default function DashboardPage() {
  const t = useTranslations('DeliveryPointDashboard');
  const tOnboarding = useTranslations('TrackingOnboarding');
  const [me, setMe] = useState<DeliveryPointMeResponse | null>(null);
  const [incomingCount, setIncomingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [trackingListName, setTrackingListName] = useState('');
  const [trackingListDescription, setTrackingListDescription] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [selectedPointIds, setSelectedPointIds] = useState<number[]>([]);
  const [selectedPointsMeta, setSelectedPointsMeta] = useState<Record<number, PointMeta>>({});
  const [mapSearchCenter, setMapSearchCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await deliveryPointApi.getMe();
      setMe(profile);
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setTrackingListName(profile.tracking_list_name || '');
      setTrackingListDescription(profile.tracking_list_description || '');
      setAboutText(profile.about_text || '');
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
      if (profile.status === 'active') {
        const tasks = await deliveryTasksApi.getTasks();
        setIncomingCount(tasks.length);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (me?.status === 'active') return t('statusActive');
    if (me?.status === 'pending_review') return t('statusPending');
    if (me?.status === 'rejected') return t('statusRejected');
    if (me?.status === 'blocked') return t('statusBlocked');
    return t('statusDraft');
  }, [me?.status, t]);

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

  const submitApplication = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!me) return;
    setIsSaving(true);
    setError(null);
    try {
      await deliveryPointApi.updateMe({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        email: email.trim() || null,
      });
      await deliveryPointApi.upsertTrackingList({
        name: trackingListName.trim(),
        description: trackingListDescription.trim() || null,
        delivery_point_ids: selectedPointIds,
      });
      await deliveryPointApi.submitApplication({
        about_text: aboutText.trim(),
        delivery_point_ids: selectedPointIds,
      });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('submitError'));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full bg-gray-50">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {me?.status === 'active' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Link href="/dashboard/delivery-tasks">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="mb-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('incomingTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('incomingDescription', { count: incomingCount })}</p>
                </div>
              </Link>
              <Link href="/dashboard/delivery-tasks/history">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <History className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('historyTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('historyDescription')}</p>
                </div>
              </Link>
              <Link href="/dashboard/points-management">
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('managePointsTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('managePointsDescription')}</p>
                </div>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('statistics')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <UserCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">{t('status')}</p>
                      <p className="text-lg font-bold text-blue-900">{statusLabel}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-teal-700">{t('linkedPoints')}</p>
                      <p className="text-2xl font-bold text-teal-900">{me?.points.length ?? 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-700">{t('activeDeliveries')}</p>
                      <p className="text-2xl font-bold text-amber-900">{incomingCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {me?.status === 'pending_review' && (
          <Alert className="border-amber-300 bg-amber-50">
            <Clock3 className="h-4 w-4" />
            <AlertTitle>{t('pendingTitle')}</AlertTitle>
            <AlertDescription>{t('pendingDescription')}</AlertDescription>
          </Alert>
        )}

        {(me?.status === 'draft' || me?.status === 'rejected') && (
          <Card>
            <CardHeader>
              <CardTitle>{t('formTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {me.status === 'rejected' && (
                <Alert variant="destructive" className="mb-4">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t('rejectedTitle')}</AlertTitle>
                  <AlertDescription>{me.application_reject_reason || t('rejectedDescription')}</AlertDescription>
                </Alert>
              )}
              <form className="space-y-6" onSubmit={submitApplication}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input value={me.phone_e164} readOnly disabled placeholder={t('phonePlaceholder')} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('firstNamePlaceholder')}
                  />
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  placeholder={t('aboutPlaceholder')}
                  className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

                <Button
                  type="submit"
                  disabled={isSaving || !trackingListName.trim() || !aboutText.trim() || selectedPointIds.length === 0}
                >
                  {isSaving ? t('submitting') : t('submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {me?.status === 'blocked' && (
          <Alert variant="destructive">
            <AlertTitle>{t('blockedTitle')}</AlertTitle>
            <AlertDescription>{t('blockedDescription')}</AlertDescription>
          </Alert>
        )}
      </div>
    </RequirePointAuth>
  );
}
