import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { APP_NAME, getRoleFooterConfig } from '@/lib/site-config';

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('Footer');
  const footerConfig = getRoleFooterConfig(locale);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="section-container py-6 md:py-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] md:gap-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-1">
              <Image
                src="/bananay-logo-transparent.png"
                alt="Bananay"
                width={240}
                height={72}
                className="h-8 w-auto object-contain object-center"
                unoptimized
              />
              <span className="brand-wordmark">{APP_NAME}</span>
            </div>

            <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-500">
              {t('description')}
            </p>

            <div className="mt-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('otherRolesLabel')}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {t('roles.retail')}
                </span>
                {footerConfig.otherRoles.map((role) => (
                  <a
                    key={role.translationKey}
                    href={role.href}
                    className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                  >
                    {t(`roles.${role.translationKey}`)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm text-slate-600 md:items-end md:text-right">
            <a
              href={footerConfig.homeHref}
              className="inline-flex items-center gap-2 font-medium text-slate-800 transition hover:text-slate-950 hover:underline hover:underline-offset-4"
            >
              <span aria-hidden>←</span>
              <span>{t('backHome')}</span>
            </a>

            <div className="flex flex-col gap-2 md:items-end">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('contactsLabel')}
              </div>
              <a
                href={`mailto:${footerConfig.contactEmail}`}
                className="transition hover:text-slate-950"
              >
                {footerConfig.contactEmail}
              </a>
              <a
                href={footerConfig.contactPhoneHref}
                className="transition hover:text-slate-950"
              >
                {footerConfig.contactPhoneLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200/80 pt-3 text-xs text-slate-400">
          <div>{t('copyright')}</div>
        </div>
      </div>
    </footer>
  );
}

