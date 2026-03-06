'use client';

import { Spinner } from '@/components/ui/spinner';

interface PageLoadingProps {
  /** true = занимает область по высоте и центрирует (страница), false = компактный блок (секция/карточка) */
  fullPage?: boolean;
  className?: string;
}

/**
 * Единый шаблон загрузки: один размер спиннера (md), один стиль.
 * fullPage — для загрузки всей страницы, иначе — для блока внутри страницы.
 */
export function PageLoading({ fullPage = true, className = '' }: PageLoadingProps) {
  return (
    <div
      className={
        fullPage
          ? `flex flex-1 items-center justify-center bg-gray-50 ${className}`.trim()
          : `flex flex-1 items-center justify-center ${className}`.trim()
      }
    >
      <Spinner size="md" />
    </div>
  );
}
