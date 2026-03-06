'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileBlock } from './profile-block';
import { VehiclesBlock } from './vehicles-block';
import { DocumentsBlock } from './documents-block';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierProfileResponse, type CourierMediaFileResponse, type CourierVehicleResponse } from '@/lib/api/courier';
import { toast } from 'sonner';

interface OnboardingContentProps {
  showBackButton?: boolean;
}

export function OnboardingContent({ showBackButton = false }: OnboardingContentProps) {
  const t = useTranslations('Onboarding');
  const tHeader = useTranslations('Header');
  const [profile, setProfile] = useState<CourierProfileResponse | null>(null);
  const [documents, setDocuments] = useState<CourierMediaFileResponse[]>([]);
  const [vehicles, setVehicles] = useState<CourierVehicleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setError(null);
      const [me, docs, vehiclesList] = await Promise.all([
        courierApi.getMe(),
        courierApi.getDocuments(),
        courierApi.getVehicles(),
      ]);
      setProfile(me);
      setDocuments(docs);
      setVehicles(vehiclesList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      await courierApi.submitApplication();
      setSubmitConfirmOpen(false);
      await load();
      toast.success(t('submitSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !profile) return <PageLoading fullPage />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {showBackButton && <BackButton href="/dashboard">{t('back')}</BackButton>}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {showBackButton ? t('title') : tHeader('dashboard')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>{t('errorLoading')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <ProfileBlock initialProfile={profile ?? undefined} onProfileUpdated={(p) => setProfile(p)} />
          <VehiclesBlock initialVehicles={vehicles} onVehiclesUpdated={load} />
          <DocumentsBlock initialProfile={profile ?? undefined} initialDocuments={documents} onProfileUpdated={(p) => setProfile(p)} />

          <div className="flex justify-end pt-4">
            <Button disabled={!profile?.can_submit || submitting} onClick={() => setSubmitConfirmOpen(true)}>
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('submit')}</DialogTitle>
            <DialogDescription>{t('submitConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitConfirmOpen(false)} disabled={submitting}>{t('cancel')}</Button>
            <Button onClick={handleSubmitApplication} disabled={submitting}>{submitting ? t('submitting') : t('submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
