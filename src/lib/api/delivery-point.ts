import { apiClient } from './client';

export interface DeliveryPointLinkedPoint {
  id: number;
  name: string;
  address: string | null;
}

export interface DeliveryPointMeResponse {
  id: string;
  phone_e164: string;
  email: string | null;
  tracking_list_name: string | null;
  tracking_list_description: string | null;
  status: 'draft' | 'pending_review' | 'active' | 'rejected' | 'blocked';
  first_name: string | null;
  last_name: string | null;
  about_text: string | null;
  application_submitted_at: string | null;
  application_reject_reason: string | null;
  points: DeliveryPointLinkedPoint[];
  requested_points: DeliveryPointLinkedPoint[];
}

export interface DeliveryPointSearchItem {
  id: number;
  name: string;
  address: string | null;
}

export interface DeliveryPointInRadiusItem {
  delivery_point: {
    id: number;
    name: string;
    title: string | null;
    address: string | null;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  distance_meters: number;
}

export interface DeliveryPointsSearchResponse {
  items: DeliveryPointSearchItem[];
}

/** Full delivery point row from `POST /delivery-points/search` without `search` (all region points). */
export interface RegionDeliveryPoint {
  id: number;
  name: string;
  type: string | null;
  title: string | null;
  address: string | null;
  address_comment: string | null;
  landmark: string | null;
  location: {
    type: string;
    coordinates: [number, number];
  };
  phone: string | null;
  mobile: string | null;
  email: string | null;
  schedule: string | null;
  is_active: boolean;
}

export interface DeliveryPointsRegionSearchResponse {
  total: number;
  items: RegionDeliveryPoint[];
}

export const deliveryPointApi = {
  getMe: () => apiClient.get<DeliveryPointMeResponse>('/api/v1/point/me'),
  updateMe: (data: { first_name?: string | null; last_name?: string | null; email?: string | null }) =>
    apiClient.patch<DeliveryPointMeResponse>('/api/v1/point/me', data),
  submitApplication: (data: { about_text: string; delivery_point_ids: number[] }) =>
    apiClient.post<DeliveryPointMeResponse>('/api/v1/point/application/submit', data),
  upsertTrackingList: (data: { name: string; description?: string | null; delivery_point_ids: number[] }) =>
    apiClient.post<DeliveryPointMeResponse>('/api/v1/point/tracking-list', data),
  findPointsInRadius: (data: { lat: number; lon: number; radius?: number }) => {
    const params = new URLSearchParams({
      lat: String(data.lat),
      lon: String(data.lon),
    });
    if (data.radius) {
      params.set('radius', String(data.radius));
    }
    return apiClient.get<DeliveryPointInRadiusItem[]>(`/api/v1/point/tracking-list/search/in-radius?${params.toString()}`);
  },
  searchDeliveryPoints: (data: { region_id: number; search: string; only_in_sectors?: boolean; limit?: number }) =>
    apiClient.post<DeliveryPointsSearchResponse>('/api/v1/delivery-points/search', data),

  /** All points in region (no name search) — for map. */
  searchRegionPoints: (regionId: number) =>
    apiClient.post<DeliveryPointsRegionSearchResponse>('/api/v1/delivery-points/search', {
      region_id: regionId,
      only_in_sectors: false,
    }),
};
