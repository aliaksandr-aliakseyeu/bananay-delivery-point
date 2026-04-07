'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { HeroSection } from '@/components/hero/hero-section';
import { RedirectWhenAuthenticated } from '@/components/auth/redirect-when-authenticated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ListChecks, MapPinned, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('HowItWorks');
  const tWhy = useTranslations('WhyBecomeCourier');
  const tCta = useTranslations('HomeCta');
  const router = useRouter();

  return (
    <RedirectWhenAuthenticated>
      <div className="flex flex-col">
        <HeroSection />

        {/* Как это работает */}
        <section className="bg-gray-50 py-6 md:py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-[#1e3a8a] md:text-3xl">
                {t('title')}
              </h2>
            </div>
            <div className="mx-auto grid w-max max-w-full grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 md:[grid-template-columns:repeat(3,minmax(12rem,1fr))]">
              <Card className="flex min-w-0 max-w-[18rem] flex-col items-center gap-2 border-gray-200 p-4 py-4 text-center shadow-sm md:mx-0 md:min-w-[12rem] md:max-w-[16rem] mx-auto">
                <h3 className="text-lg font-semibold leading-tight text-gray-800">
                  <span className="text-[#22c55e]">1 </span>
                  {t('step1Title')}
                </h3>
                <div className="my-0 flex items-center justify-center rounded-full bg-blue-50 p-5">
                  <MapPinned className="h-12 w-12 text-blue-700" />
                </div>
                <p className="mt-0 text-sm text-gray-600">{t('step1Desc')}</p>
              </Card>
              <Card className="flex min-w-0 max-w-[18rem] flex-col items-center gap-2 border-gray-200 p-4 py-4 text-center shadow-sm md:mx-0 md:min-w-[12rem] md:max-w-[16rem] mx-auto">
                <h3 className="text-lg font-semibold leading-tight text-gray-800">
                  <span className="text-[#22c55e]">2 </span>
                  {t('step2Title')}
                </h3>
                <div className="my-0 flex items-center justify-center rounded-full bg-amber-50 p-5">
                  <ListChecks className="h-12 w-12 text-amber-600" />
                </div>
                <p className="mt-0 text-sm text-gray-600">{t('step2Desc')}</p>
              </Card>
              <Card className="flex min-w-0 max-w-[18rem] flex-col items-center gap-2 border-gray-200 p-4 py-4 text-center shadow-sm md:mx-0 md:min-w-[12rem] md:max-w-[16rem] mx-auto">
                <h3 className="text-lg font-semibold leading-tight text-gray-800">
                  <span className="text-[#22c55e]">3 </span>
                  {t('step3Title')}
                </h3>
                <div className="my-0 flex items-center justify-center rounded-full bg-green-50 p-5">
                  <ShieldCheck className="h-12 w-12 text-green-600" />
                </div>
                <p className="mt-0 text-sm text-gray-600">{t('step3Desc')}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Разделительная линия */}
        <div className="bg-gray-50 py-2" aria-hidden>
          <div className="mx-auto max-w-3xl px-4">
            <hr className="border-t border-gray-200" />
          </div>
        </div>

        {/* Почему использовать отслеживание точек */}
        <section className="bg-gray-50 py-8 md:py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#1e3a8a] md:text-3xl">
              {tWhy('title')}
            </h2>
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
              {[
                tWhy('benefit1'),
                tWhy('benefit2'),
                tWhy('benefit3'),
                tWhy('benefit4'),
                tWhy('benefit5'),
                tWhy('benefit6'),
              ].map((label, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#22c55e]">
                    <Check className="h-4 w-4 text-white" />
                  </span>
                  <span className="font-medium text-gray-900">{label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <p className="mb-4 text-xl font-bold text-[#1e3a8a] md:text-2xl">
                {tCta('title')}
              </p>
              <Button
                size="lg"
                className="bg-[#f97316] px-8 py-6 text-base text-white hover:bg-[#ea580c]"
                onClick={() => router.push('/login')}
              >
                {tCta('button')}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </RedirectWhenAuthenticated>
  );
}
