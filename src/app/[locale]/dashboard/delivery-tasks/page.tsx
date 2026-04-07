'use client';

import { useEffect, useState } from 'react';
import { RequirePointAuth } from '@/components/auth/require-point-auth';
import { BackButton } from '@/components/ui/back-button';
import { PageLoading } from '@/components/ui/page-loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deliveryTasksApi, type CourierDeliveryTask } from '@/lib/api/delivery-tasks';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { deliveryPointApi } from '@/lib/api/delivery-point';
import { History, Package } from 'lucide-react';

export default function DeliveryTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<CourierDeliveryTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const me = await deliveryPointApi.getMe();
      if (me.status !== 'active' || me.points.length === 0) {
        router.replace('/dashboard');
        return;
      }
      const incoming = await deliveryTasksApi.getTasks();
      setTasks(incoming);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  if (isLoading) {
    return (
      <RequirePointAuth>
        <PageLoading fullPage />
      </RequirePointAuth>
    );
  }

  return (
    <RequirePointAuth>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard">Back</BackButton>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Incoming Deliveries</h1>
              <p className="text-sm text-gray-600 mt-1">Current delivery flow for your delivery point.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/delivery-tasks/history">
              <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
                <History className="h-4 w-4 mr-2" />
                History
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active deliveries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.item_point_id} className="rounded-lg border p-4">
                <div className="font-semibold">Order {task.order_number || task.order_id}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {task.sku_name || 'SKU'} x {task.quantity}
                </div>
                <div className="text-sm mt-1">{task.delivery_point_address || '-'}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Status: {task.point_status} | Order: {task.order_status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequirePointAuth>
  );
}
