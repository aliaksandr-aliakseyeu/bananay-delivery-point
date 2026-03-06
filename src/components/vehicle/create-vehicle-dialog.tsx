'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { courierApi } from '@/lib/api/courier';

interface CreateVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateVehicleDialog({ isOpen, onClose, onSuccess }: CreateVehicleDialogProps) {
  const t = useTranslations('Onboarding');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    max_weight_kg: '',
    vehicle_type: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [stsFile, setStsFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const max_weight_kg = parseInt(formData.max_weight_kg, 10);
      if (isNaN(max_weight_kg) || max_weight_kg < 1 || max_weight_kg > 5000) {
        setError(t('createError'));
        setIsLoading(false);
        return;
      }
      const vehicle = await courierApi.createVehicle({
        plate_number: formData.plate_number.trim(),
        model: formData.model.trim() || null,
        max_weight_kg,
        vehicle_type: formData.vehicle_type.trim() || null,
      });
      if (photoFile) await courierApi.uploadVehiclePhoto(vehicle.id, photoFile);
      if (stsFile) await courierApi.uploadVehicleSts(vehicle.id, stsFile);
      setFormData({ plate_number: '', model: '', max_weight_kg: '', vehicle_type: '' });
      setPhotoFile(null);
      setStsFile(null);
      onClose();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ plate_number: '', model: '', max_weight_kg: '', vehicle_type: '' });
    setPhotoFile(null);
    setStsFile(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('createVehicle')}</DialogTitle>
          <DialogDescription>{t('vehiclesDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="plate_number">{t('plateNumber')} *</Label>
            <Input
              id="plate_number"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              placeholder={t('plateNumberPlaceholder')}
              required
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{t('model')}</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder={t('modelPlaceholder')}
              maxLength={255}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="max_weight_kg">{t('maxWeightKg')} *</Label>
              <Input
                id="max_weight_kg"
                type="number"
                min={1}
                max={5000}
                value={formData.max_weight_kg}
                onChange={(e) => setFormData({ ...formData, max_weight_kg: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">{t('vehicleType')}</Label>
              <Input
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                placeholder={t('vehicleTypePlaceholder')}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_photo">{t('vehiclePhoto')}</Label>
            <Input
              id="vehicle_photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {photoFile && <p className="text-sm text-muted-foreground">{photoFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_sts">{t('documentSts')}</Label>
            <Input
              id="vehicle_sts"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setStsFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
              className="cursor-pointer"
            />
            {stsFile && <p className="text-sm text-muted-foreground">{stsFile.name}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('creating') : t('addVehicle')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
