'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentLocale = (useParams().locale as Locale) || 'ru';

  const switchLocale = (locale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          disabled={isPending}
          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
            currentLocale === locale
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
