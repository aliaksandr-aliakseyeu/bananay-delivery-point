'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CourierLoginForm } from '@/components/auth/courier-login-form';

export default function LoginPage() {
  const t = useTranslations('Auth.courier');
  const tPage = useTranslations('LoginPage');
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated) router.replace('/dashboard');
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full mx-4 bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a8a] mb-1">{tPage('title')}</h1>
          <p className="text-gray-600">{tPage('subtitle')}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('title')}</h2>
          <p className="text-sm text-gray-600 mb-6">{t('description')}</p>
          <CourierLoginForm />
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            {tPage('backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
