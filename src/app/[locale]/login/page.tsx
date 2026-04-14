'use client';

import { useTranslations } from 'next-intl';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { CourierLoginForm } from '@/components/auth/courier-login-form';
import { useGuestRedirectStatus } from '@/components/auth/use-guest-redirect-status';

export default function LoginPage() {
  const t = useTranslations('Auth.courier');
  const tPage = useTranslations('LoginPage');
  const { isLoading, isAuthenticated } = useGuestRedirectStatus();

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">{tPage('loading')}</div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <AuthPageShell
      eyebrow={tPage('title')}
      title={tPage('subtitle')}
      heading={t('title')}
      description={t('description')}
      backLabel={tPage('backHome')}
    >
      <CourierLoginForm />
    </AuthPageShell>
  );
}
