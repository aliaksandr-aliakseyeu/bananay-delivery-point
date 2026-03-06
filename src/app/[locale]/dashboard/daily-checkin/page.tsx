'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { RequireCourierAuth } from '@/components/auth/require-courier-auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi } from '@/lib/api/courier';
import { dailyCheckInApi, PhotoKind, PHOTO_KINDS, CheckIn } from '@/lib/api/daily-checkin';
import { API_BASE_URL } from '@/lib/constants';
import {
  Camera,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  plate_number: string;
  model: string | null;
}

const PHOTO_STEPS: { kind: PhotoKind; icon: typeof Camera }[] = [
  { kind: 'selfie', icon: Camera },
  { kind: 'vehicle_front', icon: Car },
  { kind: 'vehicle_left', icon: Car },
  { kind: 'vehicle_right', icon: Car },
  { kind: 'vehicle_rear', icon: Car },
  { kind: 'vehicle_cargo', icon: Car },
];

export default function DailyCheckInPage() {
  const t = useTranslations('DailyCheckIn');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setError(null);
      const [vehiclesData, statusData] = await Promise.all([
        courierApi.getVehicles(),
        dailyCheckInApi.getTodayStatus(),
      ]);
      setVehicles(vehiclesData.filter((v: Vehicle & { is_active: boolean }) => v.is_active));
      if (statusData.checkin) {
        setCheckin(statusData.checkin);
        const uploadedKinds = statusData.checkin.photos.map(p => p.kind);
        const nextMissingIndex = PHOTO_KINDS.findIndex(k => !uploadedKinds.includes(k));
        setCurrentStep(nextMissingIndex >= 0 ? nextMissingIndex : PHOTO_KINDS.length);
        const vehicle = vehiclesData.find((v: Vehicle) => v.id === statusData.checkin?.vehicle_id);
        if (vehicle) setSelectedVehicle(vehicle);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVehicle = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setError(null);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 60000 });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch { }
      }
      const newCheckin = await dailyCheckInApi.start(vehicle.id, latitude, longitude);
      setCheckin(newCheckin);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorStarting'));
    }
  };

  const handlePhotoCapture = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !checkin) return;
    const kind = PHOTO_STEPS[currentStep]?.kind;
    if (!kind) return;
    setUploading(true);
    setError(null);
    try {
      const updatedCheckin = await dailyCheckInApi.uploadPhoto(checkin.id, kind, file);
      setCheckin(updatedCheckin);
      if (currentStep < PHOTO_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(PHOTO_STEPS.length);
      }
      toast.success(t('photoUploaded'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorUploading'));
      toast.error(t('errorUploading'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleComplete = async () => {
    if (!checkin) return;
    setCompleting(true);
    setError(null);
    try {
      await dailyCheckInApi.complete(checkin.id);
      toast.success(t('checkInComplete'));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorCompleting'));
      toast.error(t('errorCompleting'));
    } finally {
      setCompleting(false);
    }
  };

  const isPhotoUploaded = (kind: PhotoKind) => checkin?.photos.some(p => p.kind === kind) ?? false;
  const allPhotosUploaded = PHOTO_KINDS.every(k => isPhotoUploaded(k));

  if (isLoading) {
    return (
      <RequireCourierAuth>
        <PageLoading fullPage />
      </RequireCourierAuth>
    );
  }

  if (checkin?.status === 'pending_review') {
    return (
      <RequireCourierAuth>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pendingReview')}</h1>
              <p className="text-gray-600 mb-6">{t('pendingReviewDescription')}</p>
              <Button onClick={() => router.push('/dashboard')}>{t('backToDashboard')}</Button>
            </div>
          </div>
        </div>
      </RequireCourierAuth>
    );
  }

  if (checkin?.status === 'approved') {
    return (
      <RequireCourierAuth>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('approved')}</h1>
              <p className="text-gray-600 mb-6">{t('approvedDescription')}</p>
              <Button onClick={() => router.push('/dashboard')}>{t('backToDashboard')}</Button>
            </div>
          </div>
        </div>
      </RequireCourierAuth>
    );
  }

  if (checkin?.status === 'rejected') {
    return (
      <RequireCourierAuth>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('rejected')}</h1>
              <p className="text-gray-600 mb-2">{t('rejectedDescription')}</p>
              {checkin.reject_reason && (
                <p className="text-red-600 font-medium mb-6">{t('rejectReason')}: {checkin.reject_reason}</p>
              )}
              <Button onClick={() => router.push('/dashboard')}>{t('backToDashboard')}</Button>
            </div>
          </div>
        </div>
      </RequireCourierAuth>
    );
  }

  if (!checkin) {
    return (
      <RequireCourierAuth>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-1">{t('selectVehicle')}</p>
            </div>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {vehicles.length === 0 ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('noVehicles')}</AlertTitle>
                <AlertDescription>{t('noVehiclesDescription')}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleSelectVehicle(vehicle)}
                    className="w-full bg-white rounded-lg shadow-sm p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{vehicle.plate_number}</p>
                        {vehicle.model && <p className="text-sm text-gray-500">{vehicle.model}</p>}
                      </div>
                      <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </RequireCourierAuth>
    );
  }

  const currentPhotoStep = PHOTO_STEPS[currentStep];

  return (
    <RequireCourierAuth>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Car className="h-4 w-4" />
              <span>{selectedVehicle?.plate_number}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-1">
              {PHOTO_STEPS.map((step, idx) => (
                <div key={step.kind} className={`h-1.5 flex-1 rounded-full transition-colors ${isPhotoUploaded(step.kind) ? 'bg-blue-600' : idx === currentStep ? 'bg-blue-400' : 'bg-gray-200'}`} />
              ))}
            </div>
            {currentStep < PHOTO_STEPS.length && (
              <p className="text-sm text-gray-600 mt-2">{t('step', { current: currentStep + 1, total: PHOTO_STEPS.length })}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep < PHOTO_STEPS.length && currentPhotoStep ? (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <currentPhotoStep.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t(`photos.${currentPhotoStep.kind}.title`)}</h2>
                <p className="text-sm text-gray-600 mb-6">{t(`photos.${currentPhotoStep.kind}.description`)}</p>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                <Button size="lg" onClick={handlePhotoCapture} disabled={uploading} className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">
                  {uploading ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t('uploading')}</>
                  ) : (
                    <><Camera className="h-5 w-5 mr-2" />{t('takePhoto')}</>
                  )}
                </Button>
              </div>
            </div>
          ) : null}

          {allPhotosUploaded && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('allPhotosUploaded')}</h2>
                <p className="text-sm text-gray-600 mb-6">{t('confirmComplete')}</p>
                <Button size="lg" onClick={handleComplete} disabled={completing} className="w-full bg-[#1e3a8a] hover:bg-[#1e40af]">
                  {completing ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t('completing')}</>
                  ) : (
                    <><CheckCircle className="h-5 w-5 mr-2" />{t('completeCheckIn')}</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {checkin.photos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('uploadedPhotos')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {PHOTO_STEPS.map((step) => {
                  const photo = checkin.photos.find(p => p.kind === step.kind);
                  return <PhotoThumbnail key={step.kind} mediaId={photo?.media_id} fallbackIcon={step.icon} />;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireCourierAuth>
  );
}

const STORAGE_KEY = 'courier-auth-storage';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.token ?? null;
  } catch {
    return null;
  }
}

interface PhotoThumbnailProps {
  mediaId: string | undefined;
  fallbackIcon: React.ComponentType<{ className?: string }>;
}

function PhotoThumbnail({ mediaId, fallbackIcon: FallbackIcon }: PhotoThumbnailProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mediaId) { setImageSrc(null); return; }
    let objectUrl: string | null = null;
    setIsLoading(true);
    setHasError(false);
    const token = getToken();
    fetch(`${API_BASE_URL}/api/v1/courier/daily-checkin/media/${mediaId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.ok ? r.blob() : null)
      .then((blob) => {
        if (!blob) { setHasError(true); return; }
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [mediaId]);

  if (!mediaId) {
    return (
      <div className="aspect-square rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
        <FallbackIcon className="h-6 w-6 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-lg border-2 border-blue-500 bg-blue-50 overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}
      {(hasError || (!imageSrc && !isLoading)) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-blue-500" />
        </div>
      )}
      {imageSrc && !isLoading && (
        <img src={imageSrc} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}
