'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { BackButton } from '@/components/ui/back-button';
import { PageLoading } from '@/components/ui/page-loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deliveryTasksApi, type CompletedTask } from '@/lib/api/delivery-tasks';
import { Package, MapPin, CheckCircle, Calendar, Box } from 'lucide-react';

export default function DeliveryTasksHistoryPage() {
  const t = useTranslations('DeliveryTasks');
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    deliveryTasksApi
      .getCompletedTasks()
      .then(setTasks)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : t('errorLoading')))
      .finally(() => setIsLoading(false));
  }, [t]);

  if (isLoading) {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  return (
    <RequireCourierAuth>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton href="/dashboard/delivery-tasks">{t('back')}</BackButton>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('historyTitle')}</h1>
            <p className="text-sm text-gray-600 mt-1">{t('historySubtitle')}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>{t('errorLoading')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <Package className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t('noHistory')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('noHistoryHint')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const address = task.delivery_point_address || task.delivery_point_name || t('unknownAddress');
              const skuLine = task.sku_name ? `${task.sku_name} × ${task.quantity}` : `${t('quantityShort')}: ${task.quantity}`;
              return (
                <div
                  key={task.task_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">#{task.order_number}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Box className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{skuLine}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t('delivered')}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm text-gray-700 mb-3">
                      <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        {task.delivery_point_name && (
                          <p className="font-medium text-gray-900">{task.delivery_point_name}</p>
                        )}
                        <p className={task.delivery_point_name ? 'text-gray-600' : ''}>
                          {address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(task.delivered_at).toLocaleString(undefined, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RequireCourierAuth>
  );
}
