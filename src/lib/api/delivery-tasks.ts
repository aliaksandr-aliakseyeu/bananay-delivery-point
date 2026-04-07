import { apiClient } from './client';

export interface CourierDeliveryTask {
  item_point_id: number;
  task_id?: number;
  order_id: number;
  order_number: string | null;
  order_status: string;
  point_status: string;
  delivery_point_id: number;
  delivery_point_name: string | null;
  delivery_point_address: string | null;
  sku_name: string | null;
  quantity: number;
  courier_id: string | null;
  courier_phone: string | null;
  courier_name: string | null;
  expected_pickup_date: string | null;
  delivery_deadline: string | null;
  delivered_at: string | null;
  updated_at: string;
  // Compatibility fields for reused components
  from_address: string | null;
  from_lat: number;
  from_lon: number;
  to_address: string | null;
  to_lat: number;
  to_lon: number;
  status: string;
  qr_token?: string | null;
}

export interface CompletedTask extends CourierDeliveryTask {}

export const deliveryTasksApi = {
  getTasks: async () => {
    const items = await apiClient.get<CourierDeliveryTask[]>('/api/v1/point/deliveries');
    return items.map((x) => ({
      ...x,
      task_id: x.item_point_id,
      from_address: null,
      from_lat: 0,
      from_lon: 0,
      to_address: x.delivery_point_address,
      to_lat: 0,
      to_lon: 0,
      status: x.point_status,
    }));
  },

  getCompletedTasks: async () => {
    const res = await apiClient.get<{ total: number; items: CompletedTask[] }>(
      '/api/v1/point/deliveries/history?limit=200&offset=0'
    );
    return res.items;
  },
  getMyTasks: async () => [],
  getLocationConfig: async () => ({ send_interval_sec: 30, poll_interval_sec: 30, stale_after_sec: 120 }),
  reportLocation: async (_taskId: number, _body: unknown) => ({ task_id: 0, lat: 0, lon: 0 }),
  takeTask: async (_taskId: number) => ({ task_id: 0, status: 'unsupported' }),
  cancelTask: async (_taskId: number) => ({ task_id: 0, status: 'unsupported' }),
  confirmDelivery: async (_taskId: number, _qrToken: string) => ({ task_id: 0, status: 'unsupported' }),
};
