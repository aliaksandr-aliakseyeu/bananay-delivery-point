'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';

export function TrackWhyDeliveryPointSection() {
  const t = useTranslations('WhyBecomeCourier');

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
    t('benefit6'),
  ];

  return (
    <section className="relative bg-slate-50 py-10">
      <div className="absolute inset-0">
        <div className="section-container absolute bottom-0 left-1/2 top-0 w-full -translate-x-1/2 overflow-hidden">
          <Image
            src="/img.png"
            alt=""
            fill
            className="object-contain object-right"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgb(248_250_252)_0%,rgb(248_250_252)_52%,rgba(248,250,252,0.62)_64%,rgba(248,250,252,0.22)_76%,rgb(248_250_252)_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50/95 via-slate-50/65 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50/55 to-transparent"
            aria-hidden
          />
        </div>
      </div>

      <div className="section-container relative z-10 flex flex-col justify-start">
        <SectionHeading label={t('label')} title={t('title')} className="max-w-xl lg:pr-8" />

        <ul className="mt-8 max-w-xl space-y-6">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-4">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-4 w-4" />
              </span>
              <p className="text-lg leading-8 text-slate-700">{benefit}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
