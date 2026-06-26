'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { visibleLocales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentLocale = (useParams().locale as Locale) || 'en';

  const switchLocale = (locale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-gray-200 p-1">
      {visibleLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          disabled={isPending}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            currentLocale === locale
              ? 'bg-[#1e3a8a] text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
