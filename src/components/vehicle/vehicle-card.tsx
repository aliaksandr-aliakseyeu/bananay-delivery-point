'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Pencil, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CourierMediaImage } from '@/components/vehicle/courier-media-image';
import type { CourierVehicleResponse } from '@/lib/api/courier';

interface VehicleCardProps {
  vehicle: CourierVehicleResponse;
  onEdit: (v: CourierVehicleResponse) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function VehicleCard({ vehicle, onEdit, onDelete, isDeleting }: VehicleCardProps) {
  const t = useTranslations('Onboarding');
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={vehicle.plate_number}
        >
          <div className="flex items-start gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
              {vehicle.photo_media_id ? (
                <CourierMediaImage
                  mediaId={vehicle.photo_media_id}
                  alt={vehicle.plate_number}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate font-mono leading-tight">
                {vehicle.plate_number}
              </h3>
              {vehicle.model && <p className="text-sm text-gray-500">{vehicle.model}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span>{t('maxWeightKg')}: {vehicle.max_weight_kg} кг</span>
            {vehicle.vehicle_type && (
              <>
                <span>•</span>
                <span>{vehicle.vehicle_type}</span>
              </>
            )}
          </div>
          {!vehicle.is_active && (
            <p className="text-xs text-amber-600 mt-1">{t('required')}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev); }} className="h-8 w-8 p-0" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }} disabled={isDeleting} className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }} disabled={isDeleting} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div className="pt-0">
            <dt className="text-muted-foreground text-sm mb-1">{t('vehiclePhoto')}</dt>
            <div className="w-full max-w-[200px] aspect-[3/2] rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {vehicle.photo_media_id ? (
                <CourierMediaImage mediaId={vehicle.photo_media_id} alt={vehicle.plate_number} className="w-full h-full object-contain" />
              ) : (
                <Car className="w-10 h-10 text-gray-400" />
              )}
            </div>
          </div>
          <dl className="grid gap-2 text-sm">
            {vehicle.model && (
              <div>
                <dt className="text-muted-foreground">{t('model')}</dt>
                <dd className="font-medium">{vehicle.model}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">{t('maxWeightKg')}</dt>
              <dd className="font-medium">{vehicle.max_weight_kg} кг</dd>
            </div>
            {vehicle.vehicle_type && (
              <div>
                <dt className="text-muted-foreground">{t('vehicleType')}</dt>
                <dd className="font-medium">{vehicle.vehicle_type}</dd>
              </div>
            )}
          </dl>
          {vehicle.sts_media_id && (
            <div className="pt-2 border-t border-gray-100">
              <dt className="text-muted-foreground text-sm mb-1">{t('documentSts')}</dt>
              <div className="w-full max-w-[200px] aspect-[3/2] rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                <CourierMediaImage mediaId={vehicle.sts_media_id} alt="СТС" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

