'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/bananay-logo-transparent.png"
            alt="Bananay"
            width={140}
            height={42}
            className="h-10 w-auto"
          />
          <p className="text-sm text-gray-600 text-center max-w-md">{t('tagline')}</p>
          <p className="text-xs text-gray-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

