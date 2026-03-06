import { API_BASE_URL } from '../constants';
import { apiClient } from './client';

const STORAGE_KEY = 'courier-auth-storage';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.token ?? null;
  } catch {
    return null;
  }
}

export interface CourierProfileResponse {
  id: string;
  phone_e164: string;
  status: string;
  full_name: string | null;
  city: string | null;
  street: string | null;
  building: string | null;
  apartment: string | null;
  region_id: number | null;
  payout_account: string | null;
  created_at: string;
  updated_at: string;
  can_submit: boolean;
  required_fields: Record<string, boolean>;
  required_document_kinds: string[];
}

export interface CourierProfileUpdate {
  full_name?: string | null;
  city?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
  region_id?: number | null;
  payout_account?: string | null;
}

export interface CourierVehicleResponse {
  id: string;
  courier_id: string;
  plate_number: string;
  model: string | null;
  vehicle_type: string | null;
  max_weight_kg: number;
  photo_media_id: string | null;
  sts_media_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourierVehicleCreate {
  plate_number: string;
  model?: string | null;
  vehicle_type?: string | null;
  max_weight_kg: number;
}

export interface CourierVehicleUpdate {
  plate_number?: string | null;
  model?: string | null;
  vehicle_type?: string | null;
  max_weight_kg?: number | null;
  is_active?: boolean | null;
}

export interface CourierMediaFileResponse {
  id: string;
  owner_type: string;
  owner_id: string;
  kind: string;
  blob_path: string;
  content_type: string;
  size_bytes: number | null;
  created_at: string;
}

export interface CourierApplicationResponse {
  id: string;
  courier_id: string;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
}

const BASE = '/api/v1/courier';

export const courierApi = {
  getMe: () => apiClient.get<CourierProfileResponse>(`${BASE}/me`),
  updateMe: (data: CourierProfileUpdate) =>
    apiClient.patch<CourierProfileResponse>(`${BASE}/me`, data),

  getVehicles: () => apiClient.get<CourierVehicleResponse[]>(`${BASE}/vehicles`),
  createVehicle: (data: CourierVehicleCreate) =>
    apiClient.post<CourierVehicleResponse>(`${BASE}/vehicles`, data),
  getVehicle: (id: string) =>
    apiClient.get<CourierVehicleResponse>(`${BASE}/vehicles/${id}`),
  updateVehicle: (id: string, data: CourierVehicleUpdate) =>
    apiClient.patch<CourierVehicleResponse>(`${BASE}/vehicles/${id}`, data),
  deleteVehicle: (id: string) =>
    apiClient.delete<void>(`${BASE}/vehicles/${id}`),

  uploadVehiclePhoto: async (vehicleId: string, file: File): Promise<CourierVehicleResponse> => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${BASE}/vehicles/${vehicleId}/photo`;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || String(res.status));
    }
    return res.json();
  },

  uploadVehicleSts: async (vehicleId: string, file: File): Promise<CourierVehicleResponse> => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${BASE}/vehicles/${vehicleId}/sts`;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || String(res.status));
    }
    return res.json();
  },

  getMediaUrl: (mediaId: string) => `${API_BASE_URL}${BASE}/media/${mediaId}`,

  getDocuments: () =>
    apiClient.get<CourierMediaFileResponse[]>(`${BASE}/documents`),

  uploadDocument: async (kind: string, file: File): Promise<CourierMediaFileResponse> => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${BASE}/documents?kind=${encodeURIComponent(kind)}`;
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || String(res.status));
    }
    return res.json();
  },

  getApplication: () =>
    apiClient.get<CourierApplicationResponse | null>(`${BASE}/application`),
  submitApplication: () =>
    apiClient.post<CourierApplicationResponse>(`${BASE}/application/submit`),
};
