'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('Hero');
  const router = useRouter();

  return (
    <section className="relative py-12 md:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] leading-tight">
            {t('title')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-6 py-5"
              onClick={() => router.push('/login')}
            >
              {t('signInButton')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-5"
              onClick={() => router.push('/login')}
            >
              {t('registerButton')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

