'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export function TrackFinalCtaSection() {
  const tHero = useTranslations('Hero');
  const tCta = useTranslations('HomeCta');

  return (
    <section className="bg-white">
      <div className="section-container max-w-4xl pb-8 pt-12 text-center lg:pb-10 lg:pt-14">
        <p className="section-eyebrow">{tCta('label')}</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {tCta('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {tCta('subtitle')}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="landing">
            <Link href="/login">{tHero('registerButton')}</Link>
          </Button>
          <Button asChild variant="outline" size="landing" className="border-slate-300">
            <Link href="/login">{tHero('signInButton')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
