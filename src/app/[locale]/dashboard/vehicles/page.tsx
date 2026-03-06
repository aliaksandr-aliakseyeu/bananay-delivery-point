'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { VehiclesBlock } from '@/components/onboarding/vehicles-block';

export default function DashboardVehiclesPage() {
  const t = useTranslations('Dashboard');
  const tOnboarding = useTranslations('Onboarding');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <RequireCourierAuth>
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="max-w-7xl w-full mx-auto px-4 py-8 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-6">
            <BackButton href="/dashboard">{tOnboarding('back')}</BackButton>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('vehiclesCard')}</h1>
              <p className="text-sm text-gray-600 mt-0.5">{t('vehiclesCardDescription')}</p>
            </div>
            <Button onClick={() => setShowCreate(true)} size="sm" className="flex-shrink-0 gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{tOnboarding('addVehicle')}</span>
            </Button>
          </div>
          <VehiclesBlock showCreate={showCreate} onCreateClose={() => setShowCreate(false)} />
        </div>
      </div>
    </RequireCourierAuth>
  );
}
