'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLegalConsent } from './auth-legal-consent';
import { usePointOtpLogin } from './use-point-otp-login';

export function CourierLoginForm() {
  const t = useTranslations('Auth.courier');
  const { phone, setPhone, code, setCode, step, loading, error, handleRequestOtp, handleVerify, resetToPhoneStep } =
    usePointOtpLogin({
      phoneInvalid: t('validation.phoneInvalid'),
      codeLength: t('validation.codeLength'),
      requestOtpFailed: t('errors.requestOtpFailed'),
      verifyFailed: t('errors.verifyFailed'),
      codeSentSuccess: t('successCodeSent'),
      loginSuccess: t('successLoggedIn'),
    });

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
            onClick={resetToPhoneStep}
          >
            {t('backToPhone')}
          </Button>
          <Button
            type="button"
            className="h-[60px] flex-1 text-[17px] font-semibold"
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
        className="h-[60px] w-full text-[17px] font-semibold"
        disabled={loading || !phone.trim()}
        onClick={handleRequestOtp}
      >
        {loading ? t('sendingCode') : t('getCode')}
      </Button>
      <AuthLegalConsent
        prefix={t('consentPrefix')}
        andLabel={t('consentAnd')}
        privacyPolicyLabel={t('privacyPolicyLabel')}
        userAgreementLabel={t('userAgreementLabel')}
      />
    </div>
  );
}

