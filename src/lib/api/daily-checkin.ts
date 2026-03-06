import { apiClient } from './client';
import { API_BASE_URL } from '../constants';

const STORAGE_KEY = 'courier-auth-storage';

function getToken(): string | null {
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

export interface CheckInPhoto {
  kind: string;
  media_id: string;
  uploaded_at: string;
}

export interface CheckIn {
  id: string;
  vehicle_id: string;
  check_date: string;
  status: 'pending' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  started_at: string;
  completed_at: string | null;
  photos: CheckInPhoto[];
  missing_photos: string[];
  reject_reason?: string | null;
}

export interface CheckInStatus {
  has_checkin: boolean;
  is_complete: boolean;
  checkin: CheckIn | null;
}

export type PhotoKind =
  | 'selfie'
  | 'vehicle_front'
  | 'vehicle_left'
  | 'vehicle_right'
  | 'vehicle_rear'
  | 'vehicle_cargo';

export const PHOTO_KINDS: PhotoKind[] = [
  'selfie',
  'vehicle_front',
  'vehicle_left',
  'vehicle_right',
  'vehicle_rear',
  'vehicle_cargo',
];

const BASE = '/api/v1/courier/daily-checkin';

export function getCheckInStreamUrl(): string | null {
  const t = getToken();
  if (!t) return null;
  return `${API_BASE_URL}${BASE}/stream?token=${encodeURIComponent(t)}`;
}

export const dailyCheckInApi = {
  getTodayStatus: () =>
    apiClient.get<CheckInStatus>(`${BASE}/today`),

  start: (vehicleId: string, latitude?: number, longitude?: number) =>
    apiClient.post<CheckIn>(`${BASE}/start`, {
      vehicle_id: vehicleId,
      latitude,
      longitude,
    }),

  uploadPhoto: async (checkinId: string, kind: PhotoKind, file: File): Promise<CheckIn> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(
      `${API_BASE_URL}/api/v1/courier/daily-checkin/${checkinId}/photo/${kind}`,
      { method: 'POST', headers, body: formData }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  },

  complete: (checkinId: string) =>
    apiClient.post<CheckIn>(`${BASE}/${checkinId}/complete`),

  getHistory: (limit = 30, offset = 0) =>
    apiClient.get<CheckIn[]>(`${BASE}/history?limit=${limit}&offset=${offset}`),

  getPhotoUrl: (mediaId: string) =>
    `${API_BASE_URL}/api/v1/courier/media/${mediaId}`,
};
