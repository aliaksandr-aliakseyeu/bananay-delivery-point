'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function TrackLandingHero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative flex min-h-[75vh] items-center overflow-hidden">
      <Image
        src="/hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div aria-hidden className="public-hero-overlay" />

      <div className="section-container relative flex min-h-[72vh] items-center py-10 md:py-14">
        <div className="flex w-full flex-col justify-center">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>

          <p className="mt-6 w-full text-lg leading-8 text-slate-100">
            {t('subtitle')}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="landing">
              <Link href="/login">{t('registerButton')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="landing"
              className="border-white/55 bg-white/5 text-white/90 hover:bg-white/15 hover:text-white"
            >
              <Link href="/login">{t('signInButton')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
