'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#1e3a8a]">Bananay</span>
            <span className="text-xs font-medium text-gray-500 border border-blue-200 rounded px-1.5 py-0.5 bg-blue-50">Courier</span>
          </div>
          <p className="text-sm text-gray-600 text-center max-w-md">{t('tagline')}</p>
          <p className="text-xs text-gray-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

