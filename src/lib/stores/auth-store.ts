import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { courierAuthApi } from '../api/courier-auth';

const STORAGE_KEY = 'courier-auth-storage';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  phone: string | null;
  isNewUser: boolean | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  requestOtp: (phone_e164: string) => Promise<void>;
  verifyOtp: (phone_e164: string, code: string) => Promise<void>;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      phone: null,
      isNewUser: null,
      isAuthenticated: false,
      _hasHydrated: false,

      requestOtp: async (phone_e164: string) => {
        await courierAuthApi.requestOtp(phone_e164);
      },

      verifyOtp: async (phone_e164: string, code: string) => {
        const data = await courierAuthApi.verifyOtp(phone_e164, code);
        set({
          token: data.access_token,
          refreshToken: data.refresh_token,
          phone: phone_e164,
          isNewUser: data.is_new_user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('courier-submit-helper-shown');
        }
        set({
          token: null,
          refreshToken: null,
          phone: null,
          isNewUser: null,
          isAuthenticated: false,
        });
      },

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        token: s.token,
        refreshToken: s.refreshToken,
        phone: s.phone,
        isNewUser: s.isNewUser,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);
