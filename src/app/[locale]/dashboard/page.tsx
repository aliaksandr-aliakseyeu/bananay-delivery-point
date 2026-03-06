'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierProfileResponse } from '@/lib/api/courier';
import { dailyCheckInApi, getCheckInStreamUrl, type CheckInStatus } from '@/lib/api/daily-checkin';
import { deliveryTasksApi } from '@/lib/api/delivery-tasks';
import { User, Car, Send, CheckCircle, ClipboardCheck, AlertTriangle, RefreshCw, Package, History } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const HELPER_SESSION_KEY = 'courier-submit-helper-shown';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const tOnboarding = useTranslations('Onboarding');
  const [profile, setProfile] = useState<CourierProfileResponse | null>(null);
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null);
  const [refreshingCheckIn, setRefreshingCheckIn] = useState(false);
  const [myTasksCount, setMyTasksCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const status = checkInStatus?.checkin?.status;
    if (status !== 'pending_review') return;

    const url = getCheckInStreamUrl();
    if (!url) return;

    const es = new EventSource(url);
    es.addEventListener('daily_checkin_status', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data || '{}');
        if (data.status === 'approved' || data.status === 'rejected') {
          dailyCheckInApi.getTodayStatus().then(setCheckInStatus);
          if (data.status === 'approved') toast.success(t('dailyCheckIn.approved'));
          if (data.status === 'rejected') toast.error(t('dailyCheckIn.rejected'));
        }
      } catch { }
    });

    return () => { es.close(); };
  }, [checkInStatus?.checkin?.status, t]);

  const load = async () => {
    try {
      setError(null);
      const [me, vehicles] = await Promise.all([courierApi.getMe(), courierApi.getVehicles()]);
      setProfile(me);
      setVehiclesCount(vehicles.length);

      if (me.status === 'active') {
        try {
          const checkinStatus = await dailyCheckInApi.getTodayStatus();
          setCheckInStatus(checkinStatus);
        } catch { }
        try {
          const myTasks = await deliveryTasksApi.getMyTasks();
          setMyTasksCount(myTasks.length);
        } catch {
          setMyTasksCount(0);
        }
      }

      if (me.status === 'draft' && typeof window !== 'undefined' && !sessionStorage.getItem(HELPER_SESSION_KEY)) {
        sessionStorage.setItem(HELPER_SESSION_KEY, '1');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCheckInStatus = async () => {
    setRefreshingCheckIn(true);
    try {
      const checkinStatus = await dailyCheckInApi.getTodayStatus();
      setCheckInStatus(checkinStatus);
      toast.success(t('dailyCheckIn.refreshed'));
    } catch {
      toast.error(t('errorLoading'));
    } finally {
      setRefreshingCheckIn(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await courierApi.submitApplication();
      setSubmitConfirmOpen(false);
      await load();
      toast.success(tOnboarding('submitSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tOnboarding('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const isPendingReview = profile?.status === 'pending' || profile?.status === 'pending_review';
  const isActive = profile?.status === 'active';
  const dailyCheckInApproved = isActive && checkInStatus?.checkin?.status === 'approved';
  const statusLabel = isActive
    ? t('statusActive')
    : profile?.status === 'approved' ? t('statusApproved')
    : profile?.status === 'rejected' ? t('statusRejected')
    : isPendingReview ? t('statusPending')
    : t('statusDraft');

  if (isLoading) {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  return (
    <RequireCourierAuth>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{isActive ? t('subtitleActive') : t('subtitle')}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>{t('errorLoading')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isActive && checkInStatus && (() => {
            const checkin = checkInStatus.checkin;
            const status = checkin?.status;

            if (!checkin || status === 'pending') {
              return (
                <Link href="/dashboard/daily-checkin">
                  <div className="mb-6 p-4 rounded-lg border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-amber-500">
                        <ClipboardCheck className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900">{t('dailyCheckIn.title')}</h3>
                        <p className="text-sm text-amber-700">{t('dailyCheckIn.required')}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </Link>
              );
            }

            if (status === 'pending_review') {
              return (
                <div className="mb-6 p-4 rounded-lg border-2 border-blue-400 bg-blue-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">{t('dailyCheckIn.pendingReview')}</h3>
                      <p className="text-sm text-blue-700">{t('dailyCheckIn.pendingReviewDescription')}</p>
                    </div>
                    <button type="button" onClick={refreshCheckInStatus} disabled={refreshingCheckIn} aria-label={t('dailyCheckIn.refresh')} className="shrink-0 p-2 rounded-full text-blue-600 hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 transition-colors">
                      <RefreshCw className={`h-5 w-5 ${refreshingCheckIn ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            }

            if (status === 'approved') {
              return (
                <div className="mb-6 p-4 rounded-lg border-2 border-green-400 bg-green-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">{t('dailyCheckIn.approved')}</h3>
                      <p className="text-sm text-green-700">{t('dailyCheckIn.approvedDescription')}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (status === 'rejected') {
              return (
                <Link href="/dashboard/daily-checkin">
                  <div className="mb-6 p-4 rounded-lg border-2 border-red-400 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-red-500">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">{t('dailyCheckIn.rejected')}</h3>
                        <p className="text-sm text-red-700">{checkin.reject_reason || t('dailyCheckIn.rejectedDescription')}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            return null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/dashboard/profile">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profileCard')}</h3>
                <p className="text-sm text-gray-600">{t('profileCardDescription')}</p>
              </div>
            </Link>

            <Link href="/dashboard/vehicles">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Car className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('vehiclesCard')}</h3>
                <p className="text-sm text-gray-600">{t('vehiclesCardDescription')}</p>
              </div>
            </Link>

            {isActive && (
              <>
                {dailyCheckInApproved ? (
                  <Link href="/dashboard/delivery-tasks">
                    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full relative">
                      {myTasksCount > 0 && (
                        <div className="absolute top-4 right-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-green-500 px-2 text-xs font-bold text-white">
                          {myTasksCount}
                        </div>
                      )}
                      <div className="mb-3">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('deliveryTasksCard')}</h3>
                      <p className="text-sm text-gray-600">
                        {myTasksCount > 0 ? t('deliveryTasksCardActive', { count: myTasksCount }) : t('deliveryTasksCardDescription')}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-gray-100 rounded-lg shadow-sm p-6 h-full relative opacity-75 cursor-not-allowed border border-gray-200">
                    <div className="mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-2">{t('deliveryTasksCard')}</h3>
                    <p className="text-sm text-gray-500">{t('deliveryTasksRequireCheckIn')}</p>
                  </div>
                )}
                <Link href="/dashboard/delivery-tasks/history">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="mb-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <History className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistoryCard')}</h3>
                    <p className="text-sm text-gray-600">{t('orderHistoryCardDescription')}</p>
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('statistics')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">{t('vehiclesCount')}</p>
                    <p className="text-2xl font-bold text-purple-900">{vehiclesCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">{t('status')}</p>
                    <p className="text-lg font-bold text-green-900">{statusLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {isActive ? (
              <p className="text-green-600 font-medium flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t('statusActive')}
              </p>
            ) : isPendingReview ? (
              <p className="text-gray-600 font-medium flex items-center gap-2">
                <Send className="h-5 w-5 text-amber-600" />
                {t('statusPending')}
              </p>
            ) : profile?.can_submit ? (
              <Button size="lg" onClick={() => setSubmitConfirmOpen(true)} disabled={submitting}>
                <Send className="h-5 w-5 mr-2" />
                {submitting ? tOnboarding('submitting') : t('submitForReview')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{tOnboarding('submit')}</DialogTitle>
            <DialogDescription>{tOnboarding('submitConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} disabled={submitting}>{tOnboarding('cancel')}</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? tOnboarding('submitting') : tOnboarding('submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RequireCourierAuth>
  );
}
