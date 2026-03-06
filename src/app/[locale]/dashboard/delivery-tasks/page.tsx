'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import QRCode from 'react-qr-code';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { BackButton } from '@/components/ui/back-button';
import { PageLoading } from '@/components/ui/page-loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deliveryTasksApi, getTaskEventsUrl, type CourierDeliveryTask } from '@/lib/api/delivery-tasks';
import { dailyCheckInApi } from '@/lib/api/daily-checkin';
import { Package, MapPin, RefreshCw, Check, X, QrCode, History, Warehouse } from 'lucide-react';
import { TaskRouteMap } from '@/components/delivery-tasks/task-route-map';
import { QrScanDialog } from '@/components/delivery-tasks/qr-scan-dialog';
import { useCourierLocationReporting, useCurrentPosition } from '@/hooks/use-courier-location';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/routing';
import { APIError } from '@/lib/api/client';

type AccessCheck = 'loading' | 'allowed' | 'denied';

export default function DeliveryTasksPage() {
  const t = useTranslations('DeliveryTasks');
  const tDashboard = useTranslations('Dashboard');
  const router = useRouter();
  const [accessCheck, setAccessCheck] = useState<AccessCheck>('loading');
  const [tasks, setTasks] = useState<CourierDeliveryTask[]>([]);
  const [myTasks, setMyTasks] = useState<CourierDeliveryTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [takingId, setTakingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelConfirmTaskId, setCancelConfirmTaskId] = useState<number | null>(null);
  const [confirmDeliveryId, setConfirmDeliveryId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const myTasksSectionRef = useRef<HTMLDivElement | null>(null);

  const activeTaskIds = myTasks.filter(t => t.status === 'in_transit').map(t => t.task_id);
  const { position: courierPosition } = useCourierLocationReporting(activeTaskIds);
  const { position: currentPosition } = useCurrentPosition();

  // SSE: auto-refresh tasks when DC hands over an item (task_updated event)
  useEffect(() => {
    if (accessCheck !== 'allowed') return;
    const token = (() => {
      try {
        const raw = localStorage.getItem('courier-auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { state?: { token?: string } };
        return parsed?.state?.token ?? null;
      } catch { return null; }
    })();
    if (!token) return;

    const url = getTaskEventsUrl(token);
    const es = new EventSource(url);
    es.addEventListener('task_updated', () => { loadTasks(); });
    es.addEventListener('heartbeat', () => {});
    es.onerror = () => { es.close(); };
    return () => { es.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCheck]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const checkin = await dailyCheckInApi.getTodayStatus();
        if (cancelled) return;
        if (checkin.checkin?.status !== 'approved') {
          setAccessCheck('denied');
          return;
        }
        setAccessCheck('allowed');
        await loadTasks();
      } catch {
        if (!cancelled) setAccessCheck('denied');
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [available, my] = await Promise.all([
        deliveryTasksApi.getTasks(),
        deliveryTasksApi.getMyTasks(),
      ]);
      setTasks(available.filter(t => t.status === 'available'));
      setMyTasks(my);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeTask = async (taskId: number) => {
    setTakingId(taskId);
    try {
      await deliveryTasksApi.takeTask(taskId);
      toast.success(t('taskTaken'));
      await loadTasks();
      setTimeout(() => myTasksSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (err: unknown) {
      const msg = err instanceof APIError ? err.message : t('errorTaking');
      toast.error(msg);
    } finally {
      setTakingId(null);
    }
  };

  const handleCancelTask = async (taskId: number) => {
    setCancellingId(taskId);
    try {
      await deliveryTasksApi.cancelTask(taskId);
      toast.success(t('taskCancelled'));
      await loadTasks();
      setCancelConfirmTaskId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('errorCancelling'));
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmDelivery = async (qrToken: string) => {
    if (!confirmDeliveryId) return;
    try {
      await deliveryTasksApi.confirmDelivery(confirmDeliveryId, qrToken);
      toast.success(t('deliveryConfirmed'));
      setConfirmDeliveryId(null);
      await loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof APIError ? err.message : t('errorConfirming');
      toast.error(msg);
      throw err;
    }
  };

  if (accessCheck === 'loading') {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  if (accessCheck === 'denied') {
    return (
      <RequireCourierAuth>
        <div className="max-w-7xl w-full mx-auto px-4 py-8">
          <Alert className="border-amber-300 bg-amber-50">
            <AlertTitle className="text-amber-900">{tDashboard('dailyCheckIn.title')}</AlertTitle>
            <AlertDescription className="text-amber-700">{tDashboard('deliveryTasksRequireCheckIn')}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push('/dashboard')} variant="outline">{t('backToDashboard')}</Button>
          </div>
        </div>
      </RequireCourierAuth>
    );
  }

  if (isLoading) {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  return (
    <RequireCourierAuth>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard">{t('back')}</BackButton>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTasks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('refresh')}
            </Button>
            <Link href="/dashboard/delivery-tasks/history">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                {t('history')}
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>{t('errorLoading')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* My tasks */}
        {myTasks.length > 0 && (
          <div ref={myTasksSectionRef} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('myTasks')} ({myTasks.length})</h2>
            <div className="space-y-4">
              {myTasks.map((task) => (
                <MyTaskCard
                  key={task.task_id}
                  task={task}
                  onCancel={(id) => setCancelConfirmTaskId(id)}
                  onConfirmDelivery={(id) => setConfirmDeliveryId(id)}
                  courierPosition={courierPosition ?? currentPosition ?? undefined}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available tasks — shown only when courier has no active tasks */}
        {myTasks.length === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('availableTasks')} ({tasks.length})</h2>
            {tasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('noAvailableTasks')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <AvailableTaskCard
                    key={task.task_id}
                    task={task}
                    onTake={handleTakeTask}
                    taking={takingId === task.task_id}
                    courierPosition={currentPosition ?? undefined}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={cancelConfirmTaskId != null} onOpenChange={(o) => !o && setCancelConfirmTaskId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('cancelTask')}</DialogTitle>
            <DialogDescription>{t('cancelTaskConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirmTaskId(null)} disabled={!!cancellingId}>{t('no')}</Button>
            <Button variant="destructive" onClick={() => cancelConfirmTaskId && handleCancelTask(cancelConfirmTaskId)} disabled={!!cancellingId}>
              {cancellingId ? t('cancelling') : t('yes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QrScanDialog
        open={confirmDeliveryId != null}
        onOpenChange={(o) => !o && setConfirmDeliveryId(null)}
        onScan={handleConfirmDelivery}
      />
    </RequireCourierAuth>
  );
}

function statusBadge(status: string, t: ReturnType<typeof useTranslations<'DeliveryTasks'>>) {
  const colors: Record<string, string> = {
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-amber-100 text-amber-800',
    delivered: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {t(`status.${status}` as 'status.assigned')}
    </span>
  );
}

function AvailableTaskCard({
  task,
  onTake,
  taking,
  courierPosition,
  t,
}: {
  task: CourierDeliveryTask;
  onTake: (id: number) => void;
  taking: boolean;
  courierPosition?: { lat: number; lon: number };
  t: ReturnType<typeof useTranslations<'DeliveryTasks'>>;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{t('order')} {task.order_number}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{task.sku_name} × {task.quantity}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTake(task.task_id)}
            disabled={taking}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {taking ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />{t('taking')}</>
            ) : (
              <><Check className="h-4 w-4" />{t('takeTask')}</>
            )}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <TaskRouteMap
          task={task}
          pickupLabel={t('pickupPoint')}
          deliveryLabel={t('deliveryPoint')}
          openInGoogleLabel={t('openInGoogle')}
          openInYandexLabel={t('openInYandex')}
          courierPosition={courierPosition}
          courierLabel={t('me')}
        />
      </div>

      {/* Pickup point */}
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 shrink-0">
            <Warehouse className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{t('pickupPoint')}</p>
            <p className="text-sm text-gray-600 mt-0.5">{task.from_address || t('unknownAddress')}</p>
          </div>
        </div>
      </div>

      {/* Delivery point */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 shrink-0">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{t('deliveryPoint')}</p>
            <p className="text-sm text-gray-600 mt-0.5">{task.to_address || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyTaskCard({
  task,
  onCancel,
  onConfirmDelivery,
  courierPosition,
  t,
}: {
  task: CourierDeliveryTask;
  onCancel: (id: number) => void;
  onConfirmDelivery: (id: number) => void;
  courierPosition?: { lat: number; lon: number };
  t: ReturnType<typeof useTranslations<'DeliveryTasks'>>;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const isAssigned = task.status === 'assigned';
  const isInTransit = task.status === 'in_transit';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              {statusBadge(task.status, t)}
              <h2 className="font-semibold text-gray-900">{t('order')} {task.order_number}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{task.sku_name} × {task.quantity}</p>
            </div>
          </div>
          {isAssigned && (
            <button
              type="button"
              onClick={() => onCancel(task.task_id)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
            >
              <X className="h-4 w-4" />
              {t('cancelTask')}
            </button>
          )}
        </div>
      </div>

      {/* Phase 1 (assigned): route to DC */}
      {isAssigned && (
        <>
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <TaskRouteMap
              task={{ ...task, to_lat: task.from_lat, to_lon: task.from_lon, to_address: task.from_address ?? '' }}
              pickupLabel={t('pickupPoint')}
              deliveryLabel={t('pickupPoint')}
              openInGoogleLabel={t('openInGoogle')}
              openInYandexLabel={t('openInYandex')}
              courierPosition={courierPosition}
              courierLabel={t('me')}
            />
          </div>

          {/* DC address */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 shrink-0">
                <Warehouse className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('pickupPoint')}</p>
                <p className="text-sm text-gray-600 mt-0.5">{task.from_address || t('unknownAddress')}</p>
              </div>
            </div>
          </div>

          {/* Pickup action */}
          {task.qr_token && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setQrOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e40af]"
                >
                  <QrCode className="h-4 w-4" />
                  {t('pickupGoods')}
                </button>
              </div>
            </div>
          )}

          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogContent className="max-w-xs text-center">
              <DialogHeader>
                <DialogTitle>{t('showQrToWorker')}</DialogTitle>
                <DialogDescription>{t('qrHint')}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-2">
                <div className="bg-white p-3 rounded-xl border-2 border-amber-200 inline-block shadow-sm">
                  <QRCode value={task.qr_token!} size={200} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Phase 2 (in_transit): route to customer */}
      {isInTransit && (
        <>
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <TaskRouteMap
              task={task}
              pickupLabel={t('pickupPoint')}
              deliveryLabel={t('deliveryPoint')}
              openInGoogleLabel={t('openInGoogle')}
              openInYandexLabel={t('openInYandex')}
              courierPosition={courierPosition}
              courierLabel={t('me')}
            />
          </div>

          {/* Delivery point */}
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('deliveryPoint')}</p>
                <p className="text-sm text-gray-600 mt-0.5">{task.to_address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Confirm delivery action */}
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onConfirmDelivery(task.task_id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e40af]"
              >
                <QrCode className="h-4 w-4" />
                {t('confirmDelivery')}
              </button>
            </div>
          </div>
        </>
      )}

      {task.status === 'delivered' && (
        <div className="p-4 sm:p-5 bg-gray-50/50">
          <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="h-4 w-4" />
            {t('delivered')}
          </span>
        </div>
      )}
    </div>
  );
}
