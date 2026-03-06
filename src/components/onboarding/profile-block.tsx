'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierProfileResponse } from '@/lib/api/courier';
import { getRegions, type RegionListItem } from '@/lib/api/regions';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

interface ProfileBlockProps {
  onProfileUpdated?: (profile: CourierProfileResponse) => void;
  initialProfile?: CourierProfileResponse;
}

function splitFullName(fullName: string | null): { firstName: string; lastName: string } {
  if (!fullName?.trim()) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') ?? '' };
}

export function ProfileBlock({ onProfileUpdated, initialProfile }: ProfileBlockProps) {
  const t = useTranslations('Onboarding');
  const [profile, setProfile] = useState<CourierProfileResponse | null>(initialProfile ?? null);
  const [regions, setRegions] = useState<RegionListItem[]>([]);
  const [profileForm, setProfileForm] = useState(() => {
    if (initialProfile) {
      const { firstName, lastName } = splitFullName(initialProfile.full_name);
      return {
        first_name: firstName,
        last_name: lastName,
        region_id: initialProfile.region_id != null ? String(initialProfile.region_id) : '',
        city: initialProfile.city ?? '',
        street: initialProfile.street ?? '',
        building: initialProfile.building ?? '',
        apartment: initialProfile.apartment ?? '',
      };
    }
    return { first_name: '', last_name: '', region_id: '' as string, city: '', street: '', building: '', apartment: '' };
  });
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (initialProfile != null) {
      setProfile(initialProfile);
      const { firstName, lastName } = splitFullName(initialProfile.full_name);
      setProfileForm({
        first_name: firstName,
        last_name: lastName,
        region_id: initialProfile.region_id != null ? String(initialProfile.region_id) : '',
        city: initialProfile.city ?? '',
        street: initialProfile.street ?? '',
        building: initialProfile.building ?? '',
        apartment: initialProfile.apartment ?? '',
      });
      setIsLoading(false);
      return;
    }
    courierApi.getMe().then((me) => {
      setProfile(me);
      const { firstName, lastName } = splitFullName(me.full_name);
      setProfileForm({
        first_name: firstName,
        last_name: lastName,
        region_id: me.region_id != null ? String(me.region_id) : '',
        city: me.city ?? '',
        street: me.street ?? '',
        building: me.building ?? '',
        apartment: me.apartment ?? '',
      });
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [initialProfile]);

  useEffect(() => {
    getRegions().then(setRegions).catch(() => setRegions([])).finally(() => setRegionsLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const fullName = [profileForm.first_name, profileForm.last_name].map((s) => s.trim()).filter(Boolean).join(' ');
      const updated = await courierApi.updateMe({
        full_name: fullName || null,
        region_id: profileForm.region_id ? parseInt(profileForm.region_id, 10) : null,
        city: profileForm.city.trim() || null,
        street: profileForm.street.trim() || null,
        building: profileForm.building.trim() || null,
        apartment: profileForm.apartment.trim() || null,
      });
      setProfile(updated);
      onProfileUpdated?.(updated);
      toast.success(t('save'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('updateError'));
    } finally {
      setProfileSaving(false);
    }
  };

  if (isLoading) return <PageLoading fullPage={false} />;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
          <CardDescription>{t('profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile_first_name">{t('firstName')}</Label>
                <Input id="profile_first_name" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder={t('firstNamePlaceholder')} maxLength={128} disabled={profileSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_last_name">{t('lastName')}</Label>
                <Input id="profile_last_name" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} placeholder={t('lastNamePlaceholder')} maxLength={128} disabled={profileSaving} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_region_id">{t('region')}</Label>
              <select id="profile_region_id" value={profileForm.region_id} onChange={(e) => setProfileForm({ ...profileForm, region_id: e.target.value })} disabled={profileSaving || regionsLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">{t('selectRegion')}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}{r.country?.name ? ` (${r.country.name})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_city">{t('city')}</Label>
              <Input id="profile_city" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} placeholder={t('cityPlaceholder')} maxLength={255} disabled={profileSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_street">{t('street')}</Label>
              <Input id="profile_street" value={profileForm.street} onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })} placeholder={t('streetPlaceholder')} maxLength={255} disabled={profileSaving} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile_building">{t('building')}</Label>
                <Input id="profile_building" value={profileForm.building} onChange={(e) => setProfileForm({ ...profileForm, building: e.target.value })} placeholder={t('buildingPlaceholder')} maxLength={50} disabled={profileSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_apartment">{t('apartment')}</Label>
                <Input id="profile_apartment" value={profileForm.apartment} onChange={(e) => setProfileForm({ ...profileForm, apartment: e.target.value })} placeholder={t('apartmentPlaceholder')} maxLength={50} disabled={profileSaving} />
              </div>
            </div>
            <Button type="submit" disabled={profileSaving}>{profileSaving ? t('saving') : t('save')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{t('payoutStubTitle')}</h3>
              <p className="text-sm text-gray-600 mt-1">{t('payoutStubDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
