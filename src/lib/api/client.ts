import { API_BASE_URL } from '../constants';

const STORAGE_KEY = 'point-auth-storage';
let refreshPromise: Promise<string | null> | null = null;

type StoredAuthPayload = {
  state?: {
    token?: string | null;
    refreshToken?: string | null;
    isAuthenticated?: boolean;
  };
  version?: number;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { state } = JSON.parse(raw) as StoredAuthPayload;
    return state?.token ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { state } = JSON.parse(raw) as StoredAuthPayload;
    return state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function persistTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: StoredAuthPayload = raw ? JSON.parse(raw) : {};
    const next = {
      ...parsed,
      state: {
        ...(parsed.state ?? {}),
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  const locale = window.location.pathname.match(/^\/(en|ru)/)?.[1] || 'ru';
  window.location.href = `/${locale}/login`;
}

async function refreshCourierToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/delivery-point/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as
      | { access_token?: string; refresh_token?: string }
      | null;
    if (!data?.access_token || !data?.refresh_token) return null;
    persistTokens(data.access_token, data.refresh_token);
    return data.access_token;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchCourierApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options?.body instanceof FormData;

  const doRequest = async (tokenOverride?: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...((tokenOverride ?? getToken()) && { Authorization: `Bearer ${tokenOverride ?? getToken()}` }),
        ...(options?.headers as Record<string, string>),
      },
    });

  let res = await doRequest();
  const isCourierRefreshRequest = endpoint.includes('/api/v1/auth/delivery-point/refresh');
  if (res.status === 401 && !isCourierRefreshRequest) {
    const refreshedAccessToken = await refreshCourierToken();
    if (refreshedAccessToken) {
      res = await doRequest(refreshedAccessToken);
    }
  }

  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new APIError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.message || detail?.code || String(res.status);
    throw new APIError(res.status, message, err);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) return res.json();
  return undefined as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchCourierApi<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchCourierApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  postForm: <T>(endpoint: string, formData: FormData, options?: RequestInit) =>
    fetchCourierApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    }),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchCourierApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchCourierApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
