'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/page-loading';
import { courierApi, type CourierProfileResponse, type CourierMediaFileResponse } from '@/lib/api/courier';
import { toast } from 'sonner';

const DOC_KIND_LABEL: Record<string, string> = {
  selfie: 'documentSelfie',
  license_front: 'documentLicenseFront',
  license_back: 'documentLicenseBack',
  sts: 'documentSts',
  car_front: 'documentCarFront',
};

interface DocumentsBlockProps {
  onProfileUpdated?: (profile: CourierProfileResponse) => void;
  initialProfile?: CourierProfileResponse;
  initialDocuments?: CourierMediaFileResponse[];
}

export function DocumentsBlock({ onProfileUpdated, initialProfile, initialDocuments }: DocumentsBlockProps) {
  const t = useTranslations('Onboarding');
  const [profile, setProfile] = useState<CourierProfileResponse | null>(initialProfile ?? null);
  const [documents, setDocuments] = useState<CourierMediaFileResponse[]>(initialDocuments ?? []);
  const [isLoading, setIsLoading] = useState(initialProfile === undefined && initialDocuments === undefined);
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (initialProfile !== undefined && initialDocuments !== undefined) {
      setProfile(initialProfile);
      setDocuments(initialDocuments);
      setIsLoading(false);
      return;
    }
    Promise.all([courierApi.getMe(), courierApi.getDocuments()])
      .then(([me, docs]) => { setProfile(me); setDocuments(docs); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [initialProfile, initialDocuments]);

  const handleDocumentUpload = async (kind: string, file: File) => {
    setUploadingKind(kind);
    try {
      await courierApi.uploadDocument(kind, file);
      const [updatedProfile, docs] = await Promise.all([courierApi.getMe(), courierApi.getDocuments()]);
      setProfile(updatedProfile);
      setDocuments(docs);
      onProfileUpdated?.(updatedProfile);
      toast.success(t('upload'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('upload'));
    } finally {
      setUploadingKind(null);
    }
  };

  if (isLoading) return <PageLoading fullPage={false} />;

  const requiredKinds = profile?.required_document_kinds ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('documents')}</CardTitle>
        <CardDescription>{t('documentsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {requiredKinds.map((kind) => {
            const labelKey = DOC_KIND_LABEL[kind] ?? kind;
            const kindDocs = documents.filter((d) => d.kind === kind);
            const isUploading = uploadingKind === kind;
            return (
              <div key={kind} className="space-y-2">
                <Label className="text-base">{t(labelKey as 'documentSelfie')}</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={(el) => { fileInputRefs.current[kind] = el; }}
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(kind, file);
                      e.target.value = '';
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRefs.current[kind]?.click()}>
                    {isUploading ? t('uploading') : t('upload')}
                  </Button>
                  {kindDocs.length > 0 && <span className="text-sm text-gray-500">{kindDocs.length} file(s)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
