'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  VehicleCard,
  CreateVehicleDialog,
  EditVehicleDialog,
  DeleteVehicleDialog,
} from '@/components/vehicle';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierVehicleResponse } from '@/lib/api/courier';
import { toast } from 'sonner';

interface VehiclesBlockProps {
  initialVehicles?: CourierVehicleResponse[];
  onVehiclesUpdated?: () => void;
  showCreate?: boolean;
  onCreateClose?: () => void;
}

export function VehiclesBlock({ initialVehicles, onVehiclesUpdated, showCreate, onCreateClose }: VehiclesBlockProps) {
  const t = useTranslations('Onboarding');
  const [vehicles, setVehicles] = useState<CourierVehicleResponse[]>(initialVehicles ?? []);
  const [isLoading, setIsLoading] = useState(initialVehicles === undefined);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const isCreateOpen = showCreate !== undefined ? showCreate : showCreateVehicle;
  const handleCreateClose = () => { setShowCreateVehicle(false); onCreateClose?.(); };
  const [editingVehicle, setEditingVehicle] = useState<CourierVehicleResponse | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialVehicles !== undefined) {
      setVehicles(initialVehicles);
      setIsLoading(false);
      return;
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialVehicles !== undefined) setVehicles(initialVehicles);
  }, [initialVehicles]);

  const load = async () => {
    try {
      const list = await courierApi.getVehicles();
      setVehicles(list);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => (onVehiclesUpdated ? onVehiclesUpdated() : load());

  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return;
    setIsDeleting(true);
    try {
      await courierApi.deleteVehicle(deleteVehicleId);
      toast.success(t('deleteVehicle'));
      setDeleteVehicleId(null);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('deleteVehicle'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageLoading fullPage={false} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vehicles')}</CardTitle>
        <CardDescription>{t('vehiclesDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noVehicles')}</p>
          ) : (
            vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onEdit={(vehicle) => setEditingVehicle(vehicle)}
                onDelete={(id) => setDeleteVehicleId(id)}
                isDeleting={isDeleting && deleteVehicleId === v.id}
              />
            ))
          )}
        </div>
      </CardContent>

      <CreateVehicleDialog isOpen={isCreateOpen} onClose={handleCreateClose} onSuccess={refresh} />
      <EditVehicleDialog isOpen={!!editingVehicle} onClose={() => setEditingVehicle(null)} onSuccess={refresh} vehicle={editingVehicle} />
      <DeleteVehicleDialog isOpen={!!deleteVehicleId} onClose={() => setDeleteVehicleId(null)} onConfirm={handleDeleteVehicle} isLoading={isDeleting} />
    </Card>
  );
}
