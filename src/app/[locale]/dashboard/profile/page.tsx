'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { BackButton } from '@/components/ui/back-button';
import { ProfileBlock } from '@/components/onboarding/profile-block';
import { DocumentsBlock } from '@/components/onboarding/documents-block';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierProfileResponse, type CourierMediaFileResponse } from '@/lib/api/courier';

export default function DashboardProfilePage() {
  const t = useTranslations('Dashboard');
  const tOnboarding = useTranslations('Onboarding');
  const [profile, setProfile] = useState<CourierProfileResponse | null>(null);
  const [documents, setDocuments] = useState<CourierMediaFileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([courierApi.getMe(), courierApi.getDocuments()])
      .then(([me, docs]) => {
        if (!cancelled) { setProfile(me); setDocuments(docs); }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  return (
    <RequireCourierAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 mb-6">
            <BackButton href="/dashboard">{tOnboarding('back')}</BackButton>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('profileCard')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('profileCardDescription')}</p>
            </div>
          </div>
          <div className="space-y-6">
            <ProfileBlock initialProfile={profile ?? undefined} />
            <DocumentsBlock initialProfile={profile ?? undefined} initialDocuments={documents} />
          </div>
        </div>
      </div>
    </RequireCourierAuth>
  );
}
