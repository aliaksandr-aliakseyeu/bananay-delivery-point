import { Link } from '@/i18n/routing';

type AuthLegalConsentProps = {
  prefix: string;
  andLabel: string;
  privacyPolicyLabel: string;
  userAgreementLabel: string;
};

export function AuthLegalConsent({
  prefix,
  andLabel,
  privacyPolicyLabel,
  userAgreementLabel,
}: AuthLegalConsentProps) {
  return (
    <p className="text-xs leading-5 text-slate-500">
      {prefix}{' '}
      <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
        {privacyPolicyLabel}
      </Link>{' '}
      {andLabel}{' '}
      <Link href="/user-agreement" className="font-medium text-primary hover:underline">
        {userAgreementLabel}
      </Link>
      .
    </p>
  );
}
