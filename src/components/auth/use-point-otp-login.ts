'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (value.trim().startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.length >= 10 && digits.startsWith('7')) {
    return `+${digits}`;
  }
  if (digits.length >= 10 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }
  return digits ? `+${digits}` : value.trim();
}

type PointOtpTranslations = {
  phoneInvalid: string;
  codeLength: string;
  requestOtpFailed: string;
  verifyFailed: string;
  codeSentSuccess: string;
  loginSuccess: string;
};

export function usePointOtpLogin(t: PointOtpTranslations) {
  const router = useRouter();
  const { verifyOtp, requestOtp } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneE164 = normalizePhone(phone);

  const resetToPhoneStep = () => {
    setStep('phone');
    setError(null);
  };

  const handleRequestOtp = async () => {
    if (!phoneE164 || phoneE164.length < 10) {
      setError(t.phoneInvalid);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await requestOtp(phoneE164);
      setStep('code');
      setCode('');
      toast.success(t.codeSentSuccess);
    } catch (e) {
      const message = e instanceof Error ? e.message : t.requestOtpFailed;
      setError(message);
      toast.error(t.requestOtpFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 4) {
      setError(t.codeLength);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyOtp(phoneE164, trimmed);
      toast.success(t.loginSuccess);
      router.replace('/dashboard');
    } catch (e) {
      const message = e instanceof Error ? e.message : t.verifyFailed;
      setError(message);
      toast.error(t.verifyFailed);
    } finally {
      setLoading(false);
    }
  };

  return {
    phone,
    setPhone,
    code,
    setCode,
    step,
    loading,
    error,
    handleRequestOtp,
    handleVerify,
    resetToPhoneStep,
  };
}
