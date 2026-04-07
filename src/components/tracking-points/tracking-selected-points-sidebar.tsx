'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';

export interface TrackingSelectedPointRow {
  id: number;
  name: string;
  address: string | null;
}

export interface TrackingSelectedPointsSidebarProps {
  points: TrackingSelectedPointRow[];
  onRemove: (id: number) => void;
}

function TrackingSelectedPointsSidebarComponent({ points, onRemove }: TrackingSelectedPointsSidebarProps) {
  const t = useTranslations('TrackingOnboarding');

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-border lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('sidebarTitle')}</h2>

      {points.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-sm whitespace-pre-line">
            {t('sidebarEmptyTitle')}
            {'\n'}
            {t('sidebarEmptyHint')}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[min(70vh,560px)] overflow-y-auto">
          {points.map((p) => (
            <div
              key={p.id}
              className="p-3 border-b last:border-b-0 flex items-start justify-between gap-2 hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900">{p.name}</p>
                {p.address && (
                  <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{p.address}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">ID: {p.id}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onRemove(p.id)}
                aria-label={t('sidebarRemoveAria')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const TrackingSelectedPointsSidebar = memo(TrackingSelectedPointsSidebarComponent);
