import { API_BASE_URL } from '../constants';

export interface CourierVerifyResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user: boolean;
}

export const courierAuthApi = {
  requestOtp: async (phone_e164: string): Promise<{ message?: string }> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/courier/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_e164 }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to send code');
    }
    return res.json().catch(() => ({}));
  },

  verifyOtp: async (
    phone_e164: string,
    code: string
  ): Promise<CourierVerifyResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/courier/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_e164, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Invalid or expired code');
    }
    return res.json();
  },

  refreshToken: async (refresh_token: string): Promise<CourierVerifyResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/courier/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to refresh token');
    }
    return res.json();
  },
};
