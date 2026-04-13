'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (value.trim().startsWith('+')) return '+' + digits;
  if (digits.length >= 10 && digits.startsWith('7')) return '+' + digits;
  if (digits.length >= 10 && digits.startsWith('8')) return '+7' + digits.slice(1);
  return digits ? '+' + digits : value.trim();
}

export function CourierLoginForm() {
  const t = useTranslations('Auth.courier');
  const router = useRouter();
  const { verifyOtp, requestOtp } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneE164 = normalizePhone(phone);

  const handleRequestOtp = async () => {
    if (!phoneE164 || phoneE164.length < 10) {
      setError(t('validation.phoneInvalid'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtp(phoneE164);
      setStep('code');
      setCode('');
      toast.success('Код отправлен');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.requestOtpFailed'));
      toast.error(t('errors.requestOtpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 4) {
      setError(t('validation.codeLength'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phoneE164, trimmed);
      router.replace('/dashboard');
      toast.success('Вход выполнен');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.verifyFailed'));
      toast.error(t('errors.verifyFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="code" className="text-[15px]">{t('code')}</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder={t('codePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="mt-1 h-[60px] text-[18px]"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-[60px] flex-1 text-[17px]"
            disabled={loading}
            onClick={() => { setStep('phone'); setError(null); }}
          >
            {t('backToPhone')}
          </Button>
          <Button
            type="button"
            className="h-[60px] flex-1 bg-[#2b418f] text-[17px] font-semibold hover:bg-[#243778]"
            disabled={loading || code.replace(/\D/g, '').length !== 4}
            onClick={handleVerify}
          >
            {loading ? t('loggingIn') : t('submit')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phone" className="text-[15px]">{t('phone')}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder={t('phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 h-[60px] text-[18px]"
        />
      </div>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-base leading-7 text-slate-700">
        <div className="font-medium text-slate-950">{t('telegramBotMvpTitle')}</div>
        <div className="mt-2">
          {t('telegramBotPrefix')}{' '}
          <a
            href="https://t.me/bananay_otp_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 hover:underline"
          >
            @bananay_otp_bot
          </a>{' '}
          {t('telegramBotSuffix')}
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="button"
        className="h-[60px] w-full bg-[#1e3a8a] text-[17px] font-semibold hover:bg-[#1e40af]"
        disabled={loading || !phone.trim()}
        onClick={handleRequestOtp}
      >
        {loading ? t('sendingCode') : t('getCode')}
      </Button>
      <p className="text-xs leading-5 text-slate-500">
        {t('consentPrefix')}{' '}
        <Link href="/privacy-policy" className="font-medium text-[#1e3a8a] hover:underline">
          {t('privacyPolicyLabel')}
        </Link>{' '}
        {t('consentAnd')}{' '}
        <Link href="/user-agreement" className="font-medium text-[#1e3a8a] hover:underline">
          {t('userAgreementLabel')}
        </Link>
        .
      </p>
    </div>
  );
}

