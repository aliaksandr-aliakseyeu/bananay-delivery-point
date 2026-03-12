'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('Hero');
  const router = useRouter();

  return (
    <section className="hero-section relative overflow-hidden pt-14 pb-8 md:pt-20 md:pb-10">

      {/* Background accent */}
      <div className="hero-accent" aria-hidden="true">
        <span className="hero-accent__glow" />
        <span className="hero-accent__line hero-accent__line--1" />
        <span className="hero-accent__line hero-accent__line--2" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e3a8a] leading-tight">
            {t('title')}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {t('subtitle')}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">

            <Button
              size="lg"
              className="bg-[#1e3a8a] px-6 py-5 text-white hover:bg-[#1e40af]"
              onClick={() => router.push('/login')}
            >
              {t('signInButton')}
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="bg-[#f97316] px-6 py-5 text-white hover:bg-[#ea580c]"
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