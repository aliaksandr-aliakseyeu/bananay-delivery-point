'use client';

import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/landing/section-heading';

export function TrackHowItWorksSection() {
  const t = useTranslations('HowItWorks');

  const steps = [
    {
      number: '01',
      title: t('step1Title'),
      text: t('step1Desc'),
    },
    {
      number: '02',
      title: t('step2Title'),
      text: t('step2Desc'),
    },
    {
      number: '03',
      title: t('step3Title'),
      text: t('step3Desc'),
    },
  ];

  return (
    <section className="bg-white">
      <div className="section-container py-8 lg:py-10">
        <SectionHeading
          label={t('label')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-16">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={index === 0 ? 'pt-1' : 'pt-1 lg:border-l lg:border-slate-200 lg:pl-10'}
            >
              <div className="text-5xl font-extrabold tracking-tight text-primary">{step.number}</div>
              <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
