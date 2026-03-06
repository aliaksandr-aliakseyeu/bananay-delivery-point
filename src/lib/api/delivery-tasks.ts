import { API_BASE_URL } from '../constants';
import { apiClient } from './client';

export interface CourierDeliveryTask {
  task_id: number;
  order_id: number;
  order_number: string;
  /** Pickup point: distribution center */
  from_address: string | null;
  from_lat: number;
  from_lon: number;
  /** Delivery point: final recipient */
  to_address: string;
  to_lat: number;
  to_lon: number;
  /** SKU info */
  sku_name: string;
  sku_code: string;
  quantity: number;
  /** Task status: available, assigned, in_transit, delivered, failed */
  status: string;
  /** Item point QR token — shown to DC worker when picking up (status: assigned) */
  qr_token?: string | null;
  taken_at?: string | null;
  delivered_at?: string | null;
  fail_reason?: string | null;
}

export interface CompletedTask {
  task_id: number;
  order_id: number;
  order_number: string;
  delivered_at: string;
  delivery_point_name: string | null;
  delivery_point_address: string | null;
  sku_name: string | null;
  quantity: number;
}

export interface LocationConfig {
  send_interval_sec: number;
  poll_interval_sec: number;
  stale_after_sec: number;
}

export interface LocationReportBody {
  lat: number;
  lon: number;
  accuracy?: number;
  device_info?: string;
}

const BASE = '/api/v1/courier';

export const deliveryTasksApi = {
  getTasks: () =>
    apiClient.get<CourierDeliveryTask[]>(`${BASE}/delivery-tasks`),

  getMyTasks: () =>
    apiClient.get<CourierDeliveryTask[]>(`${BASE}/delivery-tasks/my`),

  getCompletedTasks: () =>
    apiClient.get<CompletedTask[]>(`${BASE}/delivery-tasks/completed`),

  getLocationConfig: () =>
    apiClient.get<LocationConfig>(`${BASE}/delivery-tasks/location-config`),

  reportLocation: (taskId: number, body: LocationReportBody) =>
    apiClient.post<{ task_id: number; lat: number; lon: number }>(
      `${BASE}/delivery-tasks/${taskId}/location`,
      body
    ),

  takeTask: (taskId: number) =>
    apiClient.post<{ task_id: number; status: string }>(
      `${BASE}/delivery-tasks/${taskId}/take`
    ),

  cancelTask: (taskId: number) =>
    apiClient.post<{ task_id: number; status: string }>(
      `${BASE}/delivery-tasks/${taskId}/cancel`
    ),

  confirmDelivery: (taskId: number, qrToken: string) =>
    apiClient.post<{ task_id: number; status: string }>(
      `${BASE}/delivery-tasks/${taskId}/confirm-delivery`,
      { qr_token: qrToken }
    ),
};

export function getMediaUrl(mediaId: string): string {
  return `${API_BASE_URL}/api/v1/courier/media/${mediaId}`;
}

export function getTaskEventsUrl(token: string): string {
  return `${API_BASE_URL}/api/v1/courier/delivery-tasks/events?token=${encodeURIComponent(token)}`;
}
