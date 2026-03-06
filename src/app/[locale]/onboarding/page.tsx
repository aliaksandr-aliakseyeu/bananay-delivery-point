'use client';

import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';

export default function OnboardingPage() {
  return (
    <RequireCourierAuth>
      <div className="min-h-screen bg-gray-50">
        <OnboardingContent showBackButton={true} />
      </div>
    </RequireCourierAuth>
  );
}
