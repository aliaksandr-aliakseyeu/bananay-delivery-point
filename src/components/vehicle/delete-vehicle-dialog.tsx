'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteVehicleDialog({ isOpen, onClose, onConfirm, isLoading = false }: DeleteVehicleDialogProps) {
  const t = useTranslations('Onboarding');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('deleteVehicle')}</DialogTitle>
          <DialogDescription>{t('deleteVehicleConfirm')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>{t('cancel')}</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('deleting') : t('deleteVehicle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
