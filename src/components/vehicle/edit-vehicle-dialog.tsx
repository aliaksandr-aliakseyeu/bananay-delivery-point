'use client';

import { useState, useEffect } from 'react';
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
import { CourierMediaImage } from '@/components/vehicle/courier-media-image';
import { courierApi, type CourierVehicleResponse } from '@/lib/api/courier';

interface EditVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: CourierVehicleResponse | null;
}

export default function EditVehicleDialog({ isOpen, onClose, onSuccess, vehicle }: EditVehicleDialogProps) {
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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [stsFile, setStsFile] = useState<File | null>(null);
  const [stsPreviewUrl, setStsPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) { setPhotoPreviewUrl(null); return; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  useEffect(() => {
    if (!stsFile) { setStsPreviewUrl(null); return; }
    const url = URL.createObjectURL(stsFile);
    setStsPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [stsFile]);

  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        plate_number: vehicle.plate_number,
        model: vehicle.model ?? '',
        max_weight_kg: String(vehicle.max_weight_kg),
        vehicle_type: vehicle.vehicle_type ?? '',
      });
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setError(null);
    setIsLoading(true);
    try {
      const max_weight_kg = parseInt(formData.max_weight_kg, 10);
      if (isNaN(max_weight_kg) || max_weight_kg < 1 || max_weight_kg > 5000) {
        setError(t('updateError'));
        setIsLoading(false);
        return;
      }
      await courierApi.updateVehicle(vehicle.id, {
        plate_number: formData.plate_number.trim(),
        model: formData.model.trim() || null,
        max_weight_kg,
        vehicle_type: formData.vehicle_type.trim() || null,
      });
      if (photoFile) await courierApi.uploadVehiclePhoto(vehicle.id, photoFile);
      if (stsFile) await courierApi.uploadVehicleSts(vehicle.id, stsFile);
      setPhotoFile(null);
      setStsFile(null);
      onClose();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhotoFile(null);
    setStsFile(null);
    setError(null);
    onClose();
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('editVehicle')}</DialogTitle>
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
            <Label htmlFor="edit_plate_number">{t('plateNumber')} *</Label>
            <Input
              id="edit_plate_number"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              required
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_model">{t('model')}</Label>
            <Input
              id="edit_model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              maxLength={255}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_max_weight_kg">{t('maxWeightKg')} *</Label>
              <Input
                id="edit_max_weight_kg"
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
              <Label htmlFor="edit_vehicle_type">{t('vehicleType')}</Label>
              <Input
                id="edit_vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                placeholder={t('vehicleTypePlaceholder')}
                maxLength={50}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_vehicle_photo">{t('vehiclePhoto')}</Label>
            {vehicle.photo_media_id && !photoFile && (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-full max-w-[200px] aspect-video flex items-center justify-center">
                <CourierMediaImage mediaId={vehicle.photo_media_id} alt={vehicle.plate_number} className="w-full h-full object-contain" />
              </div>
            )}
            {photoFile && photoPreviewUrl && (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-full max-w-[200px] aspect-video flex items-center justify-center">
                <img src={photoPreviewUrl} alt="" className="w-full h-full object-contain" />
              </div>
            )}
            <Input id="edit_vehicle_photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} disabled={isLoading} className="cursor-pointer" />
            {vehicle.photo_media_id && !photoFile && <p className="text-sm text-muted-foreground">{t('vehiclePhotoCurrent')}</p>}
            {photoFile && <p className="text-sm text-muted-foreground">{photoFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_vehicle_sts">{t('documentSts')}</Label>
            {vehicle.sts_media_id && !stsFile && (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-full max-w-[200px] aspect-[3/2] flex items-center justify-center">
                <CourierMediaImage mediaId={vehicle.sts_media_id} alt="СТС" className="w-full h-full object-contain" />
              </div>
            )}
            {stsFile && stsPreviewUrl && (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 w-full max-w-[200px] aspect-[3/2] flex items-center justify-center">
                {stsFile.type.startsWith('image/') ? (
                  <img src={stsPreviewUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-sm text-muted-foreground">PDF</span>
                )}
              </div>
            )}
            <Input id="edit_vehicle_sts" type="file" accept="image/*,.pdf" onChange={(e) => setStsFile(e.target.files?.[0] ?? null)} disabled={isLoading} className="cursor-pointer" />
            {vehicle.sts_media_id && !stsFile && <p className="text-sm text-muted-foreground">{t('vehiclePhotoCurrent')}</p>}
            {stsFile && <p className="text-sm text-muted-foreground">{stsFile.name}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>{t('cancel')}</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? t('saving') : t('save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
